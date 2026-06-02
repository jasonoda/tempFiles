
import { Engine } from "./engine.js";
import { Scene } from "./scene.js";
import { Input } from "./input.js";
import { Sounds } from "./sounds.js";
import { Utilities } from "./u.js";
import { UI } from "./ui.js";
import { CrazyGamesAPI } from "./crazyGames.js";
import { LocalState } from "./localState.js";
//------------------------------------------------------------

var scene = new Scene();
var input = new Input();
var sounds = new Sounds();
var utilities = new Utilities();
var ui = new UI();

var engine = new Engine(
  "",
  false,
  scene,
  input,
  sounds,
  utilities,
  ui
);

ui.setUp(engine);
utilities.setUp(engine);
sounds.setUp(engine);
input.setUp(engine);
scene.setUp(engine);

//------------------------------------------------------------

function refreshPersistentState() {
  LocalState.init({ merge: true });
  LocalState.jewels.save();
  LocalState.store.save();
  LocalState.highScore.save();
  scene.syncJewelDisplays();
  scene.syncProgressStoreCells();
  LocalState.highScore.syncSplashDisplay();
}

function update() {
  engine.update();
  requestAnimationFrame(update);
}

function startGameLoop() {
  requestAnimationFrame(update);
}

async function bootSdk() {
  try {
    await CrazyGamesAPI.init();
    CrazyGamesAPI.loadingStart();
    CrazyGamesAPI.setupGameModule(engine);
    engine.initMuteState();
    CrazyGamesAPI.setupUserModule({ fetchUserOnSetup: true });
    await CrazyGamesAPI.setupDataModule();
    refreshPersistentState();
  } catch (err) {
    console.error('[boot] failed:', err);
    try {
      refreshPersistentState();
    } catch (stateErr) {
      console.error('[boot] refreshPersistentState failed:', stateErr);
    }
  }
}

async function boot() {
  if (!CrazyGamesAPI.enforceSitelock()) {
    return;
  }

  CrazyGamesAPI.setupBrowserUX(engine);
  startGameLoop();
  bootSdk();
}

boot();
