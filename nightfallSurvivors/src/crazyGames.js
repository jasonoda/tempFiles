/**
 * CrazyGames SDK v3 integration.
 * All direct interaction with window.CrazyGames.SDK lives in this file only.
 * Other game code should import and call exports from here.
 */

import { gsap } from 'gsap';
import { Howler } from 'howler';

const LOG_PREFIX = '[CrazyGames]';
const AD_REQUEST_TIMEOUT_MS = 120000;
const SDK_INIT_TIMEOUT_MS = 8000;
const SDK_INIT_MAX_ATTEMPTS = 2;
/** Set true only for local SDK debugging. */
const DEBUG_LOGGING = false;

/** Flip to false to allow the game on any host (dev only — ship with true). */
export const SITELOCK_ENABLED = true;

const ENV_LOCAL = 'local';
const ENV_CRAZYGAMES = 'crazygames';
const ENV_DISABLED = 'disabled';

function log(...args) {
  if (DEBUG_LOGGING) {
    console.log(LOG_PREFIX, ...args);
  }
}

function logWarn(...args) {
  console.warn(LOG_PREFIX, ...args);
}

function logSkip(method, reason) {
  if (DEBUG_LOGGING) {
    log(method, 'skipped:', reason);
  }
}

function logSdkError(method, err) {
  if (err && typeof err === 'object' && err.code) {
    logWarn(method, 'failed:', err.code, err.message || '');
  } else {
    logWarn(method, 'failed:', err);
  }
}

function getSdk() {
  if (typeof window === 'undefined') return null;
  return window.CrazyGames?.SDK ?? null;
}

function isUsableEnvironment(environment) {
  return environment === ENV_LOCAL || environment === ENV_CRAZYGAMES;
}

function readEnvironment(sdk) {
  if (!sdk) return ENV_DISABLED;
  return sdk.environment ?? ENV_DISABLED;
}

function getGameModule(sdk) {
  return sdk?.game ?? null;
}

function getUserModule(sdk) {
  return sdk?.user ?? null;
}

function getDataModule(sdk) {
  return sdk?.data ?? null;
}

function isPromiseLike(value) {
  return !!value && typeof value.then === 'function';
}

const LEGACY_STORAGE_KEYS = ['bgJewels', 'bgStoreUpgrades', 'bgHighScore'];

function isStoredValueEmpty(value) {
  return value == null || String(value).trim() === '';
}

function parsePersistedCount(value) {
  if (isStoredValueEmpty(value)) return 0;
  const parsed = parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function mergeStoreUpgradeJson(existingValue, legacyValue) {
  const merged = {};
  const sources = [existingValue, legacyValue];
  for (let s = 0; s < sources.length; s++) {
    const raw = sources[s];
    if (isStoredValueEmpty(raw)) continue;
    try {
      const parsed = JSON.parse(String(raw));
      for (const id in parsed) {
        if (!Object.prototype.hasOwnProperty.call(parsed, id)) continue;
        const level = Math.max(0, parseInt(parsed[id], 10) || 0);
        merged[id] = Math.max(merged[id] || 0, level);
      }
    } catch (err) {
      // ignore malformed JSON for this source
    }
  }
  return merged;
}

/**
 * True when hostname is a valid CrazyGames domain (e.g. www.crazygames.com,
 * www.crazygames.fr, cubes-2048-io.game-files.crazygames.com).
 */
export function isCrazyGamesDomain() {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const idx = parts.indexOf('crazygames');
  return idx !== -1 && idx >= parts.length - 3;
}

function isLocalDevHost() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function shouldUseLocalStorageOnly() {
  try {
    return !isCrazyGamesDomain();
  } catch (err) {
    return true;
  }
}

function hasLocalSdkOverride() {
  try {
    return new URLSearchParams(window.location.search).get('useLocalSdk') === 'true';
  } catch (err) {
    return false;
  }
}

function logUserSafe(user, label) {
  if (!user) {
    log(label, 'null (not signed in on CrazyGames)');
    return;
  }
  log(label, {
    username: user.username,
    profilePictureUrl: user.profilePictureUrl,
  });
  log(label, 'do not use __dangerousUserId for auth — use getUserToken() server-side');
}

export const CrazyGamesAPI = {
  environment: ENV_DISABLED,
  ready: false,
  initialized: false,
  _runActive: false,
  _settingsListener: null,
  _authListener: null,
  _onAuthChange: null,
  _engine: null,
  _legacyStorageMigrated: false,
  _sitelockPassed: false,
  _browserUxBound: false,
  _dataShadowStore: {},
  _loadingStarted: false,
  _pageUnloadBound: false,
  /** @type {null | { active: boolean, restored: boolean, snapshot: object, musicPaused: boolean, timelinePausedForAd: boolean }} */
  _adAudioSession: null,

  /**
   * Returns true on CrazyGames hosts, localhost, or ?useLocalSdk=true (local dev).
   */
  isSitelockAllowed() {
    if (isLocalDevHost()) return true;
    if (hasLocalSdkOverride()) return true;
    return isCrazyGamesDomain();
  },

  /**
   * Block the game on unauthorized hosts. Call before loading assets / starting the engine.
   * @returns {boolean} true if the game may run
   */
  enforceSitelock() {
    if (!SITELOCK_ENABLED) {
      log('enforceSitelock: skipped (SITELOCK_ENABLED is false)');
      this._sitelockPassed = true;
      return true;
    }

    const hostname = window.location.hostname;
    const allowed = this.isSitelockAllowed();

    log('enforceSitelock:', {
      hostname,
      allowed,
      sitelockEnabled: SITELOCK_ENABLED,
      isCrazyGamesDomain: isCrazyGamesDomain(),
      isLocalDevHost: isLocalDevHost(),
      useLocalSdk: hasLocalSdkOverride(),
    });

    if (allowed) {
      this._sitelockPassed = true;
      return true;
    }

    logWarn('enforceSitelock: blocked — game is not running on an authorized host');
    this.showSitelockBlock();
    return false;
  },

  showSitelockBlock() {
    if (typeof document === 'undefined') return;

    log('showSitelockBlock: rendering block screen');

    document.documentElement.style.background = '#000000';
    document.body.style.background = '#000000';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    const kids = document.body.children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].style.display = 'none';
    }

    if (document.getElementById('crazygames-sitelock')) return;

    const block = document.createElement('div');
    block.id = 'crazygames-sitelock';
    block.textContent = 'Available only on CrazyGames';
    block.style.cssText = [
      'position:fixed',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:#000',
      'color:#fff',
      'font-family:Arial,sans-serif',
      'font-size:18px',
      'text-align:center',
      'padding:24px',
      'box-sizing:border-box',
      'z-index:2147483647',
    ].join(';');

    document.body.appendChild(block);
  },

  /**
   * Prevent default browser UX that breaks embedded games (scroll, keys, context menu, tab hide).
   */
  setupBrowserUX(engine) {
    if (this._browserUxBound) {
      log('setupBrowserUX: already bound');
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      logSkip('setupBrowserUX', 'no window/document');
      return;
    }

    this._browserUxBound = true;
    this._engine = engine || this._engine || null;
    log('setupBrowserUX: registering listeners');

    window.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
        event.preventDefault();
      }
    });

    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.visibilityState) return;
      const hidden = document.visibilityState === 'hidden';
      log('visibilitychange:', document.visibilityState);
      this._handleDocumentVisibility(hidden);
    });

    if (!this._pageUnloadBound) {
      this._pageUnloadBound = true;
      window.addEventListener('pagehide', () => {
        this._handlePageUnload();
      });
    }

    log('setupBrowserUX: complete');
  },

  _handlePageUnload() {
    const scene = this._engine?.scene;
    if (!scene || !this.isRunActive()) {
      return;
    }
    if (typeof scene.abandonActiveRun === 'function') {
      scene.abandonActiveRun();
    }
  },

  _handleDocumentVisibility(hidden) {
    if (this.isAdAudioActive()) {
      log('visibilitychange during ad — skipping document pause handler');
      return;
    }
    const scene = this._engine?.scene;
    if (scene?.handleWebDocumentPause) {
      scene.handleWebDocumentPause(hidden);
      return;
    }
    log('handleWebDocumentPause: no scene handler', { hidden });
  },

  isAdAudioActive() {
    return !!(
      this._adAudioSession &&
      this._adAudioSession.active &&
      !this._adAudioSession.restored
    );
  },

  _captureAudioSnapshot(engine) {
    const scene = engine?.scene;
    const musicLoop = engine?.s?.musicLoop;
    const muteState = engine?.muteState === true;
    const musicLoopVolume = scene?.musicLoopVolume ?? 0;
    const musicPlaying = !!(
      musicLoop &&
      typeof musicLoop.playing === 'function' &&
      musicLoop.playing()
    );

    return {
      muteState,
      musicLoopVolume,
      musicPlaying,
      musicShouldResume: !!(musicPlaying && musicLoopVolume > 0 && !muteState),
      gsapTimelinePaused: gsap.globalTimeline.paused(),
    };
  },

  pauseForAd(engine) {
    if (this.isAdAudioActive()) {
      log('pauseForAd: already active');
      return;
    }

    log('Ad started');

    const snapshot = this._captureAudioSnapshot(engine);
    const musicLoop = engine?.s?.musicLoop;
    const musicPaused = !!(
      musicLoop &&
      typeof musicLoop.playing === 'function' &&
      musicLoop.playing()
    );

    if (musicPaused && typeof musicLoop.pause === 'function') {
      musicLoop.pause();
    }

    Howler.mute(true);

    let timelinePausedForAd = false;
    if (!snapshot.gsapTimelinePaused) {
      gsap.globalTimeline.pause();
      timelinePausedForAd = true;
    }

    this._adAudioSession = {
      active: true,
      restored: false,
      snapshot,
      musicPaused,
      timelinePausedForAd,
    };

    log('Audio muted for ad');
  },

  resumeAfterAd(engine, reason) {
    const session = this._adAudioSession;
    if (!session || session.restored) {
      log('resumeAfterAd: skipped (no active session or already restored)', reason || '');
      return;
    }

    session.restored = true;
    session.active = false;

    const snap = session.snapshot;

    Howler.mute(false);

    if (engine?.setMuteStateRuntime) {
      engine.setMuteStateRuntime(snap.muteState);
    } else if (engine) {
      engine.muteState = snap.muteState;
      engine.syncMuteButtonIcon?.();
    }

    const musicLoop = engine?.s?.musicLoop;
    if (musicLoop && session.musicPaused && snap.musicShouldResume) {
      if (typeof musicLoop.play === 'function') {
        musicLoop.play();
      }
      if (typeof musicLoop.volume === 'function') {
        musicLoop.volume(snap.musicLoopVolume);
      }
      if (engine?.scene) {
        engine.scene.musicLoopVolume = snap.musicLoopVolume;
      }
    }

    if (session.timelinePausedForAd && !snap.gsapTimelinePaused) {
      gsap.globalTimeline.resume();
    }

    this._adAudioSession = null;
    log('Audio restored', reason || '');
  },

  /**
   * Initialize SDK v3. Call once before the game starts (e.g. on the loading screen).
   */
  async init() {
    log('init: starting');

    const sdk = getSdk();
    if (!sdk) {
      logWarn('init: window.CrazyGames.SDK not found — is crazygames-sdk-v3.js loaded in index.html?');
      this.environment = ENV_DISABLED;
      this.ready = true;
      this.initialized = false;
      return this.environment;
    }

    if (typeof sdk.init !== 'function') {
      logWarn('init: SDK.init is not a function');
      this.environment = ENV_DISABLED;
      this.ready = true;
      this.initialized = false;
      return this.environment;
    }

    let lastError = null;
    for (let attempt = 1; attempt <= SDK_INIT_MAX_ATTEMPTS; attempt++) {
      try {
        log('init: awaiting SDK.init()...', { attempt });
        await Promise.race([
          sdk.init(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SDK init timed out')), SDK_INIT_TIMEOUT_MS);
          }),
        ]);
        this.initialized = true;
        this.environment = readEnvironment(sdk);
        log('init: complete', {
          environment: this.environment,
          available: this.isAvailable(),
        });
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        logSdkError('init', err);
        if (attempt < SDK_INIT_MAX_ATTEMPTS) {
          logWarn('init: retrying SDK.init()...');
        }
      }
    }

    if (lastError) {
      this.environment = ENV_DISABLED;
      this.initialized = false;
    }

    this.ready = true;
    if (!this.initialized) {
      logWarn('init: SDK unavailable — progress will use local fallback until next load');
    }
    return this.environment;
  },

  /**
   * Register engine reference and wire game.settings listener.
   */
  setupGameModule(engine) {
    log('setupGameModule: called');
    this._engine = engine || null;

    const game = getGameModule(this.getSdk() ?? getSdk());
    if (!game) {
      logSkip('setupGameModule', this._skipReason());
      return;
    }

    const settings = game.settings;
    if (settings) {
      log('setupGameModule: initial settings', settings);
      this.applyGameSettings(settings);
    } else {
      log('setupGameModule: no settings object yet');
    }

    if (this._settingsListener && game.removeSettingsChangeListener) {
      game.removeSettingsChangeListener(this._settingsListener);
    }

    this._settingsListener = (newSettings) => {
      log('settingsChangeListener: fired', newSettings);
      this.applyGameSettings(newSettings);
    };

    if (game.addSettingsChangeListener) {
      game.addSettingsChangeListener(this._settingsListener);
      log('setupGameModule: settings listener registered');
    } else {
      logSkip('setupGameModule', 'addSettingsChangeListener not available');
    }
  },

  getSettings() {
    const game = getGameModule(this.getSdk());
    const settings = game?.settings ?? null;
    log('getSettings:', settings);
    return settings;
  },

  applyGameSettings(settings) {
    if (!settings) return;

    if (settings.disableChat === true) {
      log('applyGameSettings: disableChat=true (no in-game chat in this build)');
    }

    if (this.environment !== ENV_CRAZYGAMES) {
      log('applyGameSettings: skip muteAudio (environment:', this.environment, ')');
      return;
    }

    if (typeof settings.muteAudio === 'boolean' && this._engine?.toggleMute) {
      log('applyGameSettings: muteAudio=', settings.muteAudio);
      this._engine.toggleMute(settings.muteAudio);
    }
  },

  isAvailable() {
    return this.initialized && isUsableEnvironment(this.environment);
  },

  /**
   * Real video ads only run on CrazyGames production hosts.
   * Local/disabled environments show SDK placeholder overlays if requestAd is called.
   */
  canRequestHostedAds() {
    return (
      this.initialized &&
      this.environment === ENV_CRAZYGAMES &&
      !!getSdk()?.ad?.requestAd
    );
  },

  getEnvironment() {
    const sdk = getSdk();
    if (sdk?.environment) {
      this.environment = sdk.environment;
    }
    log('getEnvironment:', this.environment);
    return this.environment;
  },

  getSdk() {
    if (!this.initialized) return null;
    if (!isUsableEnvironment(this.environment)) return null;
    return getSdk();
  },

  loadingStart() {
    log('loadingStart: called');
    const sdk = getSdk();
    if (!this.initialized) {
      logSkip('loadingStart', 'SDK not initialized');
      return;
    }
    if (!sdk?.game?.loadingStart) {
      logSkip('loadingStart', 'game.loadingStart not available');
      return;
    }
    try {
      sdk.game.loadingStart();
      this._loadingStarted = true;
      log('loadingStart: reported to SDK');
    } catch (err) {
      logSdkError('loadingStart', err);
    }
  },

  loadingStop() {
    log('loadingStop: called');
    if (!this._loadingStarted) {
      logSkip('loadingStop', 'loadingStart was not reported');
      return;
    }
    const sdk = getSdk();
    if (!this.initialized) {
      logSkip('loadingStop', 'SDK not initialized');
      return;
    }
    if (!sdk?.game?.loadingStop) {
      logSkip('loadingStop', 'game.loadingStop not available');
      return;
    }
    try {
      sdk.game.loadingStop();
      this._loadingStarted = false;
      log('loadingStop: reported to SDK');
    } catch (err) {
      logSdkError('loadingStop', err);
    }
  },

  /**
   * Start a survivor run (once). Call when combat begins after intro, not on resume.
   */
  startRun() {
    if (this._runActive) {
      log('startRun: ignored — run already active');
      return;
    }
    this._runActive = true;
    log('startRun: beginning run session');
    this.gameplayStart();
  },

  /**
   * End a survivor run (once). Call when the run outcome is decided (death, victory, abandon).
   * @param {string} reason - e.g. 'death', 'victory', 'abandon'
   */
  endRun(reason) {
    if (!this._runActive) {
      log('endRun: ignored — no active run', reason || '');
      return;
    }
    this._runActive = false;
    log('endRun: ending run session', reason || 'unknown');
    this.gameplayStop();
  },

  isRunActive() {
    return this._runActive;
  },

  gameplayStart() {
    log('gameplayStart: called');
    const sdk = this.getSdk();
    if (!sdk?.game?.gameplayStart) {
      logSkip('gameplayStart', this._skipReason());
      return;
    }
    try {
      sdk.game.gameplayStart();
      log('gameplayStart: reported to SDK');
    } catch (err) {
      logSdkError('gameplayStart', err);
    }
  },

  gameplayStop() {
    log('gameplayStop: called');
    const sdk = this.getSdk();
    if (!sdk?.game?.gameplayStop) {
      logSkip('gameplayStop', this._skipReason());
      return;
    }
    try {
      sdk.game.gameplayStop();
      log('gameplayStop: reported to SDK');
    } catch (err) {
      logSdkError('gameplayStop', err);
    }
  },

  happyTime() {
    log('happyTime: called');
    const sdk = this.getSdk();
    if (!sdk?.game?.happytime) {
      logSkip('happyTime', this._skipReason());
      return;
    }
    try {
      sdk.game.happytime();
      log('happyTime: reported to SDK');
    } catch (err) {
      logSdkError('happyTime', err);
    }
  },

  setGameContext(context) {
    log('setGameContext: called', context);
    const sdk = this.getSdk();
    if (!sdk?.game?.setGameContext) {
      logSkip('setGameContext', this._skipReason());
      return;
    }
    try {
      sdk.game.setGameContext(context);
      log('setGameContext: reported to SDK');
    } catch (err) {
      logSdkError('setGameContext', err);
    }
  },

  clearGameContext() {
    log('clearGameContext: called');
    const sdk = this.getSdk();
    if (!sdk?.game?.clearGameContext) {
      logSkip('clearGameContext', this._skipReason());
      return;
    }
    try {
      sdk.game.clearGameContext();
      log('clearGameContext: reported to SDK');
    } catch (err) {
      logSdkError('clearGameContext', err);
    }
  },

  /**
   * Register user module listeners and optionally fetch the signed-in user.
   */
  setupUserModule(options = {}) {
    log('setupUserModule: called', options);
    const user = getUserModule(this.getSdk());
    if (!user) {
      logSkip('setupUserModule', this._skipReason());
      return;
    }

    const available = user.isUserAccountAvailable === true;
    log('setupUserModule: isUserAccountAvailable', available);

    if (user.systemInfo) {
      log('setupUserModule: systemInfo', user.systemInfo);
    } else {
      log('setupUserModule: systemInfo not available');
    }

    if (this._authListener && user.removeAuthListener) {
      user.removeAuthListener(this._authListener);
    }

    this._authListener = (signedInUser) => {
      log('authListener: user signed in');
      logUserSafe(signedInUser, 'authListener');
      if (this._onAuthChange) {
        this._onAuthChange(signedInUser);
      }
    };

    if (user.addAuthListener) {
      user.addAuthListener(this._authListener);
      log('setupUserModule: auth listener registered');
    } else {
      logSkip('setupUserModule', 'addAuthListener not available');
    }

    if (options.fetchUserOnSetup && available) {
      this.getUser();
    }
  },

  setAuthChangeHandler(handler) {
    this._onAuthChange = typeof handler === 'function' ? handler : null;
    log('setAuthChangeHandler:', this._onAuthChange ? 'registered' : 'cleared');
  },

  isUserAccountAvailable() {
    const user = getUserModule(this.getSdk());
    if (!user) {
      log('isUserAccountAvailable: false (no user module)');
      return false;
    }
    const available = user.isUserAccountAvailable === true;
    log('isUserAccountAvailable:', available);
    return available;
  },

  getSystemInfo() {
    log('getSystemInfo: called');
    const user = getUserModule(this.getSdk());
    if (!user) {
      logSkip('getSystemInfo', this._skipReason());
      return null;
    }
    const systemInfo = user.systemInfo ?? null;
    log('getSystemInfo:', systemInfo);
    return systemInfo;
  },

  async getUser() {
    log('getUser: called');
    if (!this.isUserAccountAvailable()) {
      logSkip('getUser', 'user account system not available');
      return null;
    }
    const user = getUserModule(this.getSdk());
    if (!user?.getUser) {
      logSkip('getUser', this._skipReason());
      return null;
    }
    try {
      const result = await user.getUser();
      logUserSafe(result, 'getUser result');
      return result;
    } catch (err) {
      logSdkError('getUser', err);
      return null;
    }
  },

  async getUserToken() {
    log('getUserToken: called');
    if (!this.isUserAccountAvailable()) {
      logSkip('getUserToken', 'user account system not available');
      return null;
    }
    const user = getUserModule(this.getSdk());
    if (!user?.getUserToken) {
      logSkip('getUserToken', this._skipReason());
      return null;
    }
    try {
      const token = await user.getUserToken();
      log('getUserToken: received', {
        length: token ? String(token).length : 0,
      });
      log('getUserToken: send to your server for RS256 verification — never decode on client');
      return token;
    } catch (err) {
      logSdkError('getUserToken', err);
      return null;
    }
  },

  async listFriends(page = 1, size = 10) {
    log('listFriends: called', { page, size });
    if (!this.isUserAccountAvailable()) {
      logSkip('listFriends', 'user account system not available');
      return null;
    }
    const user = getUserModule(this.getSdk());
    if (!user?.listFriends) {
      logSkip('listFriends', this._skipReason());
      return null;
    }
    try {
      const result = await user.listFriends({ page, size });
      log('listFriends: success', {
        page: result?.page,
        size: result?.size,
        total: result?.total,
        hasMore: result?.hasMore,
        friendCount: result?.friends?.length ?? 0,
      });
      return result;
    } catch (err) {
      logSdkError('listFriends', err);
      return null;
    }
  },

  async showAuthPrompt() {
    log('showAuthPrompt: called');
    if (!this.isUserAccountAvailable()) {
      logSkip('showAuthPrompt', 'user account system not available');
      return null;
    }
    const user = getUserModule(this.getSdk());
    if (!user?.showAuthPrompt) {
      logSkip('showAuthPrompt', this._skipReason());
      return null;
    }
    try {
      const result = await user.showAuthPrompt();
      logUserSafe(result, 'showAuthPrompt result');
      return result;
    } catch (err) {
      logSdkError('showAuthPrompt', err);
      return null;
    }
  },

  async showAccountLinkPrompt() {
    log('showAccountLinkPrompt: called');
    if (!this.isUserAccountAvailable()) {
      logSkip('showAccountLinkPrompt', 'user account system not available');
      return null;
    }
    const user = getUserModule(this.getSdk());
    if (!user?.showAccountLinkPrompt) {
      logSkip('showAccountLinkPrompt', this._skipReason());
      return null;
    }
    try {
      const response = await user.showAccountLinkPrompt();
      log('showAccountLinkPrompt: result', response);
      return response;
    } catch (err) {
      logSdkError('showAccountLinkPrompt', err);
      return null;
    }
  },

  addAuthListener(listener) {
    log('addAuthListener: called');
    const user = getUserModule(this.getSdk());
    if (!user?.addAuthListener) {
      logSkip('addAuthListener', this._skipReason());
      return;
    }
    if (typeof listener !== 'function') {
      logWarn('addAuthListener: listener must be a function');
      return;
    }
    user.addAuthListener(listener);
    log('addAuthListener: registered');
  },

  removeAuthListener(listener) {
    log('removeAuthListener: called');
    const user = getUserModule(this.getSdk());
    if (!user?.removeAuthListener) {
      logSkip('removeAuthListener', this._skipReason());
      return;
    }
    if (typeof listener !== 'function') {
      logWarn('removeAuthListener: listener must be a function');
      return;
    }
    user.removeAuthListener(listener);
    log('removeAuthListener: removed');
  },

  /**
   * Midgame ad after tally Next, before progression store. Always resolves.
   */
  async requestMidgameAdBeforeProgression(engine) {
    log('Ad requested');

    if (!this.canRequestHostedAds()) {
      logSkip(
        'requestMidgameAdBeforeProgression',
        `environment is "${this.environment}" — no hosted ad (skip SDK placeholder)`
      );
      return;
    }

    const sdk = getSdk();

    return new Promise((resolve) => {
      let settled = false;

      const finish = (reason) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);

        if (reason === 'adFinished') {
          log('Ad finished');
        } else if (reason === 'adError' || reason === 'throw') {
          log('Ad error');
        } else if (reason === 'timeout') {
          log('Ad timeout');
        }

        this.resumeAfterAd(engine, reason);
        log('requestMidgameAdBeforeProgression: finished', reason);
        resolve();
      };

      const timeoutId = setTimeout(() => {
        finish('timeout');
      }, AD_REQUEST_TIMEOUT_MS);

      const callbacks = {
        adStarted: () => {
          this.pauseForAd(engine);
        },
        adFinished: () => {
          finish('adFinished');
        },
        adError: (error, errorData) => {
          logSdkError('requestMidgameAdBeforeProgression', errorData || error);
          finish('adError');
        },
      };

      try {
        sdk.ad.requestAd('midgame', callbacks);
      } catch (err) {
        logSdkError('requestMidgameAdBeforeProgression', err);
        finish('throw');
      }
    });
  },

  async requestMidgameAd(engine) {
    return this.requestMidgameAdBeforeProgression(engine);
  },

  usesDataModule() {
    return this.initialized && !!getDataModule(getSdk());
  },

  /**
   * Migrate existing localStorage keys into the SDK data module (for published games).
   */
  async setupDataModule() {
    log('setupDataModule: called');
    if (!this.usesDataModule()) {
      logSkip('setupDataModule', this._skipReason());
      return;
    }
    await this.migrateLegacyLocalStorage(LEGACY_STORAGE_KEYS);
    await this._primeDataShadowStore(LEGACY_STORAGE_KEYS);
    log('setupDataModule: ready');
  },

  async _primeDataShadowStore(keys = LEGACY_STORAGE_KEYS) {
    const data = getDataModule(getSdk());
    if (!data?.getItem) return;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        const raw = data.getItem(key);
        const value = isPromiseLike(raw) ? await raw : raw;
        if (!isStoredValueEmpty(value)) {
          const str = String(value);
          this._dataShadowStore[key] = str;
          this._legacySetItem(key, str);
        }
      } catch (err) {
        logSdkError('_primeDataShadowStore', err);
      }
    }
  },

  async migrateLegacyLocalStorage(keys = LEGACY_STORAGE_KEYS) {
    log('migrateLegacyLocalStorage: called', keys);
    if (!this.usesDataModule()) {
      logSkip('migrateLegacyLocalStorage', 'data module not available');
      return;
    }
    if (this._legacyStorageMigrated) {
      log('migrateLegacyLocalStorage: already done this session');
      return;
    }

    const data = getDataModule(getSdk());
    let copied = 0;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        const existingRaw = data.getItem(key);
        const existing = isPromiseLike(existingRaw) ? await existingRaw : existingRaw;
        const legacy = this._legacyGetItem(key);

        if (key === 'bgJewels' || key === 'bgHighScore') {
          const merged = Math.max(
            parsePersistedCount(existing),
            parsePersistedCount(legacy)
          );
          if (
            merged > 0 ||
            !isStoredValueEmpty(existing) ||
            !isStoredValueEmpty(legacy)
          ) {
            const next = String(merged);
            if (next !== String(existing ?? '').trim()) {
              await data.setItem(key, next);
              this._dataShadowStore[key] = next;
              this._legacySetItem(key, next);
              copied += 1;
              log('migrateLegacyLocalStorage: merged count', key, next);
            } else {
              log('migrateLegacyLocalStorage: up to date', key);
            }
          }
          continue;
        }

        if (key === 'bgStoreUpgrades') {
          const merged = mergeStoreUpgradeJson(existing, legacy);
          if (Object.keys(merged).length > 0) {
            const next = JSON.stringify(merged);
            if (next !== String(existing ?? '')) {
              await data.setItem(key, next);
              this._dataShadowStore[key] = next;
              this._legacySetItem(key, next);
              copied += 1;
              log('migrateLegacyLocalStorage: merged store', key);
            } else {
              log('migrateLegacyLocalStorage: up to date', key);
            }
          }
          continue;
        }

        if (!isStoredValueEmpty(existing)) {
          log('migrateLegacyLocalStorage: skip', key, '(already in data module)');
          continue;
        }
        if (isStoredValueEmpty(legacy)) {
          log('migrateLegacyLocalStorage: skip', key, '(no legacy localStorage value)');
          continue;
        }
        await data.setItem(key, legacy);
        this._dataShadowStore[key] = String(legacy);
        this._legacySetItem(key, legacy);
        copied += 1;
        log('migrateLegacyLocalStorage: copied', key, `(${legacy.length} chars)`);
      } catch (err) {
        logSdkError('migrateLegacyLocalStorage', err);
      }
    }

    this._legacyStorageMigrated = true;
    log('migrateLegacyLocalStorage: finished, copied', copied, 'key(s)');
  },

  getItem(key) {
    if (shouldUseLocalStorageOnly()) {
      return this._legacyGetItem(key);
    }
    if (!isStoredValueEmpty(this._dataShadowStore[key])) {
      return this._dataShadowStore[key];
    }
    const data = getDataModule(getSdk());
    if (data?.getItem) {
      try {
        const value = data.getItem(key);
        if (isPromiseLike(value)) {
          value
            .then((resolved) => {
              if (!isStoredValueEmpty(resolved)) {
                const str = String(resolved);
                this._dataShadowStore[key] = str;
                this._legacySetItem(key, str);
              }
            })
            .catch((err) => {
              logSdkError('getItem async', err);
            });
          const legacy = this._legacyGetItem(key);
          if (!isStoredValueEmpty(legacy)) {
            this._dataShadowStore[key] = String(legacy);
          }
          return legacy;
        }
        if (!isStoredValueEmpty(value)) {
          this._dataShadowStore[key] = String(value);
          log('getItem:', key, `(${String(value).length} chars)`);
          return value;
        }
        log('getItem:', key, '(empty in data module, trying legacy)');
      } catch (err) {
        logSdkError('getItem', err);
      }
    }
    return this._legacyGetItem(key);
  },

  setItem(key, value) {
    const str = value == null ? '' : String(value);
    log('setItem:', key, `(${str.length} chars)`);
    this._dataShadowStore[key] = str;
    if (shouldUseLocalStorageOnly()) {
      return this._legacySetItem(key, str);
    }
    const data = getDataModule(getSdk());
    if (data?.setItem) {
      try {
        const result = data.setItem(key, str);
        if (isPromiseLike(result)) {
          result.catch((err) => {
            logSdkError('setItem async', err);
          });
        }
        this._legacySetItem(key, str);
        log('setItem: saved via data module');
        return true;
      } catch (err) {
        logSdkError('setItem', err);
        return false;
      }
    }
    return this._legacySetItem(key, str);
  },

  removeItem(key) {
    log('removeItem:', key);
    const data = getDataModule(getSdk());
    if (data?.removeItem) {
      try {
        data.removeItem(key);
        log('removeItem: removed via data module');
        return true;
      } catch (err) {
        logSdkError('removeItem', err);
        return false;
      }
    }
    return this._legacyRemoveItem(key);
  },

  clear() {
    log('clear: called');
    const data = getDataModule(getSdk());
    if (data?.clear) {
      try {
        data.clear();
        log('clear: data module cleared');
        return true;
      } catch (err) {
        logSdkError('clear', err);
        return false;
      }
    }
    return this._legacyClear();
  },

  _legacyGetItem(key) {
    try {
      const value = localStorage.getItem(key);
      log('getItem (legacy localStorage):', key, value == null ? '(null)' : `(${value.length} chars)`);
      return value;
    } catch (err) {
      logWarn('getItem legacy failed', key, err);
      return null;
    }
  },

  _legacySetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      log('setItem (legacy localStorage):', key);
      return true;
    } catch (err) {
      logWarn('setItem legacy failed', key, err);
      return false;
    }
  },

  _legacyRemoveItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      logWarn('removeItem legacy failed', key, err);
      return false;
    }
  },

  _legacyClear() {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      logWarn('clear legacy failed', err);
      return false;
    }
  },

  async requestRewardedAd() {
    log('requestRewardedAd: called');
    if (!this.canRequestHostedAds()) {
      logSkip(
        'requestRewardedAd',
        `environment is "${this.environment}" — no hosted ad (skip SDK placeholder)`
      );
      return false;
    }
    const sdk = this.getSdk();
    try {
      await sdk.ad.requestAd('rewarded');
      log('requestRewardedAd: finished');
      return true;
    } catch (err) {
      logSdkError('requestRewardedAd', err);
      return false;
    }
  },

  _skipReason() {
    if (!this.initialized) return 'SDK not initialized';
    if (!isUsableEnvironment(this.environment)) {
      return `environment is "${this.environment}" (use localhost, crazygames.com, or ?useLocalSdk=true)`;
    }
    return 'SDK method not available';
  },
};
