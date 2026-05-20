
console.log("start index")

import { Engine } from "./engine.js";
import { Scene } from "./scene.js";
import { Input } from "./input.js";
import { Sounds } from "./sounds.js";
import { Utilities } from "./u.js";
import { UI } from "./ui.js";

import './main.css';

//------------------------------------------------------------
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
