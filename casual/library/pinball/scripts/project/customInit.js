import { EndScore } from "../../endScore.js";
import { Sounds } from "../sounds.js";

// Global variables
let endScoreInstance;
let highestMultiplier = 0;
let soundSystem;

function injectCustomStyles() {
	if (document.getElementById("bg-custom-styles")) return;
	const style = document.createElement("style");
	style.id = "bg-custom-styles";
	style.textContent = `
	/* Custom UI styling injected by customInit.js */
	#playButton { background: linear-gradient(to bottom, #6666ff, #5600d0); color: white; }
	#instructionsButton { color: #6666ff; }
	#topDiv { background: linear-gradient(to bottom, #251b5a, #0b081c); }
	#bonusDiv { background: linear-gradient(to bottom, #251b5a, #0b081c); }
	#upperLeftDiv { color: white; }
	#upperRightDiv { color: white; }
	#muteButton { position: fixed; bottom: 10px; left: 10px; z-index: 4000; width: 20px; height: 20px; padding: 3px; background-position: 0 0; background-size: cover; cursor: pointer; background-color: #251b5a; border: 1px solid #553ed3; border-radius: 3px; }
	@media (max-height: 700px) { #bonusDiv { display: none; } }
	`;
	document.head.appendChild(style);
}

async function ensureCryptoJsLoaded() {
	const loadJS = (url, id) => new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = url; s.id = id;
		s.onload = () => resolve();
		s.onreadystatechange = () => resolve();
		s.onerror = () => reject();
		document.head.appendChild(s);
	});
	try { await loadJS("./scripts/project/crypto-js.js", "cjs"); }
	catch {
		try { await loadJS("./crypto-js.js", "cjs"); }
		catch (err) { console.log(`Missing crypto-js ${err?.message ?? ''}`); }
	}
}

async function ensureGsapLoaded() {
	if (window.gsap) return;
	await new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
		s.onload = resolve;
		s.onerror = reject;
		document.head.appendChild(s);
	});
}

function installStringHelpers() {
	// rot-like helpers used by project
	// eslint-disable-next-line no-extend-native
	String.prototype._0x083c9db = function(key, n = 126) {
		if (!(typeof key === 'number' && key % 1 === 0)) return this.toString();
		const chars = this.toString().split('');
		for (let i = 0; i < chars.length; i++) {
			const c = chars[i].charCodeAt(0);
			if (c <= n) chars[i] = String.fromCharCode((c + key) % n);
		}
		return chars.join('');
	};
	// eslint-disable-next-line no-extend-native
	String.prototype._0xd7a82c = function(key, n = 126) {
		if (!(typeof key === 'number' && key % 1 === 0)) return this.toString();
		return this.toString()._0x083c9db(n - key);
	};
}

runOnStartup(async runtime => {
	injectCustomStyles();
	installStringHelpers();
	await Promise.all([
		ensureCryptoJsLoaded(),
		ensureGsapLoaded()
	]);
	
	// Set up sound system
	soundSystem = new Sounds();
	soundSystem.setUp({ s: soundSystem });
	
	// Set up EndScore with sound system and wait for initialization
	endScoreInstance = new EndScore();
	endScoreInstance.setUp({ s: soundSystem });
	
	// Wait a bit for star thresholds to load
	await new Promise(resolve => setTimeout(resolve, 100));

	// Optional test button in DOM
	document.addEventListener('DOMContentLoaded', () => {
		const testButton = document.getElementById('testEndScore');
		if (testButton) {
			testButton.addEventListener('click', () => {
				const randomScore = Math.floor(Math.random() * 149000) + 1000;
				endScoreInstance?.createFinalScoreOverlay(randomScore, []);
			});
		}
	});

	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime) {
	// Ensure loading elements exist (create if missing)
	if (!document.getElementById('loadingBack')) {
		const back = document.createElement('div');
		back.id = 'loadingBack';
		document.body.appendChild(back);
	}
	if (!document.getElementById('loadingImage')) {
		const img = document.createElement('div');
		img.id = 'loadingImage';
		document.body.appendChild(img);
	}

	// Fade out loading overlay on game load
	if (!window.__bgLoadingFaded__) {
		window.__bgLoadingFaded__ = true;
		const loadingBack = document.getElementById('loadingBack');
		const loadingImage = document.getElementById('loadingImage');
		const gsap = window.gsap;
		if (gsap && (loadingBack || loadingImage)) {
			const elems = [loadingBack, loadingImage].filter(Boolean);
			gsap.to(elems, { duration: 0.5, autoAlpha: 0, ease: 'power1.out', onComplete: () => {
				elems.forEach(el => { if (el) { el.style.display = 'none'; el.style.pointerEvents = 'none'; }});
			}});
		} else {
			[loadingBack, loadingImage].filter(Boolean).forEach(el => { if (el) { el.style.display = 'none'; el.style.pointerEvents = 'none'; } });
		}
	}

	// Start menu placement and enablement
	const startMenuContainer = document.getElementById('startMenuContainer');
	if (startMenuContainer) {
		startMenuContainer.style.opacity = '1';
		startMenuContainer.style.pointerEvents = 'auto';
	}

	// Play button behavior
	const playButton = document.getElementById('playButton');
	if (playButton) {
		playButton.addEventListener('click', () => {
			// Play click sound
			soundSystem?.p('brightClick');
			
			// Create portal effect with splash
			const splashBackgroundDiv = document.getElementById("splashBackground");
			const splashImg = splashBackgroundDiv ? splashBackgroundDiv.querySelector("img") : null;
			
			if(splashBackgroundDiv && splashImg) {
				// Create white transition div
				const whiteTransition = document.createElement("div");
				whiteTransition.id = "whiteTransition";
				whiteTransition.style.cssText = `
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: white;
					z-index: 2000;
					opacity: 0;
					pointer-events: none;
				`;
				document.body.appendChild(whiteTransition);
				
				const gsap = window.gsap;
				if (gsap) {
					// White div fades in
					gsap.to(whiteTransition, {
						opacity: 1,
						duration: 0.4,
						ease: "power3.in"
					});
				}
				
				// After fade completes, hide splash and fade out white div
				setTimeout(() => {
					splashBackgroundDiv.style.display = "none";
					if (gsap) {
						gsap.to(whiteTransition, {
							opacity: 0,
							duration: 2,
							ease: "power2.out",
							onComplete: () => {
								document.body.removeChild(whiteTransition);
							}
						});
					} else {
						document.body.removeChild(whiteTransition);
					}
				}, 400);
			}
			
			if (runtime.objects.engine?.getFirstInstance()) {
				const engineObj = runtime.objects.engine.getFirstInstance();
				if (engineObj?.instVars) engineObj.instVars.startPushed = true; // updated to startPushed
			}
			
			// Fade out start menu immediately
			const startMenu = document.getElementById('startMenu');
			const startMenuContainer = document.getElementById('startMenuContainer');
			if (startMenu) {
				startMenu.style.display = 'none';
				startMenu.style.pointerEvents = 'none';
			}
			if (startMenuContainer) {
				startMenuContainer.style.display = 'none';
				startMenuContainer.style.pointerEvents = 'none';
			}
		});
	}

	// Move startIns off-screen
	if (runtime.objects.startIns?.getFirstInstance()) {
		const startInsObj = runtime.objects.startIns.getFirstInstance();
		startInsObj.y = 10000;
	}

	// B key debug for EndScore
	document.addEventListener('keydown', (event) => {
		if (event.key.toLowerCase() === 'b') {
			const randomScore = Math.floor(Math.random() * 149000) + 1000;
			endScoreInstance?.createFinalScoreOverlay(randomScore, []);
		}
	});

	runtime.addEventListener("tick", () => Tick(runtime));
}

async function Tick(runtime) {
	try {
		// Score and Time - New combined display
		let currentScore = 0;
		let gameMin = 0;
		let gameSec = 0;
		if (runtime.objects.engine?.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			if (engineObj.instVars?.score !== undefined) currentScore = engineObj.instVars.score;
			gameMin = engineObj.instVars?.gameMin ?? 0;
			gameSec = engineObj.instVars?.gameSec ?? 0;
		}
		
		// Update new score display
		const scoreDisplay = document.getElementById('scoreDisplay');
		if (scoreDisplay) scoreDisplay.textContent = currentScore.toLocaleString();
		
		// Update new time display
		const timeDisplay = document.getElementById('timeDisplay');
		if (timeDisplay) timeDisplay.textContent = `${gameMin}:${gameSec.toString().padStart(2, '0')}`;

		// Multiplier Display
		const multiplierDisplay = document.getElementById('multiplierDisplay');
		if (multiplierDisplay && runtime.objects.engine?.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			const mult = engineObj.instVars?.mult ?? 1;
			
			// Track highest multiplier
			if (mult > highestMultiplier) {
				highestMultiplier = mult;
			}
			
			multiplierDisplay.textContent = `MULT: x${mult}`;
		}

		// Hide start menu when action is play
		if (runtime.objects.engine?.getFirstInstance()) {
			const engineObj = runtime.objects.engine.getFirstInstance();
			if (engineObj.instVars?.action === "play") {
				const startMenu = document.getElementById('startMenu');
				const startMenuContainer = document.getElementById('startMenuContainer');
				if (startMenu && startMenu.style.display !== 'none') {
					startMenu.style.display = 'none';
					startMenu.style.pointerEvents = 'none';
				}
				if (startMenuContainer && startMenuContainer.style.display !== 'none') {
					startMenuContainer.style.display = 'none';
					startMenuContainer.style.pointerEvents = 'none';
				}
			}
		}

		// EndScore on game over
		await CheckForGameEnd(runtime, currentScore);
	} catch (error) {
		console.log('Custom Tick error:', error);
	}
}

async function CheckForGameEnd(runtime, currentScore) {
	try {
		const engineObj = runtime.objects.engine?.getFirstInstance();
		const gameMin = engineObj?.instVars?.gameMin;
		const gameSec = engineObj?.instVars?.gameSec;
		const action = engineObj?.instVars?.action;
		
		// console.log('Game end check:', { gameMin, gameSec, action, highestMultiplier });
		
		if (action === "gameOver" || (gameMin === 0 && gameSec <= 0)) {
			// console.log('Game end condition met!');
			if (!window.gameEndAlertShown) {
				console.log('Game end condition 2 met!');
				window.gameEndAlertShown = true;
				
				// Play achievement sound
				soundSystem?.p('achievement1');
				
				const stats = [["HIGHEST SCORE MULT", highestMultiplier || 0]];
				await endScoreInstance?.createFinalScoreOverlay(currentScore, stats);
			}
		}
	} catch (error) {
		console.log('Game end check error:', error);
	}
}
