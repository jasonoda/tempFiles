import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { LocalState } from './localState.js';
import { CrazyGamesAPI } from './crazyGames.js';

export class Scene {

  setUp(e) {

    this.e=e;

    this.action="set";
    this.count=0;
    this.countFPS=false;
    this.sceneBuilt = false;
    this.splashRevealReady = false;

    // Setup button listeners
    this.setupButtonListeners();
    this.setupSplashAnimation();
    this.setupStartButtonAnimation();
    this.gameStartInitialized = false;
    
    // Instructions overlay state
    this.instructionsVisible = false;
    this.progressVisible = false;
    this._lastCrazyGamesLevelContext = null;
    this._crazyGamesContextCleared = false;

    const minViewport = Math.min(window.innerWidth, window.innerHeight);
    const isPhoneViewport = this.e.mobile === true && minViewport < 600;
    this.zoomScale = isPhoneViewport ? 1 : 2;


    //--------------------------------------------------------------------------------------------------

    // physics

    this.physEngine = Matter.Engine.create();
    this.physRunner = Matter.Runner.create();
    this.physRender = Matter.Render.create({
      options:{
          hasBounds: true,
          wireframes: false
      },
      element: document.body,
      engine: this.physEngine
    });


    // Matter.Runner.run(this.physRunner, this.physEngine);

    // Matter.Engine.run(this.physEngine);
    // Matter.Render.run(this.physRender);

    this.physEngine.world.gravity.y = 0;

    // Pooled enemy bodies: collisions only while active; ready stack does not enter the solver
    this.enemyPhysCollisionActive = { group: 0, category: 0x0001, mask: 0xffffffff };
    this.enemyPhysCollisionNone = { group: 0, category: 0x0001, mask: 0 };
    this._bulletPoolScan = 0;

    this.physRender.canvas.id = "matterCanvas"
    this.physRender.canvas.style.zIndex = "1";
    this.physRender.canvas.style.opacity = "0";
    this.physRender.canvas.style.position = "fixed";
    this.physRender.canvas.style.pointerEvents = "none";
    this.physRender.canvas.style.display = "none";
    this.physRender.canvas.style.visibility = "hidden";

    this.showPhysicsContainers = false;
    this.physicsDebugOverlay = null;

    this.zLevs = [];
    this.zLevSkip = 0;
    this.iconCount = 0;

    this.enemiesAttacking=0
    this.totalShotPowerUps = 0;
    this.winBonus = 0;

    this.t = new Object();
    this.t.deathOffset = 0;
    this.t.tally1 = 0;
    this.t.tally2 = 0;
    this.t.tally3 = 0;
    this.t.topOffset = -300;
    this.t.botOffset = 300;

    this.killTotal=0;
    this.coinTotal=0
    this.tCount=0;
    this.enDeathCount=0;
    this.sliceTime=0;

    this.lastDir = "";

    this.snowFlakes = [];
    this.freezeEnemies = 0;
    this.saveLevel = 1;
    this.showLevCount = 0;

    this.hasWon = false;
    this.wonCount = 0;
    this.gameDurationSeconds = 600;
    this.gameMidpointSeconds = 300;
    this.levelTierSeconds = 20;
    this.lateGameDifficultyStart = 420;
    this.lateGameEaseStart = 450;
    this.progressFromGameOver = false;
    this.runJewels = 0;
    this.pickupSpawnCount = 0;
    this.coinShotLevel = 0;
    this.stealthLevel = 0;
    this.stealthActive = false;
    this.stealthTimer = 0;
    this.stealthCooldown = 0;
    this.stealthTarget = { x: 0, y: 0 };
    this.stealthSpeedBefore = 60;
    this.bulletShieldLevel = 0;
    this.bulletPreventionCharges = 0;
    this.jewelKillLevel = 0;
    this.jewelSpawnBlockTimer = 0;

    this.maxLife = 4;

    this.disableAttacks=false;
    this.coinsFoundThisLevel = 0;
    this.enemiesKilledThisLevel = 0;

    this.weaponWaitCount=0;

    // Set up instructions button event listeners
    this.setupInstructionsButtons();
    this.updateInstructionsImage();
    this.setupGameOverNextButton();
    this.setupProgressWindow();

    // Set up HTML hearts references
    this.initHtmlHearts();

  }

  setupSplashAnimation() {
    const frame1 = document.querySelector('.splash-frame-1');
    const frame2 = document.querySelector('.splash-frame-2');
    if (!frame1 || !frame2) return;

    this.stopSplashAnimation();

    frame1.style.opacity = '1';
    frame2.style.opacity = '0';

    const halfCycle = 1500;

    this.splashFrameAnims = [
      frame1.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: halfCycle,
          easing: 'ease-in-out',
          iterations: Infinity,
          direction: 'alternate',
        }
      ),
      frame2.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: halfCycle,
          easing: 'ease-in-out',
          iterations: Infinity,
          direction: 'alternate',
        }
      ),
    ];
  }

  stopSplashAnimation() {
    if (!this.splashFrameAnims) return;
    this.splashFrameAnims.forEach((anim) => anim.cancel());
    this.splashFrameAnims = null;
  }

  setupStartButtonAnimation() {
    const frame1 = document.querySelector('.start-but-frame-1');
    const frame2 = document.querySelector('.start-but-frame-2');
    if (!frame1 || !frame2) return;

    this.stopStartButtonAnimation();

    frame1.style.opacity = '1';
    frame2.style.opacity = '0';

    const cycle = 1000;

    this.startButtonAnims = [
      frame1.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.499 },
          { opacity: 0, offset: 0.5 },
          { opacity: 0, offset: 0.999 },
          { opacity: 1, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
      frame2.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: 0.499 },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, offset: 0.999 },
          { opacity: 0, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
    ];
  }

  stopStartButtonAnimation() {
    if (!this.startButtonAnims) return;
    this.startButtonAnims.forEach((anim) => anim.cancel());
    this.startButtonAnims = null;
  }

  stopStartMenuAnimations() {
    this.stopSplashAnimation();
    this.stopStartButtonAnimation();
  }

  fadeOutStartScreen() {
    this.stopStartMenuAnimations();

    if (this.e && this.e.s) {
      this.e.s.p('intro');
    }

    const playButton = document.getElementById('playButton');
    const instructionsButton = document.getElementById('instructionsButton');
    if (playButton) {
      playButton.disabled = true;
      playButton.style.pointerEvents = 'none';
    }
    if (instructionsButton) {
      instructionsButton.disabled = true;
      instructionsButton.style.pointerEvents = 'none';
    }

    const fadeEls = [
      document.getElementById('startMenu'),
      document.getElementById('highScoreDisplay'),
      document.getElementById('upgradeCounter'),
    ].filter((el) => el);

    if (fadeEls.length > 0) {
      gsap.set(fadeEls, { opacity: 1 });
      gsap.to(fadeEls, {
        opacity: 0,
        duration: 1,
        ease: 'power1.out',
        onComplete: () => {
          fadeEls.forEach((el) => {
            el.style.display = 'none';
          });
        },
      });
    }

    const backdrop = document.getElementById('startMenuBackdrop');
    if (backdrop) {
      backdrop.style.display = 'block';
      gsap.killTweensOf(backdrop);
      gsap.set(backdrop, { opacity: 1 });
      gsap.to(backdrop, {
        opacity: 0.4,
        duration: 2,
        ease: 'power1.out',
      });
    }

    this.fadeIntroVignetteIn();
  }

  fadeOutIntroBackdrop() {
    const backdrop = document.getElementById('startMenuBackdrop');
    if (!backdrop) return;
    backdrop.style.display = 'block';
    gsap.killTweensOf(backdrop);
    gsap.to(backdrop, {
      opacity: 0,
      duration: 3,
      ease: 'power1.out',
      onComplete: () => {
        backdrop.style.display = 'none';
      },
    });
  }

  fadeIntroVignetteIn() {
    const vig = this.e && this.e.ui ? this.e.ui.vig : null;
    if (!vig) return;
    if (this.e.ui.removeStrayVignettes) {
      this.e.ui.removeStrayVignettes(vig);
    }
    vig.width = window.innerWidth;
    vig.height = window.innerHeight;
    vig.zIndex = 50000;
    if (!vig.parent) {
      this.e.ui.app.stage.addChild(vig);
    }
    gsap.killTweensOf(vig);
    gsap.set(vig, { alpha: 0 });
    gsap.to(vig, {
      alpha: 0.8,
      duration: 2,
      ease: 'power1.out',
    });
  }

  fadeIntroVignetteToGameplay() {
    const vig = this.e && this.e.ui ? this.e.ui.vig : null;
    if (!vig || !vig.parent) return;
    gsap.killTweensOf(vig);
    gsap.to(vig, {
      alpha: this.e && this.e.mobile === true ? 0.2 : 0.7,
      duration: 2,
      ease: 'power1.out',
    });
  }

  getViewportSize() {
    if (this.e && typeof this.e.getViewportSize === 'function') {
      return this.e.getViewportSize();
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  snapCameraToPlayer() {
    if (!this.mainCont || !this.playerCont) return;
    const { width, height } = this.getViewportSize();
    if (width < 1 || height < 1) return;
    this.mainCont.position.x = Math.round(width / 2) + (this.playerCont.position.x * -this.zoomScale);
    this.mainCont.position.y = Math.round(height / 2) + (this.playerCont.position.y * -this.zoomScale) - (this.playerInnerCont ? this.playerInnerCont.position.y : 0);
  }

  syncMainMaskSize() {
    if (!this.mainMask) return;
    const z = this.zoomScale || 1;
    const pad = 140;
    const { width, height } = this.getViewportSize();
    this.mainMask.width = Math.ceil(Math.max(1, width) / z) + pad;
    this.mainMask.height = Math.ceil(Math.max(1, height) / z) + pad;
  }

  ensurePixiDisplayHealthy() {
    if (this.physRender?.canvas) {
      const matterCanvas = this.physRender.canvas;
      matterCanvas.style.display = 'none';
      matterCanvas.style.visibility = 'hidden';
      matterCanvas.style.opacity = '0';
      matterCanvas.style.pointerEvents = 'none';
    }

    const canvas = this.e?.ui?.uiCanvas;
    if (canvas) {
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';
    }

    const faderBlack = this.e?.ui?.faderBlack;
    if (
      faderBlack &&
      faderBlack.alpha > 0.05 &&
      (this.action === 'game' ||
        this.action === 'cover' ||
        this.action === 'set' ||
        this.action === 'game start')
    ) {
      gsap.killTweensOf(faderBlack);
      faderBlack.alpha = 0;
    }

    if (this.action === 'game' || this.action === 'cover') {
      const loadingBack = document.getElementById('loadingBack');
      if (loadingBack) {
        const style = window.getComputedStyle(loadingBack);
        if (style.display !== 'none' && parseFloat(style.opacity) > 0.05) {
          this.dismissHtmlLoadingChrome();
        }
      }
    }
  }

  setupIntroVignette() {
    const vig = this.e && this.e.ui ? this.e.ui.vig : null;
    if (!vig) return;
    vig.width = window.innerWidth;
    vig.height = window.innerHeight;
    vig.zIndex = 50000;
    if (!vig.parent) {
      this.fadeIntroVignetteIn();
    }
  }

  prepareIntroText() {
    this.introTextContainer = document.getElementById('introTextContainer');
    this.introLine1 = document.getElementById('introLine1');
    this.introLine2 = document.getElementById('introLine2');
    this.introLine1Started = false;
    this.introLine2Started = false;
    this.introLineReady = false;
    this.introCount = 0;
    this.introLineLinger = 3.5;

    this.setupIntroVignette();

    if (this.introLine1) {
      this.introLine1.style.display = 'none';
      this.resetIntroWords(this.introLine1);
    }
    if (this.introLine2) {
      this.introLine2.style.display = 'none';
      this.resetIntroWords(this.introLine2);
    }
    if (this.introTextContainer) {
      this.introTextContainer.style.display = 'block';
    }
    this.updateIntroTextPosition();
  }

  resetIntroWords(lineEl) {
    if (!lineEl) return;
    const wraps = lineEl.querySelectorAll('.intro-word-wrap');
    const words = lineEl.querySelectorAll('.intro-word');
    gsap.killTweensOf(wraps);
    gsap.killTweensOf(words);
    gsap.set(wraps, { opacity: 0, y: 12 });
    gsap.set(words, { opacity: 1 });
  }

  updateIntroTextPosition() {
    if (!this.introTextContainer || !this.mainCont || !this.playerCont) return;
    const zoom = this.zoomScale || 1;
    const innerY = this.playerInnerCont ? this.playerInnerCont.position.y : 0;
    const screenX = this.mainCont.position.x + this.playerCont.position.x * zoom;
    const screenY = this.mainCont.position.y + (this.playerCont.position.y - 78) * zoom - innerY * zoom;
    this.introTextContainer.style.left = screenX + 'px';
    this.introTextContainer.style.top = screenY + 'px';
  }

  animateIntroLine(lineEl, onComplete) {
    if (!lineEl) {
      if (onComplete) onComplete();
      return;
    }

    lineEl.style.display = 'flex';
    this.updateIntroTextPosition();
    const wraps = lineEl.querySelectorAll('.intro-word-wrap');
    const words = lineEl.querySelectorAll('.intro-word');
    gsap.killTweensOf(wraps);
    gsap.killTweensOf(words);
    gsap.set(wraps, { opacity: 0, y: 12 });
    gsap.set(words, { opacity: 1 });

    this.startIntroWordFlicker(lineEl);

    gsap.to(wraps, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.07,
      ease: 'power2.out',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  startIntroWordFlicker(lineEl) {
    if (!lineEl) return;
    const words = lineEl.querySelectorAll('.intro-word');
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const runFlicker = () => {
        if (lineEl.style.display === 'none') return;
        gsap.to(word, {
          opacity: 0.4 + Math.random() * 0.6,
          duration: 0.012 + Math.random() * 0.028,
          ease: 'none',
          onComplete: runFlicker,
        });
      };
      gsap.delayedCall(i * 0.02, runFlicker);
    }
  }

  hideIntroLine(lineEl) {
    if (!lineEl) return;
    const wraps = lineEl.querySelectorAll('.intro-word-wrap');
    const words = lineEl.querySelectorAll('.intro-word');
    gsap.killTweensOf(wraps);
    gsap.killTweensOf(words);
    lineEl.style.display = 'none';
  }

  hideIntroText() {
    const line1 = this.introLine1 || document.getElementById('introLine1');
    const line2 = this.introLine2 || document.getElementById('introLine2');
    const container = this.introTextContainer || document.getElementById('introTextContainer');
    this.hideIntroLine(line1);
    this.hideIntroLine(line2);
    if (container) {
      container.style.display = 'none';
    }
  }

  beginIntroLine1() {
    this.introLineReady = false;
    this.introCount = 0;
    this.animateIntroLine(this.introLine1, () => {
      this.introLineReady = true;
      this.introCount = 0;
    });
  }

  beginIntroLine2() {
    this.introLineReady = false;
    this.introCount = 0;
    this.animateIntroLine(this.introLine2, () => {
      this.introLineReady = true;
      this.introCount = 0;
    });
  }

  finishIntroSequence() {
    this.hideIntroText();
    this.setGameplayHudVisible(true);
    this.updateHtmlHearts();
    this.syncHtmlHudTime('0:00');
    this.syncHudScore(0);

    if (this.e && this.e.s) {
      this.e.s.p('howl');
    }

    if (this.e && this.e.s && this.e.s.musicLoop) {
      this.e.s.musicLoop.loop = true;
      this.musicLoopVolume = 0;
      this.e.s.musicLoop.volume(0);
      this.e.s.musicLoop.play();
    }
    this.introMusicRamp = true;
    this.fadeIntroVignetteToGameplay();
    this.fadeOutIntroBackdrop();
    this.applyRunStartStoreState();
  }

  resetBulletPool() {
    if (this.bullets?.length && this.mainCont) {
      for (let i = 0; i < this.bullets.length; i++) {
        const b = this.bullets[i];
        if (!b) continue;
        gsap.killTweensOf(b.scale);
        if (b.parent === this.mainCont) {
          this.mainCont.removeChild(b);
        }
      }
    }
    this.bullets = [];
    this._bulletPoolScan = 0;
    this.setBullets = undefined;
  }

  resetEnemyBulletPool() {
    if (this.enemyBullets?.length && this.mainCont) {
      for (let i = 0; i < this.enemyBullets.length; i++) {
        const eb = this.enemyBullets[i];
        if (eb?.parent === this.mainCont) {
          this.mainCont.removeChild(eb);
        }
      }
    }
    this.enemyBullets = [];
    this.setEnemyBullets = undefined;
  }

  /** Reset combat pools and intro flags before each run from the splash PLAY path. */
  prepareNewRunFromMenu() {
    this.resetBulletPool();
    this.resetEnemyBulletPool();
    this.setControls = undefined;
    this.gameStartInitialized = false;
    this.introLine1Started = false;
    this.introLine2Started = false;
    this.introLineReady = false;
    this.introCount = 0;
    this.pause = false;
    gsap.globalTimeline.resume();
  }

  resetPlayerDeathVisuals(hideSprites = true) {
    if (this.t) {
      gsap.killTweensOf(this.t);
      this.t.deathOffset = 0;
    }

    const ui = this.e && this.e.ui;
    if (!ui) return;

    if (ui.death) {
      gsap.killTweensOf(ui.death);
      ui.death.alpha = 0;
    }

    if (ui.playerDeath) {
      const pd = ui.playerDeath;
      pd.dontAnimate = false;
      pd.aniLoop = undefined;
      pd.ani = ui.deathAni;
      pd.aniSpeed = 0.05;
      pd.curFrame = 0;
      pd.aniCount = 0;
      if (ui.deathAni && ui.deathAni[0]) {
        pd.texture = ui.deathAni[0];
      }
      if (hideSprites) {
        pd.alpha = 0;
      }
    }

    if (hideSprites && this.playerCont) {
      this.playerCont.alpha = 1;
    }
  }

  beginPlayerDeathSequence(useWinPose = false) {
    const ui = this.e && this.e.ui;
    if (!ui || !ui.playerDeath) return;

    const pd = ui.playerDeath;
    pd.dontAnimate = false;
    pd.aniLoop = useWinPose ? true : undefined;
    pd.ani = useWinPose ? ui.wonAni : ui.deathAni;
    pd.aniSpeed = useWinPose ? pd.aniSpeed : 0.05;
    pd.curFrame = 0;
    pd.aniCount = 0;
    if (pd.ani && pd.ani[0]) {
      pd.texture = pd.ani[0];
    }

    if (ui.death) {
      gsap.killTweensOf(ui.death);
      ui.death.alpha = 0;
      gsap.to(ui.death, { alpha: 1, duration: 2, ease: 'linear' });
    }

    if (this.t) {
      gsap.killTweensOf(this.t);
      this.t.deathOffset = 0;
    }

    if (this.playerCont) {
      this.playerCont.alpha = 0;
    }
    pd.alpha = 1;
  }

  resetGame() {
    this.clearGameOverTally();
    this.stopGameOverTopAnimation();
    this.hideGameOverNextButton();

    const goDiv = document.getElementById('gameOverDiv');
    if (goDiv) {
      gsap.killTweensOf(goDiv);
      goDiv.style.display = 'none';
      goDiv.style.opacity = '0';
      goDiv.style.pointerEvents = 'none';
    }

    this.hideInstructions();
    this.hidePowerUpGuide();

    if (this.enemies && this.enemies.length) {
      for (let i = 0; i < this.enemies.length; i++) {
        const en = this.enemies[i];
        if (en && en.phys) {
          Matter.Composite.remove(this.physEngine.world, en.phys, true);
          en.phys = null;
        }
        if (en && en.enCont && en.enCont.parent) {
          en.enCont.parent.removeChild(en.enCont);
        }
      }
      this.enemies = [];
    }
    this.setEnemies = undefined;

    this.resetBulletPool();
    this.resetEnemyBulletPool();

    if (this.starConts && this.starConts.length) {
      for (let i = 0; i < this.starConts.length; i++) {
        this.starConts[i].active = false;
        this.starConts[i].position.x = 10000;
      }
    }

    this.resetAllPickups();
    this.parkAllBombs();

    this.action = 'set';
    this.gameTime = 0;
    this.score = 0;
    this.coinAmount = 0;
    this.levCoinAmount = 5;
    this.coinsFoundThisLevel = 0;
    this.enemiesKilledThisLevel = 0;
    this.killTotal = 0;
    this.coinTotal = 0;
    this.runJewels = 0;
    this.pickupSpawnCount = 0;
    this.iconCount = 0;
    this.playerLevel = 1;
    this.gameLev = 1;
    this.level = 1;
    this.saveLevel = 1;
    this.life = 4;
    this.maxLife = 4;
    this.finalScoreApplied = false;
    this.powerUps = [];
    this.currentPowers = [];
    this.extraPowers = [];
    this.allPowerUps = undefined;
    this.allPowerUps2 = undefined;
    this.powerPick = 0;
    this.totalShotPowerUps = 0;
    this.shotNumber = 1;
    this.magnetDistance = 60;
    this.backwardsShotCue = 0;
    this.backwardsShot = false;
    this.splinter = false;
    this.fireBallCount = 0;
    this.fireBallShots = 0;
    this.freeze = 0;
    this.freezeCount = 0;
    this.lightning = 0;
    this.lightningCount = 0;
    this.bombs = 0;
    this.bombCount = 0;
    this.bombLimit = undefined;
    this.coinShotLevel = 0;
    this.stealthLevel = 0;
    this.stealthActive = false;
    this.stealthTimer = 0;
    this.stealthCooldown = 0;
    this.stealthSpeedBefore = 60;
    this.bulletShieldLevel = 0;
    this.bulletPreventionCharges = 0;
    this.jewelKillLevel = 0;
    this.jewelSpawnBlockTimer = 0;
    this.resetJewelHexPool();
    this.hasWon = false;
    this.wonCount = 0;
    this.winBonus = 0;
    this.masterSpeed = 1.4;
    this.disableAttacks = false;
    this.playerAction = undefined;
    this.setControls = undefined;
    this.count = 0;
    this.gameStartFixerCount = 0;
    this.gameStartInitialized = false;
    this.introLine1Started = false;
    this.introLine2Started = false;
    this.introLineReady = false;
    this.introMusicRamp = false;
    this.introCount = 0;
    this.hideIntroText();
    this.countFPS = false;
    this.pause = false;
    this._lastCrazyGamesLevelContext = null;
    this.resetPlayerDeathVisuals(true);

    if (this.e && this.e.s && this.e.s.musicLoop) {
      this.e.s.musicLoop.stop();
    }
    this.musicLoopVolume = 0;
    if (this.e && this.e.s && this.e.s.musicLoop) {
      this.e.s.musicLoop.volume(0);
    }

    if (this.e && this.e.ui) {
      if (this.player) this.player.alpha = 1;
      if (this.e.ui.winText) this.e.ui.winText.alpha = 0;
      if (this.e.ui.scoreText) this.e.ui.scoreText.text = '0';
      if (this.e.ui.timeText) this.e.ui.timeText.text = '0:00';
      if (this.e.ui.coinText) this.e.ui.coinText.text = '0';
      if (this.e.ui.levText) this.e.ui.levText.text = '1';
      if (typeof this.e.ui.hidePowerUpContainer === 'function') {
        this.e.ui.hidePowerUpContainer();
      }
      this.resetPowerUpHudIcons();
    }

    if (this.playerCont) {
      this.playerCont.position.x = 0;
      this.playerCont.position.y = 0;
      this.playerCont.alpha = 1;
      this.stealthTarget.x = this.playerCont.position.x;
      this.stealthTarget.y = this.playerCont.position.y;
    }
    this.lastDir = "d";
    this.showLevCount = 0;
    if (this.levShowText) {
      gsap.killTweensOf(this.levShowText);
      gsap.killTweensOf(this.levShowText.position);
      this.levShowText.alpha = 0;
      this.levShowText.position.y = -24;
    }
    if (this.player && this.e && this.e.ui) {
      this.player.ani = this.e.ui.stanceAni_d;
      this.player.aniSpeed = 0.25;
      this.player.curFrame = 0;
      this.player.aniCount = 0;
      this.player.scale.x = 1;
      if (this.e.ui.stanceAni_d && this.e.ui.stanceAni_d.length) {
        this.player.texture = this.e.ui.stanceAni_d[0];
      }
    }
    const stealthHudReset = document.getElementById('stealthText');
    if (stealthHudReset) stealthHudReset.style.display = 'none';
    const bulletShieldHudReset = document.getElementById('bulletShieldHud');
    if (bulletShieldHudReset) bulletShieldHudReset.style.display = 'none';
    if (this.playerInnerCont) {
      this.playerInnerCont.position.y = 0;
    }
    if (this.mainMask && this.playerCont) {
      this.mainMask.position.x = this.playerCont.position.x;
      this.mainMask.position.y = this.playerCont.position.y;
    }
    if (this.mainCont && this.playerCont) {
      const z = this.zoomScale;
      const innerY = this.playerInnerCont ? this.playerInnerCont.position.y : 0;
      this.mainCont.position.x = Math.round(window.innerWidth / 2) + this.playerCont.position.x * -z;
      this.mainCont.position.y = Math.round(window.innerHeight / 2) + this.playerCont.position.y * -z - innerY;
    }
    if (this.cloudLayer && this.playerCont) {
      this.cloudLayer.position.x = this.playerCont.position.x * -0.15;
      this.cloudLayer.position.y = this.playerCont.position.y * -0.15;
    }

    if (this.e && this.e.input) {
      this.e.input.keyRight = false;
      this.e.input.keyLeft = false;
      this.e.input.keyUp = false;
      this.e.input.keyDown = false;
      this.e.input.speedMultX = 0;
      this.e.input.speedMultY = 0;
    }
    this.xspeed = 0;
    this.yspeed = 0;
    this.playerSpeed = 60;

    this.syncHtmlHudTime('0:00');
    this.syncHudScore(0);
    this.updateHtmlHearts();
    this.updateCoinLevelMeter();

    const barFill = document.getElementById('go_progressBarFill');
    if (barFill) barFill.style.width = '0px';
    this.syncBulletShieldCharges();
  }

  clearCrazyGamesRunContext() {
    if (this._crazyGamesContextCleared) {
      return;
    }
    this._crazyGamesContextCleared = true;
    this._lastCrazyGamesLevelContext = null;
    CrazyGamesAPI.clearGameContext();
  }

  abandonActiveRun() {
    if (!CrazyGamesAPI.isRunActive()) {
      return;
    }
    CrazyGamesAPI.endRun('abandon');
    this.clearCrazyGamesRunContext();
  }

  /** Post-death progression close → splash. Run already ended at death/victory. */
  returnToSplashScreen() {
    this.progressFromGameOver = false;
    this.hideProgressWindow();
    this.resetGame();
    this.setGameplayHudVisible(false);

    const playButton = document.getElementById('playButton');
    const instructionsButton = document.getElementById('instructionsButton');
    if (playButton) {
      playButton.disabled = false;
      playButton.style.pointerEvents = 'auto';
    }
    if (instructionsButton) {
      instructionsButton.disabled = false;
      instructionsButton.style.pointerEvents = 'auto';
    }

    const splashEls = [
      document.getElementById('startMenu'),
      document.getElementById('startMenuBackdrop'),
      document.getElementById('highScoreDisplay'),
      document.getElementById('upgradeCounter'),
    ].filter((el) => el);

    splashEls.forEach((el) => {
      if (el.id === 'startMenu' || el.id === 'startMenuBackdrop') {
        el.style.display = 'block';
      } else if (el.id === 'upgradeCounter') {
        el.style.display = 'flex';
      } else {
        el.style.removeProperty('display');
      }
    });

    gsap.killTweensOf(splashEls);
    gsap.set(splashEls, { opacity: 1 });

    LocalState.highScore.syncSplashDisplay();
    this.syncJewelDisplays();
    this.setupSplashAnimation();
    this.setupStartButtonAnimation();

    this.hasWon = false;
    this.wonCount = 0;
    this.gameStartInitialized = false;
    this.introLine1Started = false;
    this.introLine2Started = false;
    this.introLineReady = false;
    this.introMusicRamp = false;
    this.introCount = 0;
    this.hideIntroText();
    this.pause = false;
    this.splashRevealReady = true;
    this.action = 'set';
  }

  getLifeCountForGameOverBonus() {
    return Math.max(0, this.life || 0);
  }

  getGameLevForGameOver() {
    return this.gameLev || 0;
  }

  dismissHtmlLoadingChrome() {
    if (this._loaderFadeFallbackTimer) {
      clearTimeout(this._loaderFadeFallbackTimer);
      this._loaderFadeFallbackTimer = null;
    }

    const ids = ['loadingImage', 'loadingBack'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (!el) continue;
      gsap.killTweensOf(el);
      el.style.transition = '';
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
    }

    const canvas = this.e?.ui?.uiCanvas;
    if (canvas) {
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';
    }

    this._loadingChromeFadeDone = true;
    this._loadingChromeFading = false;
    if (!this._reportedLoadingStop) {
      this._reportedLoadingStop = true;
      CrazyGamesAPI.loadingStop();
    }
  }

  fadeOutLoadingChrome() {
    if (this._loadingChromeFadeDone || this._loadingChromeFading) return;

    const loadingBack = document.getElementById('loadingBack');
    const loadingImage = document.getElementById('loadingImage');
    const elements = [];
    if (loadingBack && loadingBack.style.display !== 'none') elements.push(loadingBack);
    if (loadingImage && loadingImage.style.display !== 'none') elements.push(loadingImage);
    if (!elements.length) {
      this.dismissHtmlLoadingChrome();
      return;
    }

    this._loadingChromeFading = true;

    const finish = () => {
      if (this._loadingChromeFadeDone) return;
      this.dismissHtmlLoadingChrome();
    };

    this._loaderFadeFallbackTimer = setTimeout(finish, 1400);

    const startFade = () => {
      if (this._loadingChromeFadeDone) return;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        el.style.pointerEvents = 'none';
        el.style.visibility = 'visible';
        el.style.removeProperty('display');
        el.style.opacity = '1';
      }

      if (!gsap || typeof gsap.to !== 'function') {
        for (let i = 0; i < elements.length; i++) {
          elements[i].style.transition = 'opacity 1s ease-out';
          elements[i].style.opacity = '0';
        }
        setTimeout(finish, 1100);
        return;
      }

      gsap.killTweensOf(elements);
      gsap.set(elements, { opacity: 1 });
      gsap.to(elements, {
        opacity: 0,
        duration: 1,
        ease: 'power1.out',
        onComplete: finish,
      });
    };

    const delayMs = this.e?.mobile ? 150 : 50;
    setTimeout(startFade, delayMs);
  }

  formatElapsedTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds || 0));
    const mins = Math.floor(seconds / 60);
    const secs = seconds - mins * 60;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mins}:${secsStr}`;
  }

  useLandscapeGameplayHud() {
    return !!(this.e && typeof this.e.isMobileLandscape === 'function' && this.e.isMobileLandscape());
  }

  syncHudScore(score) {
    const value = String(score);
    const scoreDisp = document.getElementById('scoreDisplay');
    const scoreDispLandscape = document.getElementById('scoreDisplayLandscape');
    if (scoreDisp) scoreDisp.textContent = value;
    if (scoreDispLandscape) scoreDispLandscape.textContent = value;
  }

  syncHtmlHudTime(timeStr) {
    const el = document.getElementById('timeDisplay');
    const elLandscape = document.getElementById('timeDisplayLandscape');
    if (el) el.textContent = timeStr;
    if (elLandscape) elLandscape.textContent = timeStr;
  }

  syncJewelDisplays() {
    const total = LocalState.jewels.getTotal();
    const totalStr = String(total);
    const upgradeEl = document.getElementById('upgradeNumber');
    if (upgradeEl) upgradeEl.textContent = totalStr;
    const progressEl = document.getElementById('progressJewelCount');
    if (progressEl) progressEl.textContent = totalStr;
    const progressLandscapeEl = document.getElementById(
      'progressJewelCountLandscape'
    );
    if (progressLandscapeEl) progressLandscapeEl.textContent = totalStr;
  }

  syncProgressStoreCells() {
    const cells = document.querySelectorAll('.progress-cell');
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const upgradeId = cell.dataset.upgrade;
      if (!upgradeId) continue;

      const level = LocalState.store.getLevel(upgradeId);
      const countEl = cell.querySelector('.progress-cell-count');
      if (!countEl) continue;

      const maxLevel = LocalState.store.getMaxLevel(upgradeId);
      if (level >= maxLevel) {
        countEl.textContent = 'max';
        cell.classList.add('is-maxed');
      } else {
        cell.classList.remove('is-maxed');
        countEl.textContent = String(LocalState.store.getCostForNextLevel(upgradeId, level));
      }
    }
  }

  applyPermanentStoreUpgrades() {
    const damage = LocalState.store.getLevel('damage');
    if (damage >= 1) {
      this.bulletWidth = 2;
      this.bulletDamage = 13;
    }
    if (damage >= 2) {
      this.bulletWidth = 3;
      this.bulletDamage = 17;
    }
    if (damage >= 3) {
      this.bulletWidth = 4;
      this.bulletDamage = 22;
    }

    const extra = LocalState.store.getLevel('extra');
    if (extra > 0) {
      this.shotNumber = 1 + extra;
    }

    const speedShot = LocalState.store.getLevel('speedShot');
    if (speedShot >= 1) this.shootLim = 0.3;
    if (speedShot >= 2) this.shootLim = 0.266;
    if (speedShot >= 3) this.shootLim = 0.233;

    const heart = LocalState.store.getLevel('heart');
    this.maxLife = 4 + heart;
    this.life = this.maxLife;

    const bulletShield = LocalState.store.getLevel('bulletShield');
    this.bulletShieldLevel = 0;
    this.bulletPreventionCharges = 0;
    if (bulletShield >= 1) {
      this.bulletShieldLevel = 1;
      this.bulletPreventionCharges = 1;
    }
    if (bulletShield >= 2) {
      this.bulletShieldLevel = 2;
      this.bulletPreventionCharges = 3;
    }

    const speed = LocalState.store.getLevel('speed');
    if (speed >= 1) this.playerSpeed = 90;
    if (speed >= 2) this.playerSpeed = 120;
    if (speed >= 3) this.playerSpeed = 150;

    const magnet = LocalState.store.getLevel('magnet');
    if (magnet >= 1) this.magnetDistance = 100;
    if (magnet >= 2) this.magnetDistance = 140;
    if (magnet >= 3) this.magnetDistance = 180;

    this.coinShotLevel = LocalState.store.getLevel('coinShot');
    this.jewelKillLevel = LocalState.store.getLevel('jewelShot');
    this.syncBulletShieldCharges();
  }

  syncStoreHudIcons() {
    if (!this.e || !this.e.ui || !this.e.ui.icons) return;

    this.iconCount = 0;
    this.resetPowerUpHudIcons();

    const addLevelIcons = (upgradeId, iconType) => {
      const level = LocalState.store.getLevel(upgradeId);
      for (let i = 0; i < level; i++) {
        this.addIcon(iconType);
      }
    };

    addLevelIcons('damage', 'biggerShot');
    addLevelIcons('extra', 'extraShot');
    addLevelIcons('speedShot', 'fasterShot');
    addLevelIcons('magnet', 'magnet');
    addLevelIcons('speed', 'footSpeed');

    if (LocalState.store.getLevel('coinShot') > 0) {
      this.addIcon('coinShot');
    }
    if (LocalState.store.getLevel('bulletShield') > 0) {
      this.addIcon('bulletShield');
    }
    if (LocalState.store.getLevel('jewelShot') > 0) {
      this.addIcon('jewelKill');
    }
  }

  applyRunStartStoreState() {
    this.applyPermanentStoreUpgrades();
    this.syncStoreHudIcons();
    if (this.allPowerUps !== undefined) {
      this.syncPoolTiersWithCurrentProgress();
    }
  }

  getPowerUpFamilyTiers() {
    return {
      extraShot: ['extraShot', 'extraShot2', 'extraShot3', 'extraShot4'],
      biggerShot: ['biggerShot', 'biggerShot2', 'biggerShot3', 'biggerShot4'],
      fasterShot: ['fasterShot', 'fasterShot2', 'fasterShot3', 'fasterShot4'],
      footSpeed: ['footSpeed', 'footSpeed2'],
      magnet: ['magnet', 'magnet2'],
      coinShot: ['coinShot', 'coinShot2', 'coinShot3'],
      bulletShield: ['bulletShield', 'bulletShield2'],
      jewelKill: ['jewelKill', 'jewelKill2', 'jewelKill3'],
      heal: ['heal', 'heal2'],
      fireballs: ['fireballs', 'fireballs2', 'fireballs3'],
      lightningStrike: ['lightningStrike', 'lightningStrike2', 'lightningStrike3'],
      bombs: ['bombs', 'bombs2', 'bombs3'],
      freeze: ['freeze', 'freeze2'],
      ninjaStar: ['ninjaStar', 'ninjaStar2', 'ninjaStar3'],
    };
  }

  removePowerUpFamilyFromPool(family) {
    const tiers = this.getPowerUpFamilyTiers()[family];
    if (!tiers || !this.allPowerUps) return;

    for (let i = this.allPowerUps.length - 1; i >= 0; i--) {
      if (tiers.indexOf(this.allPowerUps[i]) >= 0) {
        this.allPowerUps.splice(i, 1);
      }
    }
  }

  syncPoolTiersWithCurrentProgress() {
    if (!this.allPowerUps) return;

    const families = this.getPowerUpFamilyTiers();
    for (const family in families) {
      const tiers = families[family];
      this.removePowerUpFamilyFromPool(family);

      const current = this.getCurrentPowerLevel(family);
      const max = this.e.ui.getPowerUpMaxLevel(tiers[0]);

      if (current < max && tiers[current]) {
        const nextTierId = tiers[current];
        if (this.allPowerUps.indexOf(nextTierId) < 0) {
          this.allPowerUps.push(nextTierId);
        }
      }
    }
  }

  filterPowerUpCandidates(candidates, starterPhase) {
    const starterFamilies = new Set([
      'biggerShot',
      'fasterShot',
      'extraShot',
      'fireballs',
      'lightningStrike',
      'splinter',
      'ninjaStar',
    ]);

    return candidates.filter((powerId) => {
      if (starterPhase && !starterFamilies.has(this.powerUpFamily(powerId))) return false;
      return true;
    });
  }

  powerUpFamily(powerId) {
    if (!powerId || powerId === 'none') return 'none';
    return powerId.replace(/\d+$/, '');
  }

  getPowerUpTier(powerId) {
    const match = powerId && powerId.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  }

  getCurrentPowerLevel(family) {
    switch (family) {
      case 'extraShot':
        return Math.max(0, (this.shotNumber || 1) - 1);
      case 'biggerShot': {
        const w = this.bulletWidth || 1;
        if (w >= 5) return 4;
        if (w >= 4) return 3;
        if (w >= 3) return 2;
        if (w >= 2) return 1;
        return 0;
      }
      case 'fasterShot': {
        const lim = this.shootLim || 0.4;
        if (lim <= 0.2) return 4;
        if (lim <= 0.233) return 3;
        if (lim <= 0.266) return 2;
        if (lim <= 0.3) return 1;
        return 0;
      }
      case 'footSpeed':
        if (this.playerSpeed >= 120) return 2;
        if (this.playerSpeed >= 90) return 1;
        return 0;
      case 'magnet':
        if (this.magnetDistance >= 180) return 3;
        if (this.magnetDistance >= 140) return 2;
        if (this.magnetDistance >= 100) return 1;
        return 0;
      case 'heal':
        if (this.powerUps && this.powerUps.indexOf('heal2') >= 0) return 2;
        if (this.powerUps && (this.powerUps.indexOf('heal') >= 0 || this.powerUps.indexOf('heal2') >= 0)) return 1;
        return 0;
      case 'backwardsShot':
        return this.backwardsShot ? 1 : 0;
      case 'splinter':
        return this.splinter ? 1 : 0;
      case 'fireballs':
        return this.fireBallShots || 0;
      case 'lightningStrike':
        return this.lightning || 0;
      case 'bombs':
        return this.bombs || 0;
      case 'freeze':
        return this.freeze || 0;
      case 'ninjaStar': {
        if (!this.starConts) return 0;
        let activeStars = 0;
        for (let i = 0; i < this.starConts.length; i++) {
          if (this.starConts[i].active) activeStars += 1;
        }
        return activeStars;
      }
      case 'coinShot':
        return this.coinShotLevel || 0;
      case 'stealth':
        return this.stealthLevel || 0;
      case 'bulletShield':
        return this.bulletShieldLevel || 0;
      case 'jewelKill':
        return this.jewelKillLevel || 0;
      default:
        return 0;
    }
  }

  isPowerUpOfferValid(powerId) {
    if (!powerId || powerId === 'none') return false;

    const family = this.powerUpFamily(powerId);
    if (family === 'heal' && this.life >= this.maxLife) return false;

    const offeredTier = this.getPowerUpTier(powerId);
    const currentLevel = this.getCurrentPowerLevel(family);
    const maxLevel = this.e.ui.getPowerUpMaxLevel(powerId);

    if (currentLevel >= maxLevel) return false;
    if (offeredTier <= currentLevel) return false;
    return true;
  }

  shouldSkipShotPowerThrottle() {
    return (this.powerUps && this.powerUps.length >= 20);
  }

  buildPowerUpChoicePool() {
    if (this.allPowerUps === undefined) {
      this.allPowerUps = [
        'fasterShot', 'biggerShot', 'extraShot', 'splinter', 'backwardsShot',
        'ninjaStar', 'fireballs', 'bombs', 'lightningStrike', 'freeze',
        'footSpeed', 'heal', 'magnet', 'coinShot', 'stealth', 'bulletShield', 'jewelKill',
      ];
    }

    this.syncPoolTiersWithCurrentProgress();

    const relaxedRules = this.shouldSkipShotPowerThrottle();
    const familiesSeen = {};
    const pool = [];

    for (let i = 0; i < this.allPowerUps.length; i++) {
      const powerId = this.allPowerUps[i];
      const tRan = this.e.u.ran(2);

      if (!relaxedRules) {
        if (powerId === 'extraShot2' && this.playerLevel < 6) continue;
        if (powerId === 'extraShot3' && this.playerLevel < 9) continue;
        if (powerId === 'extraShot4' && this.playerLevel < 12) continue;
        if (powerId === 'extraShot5' && this.playerLevel < 15) continue;

        if (
          (powerId === 'heal' || powerId === 'heal2') && this.life >= this.maxLife
        ) {
          continue;
        }

        if (
          (powerId === 'extraShot' || powerId === 'extraShot2' || powerId === 'extraShot3' || powerId === 'extraShot4' ||
            powerId === 'biggerShot' || powerId === 'biggerShot2' || powerId === 'biggerShot3' || powerId === 'biggerShot4' ||
            powerId === 'fasterShot' || powerId === 'fasterShot2' || powerId === 'fasterShot3' || powerId === 'fasterShot4') &&
          this.totalShotPowerUps >= 5 && tRan === 0
        ) {
          continue;
        }
      } else if ((powerId === 'heal' || powerId === 'heal2') && this.life >= this.maxLife) {
        continue;
      }

      if (!this.isPowerUpOfferValid(powerId)) continue;

      const family = this.powerUpFamily(powerId);
      if (familiesSeen[family]) continue;
      familiesSeen[family] = true;
      pool.push(powerId);
    }

    const starterPhase = !relaxedRules && this.powerUps.length < 3;
    return this.filterPowerUpCandidates(pool, starterPhase);
  }

  getAllPowerUpFamilies() {
    return [
      'backwardsShot',
      'biggerShot',
      'extraShot',
      'fasterShot',
      'splinter',
      'fireballs',
      'lightningStrike',
      'bombs',
      'freeze',
      'footSpeed',
      'heal',
      'magnet',
      'ninjaStar',
      'coinShot',
      'stealth',
      'bulletShield',
      'jewelKill',
    ];
  }

  getTotalPowerLevelCapacity() {
    if (!this.e || !this.e.ui) return 1;
    let total = 0;
    const families = this.getAllPowerUpFamilies();
    for (let i = 0; i < families.length; i++) {
      total += this.e.ui.getPowerUpMaxLevel(families[i]);
    }
    return Math.max(1, total);
  }

  getCurrentTotalPowerLevels() {
    let total = 0;
    const families = this.getAllPowerUpFamilies();
    for (let i = 0; i < families.length; i++) {
      const family = families[i];
      const current = this.getCurrentPowerLevel(family);
      const max = this.e.ui.getPowerUpMaxLevel(family);
      total += Math.min(current, max);
    }
    return total;
  }

  getPowerUpCompletionRatio() {
    return this.getCurrentTotalPowerLevels() / this.getTotalPowerLevelCapacity();
  }

  getPowerUpCompletionPercent() {
    return Math.round(this.getPowerUpCompletionRatio() * 100);
  }

  getPowerLevelCoinMultiplier() {
    const ratio = this.getPowerUpCompletionRatio();
    if (ratio >= 0.85) return 5;
    if (ratio >= 0.75) return 3;
    return 1;
  }

  getBaseLevelCoinAmount(pickCount) {
    const np = Math.max(0, pickCount || 0);
    if (np === 0) return 5;
    if (np === 1) return 10;
    if (np === 2) return 20;
    if (np === 3) return 25;
    if (np === 4) return 30;
    if (np === 5) return 40;
    if (np === 6) return 50;
    if (np === 7) return 60;
    if (np === 8) return 70;
    if (np === 9) return 80;
    if (np === 10) return 90;
    if (np === 11) return 100;
    if (np === 12) return 120;
    if (np === 13) return 140;
    if (np === 14) return 160;
    if (np === 15) return 180;
    if (np === 16) return 200;
    if (np === 17) return 220;
    if (np === 18) return 240;
    if (np === 19) return 260;
    return 280;
  }

  updateLevelCoinGoal() {
    const base = this.getBaseLevelCoinAmount(this.powerUps.length);
    const mult = this.getPowerLevelCoinMultiplier();
    this.levCoinAmount = Math.round(base * mult);
    this.powerLevelCoinMultiplier = mult;
    this.powerUpCompletionPercent = this.getPowerUpCompletionPercent();
  }

  updatePowerUpMenuCompletionStats() {
    const percent = this.getPowerUpCompletionPercent();
    const current = this.getCurrentTotalPowerLevels();
    const capacity = this.getTotalPowerLevelCapacity();
    const mult = this.getPowerLevelCoinMultiplier();
    const base = this.getBaseLevelCoinAmount(this.powerUps.length);

    let coinGoalLabel = 'normal';
    if (mult === 5) coinGoalLabel = 'x5 (85%+ power levels)';
    else if (mult === 3) coinGoalLabel = 'x3 (75%+ power levels)';
  }

  pickPowerUpMenuOptions(pool) {
    const picks = [];
    const working = pool.slice();

    for (let i = 0; i < 3; i++) {
      if (working.length === 0) {
        picks.push('none');
        continue;
      }

      const choice = this.e.u.apr(working);
      picks.push(choice);

      const pickedFamily = this.powerUpFamily(choice);
      for (let j = working.length - 1; j >= 0; j--) {
        if (this.powerUpFamily(working[j]) === pickedFamily) {
          working.splice(j, 1);
        }
      }
    }

    return picks;
  }

  hudAlreadyHasIcon(type) {
    if (!this.e || !this.e.ui || !this.e.ui.icons) return false;

    let myType = null;
    if (type === 'backwardsShot') myType = this.e.ui.t_i_backwardsShot;
    else if (type === 'splinter') myType = this.e.ui.t_i_splinter;
    else if (type === 'heal') myType = this.e.ui.t_i_heal;
    if (!myType) return false;

    const limit = Math.min(this.iconCount, this.e.ui.icons.length);
    for (let i = 0; i < limit; i++) {
      const icon = this.e.ui.icons[i];
      if (icon.alpha > 0 && icon.texture === myType) return true;
    }
    return false;
  }

  syncBulletShieldCharges(){

    if(!this.htmlHeartsContainer){ return; }

    const count = Math.max(0, this.bulletPreventionCharges || 0);
    const maxSlots = 8;

    if(!this.bulletShieldChargeImgs){
      this.bulletShieldChargeImgs = [];
    }

    while(this.bulletShieldChargeImgs.length < maxSlots){
      const img = document.createElement('img');
      img.src = './src/img/UI/bulletShield.png';
      img.className = 'bullet-shield-charge';
      img.alt = 'bullet shield';
      img.draggable = false;
      img.style.display = 'none';
      this.htmlHeartsContainer.appendChild(img);
      this.bulletShieldChargeImgs.push(img);
    }

    for(var i=0; i<this.bulletShieldChargeImgs.length; i++){
      const img = this.bulletShieldChargeImgs[i];
      img.style.display = i < count ? '' : 'none';
    }

    this.layoutHtmlHeartsHud();

  }

  setPickupSprite(pickup, isJewel) {
    if (!pickup || !this.e || !this.e.ui) return;
    pickup.isJewel = !!isJewel;
    if (pickup.isJewel && this.e.ui.jewelAni && this.e.ui.jewelAni.length) {
      pickup.texture = this.e.ui.jewelAni[0];
      pickup.ani = this.e.ui.jewelAni;
      pickup.curFrame = 0;
      pickup.aniCount = 0;
      pickup.dontAnimate = true;
    } else {
      pickup.texture = this.e.ui.coinAni[0];
      pickup.ani = this.e.ui.coinAni;
      pickup.dontAnimate = true;
    }
  }

  resetAllPickups() {
    if (!this.coins || !this.coins.length) return;
    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      c.action = 'ready';
      c.alpha = 0;
      c.dontAnimate = true;
      c.position.x = 10000;
      c.position.y = 10000;
      this.setPickupSprite(c, false);
    }
  }

  parkAllBombs() {
    if (this.allBombs && this.allBombs.length) {
      for (let i = 0; i < this.allBombs.length; i++) {
        const bm = this.allBombs[i];
        if (!bm) continue;
        if (bm.fCont) gsap.killTweensOf(bm.fCont.position);
        bm.action = 'ready';
        bm.position.x = 10000;
        bm.position.y = 10000;
        if (bm.flashCount !== undefined) bm.flashCount = 0;
        if (bm.count !== undefined) bm.count = 0;
        if (bm.fCount !== undefined) bm.fCount = 0;
        if (bm.fCont) {
          bm.fCont.position.y = 0;
          bm.fCont.alpha = 1;
        }
        if (bm.sprite) bm.sprite.alpha = 1;
        if (bm.explosion) bm.explosion.alpha = 0;
        if (bm.explosion2) bm.explosion2.alpha = 0;
        if (bm.fuArray) {
          for (let j = 0; j < bm.fuArray.length; j++) {
            const fu = bm.fuArray[j];
            gsap.killTweensOf(fu.position);
            gsap.killTweensOf(fu);
            fu.alpha = 0;
          }
        }
      }
    }
    this.bombCount = 0;
  }

  resetPowerUpHudIcons() {
    if (!this.e || !this.e.ui || !this.e.ui.icons) return;
    for (let i = 0; i < this.e.ui.icons.length; i++) {
      this.e.ui.icons[i].alpha = 0;
    }
  }

  snapshotGameOverStats() {
    this.goKillsSnapshot = this.killTotal || 0;
    this.goCoinsSnapshot = this.coinTotal || 0;
    this.goJewelsSnapshot = this.runJewels || 0;
    this.goLevelSnapshot = this.getGameLevForGameOver();
    this.goLifeSnapshot = this.getLifeCountForGameOverBonus();
    this.goSurvivalSecondsSnapshot = Math.min(this.gameDurationSeconds, Math.max(0, this.gameTime || 0));
    this.goScoreSnapshot = this.score || 0;
    if (LocalState.highScore.recordScore(this.score)) {
      CrazyGamesAPI.happyTime();
    }
    LocalState.highScore.syncSplashDisplay();
  }

  stopGameOverTopAnimation() {
    if (!this.goTopAnims) return;
    this.goTopAnims.forEach((anim) => anim.cancel());
    this.goTopAnims = null;
  }

  stopProgressTopAnimation() {
    if (!this.progressTopAnims) return;
    this.progressTopAnims.forEach((anim) => anim.cancel());
    this.progressTopAnims = null;
  }

  setupProgressTopAnimation() {
    const frame1 = document.querySelector('.progress-top-1');
    const frame2 = document.querySelector('.progress-top-2');
    if (!frame1 || !frame2) return;

    this.stopProgressTopAnimation();

    frame1.style.opacity = '1';
    frame2.style.opacity = '0';

    const cycle = 1000;

    this.progressTopAnims = [
      frame1.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.499 },
          { opacity: 0, offset: 0.5 },
          { opacity: 0, offset: 0.999 },
          { opacity: 1, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
      frame2.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: 0.499 },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, offset: 0.999 },
          { opacity: 0, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
    ];
  }

  showProgressWindow() {
    const progressDiv = document.getElementById('progressDiv');
    if (!progressDiv) return;

    this.progressVisible = true;
    this.syncJewelDisplays();
    this.syncProgressStoreCells();
    gsap.killTweensOf(progressDiv);
    progressDiv.style.display = 'flex';
    progressDiv.style.pointerEvents = 'auto';
    progressDiv.style.opacity = '0';
    gsap.to(progressDiv, { opacity: 1, duration: 0.55, ease: 'sine.out' });
    this.setupProgressTopAnimation();
  }

  hideProgressWindow() {
    const progressDiv = document.getElementById('progressDiv');
    if (!progressDiv) return;

    this.progressVisible = false;
    gsap.killTweensOf(progressDiv);
    gsap.to(progressDiv, {
      opacity: 0,
      duration: 0.35,
      ease: 'sine.in',
      onComplete: () => {
        progressDiv.style.display = 'none';
        progressDiv.style.pointerEvents = 'none';
        this.stopProgressTopAnimation();
      },
    });
  }

  dismissProgressWindow() {
    if (!this.progressVisible) return;
    if (this.progressFromGameOver) {
      this.returnToSplashScreen();
    } else {
      this.hideProgressWindow();
    }
  }

  setupProgressWindow() {
    const bindProgressDismiss = (btn) => {
      if (!btn || btn.dataset.progressDismissBound === 'true') return;
      btn.dataset.progressDismissBound = 'true';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.e && this.e.s) this.e.s.p('click3');
        this.dismissProgressWindow();
      });
    };

    bindProgressDismiss(document.getElementById('closeProgressButton'));
    bindProgressDismiss(document.getElementById('progressCloseCornerButton'));

    const cells = document.querySelectorAll('.progress-cell');
    if (!this._progressCellsBound) {
      this._progressCellsBound = true;
      cells.forEach((cell) => {
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.progressVisible) return;
          this.onProgressUpgradeClick(cell.dataset.upgrade, cell);
        });
      });
    }
  }

  onProgressUpgradeClick(upgradeId) {
    if (!upgradeId) return;

    const level = LocalState.store.getLevel(upgradeId);
    if (level >= LocalState.store.getMaxLevel(upgradeId)) return;

    const cost = LocalState.store.getCostForNextLevel(upgradeId, level);
    if (!LocalState.jewels.spend(cost)) return;

    LocalState.store.setLevel(upgradeId, level + 1);
    this.syncJewelDisplays();
    this.syncProgressStoreCells();
    this.playStorePurchaseFlash();
  }

  playStorePurchaseFlash() {
    if (this.e && this.e.s) {
      this.e.s.p('achievement1');
    }

    const flash = document.getElementById('storePurchaseFlash');
    if (!flash) return;

    gsap.killTweensOf(flash);
    flash.style.display = 'block';
    flash.style.opacity = '0.8';
    gsap.to(flash, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => {
        flash.style.display = 'none';
      },
    });
  }

  setupGameOverTopAnimation() {
    const frame1 = document.querySelector('.go-top-1');
    const frame2 = document.querySelector('.go-top-2');
    if (!frame1 || !frame2) return;

    this.stopGameOverTopAnimation();

    frame1.style.opacity = '1';
    frame2.style.opacity = '0';

    const cycle = 1000;

    this.goTopAnims = [
      frame1.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.499 },
          { opacity: 0, offset: 0.5 },
          { opacity: 0, offset: 0.999 },
          { opacity: 1, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
      frame2.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: 0.499 },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, offset: 0.999 },
          { opacity: 0, offset: 1 },
        ],
        { duration: cycle, iterations: Infinity, easing: 'linear' }
      ),
    ];
  }

  clearGameOverTally() {
    if (this._goTallyInterval) {
      clearInterval(this._goTallyInterval);
      this._goTallyInterval = null;
    }
    if (this._goTallyTimeline) {
      this._goTallyTimeline.kill();
      this._goTallyTimeline = null;
    }
  }

  fadeInGameOverDiv(goDiv) {
    if (!goDiv) return;
    gsap.killTweensOf(goDiv);
    goDiv.style.display = 'flex';
    goDiv.style.pointerEvents = 'auto';
    goDiv.style.opacity = '0';
    gsap.to(goDiv, { opacity: 1, duration: 0.55, ease: 'sine.out' });
    this.setupGameOverTopAnimation();
  }

  hideGameOverNextButton() {
    const goNextBtn = document.getElementById('gameOverNextButton');
    const goScoreEl = document.getElementById('go_score');
    if (goNextBtn) {
      gsap.killTweensOf(goNextBtn);
      goNextBtn.style.display = 'block';
      goNextBtn.style.pointerEvents = 'none';
      goNextBtn.setAttribute('aria-hidden', 'true');
      gsap.set(goNextBtn, { opacity: 0 });
    }
    if (goScoreEl) {
      gsap.killTweensOf(goScoreEl);
      goScoreEl.textContent = '\u00a0';
      goScoreEl.style.display = 'block';
      goScoreEl.setAttribute('aria-hidden', 'true');
      gsap.set(goScoreEl, { opacity: 0 });
    }
  }

  showGameOverNextButton() {
    const goNextBtn = document.getElementById('gameOverNextButton');
    const goScoreEl = document.getElementById('go_score');
    const fadeDuration = 0.35;

    if (goScoreEl) {
      gsap.killTweensOf(goScoreEl);
      goScoreEl.style.display = 'block';
      gsap.fromTo(
        goScoreEl,
        { opacity: 0 },
        {
          opacity: 1,
          duration: fadeDuration,
          ease: 'sine.out',
          onStart: () => {
            goScoreEl.setAttribute('aria-hidden', 'false');
          },
        }
      );
    }
    if (goNextBtn) {
      gsap.killTweensOf(goNextBtn);
      goNextBtn.style.display = 'block';
      goNextBtn.style.pointerEvents = 'none';
      gsap.fromTo(
        goNextBtn,
        { opacity: 0 },
        {
          opacity: 1,
          duration: fadeDuration,
          ease: 'sine.out',
          onStart: () => {
            goNextBtn.setAttribute('aria-hidden', 'false');
          },
          onComplete: () => {
            goNextBtn.style.pointerEvents = 'auto';
          },
        }
      );
    }
  }

  runGameOverTally() {
    const goTimeEl = document.getElementById('go_time');
    const goKillsEl = document.getElementById('go_kills');
    const goCoinsEl = document.getElementById('go_coins');
    const goJewelsEl = document.getElementById('go_jewels');
    const goLevelsEl = document.getElementById('go_levels');
    const goLifeEl = document.getElementById('go_lifeBonus');
    const barFill = document.getElementById('go_progressBarFill');
    const barTrack = document.getElementById('go_progressBar');

    this.clearGameOverTally();

    if (goTimeEl) goTimeEl.textContent = '0:00';
    if (goKillsEl) goKillsEl.textContent = '';
    if (goCoinsEl) goCoinsEl.textContent = '';
    if (goJewelsEl) goJewelsEl.textContent = '';
    if (goLevelsEl) goLevelsEl.textContent = '';
    if (goLifeEl) goLifeEl.textContent = '';
    if (barFill) barFill.style.width = '0px';
    this.hideGameOverNextButton();

    const maxSeconds = this.gameDurationSeconds || 600;
    const survivalSeconds = typeof this.goSurvivalSecondsSnapshot === 'number'
      ? Math.min(Math.max(0, this.goSurvivalSecondsSnapshot), maxSeconds)
      : Math.min(Math.max(0, this.gameTime || 0), maxSeconds);
    const ratio = survivalSeconds / maxSeconds;
    const barMaxPx = barTrack && barTrack.offsetWidth > 0 ? barTrack.offsetWidth : 132;
    const targetWidth = barMaxPx * ratio;

    const killsPoints = this.goKillsSnapshot || 0;
    const coinsPoints = this.goCoinsSnapshot || 0;
    const jewelsPoints = this.goJewelsSnapshot || 0;
    const levelPoints = (this.goLevelSnapshot || 0) * 30;
    const lifePoints = Math.max(0, this.goLifeSnapshot || 0) * 500;

    const tl = gsap.timeline();
    this._goTallyTimeline = tl;

    tl.to({}, { duration: 1 });

    const barObj = { w: 0 };
    const timeObj = { val: 0 };

    tl.to(barObj, {
      w: targetWidth,
      duration: 2,
      ease: 'linear',
      onStart: () => {
        if (this.e && this.e.s && this.e.s.p) {
          this._goTallyInterval = setInterval(() => {
            this.e.s.p('tallyRight');
          }, 300);
        }
      },
      onUpdate: () => {
        if (barFill) barFill.style.width = `${barObj.w}px`;
      },
      onComplete: () => {
        if (this._goTallyInterval) {
          clearInterval(this._goTallyInterval);
          this._goTallyInterval = null;
        }
      },
    });

    tl.to(timeObj, {
      val: survivalSeconds,
      duration: 2,
      ease: 'linear',
      onUpdate: () => {
        if (!goTimeEl) return;
        const v = Math.floor(timeObj.val);
        const mins = Math.floor(v / 60);
        const secs = v - mins * 60;
        const secsStr = secs.toString().padStart(2, '0');
        goTimeEl.textContent = `${mins}:${secsStr} / 10:00`;
      },
    }, '<');

    tl.to({}, { duration: 1 });

    tl.add(() => {
      if (goKillsEl) goKillsEl.textContent = killsPoints.toString();
      if (this.e && this.e.s && this.e.s.p) this.e.s.p('tallyRight');
    });

    tl.to({}, { duration: 1 });
    tl.add(() => {
      if (goCoinsEl) goCoinsEl.textContent = coinsPoints.toString();
      if (this.e && this.e.s && this.e.s.p) this.e.s.p('tallyRight');
    });

    tl.to({}, { duration: 1 });
    tl.add(() => {
      if (goJewelsEl) goJewelsEl.textContent = jewelsPoints.toString();
      if (this.e && this.e.s && this.e.s.p) this.e.s.p('tallyRight');
    });

    tl.to({}, { duration: 1 });
    tl.add(() => {
      if (goLevelsEl) goLevelsEl.textContent = levelPoints.toString();
      if (this.e && this.e.s && this.e.s.p) this.e.s.p('tallyRight');
    });

    tl.to({}, { duration: 1 });
    tl.add(() => {
      if (goLifeEl) goLifeEl.textContent = lifePoints.toString();
      if (this.e && this.e.s && this.e.s.p) this.e.s.p('tallyRight');
    });

    tl.to({}, { duration: 1 });
    tl.add(() => {
      const goScoreEl = document.getElementById('go_score');
      if (goScoreEl) {
        goScoreEl.textContent = (this.goScoreSnapshot || 0).toString();
        gsap.set(goScoreEl, { opacity: 0 });
      }
      this.showGameOverNextButton();
    });
  }

  showGameOverScreen() {
    const goDiv = document.getElementById('gameOverDiv');
    if (!goDiv) return;
    this.fadeInGameOverDiv(goDiv);
    this.runGameOverTally();
  }

  setupButtonListeners() {
    // Setup play button listener
    const playButton = document.getElementById('playButton');
    if (playButton) {
      playButton.addEventListener('click', () => {
        if (this.e && this.e.s) this.e.s.p('click2');
        this.prepareNewRunFromMenu();
        this.snapCameraToPlayer();
        this.fadeOutStartScreen();
        this.action = "game start";
      });
    }

    // Setup instructions button listener
    const instructionsButton = document.getElementById('instructionsButton');
    if (instructionsButton && !instructionsButton.dataset.sceneBound) {
      instructionsButton.dataset.sceneBound = 'true';
      instructionsButton.addEventListener('click', () => {
        if (this.e && this.e.s) this.e.s.p('click2');
        this.action = 'instructions';
      });
    }

    const progressButton = document.getElementById('upgradeCounter');
    if (progressButton) {
      progressButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.e && this.e.s) this.e.s.p('click2');
        this.showProgressWindow();
      });
    }
  }

  useLandscapeInstructions() {
    return !!(this.e && typeof this.e.isMobileLandscape === 'function' && this.e.isMobileLandscape());
  }

  updateInstructionsImage() {
    this.updateInstructionsCloseButton();

    if (this.useLandscapeInstructions()) return;

    const img = document.getElementById('instructionsImage');
    if (!img) return;

    const isMobile = this.e && this.e.mobile === true;
    img.src = isMobile
      ? './src/img/splash/instructionsMobile.png'
      : './src/img/splash/instructionsDesktop.png';
  }

  updateInstructionsCloseButton() {
    const closeBtn = document.getElementById('closeInstructionsButton');
    if (!closeBtn) return;

    if (this.useLandscapeInstructions()) {
      closeBtn.textContent = 'X';
      closeBtn.setAttribute('aria-label', 'Close instructions');
    } else {
      closeBtn.textContent = 'NEXT';
      closeBtn.setAttribute('aria-label', 'View power-up list');
    }
  }

  // Instructions overlay methods
  showInstructions() {
    this.updateInstructionsImage();
    this.updateInstructionsCloseButton();
    this.instructionsVisible = true;
    // Find and show the instructions overlay
    const instructionsOverlay = document.getElementById('instructionsOverlay');
    if (instructionsOverlay) {
      instructionsOverlay.style.display = 'flex';
    }
  }

  hideInstructions() {
    this.instructionsVisible = false;
    const instructionsOverlay = document.getElementById('instructionsOverlay');
    if (instructionsOverlay) {
      instructionsOverlay.style.display = 'none';
    }
  }

  showPowerUpGuide() {
    this.hideInstructions();
    this.powerUpGuideVisible = true;
    this.action = 'powerUpGuide';
    this.populatePowerUpGuide();
    const guide = document.getElementById('powerUpGuideOverlay');
    if (guide) guide.style.display = 'flex';
  }

  hidePowerUpGuide() {
    this.powerUpGuideVisible = false;
    const guide = document.getElementById('powerUpGuideOverlay');
    if (guide) guide.style.display = 'none';
  }

  returnToMainMenuFromGuide() {
    this.hidePowerUpGuide();
    this.hideInstructions();
    this.gameStartInitialized = false;
    this.action = 'set';
  }

  populatePowerUpGuide() {
    if (this.e && this.e.ui && this.e.ui.populatePowerUpGuide) {
      this.e.ui.populatePowerUpGuide();
    }
  }

  bindPowerUpGuideScroll() {
    const scroll = document.getElementById('powerUpGuideScroll');
    if (!scroll || this._powerUpGuideScrollTouchBound) return;
    this._powerUpGuideScrollTouchBound = true;

    let dragging = false;
    let startY = 0;
    let startScrollTop = 0;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      dragging = true;
      startY = e.touches[0].clientY;
      startScrollTop = scroll.scrollTop;
    };

    const onTouchMove = (e) => {
      if (!dragging || e.touches.length !== 1) return;
      scroll.scrollTop = startScrollTop + (startY - e.touches[0].clientY);
      e.preventDefault();
      e.stopPropagation();
    };

    const onTouchEnd = () => {
      dragging = false;
    };

    scroll.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    scroll.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    scroll.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    scroll.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });
  }

  setupInstructionsButtons() {
    this.bindPowerUpGuideScroll();

    const closeBtn = document.getElementById('closeInstructionsButton');
    const guideBackBtn = document.getElementById('powerUpGuideBackButton');

    if (closeBtn && !this._closeInstructionsBound) {
      this._closeInstructionsBound = true;
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.e && this.e.s) this.e.s.p('click3');
        if (this.useLandscapeInstructions()) {
          this.returnToMainMenuFromGuide();
        } else {
          this.showPowerUpGuide();
        }
      });
    }

    if (guideBackBtn && !this._powerUpGuideBackBound) {
      this._powerUpGuideBackBound = true;
      guideBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.e && this.e.s) this.e.s.p('click3');
        this.returnToMainMenuFromGuide();
      });
    }
  }

  /** Mid-run quit → splash. Ends the active run once, then resets UI. */
  abandonActiveRunAndReturnToSplash() {
    this.abandonActiveRun();
    this.returnToSplashScreen();
  }

  syncCrazyGamesLevelContext(level) {
    const next = level ?? this.gameLev ?? 1;
    if (this._lastCrazyGamesLevelContext === next) {
      return;
    }
    this._lastCrazyGamesLevelContext = next;
    CrazyGamesAPI.setGameContext({ level: next });
  }

  beginDeathOutcome() {
    if (this.action === 'death start' || this.action === 'death' || this.action === 'death move' || this.action === 'death moving') {
      return;
    }
    CrazyGamesAPI.endRun('death');
    this.clearCrazyGamesRunContext();
    this.action = 'death start';
    this.syncPauseButtonChrome();
  }

  beginVictoryOutcome() {
    if (this.action === 'win start' || this.action === 'death' || this.action === 'death move') {
      return;
    }
    CrazyGamesAPI.endRun('victory');
    this.clearCrazyGamesRunContext();
    this.action = 'win start';
    this.syncPauseButtonChrome();
  }

  setupGameOverNextButton() {
    const btn = document.getElementById('gameOverNextButton');
    if (!btn || this._gameOverNextBound) return;
    this._gameOverNextBound = true;

    btn.addEventListener('click', () => {
      this.onGameOverNextPressed();
    });
  }

  async onGameOverNextPressed() {
    const btn = document.getElementById('gameOverNextButton');
    if (!btn || btn.style.pointerEvents === 'none') return;

    btn.style.pointerEvents = 'none';
    if (this.e && this.e.s) this.e.s.p('click3');

    await CrazyGamesAPI.requestMidgameAdBeforeProgression(this.e);

    this.dismissGameOverAndShowProgress();
  }

  dismissGameOverAndShowProgress() {
    const goDiv = document.getElementById('gameOverDiv');
    if (goDiv) {
      gsap.killTweensOf(goDiv);
      goDiv.style.display = 'none';
      goDiv.style.opacity = '0';
      goDiv.style.pointerEvents = 'none';
    }
    this.hideGameOverNextButton();
    this.clearGameOverTally();
    this.stopGameOverTopAnimation();
    this.progressFromGameOver = true;
    this.showProgressWindow();
  }

  // HTML Hearts helpers
  layoutTopGameplayHud() {
    const hearts = this.htmlHeartsContainer || document.getElementById('htmlHeartsContainer');
    if (!hearts) return;

    if (this.useLandscapeGameplayHud()) {
      hearts.style.top = '8px';
      return;
    }

    const scoreTime = document.getElementById('scoreTimeContainer');
    const back = document.getElementById('scoreTimeBack');
    if (!scoreTime) return;

    const barRect = back ? back.getBoundingClientRect() : scoreTime.getBoundingClientRect();
    const barHeight = barRect.height || back?.naturalHeight || 0;
    const scoreTop = parseFloat(window.getComputedStyle(scoreTime).top) || 12;
    hearts.style.top = `${Math.round(scoreTop + barHeight + 5)}px`;
  }

  bindTopGameplayHudLayout() {
    if (this._topHudLayoutBound) return;
    this._topHudLayoutBound = true;

    const back = document.getElementById('scoreTimeBack');
    const runLayout = () => this.layoutTopGameplayHud();

    if (back) {
      if (back.complete) {
        runLayout();
      } else {
        back.addEventListener('load', runLayout, { once: true });
      }
    } else {
      runLayout();
    }

    window.addEventListener('resize', runLayout);
  }

  initHtmlHearts(){
    this.htmlHeartsContainer = document.getElementById('htmlHeartsContainer');
    if(this.htmlHeartsContainer){
      this.ensureHtmlHeartSlots(this.maxLife || 4);
      this.updateHtmlHearts();
      this.syncBulletShieldCharges();
      this.bindTopGameplayHudLayout();
      this.layoutTopGameplayHud();
    }else{
      this.htmlHeartImgs = null;
    }
    this.setGameplayHudVisible(false);
  }

  ensureHtmlHeartSlots(slotCount) {
    if (!this.htmlHeartsContainer) return;
    const need = Math.max(4, slotCount || 4);
    let hearts = this.htmlHeartsContainer.querySelectorAll('.heart');
    while (hearts.length < need) {
      const img = document.createElement('img');
      img.src = './src/img/UI/heart.png';
      img.className = 'heart';
      img.alt = 'heart';
      this.htmlHeartsContainer.appendChild(img);
      hearts = this.htmlHeartsContainer.querySelectorAll('.heart');
    }
    this.htmlHeartImgs = hearts;
    this.layoutHtmlHeartsHud();
    this.layoutTopGameplayHud();
  }

  layoutHtmlHeartsHud() {
    if (!this.htmlHeartsContainer) return;

    const hearts = this.htmlHeartsContainer.querySelectorAll('.heart');
    for (let i = 0; i < hearts.length; i++) {
      this.htmlHeartsContainer.appendChild(hearts[i]);
    }

    if (this.bulletShieldChargeImgs) {
      for (let i = 0; i < this.bulletShieldChargeImgs.length; i++) {
        this.htmlHeartsContainer.appendChild(this.bulletShieldChargeImgs[i]);
      }
    }
  }

  setGameplayHudVisible(visible){
    const useLandscape = this.useLandscapeGameplayHud();
    const scoreTime = document.getElementById('scoreTimeContainer');
    const landscapeHud = document.getElementById('gameplayHudLandscape');
    const coinMeter = document.getElementById('coinLevelMeter');

    if (scoreTime) {
      scoreTime.style.display = visible && !useLandscape ? 'block' : 'none';
    }
    if (landscapeHud) {
      landscapeHud.style.display = visible && useLandscape ? 'block' : 'none';
      landscapeHud.setAttribute('aria-hidden', visible && useLandscape ? 'false' : 'true');
    }
    if (coinMeter) {
      coinMeter.style.display = visible && !useLandscape ? 'block' : 'none';
      coinMeter.setAttribute('aria-hidden', visible && !useLandscape ? 'false' : 'true');
    }
    const muteButton = document.getElementById('muteButton');
    if (muteButton) {
      muteButton.style.display = visible ? 'flex' : 'none';
    }
    this.syncPauseButtonChrome();
    this.setHtmlHeartsVisible(visible);
    if (visible) {
      this.layoutTopGameplayHud();
    }
  }

  updateCoinLevelMeter() {
    const fill = document.getElementById('coinLevelMeterFill');
    if (!fill) return;
    const goal = Math.max(1, this.levCoinAmount || 1);
    const ratio = Math.min(1, Math.max(0, (this.coinAmount || 0) / goal));
    fill.style.width = `${ratio * 100}%`;
  }

  setHtmlHeartsVisible(visible){
    if(this.htmlHeartsContainer){
      this.htmlHeartsContainer.style.display = visible ? 'flex' : 'none';
    }
  }

  updateHtmlHearts(){
    if(!this.htmlHeartsContainer){ return; }
    const maxLife = this.maxLife || 4;
    this.ensureHtmlHeartSlots(maxLife);
    const life = Math.max(0, Math.min(maxLife, this.life || 0));
    for(let i=0; i<this.htmlHeartImgs.length; i++){
      const img = this.htmlHeartImgs[i];
      if(i >= maxLife){
        img.style.display = 'none';
        continue;
      }
      img.style.display = '';
      if(i < life){
        img.classList.remove('empty');
        img.src = './src/img/UI/heart.png';
      }else{
        img.classList.add('empty');
        img.src = './src/img/UI/heartEmpty.png';
      }
    }
  }

  isTextureDisplayReady(texture) {
    if (!texture) return false;
    const base = texture.baseTexture;
    if (!base) return false;
    if (base.valid === false) return false;
    if (base.resource && base.resource.valid === false) return false;
    const w = base.width || texture.width || 0;
    const h = base.height || texture.height || 0;
    return w > 0 && h > 0;
  }

  isRendererViewportReady() {
    const canvas = this.e?.ui?.uiCanvas;
    const renderer = this.e?.ui?.app?.renderer;
    if (!canvas || !renderer) return false;
    return (
      canvas.clientWidth > 0 &&
      canvas.clientHeight > 0 &&
      renderer.width > 0 &&
      renderer.height > 0
    );
  }

  isWorldGraphicsReady() {
    if (!this.sceneBuilt || !this.mainCont || !this.background) return false;
    if (!this.e?.ui?.isLoaded_UI) return false;
    if (!this.isRendererViewportReady()) return false;
    if (!this.isTextureDisplayReady(this.background.texture)) return false;
    if (!this.isTextureDisplayReady(this.e.ui.t_grass)) return false;
    return true;
  }

  buildScene(){
    if (this.sceneBuilt) return;

    Matter.Events.on(this.physEngine, 'collisionStart', function(event) {
    });

    this.mainCont = new PIXI.Container();
    this.mainCont.sortableChildren = true;
    this.e.ui.app.stage.addChild(this.mainCont);

    this.mainMask = new PIXI.Sprite(this.e.ui.white);
    this.mainMask.anchor.x = this.mainMask.anchor.y = 0.5;
    this.mainMask.position.x = 10;
    this.syncMainMaskSize();

    this.mainMask._zIndex = 1;
    this.mainCont.addChild(this.mainMask);

    this.mainCont.mask = this.mainMask;

    this.mainCont.scale.x = this.mainCont.scale.y = this.zoomScale;

    this.physicsDebugOverlay = new PIXI.Graphics();
    this.physicsDebugOverlay.zIndex = 900000;
    this.physicsDebugOverlay.visible = false;
    this.mainCont.addChild(this.physicsDebugOverlay);

    this.tester = new PIXI.Sprite(this.e.ui.white);
    this.tester.anchor.x = this.tester.anchor.y = .5;
    this.tester.position.x=10;
    this.tester.width=5;
    this.tester.height=5;
    // this.tester.alpha=0;
    this.tester._zIndex=1;
    // this.mainCont.addChild(this.tester);

    this.background = new PIXI.Sprite(this.e.ui.t_grass);
    this.background.anchor.x = this.background.anchor.y = .5;
    this.background._zIndex=0;
    this.mainCont.addChild(this.background);

    this.cloudLayer = new PIXI.Sprite(this.e.ui.t_cloudLayer);
    this.cloudLayer.anchor.x = this.cloudLayer.anchor.y = .5;
    this.cloudLayer.scale.x = this.cloudLayer.scale.y = 2;
    this.cloudLayer.zIndex=18000;
    this.cloudLayer.alpha=.03;
    this.mainCont.addChild(this.cloudLayer);

    this.trees = new PIXI.Sprite(this.e.ui.t_trees);
    this.trees.anchor.x = this.trees.anchor.y = .5;
    this.trees.zIndex=20000;
    this.trees.alpha=.8;
    this.mainCont.addChild(this.trees);

    this.playerCont = new PIXI.Container();
    this.playerCont.sortableChildren = true;
    this.mainCont.addChild(this.playerCont);

    this.playerCont.position.y = 0;

    this.test = new PIXI.Sprite(this.e.ui.white);
    this.test.anchor.x = this.test.anchor.y = .5;
    this.test.width=3;
    this.test.height=3;
    this.test.position.y=10;
    this.test._zIndex=11220;
    // this.playerCont.addChild(this.test);

    this.test = new PIXI.Sprite(this.e.ui.white);
    this.test.anchor.x = this.test.anchor.y = .5;
    this.test.width=3;
    this.test.height=3;
    this.test.position.y=-10;
    this.test._zIndex=11220;
    // this.playerCont.addChild(this.test);

    this.playerInnerCont = new PIXI.Container();
    this.playerInnerCont.sortableChildren = true;
    this.playerCont.addChild(this.playerInnerCont);

    this.zLevs.push(this.playerCont);

    // this.playerCont.position.x=100;
    // this.playerCont.position.y=100;

    this.player = new PIXI.Sprite(this.e.ui.t_stance_d1);
    this.player.anchor.x = this.player.anchor.y = .5;
    this.player.width=39;
    this.player.height=39;
    this.player._zIndex=20;
    this.playerInnerCont.addChild(this.player);
    this.e.ui.animatedSprites.push(this.player)

    this.player.ani = this.e.ui.stanceAni_d

    this.shad = new PIXI.Sprite(this.e.ui.t_shad);
    this.shad.anchor.x = this.shad.anchor.y = .5;
    this.shad.position.y = 16;
    this.shad.alpha = .5;
    this.shad._zIndex=1;
    this.playerInnerCont.addChild(this.shad);

    this.hand = new PIXI.Sprite(this.e.ui.t_arm);
    this.hand.anchor.x = 0;
    this.hand.anchor.y = .5;
    this.hand.alpha = 0;
    this.hand._zIndex=3;
    this.playerInnerCont.addChild(this.hand);

    this.hand2 = new PIXI.Sprite(this.e.ui.t_arm_1);
    this.hand2.anchor.x = 0;
    this.hand2.anchor.y = .5;
    this.hand2._zIndex=10;
    this.playerInnerCont.addChild(this.hand2);

    this.hand2.ani = this.e.ui.armAni;
    this.hand2.aniSpeed = .04;
    this.hand2.aniLoop = false;
    this.e.ui.animatedSprites.push(this.hand2)

    this.freezer2 = new PIXI.Sprite(this.e.ui.t_freezer);
    this.freezer2.anchor.x = .5;
    this.freezer2.anchor.y = .5;
    this.freezer2._zIndex = 2;
    this.freezer2.width = this.freezer2.height = 0
    this.freezer2.alpha = 0;
    this.playerInnerCont.addChild(this.freezer2);

    this.snowCont = new PIXI.Container();
    this.snowCont.sortableChildren = true;
    this.playerInnerCont.addChild(this.snowCont);

    this.snowCont.zIndex = 2111;

    for(var i=0; i<35; i++){

      this.snowInnerCont = new PIXI.Container();
      this.snowInnerCont.sortableChildren = true;
      this.snowCont.addChild(this.snowInnerCont);

      this.snowInnerCont.rotation = this.e.u.ca(this.e.u.ran(360));

      this.snow = new PIXI.Sprite(this.e.ui.t_freezer);
      this.snow.anchor.x = .5;
      this.snow.anchor.y = .5;
      this.snow._zIndex = 2111;
      this.snow.width = this.snow.height = this.e.u.ran(3)+2
      this.snow.alpha = 1;
      this.snow.position.y = this.e.u.ran(30)+10
      this.snowInnerCont.addChild(this.snow);

      this.snowInnerCont.rotSpeed = this.e.u.nran(9)
      if(this.snowInnerCont.rotSpeed===0){
        this.snowInnerCont.rotSpeed=5;
      }

      this.snowInnerCont.scale.x = this.snowInnerCont.scale.y = 0;

      this.snowFlakes.push(this.snowInnerCont);

    }


    this.freezerCont = new PIXI.Container();
    this.freezerCont.sortableChildren = true;
    this.mainCont.addChild(this.freezerCont);

    this.freezer = new PIXI.Sprite(this.e.ui.t_freezer);
    this.freezer.anchor.x = .5;
    this.freezer.anchor.y = .5;
    this.freezer._zIndex = 2;
    this.freezer.width = this.freezer.height = 140
    this.freezer.alpha = 0;
    this.freezer.position.y=15;
    this.playerInnerCont.addChild(this.freezer);

    this.freezerMask = new PIXI.Sprite(this.e.ui.t_freezer);
    this.freezerMask.anchor.x = .5;
    this.freezerMask.anchor.y = .5;
    this.freezerMask._zIndex = 3;
    this.freezerMask.width = this.freezerMask.height = 70
    this.freezerMask.position.y=15;
    // this.freezer.alpha = 0;
    this.playerInnerCont.addChild(this.freezerMask);

    this.freezer.mask = this.freezerMask;

    this.levShowText = new PIXI.Text('LEV: 21');
    this.levShowText.anchor.x = 0.5
    this.levShowText.position.y = -24;
    this.levShowText._zIndex = 215;
    this.levShowText.alpha = 0;
    this.levShowText.style = new PIXI.TextStyle({
        align: "center",
        lineHeight: 0,
        fill: 0xffffff,
        fontSize: 4,
        fontFamily: "Ambitsek"
    })
    this.levShowText.resolution = 3;
    this.playerInnerCont.addChild(this.levShowText);

    this.playerInnerCont.position.y = 0;


    //------------------------------------------------------------------------------------------------------------------------

    // for(var i=0; i<10; i++){
    //   for(var j=0; j<3; j++){

    //     this.testGlow = new PIXI.Sprite(this.e.ui.t_whiteGlow);
    //     this.testGlow.anchor.x = .5;
    //     this.testGlow.anchor.y = .5;
    //     this.testGlow._zIndex = 3222;
    //     this.testGlow.position.x=(300*i)-1200;
    //     this.testGlow.position.y=(300*j);
    //     this.testGlow.alpha = .5
    //     this.mainCont.addChild(this.testGlow);

    //     if(j===0){

    //       if(i===0){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.ADD_NPM;
    //       }else if(i===1){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.COLOR;
    //       }else if(i===2){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.COLOR_BURN;
    //       }else if(i===3){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.COLOR_DODGE;
    //       }else if(i===4){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DARKEN;
    //       }else if(i===5){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
    //       }else if(i===6){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DST_ATOP;
    //       }else if(i===7){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DST_IN;
    //       }else if(i===8){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DST_OUT;
    //       }else if(i===9){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.DST_OVER;
    //       }

    //     }else if(j===1){

    //       if(i===0){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.ERASE;
    //       }else if(i===1){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.EXCLUSION;
    //       }else if(i===2){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
    //       }else if(i===3){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.HUE;
    //       }else if(i===4){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.LIGHTEN;
    //       }else if(i===5){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.LUMINOSITY;
    //       }else if(i===6){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    //       }else if(i===7){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.OVERLAY;
    //       }else if(i===8){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SATURATION;
    //       }else if(i===9){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SCREEN;
    //       }

    //     }else if(j===2){

    //       if(i===0){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SCREEN_NPM;
    //       }else if(i===1){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;
    //       }else if(i===2){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SRC_ATOP;
    //       }else if(i===3){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SRC_IN;
    //       }else if(i===4){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SRC_OUT;
    //       }else if(i===5){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SRC_OVER;
    //       }else if(i===6){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.SUBTRACT;
    //       }else if(i===7){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.XOR;
    //       }else if(i===8){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.XOR;
    //       }else if(i===9){
    //         this.testGlow.blendMode = PIXI.BLEND_MODES.XOR;
    //       }

    //     }

    //   }
    // }

    //------------------------------------------------------------------------------------------------------------------------

    this.starConts = [];

    for(var i=0; i<3; i++){

      this.starCont = new PIXI.Container();
      this.starCont.sortableChildren = true;
      this.mainCont.addChild(this.starCont);

      this.starCont.rotation = this.e.u.ca(120*i);

      this.star = new PIXI.Sprite(this.e.ui.t_star);
      this.star.anchor.x = this.star.anchor.y = .5;
      this.star.position.y = 55;
      this.star.zIndex = 3010;
      this.starCont.addChild(this.star);

      if(i===2){

        this.star.ani = [this.e.ui.t_starBig1, this.e.ui.t_starBig2, this.e.ui.t_starBig3, this.e.ui.t_starBig2 ];

      }else{

        this.star.ani = [this.e.ui.t_star, this.e.ui.t_star2, this.e.ui.t_star3, this.e.ui.t_star2 ];

      }

      this.e.ui.animatedSprites.push(this.star);
      this.star.aniSpeed = .1;
      this.starCont.num = i;

      gsap.to( this.star.position, {y: 125, duration: 2, repeat: -1, yoyo: true, ease: "expo.inOut"});

      this.starCont.active = false;
      this.starCont.sprite = this.star;
      this.starConts.push(this.starCont);

      this.starCont.position.x = 10000;

    }

    //------------------------------------------------------------------------------------------------------------------------

    this.pointMarks = [];

    for(var i=0; i<50; i++){

      this.pm = new PIXI.Sprite(this.e.ui.t_fuse1);
      this.pm.anchor.x = this.shad.anchor.y = .5;
      this.pm.width = this.pm.height = 5;
      this.pm.zIndex=200000;
      this.pm.alpha = 0;
      this.mainCont.addChild(this.pm);

      this.pointMarks.push(this.pm);

    }

    //------------------------------------------------------------------------------------------------------------------------

    // placer

    this.placer = new PIXI.Sprite(this.e.ui.white);
    this.placer.anchor.x = this.placer.anchor.y = .5;
    this.placer.width=30;
    this.placer.height=10;
    this.placer._zIndex=3;
    this.placer.alpha = 0;
    this.mainCont.addChild(this.placer);

    //bushes

    this.totalBushes=200;
    this.bushes=[];

    for(var i=0; i<this.totalBushes/3; i++){

      var br = this.e.u.ran(3)

      if(br===0){
        this.bush = new PIXI.Sprite(this.e.ui.t_bush1);
        this.bush.ani = [this.e.ui.t_bushA, this.e.ui.t_bushB, this.e.ui.t_bushC, this.e.ui.t_bushB];
      }else if(br===1){
        this.bush = new PIXI.Sprite(this.e.ui.t_bush2);
        this.bush.ani = [this.e.ui.t_bush2A, this.e.ui.t_bush2B, this.e.ui.t_bush2C, this.e.ui.t_bush2B];
      }else{
        this.bush = new PIXI.Sprite(this.e.ui.t_bush3);
        this.bush.ani = [this.e.ui.t_bush3A, this.e.ui.t_bush3B, this.e.ui.t_bush3C, this.e.ui.t_bush3B];
      }

      this.e.ui.animatedSprites.push(this.bush);

      this.bush.type = "big";
      this.bush.anchor.x =  .5;
      this.bush.anchor.y = 1;

      this.mainCont.addChild(this.bush);

      this.zLevs.push(this.bush)

      var isOk = false;
      while(isOk == false){

        this.bush.position.x = this.e.u.nran(1175);
        this.bush.position.y = this.e.u.nran(1175);

        isOk=true;

        for(var j=0; j<this.bushes.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushes[j].position.x, this.bushes[j].position.y )<50){
            // console.log("not ok 1")
            isOk = false;
            j=10000;
          }

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, 0, 0 )<220){
            // console.log("not ok 2")
            isOk = false;
            j=10000;
          }

        }

      }

      if( Math.abs(this.bush.position.x)<100 || Math.abs(this.bush.position.y)<100 ){
        this.removeDiscardedWorldSprite(this.bush);
      }else{
      
        this.bushes.push(this.bush)

        this.bush.position.y+=this.bush.height;
        this.attachBushWalkBlocker(this.bush, "big");
  
      }

    }

    //------------------------------------------------------------------------------------------------------------------------

    this.bushesMed=[];

    for(var i=0; i<this.totalBushes/3; i++){

      var br = this.e.u.ran(3)

      if(br===0){
        this.bush = new PIXI.Sprite(this.e.ui.t_bushMed);
        this.bush.ani = [this.e.ui.t_bushMedA, this.e.ui.t_bushMedB, this.e.ui.t_bushMedC, this.e.ui.t_bushMedB];
      }else if(br===1){
        this.bush = new PIXI.Sprite(this.e.ui.t_bushMed2);
        this.bush.ani = [this.e.ui.t_bushMed2A, this.e.ui.t_bushMed2B, this.e.ui.t_bushMed2C, this.e.ui.t_bushMed2B];
      }else{
        this.bush = new PIXI.Sprite(this.e.ui.t_bushMed3);
        this.bush.ani = [this.e.ui.t_bushMed3A, this.e.ui.t_bushMed3B, this.e.ui.t_bushMed3C, this.e.ui.t_bushMed3B];
      }

      this.e.ui.animatedSprites.push(this.bush);

      this.bush.type = "med";
      this.bush.anchor.x = .5;
      this.bush.anchor.y = 1;

      this.bush._zIndex=2;
      this.mainCont.addChild(this.bush);

      this.zLevs.push(this.bush)

      var isOk = false;
      while(isOk == false){

        this.bush.position.x = this.e.u.nran(1175);
        this.bush.position.y = this.e.u.nran(1175);

        isOk=true;

        for(var j=0; j<this.bushes.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushes[j].position.x, this.bushes[j].position.y )<50){
            isOk = false;
          }

        }

        for(var j=0; j<this.bushesMed.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushesMed[j].position.x, this.bushesMed[j].position.y )<33){
            isOk = false;
          }

        }

        if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, 0, 0 )<150){
          isOk = false;
        }

      }

      if( Math.abs(this.bush.position.x)<100 || Math.abs(this.bush.position.y)<100 ){
        this.removeDiscardedWorldSprite(this.bush);
      }else{
        
        this.bushesMed.push(this.bush)

        this.bush.position.y+=this.bush.height;
        this.attachBushWalkBlocker(this.bush, "med");

      }

    }

    //------------------------------------------------------------------------------------------------------------------------

    this.bushesSmall=[];
    this.scatterProps = [];

    for(var i=0; i<100; i++){

      if(i<50){

        var br = this.e.u.ran(3)

        if(br===0){
          this.bush = new PIXI.Sprite(this.e.ui.t_bushSmall);
          this.bush.ani = [this.e.ui.t_bushSmallA, this.e.ui.t_bushSmallB, this.e.ui.t_bushSmallC, this.e.ui.t_bushSmallB];
        }else if(br===1){
          this.bush = new PIXI.Sprite(this.e.ui.t_bushSmall2);
          this.bush.ani = [this.e.ui.t_bushSmall2A, this.e.ui.t_bushSmall2B, this.e.ui.t_bushSmall2C, this.e.ui.t_bushSmall2B];
        }else{
          this.bush = new PIXI.Sprite(this.e.ui.t_bushSmall3);
          this.bush.ani = [this.e.ui.t_bushSmall3A, this.e.ui.t_bushSmall3B, this.e.ui.t_bushSmall3C, this.e.ui.t_bushSmall3B];
        }

        this.e.ui.animatedSprites.push(this.bush);

        this.bush.type = "small";
        this.bush.aniSpeed = .2;

      }else{

        var br = this.e.u.ran(12)

        if(br===0){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop1);
          this.bush.size = "big";
        }else if(br===1){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop2);
          this.bush.size = "big";
        }else if(br===2){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop3);
          this.bush.size = "big";
        }else if(br===3){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop4);
          this.bush.size = "small";
        }else if(br===4){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop5);
          this.bush.size = "small";
        }else if(br===5){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop6);
          this.bush.size = "big";
        }else if(br===6){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop7);
          this.bush.size = "small";
        }else if(br===7){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop8);
          this.bush.size = "small";
        }else if(br===8){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop9);
          this.bush.size = "small";
        }else if(br===9){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop10);
          this.bush.size = "small";
        }else if(br===10){
          this.bush = new PIXI.Sprite(this.e.ui.t_prop11);
          this.bush.size = "small";
        }else{
          this.bush = new PIXI.Sprite(this.e.ui.t_prop12);
          this.bush.size = "big";
        }

        this.bush.type = "prop";
        this.bush.propIndex = br;

      }


      this.bush.anchor.x = .5;
      this.bush.anchor.y = 1;

      this.bush._zIndex=2;
      this.mainCont.addChild(this.bush);

      this.zLevs.push(this.bush)

      var isOk = false;
      while(isOk == false){

        this.bush.position.x = this.e.u.nran(1175);
        this.bush.position.y = this.e.u.nran(1175);

        isOk=true;

        for(var j=0; j<this.bushes.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushes[j].position.x, this.bushes[j].position.y )<50){
            isOk = false;
          }

        }

        for(var j=0; j<this.bushesMed.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushesMed[j].position.x, this.bushesMed[j].position.y )<33){
            isOk = false;
          }

        }

        for(var j=0; j<this.bushesSmall.length; j++){

          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushesSmall[j].position.x, this.bushesSmall[j].position.y )<25){
            isOk = false;
          }

        }

        if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, 0, 0 )<150){
          isOk = false;
        }

      }

      if( Math.abs(this.bush.position.x)<100 || Math.abs(this.bush.position.y)<100 ){
        this.removeDiscardedWorldSprite(this.bush);
      }else{
          
        this.bushesSmall.push(this.bush)

        this.bush.position.y+=this.bush.height;

        if(this.bush.type==="prop"){
          this.makePropShadow(this.bush);
          this.attachScatterPropBlockers(this.bush);
          this.scatterProps.push(this.bush);
        }else{
          this.attachBushWalkBlocker(this.bush, "small");
        }

      }

    }

    for(var i=0; i<this.scatterProps.length; i++){
      const scatterProp = this.scatterProps[i];
      if(!scatterProp || scatterProp.physBodies && scatterProp.physBodies.length > 0) continue;
      this.attachScatterPropBlockers(scatterProp);
    }

    for(var i=0; i<this.bushes.length; i++){
      this.makeTinyBushes("big", this.bushes[i]);
    }
    for(var i=0; i<this.bushesMed.length; i++){
      this.makeTinyBushes("medium", this.bushesMed[i]);
    }
    for(var i=0; i<this.bushesSmall.length; i++){
      if(this.bushesSmall[i].type!=="prop"){
        this.makeTinyBushes("small", this.bushesSmall[i]);
      }
    }

    //------------------------------------------------------------------------------------------------------------------------

    this.score = 0;
    this.coinAmount = 0;
    this.masterSpeed = 1.4;
    this.powerUps = [];
    this.extraPowers = [];
    this.powerPick = 0;

    // power vars

    this.shotNumber = 1;
    this.magnetDistance = 60
    this.backwardsShotCue = 0;
    this.backwardsShot = false;
    this.splinter = false;
    this.fireBallCount = 0;
    this.fireBallShots = 0;
    this.freeze = 0;
    this.freezeCount = 0;
    this.lightning = 0;
    this.lightningCount = 0;
    this.bombs = 0;
    this.bombCount = 0;

    this.sceneBuilt = true;
    this.snapCameraToPlayer();
  }

  removeDiscardedWorldSprite(sprite) {
    if (!sprite) return;
    if (sprite.parent) {
      sprite.parent.removeChild(sprite);
    }
    const zi = this.zLevs.indexOf(sprite);
    if (zi >= 0) {
      this.zLevs.splice(zi, 1);
    }
    if (this.e && this.e.ui && this.e.ui.animatedSprites) {
      const ai = this.e.ui.animatedSprites.indexOf(sprite);
      if (ai >= 0) {
        this.e.ui.animatedSprites.splice(ai, 1);
      }
    }
  }

  addStaticWalkBlocker(body) {
    body.isStatic = true;
    if (body.isSensor !== true) {
      body.isSensor = false;
    }
    Matter.World.add(this.physEngine.world, [body]);
    return body;
  }

  setSpriteWalkBlockers(sprite, bodies, offsets) {
    sprite.physBodies = bodies;
    sprite.physBodyOffsets = offsets;
  }

  attachBaseSquareWalkBlocker(sprite, feetX, feetY, size, label) {
    const half = size * 0.5;
    const body = this.addStaticWalkBlocker(
      Matter.Bodies.rectangle(feetX, feetY - half, size, size, {
        isStatic: true,
        isSensor: false,
        label: label || "walk-blocker-base",
      })
    );
    this.setSpriteWalkBlockers(sprite, [body], [{ x: 0, y: -half }]);
    return body;
  }

  attachScatterPropBlockers(prop) {
    const px = prop.position.x;
    const py = prop.position.y;
    const w = Math.max(8, prop.width || 24);
    const size = prop.size === "big"
      ? Math.max(16, Math.min(24, w * 0.5))
      : Math.max(12, Math.min(18, w * 0.55));
    const idx = typeof prop.propIndex === "number" ? prop.propIndex : -1;
    this.attachBaseSquareWalkBlocker(prop, px, py, size, "scatter-prop-base-" + idx);
  }

  attachBushWalkBlocker(sprite, sizeLabel) {
    const w = Math.max(8, sprite.width || 24);
    let size;
    if (sizeLabel === "big") {
      size = Math.max(16, Math.min(22, w * 0.42));
    } else if (sizeLabel === "med") {
      size = Math.max(14, Math.min(20, w * 0.48));
    } else {
      size = Math.max(12, Math.min(16, w * 0.52));
    }
    this.attachBaseSquareWalkBlocker(
      sprite,
      sprite.position.x,
      sprite.position.y,
      size,
      "bush-" + sizeLabel + "-blocker"
    );
  }

  isWalkBlockerBody(body) {
    if (!body) return false;
    const label = body.label || "";
    return (
      label.indexOf("scatter-prop-base") === 0 ||
      label.indexOf("bush-") === 0
    );
  }

  isPointBlockedByWalkBodies(x, y) {
    if (!this.physEngine || !this.physEngine.world) return false;
    const allBodies = Matter.Composite.allBodies(this.physEngine.world);
    if (!allBodies || allBodies.length === 0) return false;
    const staticSolids = allBodies.filter(
      (b) =>
        b &&
        b !== this.playerPhys &&
        b.isStatic === true &&
        b.isSensor !== true &&
        this.isWalkBlockerBody(b)
    );
    if (staticSolids.length === 0) return false;
    const playerRadius = (this.playerPhys && typeof this.playerPhys.circleRadius === "number")
      ? this.playerPhys.circleRadius
      : 15;
    const probeBody = Matter.Bodies.circle(x, y, playerRadius, {
      isStatic: true,
      isSensor: true,
      label: "player-probe",
    });
    const hits = Matter.Query.collides(probeBody, staticSolids);
    return hits && hits.length > 0;
  }

  isPropWalkBlockerLabel(label) {
    return typeof label === "string" && label.indexOf("scatter-prop-base") === 0;
  }

  syncPhysicsDebugMode() {
    if (this.physicsDebugOverlay) {
      this.physicsDebugOverlay.visible = this.showPhysicsContainers === true;
    }
  }

  drawPhysicsDebugBody(body, lineWidth, fillColor, lineColor, fillAlpha, lineAlpha) {
    if (!body || !this.physicsDebugOverlay) return;

    this.physicsDebugOverlay.lineStyle(lineWidth, lineColor, lineAlpha);
    this.physicsDebugOverlay.beginFill(fillColor, fillAlpha);

    if (typeof body.circleRadius === "number" && body.circleRadius > 0) {
      this.physicsDebugOverlay.drawCircle(
        body.position.x,
        body.position.y,
        body.circleRadius
      );
    } else if (body.vertices && body.vertices.length > 0) {
      this.physicsDebugOverlay.moveTo(body.vertices[0].x, body.vertices[0].y);
      for (let v = 1; v < body.vertices.length; v++) {
        this.physicsDebugOverlay.lineTo(body.vertices[v].x, body.vertices[v].y);
      }
      this.physicsDebugOverlay.lineTo(body.vertices[0].x, body.vertices[0].y);
    }

    this.physicsDebugOverlay.endFill();
  }

  updatePhysicsDebugOverlay() {
    if (!this.physicsDebugOverlay) return;

    const shouldShow =
      this.showPhysicsContainers === true;
    if (!shouldShow) {
      this.physicsDebugOverlay.visible = false;
      return;
    }

    this.physicsDebugOverlay.visible = true;
    this.physicsDebugOverlay.clear();

    const worldScale = this.mainCont && this.mainCont.scale ? this.mainCont.scale.x : 1;
    const lineWidth = worldScale > 0 ? 1 / Math.abs(worldScale) : 1;

    const bodies = Matter.Composite.allBodies(this.physEngine.world);
    let propBlockerCount = 0;

    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (!body) continue;

      if (this.isEnemyPoolPhysBody(body)) {
        let fill = 0xff4444;
        let line = 0xffaaaa;
        if (body.isStatic === true && body.isSensor === true) {
          fill = 0x888888;
          line = 0xcccccc;
        } else if (body.isStatic === true) {
          fill = 0x00ccff;
          line = 0xaaeeff;
        }
        this.drawPhysicsDebugBody(body, lineWidth, fill, line, 0.3, 1);
        continue;
      }

      if (body.isStatic !== true || body.isSensor === true) continue;
      if (!this.isWalkBlockerBody(body)) continue;

      const isProp = this.isPropWalkBlockerLabel(body.label);
      if (isProp) propBlockerCount++;
      this.drawPhysicsDebugBody(
        body,
        lineWidth,
        isProp ? 0x00ff66 : 0xff9933,
        isProp ? 0xccffdd : 0xffddbb,
        isProp ? 0.35 : 0.2,
        1
      );
    }

    if (this.bushesSmall && this.bushesSmall.length > 0) {
      for (let i = 0; i < this.bushesSmall.length; i++) {
        const prop = this.bushesSmall[i];
        if (!prop || prop.type !== "prop") continue;

        this.physicsDebugOverlay.lineStyle(lineWidth, 0xff00ff, 1);
        this.physicsDebugOverlay.beginFill(0xff00ff, 0.9);
        this.physicsDebugOverlay.drawCircle(prop.position.x, prop.position.y, 3);
        this.physicsDebugOverlay.endFill();

        if (prop.physBodies && prop.physBodies.length > 0) {
          for (let j = 0; j < prop.physBodies.length; j++) {
            const linkedBody = prop.physBodies[j];
            if (!linkedBody) continue;
            this.drawPhysicsDebugBody(
              linkedBody,
              lineWidth * 1.25,
              0x00ff66,
              0xffffff,
              0.2,
              1
            );
          }
        } else {
          this.physicsDebugOverlay.lineStyle(lineWidth * 1.5, 0xff2222, 1);
          this.physicsDebugOverlay.drawCircle(prop.position.x, prop.position.y - 8, 10);
        }
      }
    }

    this.physicsDebugOverlay.lineStyle(lineWidth, 0xffff00, 1);
    this.physicsDebugOverlay.beginFill(0xffff00, 0.95);
    this.physicsDebugOverlay.drawRect(8, 8, 14, 14);
    this.physicsDebugOverlay.endFill();

    if (this.playerCont) {
      this.physicsDebugOverlay.lineStyle(lineWidth, 0x66ccff, 0.9);
      this.physicsDebugOverlay.drawCircle(
        this.playerCont.position.x,
        this.playerCont.position.y,
        15
      );
    }

    this._propPhysicsDebugCount = propBlockerCount;
  }

  pruneInvalidPhysicsBodies() {
    if (!this.physEngine || !this.physEngine.world) return;
    const bodies = Matter.Composite.allBodies(this.physEngine.world);
    if (!bodies || bodies.length === 0) return;

    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (!body) continue;
      const p = body.position;
      const hasFinitePosition = p && Number.isFinite(p.x) && Number.isFinite(p.y);
      const hasUsableVertices =
        Array.isArray(body.vertices) &&
        body.vertices.length > 0 &&
        body.vertices.every((v) => v && Number.isFinite(v.x) && Number.isFinite(v.y));

      if (this.isEnemyPoolPhysBody(body)) continue;

      if (!hasFinitePosition || !hasUsableVertices) {
        Matter.Composite.remove(this.physEngine.world, body, true);
      }
    }
  }

  isEnemyPoolPhysBody(body) {
    const label = body && body.label;
    return typeof label === 'string' && label.indexOf('enemy-pool-') === 0;
  }

  makePropShadow(bush){

    if(bush.size==="big"){
      this.bushShad = new PIXI.Sprite(this.e.ui.t_propShadowBig);
    }else{
      this.bushShad = new PIXI.Sprite(this.e.ui.t_propShadowSmall);
    }

    this.bushShad.anchor.x = 0;
    this.bushShad.anchor.y = 1;
    this.bushShad.scale.x = this.bushShad.scale.y = 1;
    this.bushShad.position.x = bush.position.x-12+1;
    this.bushShad.position.y = bush.position.y-1;
    this.bushShad.zIndex=40;
    this.mainCont.addChild(this.bushShad);

  }

  makeTinyBushes(size, refBush){

    if(size==="big"){
      var numBushes = this.e.u.ran(6)+5
      var bushMinDist = 40;
    }else if(size==="medium"){
      var numBushes = this.e.u.ran(4)+4
      var bushMinDist = 33;
    }else if(size==="small"){
      var numBushes = this.e.u.ran(2)+3
      var bushMinDist = 24;
    }

    for(var i=0; i<numBushes; i++){

      var bran = this.e.u.ran(3);
      if(bran===0){
        this.bush = new PIXI.Sprite(this.e.ui.t_tinyBush1);
      }else if(bran===1){
        this.bush = new PIXI.Sprite(this.e.ui.t_tinyBush2);
      }else if(bran===2){
        this.bush = new PIXI.Sprite(this.e.ui.t_tinyBush3);
      }

      this.bush.anchor.x = .5
      this.bush.anchor.y = 1;
      // this.bush.anchor.y = 1;

      this.placer.rotation = this.e.u.ca(this.e.u.ran(360));
      this.bushDist = bushMinDist+this.e.u.ran(20);
      // this.bushDist = bushMinDist;

      this.bush.position.x = refBush.position.x + (this.bushDist * Math.cos(this.placer.rotation));
      this.bush.position.y = refBush.position.y - refBush.height/2 + (this.bushDist * Math.sin(this.placer.rotation) +10);
      // this.bush.position.y = refBush.position.y + (this.bushDist * Math.sin(this.placer.rotation)) - (refBush.height/2) +10;

      var isOk=true;

      for(var j=0; j<this.bushes.length; j++){

        if(this.bushes[j]!==refBush){
          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushes[j].position.x, this.bushes[j].position.y )<45){
            isOk = false;
          }
        }

      }

      for(var j=0; j<this.bushesMed.length; j++){

        if(this.bushesMed[j]!==refBush){
          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushesMed[j].position.x, this.bushesMed[j].position.y )<30){
            isOk = false;
          }
        }

      }

      for(var j=0; j<this.bushesSmall.length; j++){

        if(this.bushesSmall[j]!==refBush){
          if(this.e.u.getDistance(this.bush.position.x, this.bush.position.y, this.bushesSmall[j].position.x, this.bushesSmall[j].position.y )<20){
            isOk = false;
          }
        }

      }

      if(isOk===true){
        this.mainCont.addChild(this.bush);
        this.zLevs.push(this.bush);
      }

    }

  }

  syncPauseButtonChrome() {
    const pauseButton = document.getElementById('pauseButton');
    if (!pauseButton) return;
    const show = this.action === 'game';
    pauseButton.style.display = show ? 'flex' : 'none';
    pauseButton.classList.toggle('is-paused', !!this.pause);
    pauseButton.setAttribute('aria-label', this.pause ? 'Resume game' : 'Pause game');
  }

  togglePause() {
    if (this.action !== "game") return;
    this.pause = !this.pause;
    if (this.pause) {
      gsap.globalTimeline.pause();
      if (this.e?.input) {
        this.e.input.stickMoveX2 = undefined;
        this.e.input.stickMoveY2 = undefined;
      }
    } else {
      gsap.globalTimeline.resume();
    }
    this.syncPauseButtonChrome();
  }

  handleWebDocumentPause(hidden) {
    if (CrazyGamesAPI.isAdAudioActive()) {
      return;
    }

    if (hidden) {
      if (this.action === 'game') {
        this._documentHidePausedGameplay = true;
        if (!this.pause) {
          this._documentHidePausedTimeline = true;
          gsap.globalTimeline.pause();
        }
      }
      if (this.e && this.e.muteState === false && this.e.setMuteStateRuntime) {
        this._documentHideMuted = true;
        this.e.setMuteStateRuntime(true);
      }
      return;
    }

    if (this._documentHideMuted && this.e?.setMuteStateRuntime) {
      this.e.setMuteStateRuntime(false);
      this._documentHideMuted = false;
    }

    if (this._documentHidePausedGameplay && this.action === 'game') {
      this._documentHidePausedGameplay = false;
      if (!this.pause && this._documentHidePausedTimeline) {
        gsap.globalTimeline.resume();
        this._documentHidePausedTimeline = false;
      } else if (this._documentHidePausedTimeline) {
        this._documentHidePausedTimeline = false;
      }
    }

    if (!hidden) {
      if (this.e?.schedulePostLoadRepaints) {
        this.e.schedulePostLoadRepaints();
      } else if (this.e?.syncViewportForDisplay) {
        this.e.syncViewportForDisplay();
      }
    }
  }

  update(){

    // console.log(this.action);

    this.ensurePixiDisplayHealthy();

    if (this.mainMask && this.playerCont) {
      this.mainMask.position.x = this.playerCont.position.x;
      this.mainMask.position.y = this.playerCont.position.y;
      this.syncMainMaskSize();
    }

    this.syncPhysicsDebugMode();
    this.updatePhysicsDebugOverlay();

    this.cloudLayer.position.x = this.playerCont.position.x*-.15
    this.cloudLayer.position.y = this.playerCont.position.y*-.15

    this.zLevSkip+=this.e.dt;
    if(this.zLevSkip>=.02){

      this.zLevSkip=0;

      this.zLevs2 = [];

      for(var i=0; i<this.zLevs.length; i++){

        const zItem = this.zLevs[i];
        if(zItem.position.x < 2000){

          zItem.zIndex = Math.round(zItem.position.y+1250);

          // this.zLevs[i].zDist = this.e.u.getDistance(this.playerCont.position.x, this.playerCont.position.y, this.zLevs[i].position.x, this.zLevs[i].position.y );
          // this.zLevs2.push(this.zLevs[i])

        }

      }

      // this.zLevs2.sort(function(a, b) {
      //   return a.zDist - b.zDist;
      // });

      // console.log("----------------------")

      // console.log(this.zLevs.length);

      // for(var i=0; i<30; i++){

      //   this.zLevs2[i].zIndex = Math.round(this.zLevs[i].position.y+1250);

      //   // console.log(this.zLevs2[i].zDist)

      // }


    }


    // console.log(this.playerCont.position.y)

    if(this.action==="set"){

      if (!this.splashRevealReady) {
        return;
      }

      this.action="cover";
      this.gameTime=0;

      if (this.e?.ui?.build && this.e.ui._pixiUiBuilt !== true) {
        this.e.ui.build();
      }

      this.pause=false;

      this.syncHtmlHudTime('0:00');
      this.syncHudScore(0);

    }else if(this.action==="cover"){

      this.hand2.alpha=0;
      this.snapCameraToPlayer();

    }else if(this.action==="instructions"){

      this.hand2.alpha=0;
      this.snapCameraToPlayer();
      this.showInstructions();

    }else if(this.action==="powerUpGuide"){

      this.hand2.alpha=0;
      this.snapCameraToPlayer();

    }else if(this.action==="game start"){

      if(this.gameStartInitialized !== true){
        this.gameStartInitialized = true;
        this.gameStartFixerCount = 0;
        this.musicLoopVolume = 0;
        this.introMusicRamp = false;
        this.introCount = 0;

        this.setGameplayHudVisible(false);
        this.snapCameraToPlayer();
        this.prepareIntroText();
      }

      this.snapCameraToPlayer();
      this.updateIntroTextPosition();
      this.introCount += this.e.dt;
      if(this.introCount >= 2){
        this.action = "intro line 1";
      }

    }else if(this.action==="intro line 1"){

      this.snapCameraToPlayer();
      this.updateIntroTextPosition();

      if(this.introLine1Started !== true){
        this.introLine1Started = true;
        this.beginIntroLine1();
      }

      if(this.introLineReady === true){
        this.introCount += this.e.dt;
        if(this.introCount >= (this.introLineLinger || 3.5)){
          this.hideIntroLine(this.introLine1);
          this.introLineReady = false;
          this.introCount = 0;
          this.action = "intro line 2";
        }
      }

    }else if(this.action==="intro line 2"){

      this.snapCameraToPlayer();
      this.updateIntroTextPosition();

      if(this.introLine2Started !== true){
        this.introLine2Started = true;
        this.beginIntroLine2();
      }

      if(this.introLineReady === true){
        this.introCount += this.e.dt;
        if(this.introCount >= (this.introLineLinger || 3.5)){
          this.finishIntroSequence();
          this.action = "game";
          this.syncPauseButtonChrome();
          this._crazyGamesContextCleared = false;
          CrazyGamesAPI.startRun();
          this.syncCrazyGamesLevelContext(this.gameLev || 1);
        }
      }

    }else if(this.action==="game"){

      if(this.life<=0){
        this.beginDeathOutcome();
      }

      // keep HTML hearts in sync with current life
      this.updateHtmlHearts();

      this.gameStartFixerCount+=this.e.dt;
      if(this.gameStartFixerCount>2){

        this.gameStartFixerCount=0;
        this.e.ui.instructions.alpha=0;
        this.e.ui.instructions2.alpha=0;

      }

      if(this.e.gameStartSound===true){

        this.e.s.p("select");
        this.e.gameStartSound=false;

      }

      if(this.introMusicRamp === true && this.e.muteState===false){
        this.musicLoopVolume += this.e.dt * 0.5;
        if(this.musicLoopVolume >= 1){
          this.musicLoopVolume = 1;
          this.introMusicRamp = false;
        }
      }else if(this.musicLoopVolume < 1 && this.e.muteState===false){
        this.musicLoopVolume += this.e.dt*.4;
      }

      if(this.e.muteState===true){
        this.musicLoopVolume=0;
      }

      this.e.s.musicLoop.volume(this.musicLoopVolume);
      // console.log('Music volume:', this.musicLoopVolume, 'muteState:', this.e.muteState)

      this.hand2.alpha=1;

      // console.log(this.mainCont.position.x+" / "+this.mainCont.position.y)

      // console.log(this.action);

      this.gameTime += this.e.dt;
      if (this.gameTime > this.gameDurationSeconds) {
        this.gameTime = this.gameDurationSeconds;
      }

      if(this.gameTime >= this.gameDurationSeconds){
        this.hasWon=true;
        this.e.ui.winText.alpha=1;
        if(this.wonCount===0){
          for(var i=0; i<this.enemies.length; i++){
            this.enemies[i].life=0;
          }
          this.e.s.p("winSound");
        }
        this.wonCount+=this.e.dt;
        if(this.wonCount>3){
          this.beginVictoryOutcome();
          this.e.s.p("winMusic");
        }
      }

      if(this.pause===false){

        var lerpx = Math.round(window.innerWidth/2) + (this.playerCont.position.x*-this.zoomScale);
        var lerpy = Math.round(window.innerHeight/2) + (this.playerCont.position.y*-this.zoomScale)-(this.playerInnerCont.position.y);

        this.mainCont.position.x = this.e.u.lerp(this.mainCont.position.x, lerpx, .1)
        this.mainCont.position.y = this.e.u.lerp(this.mainCont.position.y, lerpy, .1)

        this.updateLevelCoinGoal();

        this.mf = .3 * this.masterSpeed; // creation rate - lower for more difficulty
        this.sf = .5 * this.masterSpeed; // speed - higher for more difficulty

        var lt = this.levelTierSeconds;


        if(this.gameTime<lt*1){

          this.enemyLim=.7*this.mf;
          this.enemySpeed=.000025*this.sf;
          this.enemyLife=10;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=2;
          this.gameLev=1;
          this.enBulSpeed=50;
          this.enBulLim=3;
          this.maxEnemies=20;


        }else if(this.gameTime<lt*2){

          this.enemyLim=.65*this.mf;
          this.enemySpeed=.000030*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=3;
          this.gameLev=2;
          this.enBulSpeed=70;
          this.enBulLim=3;
          this.maxEnemies=25;

        }else if(this.gameTime<lt*3){

          this.enemyLim=.575*this.mf;
          this.enemySpeed=.000035*this.sf;
          this.enemyMinLevel=2;
          this.enemyMaxLevel=3;
          this.gameLev=3;
          this.enBulSpeed=80;
          this.enBulLim=3;
          this.maxEnemies=30;

          // ----- 1 MINUTE ------------------------------------------------------------

        }else if(this.gameTime<lt*4){

          this.enemyLim=.4*this.mf;
          this.enemySpeed=.00004*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=4;
          this.gameLev=4;
          this.enBulSpeed=90;
          this.enBulLim=2.75;
          this.maxEnemies=35;

        }else if(this.gameTime<lt*5){

          this.enemyLim=.35*this.mf;
          this.enemySpeed=.000045*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=4;
          this.gameLev=5;
          this.enBulSpeed=100;
          this.enBulLim=2.5;
          this.maxEnemies=40;

        }else if(this.gameTime<lt*6){

          this.enemyLim=.3*this.mf;
          this.enemySpeed=.00005*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=5;
          this.gameLev=6;
          this.enBulSpeed=110;
          this.enBulLim=2.25;
          this.maxEnemies=50;

          // ----- 2 MINUTE ------------------------------------------------------------

        }else if(this.gameTime<lt*7){

          this.enemyLim=.275*this.mf;
          this.enemySpeed=.00006*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=5;
          this.gameLev=7;
          this.enBulSpeed=120;
          this.enBulLim=2;
          this.maxEnemies=60;

        }else if(this.gameTime<lt*8){

          this.enemyLim=.25*this.mf;
          this.enemySpeed=.00007*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=8;
          this.enBulSpeed=130;
          this.enBulLim=1.75;
          this.maxEnemies=70;

        }else if(this.gameTime<lt*9){

          this.enemyLim=.225*this.mf;
          this.enemySpeed=.000075*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=9;
          this.enBulSpeed=140;
          this.enBulLim=1.5;
          this.maxEnemies=80;

          // ----- 3 MINUTE ------------------------------------------------------------

        }else if(this.gameTime<lt*10){

          this.enemyLim=.2*this.mf;
          this.enemySpeed=.0000775*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=10;
          this.enBulSpeed=150;
          this.enBulLim=1.25;
          this.maxEnemies=90;

        }else if(this.gameTime<lt*11){

          this.enemyLim=.175*this.mf;
          this.enemySpeed=.00008*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=11;
          this.enBulSpeed=160;
          this.enBulLim=1;
          this.maxEnemies=100;

        }else if(this.gameTime<lt*12){

          this.enemyLim=.165*this.mf;
          this.enemySpeed=.000085*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=12;
          this.enBulSpeed=170;
          this.enBulLim=1;
          this.maxEnemies=110;

          // ----- 4 MINUTE ------------------------------------------------------------

        }else if(this.gameTime<lt*13){

          this.enemyLim=.15*this.mf;
          this.enemySpeed=.00009*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=13;
          this.enBulSpeed=180;
          this.enBulLim=1;
          this.maxEnemies=120;

        }else if(this.gameTime<lt*14){

          this.enemyLim=.125*this.mf;
          this.enemySpeed=.000095*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=14;
          this.enBulSpeed=190;
          this.enBulLim=1;
          this.maxEnemies=130;

        }else if(this.gameTime<lt*15){

          this.enemyLim=.125*this.mf;
          this.enemySpeed=.0001*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=15;
          this.enBulSpeed=200;
          this.enBulLim=1;
          this.maxEnemies=150;

          // ----- 5 MINUTE ------------------------------------------------------------

        }else if(this.gameTime<lt*16){

          this.enemyLim=.1*this.mf;
          this.enemySpeed=.0001*this.sf;
          this.enemyMinLevel=1;
          this.enemyMaxLevel=6;
          this.gameLev=16;
          this.enBulSpeed=210;
          this.enBulLim=1;

        }else if(this.gameTime >= lt * 16){

          const tierStart = lt * 16;
          let rampProgress = this.gameTime - tierStart;
          if (this.gameTime >= this.lateGameDifficultyStart) {
            rampProgress += (this.gameTime - this.lateGameDifficultyStart) * 0.6;
          }

          const extTier = Math.min(14, Math.floor(rampProgress / lt) + 1);
          let ramp = extTier / 14;
          if (this.gameTime >= this.lateGameDifficultyStart) {
            const lateRamp = Math.min(0.25, (this.gameTime - this.lateGameDifficultyStart) / 200);
            ramp = Math.min(1, ramp + lateRamp);
          }

          let lateMult = 1;
          if (this.gameTime >= this.lateGameDifficultyStart) {
            lateMult = 1 + Math.min(0.4, (this.gameTime - this.lateGameDifficultyStart) / 240);
          }

          let easeMult = 1;
          if (this.gameTime >= this.lateGameEaseStart) {
            const easeT = Math.min(1, (this.gameTime - this.lateGameEaseStart) / 150);
            easeMult = 1 - easeT * 0.22;
            lateMult = lateMult * (1 - easeT * 0.18);
          }

          this.gameLev = 16 + extTier;
          this.enemyMinLevel = 1;
          this.enemyMaxLevel = 6;
          this.enemyLim = ((.1 - ramp * 0.055) * this.mf) / lateMult / easeMult;
          this.enemySpeed = (.0001 + ramp * 0.000035) * this.sf * lateMult * easeMult;
          this.enBulSpeed = 210 + Math.round(ramp * 85 * easeMult);
          this.enBulLim = Math.min(1, Math.max(0.35, 1 - ramp * 0.5) + (1 - easeMult) * 0.15);
          this.maxEnemies = Math.round((150 + ramp * 95 * lateMult) * easeMult);

        }


        this.level = this.gameLev;
        if(this.saveLevel!==this.gameLev && this.gameLev<=30){

          // console.log("level up")

          this.levShowText.text = "Lev: "+this.gameLev;

          this.levShowText.alpha = 0;
          this.levShowText.position.y=-18;
          gsap.to(  this.levShowText, {alpha: 1,  duration: .5, ease: "sine.out"});
          gsap.to(  this.levShowText.position, {y: -25,  duration: .5, ease: "sine.out"});

          this.showLevCount = 3.5;
          this.e.s.p("howlSoft")

          this.resetLevelCounters();

        }
        this.saveLevel=this.gameLev;
        this.syncCrazyGamesLevelContext(this.gameLev);

        this.showLevCount-=this.e.dt;
        if(this.showLevCount<=0 && this.levShowText.alpha===1){
          this.showLevCount=0;
          gsap.to(  this.levShowText, {alpha: 0,  duration: 2, ease: "linear"});
        }

        this.enBulSpeed=100;

        this.controls();
        this.enemyControls();
        this.coinControls();
        this.bushControls();
        this.boneControl();

        this.enemyBulletControls()

        this.starControls();

        // Update HTML score display
        this.syncHudScore(this.score);
        
        this.e.ui.scoreText.text = this.score+"";

        this.pruneInvalidPhysicsBodies();
        Matter.Engine.update(this.physEngine, this.e.dt*1000);

        //-----------------------------------------------------------------------------------------------------------------------

        if(this.gameLev>30){
          this.gameLev=30;
        }

        this.myTime = this.formatElapsedTime(this.gameTime);

        this.e.ui.timeText.text = this.myTime;

        this.syncHtmlHudTime(this.myTime);
        
        this.e.ui.levText.text = this.gameLev;
        this.e.ui.leftRedBar.width = 50 + ((110/15)*this.gameLev);

        //right UI

        this.e.ui.coinText.text = this.coinAmount;
        this.lp = this.coinAmount/this.levCoinAmount;
        this.e.ui.rightRedBar.width = 55 + (110*this.lp);
        this.updateCoinLevelMeter();

        if(this.e.ui.rightRedBar.width>165){
          this.e.ui.rightRedBar.width=165;
        }

        //-----------------------------------------------------------------------------------------------------------------------

      }

    }else if(this.action==="power up start"){

      this.e.s.p("powerUp")

      this.action="power up coin show"

    }else if(this.action==="power up coin show"){

      // Hide legacy coins collected/countdown UI
      if (this.e.ui.coinsCollectedText) {
        this.e.ui.coinsCollectedText.visible = false;
        this.e.ui.coinsCollectedText.alpha = 0;
      }
      if (this.e.ui.coinCountDown) {
        this.e.ui.coinCountDown.visible = false;
        this.e.ui.coinCountDown.alpha = 0;
      }

      // Keep fader behavior, but skip legacy UI animations
      gsap.to(  this.e.ui.faderBlack, {alpha: .7,  duration: .25, ease: "linear"});

      this.count=0;
      this.action = "coin show wait";

    }else if(this.action==="coin show wait"){

      this.weaponWaitCount+=this.e.dt;

      this.count+=this.e.dt;
      if(this.count>.25){

        this.action = "power up menu"
        this.count=0;

      }

    }else if(this.action==="power up menu"){

      this.e.s.p("select")

      gsap.globalTimeline.pause();

      // pause enemy movement only — do not toggle static (breaks thaw after freeze)
      for (var i = 0; i < this.enemies.length; i++) {
        const enPause = this.enemies[i];
        if (!enPause || !enPause.phys || enPause.action !== "attacking") continue;
        Matter.Body.setVelocity(enPause.phys, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(enPause.phys, 0);
      }

      this.clearEnemiesNearPlayer(100);

      //-------------------------------------------

      this.e.ui.showPowerUpContainer();
      this.updatePowerUpMenuCompletionStats();

      this.allPowerUps2 = this.buildPowerUpChoicePool();
      this.currentPowers = this.pickPowerUpMenuOptions(this.allPowerUps2);
      this.e.ui.updatePowerUpIcons(this.currentPowers);

      // gsap.globalTimeline.pause();

      // this.e.s.p("powerUp")

      this.count=0;
      this.action="power up wait"

    }else if(this.action==="power up wait"){

      this.weaponWaitCount+=this.e.dt;

      // wait for click

    }else if(this.action==="power up out"){

      this.e.ui.coinsCollectedText.alpha = 0;
      this.e.ui.coinCountDown.alpha = 0;

      gsap.globalTimeline.resume();

      gsap.to(  this.e.ui.faderBlack, {alpha: 0,  duration: .25, ease: "linear"});
      // make a list of power ups

      const pickedPower = this.currentPowers[this.powerPick];

      if (pickedPower && pickedPower !== 'none') {
        this.powerUps.push(pickedPower);

        for (var i = 0; i < this.allPowerUps.length; i++) {
          if (pickedPower === this.allPowerUps[i]) {
            this.allPowerUps.splice(i, 1);
            break;
          }
        }
      }

      //-----------------------------------------------------------

      // apply all power ups

      if(pickedPower === 'none' || pickedPower === undefined){

        // no upgrade this level

      }else if(pickedPower==="extraShot"){

        this.shotNumber=2;
        this.allPowerUps.push("extraShot2");
        this.addIcon("extraShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="extraShot2"){

        this.shotNumber=3;
        this.allPowerUps.push("extraShot3");
        this.addIcon("extraShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="extraShot3"){

        this.shotNumber=4;
        this.allPowerUps.push("extraShot4");
        this.addIcon("extraShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="extraShot4"){

        this.shotNumber=5;
        this.addIcon("extraShot");
        this.totalShotPowerUps+=1;

        //-----------------------------------------------------------

      }else if(pickedPower==="fasterShot"){

        this.shootLim=.3;
        this.allPowerUps.push("fasterShot2");
        this.addIcon("fasterShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="fasterShot2"){

        this.shootLim=.266;
        this.allPowerUps.push("fasterShot3");
        this.addIcon("fasterShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="fasterShot3"){

        this.shootLim=.233;
        this.allPowerUps.push("fasterShot4");
        this.addIcon("fasterShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="fasterShot4"){

        this.shootLim=.2;
        this.addIcon("fasterShot");
        this.totalShotPowerUps+=1;

        //-------------------------------------------------------

      }else if(pickedPower==="biggerShot"){

        this.bulletWidth=2;
        this.bulletDamage=13;
        this.allPowerUps.push("biggerShot2");
        this.addIcon("biggerShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="biggerShot2"){

        this.bulletWidth=3;
        this.bulletDamage=17;
        this.allPowerUps.push("biggerShot3");
        this.addIcon("biggerShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="biggerShot3"){

        this.bulletWidth=4;
        this.bulletDamage=22;
        this.allPowerUps.push("biggerShot4");
        this.addIcon("biggerShot");
        this.totalShotPowerUps+=1;

      }else if(pickedPower==="biggerShot4"){

        this.bulletWidth=5;
        this.bulletDamage=28;
        this.addIcon("biggerShot");
        this.totalShotPowerUps+=1;

        //-------------------------------------------------------

      }else if(pickedPower==="footSpeed"){

        this.playerSpeed=90;
        this.allPowerUps.push("footSpeed2");
        this.addIcon("footSpeed");

      }else if(pickedPower==="footSpeed2"){

        this.playerSpeed=120;
        this.addIcon("footSpeed");

        //-------------------------------------------------------

      }else if(pickedPower==="splinter"){

        this.splinter=true;
        this.addIcon("splinter");

      }else if(pickedPower==="backwardsShot"){

        this.backwardsShot=true;
        this.addIcon("backwardsShot");

        //-------------------------------------------------------

      }else if(pickedPower==="heal"){

        this.life+=1;
        this.allPowerUps.push("heal2");
        this.addIcon("heal");

        if(this.life>this.maxLife){
          this.life=this.maxLife;
        }

      }else if(pickedPower==="heal2"){

        this.life+=1;

        if(this.life>this.maxLife){
          this.life=this.maxLife;
        }

        //-------------------------------------------------------

      }else if(pickedPower==="magnet"){

        this.magnetDistance = 100;
        this.allPowerUps.push("magnet2");
        this.addIcon("magnet");

      }else if(pickedPower==="magnet2"){

        this.magnetDistance = 140;
        this.addIcon("magnet");

        //-------------------------------------------------------

      }else if(pickedPower==="ninjaStar"){

        this.starConts[0].active = true;
        this.allPowerUps.push("ninjaStar2");
        this.addIcon("ninjaStar");

      }else if(pickedPower==="ninjaStar2"){

        this.starConts[1].active = true;
        this.allPowerUps.push("ninjaStar3");
        this.addIcon("ninjaStar");

      }else if(pickedPower==="ninjaStar3"){

        this.starConts[2].active = true;
        this.addIcon("ninjaStar");

        //-------------------------------------------------------

      }else if(pickedPower==="fireballs"){

        this.fireBallShots=1;
        this.allPowerUps.push("fireballs2");
        this.addIcon("fireballs");

      }else if(pickedPower==="fireballs2"){

        this.fireBallShots=2;
        this.allPowerUps.push("fireballs3");
        this.addIcon("fireballs");

      }else if(pickedPower==="fireballs3"){

        this.fireBallShots=3;
        this.addIcon("fireballs");

        //-------------------------------------------------------

      }else if(pickedPower==="lightningStrike"){

        this.lightning=1;
        this.allPowerUps.push("lightningStrike2");
        this.addIcon("lightningStrike");

      }else if(pickedPower==="lightningStrike2"){

        this.lightning=2;
        this.allPowerUps.push("lightningStrike3");
        this.addIcon("lightningStrike");

      }else if(pickedPower==="lightningStrike3"){

        this.lightning=3;
        this.addIcon("lightningStrike");

        //-------------------------------------------------------

      }else if(pickedPower==="bombs"){

        this.bombs=1;
        this.allPowerUps.push("bombs2");
        this.addIcon("bombs");

      }else if(pickedPower==="bombs2"){

        this.bombs=2;
        this.allPowerUps.push("bombs3");
        this.addIcon("bombs");

      }else if(pickedPower==="bombs3"){

        this.bombs=3;
        this.addIcon("bombs");

        //-------------------------------------------------------

      }else if(pickedPower==="freeze"){

        this.freeze=1;
        this.allPowerUps.push("freeze2");
        this.addIcon("freeze");

      }else if(pickedPower==="freeze2"){

        this.freeze=2;
        this.addIcon("freeze");

      }else if(pickedPower==="coinShot"){

        this.coinShotLevel = Math.max(this.coinShotLevel || 0, 1);
        this.allPowerUps.push("coinShot2");
        if (LocalState.store.getLevel('coinShot') <= 0) {
          this.addIcon("coinShot");
        }

      }else if(pickedPower==="coinShot2"){

        this.coinShotLevel = Math.max(this.coinShotLevel || 0, 2);
        this.allPowerUps.push("coinShot3");

      }else if(pickedPower==="coinShot3"){

        this.coinShotLevel = Math.max(this.coinShotLevel || 0, 3);

      }else if(pickedPower==="stealth"){

        this.stealthLevel = Math.max(this.stealthLevel || 0, 1);
        this.allPowerUps.push("stealth2");
        this.addIcon("stealth");

      }else if(pickedPower==="stealth2"){

        this.stealthLevel = Math.max(this.stealthLevel || 0, 2);

      }else if(pickedPower==="bulletShield"){

        this.bulletShieldLevel = Math.max(this.bulletShieldLevel || 0, 1);
        this.bulletPreventionCharges += 1;
        this.allPowerUps.push("bulletShield2");
        this.syncBulletShieldCharges();
        if (LocalState.store.getLevel('bulletShield') <= 0) {
          this.addIcon("bulletShield");
        }

      }else if(pickedPower==="bulletShield2"){

        this.bulletShieldLevel = Math.max(this.bulletShieldLevel || 0, 2);
        this.bulletPreventionCharges += 2;
        this.syncBulletShieldCharges();

      }else if(pickedPower==="jewelKill"){

        this.jewelKillLevel = Math.max(this.jewelKillLevel || 0, 1);
        this.allPowerUps.push("jewelKill2");
        if (LocalState.store.getLevel('jewelShot') <= 0) {
          this.addIcon("jewelKill");
        }

      }else if(pickedPower==="jewelKill2"){

        this.jewelKillLevel = Math.max(this.jewelKillLevel || 0, 2);
        this.allPowerUps.push("jewelKill3");

      }else if(pickedPower==="jewelKill3"){

        this.jewelKillLevel = Math.max(this.jewelKillLevel || 0, 3);

      }

      //------------------------------------------

      // make enemies work again

      for (var i = 0; i < this.enemies.length; i++) {
        const enWake = this.enemies[i];
        if (enWake && enWake.phys && enWake.action !== "ready") {
          this.wakeEnemyPhys(enWake);
        }
      }

      //------------------------------------------

      // hide the power buttons - HTML power-up container handles this automatically
      // for(var i=0; i<this.e.ui.powerButs.length; i++){
      //   var b = this.e.ui.powerButs[i];
      //   b.interactive = false;
      //   b.buttonMode = false;
      // }

      this.e.ui.hidePowerUpContainer();
      this.setGameplayHudVisible(true);

      //------------------------------------------

      this.playerLevel+=1;

      // console.log(this.playerLevel)

      this.coinAmount = 0;
      this.action="game";
      this.syncPauseButtonChrome();
      this.syncCrazyGamesLevelContext(this.gameLev || 1);

    }else if(this.action==="win start"){

      const stealthElWin = document.getElementById('stealthText');
      if (stealthElWin) stealthElWin.style.display = 'none';
      const bulletShieldHudWin = document.getElementById('bulletShieldHud');
      if (bulletShieldHudWin) bulletShieldHudWin.style.display = 'none';

      this.countFPS=false;
      this.setHtmlHeartsVisible(false);

      // this.e.s.p("deathSong")
      this.musicLoopVolume = 0;
      this.e.s.musicLoop.volume(this.musicLoopVolume);

      this.beginPlayerDeathSequence(true);

      this.count=0;
      this.action="death"

      // console.log("add score win")
      // this.score+=this.life*100;
      // this.winBonus=this.life*100;

      // Ensure final bonuses are included before game over
      if(!this.finalScoreApplied){
        this.lifeBonus = this.life * 500;
        this.gameLevBonus = this.gameLev * 30;
        this.score += Math.round(this.lifeBonus) + Math.round(this.gameLevBonus);
        this.finalScoreApplied = true;
      }

      this.snapshotGameOverStats();

    }else if(this.action==="death start"){

      const stealthElDeath = document.getElementById('stealthText');
      if (stealthElDeath) stealthElDeath.style.display = 'none';
      const bulletShieldHudDeath = document.getElementById('bulletShieldHud');
      if (bulletShieldHudDeath) bulletShieldHudDeath.style.display = 'none';

      this.countFPS=false;
      this.setHtmlHeartsVisible(false);

      this.e.s.p("deathSong")
      this.musicLoopVolume = 0;
      this.e.s.musicLoop.volume(this.musicLoopVolume);

      this.beginPlayerDeathSequence(false);

      this.count=0;
      this.action="death"

      // Ensure final bonuses are included before game over
      if(!this.finalScoreApplied){
        this.lifeBonus = this.life * 500;
        this.gameLevBonus = this.gameLev * 30;
        this.score += Math.round(this.lifeBonus) + Math.round(this.gameLevBonus);
        this.finalScoreApplied = true;
      }

      this.snapshotGameOverStats();

    }else if(this.action==="death"){

      this.count+=this.e.dt;
      if(this.count>6){

        this.count=0;
        if(this.hasWon===true){
          this.e.ui.playerDeath.aniLoop = true;
          this.e.ui.playerDeath.ani = this.e.ui.wonAni;
          this.e.ui.playerDeath.curFrame = 0;
          this.e.ui.playerDeath.aniCount = 0;
          if (this.e.ui.wonAni && this.e.ui.wonAni[0]) {
            this.e.ui.playerDeath.texture = this.e.ui.wonAni[0];
          }
        }else{
          this.e.ui.playerDeath.ani = this.e.ui.deathAni2;
          this.e.ui.playerDeath.curFrame = 0;
          this.e.ui.playerDeath.aniCount = 0;
          if (this.e.ui.deathAni2 && this.e.ui.deathAni2[0]) {
            this.e.ui.playerDeath.texture = this.e.ui.deathAni2[0];
          }
          this.e.s.p("hurt")
        }
        this.action="death move"
      }

    }else if(this.action==="death move"){

      const isMobileLandscape =
        this.e && typeof this.e.isMobileLandscape === 'function' && this.e.isMobileLandscape();

      if (isMobileLandscape) {
        this.mo = 0;
      } else if (this.e.mobile === true) {
        this.mo = 80;
      } else {
        this.mo = 0;
      }

      const deathOffsetTarget = isMobileLandscape ? 0 : 200 + this.mo;

      if(this.hasWon===true){
        gsap.to(  this.t, {deathOffset: deathOffsetTarget, duration: 2, delay: 1.5, ease: "sine.out"});
      }else{
        gsap.to(  this.t, {deathOffset: deathOffsetTarget, duration: 2, delay: 1.5, ease: "sine.out"});
      }

      this.count=0;
      this.action="death moving"

    }else if(this.action==="death moving"){

      // console.log(this.t.deathOffset)

      this.count+=this.e.dt;
      if(this.count>4){
        this.count=0;
        this.showGameOverScreen();
        this.action="new end";
      }

    }else if(this.action==="new end"){

      this.e.s.p("achievement1");

      this.lifeBonus = this.life * 500;
      this.gameLevBonus = this.gameLev * 30;

      this.action="new end wait";

    }

    if(this.e.ui.faderRed.alpha>0){
      this.e.ui.faderRed.alpha-=this.e.dt*.25;
    }

  }

  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------

  resetLevelCounters() {
    this.coinsFoundThisLevel = 0;
    this.enemiesKilledThisLevel = 0;
  }

  getJewelSpawnInterval(){

    const level = this.gameLev || 1;
    const tier = Math.floor((level - 1) / 5);
    let interval = 100 + tier * 50;

    return Math.max(1, interval);

  }

  isJewelPickupSpawn(count){

    const interval = this.getJewelSpawnInterval();
    return count > 0 && count % interval === 0;

  }

  ensureJewelHexPool(){

    if(this.jewelHexPool){ return; }

    this.jewelHexPool = [];

    for(var i=0; i<6; i++){
      const hex = new PIXI.Graphics();
      hex.action = "ready";
      hex.zIndex = 5000;
      hex.alpha = 0;
      this.mainCont.addChild(hex);
      this.jewelHexPool.push(hex);
    }

  }

  resetJewelHexPool() {
    if (!this.jewelHexPool) return;
    for (let i = 0; i < this.jewelHexPool.length; i++) {
      const hex = this.jewelHexPool[i];
      gsap.killTweensOf(hex);
      gsap.killTweensOf(hex.scale);
      hex.clear();
      hex.action = 'ready';
      hex.alpha = 0;
      hex.scale.x = hex.scale.y = 1;
    }
  }

  getJewelHexRadius(level) {
    const playerSize = this.player?.height || 39;
    const base = playerSize * 2;
    if (level >= 2) return base * 1.5;
    return base;
  }

  getJewelHexZoneDuration(level) {
    if (level >= 2) return 5;
    return 4;
  }

  buildJewelHexGraphic(hex, hexR) {
    hex.clear();
    hex.lineStyle(3, 0x01a2c4, 0.55);
    hex.beginFill(0x01a2c4, 0.35);

    const hexPoints = [];
    for (let hi = 0; hi < 6; hi++) {
      const ang = Math.PI / 2 + hi * (Math.PI / 3);
      hexPoints.push(hexR * Math.cos(ang), hexR * Math.sin(ang));
    }
    hex.drawPolygon(hexPoints);
    hex.endFill();
    hex.hexRadius = hexR;
  }

  isPointInJewelHex(hex, px, py) {
    const dx = px - hex.position.x;
    const dy = py - hex.position.y;
    const r = hex.hexRadius || this.getJewelHexRadius();
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absY > r) return false;
    if (absX > r * 0.866) return false;
    return r * 0.866 - absX >= absY * 0.577;
  }

  killEnemiesInJewelHex(hex) {
    if (!this.enemies || !hex) return;

    for (let i = 0; i < this.enemies.length; i++) {
      const en = this.enemies[i];
      if (!en || (en.action !== 'attacking' && en.action !== 'attack')) continue;

      const ex = en.phys ? en.phys.position.x : en.enCont.position.x;
      const ey = en.phys ? en.phys.position.y : en.enCont.position.y;

      if (this.isPointInJewelHex(hex, ex, ey)) {
        this.killEnemy(en);
      }
    }
  }

  getAvailableJewelHex() {
    this.ensureJewelHexPool();
    for (let i = 0; i < this.jewelHexPool.length; i++) {
      if (this.jewelHexPool[i].action === 'ready') {
        return this.jewelHexPool[i];
      }
    }
    return null;
  }

  spawnJewelHexZone(x, y, level) {
    const hex = this.getAvailableJewelHex();
    if (!hex) return;

    const zoneLevel = level || 1;
    const hexR = this.getJewelHexRadius(zoneLevel);
    this.buildJewelHexGraphic(hex, hexR);
    hex.position.x = x;
    hex.position.y = y;
    hex.scale.x = hex.scale.y = 0.6;
    hex.alpha = 0.4;
    hex.action = 'zone';
    hex.zoneTimer = this.getJewelHexZoneDuration(zoneLevel);
    hex.flickerCount = 0;
    hex.zIndex = 1;

    gsap.killTweensOf(hex);
    gsap.killTweensOf(hex.scale);
    gsap.to(hex.scale, {
      x: 1,
      y: 1,
      duration: 0.35,
      ease: 'power2.out',
    });

    this.killEnemiesInJewelHex(hex);
  }

  updateJewelHexZones() {
    if (!this.jewelHexPool) return;

    for (let i = 0; i < this.jewelHexPool.length; i++) {
      const hex = this.jewelHexPool[i];
      if (hex.action !== 'zone') continue;

      hex.zoneTimer -= this.e.dt;
      hex.flickerCount = (hex.flickerCount || 0) + this.e.dt;
      hex.alpha = 0.36 + Math.sin(hex.flickerCount * 10) * 0.04;

      this.killEnemiesInJewelHex(hex);

      if (hex.zoneTimer <= 0) {
        gsap.killTweensOf(hex);
        gsap.killTweensOf(hex.scale);
        hex.clear();
        hex.action = 'ready';
        hex.alpha = 0;
        hex.scale.x = hex.scale.y = 1;
      }
    }
  }

  showJewelHexWipe(x, y){

    const hex = this.getAvailableJewelHex();
    if(!hex){ return; }

    const hexR = 28;
    this.buildJewelHexGraphic(hex, hexR);
    hex.position.x = x;
    hex.position.y = y;
    hex.scale.x = hex.scale.y = 0.2;
    hex.alpha = 1;
    hex.action = "active";
    hex.zIndex = Math.round(y + 5000);

    gsap.killTweensOf(hex.scale);
    gsap.killTweensOf(hex);

    gsap.to(hex.scale, {
      x: 16,
      y: 16,
      duration: 0.9,
      ease: "power2.out",
    });

    gsap.to(hex, {
      alpha: 0,
      duration: 0.9,
      ease: "power2.in",
      onComplete: () => {
        hex.action = "ready";
        hex.alpha = 0;
        hex.scale.x = hex.scale.y = 0.2;
      },
    });

  }

  killAllAttackingEnemies() {
    if (!this.enemies) return;
    for (let i = 0; i < this.enemies.length; i++) {
      const en = this.enemies[i];
      if (!en || (en.action !== 'attacking' && en.action !== 'attack')) continue;
      this.killEnemy(en);
    }
  }

  activateJewelKill(x, y) {
    if (this.jewelKillLevel <= 0) return;

    if (this.e && this.e.s) this.e.s.p('jewelKill');

    if (this.jewelKillLevel >= 3) {
      this.killAllAttackingEnemies();
      this.jewelSpawnBlockTimer = 3;
      this.showJewelHexWipe(x, y);
    } else {
      this.spawnJewelHexZone(x, y, this.jewelKillLevel);
    }
  }

  showBulletShieldUsed(){

    if(this.e && this.e.s){ this.e.s.p("shieldBlock"); }

    const hud = document.getElementById('bulletShieldHud');
    const graphic = document.getElementById('bulletShieldGraphic');
    const text = document.getElementById('bulletShieldText');
    if(!hud || !graphic || !text){ return; }

    const screenX = window.innerWidth / 2;
    const screenY = window.innerHeight / 2 - 100;
    hud.style.left = screenX + "px";
    hud.style.top = screenY + "px";
    hud.style.display = "flex";
    text.textContent = "BULLET SHIELD USED!";

    gsap.killTweensOf(graphic);
    gsap.killTweensOf(text);
    graphic.style.opacity = "1";
    text.style.opacity = "1";

    gsap.timeline({
      onComplete: () => {
        hud.style.display = "none";
      },
    })
      .to({}, { duration: 0.5 })
      .to(graphic, { opacity: 0, duration: 1, ease: "power2.out" }, 0.5)
      .to(text, { opacity: 0, duration: 1, ease: "power2.out" }, 0.5);

  }

  addIcon(type){

      if (!type || !this.e || !this.e.ui || !this.e.ui.icons) return;
      if (this.hudAlreadyHasIcon(type)) return;

      var myType = null;
      if(type==="backwardsShot"){
        myType = this.e.ui.t_i_backwardsShot;
      }else if(type==="biggerShot"){
        myType = this.e.ui.t_i_biggerShot;
      }else if(type==="bombs"){
        myType = this.e.ui.t_i_bombs;
      }else if(type==="extraShot"){
        myType = this.e.ui.t_i_extraShot;
      }else if(type==="fireballs"){
        myType = this.e.ui.t_i_fireballs;
      }else if(type==="fasterShot"){
        myType = this.e.ui.t_i_fasterShot;
      }else if(type==="footSpeed"){
        myType = this.e.ui.t_i_footSpeed;
      }else if(type==="freeze"){
        myType = this.e.ui.t_i_freeze;
      }else if(type==="heal"){
        myType = this.e.ui.t_i_heal;
      }else if(type==="lightningStrike"){
        myType = this.e.ui.t_i_lightningStrike;
      }else if(type==="magnet"){
        myType = this.e.ui.t_i_magnet;
      }else if(type==="ninjaStar"){
        myType = this.e.ui.t_i_ninjaStar;
      }else if(type==="splinter"){
        myType = this.e.ui.t_i_splinter;
      }else if(type==="coinShot"){
        myType = this.e.ui.t_i_coinShot;
      }else if(type==="stealth"){
        myType = this.e.ui.t_i_stealth;
      }else if(type==="bulletShield"){
        myType = this.e.ui.t_i_bulletShield;
      }else if(type==="jewelKill"){
        myType = this.e.ui.t_i_jewelShot;
      }

      if (!myType) return;

      var num = this.iconCount;
      if (num >= this.e.ui.icons.length) return;

      this.e.ui.icons[num].texture = myType;
      this.e.ui.icons[num].alpha = 1;

      this.iconCount+=1

  }

  bushControls(){

    // for(var i=0; i<this.bushes.length; i++){

    //   this.bushes[i].rotation +=this.e.dt * 6;
    //   this.bushes[i].shad.rotation +=this.e.dt * 6;

    // }


    // for(var i=0; i<this.bushes.length; i++){

    //   if(this.e.u.getDistance( this.bushes[i].position.x, this.bushes[i].position.y, this.playerCont.position.x, this.playerCont.position.y ) < 50 && this.playerAction==="go"){

    //     this.playerAction = "hurt start"

    //   }

    // }

  }

  starControls(){

    for(var i=0; i<this.starConts.length; i++){

      var s = this.starConts[i];

      if(s.active===true){

        s.position.x = this.e.u.lerp(s.position.x, this.playerCont.position.x, .05);
        s.position.y = this.e.u.lerp(s.position.y, this.playerCont.position.y, .05);

        s.zIndex = 5000;

        // s.position.x = this.playerCont.position.x
        // s.position.y = this.playerCont.position.y

        if(s.num===2){
          s.rotation+=this.e.dt*1.5;
        }else{
          s.rotation+=this.e.dt*3;
        }

        s.sprite.rotation+=this.e.dt*10;

      }else{

        s.position.x = -10000;
        s.position.y = -10000;

      }

    }

  }

  enemyBulletControls(){

    if(this.setEnemyBullets===undefined){

      this.enemyBullets = [];

      this.enBulCount=0;
      this.enBulSpeed = 50;
      this.enBulLim=3;

      this.setEnemyBullets=true;

      for(var i=0; i<20; i++){

        // sprite

        this.enSprite = new PIXI.Sprite(this.e.ui.t_enBullet);
        this.enSprite.anchor.x = this.enSprite.anchor.y = .5;
        this.enSprite._zIndex=3001;
        this.mainCont.addChild(this.enSprite);

        this.enSprite.action="ready";

        this.enemyBullets.push(this.enSprite);

        this.enSprite.ani = this.e.ui.enfbAni;
        this.enSprite.aniSpeed = .01;
        this.e.ui.animatedSprites.push(this.enSprite);

        this.zLevs.push(this.enSprite)

      }

    }

    if(this.disableAttacks===false){
      this.enBulCount+=this.e.dt;
    }
    if(this.enBulCount>this.enBulLim){
      this.enBulCount=0;
      // console.log("enbull2")

      for(var i=0; i<this.enemyBullets.length; i++){

        if(this.enemyBullets[i].action==="ready"){
          this.enemyBullets[i].action="place";
          i=10000;
        }

      }
    }

    for(var i=0; i<this.enemyBullets.length; i++){

      var eb = this.enemyBullets[i];

      if(eb.action==="ready"){

        eb.position.x = 10000;
        eb.position.y = 10000;

        eb.scale.x = eb.scale.y = 1

        this.bulletStartDist = 500;

        eb.totalTime = 0;

        eb.points = [];
        eb.pointCount=0;

      }else if(eb.action==="place"){

        // console.log("en bul")

        this.placer.rotation = this.e.u.ca(this.e.u.ran(360));

        eb.position.x = this.playerCont.position.x + (this.bulletStartDist * Math.cos(this.placer.rotation));
        eb.position.y = this.playerCont.position.y + (this.bulletStartDist * Math.sin(this.placer.rotation));

        // eb.position.x = Math.abs(this.playerCont.position.x + this.e.u.nran(300));

        // var xpos = 300 - (this.playerCont.position.x-eb.position.x);
        // var rr = this.e.u.ran(2);
        // if(rr===0){
        //   eb.position.y = this.playerCont.position.y + xpos;
        // }else{
        //   eb.position.y = this.playerCont.position.y - xpos;
        // }

        var direction = new PIXI.Point(this.playerCont.position.x - eb.position.x, this.playerCont.position.y - eb.position.y);
        var distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= distance;
        direction.y /= distance;

        eb.xspeed = direction.x * this.enBulSpeed
        eb.yspeed = direction.y * this.enBulSpeed;

        // console.log("fbd "+this.e.u.getDistance(this.playerCont.position.x, this.playerCont.position.y, eb.position.x, eb.position.y));

        eb.action="move"

      }else if(eb.action==="move"){

        eb.pointCount+=this.e.dt;
        if(eb.pointCount>.25){
          eb.pointCount=0;

          var ebp = new Array();
          ebp.push(eb.position.x)
          ebp.push(eb.position.y)
          eb.points.push( ebp );
        }

        eb.alpha = 1;
        eb.zIndex=90000;

        eb.position.x += eb.xspeed*this.e.dt;
        eb.position.y += eb.yspeed*this.e.dt;

        if(this.e.u.getDistance(this.playerCont.position.x, this.playerCont.position.y, eb.position.x, eb.position.y - this.playerInnerCont.position.y )<=20){

          if(this.playerAction==="go"){

            // console.log("enemy bullet hit "+ eb.totalTime+" / "+i+" / "+eb.alpha+" / "+eb.action)
            // console.log(this.playerCont.position.x+" / "+this.playerCont.position.y+" / "+eb.position.x+" / "+eb.position.y)

            // this.pause = true;

            // console.log("point length: "+eb.points.length)

            for(var j=0; j<eb.points.length && j<50; j++){

              this.pointMarks[j].position.x = eb.points[j][0];
              this.pointMarks[j].position.y = eb.points[j][1];
              this.pointMarks[j].alpha = 0;

            }

            if(this.stealthActive===false){
              if(this.bulletPreventionCharges > 0){
                this.bulletPreventionCharges -= 1;
                this.showBulletShieldUsed();
                this.syncBulletShieldCharges();
              }else{
                this.playerAction="hurt start"
              }
            }
            eb.action="ready"
            // eb.action="show"
          }


        }

        eb.totalTime+=this.e.dt;
        if(eb.totalTime>8 || this.hasWon===true){
          eb.totalTime=0;

          eb.position.x = 10000;
          eb.position.y = 10000;

          eb.action="ready";
        }

      }else if(eb.action==="show"){

        eb.alpha = .5
        eb.scale.x = eb.scale.y = 2

        eb.totalTime+=this.e.dt;
        if(eb.totalTime>5){
          eb.totalTime=0;
          eb.action="ready";
        }

      }

    }

  }

  enemyControls(){

    if(this.setEnemies===undefined){

      this.enemyCount=0;

      this.enemyStartDist=500;

      this.enemies=[];

      this.setEnemies=true;

      // make

      for(var i=0; i<250; i++){

        // object

        this.enemy = new Object();

        // container

        this.enCont = new PIXI.Container();
        this.enCont.sortableChildren = true;
        this.mainCont.addChild(this.enCont);

        this.enInnerCont = new PIXI.Container();
        this.enInnerCont.sortableChildren = true;
        this.enCont.addChild(this.enInnerCont);

        this.enCont.zIndex=10;

        this.zLevs.push(this.enCont);

        // sprite

        this.enSprite = new PIXI.Sprite(this.e.ui.t_enemyA_1);
        this.enSprite.anchor.x = this.enSprite.anchor.y = .5;
        this.enSprite.zIndex=1;
        this.enInnerCont.addChild(this.enSprite);

        // flash

        this.enFlash = new PIXI.Sprite(this.e.ui.t_enemyA_1w);
        this.enFlash.anchor.x = this.enFlash.anchor.y = .5;
        this.enFlash.alpha = 0;
        this.enFlash.zIndex=2;
        this.enInnerCont.addChild(this.enFlash);

        // dot

        // this.enGlow = new PIXI.Sprite(this.e.ui.white);
        // this.enGlow.anchor.x = this.enGlow.anchor.y = .5;
        // this.enGlow.width = this.enGlow.height = 5;
        // this.enGlow.alpha = .8;
        // this.enGlow.zIndex=511;
        // this.enCont.addChild(this.enGlow);

        // glow

        this.enGlow = new PIXI.Sprite(this.e.ui.t_enemyGlow);
        this.enGlow.anchor.x = this.enGlow.anchor.y = .5;
        this.enGlow.scale.x = this.enGlow.scale.y = .7;
        this.enGlow.alpha = .8;
        this.enGlow.zIndex=5;
        this.enInnerCont.addChild(this.enGlow);

        // shad

        this.enShad = new PIXI.Sprite(this.e.ui.t_enShad);
        this.enShad.anchor.x = this.enShad.anchor.y = .5;
        this.enShad.scale.x = this.enShad.scale.y = .7;
        this.enShad.alpha = .9;
        this.enShad.zIndex=0;
        this.enInnerCont.addChild(this.enShad);

        // ice

        this.enIce = new PIXI.Sprite(this.e.ui.t_enemyIce);
        this.enIce.anchor.x = this.enIce.anchor.y = .5;
        this.enIce.alpha = 0;
        this.enIce.zIndex=2;
        this.enInnerCont.addChild(this.enIce);

        // hand

        this.enHand = new PIXI.Sprite(this.e.ui.t_hand);
        this.enHand.anchor.x = this.enHand.anchor.y = .5;
        this.enHand.alpha=0;
        this.enHand.zIndex=2;
        this.enInnerCont.addChild(this.enHand);

        // physics ob

        this.enPhys = Matter.Bodies.circle( i*30, 0, 15);
        this.enPhys.label = 'enemy-pool-' + i;
        this.applyEnemyPhysCollisionFilter(this.enPhys, this.enemyPhysCollisionNone);
        Matter.Body.setStatic(this.enPhys, true);
        Matter.World.add(this.physEngine.world,[this.enPhys]);

        // set object refs

        this.enemy.action = "ready";
        this.enemy.parkSlot = i;
        this.enemy.life = 50;
        this.enemy.speedFade = 1;
        this.enemy.freezeCount = 0;
        this.enemy._isFrozen = false;

        this.enemy.enCont = this.enCont;
        this.enemy.enSprite = this.enSprite;
        this.enemy.hand = this.enHand;
        this.enemy.hit = this.enSprite;
        this.enemy.enGlow = this.enGlow;
        this.enemy.enShad = this.enShad;
        this.enemy.flash = this.enFlash;
        this.enemy.phys = this.enPhys;
        this.enemy.ice = this.enIce;

        this.enSprite.aniSpeed=.05;
        this.e.ui.animatedSprites.push(this.enSprite);

        this.enFlash.aniSpeed=.05;
        this.enFlash.dontAnimate=true;
        this.e.ui.animatedSprites.push(this.enFlash);

        this.enInnerCont.position.y=-20

        this.enemies.push(this.enemy);

      }

    }

    //----------------------------------

    if(this.onlyOneEnemy===undefined){
      // this.onlyOneEnemy=0;
    }

    if(this.enemiesAttacking<this.maxEnemies){

      if(this.disableAttacks===false && this.hasWon===false && this.jewelSpawnBlockTimer <= 0){
        this.enemyCount+=this.e.dt * this.masterSpeed;
      }
      if(this.jewelSpawnBlockTimer <= 0 && (this.enemyCount>this.enemyLim && this.onlyOneEnemy===undefined || this.onlyOneEnemy===0)){

        // this.onlyOneEnemy+=1;

        this.enemyCount=0;

        for(var i=0; i<this.enemies.length; i++){
          if(this.enemies[i].action==="ready"){
            this.enemies[i].action="attack"
            i=1000;
          }
        }

      }

    }

    //----------------------------------

    this.enemiesAttacking = 0;

    for(var i=0; i<this.enemies.length; i++){

      var en = this.enemies[i];

      if(en.action==="ready"){

        this.resetEnemyCombatState(en);

        en.enCont.position.x = 10000;
        en.enCont.position.y = 10000;

        if (en.phys) {
          if (en.phys.isStatic !== true || en.phys._parked !== true) {
            this.parkEnemyPhys(en);
          } else {
            const parkPos = this.getEnemyParkPosition(en);
            Matter.Body.setPosition(en.phys, parkPos);
            Matter.Body.setVelocity(en.phys, { x: 0, y: 0 });
            en.phys.isSensor = true;
            en.phys.render.visible = false;
          }
        }

        if (en.enSprite) en.enSprite.dontAnimate = true;

        en.fbDelay = 0;
        en.starDelay = 0;
        en.hurtCount = 0;

        en.blinkCount = 0;

      }else if(en.action==="attack"){

        this.resetEnemyCombatState(en);

        var ranPlace = this.e.u.ran(2);
        ranPlace=1;

        if(ranPlace===0){

          // place at random angle

          this.placer.rotation = this.e.u.ca(this.e.u.ran(360));

          var startPos = {
            x : this.playerCont.position.x + this.enemyStartDist * Math.cos(this.placer.rotation),
            y : this.playerCont.position.y + this.enemyStartDist * Math.sin(this.placer.rotation)
          }

        }else{

          // place behind

          var startPos = {  x : 0, y : 0 };

          var enRight = 0;
          var enLeft = 0;
          var enUp = 0;
          var enDown = 0;

          for(var j=0; j<this.enemies.length; j++){

            if(this.enemies[j].action==="attacking"){

              if(this.enemies[j].enCont.position.x<this.playerCont.position.x){
                enLeft+=1;
              }else{
                enRight+=1;
              }

              if(this.enemies[j].enCont.position.y<this.playerCont.position.y){
                enUp+=1;
              }else{
                enDown+=1;
              }

            }

          }

          //

          // console.log(enLeft+" / "+enRight+" / "+enUp+" / "+enDown)

          var sides = new Array(enLeft, enRight, enUp, enDown);

          sides.sort(function(a, b){return b-a});

          if(sides[0]===enLeft){

            // console.log("left");
            startPos.x = this.playerCont.position.x+this.enemyStartDist;
            startPos.y = this.playerCont.position.y+this.e.u.nran(100);

          }else if(sides[0]===enRight){

            // console.log("right");
            startPos.x = this.playerCont.position.x-this.enemyStartDist;
            startPos.y = this.playerCont.position.y+this.e.u.nran(100);

          }else if(sides[0]===enUp){

            // console.log("up");
            startPos.x = this.playerCont.position.x+this.e.u.nran(100);
            startPos.y = this.playerCont.position.y+this.enemyStartDist;

          }else if(sides[0]===enDown){

            // console.log("down");
            startPos.x = this.playerCont.position.x+this.e.u.nran(100);
            startPos.y = this.playerCont.position.y-this.enemyStartDist;

          }

        }

        Matter.Body.setPosition(en.phys, startPos);
        this.wakeEnemyPhys(en);
        this.repairEnemyCombatPhysics(en);
        if (en.enSprite) en.enSprite.dontAnimate = false;

        en.speedFade = 0.3;

        // enSprite
        en.level = Math.min(6, this.e.u.ran(this.enemyMaxLevel) + 1);
        if(en.level<this.enemyMinLevel){
          en.level = this.enemyMinLevel
        }

        if(en.level===1){
          en.life=20;

          en.enSprite.aniSpeed = .1;
          en.enSprite.ani = this.e.ui.enemyA_Ani;
          en.flash.ani = this.e.ui.enemyAw_Ani;
          en.ice.texture = this.e.ui.t_enemy1_f;

          en.enGlow.position.y = -7;
          en.enGlow.position.x = -3;
          en.enShad.position.y = 17;
          en.enShad.width = 45*2
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="A";

        }else if(en.level===2){

          en.life=30;

          en.enSprite.aniSpeed = .05;
          en.enSprite.ani = this.e.ui.enemyB_Ani;
          en.flash.ani = this.e.ui.enemyBw_Ani;
          en.ice.texture = this.e.ui.t_enemy2_f;

          en.enGlow.position.y = -7;
          en.enGlow.position.x = -3;
          en.enShad.position.y = 17;
          en.enShad.width = 45*2
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="B";

        }else if(en.level===3){

          en.life=40;

          en.enSprite.aniSpeed = .1;
          en.enSprite.ani = this.e.ui.enemyC_Ani;
          en.flash.ani = this.e.ui.enemyCw_Ani;
          en.ice.texture = this.e.ui.t_enemy3_f;

          en.enGlow.position.y = -9;
          en.enGlow.position.x = -2;
          en.enShad.position.y = 18;
          en.enShad.width = 45*2
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="C";

        }else if(en.level===4){

          en.life=60;

          en.enSprite.aniSpeed = .1;
          en.enSprite.ani = this.e.ui.enemyD_Ani;
          en.flash.ani = this.e.ui.enemyDw_Ani;
          en.ice.texture = this.e.ui.t_enemy4_f;

          en.enGlow.position.y = -10;
          en.enGlow.position.x = 0;
          en.enShad.position.y = 18;
          en.enShad.width = 45*3
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="D";

        }else if(en.level===5){

          en.life=90;

          en.enSprite.aniSpeed = .1;
          en.enSprite.ani = this.e.ui.enemyE_Ani;
          en.flash.ani = this.e.ui.enemyEw_Ani;
          en.ice.texture = this.e.ui.t_enemy5_f;

          en.enGlow.position.y = -10;
          en.enGlow.position.x = 0;
          en.enShad.position.y = 18;
          en.enShad.width = 45*3
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="E";

        }else if(en.level===6){

          en.life=120;

          en.enSprite.aniSpeed = .1;
          en.enSprite.ani = this.e.ui.enemyF_Ani;
          en.flash.ani = this.e.ui.enemyFw_Ani;
          en.ice.texture = this.e.ui.t_enemy6_f;

          en.enGlow.position.y = -10;
          en.enGlow.position.x = -3;
          en.enShad.position.y = 17;
          en.enShad.width = 45*2
          en.enShad.height = 15*2
          en.enShad.alpha = 1

          en.type="F";

        }

        en.life+=this.level*4;

        en.action="attacking";

      }else if(en.action==="attacking"){

        this.enemiesAttacking+=1;

        //

        en.blinkCount+=this.e.dt;
        if( en.blinkCount>.1){
          en.blinkCount=0;
          if(en.enGlow.alpha===.7){
            en.enGlow.alpha=.5
          }else{
            en.enGlow.alpha=.7
          }
        }

        en.flash.curFrame = en.enSprite.curFrame;
        en.flash.texture = en.flash.ani[en.enSprite.curFrame];

        // en.flash.alpha = 1;

        // console.log(en.flash.curFrame+" / "+en.enSprite.curFrame)

        en.enCont.position.x = en.phys.position.x;
        en.enCont.position.y = en.phys.position.y;

        if(this.isEnemyInActiveFreezer(en)){
          en.freezeCount = 5;
        }

        en.freezeCount-=this.e.dt;

        if(en.freezeCount>0){
          en._isFrozen = true;
          en.ice.alpha = 1;
          en.enSprite.alpha = 0;
          Matter.Body.setVelocity(en.phys, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(en.phys, 0);
          this.applyEnemyPhysCollisionFilter(en.phys, this.enemyPhysCollisionActive);
          if (en.phys.isStatic !== true) {
            Matter.Body.setStatic(en.phys, true);
          }
          en.phys.isSensor = false;
        }else{
          if(en._isFrozen || en.ice.alpha > 0){
            en._isFrozen = false;
            if (en.enSprite) en.enSprite.alpha = 1;
            if (en.ice) en.ice.alpha = 0;
            this.unfreezeEnemyPhysics(en);
          }
          this.repairEnemyCombatPhysics(en);
          this.ensureEnemyPhysInWorld(en);

          if(en.enCont.position.x<this.playerCont.position.x){
            en.enCont.scale.x=-1;
          }else{
            en.enCont.scale.x=1;
          }

          var vectorX = this.stealthTarget.x - en.phys.position.x;
          var vectorY = this.stealthTarget.y - en.phys.position.y;
          const dist = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

          var fpsDiv = (1/this.e.dt) / 60;

          if(fpsDiv>2){
            fpsDiv=2;
          }

          if(fpsDiv<.5){
            fpsDiv=.5;
          }

          const chaseScale = this.enemySpeed * this.e.dt * en.speedFade * this.masterSpeed * 25000 * fpsDiv;
          if (!en.phys || dist < 1e-6) {
            if (en.phys) Matter.Body.setVelocity(en.phys, { x: 0, y: 0 });
          } else {
            const targetVx = vectorX * chaseScale;
            const targetVy = vectorY * chaseScale;
            const blend = 0.56;
            const vx = en.phys.velocity.x * (1 - blend) + targetVx * blend;
            const vy = en.phys.velocity.y * (1 - blend) + targetVy * blend;
            Matter.Body.setVelocity(en.phys, { x: vx, y: vy });
          }

        }

        // bullet collision

        // this.splinter=true

        for(var j=0; j<this.bullets.length; j++){

          var b = this.bullets[j];
          if(b.action==="shooting"){

            if(this.e.u.getDistance( b.position.x, b.position.y, en.enCont.position.x, en.enCont.position.y - this.playerInnerCont.position.y  ) < 150){
              if(this.e.u.hitTest( b.hit, en.hit )===true && en.freezeCount<=0 && en.life>0){

                en.flash.alpha = 1;
                gsap.to( en.flash, {alpha: 0, duration: .25, ease: "linear"});

                en.life-=b.damage;
                b.action="shrink";
                if(en.life<=0){
                  this.setBones(en.enCont.position.x, en.enCont.position.y,en.type, 1)
                }
                // b.position.x=10000;

                // if(this.splinter===true && en.life<=0 && b.type!=="splinter"){
                if(this.splinter===true && en.life<=0 ){

                  var ranRot = this.e.u.ran(120);

                  for(var i=0; i<3; i++){

                    var b = this.makeBullet(this.e.u.ca( (i*120)+ranRot), this.bulletDamage, "splinter" );
                    if(b!==null){
                      b.position.x = en.enCont.position.x;
                      b.position.y = en.enCont.position.y;
                    }


                  }

                }

              }

            }

          }

        }

        // star collision

        if(en.starDelay>0){
          en.starDelay-=this.e.dt;
        }

        for(var j=0; j<this.starConts.length; j++){

          var s = this.starConts[j];
          if(s.active===true && en.starDelay<=0){

            if(this.e.u.getDistance( s.position.x, s.position.y, en.enCont.position.x, en.enCont.position.y ) < 150){
              if(this.e.u.hitTest( s.sprite, en.hit )===true){

                if(this.sliceTime<=0){
                  this.sliceTime=.2
                  this.e.s.p("slice")
                }

                if(this.starConts[j].num===2){
                  en.life-=200;
                }else if(en.freezeCount<=0){

                  en.flash.alpha = 1;
                  gsap.to( en.flash, {alpha: 0, duration: .5, ease: "linear"});

                  en.life-=20;
                }

                en.starDelay = .75;
                if(en.life<=0){
                  this.setBones(en.enCont.position.x, en.enCont.position.y,en.type, 1)
                }
              }

            }

          }

        }

        // fireball collision

        if(en.fbDelay>0){
          en.fbDelay-=this.e.dt;
        }

        for(var j=0; j<this.fireBalls.length; j++){

          var s = this.fireBalls[j];
          if(en.fbDelay<=0){

            if(this.e.u.getDistance( s.position.x, s.position.y, en.enCont.position.x, en.enCont.position.y ) < 150){
              if(this.e.u.hitTest( s.sprite, en.hit )===true){
              // if(this.e.u.hitTest( s.sprite, en.hit )===true && en.freezeCount<=0){

                en.flash.alpha = 1;
                gsap.to( en.flash, {alpha: 0, duration: .5, ease: "linear"});

                en.life-=200;
                en.fbDelay = .75;
                if(en.life<=0){
                  this.setBones(en.enCont.position.x, en.enCont.position.y,en.type, 2)
                }
              }

            }

          }

        }

        // player collision

        if( this.e.u.getDistance( en.enCont.position.x, en.enCont.position.y, this.playerCont.position.x, this.playerCont.position.y ) < 30 && this.playerAction==="go" ){

          if(en.freezeCount<=0 && this.stealthActive===false){
            this.playerAction="hurt start";
          }

        }

        // if killed

        if(en.life<=0){

          this.killEnemy(en);

        }

      }

    }

    this.enDeathCount-=this.e.dt;
    this.sliceTime-=this.e.dt;

    if (this.jewelSpawnBlockTimer > 0) {
      this.jewelSpawnBlockTimer -= this.e.dt;
    }

    this.updateJewelHexZones();

  }

  boneControl(){

    if(this.bonesMade===undefined){

      this.boneCols = [];

      // bones type A

      for(var i=0; i<20; i++){

        this.boneCol = new Object();
        this.boneCol.action = "ready";
        this.boneCol.colCount = 0;
        this.boneCol.type = "A";
        this.boneCol.bones = [];

        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_bone1));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_bone2));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_bone3));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_bone4));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_bone5));

        // this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA1));
        // this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA2));
        // this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA3));
        // this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA4));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA5));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA6));
        this.boneCol.bones.push( this.makeNewBone(this.e.ui.t_boneA7));

        this.boneCols.push(this.boneCol);

      }

      this.bonesMade=true;

    }

    for(var i=0; i<this.boneCols.length; i++){

      var b = this.boneCols[i];

      if(b.action==="ready"){

        for(var j=0; j<b.bones.length; j++){

          b.bones[j].position.x = 10000;
          b.bones[j].position.y = 10000;
          b.bones[j].alpha = 1;

        }

        b.colCount = 0;

      }else if(b.action==="set"){

        for(var j=0; j<b.bones.length; j++){

          b.bones[j].scale.x = b.bones[j].scale.y = 1;
          b.bones[j].count = 0;
          b.bones[j].alpha = 1;
          b.bones[j].shrink = false;

        }

        b.action="go"

      }else if(b.action==="go"){

        for(var j=0; j<b.bones.length; j++){

          b.bones[j].count+=this.e.dt;

          if(b.bones[j].count<1){

            b.bones[j].rotation += b.bones[j].xspeed*this.e.dt*2;
            b.bones[j].position.x += b.bones[j].xspeed*this.e.dt*25;
            b.bones[j].position.y += b.bones[j].yspeed*this.e.dt*25;
            b.bones[j].yspeed += 5*this.e.dt;

          }

        }

        b.colCount+=this.e.dt;
        if(b.colCount>3){

          b.colCount=0;
          b.action="ready";

        }

      }

    }

  }

  setBones(x,y,type,mult){

    for(var i=0; i<this.boneCols.length; i++){

      // if(this.boneCols[i].action==="ready" && this.boneCols[i].type===type){
      if(this.boneCols[i].action==="ready"){

        for(var j=0; j<this.boneCols[i].bones.length; j++){

          // console.log(type)

          this.boneCols[i].bones[j].xspeed = this.e.u.nran(10)*mult;
          this.boneCols[i].bones[j].yspeed = -this.e.u.ran(10)*mult;
          this.boneCols[i].bones[j].position.x = x+this.e.u.nran(10);
          this.boneCols[i].bones[j].position.y = y+this.e.u.nran(10) - 20;

          gsap.to( this.boneCols[i].bones[j], {alpha: 0, duration: .25, delay: .75, ease: "linear"});

          this.boneCols[i].action = "set";

        }

        i=10000;

      }

    }


  }

  makeNewBone(type){
    this.bone = new PIXI.Sprite(type);
    this.bone.anchor.x = this.enGlow.anchor.y = .5;
    this.bone.scale.x = this.enGlow.scale.y = 3;
    this.bone.zIndex=25000;
    this.mainCont.addChild(this.bone);
    // this.zLevs.push(this.bone);
    return this.bone;
  }

  enemyExplode(x,y){

    for(var i=0; i<this.explosions.length; i++){

      if(this.explosions[i].action==="ready"){

        this.explosions[i].position.x = x;
        this.explosions[i].position.y = y - 20;
        this.explosions[i].action="set"

        i=10000;

      }

    }

  }

  enemyExplodeWhite(x,y){

    for(var i=0; i<this.explosionsWhite.length; i++){

      if(this.explosionsWhite[i].action==="ready"){

        this.explosionsWhite[i].position.x = x;
        this.explosionsWhite[i].position.y = y;
        this.explosionsWhite[i].action="set"

        i=10000;

      }

    }

  }



  /** Clone filter onto the body so pooled enemies do not share one collisionFilter object. */
  applyEnemyPhysCollisionFilter(body, template) {
    if (!body || !template) return;
    Matter.Body.set(body, {
      collisionFilter: {
        group: template.group,
        category: template.category,
        mask: template.mask,
      },
    });
  }

  getEnemyParkPosition(en) {
    const slot = en && en.parkSlot != null ? en.parkSlot : 0;
    return { x: 10000 + slot * 32, y: 10000 };
  }

  isEnemyInActiveFreezer(en) {
    if (!en || this.freezeEnemies <= 0) return false;
    if (this.freezer && this.freezer.alpha > 0.05 && this.e.u.hitTest(this.freezer, en.hit) === true) {
      return true;
    }
    if (this.freezer2 && this.freezer2.alpha > 0.05 && this.e.u.hitTest(this.freezer2, en.hit) === true) {
      return true;
    }
    return false;
  }

  ensureEnemyPhysInWorld(en) {
    if (!en?.phys || !this.physEngine?.world) return false;
    const bodies = Matter.Composite.allBodies(this.physEngine.world);
    if (bodies.indexOf(en.phys) !== -1) return true;
    Matter.World.add(this.physEngine.world, en.phys);
    return true;
  }

  unfreezeEnemyPhysics(en) {
    if (!en?.phys || en.phys._parked === true) return;
    this.ensureEnemyPhysInWorld(en);
    this.applyEnemyPhysCollisionFilter(en.phys, this.enemyPhysCollisionActive);
    Matter.Body.setStatic(en.phys, false);
    en.phys.isSensor = false;
    en.phys.render.visible = true;
    en.phys._parked = false;
    Matter.Body.setAngularVelocity(en.phys, 0);
    if (Matter.Sleeping) {
      Matter.Sleeping.set(en.phys, false);
    }
  }

  repairEnemyCombatPhysics(en) {
    if (!en?.phys || en.phys._parked === true) return;
    if (en.freezeCount > 0) return;

    this.ensureEnemyPhysInWorld(en);

    if (en.phys.isStatic) {
      Matter.Body.setStatic(en.phys, false);
    }
    en.phys.isSensor = false;
    en.phys.render.visible = true;
    this.applyEnemyPhysCollisionFilter(en.phys, this.enemyPhysCollisionActive);
    en.phys._parked = false;

    if (en.enSprite && en.enSprite.alpha === 0) {
      en.enSprite.alpha = 1;
    }
    if (en.ice && en.ice.alpha > 0) {
      en.ice.alpha = 0;
    }
    en._isFrozen = false;
  }

  resetEnemyCombatState(en) {
    if (!en) return;

    en.freezeCount = 0;
    en._isFrozen = false;

    gsap.killTweensOf(en);
    if (en.ice) {
      gsap.killTweensOf(en.ice);
      en.ice.alpha = 0;
    }
    if (en.enSprite) {
      gsap.killTweensOf(en.enSprite);
      en.enSprite.alpha = 1;
      en.enSprite.dontAnimate = false;
    }
    if (en.flash) {
      gsap.killTweensOf(en.flash);
      en.flash.alpha = 0;
    }
    if (en.hand) {
      en.hand.alpha = 0;
    }
    if (en.enGlow) {
      en.enGlow.alpha = 0.7;
    }

    en.fbDelay = 0;
    en.starDelay = 0;
    en.hurtCount = 0;
    en.blinkCount = 0;
    en.speedFade = 0.3;

    if (en.action === 'attacking' || en.action === 'attack') {
      this.repairEnemyCombatPhysics(en);
    }
  }

  forceRecycleEnemy(en) {
    if (!en) return;
    this.resetEnemyCombatState(en);
    en.life = 0;
    en.action = 'ready';
    en.enCont.position.x = 10000;
    en.enCont.position.y = 10000;
    this.parkEnemyPhys(en, true);
    if (en.enSprite) en.enSprite.dontAnimate = true;
  }

  parkEnemyPhys(en, force = false) {
    if (!en || !en.phys) return;
    if (!force && en.phys._parked === true) return;
    const parkPos = this.getEnemyParkPosition(en);
    Matter.Body.setVelocity(en.phys, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(en.phys, 0);
    this.applyEnemyPhysCollisionFilter(en.phys, this.enemyPhysCollisionNone);
    if (en.phys.isStatic !== true) {
      Matter.Body.setStatic(en.phys, true);
    }
    Matter.Body.setPosition(en.phys, parkPos);
    en.phys.isSensor = true;
    en.phys.render.visible = false;
    en.phys._parked = true;
  }

  wakeEnemyPhys(en) {
    if (!en || !en.phys) return;
    this.ensureEnemyPhysInWorld(en);
    this.applyEnemyPhysCollisionFilter(en.phys, this.enemyPhysCollisionActive);
    Matter.Body.setStatic(en.phys, false);
    en.phys.isSensor = false;
    en.phys.render.visible = true;
    en.phys._parked = false;
    if (Matter.Sleeping) {
      Matter.Sleeping.set(en.phys, false);
    }
    this.repairEnemyCombatPhysics(en);
  }

  parkEnemyOffscreen(en) {
    this.forceRecycleEnemy(en);
  }

  killEnemy(en) {
    if (!en || (en.action !== 'attacking' && en.action !== 'attack')) return;

    const ex = en.phys ? en.phys.position.x : en.enCont.position.x;
    const ey = en.phys ? en.phys.position.y : en.enCont.position.y;
    en.enCont.position.x = ex;
    en.enCont.position.y = ey;

    this.score += 1;
    this.killTotal += 1;
    this.enemiesKilledThisLevel += 1;

    if (this.enDeathCount <= 0) {
      this.enDeathCount = 0.2;
      if (this.e && this.e.s) this.e.s.p('enemyDeath');
    }

    this.enemyExplode(ex, ey);

    if (ex < 1250 && ex > -1250 && ey < 1250 && ey > -1250 && this.coins) {
      for (let j = 0; j < this.coins.length; j++) {
        if (this.coins[j].action === 'ready') {
          this.pickupSpawnCount = (this.pickupSpawnCount || 0) + 1;
          const isJewel = this.isJewelPickupSpawn(this.pickupSpawnCount);
          this.coins[j].position.x = ex;
          this.coins[j].position.y = ey;
          this.setPickupSprite(this.coins[j], isJewel);
          this.coins[j].action = 'out';
          break;
        }
      }
    }

    this.forceRecycleEnemy(en);
  }

  clearEnemiesNearPlayer(radius) {
    if (!this.enemies || !this.playerCont) return;

    const px = this.playerCont.position.x;
    const py = this.playerCont.position.y;

    for (let i = 0; i < this.enemies.length; i++) {
      const en = this.enemies[i];
      if (!en || en.life <= 0 || en.action !== 'attacking') continue;

      const ex = en.phys ? en.phys.position.x : en.enCont.position.x;
      const ey = en.phys ? en.phys.position.y : en.enCont.position.y;

      if (this.e.u.getDistance(px, py, ex, ey) < radius) {
        this.killEnemy(en);
      }
    }
  }

  triggerCoinShotAt(x, y) {

    if(this.coinShotLevel===0){ return; }

    let count = 0;
    let damage = 0;

    if(this.coinShotLevel===1){
      count = 2;
      damage = 10;
    }else if(this.coinShotLevel===2){
      count = 3;
      damage = 13;
    }else if(this.coinShotLevel===3){
      count = 3;
      damage = 17;
    }

    for(let i=0; i<count; i++){
      const rot = this.e.u.ca(this.e.u.ran(360));
      const b = this.makeBullet(rot, damage, "coinShot");
      if(b!==null){
        b.position.x = x;
        b.position.y = y;
      }
    }
  }

  coinControls(){

    if(this.setCoinControls===undefined){

      this.coins = [];
      this.setCoinControls=true;

      // make coins

      for(var i=0; i<800; i++){

        this.coin = new PIXI.Sprite(this.e.ui.coinAni[0]);
        this.coin.anchor.x = this.coin.anchor.y = .5;
        this.coin.zIndex=1;
        this.coin.scale.x = this.coin.scale.y = 2 / 3;
        this.coin.ani = this.e.ui.coinAni;
        this.coin.aniSpeed = 0.08;
        this.coin.dontAnimate = true;
        this.e.ui.animatedSprites.push(this.coin);
        this.mainCont.addChild(this.coin);

        this.coin.action="ready";
        this.coins.push(this.coin);

      }

    }

    for(var i=0; i<this.coins.length; i++){

      var c = this.coins[i];

      if(c.action==="ready"){

        c.alpha=0;
        c.dontAnimate = true;

      }else if(c.action==="out"){

        c.alpha=1;
        c.dontAnimate = false;

        if(this.e.u.getDistance(c.position.x, c.position.y, this.playerCont.position.x, this.playerCont.position.y-20) < this.magnetDistance ){

          this.triggerCoinShotAt(c.position.x, c.position.y);
          c.action="move to player"

        }

      }else if(c.action==="move to player"){

        c.dontAnimate = false;
        c.position.x = this.e.u.lerp(c.position.x, this.playerCont.position.x, .2 * this.masterSpeed);
        c.position.y = this.e.u.lerp(c.position.y, this.playerCont.position.y-20, .2 * this.masterSpeed);

        if(this.e.u.getDistance(c.position.x, c.position.y, this.playerCont.position.x, this.playerCont.position.y-20) < 10 ){

          if (c.isJewel) {
            const jewelX = c.position.x;
            const jewelY = c.position.y;
            if(this.jewelKillLevel > 0){
              this.activateJewelKill(jewelX, jewelY);
            }
            this.runJewels = (this.runJewels || 0) + 1;
            LocalState.jewels.add(1);
            this.syncJewelDisplays();
            this.score += 1;
            this.e.s.p("jewelPickup");
          } else {
            this.score+=1;
            this.coinsFoundThisLevel+=1;
            this.coinAmount += 1;
            this.coinTotal+=1;
            this.e.s.p("coin");
          }
          this.setPickupSprite(c, false);
          c.action="ready"

        }

      }

    }

  }

  controls(){

    if(this.setControls===undefined){

      this.resetBulletPool();

      this.playerAction="go"
      this.life=4;
      this.maxLife=4;
      this.blinkCount=0;
      this.hurtCount=0;
      this.playerLevel=1;

      this.playerSpeed=60;
      // this.playerSpeed=120;
      this.xspeed=0;
      this.yspeed=0;
      this.speedIncrease=1000;
      this.speedDecrease=.8;

      this.shootCount=0;
      this.shootLim=.4;
      this.shootSpeed=500;
      this.bulletDamage=10;
      this.bulletWidth=1;

      this.applyRunStartStoreState();
      this.ensureHtmlHeartSlots(this.maxLife || 4);
      this.updateHtmlHearts();

      this.setControls=true;

    }

    //-----------------------------------------------------------------------------------------

    // hearts

    for(var i=0; i<4; i++){
      if(i>=this.life){
        //this.e.ui.hearts[i].texture=this.e.ui.t_heartEmpty;
      }else{
        //this.e.ui.hearts[i].texture=this.e.ui.t_heart;
      }
    }

    // player actions

    if(this.playerAction==="go"){

      this.player.alpha = 1;

    }else if(this.playerAction==="hurt start"){

      this.e.s.p("hurt")

      this.life-=1;

      this.e.ui.faderRed.alpha=.5;
      this.playerAction="hurt";

      if(this.life<=0){
        this.beginDeathOutcome();
      }

    }else if(this.playerAction==="hurt"){

      if(this.e.ui.faderRed.alpha>0){
        this.e.ui.faderRed.alpha-=this.e.dt*.25;
      }

      this.blinkCount+=this.e.dt;
      if(this.blinkCount>.025){

        this.blinkCount=0;

        if(this.player.alpha===1){
          this.player.alpha=.3;
        }else{
          this.player.alpha=1;
        }

      }

      this.hurtCount+=this.e.dt;
      if(this.hurtCount>3){

        this.playerAction="go";
        this.hurtCount=0;

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make bullets

    if(this.setBullets===undefined){

      for(var i=0; i<50; i++){

        this.bCont = new PIXI.Container();
        this.bCont.sortableChildren = true;
        this.mainCont.addChild(this.bCont);

        this.bCont.scale.x = this.bCont.scale.y = .5;

        this.bul = new PIXI.Sprite(this.e.ui.t_whiteBall);
        this.bul.anchor.x = 1;
        this.bul.anchor.y = .5;
        this.bul.width=85;
        this.bul.height=61;
        this.bul.zIndex=1;
        this.bCont.addChild(this.bul);

        this.hit = new PIXI.Sprite(this.e.ui.red);
        this.hit.anchor.x = 1;
        this.hit.anchor.y = .5;
        this.hit.width=14;
        this.hit.height=14;
        this.hit.zIndex=2;
        this.hit.alpha=0;
        this.bCont.addChild(this.hit);

        this.bCont.action = "ready";
        this.bCont.lifeCount = 0;
        this.bCont.sprite = this.bul;
        this.bCont.hit = this.hit;

        this.bullets.push(this.bCont);

      }

      this.setBullets=true;

    }

    // shoot bullets

    this.shootCount+=this.e.dt * this.masterSpeed;

    if(this.shootCount>this.shootLim){

      this.shootCount=0;
      this.backwardsShotCue+=1;

      this.hand2.curFrame=0;

      for(var j=0; j<this.shotNumber; j++){

        // make forward shots

        var extraRot = 0;

        if(this.shotNumber===2){

          if(j===0){
            extraRot = -8
          }else if(j===1){
            extraRot = 8
          }

        }else if(this.shotNumber===3){

          if(j===0){
            extraRot = -20
          }else if(j===1){
            extraRot = 0
          }else if(j===2){
            extraRot = 20
          }

        }else if(this.shotNumber===4){

          if(j===0){
            extraRot = -20
          }else if(j===1){
            extraRot = -10
          }else if(j===2){
            extraRot = 10
          } else if(j===2){
            extraRot = 20
          }

        }else if(this.shotNumber===5){

          if(j===0){
            extraRot = -20
          }else if(j===1){
            extraRot = -10
          }else if(j===2){
            extraRot = 0
          } else if(j===3){
            extraRot = 10
          } else if(j===4){
            extraRot = 20
          }

        }

        var rot = this.hand.rotation+this.e.u.ca(extraRot);
        this.makeBullet(rot, this.bulletDamage);

      }

      // make backwards shot

      // if(this.backwardsShotCue>=5 && this.backwardsShot===true){
      if(this.backwardsShot===true){

        this.backwardsShotCue=0;

        this.makeBullet(this.hand.rotation+this.e.u.ca(180), this.bulletDamage);

      }

    }

    // bullet loop

    for(var i=0; i<this.bullets.length; i++){

      var b = this.bullets[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;
        b.count = 0;
        b.scale.x = b.scale.y = .5;

      }else if(b.action==="shoot"){

        if(b.type!=="coinShot"){
          this.e.s.p("shot")
        }

        var bulSize;
        if(b.type==="coinShot"){
          if(this.coinShotLevel===1){
            bulSize = 30;
            b.sprite.texture = this.e.ui.t_jewelShot1;
          }else if(this.coinShotLevel===2){
            bulSize = 40;
            b.sprite.texture = this.e.ui.t_jewelShot2;
          }else{
            bulSize = 50;
            b.sprite.texture = this.e.ui.t_jewelShot3;
          }
        }else if(this.bulletWidth===1){
          bulSize=14
          b.sprite.texture = this.e.ui.t_bul1;
        }else if(this.bulletWidth===2){
          bulSize=21
          b.sprite.texture = this.e.ui.t_bul2;
        }else if(this.bulletWidth===3){
          bulSize=27
          b.sprite.texture = this.e.ui.t_bul3;
        }else if(this.bulletWidth===4){
          bulSize=39
          b.sprite.texture = this.e.ui.t_bul4;
        }else if(this.bulletWidth===5){
          bulSize=61
          b.sprite.texture = this.e.ui.t_bul5;
        }

        b.hit.width = b.hit.height = bulSize;

        b.action="shooting";

      }else if(b.action==="shooting"){

        b.position.x = b.position.x + this.shootSpeed * Math.cos(b.rotation) * this.e.dt * this.masterSpeed;
	      b.position.y = b.position.y + this.shootSpeed * Math.sin(b.rotation) * this.e.dt * this.masterSpeed;

        b.lifeCount+=this.e.dt;
        if(b.lifeCount>5){
          b.lifeCount=0;
          b.action="ready";
        }

      }else if(b.action==="shrink"){

        this.enemyExplodeWhite(b.position.x, b.position.y)

        gsap.to( b.scale, {x: 0.1, y: 0.1, duration: .1, ease: "linear"});
        b.action = "shrinking"

      }else if(b.action==="shrinking"){

        b.count+=this.e.dt;
        if(b.count>.1){

          b.count=0;
          b.action="ready"
        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make freeze

    this.freezeCount+=this.e.dt;
    if(this.freezeCount>3 && this.freeze>0){

      this.freezeCount=0;
      this.freezeAction="shoot"
      this.e.s.p("frost")

      this.freezerMask.width = this.freezerMask.height = 1;

      this.freezerCont.position.x = this.playerCont.position.x;
      this.freezerCont.position.y = this.playerCont.position.y+20;

      this.freezer.rotation = 0;
      this.freezerMask.rotation = 0;

      var frot = 3;

      gsap.to( this.freezerMask, {rotation: -frot, duration: 1, ease: "sine.inOut"});
      gsap.to( this.freezer, {rotation: frot, duration: 1, ease: "sine.inOut"});

      if(this.freeze===1){
        gsap.to( this.freezerMask, {width: 140, height: 140, duration: .5, ease: "sine.out"});
        gsap.to( this.freezer, {width: 70, height: 70, duration: .5, ease: "sine.out"});
        this.snowFlakeScale = 1;
      }else{
        gsap.to( this.freezerMask, {width: 140*1.4, height: 140*1.4, duration: .5, ease: "sine.out"});
        gsap.to( this.freezer, {width: 70*1.4, height: 70*1.4, duration: .5, ease: "sine.out"});
        this.snowFlakeScale = 1.6;
      }

      gsap.to( this.freezer, {alpha: 1, duration: .5, ease: "linear"});
      gsap.to( this.freezer, {alpha: 0, duration: .25, delay: .5, ease: "linear"});

      this.freezeEnemies = 1;

      for(var i=0; i<this.snowFlakes.length; i++){

        this.snowFlakes[i].scale.x = this.snowFlakes[i].scale.y = 0;
        this.snowFlakes[i].alpha = 1;

        gsap.to( this.snowFlakes[i].scale, {x: this.snowFlakeScale, y: this.snowFlakeScale, duration: .5, ease: "sine.in"});
        gsap.to( this.snowFlakes[i].scale, {x: this.snowFlakeScale+1, y: this.snowFlakeScale+1, duration: .25, delay: .75, ease: "sine.out"});
        gsap.to( this.snowFlakes[i], {alpha: 0, duration: .25, delay: .75, ease: "sine.out"});

      }

    }

    this.freezer2.scale.x = this.freezer.scale.x;
    this.freezer2.scale.y = this.freezer.scale.y;

    this.sfSpeed = 5;

    for(var i=0; i<this.snowFlakes.length; i++){

      if(this.snowFlakes[i].dir==="r"){
        this.snowFlakes[i].rotation+=this.snowFlakes[i].rotSpeed*this.e.dt;
      }else{
        this.snowFlakes[i].rotation+=this.snowFlakes[i].rotSpeed*this.e.dt;
      }

    }

    if(this.freezeEnemies>0){
      this.freezeEnemies-=this.e.dt;
    }

    if(this.freezeAction==="shoot"){

      if(this.freezer.alpha===0){
        this.freezeCount=0
        this.freezeAction="off"
      }

    }else  if(this.freezeAction==="off"){

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make explosions

    if(this.setExplosions===undefined){

      this.explosions = [];

      for(var i=0; i<30; i++){

        this.explosion = new PIXI.Sprite(this.e.ui.t_ex1);
        this.explosion.anchor.x = this.explosion.anchor.y = .5;
        this.explosion.scale.x = this.explosion.scale.y = .25;
        this.explosion._zIndex=111;
        this.explosion.alpha = 1;
        this.mainCont.addChild(this.explosion);

        this.explosion.ani = this.e.ui.exAni;
        this.explosion.aniSpeed = .025;
        this.explosion.aniLoop = false;
        this.e.ui.animatedSprites.push(this.explosion);

        this.explosion.action = "ready";

        this.explosions.push(this.explosion);
        // this.zLevs.push(this.explosion)

      }

      this.setExplosions=true;

    }

    // explosions loop

    for(var i=0; i<this.explosions.length; i++){

      var b = this.explosions[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;

      }else if(b.action==="set"){

        b.curFrame = 0;
        b.alpha=1;
        b.action="exploding"

      }else if(b.action==="exploding"){

        if(b.curFrame>=14){
          b.alpha=0;
          b.action="ready"
        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make explosions

    if(this.setExplosionsWhite===undefined){

      this.explosionsWhite = [];

      for(var i=0; i<30; i++){

        this.explosion = new PIXI.Sprite(this.e.ui.t_exw1);
        this.explosion.anchor.x = this.explosion.anchor.y = .5;
        // this.explosion.scale.x = this.explosion.scale.y = .5;
        this.explosion._zIndex=3111;
        this.explosion.alpha = 1;
        this.mainCont.addChild(this.explosion);

        this.explosion.ani = this.e.ui.exwAni;
        this.explosion.aniSpeed = .025;
        this.explosion.aniLoop = false;
        this.e.ui.animatedSprites.push(this.explosion);

        this.explosion.action = "ready";

        this.explosionsWhite.push(this.explosion);

      }

      this.setExplosionsWhite=true;

    }

    // explosions loop

    for(var i=0; i<this.explosionsWhite.length; i++){

      var b = this.explosionsWhite[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;

      }else if(b.action==="set"){

        b.curFrame = 0;
        b.alpha=1;
        b.action="exploding"

      }else if(b.action==="exploding"){

        if(b.curFrame>=7){
          b.alpha=0;
          b.action="ready"
        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make fireballs

    if(this.setFireball===undefined){

      this.fireBalls = [];

      for(var i=0; i<3; i++){

        this.bCont = new PIXI.Container();
        this.bCont.sortableChildren = true;
        this.mainCont.addChild(this.bCont);

        this.bul = new PIXI.Sprite(this.e.ui.t_fireball);
        this.bul.anchor.x = this.bul.anchor.y = .5;
        this.bul.scale.x = this.bul.scale.y = -1;
        this.bul._zIndex=111;
        this.bCont.addChild(this.bul);
        this.bul.ani = this.e.ui.fbAni;
        this.bul.aniSpeed = .05;
        this.e.ui.animatedSprites.push(this.bul);

        this.bCont.action = "ready";
        this.bCont.lifeCount = 0;
        this.bCont.sprite = this.bul;
        this.bCont.hit = this.bul;

        this.fireBalls.push(this.bCont);

      }

      this.setFireball=true;

    }

    // shoot fireball

    this.fireBallCount+=this.e.dt;
    if(this.fireBallCount>3){

      this.fireBallCount=0;
      this.shootFireBall();

    }

    for(var i=0; i<this.fireBalls[i].length; i++){

      this.fireBalls[i].position.x = this.playerCont.position.x;
      this.fireBalls[i].position.y = this.playerCont.position.y;

    }

    // fireball loop

    for(var i=0; i<this.fireBalls.length; i++){

      var b = this.fireBalls[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;

      }else if(b.action==="shoot"){

        b.action="shooting";

        this.e.s.p("fireball")

      }else if(b.action==="shooting"){

        // console.log("shooting fb")

        this.fireBallSpeed = 120;

        b.position.x = b.position.x + this.fireBallSpeed * Math.cos(b.rotation) * this.e.dt * this.masterSpeed;
	      b.position.y = b.position.y + this.fireBallSpeed * Math.sin(b.rotation) * this.e.dt * this.masterSpeed;

        b.lifeCount+=this.e.dt;
        if(b.lifeCount>1){
          b.lifeCount=0;
          b.action="ready";
        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    // make lightning bolts

    if(this.setLightning===undefined){

      this.bolts = [];

      for(var i=0; i<6; i++){

        this.bCont = new PIXI.Container();
        this.bCont.sortableChildren = true;
        this.mainCont.addChild(this.bCont);

        this.bolt = new PIXI.Sprite(this.e.ui.t_lightning);
        this.bolt.anchor.x = .5;
        // this.bolt.scale.x = this.bolt.scale.y = .5;
        this.bolt.anchor.y = .95;
        this.bolt._zIndex=111;
        this.bCont.addChild(this.bolt);

        this.bolt.ani = this.e.ui.lightningAni;
        this.bolt.aniSpeed = .1;
        this.e.ui.animatedSprites.push(this.bolt);

        this.bCont.action = "ready";
        this.bCont.count = 0;
        this.bCont.sprite = this.bul;
        this.bCont.hit = this.bul;

        this.bolts.push(this.bCont);
        this.zLevs.push(this.bCont);

      }

      this.setLightning=true;

    }

    // shoot lightning

    if(this.lightning===1){
      this.lightningLim=1.5;
    }else if(this.lightning===2){
      this.lightningLim=1;
    }else if(this.lightning===3){
      this.lightningLim=.5;
    }

    this.lightningCount+=this.e.dt;
    if(this.lightningCount>this.lightningLim && this.lightning>=1){

      this.lightningCount=0;

      this.closeEnemies = [];

      //get en distance

      for(var i=0; i<this.enemies.length; i++){

        if(this.e.u.getDistance(this.enemies[i].enCont.position.x, this.enemies[i].enCont.position.y, this.playerCont.position.x, this.playerCont.position.y )<275){

          this.closeEnemies.push(this.enemies[i])

        }

      }

      this.foundBolt=false;

      for(var i=0; i<this.bolts.length; i++){

        if(this.bolts[i].action==="ready"){
          this.myBolt = this.bolts[i];
          this.foundBolt=true;
        }

      }

      if(this.foundBolt===true && this.closeEnemies.length>0){

        this.boltEnemy = this.e.u.apr(this.closeEnemies);

        this.myBolt.position.x = this.boltEnemy.enCont.position.x;
        this.myBolt.position.y = this.boltEnemy.enCont.position.y;
        this.myBolt.action = "strike"

        this.boltEnemy.life-=300;
        this.setBones(this.boltEnemy.enCont.position.x, this.boltEnemy.enCont.position.y,this.boltEnemy.type, 4)

        if(this.lightning===3){
          this.e.s.p("lightningSofter")
        }else{
          this.e.s.p("lightning")
        }


        for(var j=0; j<this.enemies.length; j++){

          var eDist = this.e.u.getDistance(this.enemies[j].enCont.position.x, this.enemies[j].enCont.position.y, this.myBolt.position.x, this.myBolt.position.y );

          if(eDist<40){

            // console.log(eDist);

            this.enemies[j].life-=300;
            this.setBones(this.enemies[j].enCont.position.x, this.enemies[j].enCont.position.y,this.enemies[j].type, 4)
          }

        }

      }


    }

    // bolt loop

    for(var i=0; i<this.bolts.length; i++){

      var b = this.bolts[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;
        b.flashCount = 0;
        b.count=0;

        b.alphaLev = 2;

      }else if(b.action==="strike"){

        b.action="striking";

      }else if(b.action==="striking"){

        b.alphaLev-=this.e.dt*4;

        b.flashCount+=this.e.dt;
        if(b.flashCount>.025){

          if(b.alpha===.1){
            b.alpha=b.alphaLev
          }else{
            b.alpha=.1;
          }

          b.flashCount=0;

        }

        b.count+=this.e.dt*2;
        if(b.count>1){
          b.count=0;
          b.action="ready";
        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    if(this.setBombs===undefined){

      // make bombs

      this.allBombs = [];

      for(var i=0; i<3; i++){

        this.bCont = new PIXI.Container();
        this.bCont.sortableChildren = true;
        this.mainCont.addChild(this.bCont);

        this.fCont = new PIXI.Container();
        this.fCont.sortableChildren = true;
        this.bCont.addChild(this.fCont);

        this.bomb = new PIXI.Sprite(this.e.ui.t_bomb);
        this.bomb.anchor.x = this.bomb.anchor.y = .5;
        this.bomb._zIndex=111;
        this.bomb.ani = this.e.ui.bombWait;
        this.bomb.aniSpeed = .025;
        this.e.ui.animatedSprites.push(this.bomb);
        this.bCont.addChild(this.bomb);

        this.fuse = new PIXI.Sprite(this.e.ui.t_fuse);
        this.fuse.anchor.x = this.fuse.anchor.y = .5;
        this.fuse._zIndex=110;
        this.fCont.addChild(this.fuse);

        this.bombExplode = new PIXI.Sprite(this.e.ui.t_bombExplode);
        this.bombExplode.anchor.x = this.bombExplode.anchor.y = .5;
        this.bombExplode.scale.x = this.bombExplode.scale.y = 4;
        this.bombExplode._zIndex=111;
        this.bCont.addChild(this.bombExplode);

        this.bombExplode2 = new PIXI.Sprite(this.e.ui.t_bombExplode);
        this.bombExplode2.anchor.x = .5
        this.bombExplode2.anchor.y = .75;
        this.bombExplode2.scale.x = this.bombExplode2.scale.y = .5;
        this.bombExplode2._zIndex=131;
        this.bombExplode2.ani = this.e.ui.bexAni;
        this.bombExplode2.aniSpeed=.04;
        this.bombExplode2.aniLoop=false;
        this.e.ui.animatedSprites.push(this.bombExplode2);
        this.bCont.addChild(this.bombExplode2);

        this.bCont.action = "ready";
        this.bCont.count = 0;
        this.bCont.sprite = this.bomb;
        this.bCont.fuse = this.fuse;
        this.bCont.explosion = this.bombExplode;
        this.bCont.explosion2 = this.bombExplode2;
        this.bCont.hit = this.bul;
        this.bCont.fCont = this.fCont;

        this.fuArray = [];

        for(var j=0; j<9; j++){

          if(j===0||j===3||j===6){
            this.fu = new PIXI.Sprite(this.e.ui.t_fuse1);
          }else if(j===1||j===4||j===7){
            this.fu = new PIXI.Sprite(this.e.ui.t_fuse2);
          }else if(j===2||j===5||j===8){
            this.fu = new PIXI.Sprite(this.e.ui.t_fuse3);
          }

          this.fu.width = this.fu.height = 3;
          this.fu.position.y = -12;
          this.fu.anchor.x = this.fu.anchor.y = .5;
          this.fu.alpha = 0;
          this.fu.zIndex = 200;
          this.fCont.addChild(this.fu);

          this.fuArray.push(this.fu);

        }

        this.bCont.fuArray = this.fuArray;

        this.allBombs.push(this.bCont);
        this.zLevs.push(this.bCont);

        this.setBombs=true;

      }

    }

    // set bomb limit

    if(this.bombs>0){

      if(this.bombs===1){

        this.bombLimit = 5

      }else if(this.bombs===2){

        this.bombLimit = 3.5

      }else if(this.bombs===3){

        this.bombLimit = 2

      }

    }

    // set bombs

    if (this.bombs > 0) {
      this.bombCount+=this.e.dt;

      if(this.bombCount>this.bombLimit){

        this.bombCount=0;

        for(var i=0; i<this.allBombs.length; i++){

          if(this.allBombs[i].action==="ready"){

            this.allBombs[i].action="set"
            i=100;

          }

        }

      }
    }

    // bomb loop

    for(var i=0; i<this.allBombs.length; i++){

      var b = this.allBombs[i];

      if(b.action==="ready"){

        b.position.x=10000;
        b.position.y=10000;
        b.flashCount = 0;
        b.count=0;
        b.fCount=0;

        // b.fuse.alpha=1;
        b.fCont.alpha=1;
        b.sprite.alpha=1;
        b.explosion.alpha=0;
        b.explosion2.alpha=0;
        b.fCont.position.y=0

      }else if(b.action==="set"){

        b.position.x = this.playerCont.position.x;
        b.position.y = this.playerCont.position.y+8;

        gsap.to( b.fCont.position, {y: 8, duration: 2,  ease: "sine.in"});

        b.action="waiting";

      }else if(b.action==="waiting"){

        b.explosion.alpha=0;
        b.explosion2.alpha=0;

        b.fCount+=this.e.dt;

        if(b.fCount>.03){

          b.fCount=0;

          for(var j=0; j<b.fuArray.length; j++){

            var f = b.fuArray[j];

            if(f.alpha===0){

              f.alpha = 1;
              f.width = f.height = 1.5;
              f.position.x = 0;
              f.position.y = -12;

              gsap.killTweensOf(f.position);
              gsap.killTweensOf(f.scale);
              gsap.killTweensOf(f);

              gsap.to( f.position, {x: f.position.x+this.e.u.nran(30), y: f.position.y+this.e.u.nran(30), duration: .3,  ease: "sine.in"});
              // gsap.to( f.scale, {x: 0, y: 0, duration: .3,  ease: "sine.in"});
              gsap.to( f, {alpha: 0, width: 0, height: 0, duration: .3,  ease: "sine.in"});

              j=20;

            }

          }

        }

        if(b.count<1){
          b.sprite.ani=this.e.ui.bombWait;
        }else{
          b.sprite.ani=this.e.ui.bombFlash;
        }

        b.count+=this.e.dt;
        if(b.count>2){

          b.count=0;

          for(var i=0; i<this.enemies.length; i++){

            if(this.bombs===1){
              var bombDist = 80;
              b.explosion.scale.x = b.explosion.scale.y = 2;
            }else if(this.bombs===2){
              var bombDist = 130;
              b.explosion.scale.x = b.explosion.scale.y = 2.5;
            }else if(this.bombs===3){
              var bombDist = 190;
              b.explosion.scale.x = b.explosion.scale.y = 3;
            }

            if( this.e.u.getDistance(b.position.x, b.position.y, this.enemies[i].enCont.position.x, this.enemies[i].enCont.position.y )<bombDist ){

              this.enemies[i].life-=200;
              this.setBones(this.enemies[i].enCont.position.x, this.enemies[i].enCont.position.y,this.enemies[i].type, 4)

            }

          }

          this.e.s.p("bomb")

          b.explosion.alpha=.75;
          // b.explosion.scale.x = b.explosion.scale.y = 1
          gsap.to( b.explosion.scale, {x: 0, y: 0, duration: .75,  ease: "expo.out"});
          // gsap.to( b.explosion, {width: 1, height: 1, duration: .75,  ease: "expo.out"});
          gsap.to( b.explosion, {alpha: 0, duration: .75,  ease: "expo.out"});

          b.explosion2.alpha=1;
          b.explosion2.curFrame=0;

          b.action="explode";

        }

      }else if(b.action==="explode"){


        b.fCont.alpha = 0;
        // b.fuse.alpha=0;
        b.sprite.alpha=0;

        b.count+=this.e.dt;
        if(b.count>1){

          b.count=0;
          b.action="ready"

        }

      }

    }

    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------

    if(this.stealthLevel > 0){

      const cooldownTarget = (this.stealthLevel === 1) ? 16 : 9;

      if(this.stealthActive === false){
        this.stealthCooldown += this.e.dt;
        if(this.stealthCooldown >= cooldownTarget){
          this.stealthCooldown = 0;
          this.stealthActive = true;
          this.stealthTimer = 0;
          this.stealthSpeedBefore = this.playerSpeed;
          this.stealthTarget.x = this.playerCont.position.x;
          this.stealthTarget.y = this.playerCont.position.y;
          this.playerCont.alpha = 0.3;
        }
      }else{
        this.stealthTimer += this.e.dt;
        if(this.stealthTimer >= 4){
          this.stealthTimer = 0;
          this.stealthActive = false;
          this.playerSpeed = this.stealthSpeedBefore;
          this.playerCont.alpha = 1;
          this.stealthTarget.x = this.playerCont.position.x;
          this.stealthTarget.y = this.playerCont.position.y;

          this.clearEnemiesNearPlayer(100);
        }
      }

      if(this.stealthActive === false){
        this.stealthTarget.x = this.playerCont.position.x;
        this.stealthTarget.y = this.playerCont.position.y;
      }

      if(this.stealthActive === true){
        this.playerSpeed = this.stealthSpeedBefore * 1.25;
      }

      const stealthEl = document.getElementById('stealthText');
      if(stealthEl){
        if(this.stealthActive === true){
          const remaining = Math.max(0, 4 - this.stealthTimer);
          const remainInt = Math.round(remaining);
          stealthEl.style.display = 'block';
          stealthEl.textContent = "STEALTH " + remainInt;
          const screenX = window.innerWidth / 2;
          const screenY = window.innerHeight / 2 - 100;
          stealthEl.style.left = screenX + "px";
          stealthEl.style.top = screenY + "px";
        }else{
          stealthEl.style.display = 'none';
        }
      }

    }else{
      this.stealthActive = false;
      this.stealthTimer = 0;
      this.stealthCooldown = 0;
      if(this.playerAction==="go"){
        this.playerCont.alpha = 1;
      }
      this.stealthTarget.x = this.playerCont.position.x;
      this.stealthTarget.y = this.playerCont.position.y;
      const stealthElOff = document.getElementById('stealthText');
      if(stealthElOff){
        stealthElOff.style.display = 'none';
      }
    }

    if(this.enemies!==undefined){

      var closest = null;
      var closestNum = 10000;
      const aimOriginX = this.playerCont.position.x;
      const aimOriginY = this.playerCont.position.y;

      for(var i=0; i<this.enemies.length; i++){

        var en = this.enemies[i];
        // this.enemies[i].hand.alpha=.1;
        var dist = this.e.u.getDistance(en.enCont.position.x, en.enCont.position.y, aimOriginX, aimOriginY);

        if(dist<closestNum && en.freezeCount<=0){
          closestNum = dist;
          closest = this.enemies[i];
        }

      }

      if(closest!==null){

        // closest.hand.alpha=1;

        this.hand.rotation = Math.atan2( aimOriginY - closest.enCont.position.y, aimOriginX - closest.enCont.position.x) + this.e.u.ca(180);

        var hDif = this.hand.rotation - this.hand2.rotation;

        if(this.e.u.ca2(hDif)>180){
          this.hand2.rotation+=this.e.u.ca(360)
        }else if(this.e.u.ca2(hDif)<-180){
          this.hand2.rotation-=this.e.u.ca(360)
        }

        this.hand2.rotation = this.e.u.lerp(this.hand2.rotation, this.hand.rotation, 10*this.e.dt);

        if(this.e.u.ca2(this.hand2.rotation)>180){
          this.hand2.zIndex = 10;
        }else{
          this.hand2.zIndex = 30;
        }

      }

    }

    // this.hand.rotation = Math.atan2( -(window.innerHeight/2) + this.e.mouse.y, -(window.innerWidth/2) + this.e.mouse.x);

    //-------------------------------------------------------------------------------------

    this.playerAniSpeed = .075;

    if(this.e.mobile===false){

      // XSPEED

      if(this.e.input.keyRight===true){

        this.xspeed+=this.speedIncrease*this.e.dt * this.masterSpeed;
        if(this.xspeed>this.playerSpeed){
          this.xspeed=this.playerSpeed;
        }

        this.player.ani = this.e.ui.runAni_s
        this.player.scale.x = 1
        this.lastDir = "r";
        this.player.aniSpeed = this.playerAniSpeed*.8;

      }else if(this.e.input.keyLeft===true){

        this.xspeed-=this.speedIncrease*this.e.dt * this.masterSpeed;
        if(this.xspeed<-this.playerSpeed){
          this.xspeed=-this.playerSpeed;
        }

        this.player.ani = this.e.ui.runAni_s
        this.player.scale.x = -1
        this.lastDir = "l";
        this.player.aniSpeed = this.playerAniSpeed*.8;

      }else{

        this.xspeed*=this.speedDecrease;

      }

      // YSPEED

      if(this.e.input.keyDown===true){

        this.yspeed+=this.speedIncrease*this.e.dt * this.masterSpeed;
        if(this.yspeed>this.playerSpeed){
          this.yspeed=this.playerSpeed;
        }

        this.player.ani = this.e.ui.runAni_d
        this.lastDir = "d";
        this.player.aniSpeed = this.playerAniSpeed;

      }else if(this.e.input.keyUp===true){

        this.yspeed-=this.speedIncrease*this.e.dt * this.masterSpeed;
        if(this.yspeed<-this.playerSpeed){
          this.yspeed=-this.playerSpeed;
        }

        this.player.ani = this.e.ui.runAni_u
        this.lastDir = "u";
        this.player.aniSpeed = this.playerAniSpeed;

      }else{

        this.yspeed*=this.speedDecrease;

      }

    }else{

      if(this.e.input.ongoingTouches.length>0){

        this.xspeed = (this.playerSpeed*this.e.input.speedMultX);
        this.yspeed = (this.playerSpeed*this.e.input.speedMultY);

      }else{

        this.xspeed*=this.speedDecrease
        this.yspeed*=this.speedDecrease

      }

      // console.log(Math.abs(this.xspeed)+" / "+Math.abs(this.yspeed))

      if(Math.abs(this.xspeed)>Math.abs(this.yspeed)){

        if(this.xspeed>0){
          this.player.ani = this.e.ui.runAni_s
          this.lastDir = "r";
          this.player.aniSpeed = this.playerAniSpeed*.8;
          this.player.scale.x = 1
        }else{
          this.player.ani = this.e.ui.runAni_s
          this.lastDir = "l";
          this.player.aniSpeed = this.playerAniSpeed*.8;
          this.player.scale.x = -1
        }

      }else{

        if(this.yspeed<0){
          this.player.ani = this.e.ui.runAni_u
          this.lastDir = "u";
          this.player.aniSpeed = this.playerAniSpeed;
        }else{
          this.player.ani = this.e.ui.runAni_d
          this.lastDir = "d";
          this.player.aniSpeed = this.playerAniSpeed;
        }

      }

    }

    //-------------------------------------------------------------------------------------

    if(
      this.e.input.keyDown===false && this.e.input.keyUp===false && this.e.input.keyRight===false && this.e.input.keyLeft===false && this.e.mobile===false ||
      this.e.input.ongoingTouches.length===0 && this.e.mobile===true
      ){

      this.player.aniSpeed = .25;

      if(this.lastDir === "r"){
        this.player.ani = this.e.ui.stanceAni_s
      }else if(this.lastDir === "l"){
        this.player.ani = this.e.ui.stanceAni_s
      }else if(this.lastDir === "u"){
        this.player.ani = this.e.ui.stanceAni_u
      }else if(this.lastDir === "d"){
        this.player.ani = this.e.ui.stanceAni_d
      }

    }

    //-------------------------------------------------------------------------------------

    // APPLY SPEEDS

    this.xDest = this.playerCont.position.x + (this.xspeed * this.e.dt * this.masterSpeed);
    this.yDest = this.playerCont.position.y + (this.yspeed * this.e.dt * this.masterSpeed);

    var bushPass = true;
    this.hitBushes = [];

    // check against big bushes

    for(var i=0; i<this.bushes.length; i++){

      var bDist = this.e.u.getDistance(this.xDest, this.yDest, this.bushes[i].position.x, this.bushes[i].position.y-25);

      if(bDist<35){
        this.hitBushes.push(this.bushes[i]);
      }

    }

    for(var i=0; i<this.bushesMed.length; i++){

      var bDist = this.e.u.getDistance(this.xDest, this.yDest, this.bushesMed[i].position.x, this.bushesMed[i].position.y-19);

      if(bDist<27){
        this.hitBushes.push(this.bushesMed[i]);
      }

    }

    for(var i=0; i<this.bushesSmall.length; i++){

      if(this.bushesSmall[i].type==="prop"){

        var propBlockHalf = this.bushesSmall[i].size === "big" ? 12 : 9;
        var propFootY = this.bushesSmall[i].position.y - propBlockHalf;
        var bDist = this.e.u.getDistance(this.xDest, this.yDest, this.bushesSmall[i].position.x, propFootY);

        if(bDist<propBlockHalf + 10){
          this.hitBushes.push(this.bushesSmall[i]);
        }

      }else{

        var bDist = this.e.u.getDistance(this.xDest, this.yDest, this.bushesSmall[i].position.x, this.bushesSmall[i].position.y-12);

        if(bDist<16){
          this.hitBushes.push(this.bushesSmall[i]);
        }

      }

    }

    var bushPassX = true;
    var bushPassY = true;
    var checkDist = 10;

    // cycle through the hit bushes and see if sliding can happen

    if(
      this.e.input.keyDown===false && this.e.input.keyUp===false && this.e.input.keyRight===true  ||
      this.e.input.keyDown===false && this.e.input.keyUp===false && this.e.input.keyLeft===true
      ){

      for(var i=0; i<this.hitBushes.length; i++){

        if(this.hitBushes[i].type==="big"){
          this.distCheck=35;
          this.bushOffset=25;
        }else if(this.hitBushes[i].type==="med"){
          this.distCheck=27;
          this.bushOffset=19;
        }else if(this.hitBushes[i].type==="small"){
          this.distCheck=16;
          this.bushOffset=12;
        }else if(this.hitBushes[i].type==="prop"){
          this.distCheck = this.hitBushes[i].size === "big" ? 20 : 16;
          this.bushOffset = this.hitBushes[i].size === "big" ? 12 : 9;
        }

        var topCheck = this.e.u.getDistance(this.xDest, this.playerCont.position.y-checkDist, this.hitBushes[i].position.x, this.hitBushes[i].position.y-this.bushOffset);
        var botCheck = this.e.u.getDistance(this.xDest, this.playerCont.position.y+checkDist, this.hitBushes[i].position.x, this.hitBushes[i].position.y-this.bushOffset);

        if(topCheck<this.distCheck && botCheck>this.distCheck){

          bushPassX=false;
          bushPassY=true;
          this.yDest = this.playerCont.position.y + (this.playerSpeed/2 * this.e.dt * this.masterSpeed);

        }else if(botCheck<this.distCheck && topCheck>this.distCheck){

          bushPassX=false;
          bushPassY=true;
          this.yDest = this.playerCont.position.y - (this.playerSpeed/2 * this.e.dt * this.masterSpeed);

        }else{

          bushPassX=false;
          bushPassY=false;

        }

      }

    }else if(
      this.e.input.keyRight===false && this.e.input.keyLeft===false && this.e.input.keyUp===true  ||
      this.e.input.keyRight===false && this.e.input.keyLeft===false && this.e.input.keyDown===true
    ){

      for(var i=0; i<this.hitBushes.length; i++){

        if(this.hitBushes[i].type==="big"){
          this.distCheck=35;
          this.bushOffset=25;
        }else if(this.hitBushes[i].type==="med"){
          this.distCheck=27
          this.bushOffset=19;
        }else if(this.hitBushes[i].type==="small"){
          this.distCheck=16;
          this.bushOffset=12;
        }else if(this.hitBushes[i].type==="prop"){
          this.distCheck = this.hitBushes[i].size === "big" ? 20 : 16;
          this.bushOffset = this.hitBushes[i].size === "big" ? 12 : 9;
        }

        var rightCheck = this.e.u.getDistance(this.playerCont.position.x+checkDist, this.yDest, this.hitBushes[i].position.x, this.hitBushes[i].position.y-this.bushOffset);
        var leftCheck  = this.e.u.getDistance(this.playerCont.position.x-checkDist, this.yDest, this.hitBushes[i].position.x, this.hitBushes[i].position.y-this.bushOffset);

        // console.log(Math.round(rightCheck)+" / "+Math.round(leftCheck))

        if(rightCheck<this.distCheck && leftCheck>this.distCheck){

          bushPassY=false;
          bushPassX=true;
          this.xDest = this.playerCont.position.x - (this.playerSpeed/2 * this.e.dt * this.masterSpeed);

        }else if(leftCheck<this.distCheck && rightCheck>this.distCheck){

          bushPassY=false;
          bushPassX=true;
          this.xDest = this.playerCont.position.x + (this.playerSpeed/2 * this.e.dt * this.masterSpeed);

        }else{

          bushPassX=false;
          bushPassY=false;

        }

      }

    }else if (this.hitBushes.length>0){

      bushPassX=false;
      bushPassY=false;

    }

    // console.log(bushPassX+" / "+bushPassY);

    //-----------------------------------------------------

    const playerBgOffsetX = this.backgroundCont ? this.backgroundCont.position.x : 0;
    const playerBgOffsetY = this.backgroundCont ? this.backgroundCont.position.y : 0;
    const colliderPassX = !this.isPointBlockedByWalkBodies(
      this.xDest + playerBgOffsetX,
      this.playerCont.position.y + playerBgOffsetY
    );
    const colliderPassY = !this.isPointBlockedByWalkBodies(
      this.playerCont.position.x + playerBgOffsetX,
      this.yDest + playerBgOffsetY
    );
    if (colliderPassX === false) {
      bushPassX = false;
    }
    if (colliderPassY === false) {
      bushPassY = false;
    }

    if(this.playerCont.position.x>1250){
      this.playerCont.position.x=1250;
    }else if( this.playerCont.position.x<-1250){
      this.playerCont.position.x=-1250;
    }else if(bushPassX===false){
      // bush pass x
    }else{
      this.playerCont.position.x = this.xDest;
    }

    if(this.playerCont.position.y>1250){
      this.playerCont.position.y=1250;
    }else if(this.playerCont.position.y<-1250){
      this.playerCont.position.y=-1250;
    }else if(bushPassY===false){
      // bush pass y
    }else{
      this.playerCont.position.y = this.yDest;
    }

    //-------------------------------------------------------------------------------------

    // var lm = 1

    if(this.coinAmount>=this.levCoinAmount && this.hasWon===false){

      this.action="power up start"
      this.syncPauseButtonChrome();

    }

  }

  makeBullet(rot, damage, type){

    var myBul = null;
    const spawnDist = 20;
    const len = this.bullets.length;
    if (!len) return null;

    const assignSlot = (slot, idx) => {
      slot.rotation = rot;
      slot.damage = damage;
      slot.position.x = this.playerCont.position.x + Math.cos(slot.rotation) * spawnDist;
      slot.position.y = this.playerInnerCont.position.y + this.playerCont.position.y + Math.sin(slot.rotation) * spawnDist;
      slot.type = type;
      slot.lifeCount = 0;
      slot.action = "shoot";
      this._bulletPoolScan = (idx + 1) % len;
      return slot;
    };

    let start = (this._bulletPoolScan | 0) % len;
    for (let pass = 0; pass < len; pass++) {
      const i = (start + pass) % len;
      if (this.bullets[i].action === "ready") {
        myBul = assignSlot(this.bullets[i], i);
        break;
      }
    }

    if (myBul === null) {
      let bestI = -1;
      let bestLife = -1;
      for (let i = 0; i < len; i++) {
        const bi = this.bullets[i];
        if (bi.action === "shooting" && bi.lifeCount > bestLife) {
          bestLife = bi.lifeCount;
          bestI = i;
        }
      }
      if (bestI >= 0) {
        const reuse = this.bullets[bestI];
        if (reuse.action === "shrink" || reuse.action === "shrinking") {
          gsap.killTweensOf(reuse.scale);
          reuse.scale.x = reuse.scale.y = 0.5;
        }
        myBul = assignSlot(reuse, bestI);
      }
    }

    return myBul;

  }

  shootFireBall(){

    // console.log("shoot fireball "+this.fireBallShots)

    if(this.fireBallShots===1){

      this.fireBalls[0].rotation = this.hand.rotation;

    }else if(this.fireBallShots===2){

      this.fireBalls[0].rotation = this.hand.rotation - this.e.u.ca(-10);
      this.fireBalls[1].rotation = this.hand.rotation - this.e.u.ca(10);

    }else if(this.fireBallShots===3){

      this.fireBalls[0].rotation = this.hand.rotation - this.e.u.ca(-20);
      this.fireBalls[1].rotation = this.hand.rotation;
      this.fireBalls[2].rotation = this.hand.rotation - this.e.u.ca(20);

    }
    for(var i=0; i<this.fireBallShots; i++){

        this.fireBalls[i].position.x = this.playerCont.position.x + Math.cos(this.fireBalls[i].rotation) * 20;
        this.fireBalls[i].position.y = this.playerCont.position.y + Math.sin(this.fireBalls[i].rotation) * 20;

        this.fireBalls[i].action = "shoot";

    }


  }

}
