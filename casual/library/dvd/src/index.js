
import { Engine } from "./engine.js";
import { Scene } from "./scene.js";
import { Input } from "./input.js";
import { Sounds } from "./sounds.js";
import { Utilities } from "./u.js";
import { UI } from "./ui.js";

//------------------------------------------------------------

var scene = new Scene();
var input = new Input();
var sounds = new Sounds();
var utilities = new Utilities();
var ui = new UI();

var engine = new Engine(
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

engine.start(engine);

//------------------------------------------------------------

function update() {
  engine.update();
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
