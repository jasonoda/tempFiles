
import { Enemy } from "./enemy.js";
import { Engine } from "./engine.js";
import { Scene } from "./scene.js";
import { Input } from "./input.js";
import { LevelMaker } from "./levelMaker.js";
import { Loader } from "./loader.js";
import { Player } from "./player.js";
import { Shaders } from "./shaders.js";
import { Sounds } from "./sounds.js";
import { Utilities } from "./u.js";
import { UI } from "./ui.js";

import './main.css';

/**
 * De-obfuscate an obfuscated string with the method above.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   same number that was used for obfuscation
 * @return {[type]}     plaintext string
 */
String.prototype._0x6cc90a = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  return this.toString()._0xa68b0d(n - key);
};

/**
 * Obfuscate a plaintext string with a simple rotation algorithm similar to
 * the rot13 cipher.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   maximum char that will be affected by the algorithm
 * @return {[type]}     obfuscated string
 */
String.prototype._0xa68b0d = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  var chars = this.toString().split('');

  for (var i = 0; i < chars.length; i++) {
    var c = chars[i].charCodeAt(0);

    if (c <= n) {
      chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
    }
  }

  return chars.join('');
};

//------------------------------------------------------------

var scene = new Scene();
var input = new Input();
var levelMaker = new LevelMaker();
var loader = new Loader();
var player = new Player();
var enemy = new Enemy();
var shaders = new Shaders();
var sounds = new Sounds();
var utilities = new Utilities();
var ui = new UI();

/**
 * De-obfuscate an obfuscated string with the method above.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   same number that was used for obfuscation
 * @return {[type]}     plaintext string
 */
String.prototype._0x6cc90a = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  return this.toString()._0xa68b0d(n - key);
};

/**
 * Obfuscate a plaintext string with a simple rotation algorithm similar to
 * the rot13 cipher.
 * @param  {[type]} key rotation index between 0 and n
 * @param  {Number} n   maximum char that will be affected by the algorithm
 * @return {[type]}     obfuscated string
 */
String.prototype._0xa68b0d = function(key, n = 126) {
  // return String itself if the given parameters are invalid
  if (!(typeof(key) === 'number' && key % 1 === 0)
      || !(typeof(key) === 'number' && key % 1 === 0)) {
    return this.toString();
  }

  var chars = this.toString().split('');

  for (var i = 0; i < chars.length; i++) {
    var c = chars[i].charCodeAt(0);

    if (c <= n) {
      chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
    }
  }

  return chars.join('');
};

var engine = new Engine(
  "",
  false,
  scene,
  input,
  levelMaker,
  loader,
  player,
  enemy,
  shaders,
  sounds,
  utilities,
  ui
);

ui.setUp(engine);
utilities.setUp(engine);
levelMaker.setUp(engine);
loader.setUp(engine);
player.setUp(engine);
enemy.setUp(engine);
shaders.setUp(engine);
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
