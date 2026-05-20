// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import { EndScore } from "../../endScore.js";

// Create global instance of EndScore
let endScoreInstance = null;

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	// Initialize EndScore instance
	endScoreInstance = new EndScore();
	
	// Add test button click handler
	document.addEventListener('DOMContentLoaded', () => {
		const testButton = document.getElementById('testEndScore');
		if (testButton) {
			testButton.addEventListener('click', () => {
				const randomScore = Math.floor(Math.random() * 149000) + 1000;
				if (endScoreInstance) {
					endScoreInstance.createFinalScoreOverlay(randomScore, []);
				}
			});
		}
	});
	
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
	
	// Position startMenuContainer at 25% from bottom and make it visible
	const startMenuContainer = document.getElementById('startMenuContainer');
	if (startMenuContainer) {
		// Position at 25% from bottom
		startMenuContainer.style.position = 'absolute';
		startMenuContainer.style.bottom = '15%';
		startMenuContainer.style.left = '50%';
		startMenuContainer.style.transform = 'translateX(-50%)';
		
		// Make visible and enable interaction
		startMenuContainer.style.opacity = '1';
		startMenuContainer.style.pointerEvents = 'auto';
		
		console.log('startMenuContainer positioned at 25% from bottom and made visible');
	}
	
	// Add play button click handler
	const playButton = document.getElementById('playButton');
	if (playButton) {
		playButton.addEventListener('click', () => {
			console.log('Play button clicked - setting starPushed and hiding startMenu');
			
			// Set starPushed to true in engine object
			if (runtime && runtime.objects && runtime.objects.engine) {
				const engineObj = runtime.objects.engine.getFirstInstance();
				if (engineObj && engineObj.instVars) {
					engineObj.instVars.starPushed = true;
					console.log('starPushed set to true');
				}
			}
			
			// Hide startMenu and disable pointer events
			const startMenu = document.getElementById('startMenu');
			if (startMenu) {
				startMenu.style.display = 'none';
				startMenu.style.pointerEvents = 'none';
				console.log('startMenu hidden and pointer events disabled');
			} else {
				console.log('startMenu element not found');
			}
		});
	}
	
	// Move startIns object Y position to 10000 when game starts
	if (runtime.objects.startIns && runtime.objects.startIns.getFirstInstance()) {
		const startInsObj = runtime.objects.startIns.getFirstInstance();
		startInsObj.y = 10000;
		console.log('startIns Y position set to 10000 on game start');
	}
	
	// Add B key debug listener for testing EndScore
	document.addEventListener('keydown', (event) => {
		if (event.key.toLowerCase() === 'b') {
			// alert('B key pressed - testing EndScore');
			// Generate random score and trigger EndScore
			const randomScore = Math.floor(Math.random() * 149000) + 1000;
			console.log('Random score generated:', randomScore);
			
			if (endScoreInstance) {
				
				console.log('EndScore instance found, calling createFinalScoreOverlay');
				endScoreInstance.createFinalScoreOverlay(randomScore, []);
			} else {
				// alert("B");
				console.log('EndScore instance not available');
			}
		}
	});
	
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	// Code to run every tick
	
	// Update the score display
	try {
		// Try to get score from engine object (based on the codebase)
		let currentScore = 0;
		if (runtime.objects.engine && runtime.objects.engine.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			if (engineObj.instVars && engineObj.instVars.score !== undefined) {
				currentScore = engineObj.instVars.score;
			}
		}
		
		// Update the score display in upperRightDiv
		const scoreDiv = document.getElementById('upperRightDiv');
		if (scoreDiv) {
			scoreDiv.textContent = currentScore.toLocaleString();
		}
		
		// Update the time display in upperLeftDiv
		const timeDiv = document.getElementById('upperLeftDiv');
		if (timeDiv) {
			// Get game time from engine object instance variables
			let gameMin = 0;
			let gameSec = 0;
			
			// Try to get game time variables from engine object
			if (runtime.objects.engine && runtime.objects.engine.getFirstInstance()) {
				const engineObj = runtime.objects.engine.getFirstInstance();
				if (engineObj.instVars && engineObj.instVars.gameMin !== undefined) {
					gameMin = engineObj.instVars.gameMin;
				}
				if (engineObj.instVars && engineObj.instVars.gameSec !== undefined) {
					gameSec = engineObj.instVars.gameSec;
				}
			}
			
			// Format time as M:SS (no leading zero for minutes)
			const timeString = `${gameMin}:${gameSec.toString().padStart(2, '0')}`;
			timeDiv.textContent = timeString;
			
			// Debug logging to see what's happening
			console.log('Time update - gameMin:', gameMin, 'gameSec:', gameSec, 'formatted:', timeString);
		}
		
		// Check for game end condition
		CheckForGameEnd(runtime, currentScore);
		
		// Check if action is "play" and hide startMenu
		if (runtime.objects.engine && runtime.objects.engine.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			if (engineObj.instVars && engineObj.instVars.action === "play") {
				const startMenu = document.getElementById('startMenu');
				if (startMenu && startMenu.style.display !== 'none') {
					startMenu.style.display = 'none';
					startMenu.style.pointerEvents = 'none';
					console.log('startMenu hidden due to action being "play"');
				}
			}
		}
		
	} catch (error) {
		// Log errors to help debug
		console.log('Score update error:', error);
	}
}

// Function to check if the game has ended
function CheckForGameEnd(runtime, currentScore) {
	try {
		// Check for game over action being set
		if (runtime.objects.engine && runtime.objects.engine.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			if (engineObj.instVars && engineObj.instVars.action === "gameOver") {
				if (!window.gameEndAlertShown) {
					window.gameEndAlertShown = true;
					// Call EndScore overlay
					if (endScoreInstance) {
						endScoreInstance.createFinalScoreOverlay(currentScore, []);
					}
				}
			}
		}
		
	} catch (error) {
		console.log('Game end check error:', error);
	}
}
