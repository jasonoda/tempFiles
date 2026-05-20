// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

import "./customInit.js";
import { EndScore } from "../../endScore.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	// Loading script asynchronously directly to the DOM
	const loadJS = function(url, id) {
		return new Promise((resolve, reject) => {
			var scriptTag = document.createElement('script');
			scriptTag.src = url;
			scriptTag.id = id;
			scriptTag.onload = () => resolve();
			scriptTag.onreadystatechange = () => resolve();
			scriptTag.onerror = () => reject();
			document.head.appendChild(scriptTag);
		});
	}
	try {
 		await loadJS("./scripts/project/crypto-js.js", "cjs");
	} catch {
		try {
			console.log(`Looking for crypto-js at root`);
			await loadJS("./crypto-js.js", "cjs");
		} catch (err) {
			console.log(`Missing crypto-js ${err.message}`);
		}
	}
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
	/**
      * Obfuscate a plaintext string with a simple rotation algorithm similar to
      * the rot13 cipher.
      * @param  {[type]} key rotation index between 0 and n
      * @param  {Number} n   maximum char that will be affected by the algorithm
      * @return {[type]}     obfuscated string
      */
	String.prototype._0x083c9db = function(key, n = 126) {
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

	/**
	  * De-obfuscate an obfuscated string with the method above.
	  * @param  {[type]} key rotation index between 0 and n
	  * @param  {Number} n   same number that was used for obfuscation
	  * @return {[type]}     plaintext string
	  */
	String.prototype._0xd7a82c = function(key, n = 126) {
		// return String itself if the given parameters are invalid
		if (!(typeof(key) === 'number' && key % 1 === 0)
			|| !(typeof(key) === 'number' && key % 1 === 0)) {
			return this.toString();
		}

		return this.toString()._0x083c9db(n - key);
	};
	console.log('TESTING THE DE-OBS FUNCTION');
	console.log('Sv{ny`p|r'._0xd7a82c(13));

});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	// Code to run every tick
}
