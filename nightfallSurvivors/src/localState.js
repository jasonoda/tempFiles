import { CrazyGamesAPI } from './crazyGames.js';

const JEWEL_STORAGE_KEY = 'bgJewels';
const STORE_STORAGE_KEY = 'bgStoreUpgrades';
const HIGH_SCORE_STORAGE_KEY = 'bgHighScore';

const UPGRADE_IDS = [
  'damage',
  'speedShot',
  'extra',
  'magnet',
  'speed',
  'jewelShot',
  'heart',
  'bulletShield',
  'coinShot',
];

const defaultUpgrades = () => {
  const upgrades = {};
  for (let i = 0; i < UPGRADE_IDS.length; i++) {
    upgrades[UPGRADE_IDS[i]] = 0;
  }
  return upgrades;
};

function parseJewelCount(value) {
  if (value == null) return 0;
  const trimmed = String(value).trim();
  if (!trimmed) return 0;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function loadItem(key) {
  return CrazyGamesAPI.getItem(key);
}

function saveItem(key, value) {
  const str = value == null ? '' : String(value);
  let saved = false;

  try {
    const writeOk = CrazyGamesAPI.setItem(key, str);
    const apiReadback = CrazyGamesAPI.getItem(key);
    const apiReadbackStr = apiReadback == null ? '' : String(apiReadback);
    saved = writeOk === true && apiReadbackStr === str;
  } catch (err) {
    saved = false;
  }

  if (!saved) {
    try {
      localStorage.setItem(key, str);
      const localReadback = localStorage.getItem(key);
      saved = localReadback === str;
    } catch (err) {
      saved = false;
    }
  }

  return saved;
}

export const LocalState = {
  init(options = {}) {
    const merge = options.merge === true;
    this.jewels.init({ merge });
    this.store.init({ merge });
    this.highScore.init({ merge });
  },

  jewels: {
    total: 0,

    init(options = {}) {
      const merge = options.merge === true;
      try {
        const loaded = parseJewelCount(loadItem(JEWEL_STORAGE_KEY));
        if (merge) {
          this.total = Math.max(this.total, loaded);
        } else {
          this.total = loaded;
        }
      } catch (err) {
        if (!merge) {
          this.total = 0;
        }
      }
    },

    save() {
      const value = String(this.total);
      saveItem(JEWEL_STORAGE_KEY, value);
    },

    getTotal() {
      return this.total;
    },

    add(count) {
      if (!count) return;
      this.total += count;
      this.save();
    },

    spend(amount) {
      const cost = Math.max(0, parseInt(amount, 10) || 0);
      if (this.total < cost) return false;
      this.total -= cost;
      this.save();
      return true;
    },

    setTotal(value) {
      this.total = Math.max(0, parseInt(value, 10) || 0);
      this.save();
    },
  },

  store: {
    maxLevel: 3,
    maxLevels: {
      bulletShield: 2,
    },
    upgradeCosts: {
      damage: [25, 50, 100],
      speedShot: [25, 50, 100],
      extra: [25, 50, 100],
      magnet: [25, 50, 100],
      speed: [25, 50, 100],
      jewelShot: [25, 50, 100],
      heart: [25, 50, 100],
      bulletShield: [25, 50],
      coinShot: [25, 50, 100],
    },
    upgrades: defaultUpgrades(),

    getMaxLevel(upgradeId) {
      if (this.maxLevels[upgradeId] != null) return this.maxLevels[upgradeId];
      return this.maxLevel;
    },

    init(options = {}) {
      const merge = options.merge === true;
      try {
        const stored = loadItem(STORE_STORAGE_KEY);
        if (stored != null && String(stored).trim() !== '') {
          const parsed = JSON.parse(stored);
          const base = defaultUpgrades();
          for (let i = 0; i < UPGRADE_IDS.length; i++) {
            const id = UPGRADE_IDS[i];
            const val = parsed[id];
            base[id] = Math.max(0, Math.min(this.getMaxLevel(id), parseInt(val, 10) || 0));
          }
          if (merge) {
            for (let i = 0; i < UPGRADE_IDS.length; i++) {
              const id = UPGRADE_IDS[i];
              this.upgrades[id] = Math.max(this.upgrades[id] || 0, base[id]);
            }
          } else {
            this.upgrades = base;
          }
        } else if (!merge) {
          this.upgrades = defaultUpgrades();
        }
      } catch (err) {
        if (!merge) {
          this.upgrades = defaultUpgrades();
        }
      }
    },

    save() {
      saveItem(STORE_STORAGE_KEY, JSON.stringify(this.upgrades));
    },

    getLevel(upgradeId) {
      return this.upgrades[upgradeId] || 0;
    },

    setLevel(upgradeId, level) {
      if (!UPGRADE_IDS.includes(upgradeId)) return;
      this.upgrades[upgradeId] = Math.max(0, Math.min(this.getMaxLevel(upgradeId), level));
      this.save();
    },

    getCostForNextLevel(upgradeId, currentLevel) {
      if (currentLevel >= this.getMaxLevel(upgradeId)) return 0;
      const costs = this.upgradeCosts[upgradeId];
      if (!costs) return 0;
      return costs[currentLevel] || 0;
    },

    resetAll() {
      this.upgrades = defaultUpgrades();
      this.save();
    },
  },

  highScore: {
    best: 0,

    init(options = {}) {
      const merge = options.merge === true;
      try {
        const loaded = parseJewelCount(loadItem(HIGH_SCORE_STORAGE_KEY));
        if (merge) {
          this.best = Math.max(this.best, loaded);
        } else {
          this.best = loaded;
        }
      } catch (err) {
        if (!merge) {
          this.best = 0;
        }
      }
    },

    save() {
      saveItem(HIGH_SCORE_STORAGE_KEY, String(this.best));
    },

    getBest() {
      return this.best;
    },

    recordScore(score) {
      const value = Math.max(0, parseInt(score, 10) || 0);
      if (value > this.best) {
        this.best = value;
        this.save();
        return true;
      }
      return false;
    },

    syncSplashDisplay() {
      const el = document.getElementById('highScoreValue');
      if (el) el.textContent = String(this.best);
    },
  },
};
