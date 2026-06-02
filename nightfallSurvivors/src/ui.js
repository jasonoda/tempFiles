import { gsap } from "gsap";
import * as PIXI from "pixi.js";

export class UI {
	setUp(e) {
		this.e = e;
		this._pixiStartupPhase = "creating";
		this._assetsLoadedOnce = !!this._assetsLoadedOnce;
		this._assetsLoadPromise = this._assetsLoadPromise || null;
		window.__startupContextLossReloaded = sessionStorage.getItem("startupContextLossReloaded") === "true";

		//-----------------

		this.uiCanvas = document.getElementById("mycanvas");
		if (!this.uiCanvas) {
			throw new Error("[pixi] missing #mycanvas");
		}

		if (this.app && this.app.renderer) {
			this._pixiStartupPhase = "reused";
			this.bindContextDebugListeners();
			this.resizeRendererToWindow();
			return;
		}

		const resolution = Math.min(window.devicePixelRatio || 1, 2);
		this.app = new PIXI.Application({
			view: this.uiCanvas,
			width: window.innerWidth,
			height: window.innerHeight,
			antialias: false,
			backgroundColor: 0x000000,
			backgroundAlpha: 1,
			transparent: false,
			autoDensity: true,
			resolution,
		});
		this._pixiStartupPhase = "created";
		this.bindContextDebugListeners();

		this.app.renderer.plugins.interaction.mouseOverRenderer = true;
		this.resizeRendererToWindow();
		this._pixiStartupPhase = "started";

		window.addEventListener("resize", () => {
			this.resizeRendererToWindow();
		});
		if (window.visualViewport) {
			window.visualViewport.addEventListener("resize", () => {
				this.resizeRendererToWindow();
			});
		}
		// PIXI.BaseTexture.SCALE_MODE.NEAREST;
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		// PIXI.settings.RESOLUTION = window.devicePixelRatio;

		this.animatedSprites = [];

		this.counter = 0;
	}

	resizeRendererToWindow() {
		if (!this.app || !this.app.renderer) return;
		if (this.e?._isRenderContextLost) return;
		const vv = window.visualViewport;
		let width = Math.round(vv ? vv.width : window.innerWidth);
		let height = Math.round(vv ? vv.height : window.innerHeight);
		if (width < 1) width = 1;
		if (height < 1) height = 1;

		this.app.renderer.resolution = Math.min(window.devicePixelRatio || 1, 2);
		this.app.renderer.resize(width, height);

		if (this.uiCanvas) {
			this.uiCanvas.style.width = `${width}px`;
			this.uiCanvas.style.height = `${height}px`;
			this.uiCanvas.style.visibility = 'visible';
			this.uiCanvas.style.opacity = '1';
		}

		if (this.e?.scene?.syncMainMaskSize) {
			this.e.scene.syncMainMaskSize();
		}
		if (this.e?.scene?.snapCameraToPlayer) {
			this.e.scene.snapCameraToPlayer();
		}
	}

	showGraphicsInitError(message) {
		let el = document.getElementById("graphicsInitError");
		if (!el) {
			el = document.createElement("div");
			el.id = "graphicsInitError";
			el.style.position = "fixed";
			el.style.left = "50%";
			el.style.top = "50%";
			el.style.transform = "translate(-50%, -50%)";
			el.style.zIndex = "310000";
			el.style.padding = "12px 14px";
			el.style.background = "rgba(0,0,0,0.9)";
			el.style.color = "#ffffff";
			el.style.border = "1px solid #ffffff";
			el.style.fontFamily = "sans-serif";
			el.style.fontSize = "14px";
			document.body.appendChild(el);
		}
		el.textContent = message;
	}

	bindContextDebugListeners() {
		if (!this.uiCanvas) return;
		if (!this._onContextLost) {
			this._onContextLost = (event) => {
				event.preventDefault();
				this._pixiStartupPhase = "context-lost";

				const action = this.e?.action || "";
				const startupLoading =
					action === "load images" ||
					action === "wait for ui" ||
					action === "warming" ||
					this.isLoaded_UI !== true;

				if (startupLoading) {
					const alreadyReloaded = sessionStorage.getItem("startupContextLossReloaded") === "true";
					if (!alreadyReloaded) {
						sessionStorage.setItem("startupContextLossReloaded", "true");
						window.__startupContextLossReloaded = true;
						location.reload();
						return;
					}
					this.showGraphicsInitError("Graphics failed to initialize. Please refresh.");
					if (this.e && typeof this.e.pushDebugError === "function") {
						this.e.pushDebugError("[pixi] startup context loss repeated after one reload");
					}
					return;
				}

				if (this.e && typeof this.e.setRenderContextLost === "function") {
					this.e.setRenderContextLost(true);
				}
			};
		}
		if (!this._onContextRestored) {
			this._onContextRestored = () => {
				this._pixiStartupPhase = "context-restored";

				const action = this.e?.action || "";
				const startupLoading =
					action === "load images" ||
					action === "wait for ui" ||
					action === "warming" ||
					this.isLoaded_UI !== true;
				if (startupLoading) {
					return;
				}

				setTimeout(() => {
					if (!this.app || !this.app.renderer) return;
					this.resizeRendererToWindow();
					if (this.e && typeof this.e.forcePixiRender === "function") {
						this.e.forcePixiRender();
					}
					if (this.e && typeof this.e.setRenderContextLost === "function") {
						this.e.setRenderContextLost(false);
					}
				}, 250);
			};
		}
		this.uiCanvas.addEventListener("webglcontextlost", this._onContextLost);
		this.uiCanvas.addEventListener("webglcontextrestored", this._onContextRestored);
	}

	unbindContextDebugListeners() {
		if (!this.uiCanvas) return;
		if (this._onContextLost) {
			this.uiCanvas.removeEventListener("webglcontextlost", this._onContextLost);
		}
		if (this._onContextRestored) {
			this.uiCanvas.removeEventListener("webglcontextrestored", this._onContextRestored);
		}
	}

	destroyApplication() {
		this.unbindContextDebugListeners();
		if (this.app) {
			try {
				this.disposePixiUi();
			} catch (err) {
				console.warn("[pixi] disposePixiUi failed:", err);
			}
			try {
				this.app.destroy(true, { children: true, texture: false, baseTexture: false });
			} catch (err) {
				console.warn("[pixi] app.destroy failed:", err);
			}
			const root = window;
			if (root.__bgPixiApps) {
				root.__bgPixiApps.delete(this.app);
			}
			this.app = null;
		}
	}

	load() {
		if (this._assetsLoadedOnce === true) {
			this.isLoaded_UI = true;
			return;
		}
		if (this._assetsLoadPromise) {
			return;
		}

		this.isLoaded_UI = false;

		// this.loader = new PIXI.Loader();
		this.loader = PIXI.Assets;

		//----------------------------------------------------

		const assets = [
			["clear", "./src/img/clear.png"],
			["white", "./src/img/white.png"],
			["black", "./src/img/black.png"],
			["red", "./src/img/red.png"],

			["grass", "./src/img/grass.png"],
			["cloudLayer", "./src/img/cloudLayer.png"],
			["trees", "./src/img/trees.png"],

			["hand", "./src/img/hand.png"],
			["enemyFlash", "./src/img/enemyFlash.png"],
			["enemyIce", "./src/img/enemyIce.png"],
			["lightning", "./src/img/lightning.png"],
			["lightning2", "./src/img/lightning2.png"],
			["lightning3", "./src/img/lightning3.png"],
			["coin", "./src/img/coin/coin.png"],
			["coin1", "./src/img/coin/coin1.png"],
			["coin2", "./src/img/coin/coin2.png"],
			["coin3", "./src/img/coin/coin3.png"],
			["coin4", "./src/img/coin/coin4.png"],
			["jewel", "./src/img/coin/jewel.png"],
			["jewel2", "./src/img/coin/jewel2.png"],
			["wheel", "./src/img/wheel.png"],
			["wheelShadow", "./src/img/wheelShadow.png"],
			["whiteBall", "./src/img/whiteBall.png"],
			["star", "./src/img/star.png"],
			["star2", "./src/img/star2.png"],
			["star3", "./src/img/star3.png"],
			["starBig1", "./src/img/starBig1.png"],
			["starBig2", "./src/img/starBig2.png"],
			["starBig3", "./src/img/starBig3.png"],
			["fireball", "./src/img/fireball.png"],
			["freezer", "./src/img/freezer.png"],
			["bomb", "./src/img/bomb.png"],
			["bomb2", "./src/img/bomb2.png"],
			["fuse", "./src/img/fuse.png"],
			["bombExplode", "./src/img/bombExplode.png"],
			["enBullet", "./src/img/enBullet.png"],
			["vig", "./src/img/vig.png"],

			["bone1", "./src/img/enemy/bones/bone1.png"],
			["bone2", "./src/img/enemy/bones/bone2.png"],
			["bone3", "./src/img/enemy/bones/bone3.png"],
			["bone4", "./src/img/enemy/bones/bone4.png"],
			["bone5", "./src/img/enemy/bones/bone5.png"],

			["boneA1", "./src/img/enemy/bonesA/boneA1.png"],
			["boneA2", "./src/img/enemy/bonesA/boneA2.png"],
			["boneA3", "./src/img/enemy/bonesA/boneA3.png"],
			["boneA4", "./src/img/enemy/bonesA/boneA4.png"],
			["boneA5", "./src/img/enemy/bonesA/boneA5.png"],
			["boneA6", "./src/img/enemy/bonesA/boneA6.png"],
			["boneA7", "./src/img/enemy/bonesA/boneA7.png"],

			["enemyA_1", "./src/img/enemy/enemyA_1.png"],
			["enemyA_2", "./src/img/enemy/enemyA_2.png"],
			["enemyA_3", "./src/img/enemy/enemyA_3.png"],
			["enemyA_4", "./src/img/enemy/enemyA_4.png"],

			["enemyA_1w", "./src/img/enemy/enemyA_1w.png"],
			["enemyA_2w", "./src/img/enemy/enemyA_2w.png"],
			["enemyA_3w", "./src/img/enemy/enemyA_3w.png"],
			["enemyA_4w", "./src/img/enemy/enemyA_4w.png"],

			["enemyB_1", "./src/img/enemy/enemyB_1.png"],
			["enemyB_2", "./src/img/enemy/enemyB_2.png"],
			["enemyB_3", "./src/img/enemy/enemyB_3.png"],
			["enemyB_4", "./src/img/enemy/enemyB_4.png"],
			["enemyB_5", "./src/img/enemy/enemyB_5.png"],

			["enemyB_1w", "./src/img/enemy/enemyB_1w.png"],
			["enemyB_2w", "./src/img/enemy/enemyB_2w.png"],
			["enemyB_3w", "./src/img/enemy/enemyB_3w.png"],
			["enemyB_4w", "./src/img/enemy/enemyB_4w.png"],
			["enemyB_5w", "./src/img/enemy/enemyB_5w.png"],

			["enemyC_1", "./src/img/enemy/enemyC_1.png"],
			["enemyC_2", "./src/img/enemy/enemyC_2.png"],
			["enemyC_3", "./src/img/enemy/enemyC_3.png"],
			["enemyC_4", "./src/img/enemy/enemyC_4.png"],

			["enemyC_1w", "./src/img/enemy/enemyC_1w.png"],
			["enemyC_2w", "./src/img/enemy/enemyC_2w.png"],
			["enemyC_3w", "./src/img/enemy/enemyC_3w.png"],
			["enemyC_4w", "./src/img/enemy/enemyC_4w.png"],

			["enemyD_1", "./src/img/enemy/enemyD_1.png"],
			["enemyD_2", "./src/img/enemy/enemyD_2.png"],
			["enemyD_3", "./src/img/enemy/enemyD_3.png"],
			["enemyD_4", "./src/img/enemy/enemyD_4.png"],

			["enemyD_1w", "./src/img/enemy/enemyD_1w.png"],
			["enemyD_2w", "./src/img/enemy/enemyD_2w.png"],
			["enemyD_3w", "./src/img/enemy/enemyD_3w.png"],
			["enemyD_4w", "./src/img/enemy/enemyD_4w.png"],

			["enemyE_1", "./src/img/enemy/enemyE_1.png"],
			["enemyE_2", "./src/img/enemy/enemyE_2.png"],
			["enemyE_3", "./src/img/enemy/enemyE_3.png"],
			["enemyE_4", "./src/img/enemy/enemyE_4.png"],

			["enemyE_1w", "./src/img/enemy/enemyE_1w.png"],
			["enemyE_2w", "./src/img/enemy/enemyE_2w.png"],
			["enemyE_3w", "./src/img/enemy/enemyE_3w.png"],
			["enemyE_4w", "./src/img/enemy/enemyE_4w.png"],

			["enemyF_1", "./src/img/enemy/enemyF_1.png"],
			["enemyF_2", "./src/img/enemy/enemyF_2.png"],
			["enemyF_3", "./src/img/enemy/enemyF_3.png"],
			["enemyF_4", "./src/img/enemy/enemyF_4.png"],

			["enemyF_1w", "./src/img/enemy/enemyF_1w.png"],
			["enemyF_2w", "./src/img/enemy/enemyF_2w.png"],
			["enemyF_3w", "./src/img/enemy/enemyF_3w.png"],
			["enemyF_4w", "./src/img/enemy/enemyF_4w.png"],

			// ['enemy2', './src/img/enemy2.png'],
			// ['enemy3', './src/img/enemy3.png'],
			// ['enemy4', './src/img/enemy4.png'],
			// ['enemy5', './src/img/enemy5.png'],
			// ['enemy6', './src/img/enemy6.png'],

			["enemy1_f", "./src/img/enemy/enemy1_f.png"],
			["enemy2_f", "./src/img/enemy/enemy2_f.png"],
			["enemy3_f", "./src/img/enemy/enemy3_f.png"],
			["enemy4_f", "./src/img/enemy/enemy4_f.png"],
			["enemy5_f", "./src/img/enemy/enemy5_f.png"],
			["enemy6_f", "./src/img/enemy/enemy6_f.png"],

			["pi_backwardsShot", "./src/img/puMenu/pi_backwardsShot.png"],
			["pi_biggerShot", "./src/img/puMenu/pi_biggerShot.png"],
			["pi_bombs", "./src/img/puMenu/pi_bombs.png"],
			["pi_extraShot", "./src/img/puMenu/pi_extraShot.png"],
			["pi_fasterShot", "./src/img/puMenu/pi_fasterShot.png"],
			["pi_fireballs", "./src/img/puMenu/pi_fireballs.png"],
			["pi_footSpeed", "./src/img/puMenu/pi_footSpeed.png"],
			["pi_frost", "./src/img/puMenu/pi_frost.png"],
			["pi_heal", "./src/img/puMenu/pi_heal.png"],
			["pi_lightningStrike", "./src/img/puMenu/pi_lightningStrike.png"],
			["pi_magnet", "./src/img/puMenu/pi_magnet.png"],
			["pi_ninjaStar", "./src/img/puMenu/pi_ninjaStar.png"],
			["pi_splinter", "./src/img/puMenu/pi_splinter.png"],
			["pi_coinShot", "./src/img/puMenu/coinShot.png"],
			["pi_stealth", "./src/img/puMenu/stealth.png"],
			["pi_bulletShield", "./src/img/puMenu/bulletShield.png"],
			["pi_jewelKill", "./src/img/puMenu/jewelKill.png"],

			["bul1", "./src/img/player/bul1.png"],
			["bul2", "./src/img/player/bul2.png"],
			["bul3", "./src/img/player/bul3.png"],
			["bul4", "./src/img/player/bul4.png"],
			["bul5", "./src/img/player/bul5.png"],
			["jewelShot1", "./src/img/player/jewelShot1.png"],
			["jewelShot2", "./src/img/player/jewelShot2.png"],
			["jewelShot3", "./src/img/player/jewelShot3.png"],
			["fb1", "./src/img/fb/fb1.png"],
			["fb2", "./src/img/fb/fb2.png"],
			["fb3", "./src/img/fb/fb3.png"],
			["fb4", "./src/img/fb/fb4.png"],
			["fb5", "./src/img/fb/fb5.png"],
			["fb6", "./src/img/fb/fb6.png"],
			["fb7", "./src/img/fb/fb7.png"],
			["fb8", "./src/img/fb/fb8.png"],

			["enemyGlow", "./src/img/enemyGlow.png"],
			["enShad", "./src/img/enShad.png"],

			["ex1", "./src/img/ex/ex1.png"],
			["ex2", "./src/img/ex/ex2.png"],
			["ex3", "./src/img/ex/ex3.png"],
			["ex4", "./src/img/ex/ex4.png"],
			["ex5", "./src/img/ex/ex5.png"],
			["ex6", "./src/img/ex/ex6.png"],
			["ex7", "./src/img/ex/ex7.png"],
			["ex8", "./src/img/ex/ex8.png"],
			["ex9", "./src/img/ex/ex9.png"],
			["ex10", "./src/img/ex/ex10.png"],
			["ex11", "./src/img/ex/ex11.png"],
			["ex12", "./src/img/ex/ex12.png"],
			["ex13", "./src/img/ex/ex13.png"],
			["ex14", "./src/img/ex/ex14.png"],
			["ex15", "./src/img/ex/ex15.png"],

			["bex1", "./src/img/bex/bex_1.png"],
			["bex2", "./src/img/bex/bex_2.png"],
			["bex3", "./src/img/bex/bex_3.png"],
			["bex4", "./src/img/bex/bex_4.png"],
			["bex5", "./src/img/bex/bex_5.png"],
			["bex6", "./src/img/bex/bex_6.png"],
			["bex7", "./src/img/bex/bex_7.png"],
			["bex8", "./src/img/bex/bex_8.png"],
			["bex9", "./src/img/bex/bex_9.png"],
			["bex10", "./src/img/bex/bex_10.png"],

			["exw1", "./src/img/exw/exw1.png"],
			["exw2", "./src/img/exw/exw2.png"],
			["exw3", "./src/img/exw/exw3.png"],
			["exw4", "./src/img/exw/exw4.png"],
			["exw5", "./src/img/exw/exw5.png"],
			["exw6", "./src/img/exw/exw6.png"],
			["exw7", "./src/img/exw/exw7.png"],
			["exw8", "./src/img/exw/exw8.png"],

			["enfb1", "./src/img/enfb/enfb1.png"],
			["enfb2", "./src/img/enfb/enfb2.png"],
			["enfb3", "./src/img/enfb/enfb3.png"],
			["enfb4", "./src/img/enfb/enfb4.png"],
			["enfb5", "./src/img/enfb/enfb5.png"],
			["enfb6", "./src/img/enfb/enfb6.png"],
			["enfb7", "./src/img/enfb/enfb7.png"],
			["enfb8", "./src/img/enfb/enfb8.png"],
			["enfb9", "./src/img/enfb/enfb9.png"],
			["enfb10", "./src/img/enfb/enfb10.png"],
			["enfb11", "./src/img/enfb/enfb11.png"],
			["enfb12", "./src/img/enfb/enfb12.png"],
			["enfb13", "./src/img/enfb/enfb13.png"],
			["enfb14", "./src/img/enfb/enfb14.png"],
			["enfb15", "./src/img/enfb/enfb15.png"],
			["enfb16", "./src/img/enfb/enfb16.png"],
			["enfb17", "./src/img/enfb/enfb17.png"],
			["enfb18", "./src/img/enfb/enfb18.png"],
			["enfb19", "./src/img/enfb/enfb19.png"],

			["rightUI", "./src/img/UI/rightUI.png"],
			["leftUI", "./src/img/UI/leftUI.png"],
			["rightUIBack", "./src/img/UI/rightUIBack.png"],
			["leftUIBack", "./src/img/UI/leftUIBack.png"],
			["rightUIMask", "./src/img/UI/rightUIMask.png"],
			["leftUIMask", "./src/img/UI/leftUIMask.png"],
			// Heart textures removed - using HTML hearts instead
			["redBarColor", "./src/img/UI/redBarColor.png"],

			["i_backwardsShot", "./src/img/UI/i_backwardsShot.png"],
			["i_biggerShot", "./src/img/UI/i_biggerShot.png"],
			["i_bombs", "./src/img/UI/i_bombs.png"],
			["i_extraShot", "./src/img/UI/i_extraShot.png"],
			["i_fasterShot", "./src/img/UI/i_fasterShot.png"],
			["i_fireballs", "./src/img/UI/i_fireballs.png"],
			["i_footSpeed", "./src/img/UI/i_footSpeed.png"],
			["i_freeze", "./src/img/UI/i_freeze.png"],
			["i_heal", "./src/img/UI/i_heal.png"],
			["i_lightningStrike", "./src/img/UI/i_lightningStrike.png"],
			["i_magnet", "./src/img/UI/i_magnet.png"],
			["i_ninjaStar", "./src/img/UI/i_ninjaStar.png"],
			["i_splinter", "./src/img/UI/i_splinter.png"],
			["i_coinShot", "./src/img/UI/coinShot.png"],
			["i_stealth", "./src/img/UI/i_stealth.png"],
			["i_bulletShield", "./src/img/UI/i_bulletShield.png"],
			["i_jewelShot", "./src/img/UI/i_jewelShot.png"],

			["puBack", "./src/img/puMenu/puBack.png"],
			["instructions", "./src/img/instructions.png"],
			["instructionsb", "./src/img/instructionsb.png"],
			["instructions2", "./src/img/instructions2.png"],
			["cover", "./src/img/cover.png"],
			["coverB", "./src/img/coverB.png"],
			["cover2", "./src/img/cover2.png"],

			["arm", "./src/img/player/arm.png"],
			["shad", "./src/img/player/shad.png"],

			["stance_d1", "./src/img/player/stance_d1.png"],
			["stance_d2", "./src/img/player/stance_d2.png"],
			["stance_d3", "./src/img/player/stance_d3.png"],

			["stance_u1", "./src/img/player/stance_u1.png"],
			["stance_u2", "./src/img/player/stance_u2.png"],
			["stance_u3", "./src/img/player/stance_u3.png"],

			["stance_s1", "./src/img/player/stance_s1.png"],
			["stance_s2", "./src/img/player/stance_s2.png"],
			["stance_s3", "./src/img/player/stance_s3.png"],

			["stance_sb1", "./src/img/player/stance_sb1.png"],

			["won", "./src/img/player/won.png"],

			["run_d1", "./src/img/player/run_d1.png"],
			["run_d2", "./src/img/player/run_d2.png"],
			["run_d3", "./src/img/player/run_d3.png"],
			["run_d4", "./src/img/player/run_d4.png"],
			["run_d5", "./src/img/player/run_d5.png"],
			["run_d6", "./src/img/player/run_d6.png"],

			["run_u1", "./src/img/player/run_u1.png"],
			["run_u2", "./src/img/player/run_u2.png"],
			["run_u3", "./src/img/player/run_u3.png"],
			["run_u4", "./src/img/player/run_u4.png"],
			["run_u5", "./src/img/player/run_u5.png"],
			["run_u6", "./src/img/player/run_u6.png"],

			["run_s1", "./src/img/player/run_s1.png"],
			["run_s2", "./src/img/player/run_s2.png"],
			["run_s3", "./src/img/player/run_s3.png"],
			["run_s4", "./src/img/player/run_s4.png"],
			["run_s5", "./src/img/player/run_s5.png"],
			["run_s6", "./src/img/player/run_s6.png"],
			["run_s7", "./src/img/player/run_s7.png"],
			["run_s8", "./src/img/player/run_s8.png"],

			["arm_1", "./src/img/player/arm_1.png"],
			["arm_2", "./src/img/player/arm_2.png"],
			["arm_3", "./src/img/player/arm_3.png"],
			["arm_4", "./src/img/player/arm_4.png"],
			["arm_5", "./src/img/player/arm_5.png"],

			["death", "./src/img/player/death.png"],

			["fuse1", "./src/img/fuse1.png"],
			["fuse2", "./src/img/fuse2.png"],
			["fuse3", "./src/img/fuse3.png"],

			["frostMask", "./src/img/frostMask.png"],
			["whiteGlow", "./src/img/whiteGlow.png"],

			["bush1", "./src/img/bush1.png"],
			["bushA", "./src/img/bushA.png"],
			["bushB", "./src/img/bushB.png"],
			["bushC", "./src/img/bushC.png"],

			["bush2", "./src/img/bush2.png"],
			["bush2A", "./src/img/bush2A.png"],
			["bush2B", "./src/img/bush2B.png"],
			["bush2C", "./src/img/bush2C.png"],

			["bush3", "./src/img/bush3.png"],
			["bush3A", "./src/img/bush3A.png"],
			["bush3B", "./src/img/bush3B.png"],
			["bush3C", "./src/img/bush3C.png"],

			["bushMed", "./src/img/bushMed.png"],
			["bushMedA", "./src/img/bushMedA.png"],
			["bushMedB", "./src/img/bushMedB.png"],
			["bushMedC", "./src/img/bushMedC.png"],

			["bushMed2", "./src/img/bushMed2.png"],
			["bushMed2A", "./src/img/bushMed2A.png"],
			["bushMed2B", "./src/img/bushMed2B.png"],
			["bushMed2C", "./src/img/bushMed2C.png"],

			["bushMed3", "./src/img/bushMed3.png"],
			["bushMed3A", "./src/img/bushMed3A.png"],
			["bushMed3B", "./src/img/bushMed3B.png"],
			["bushMed3C", "./src/img/bushMed3C.png"],

			["bushSmall", "./src/img/bushSmall.png"],
			["bushSmallA", "./src/img/bushSmallA.png"],
			["bushSmallB", "./src/img/bushSmallB.png"],
			["bushSmallC", "./src/img/bushSmallC.png"],

			["bushSmall2", "./src/img/bushSmall2.png"],
			["bushSmall2A", "./src/img/bushSmall2A.png"],
			["bushSmall2B", "./src/img/bushSmall2B.png"],
			["bushSmall2C", "./src/img/bushSmall2C.png"],

			["bushSmall3", "./src/img/bushSmall3.png"],
			["bushSmall3A", "./src/img/bushSmall3A.png"],
			["bushSmall3B", "./src/img/bushSmall3B.png"],
			["bushSmall3C", "./src/img/bushSmall3C.png"],

			["tinyBush1", "./src/img/tinyBush1.png"],
			["tinyBush2", "./src/img/tinyBush2.png"],
			["tinyBush3", "./src/img/tinyBush3.png"],


			["logoGhost", "./src/img/logoGhost.png"],

			["prop1", "./src/img/prop1.png"],
			["prop2", "./src/img/prop2.png"],
			["prop3", "./src/img/prop3.png"],
			["prop4", "./src/img/prop4.png"],
			["prop5", "./src/img/prop5.png"],
			["prop6", "./src/img/prop6.png"],
			["prop7", "./src/img/prop7.png"],
			["prop8", "./src/img/prop8.png"],
			["prop9", "./src/img/prop9.png"],
			["prop10", "./src/img/prop10.png"],
			["prop11", "./src/img/prop11.png"],
			["prop12", "./src/img/prop12.png"],

			["propShadowBig", "./src/img/propShadowBig.png"],
			["propShadowSmall", "./src/img/propShadowSmall.png"],

			["count1", "./src/img/count1.png"],
			["count2", "./src/img/count2.png"],
			["count3", "./src/img/count3.png"],
			["count4", "./src/img/count4.png"],
			["count5", "./src/img/count5.png"],

			["coinsCollected1", "./src/img/coinsCollected1.png"],
			["coinsCollected2", "./src/img/coinsCollected2.png"],
			// endMeter texture removed - no longer needed
			["purple", "./src/img/purple.png"],
		];

		//----------------------------------------------------

		assets.forEach((asset) => {
			this.loader.add(asset[0], asset[1]);
		});

		const assetNames = assets.map((asset) => {
			return asset[0];
		});
		this._assetsLoadPromise = PIXI.Assets.load(assetNames);
		this._assetsLoadPromise.then((textures) => {
			// this.loader.load((loader, resources) => {

			this.isLoaded_UI = true;
			this._assetsLoadedOnce = true;
			sessionStorage.removeItem("startupContextLossReloaded");
			window.__startupContextLossReloaded = false;

			//----------------------------------------------------

			this.clear = textures.clear;
			this.white = textures.white;
			this.black = textures.black;
			this.red = textures.red;
			this.t_grass = textures.grass;
			this.t_cloudLayer = textures.cloudLayer;
			this.t_trees = textures.trees;
			this.t_hand = textures.hand;
			this.t_enemyFlash = textures.enemyFlash;
			this.t_enemyIce = textures.enemyIce;
			this.t_lightning = textures.lightning;
			this.t_lightning2 = textures.lightning2;
			this.t_lightning3 = textures.lightning3;
			this.lightningAni = [
				this.t_lightning,
				this.t_lightning2,
				this.t_lightning3,
			];

			this.t_coin = textures.coin;
			this.t_coin1 = textures.coin1;
			this.t_coin2 = textures.coin2;
			this.t_coin3 = textures.coin3;
			this.t_coin4 = textures.coin4;
			this.coinAni = [
				this.t_coin,
				this.t_coin1,
				this.t_coin2,
				this.t_coin3,
				this.t_coin4,
			];
			this.t_jewel = textures.jewel;
			this.t_jewel2 = textures.jewel2;
			this.jewelAni = [
				this.t_jewel,
				this.t_jewel2,
			];
			this.t_wheel = textures.wheel;
			this.t_wheelShadow = textures.wheelShadow;
			this.t_whiteBall = textures.whiteBall;
			this.t_star = textures.star;
			this.t_star2 = textures.star2;
			this.t_star3 = textures.star3;
			this.t_starBig1 = textures.starBig1;
			this.t_starBig2 = textures.starBig2;
			this.t_starBig3 = textures.starBig3;
			this.t_fireball = textures.fireball;
			this.t_freezer = textures.freezer;
			this.t_bomb = textures.bomb;
			this.t_bomb2 = textures.bomb2;
			this.t_fuse = textures.fuse;
			this.t_bombExplode = textures.bombExplode;
			this.t_enBullet = textures.enBullet;
			this.t_vig = textures.vig;

			this.t_bone1 = textures.bone1;
			this.t_bone2 = textures.bone2;
			this.t_bone3 = textures.bone3;
			this.t_bone4 = textures.bone4;
			this.t_bone5 = textures.bone5;

			this.t_boneA1 = textures.boneA1;
			this.t_boneA2 = textures.boneA2;
			this.t_boneA3 = textures.boneA3;
			this.t_boneA4 = textures.boneA4;
			this.t_boneA5 = textures.boneA5;
			this.t_boneA6 = textures.boneA6;
			this.t_boneA7 = textures.boneA7;

			this.t_enemyA_1 = textures.enemyA_1;
			this.t_enemyA_2 = textures.enemyA_2;
			this.t_enemyA_3 = textures.enemyA_3;
			this.t_enemyA_4 = textures.enemyA_4;
			this.enemyA_Ani = [
				this.t_enemyA_1,
				this.t_enemyA_2,
				this.t_enemyA_3,
				this.t_enemyA_4,
				this.t_enemyA_3,
				this.t_enemyA_2,
			];

			this.t_enemyA_1w = textures.enemyA_1w;
			this.t_enemyA_2w = textures.enemyA_2w;
			this.t_enemyA_3w = textures.enemyA_3w;
			this.t_enemyA_4w = textures.enemyA_4w;
			this.enemyAw_Ani = [
				this.t_enemyA_1w,
				this.t_enemyA_2w,
				this.t_enemyA_3w,
				this.t_enemyA_4w,
				this.t_enemyA_3w,
				this.t_enemyA_2w,
			];

			this.t_enemyB_1 = textures.enemyB_1;
			this.t_enemyB_2 = textures.enemyB_2;
			this.t_enemyB_3 = textures.enemyB_3;
			this.t_enemyB_4 = textures.enemyB_4;
			this.t_enemyB_5 = textures.enemyB_5;
			this.enemyB_Ani = [
				this.t_enemyB_1,
				this.t_enemyB_2,
				this.t_enemyB_3,
				this.t_enemyB_4,
				this.t_enemyB_5,
				this.t_enemyB_4,
				this.t_enemyB_3,
				this.t_enemyB_2,
			];

			this.t_enemyB_1w = textures.enemyB_1w;
			this.t_enemyB_2w = textures.enemyB_2w;
			this.t_enemyB_3w = textures.enemyB_3w;
			this.t_enemyB_4w = textures.enemyB_4w;
			this.t_enemyB_5w = textures.enemyB_5w;
			this.enemyBw_Ani = [
				this.t_enemyB_1w,
				this.t_enemyB_2w,
				this.t_enemyB_3w,
				this.t_enemyB_4w,
				this.t_enemyB_5w,
				this.t_enemyB_4w,
				this.t_enemyB_3w,
				this.t_enemyB_2w,
			];

			this.t_enemyC_1 = textures.enemyC_1;
			this.t_enemyC_2 = textures.enemyC_2;
			this.t_enemyC_3 = textures.enemyC_3;
			this.t_enemyC_4 = textures.enemyC_4;
			this.enemyC_Ani = [
				this.t_enemyC_1,
				this.t_enemyC_2,
				this.t_enemyC_3,
				this.t_enemyC_4,
				this.t_enemyC_3,
				this.t_enemyC_2,
			];

			this.t_enemyC_1w = textures.enemyC_1w;
			this.t_enemyC_2w = textures.enemyC_2w;
			this.t_enemyC_3w = textures.enemyC_3w;
			this.t_enemyC_4w = textures.enemyC_4w;
			this.enemyCw_Ani = [
				this.t_enemyC_1w,
				this.t_enemyC_2w,
				this.t_enemyC_3w,
				this.t_enemyC_4w,
				this.t_enemyC_3w,
				this.t_enemyC_2w,
			];

			this.t_enemyD_1 = textures.enemyD_1;
			this.t_enemyD_2 = textures.enemyD_2;
			this.t_enemyD_3 = textures.enemyD_3;
			this.t_enemyD_4 = textures.enemyD_4;
			this.enemyD_Ani = [
				this.t_enemyD_1,
				this.t_enemyD_2,
				this.t_enemyD_3,
				this.t_enemyD_4,
				this.t_enemyD_3,
				this.t_enemyD_2,
			];

			this.t_enemyD_1w = textures.enemyD_1w;
			this.t_enemyD_2w = textures.enemyD_2w;
			this.t_enemyD_3w = textures.enemyD_3w;
			this.t_enemyD_4w = textures.enemyD_4w;
			this.enemyDw_Ani = [
				this.t_enemyD_1w,
				this.t_enemyD_2w,
				this.t_enemyD_3w,
				this.t_enemyD_4w,
				this.t_enemyD_3w,
				this.t_enemyD_2w,
			];

			this.t_enemyE_1 = textures.enemyE_1;
			this.t_enemyE_2 = textures.enemyE_2;
			this.t_enemyE_3 = textures.enemyE_3;
			this.t_enemyE_4 = textures.enemyE_4;
			this.enemyE_Ani = [
				this.t_enemyE_1,
				this.t_enemyE_2,
				this.t_enemyE_3,
				this.t_enemyE_4,
				this.t_enemyE_3,
				this.t_enemyE_2,
			];

			this.t_enemyE_1w = textures.enemyE_1w;
			this.t_enemyE_2w = textures.enemyE_2w;
			this.t_enemyE_3w = textures.enemyE_3w;
			this.t_enemyE_4w = textures.enemyE_4w;
			this.enemyEw_Ani = [
				this.t_enemyE_1w,
				this.t_enemyE_2w,
				this.t_enemyE_3w,
				this.t_enemyE_4w,
				this.t_enemyE_3w,
				this.t_enemyE_2w,
			];

			this.t_enemyF_1 = textures.enemyF_1;
			this.t_enemyF_2 = textures.enemyF_2;
			this.t_enemyF_3 = textures.enemyF_3;
			this.t_enemyF_4 = textures.enemyF_4;
			this.enemyF_Ani = [
				this.t_enemyF_1,
				this.t_enemyF_2,
				this.t_enemyF_3,
				this.t_enemyF_4,
				this.t_enemyF_3,
				this.t_enemyF_2,
			];

			this.t_enemyF_1w = textures.enemyF_1w;
			this.t_enemyF_2w = textures.enemyF_2w;
			this.t_enemyF_3w = textures.enemyF_3w;
			this.t_enemyF_4w = textures.enemyF_4w;
			this.enemyFw_Ani = [
				this.t_enemyF_1w,
				this.t_enemyF_2w,
				this.t_enemyF_3w,
				this.t_enemyF_4w,
				this.t_enemyF_3w,
				this.t_enemyF_2w,
			];

			this.t_enemy1_f = textures.enemy1_f;
			this.t_enemy2_f = textures.enemy2_f;
			this.t_enemy3_f = textures.enemy3_f;
			this.t_enemy4_f = textures.enemy4_f;
			this.t_enemy5_f = textures.enemy5_f;
			this.t_enemy6_f = textures.enemy6_f;

			this.t_pi_backwardsShot = textures.pi_backwardsShot;
			this.t_pi_biggerShot = textures.pi_biggerShot;
			this.t_pi_bombs = textures.pi_bombs;
			this.t_pi_extraShot = textures.pi_extraShot;
			this.t_pi_fasterShot = textures.pi_fasterShot;
			this.t_pi_fireballs = textures.pi_fireballs;
			this.t_pi_footSpeed = textures.pi_footSpeed;
			this.t_pi_frost = textures.pi_frost;
			this.t_pi_heal = textures.pi_heal;
			this.t_pi_lightningStrike = textures.pi_lightningStrike;
			this.t_pi_magnet = textures.pi_magnet;
			this.t_pi_ninjaStar = textures.pi_ninjaStar;
			this.t_pi_splinter = textures.pi_splinter;
			this.t_pi_coinShot = textures.pi_coinShot;
			this.t_pi_stealth = textures.pi_stealth;
			this.t_pi_bulletShield = textures.pi_bulletShield;
			this.t_pi_jewelKill = textures.pi_jewelKill;

			this.t_shad = textures.shad;
			this.t_arm = textures.arm;

			this.t_bul1 = textures.bul1;
			this.t_bul2 = textures.bul2;
			this.t_bul3 = textures.bul3;
			this.t_bul4 = textures.bul4;
			this.t_bul5 = textures.bul5;
			this.t_jewelShot1 = textures.jewelShot1;
			this.t_jewelShot2 = textures.jewelShot2;
			this.t_jewelShot3 = textures.jewelShot3;
			this.t_fb1 = textures.fb1;
			this.t_fb2 = textures.fb2;
			this.t_fb3 = textures.fb3;
			this.t_fb4 = textures.fb4;
			this.t_fb5 = textures.fb5;
			this.t_fb6 = textures.fb6;
			this.t_fb7 = textures.fb7;
			this.t_fb8 = textures.fb8;

			this.t_ex1 = textures.ex1;
			this.t_ex2 = textures.ex2;
			this.t_ex3 = textures.ex3;
			this.t_ex4 = textures.ex4;
			this.t_ex5 = textures.ex5;
			this.t_ex6 = textures.ex6;
			this.t_ex7 = textures.ex7;
			this.t_ex8 = textures.ex8;
			this.t_ex9 = textures.ex9;
			this.t_ex10 = textures.ex10;
			this.t_ex11 = textures.ex11;
			this.t_ex12 = textures.ex12;
			this.t_ex13 = textures.ex13;
			this.t_ex14 = textures.ex14;
			this.t_ex15 = textures.ex15;

			this.t_exw1 = textures.exw1;
			this.t_exw2 = textures.exw2;
			this.t_exw3 = textures.exw3;
			this.t_exw4 = textures.exw4;
			this.t_exw5 = textures.exw5;
			this.t_exw6 = textures.exw6;
			this.t_exw7 = textures.exw7;
			this.t_exw8 = textures.exw8;

			this.t_bex1 = textures.bex1;
			this.t_bex2 = textures.bex2;
			this.t_bex3 = textures.bex3;
			this.t_bex4 = textures.bex4;
			this.t_bex5 = textures.bex5;
			this.t_bex6 = textures.bex6;
			this.t_bex7 = textures.bex7;
			this.t_bex8 = textures.bex8;
			this.t_bex9 = textures.bex9;
			this.t_bex10 = textures.bex10;

			this.bexAni = [
				this.t_bex1,
				this.t_bex2,
				this.t_bex3,
				this.t_bex4,
				this.t_bex5,
				this.t_bex6,
				this.t_bex7,
				this.t_bex8,
				this.t_bex9,
				this.t_bex10,
				this.clear,
			];

			this.t_enfb1 = textures.enfb1;
			this.t_enfb2 = textures.enfb2;
			this.t_enfb3 = textures.enfb3;
			this.t_enfb4 = textures.enfb4;
			this.t_enfb5 = textures.enfb5;
			this.t_enfb6 = textures.enfb6;
			this.t_enfb7 = textures.enfb7;
			this.t_enfb8 = textures.enfb8;
			this.t_enfb9 = textures.enfb9;
			this.t_enfb10 = textures.enfb10;
			this.t_enfb11 = textures.enfb11;
			this.t_enfb12 = textures.enfb12;
			this.t_enfb13 = textures.enfb13;
			this.t_enfb14 = textures.enfb14;
			this.t_enfb15 = textures.enfb15;
			this.t_enfb16 = textures.enfb16;
			this.t_enfb17 = textures.enfb17;
			this.t_enfb18 = textures.enfb18;
			this.t_enfb19 = textures.enfb19;

			this.t_enemyGlow = textures.enemyGlow;
			this.t_enShad = textures.enShad;

			this.t_leftUI = textures.leftUI;
			this.t_leftUIBack = textures.leftUIBack;
			this.t_leftUIMask = textures.leftUIMask;
			this.t_rightUI = textures.rightUI;
			this.t_rightUIBack = textures.rightUIBack;
			this.t_rightUIMask = textures.rightUIMask;
			// Heart texture assignments removed - using HTML hearts instead
			this.t_redBarColor = textures.redBarColor;

			this.t_i_backwardsShot = textures.i_backwardsShot;
			this.t_i_biggerShot = textures.i_biggerShot;
			this.t_i_bombs = textures.i_bombs;
			this.t_i_extraShot = textures.i_extraShot;
			this.t_i_fasterShot = textures.i_fasterShot;
			this.t_i_fireballs = textures.i_fireballs;
			this.t_i_footSpeed = textures.i_footSpeed;
			this.t_i_freeze = textures.i_freeze;
			this.t_i_heal = textures.i_heal;
			this.t_i_lightningStrike = textures.i_lightningStrike;
			this.t_i_magnet = textures.i_magnet;
			this.t_i_ninjaStar = textures.i_ninjaStar;
			this.t_i_splinter = textures.i_splinter;
			this.t_i_coinShot = textures.i_coinShot;
			this.t_i_stealth = textures.i_stealth;
			this.t_i_bulletShield = textures.i_bulletShield;
			this.t_i_jewelShot = textures.i_jewelShot;

			this.t_puBack = textures.puBack;
			this.t_instructions = textures.instructions;
			this.t_instructionsb = textures.instructionsb;
			this.t_instructions2 = textures.instructions2;
			this.t_cover = textures.cover;
			this.t_coverB = textures.coverB;
			this.t_cover2 = textures.cover2;

			this.t_stance_d1 = textures.stance_d1;
			this.t_stance_d2 = textures.stance_d2;
			this.t_stance_d3 = textures.stance_d3;

			this.t_stance_u1 = textures.stance_u1;
			this.t_stance_u2 = textures.stance_u2;
			this.t_stance_u3 = textures.stance_u3;

			this.t_stance_s1 = textures.stance_s1;
			this.t_stance_s2 = textures.stance_s2;
			this.t_stance_s3 = textures.stance_s3;

			this.t_stance_sb1 = textures.stance_sb1;

			this.t_run_d1 = textures.run_d1;
			this.t_run_d2 = textures.run_d2;
			this.t_run_d3 = textures.run_d3;
			this.t_run_d4 = textures.run_d4;
			this.t_run_d5 = textures.run_d5;
			this.t_run_d6 = textures.run_d6;

			this.t_run_u1 = textures.run_u1;
			this.t_run_u2 = textures.run_u2;
			this.t_run_u3 = textures.run_u3;
			this.t_run_u4 = textures.run_u4;
			this.t_run_u5 = textures.run_u5;
			this.t_run_u6 = textures.run_u6;

			this.t_run_s1 = textures.run_s1;
			this.t_run_s2 = textures.run_s2;
			this.t_run_s3 = textures.run_s3;
			this.t_run_s4 = textures.run_s4;
			this.t_run_s5 = textures.run_s5;
			this.t_run_s6 = textures.run_s6;
			this.t_run_s7 = textures.run_s7;
			this.t_run_s8 = textures.run_s8;

			this.t_arm_1 = textures.arm_1;
			this.t_arm_2 = textures.arm_2;
			this.t_arm_3 = textures.arm_3;
			this.t_arm_4 = textures.arm_4;
			this.t_arm_5 = textures.arm_5;

			this.t_won = textures.won;
			this.t_death = textures.death;

			this.t_fuse1 = textures.fuse1;
			this.t_fuse2 = textures.fuse2;
			this.t_fuse3 = textures.fuse3;

			this.t_frostMask = textures.frostMask;
			this.t_whiteGlow = textures.whiteGlow;

			this.t_bush1 = textures.bush1;
			this.t_bushA = textures.bushA;
			this.t_bushB = textures.bushB;
			this.t_bushC = textures.bushC;

			this.t_bush2 = textures.bush2;
			this.t_bush2A = textures.bush2A;
			this.t_bush2B = textures.bush2B;
			this.t_bush2C = textures.bush2C;

			this.t_bush3 = textures.bush3;
			this.t_bush3A = textures.bush3A;
			this.t_bush3B = textures.bush3B;
			this.t_bush3C = textures.bush3C;

			this.t_bushMed = textures.bushMed;
			this.t_bushMedA = textures.bushMedA;
			this.t_bushMedB = textures.bushMedB;
			this.t_bushMedC = textures.bushMedC;

			this.t_bushMed2 = textures.bushMed2;
			this.t_bushMed2A = textures.bushMed2A;
			this.t_bushMed2B = textures.bushMed2B;
			this.t_bushMed2C = textures.bushMed2C;

			this.t_bushMed3 = textures.bushMed3;
			this.t_bushMed3A = textures.bushMed3A;
			this.t_bushMed3B = textures.bushMed3B;
			this.t_bushMed3C = textures.bushMed3C;

			this.t_bushSmall = textures.bushSmall;
			this.t_bushSmallA = textures.bushSmallA;
			this.t_bushSmallB = textures.bushSmallB;
			this.t_bushSmallC = textures.bushSmallC;

			this.t_bushSmall2 = textures.bushSmall2;
			this.t_bushSmall2A = textures.bushSmall2A;
			this.t_bushSmall2B = textures.bushSmall2B;
			this.t_bushSmall2C = textures.bushSmall2C;

			this.t_bushSmall3 = textures.bushSmall3;
			this.t_bushSmall3A = textures.bushSmall3A;
			this.t_bushSmall3B = textures.bushSmall3B;
			this.t_bushSmall3C = textures.bushSmall3C;

			this.t_tinyBush1 = textures.tinyBush1;
			this.t_tinyBush2 = textures.tinyBush2;
			this.t_tinyBush3 = textures.tinyBush3;

			this.t_count1 = textures.count1;
			this.t_count2 = textures.count2;
			this.t_count3 = textures.count3;
			this.t_count4 = textures.count4;
			this.t_count5 = textures.count5;

			this.t_prop1 = textures.prop1;
			this.t_prop2 = textures.prop2;
			this.t_prop3 = textures.prop3;
			this.t_prop4 = textures.prop4;
			this.t_prop5 = textures.prop5;
			this.t_prop6 = textures.prop6;
			this.t_prop7 = textures.prop7;
			this.t_prop8 = textures.prop8;
			this.t_prop9 = textures.prop9;
			this.t_prop10 = textures.prop10;
			this.t_prop11 = textures.prop11;
			this.t_prop12 = textures.prop12;

			this.t_logoGhost = textures.logoGhost;

			this.t_propShadowBig = textures.propShadowBig;
			this.t_propShadowSmall = textures.propShadowSmall;


			this.t_coinsCollected1 = textures.coinsCollected1;
			this.t_coinsCollected2 = textures.coinsCollected2;
			// endMeter texture assignment removed - no longer needed
			this.t_purple = textures.purple;

			this.stanceAni_d = [
				this.t_stance_d1,
				this.t_stance_d2,
				this.t_stance_d3,
				this.t_stance_d2,
			];
			this.stanceAni_u = [
				this.t_stance_u1,
				this.t_stance_u2,
				this.t_stance_u3,
				this.t_stance_u2,
			];
			this.stanceAni_s = [
				this.t_stance_s1,
				this.t_stance_s2,
				this.t_stance_s3,
				this.t_stance_s2,
			];

			this.armAni = [
				this.t_arm_1,
				this.t_arm_2,
				this.t_arm_3,
				this.t_arm_4,
				this.t_arm_5,
			];

			this.runAni_d = [
				this.t_run_d1,
				this.t_run_d2,
				this.t_run_d3,
				this.t_run_d4,
				this.t_run_d5,
				this.t_run_d6,
			];
			this.runAni_u = [
				this.t_run_u1,
				this.t_run_u2,
				this.t_run_u3,
				this.t_run_u4,
				this.t_run_u5,
				this.t_run_u6,
			];
			this.runAni_s = [
				this.t_run_s1,
				this.t_run_s2,
				this.t_run_s3,
				this.t_run_s4,
				this.t_run_s5,
				this.t_run_s6,
				this.t_run_s7,
				this.t_run_s8,
			];

			this.exAni = [
				this.t_ex1,
				this.t_ex2,
				this.t_ex3,
				this.t_ex4,
				this.t_ex5,
				this.t_ex6,
				this.t_ex7,
				this.t_ex8,
				this.t_ex9,
				this.t_ex10,
				this.t_ex11,
				this.t_ex12,
				this.t_ex13,
				this.t_ex14,
				this.t_ex15,
			];
			this.fbAni = [
				this.t_fb1,
				this.t_fb2,
				this.t_fb3,
				this.t_fb4,
				this.t_fb5,
				this.t_fb6,
				this.t_fb7,
				this.t_fb8,
			];
			this.exwAni = [
				this.t_exw1,
				this.t_exw2,
				this.t_exw3,
				this.t_exw4,
				this.t_exw5,
				this.t_exw6,
				this.t_exw7,
				this.t_exw8,
			];
			this.enfbAni = [
				this.t_enfb1,
				this.t_enfb2,
				this.t_enfb3,
				this.t_enfb4,
				this.t_enfb5,
				this.t_enfb6,
				this.t_enfb7,
				this.t_enfb8,
				this.t_enfb9,
				this.t_enfb10,
				this.t_enfb11,
				this.t_enfb12,
				this.t_enfb13,
				this.t_enfb14,
				this.t_enfb15,
				this.t_enfb16,
				this.t_enfb17,
				this.t_enfb18,
				this.t_enfb19,
			];

			this.deathAni = [
				this.t_stance_d1,
				this.t_stance_s1,
				this.t_stance_u1,
				this.t_stance_sb1,
			];
			this.deathAni2 = [this.t_death];
			this.wonAni = [this.t_won];

			this.bombWait = [this.t_bomb];
			this.bombFlash = [this.t_bomb, this.t_bomb2];
		}).catch((err) => {
			console.error('[UI] asset load failed:', err);
			this.isLoaded_UI = false;
			if (this.e && typeof this.e.pushDebugError === "function") {
				this.e.pushDebugError(`[UI] asset load failed: ${err?.message || err}`);
			}
		}).finally(() => {
			this._assetsLoadPromise = null;
		});

		//----------------------------------------------------
		//----------------------------------------------------
		//----------------------------------------------------
	}

	//---------------------------------------------------------------------------------------------------------

	removeStrayVignettes(keepSprite) {
		if (!this.app || !this.t_vig) return;
		const stage = this.app.stage;
		for (let i = stage.children.length - 1; i >= 0; i--) {
			const child = stage.children[i];
			if (child === keepSprite) continue;
			if (child instanceof PIXI.Sprite && child.texture === this.t_vig) {
				gsap.killTweensOf(child);
				stage.removeChild(child);
				child.destroy({ children: true });
			}
		}
	}

	disposePixiUi() {
		if (this.vig) {
			gsap.killTweensOf(this.vig);
			if (this.vig.parent) this.vig.parent.removeChild(this.vig);
			this.vig.destroy({ children: true });
			this.vig = null;
		}
		if (this.baseCont) {
			gsap.killTweensOf(this.baseCont);
			if (this.baseCont.parent) this.baseCont.parent.removeChild(this.baseCont);
			this.baseCont.destroy({ children: true });
			this.baseCont = null;
			this.mainCont = null;
		}
		this.animatedSprites = [];
		this._pixiUiBuilt = false;
	}

	build() {
		if (this._pixiUiBuilt) {
			return;
		}

		this.baseCont = new PIXI.Container();
		this.baseCont.sortableChildren = true;
		this.app.stage.addChild(this.baseCont);

		//--------------------------------------------------------------------

		this.mainCont = new PIXI.Container();
		this.mainCont.sortableChildren = true;
		this.baseCont.addChild(this.mainCont);

		this.instructions = new PIXI.Sprite(this.t_instructions);
		this.instructions.anchor.x = 0.5;
		this.instructions.anchor.y = 0.5;
		this.instructions.scale.x = this.instructions.scale.y = 2;
		this.instructions.zIndex = 10000;
		this.instructions.alpha = 0;
		this.baseCont.addChild(this.instructions);

		this.instructions.buttonMode = false;
		this.instructions.interactive = false;

		this.instructions.on("mousedown", (event) => {
			this.instructions.buttonMode = false;
			this.instructions.interactive = false;
			this.e.scene.prepareNewRunFromMenu();
			this.e.scene.action = "game start";
			gsap.killTweensOf(this.instructions);
			gsap.killTweensOf(this.instructions2);
			gsap.to(this.instructions, { alpha: 0, duration: 0.25, ease: "linear" });
			gsap.to(this.instructions2, { alpha: 0, duration: 0.25, ease: "linear" });
		});

		this.instructions.on("touchstart", (event) => {
			this.instructions.buttonMode = false;
			this.instructions.interactive = false;
			this.e.scene.prepareNewRunFromMenu();
			this.e.scene.action = "game start";
			gsap.killTweensOf(this.instructions);
			gsap.killTweensOf(this.instructions2);
			gsap.to(this.instructions, { alpha: 0, duration: 0.25, ease: "linear" });
			gsap.to(this.instructions2, { alpha: 0, duration: 0.25, ease: "linear" });
		});

		this.instructions2 = new PIXI.Sprite(this.t_instructions2);
		this.instructions2.anchor.x = 0.5;
		this.instructions2.anchor.y = 0.5;
		this.instructions2.scale.x = this.instructions2.scale.y = 2;
		this.instructions2.zIndex = 10000;
		this.instructions2.alpha = 0;
		this.baseCont.addChild(this.instructions2);

		this.cover = new PIXI.Sprite(this.t_cover);
		this.cover.anchor.x = 0.5;
		this.cover.anchor.y = 0.5;
		this.cover.scale.x = this.cover.scale.y = 3;
		this.cover.zIndex = 10020;
		this.cover.alpha = 1;
		// this.baseCont.addChild(this.cover);

		this.animatedSprites.push(this.cover);
		this.cover.ani = [this.t_cover, this.t_coverB];
		this.cover.aniSpeed = 0.8;

		this.cover2 = new PIXI.Sprite(this.t_cover2);
		this.cover2.anchor.x = 0.5;
		this.cover2.anchor.y = 0.5;
		this.cover2.position.y = 22;
		this.cover2.scale.x = this.cover2.scale.y = 3;
		this.cover2.zIndex = 10021;
		this.cover2.alpha = 1;
		// this.baseCont.addChild(this.cover2);

		this.cover2.alpha = 0.5;
		gsap.to(this.cover2, {
			alpha: 0,
			duration: 1,
			delay: 1.5,
			repeat: -1,
			yoyo: true,
			ease: "linear",
		});

		this.cover.buttonMode = true;
		this.cover.interactive = true;

		this.cover.on("mousedown", (event) => {
			this.cover.buttonMode = false;
			this.cover.interactive = false;
			this.instructions.buttonMode = true;
			this.instructions.interactive = true;
			this.e.scene.action = "instructions";
			gsap.to(this.cover, { alpha: 0, duration: 0.125, ease: "linear" });
			gsap.to(this.instructions, {
				alpha: 1,
				duration: 0.25,
				delay: 0.25,
				ease: "linear",
			});
			gsap.to(this.instructions2, {
				alpha: 1,
				duration: 0.25,
				delay: 0.25,
				ease: "linear",
			});
			gsap.to(this.e.scene.t, {
				topOffset: 0,
				duration: 0.25,
				delay: 0.25,
				ease: "expo.out",
			});
			gsap.to(this.e.scene.t, {
				botOffset: 0,
				duration: 0.25,
				delay: 0.25,
				ease: "expo.out",
			});
			gsap.killTweensOf(this.cover2);
			gsap.to(this.cover2, { alpha: 0, duration: 0.125, ease: "linear" });
		});

		this.cover.on("touchstart", (event) => {
			this.cover.buttonMode = false;
			this.cover.interactive = false;
			this.instructions.buttonMode = true;
			this.instructions.interactive = true;
			this.e.scene.action = "instructions";
			gsap.to(this.cover, { alpha: 0, duration: 0.125, ease: "linear" });
			gsap.to(this.instructions, {
				alpha: 1,
				duration: 0.25,
				delay: 0.25,
				ease: "linear",
			});
			gsap.to(this.instructions2, {
				alpha: 1,
				duration: 0.25,
				delay: 0.25,
				ease: "linear",
			});
			gsap.to(this.e.scene.t, {
				topOffset: 0,
				duration: 0.25,
				delay: 0.25,
				ease: "expo.out",
			});
			gsap.to(this.e.scene.t, {
				botOffset: 0,
				duration: 0.25,
				delay: 0.25,
				ease: "expo.out",
			});
			gsap.killTweensOf(this.cover2);
			gsap.to(this.cover2, { alpha: 0, duration: 0.125, ease: "linear" });
		});

		this.texture = this.red;
		this.faderRed = new PIXI.Sprite(this.texture);
		this.faderRed.anchor.x = 0;
		this.faderRed.anchor.y = 0;
		this.faderRed._zIndex = 100;
		this.faderRed.alpha = 0;
		this.mainCont.addChild(this.faderRed);

		this.faderBlack = new PIXI.Sprite(this.black);
		this.faderBlack.anchor.x = 0;
		this.faderBlack.anchor.y = 0;
		this.faderBlack._zIndex = 100;
		this.faderBlack.alpha = 0;
		this.mainCont.addChild(this.faderBlack);

		this.vig = new PIXI.Sprite(this.t_vig);
		this.vig.anchor.x = 0;
		this.vig.anchor.y = 0;
		this.vig._zIndex = 80;
		this.vig.alpha = 0.8;
		// this.mainCont.addChild(this.vig);

		// this.vig2 = new PIXI.Sprite(this.t_vig2);
		// this.vig2.anchor.x=0
		// this.vig2.anchor.y=0
		// this.vig2._zIndex=81
		// this.vig2.alpha=1;
		// this.mainCont.addChild(this.vig2);

		//--------------------------------------------------------------------

		// this.testMask = new PIXI.Sprite(this.texture);
		// this.testMask.anchor.x = 0;
		// this.testMask.anchor.y = 0;
		// this.testMask._zIndex = 100
		// this.testMask.alpha = 0;
		// this.mainCont.addChild(this.testMask);

		//--------------------------------------------------------------------

		// Old PIXI mute buttons removed - now using HTML button with consolidated muteState

		this.winText = new PIXI.Text("YOU SURVIVED!");
		this.winText.anchor.x = 0.5;
		this.winText.position.y = -320;
		this.winText._zIndex = 215;

		if(this.e.mobile===true){
			this.winText.style = new PIXI.TextStyle({
				align: "center",
				lineHeight: 0,
				fill: 0xe7ce78,
				fontSize: 24,
				fontFamily: "Ambitsek",
			});
		}else{
			this.winText.style = new PIXI.TextStyle({
				align: "center",
				lineHeight: 0,
				fill: 0xe7ce78,
				fontSize: 36,
				fontFamily: "Ambitsek",
			});
		}

		
		this.winText.resolution = 3;
		this.winText.alpha = 0;
		this.mainCont.addChild(this.winText);

		//--------------------------------------------------------------------

		this.deathCont = new PIXI.Container();
		this.deathCont.sortableChildren = true;
		this.baseCont.addChild(this.deathCont);
		this.deathCont.zIndex = 45000;

		this.death = new PIXI.Sprite(this.black);
		this.death.anchor.x = 0.5;
		this.death.anchor.y = 0.5;
		this.death.width = 10000;
		this.death.height = 10000;
		// this.death._zIndex=15000
		this.death.alpha = 0;
		this.deathCont.addChild(this.death);

		this.playerDeath = new PIXI.Sprite(this.t_player);
		this.playerDeath.anchor.x = 0.5;
		this.playerDeath.anchor.y = 0.5;
		this.playerDeath.scale.x = this.playerDeath.scale.y = 3;
		this.playerDeath._zIndex = 80;
		this.playerDeath.alpha = 0;
		this.deathCont.addChild(this.playerDeath);

		this.playerDeath.ani = this.deathAni;
		this.playerDeath.aniSpeed = 0.05;
		this.animatedSprites.push(this.playerDeath);

		if (this.e.mobile === true && window.innerWidth <= window.innerHeight) {
			this.playerDeath.position.y = 20;
		}

		this.logoGhost = new PIXI.Sprite(this.t_logoGhost);
		this.logoGhost.anchor.x = 0.5;
		this.logoGhost.anchor.y = 0.5;
		this.logoGhost.scale.x = this.logoGhost.scale.y = 0.28;
		this.logoGhost._zIndex = 81;
		this.logoGhost.alpha = 0;
		this.deathCont.addChild(this.logoGhost);

		if (this.e.mobile === true && window.innerWidth <= window.innerHeight) {
			this.logoGhost.position.y = 20;
		}

		//--------------------------------------------------------------------

		// Final score elements removed - now handled by HTML game over UI

		//--------------------------------------------------------------------

		// this.coinsCollectedText = new PIXI.Text('COINS COLLECTED!');
		this.coinsCollectedText = new PIXI.Sprite(this.t_coinsCollected1);
		this.coinsCollectedText.anchor.x = 0.5;
		this.coinsCollectedText.anchor.Y = 0.5;
		this.coinsCollectedText.scale.x = this.coinsCollectedText.scale.y = 2;
		this.coinsCollectedText.position.x = window.innerWidth / 2;
		this.coinsCollectedText.position.y = window.innerHeight / 2;
		this.coinsCollectedText._zIndex = 215;
		this.coinsCollectedText.alpha = 0;
		this.coinsCollectedText.visible = false;
		// this.coinsCollectedText.style = new PIXI.TextStyle({
		//     align: "center",
		//     lineHeight: 0,
		//     fill: 0xe7ce78,
		//     fontSize: 24,
		//     fontFamily: "Ambitsek"
		// })
		// this.coinsCollectedText.resolution = 3;
		this.mainCont.addChild(this.coinsCollectedText);

		this.animatedSprites.push(this.coinsCollectedText);
		this.coinsCollectedText.ani = [
			this.t_coinsCollected1,
			this.t_coinsCollected2,
		];
		this.coinsCollectedText.aniSpeed = 0.4;

		//--------------------------------------------------------------------

		this.coinCountDown = new PIXI.Sprite(this.t_count5);
		this.coinCountDown.anchor.x = 0.5;
		this.coinCountDown.anchor.y = 0.5;
		this.coinCountDown.scale.x = this.coinCountDown.scale.y = 2;
		this.coinCountDown.position.x = window.innerWidth / 2;
		this.coinCountDown.position.y = window.innerHeight / 2;
		this.coinCountDown._zIndex = 22215;
		this.coinCountDown.alpha = 0;
		this.coinCountDown.visible = false;
		this.mainCont.addChild(this.coinCountDown);

		//--------------------------------------------------------------------

		this.icons = [];

		this.botCont = new PIXI.Container();
		this.botCont.sortableChildren = true;
		this.baseCont.addChild(this.botCont);

		this.botCont.scale.x = this.botCont.scale.y = 2;

		// this.baseCont.zIndex = 4000;
		this.botCont.zIndex = 55000;

		for (var i = 0; i < 30; i++) {
			this.icon = new PIXI.Sprite(this.t_i_lightningStrike);
			this.icon.position.x = i * 14;
			this.icon.anchor.y = 1;
			this.icon.alpha = 0;
			this.botCont.addChild(this.icon);

			this.icons.push(this.icon);
		}

		//--------------------------------------------------------------------

		this.leftCont = new PIXI.Container();
		this.leftCont.sortableChildren = true;
		// this.baseCont.addChild(this.leftCont);
		this.leftCont._zIndex = 30000;
		this.leftCont.scale.x = this.leftCont.scale.y = 2;

		this.leftUI = new PIXI.Sprite(this.t_leftUI);
		this.leftUI.anchor.x = 0;
		this.leftUI.anchor.y = 0;
		this.leftUI._zIndex = 100;
		this.leftUI.alpha = 1;
		this.leftCont.addChild(this.leftUI);

		this.leftUIBack = new PIXI.Sprite(this.t_leftUIBack);
		this.leftUIBack.anchor.x = 0;
		this.leftUIBack.anchor.y = 0;
		this.leftUIBack._zIndex = 10;
		this.leftUIBack.alpha = 1;
		this.leftCont.addChild(this.leftUIBack);

		this.leftUIMask = new PIXI.Sprite(this.t_leftUIMask);
		this.leftUIMask.anchor.x = 0;
		this.leftUIMask.anchor.y = 0;
		this.leftUIMask._zIndex = 10;
		this.leftUIMask.alpha = 1;
		this.leftCont.addChild(this.leftUIMask);

		this.leftRedBar = new PIXI.Sprite(this.t_redBarColor);
		this.leftRedBar.anchor.x = 0;
		this.leftRedBar.anchor.y = 0;
		this.leftRedBar._zIndex = 50;
		this.leftRedBar.alpha = 1;
		this.leftCont.addChild(this.leftRedBar);

		this.leftRedBar.mask = this.leftUIMask;

		//red text

		this.levText = new PIXI.Text("0");
		this.levText.anchor.x = 0;
		this.levText.anchor.y = 0;
		this.levText.position.x = 42;
		this.levText.position.y = 8;
		this.levText._zIndex = 215;
		this.levText.style = new PIXI.TextStyle({
			align: "left",
			lineHeight: 0,
			fill: 0xb03037,
			fontSize: 10,
			fontFamily: "SFPixelate",
		});
		this.levText.resolution = 2;
		this.leftCont.addChild(this.levText);

		//green text

		this.timeText = new PIXI.Text("0");
		this.timeText.anchor.x = 0;
		this.timeText.anchor.y = 0;
		this.timeText.position.x = 43;
		this.timeText.position.y = 30;
		this.timeText._zIndex = 215;
		this.timeText.style = new PIXI.TextStyle({
			align: "left",
			lineHeight: 0,
			fill: 0x485e63,
			fontSize: 9,
			fontFamily: "BMSpace",
		});
		this.timeText.resolution = 2;
		this.leftCont.addChild(this.timeText);

		//--------------------------------------------------------------------

		this.rightCont = new PIXI.Container();
		this.rightCont.sortableChildren = true;
		// this.baseCont.addChild(this.rightCont);
		this.rightCont._zIndex = 30000;
		this.rightCont.scale.x = this.rightCont.scale.y = 2;

		this.rightUI = new PIXI.Sprite(this.t_rightUI);
		this.rightUI.anchor.x = 1;
		this.rightUI.anchor.y = 0;
		this.rightUI._zIndex = 100;
		this.rightUI.alpha = 1;
		this.rightCont.addChild(this.rightUI);

		this.rightUIBack = new PIXI.Sprite(this.t_rightUIBack);
		this.rightUIBack.anchor.x = 1;
		this.rightUIBack.anchor.y = 0;
		this.rightUIBack._zIndex = 10;
		this.rightUIBack.alpha = 1;
		this.rightCont.addChild(this.rightUIBack);

		this.rightUIMask = new PIXI.Sprite(this.t_rightUIMask);
		this.rightUIMask.anchor.x = 0;
		this.rightUIMask.position.x = -this.rightUIMask.width;
		this.rightUIMask.anchor.y = 0;
		this.rightUIMask._zIndex = 310;
		// this.rightUIMask.alpha = 0;
		this.rightCont.addChild(this.rightUIMask);

		this.rightRedBar = new PIXI.Sprite(this.t_redBarColor);
		this.rightRedBar.anchor.x = 1;
		this.rightRedBar.anchor.y = 0;
		this.rightRedBar._zIndex = 50;
		this.rightRedBar.alpha = 1;
		this.rightCont.addChild(this.rightRedBar);

		this.rightRedBar.mask = this.rightUIMask;

		//red text

		this.coinText = new PIXI.Text("0");
		this.coinText.anchor.x = 1;
		this.coinText.anchor.y = 0;
		this.coinText.position.x = -42;
		this.coinText.position.y = 8;
		this.coinText.zIndex = 215;
		this.coinText.style = new PIXI.TextStyle({
			align: "right",
			lineHeight: 0,
			fill: 0xb03037,
			fontSize: 10,
			fontFamily: "SFPixelate",
		});
		this.coinText.resolution = 2;
		this.rightCont.addChild(this.coinText);

		//green text

		this.scoreText = new PIXI.Text("0");
		this.scoreText.anchor.x = 1;
		this.scoreText.anchor.y = 0;
		this.scoreText.position.x = -50;
		this.scoreText.position.y = 30;
		this.scoreText.zIndex = 215;
		this.scoreText.style = new PIXI.TextStyle({
			align: "right",
			lineHeight: 0,
			fill: 0x485e63,
			fontSize: 9,
			fontFamily: "BMSpace",
		});
		this.scoreText.resolution = 2;
		this.rightCont.addChild(this.scoreText);

		//--------------------------------------------------------------------

		// PIXI hearts removed - using HTML hearts instead
		// PIXI power-up container removed - using HTML power-up container instead

		//--------------------------------------------------------------------

		// HTML Power-up Container setup
		this.htmlPowerUpContainer = document.getElementById('htmlPowerUpContainer');
		this.powerRows = this.htmlPowerUpContainer.querySelectorAll('.power-up-row');
		this.powerIcons = this.htmlPowerUpContainer.querySelectorAll('.power-up-icon');
		this.powerWindows = this.htmlPowerUpContainer.querySelectorAll('.power-up-window');
		this.powerTitles = this.htmlPowerUpContainer.querySelectorAll('.power-up-title');
		this.powerDescriptions = this.htmlPowerUpContainer.querySelectorAll('.power-up-description');

		// Set up click event listeners for each power-up row
		this.powerRows.forEach((row, index) => {
			row.addEventListener('click', () => {
				this.powerButtonPushed(index);
			});
		});

		this.htmlPowerUpContainerLandscape = document.getElementById('htmlPowerUpContainerLandscape');
		if (this.htmlPowerUpContainerLandscape) {
			this.landscapePowerRows = this.htmlPowerUpContainerLandscape.querySelectorAll('.pu-landscape-row');
			this.landscapePowerIcons = this.htmlPowerUpContainerLandscape.querySelectorAll('.pu-landscape-icon');
			this.landscapePowerNames = this.htmlPowerUpContainerLandscape.querySelectorAll('.pu-landscape-name');
			this.landscapePowerDescs = this.htmlPowerUpContainerLandscape.querySelectorAll('.pu-landscape-desc');
			this.landscapePowerRows.forEach((row, index) => {
				row.addEventListener('click', () => {
					this.powerButtonPushed(index);
				});
			});
		}

		// Initialize arrays for compatibility with existing code
		this.powerPics = [];
		this.powerButs = [];
		this.puTitles = [];
		this.puDiscs = [];

		// Create dummy PIXI objects for compatibility (these won't be rendered)
		for (var i = 0; i <= 2; i++) {
			// Dummy power pic
			this.powerPic = { num: i };
			this.powerPics.push(this.powerPic);

			// Dummy button
			this.but = { num: i };
			this.powerButs.push(this.but);

			// Dummy title (will be updated via HTML)
			this.puTextTitle = { text: "LIGHTNING BOLTS" };
			this.puTitles.push(this.puTextTitle);

			// Dummy description (will be updated via HTML)
			this.puTextDisc = { text: "strikes random enemies dead." };
			this.puDiscs.push(this.puTextDisc);
		}

		// this.powerCont.alpha = 0;

		this._pixiUiBuilt = true;
	}

	isPowerUpPickLocked() {
		return this.e?.mobile === true && Date.now() < (this._powerUpPickLockedUntil || 0);
	}

	setPowerUpPickInputEnabled(enabled) {
		const containers = [this.htmlPowerUpContainer, this.htmlPowerUpContainerLandscape];
		for (let i = 0; i < containers.length; i++) {
			const el = containers[i];
			if (!el) continue;
			el.style.pointerEvents = enabled ? '' : 'none';
		}
	}

	powerButtonPushed(num) {
		if (this.isPowerUpPickLocked()) return;

		this.e.scene.powerPick = num;
		if (this.e && this.e.s) {
			this.e.s.p('achievement1');
		}
		this.e.scene.action = "power up out";
	}

	useLandscapePowerUpMenu() {
		return !!(this.e && typeof this.e.isMobileLandscape === 'function' && this.e.isMobileLandscape());
	}

	isPowerUpMenuVisible() {
		if (this.useLandscapePowerUpMenu()) {
			return (
				this.htmlPowerUpContainerLandscape &&
				this.htmlPowerUpContainerLandscape.style.display === 'block'
			);
		}
		return this.htmlPowerUpContainer.style.display === 'block';
	}

	showPowerUpContainer() {
		const fader = document.getElementById('powerUpFader');
		if (fader) fader.style.display = 'block';

		if (this._powerUpPickUnlockTimer) {
			clearTimeout(this._powerUpPickUnlockTimer);
			this._powerUpPickUnlockTimer = null;
		}

		if (this.e?.mobile === true) {
			this._powerUpPickLockedUntil = Date.now() + 1000;
			this.setPowerUpPickInputEnabled(false);
			this._powerUpPickUnlockTimer = setTimeout(() => {
				this._powerUpPickLockedUntil = 0;
				this._powerUpPickUnlockTimer = null;
				if (this.isPowerUpMenuVisible()) {
					this.setPowerUpPickInputEnabled(true);
				}
			}, 1000);
		} else {
			this._powerUpPickLockedUntil = 0;
			this.setPowerUpPickInputEnabled(true);
		}

		if (this.useLandscapePowerUpMenu()) {
			if (this.htmlPowerUpContainer) {
				this.htmlPowerUpContainer.style.display = 'none';
			}
			if (this.htmlPowerUpContainerLandscape) {
				this.htmlPowerUpContainerLandscape.style.display = 'block';
				this.htmlPowerUpContainerLandscape.setAttribute('aria-hidden', 'false');
			}
		} else {
			if (this.htmlPowerUpContainerLandscape) {
				this.htmlPowerUpContainerLandscape.style.display = 'none';
				this.htmlPowerUpContainerLandscape.setAttribute('aria-hidden', 'true');
			}
			this.htmlPowerUpContainer.style.display = 'block';
		}
		if (this.e && this.e.scene && this.e.scene.setGameplayHudVisible) {
			this.e.scene.setGameplayHudVisible(false);
		}
	}

	hidePowerUpContainer() {
		if (this._powerUpPickUnlockTimer) {
			clearTimeout(this._powerUpPickUnlockTimer);
			this._powerUpPickUnlockTimer = null;
		}
		this._powerUpPickLockedUntil = 0;
		this.setPowerUpPickInputEnabled(true);

		const fader = document.getElementById('powerUpFader');
		if (fader) fader.style.display = 'none';
		this.htmlPowerUpContainer.style.display = 'none';
		if (this.htmlPowerUpContainerLandscape) {
			this.htmlPowerUpContainerLandscape.style.display = 'none';
			this.htmlPowerUpContainerLandscape.setAttribute('aria-hidden', 'true');
		}
	}

	togglePowerUpContainer() {
		if (!this.useLandscapePowerUpMenu()) {
			if (this.htmlPowerUpContainer.style.display === 'block') {
				this.hidePowerUpContainer();
			} else {
				this.updatePowerUpIcons(['fireballs', 'freeze', 'lightningStrike']);
				this.showPowerUpContainer();
			}
			return;
		}

		if (this.isPowerUpMenuVisible()) {
			this.hidePowerUpContainer();
		} else {
			this.updatePowerUpIcons(['fireballs', 'freeze', 'lightningStrike']);
			this.showPowerUpContainer();
		}
	}

	formatPowerUpTitle(text) {
		return text.replace(/\s+(I{1,3}|IV)\.$/, '').toUpperCase();
	}

	formatPowerUpDescription(text) {
		return text.replace(/\n/g, ' ').toUpperCase();
	}

	formatPowerUpDescriptionLandscape(text) {
		return text.replace(/\n/g, ' ').trim().toLowerCase();
	}

	getPowerUpLevel(powerUpType) {
		const match = powerUpType.match(/(\d+)$/);
		return match ? parseInt(match[1], 10) : 1;
	}

	getPowerUpMaxLevel(powerUpType) {
		if (!powerUpType || powerUpType === 'none') return 1;
		const base = powerUpType.replace(/\d+$/, '');
		const maxLevels = {
			backwardsShot: 1,
			biggerShot: 4,
			bombs: 3,
			extraShot: 4,
			fasterShot: 4,
			fireballs: 3,
			footSpeed: 3,
			freeze: 2,
			heal: 2,
			lightningStrike: 3,
			magnet: 2,
			ninjaStar: 3,
			splinter: 1,
			coinShot: 3,
			stealth: 2,
			bulletShield: 2,
			jewelKill: 3,
		};
		return maxLevels[base] || 1;
	}

	getPowerUpWindowColor(powerUpType) {
		const base = powerUpType.replace(/\d+$/, '');
		const green = ['backwardsShot', 'biggerShot', 'extraShot', 'fasterShot', 'splinter', 'coinShot'];
		const red = ['fireballs', 'lightningStrike', 'bombs', 'ninjaStar', 'jewelKill'];
		const blue = ['footSpeed', 'freeze', 'magnet', 'heal', 'stealth', 'bulletShield'];

		if (green.includes(base)) return 'green';
		if (red.includes(base)) return 'red';
		if (blue.includes(base)) return 'blue';
		return 'green';
	}

	updatePowerUpWindow(index, powerUpType) {
		const windowEl = this.powerWindows[index];
		if (!windowEl) return;

		const color = this.getPowerUpWindowColor(powerUpType);
		const colorName = color.charAt(0).toUpperCase() + color.slice(1);
		windowEl.src = `./src/img/puMenu/puWindow${colorName}.png`;
	}

	getDotsBarWidth(maxLevel) {
		return 16 + maxLevel * 12;
	}

	updatePowerUpLevels(index, powerUpType) {
		const row = this.powerRows[index];
		const levelsEl = row ? row.querySelector('.power-up-levels') : null;

		if (!powerUpType || powerUpType === 'none') {
			if (levelsEl) levelsEl.style.visibility = 'hidden';
			return;
		}

		const max = this.getPowerUpMaxLevel(powerUpType);
		const current = this.getPowerUpLevel(powerUpType);

		if (!levelsEl) return;
		levelsEl.style.visibility = max <= 1 ? 'hidden' : 'visible';
		const bg = levelsEl.querySelector('.power-up-dots-bg');
		const fill = levelsEl.querySelector('.power-up-dots-fill');
		if (!bg || !fill) return;

		bg.src = `./src/img/puMenu/dots_${max}.png`;
		bg.width = this.getDotsBarWidth(max);
		bg.height = 24;

		fill.innerHTML = '';
		for (let i = 0; i < max; i++) {
			const dot = document.createElement('span');
			dot.className = 'power-up-dot' + (i < current ? ' active' : '');
			dot.style.left = 15 + i * 12 + 'px';
			fill.appendChild(dot);
		}
	}

	updatePowerUpLandscapeLevel(index, powerUpType) {
		const landscapeRow =
			this.landscapePowerRows && this.landscapePowerRows[index]
				? this.landscapePowerRows[index]
				: null;
		if (!landscapeRow) return;

		const levelsEl = landscapeRow.querySelector('.pu-landscape-levels');
		const levelText = levelsEl
			? levelsEl.querySelector('.pu-landscape-level-text')
			: null;
		if (!levelsEl || !levelText) return;

		if (!powerUpType || powerUpType === 'none') {
			levelsEl.style.visibility = 'hidden';
			return;
		}

		const max = this.getPowerUpMaxLevel(powerUpType);
		const current = this.getPowerUpLevel(powerUpType);

		if (max <= 1) {
			levelsEl.style.visibility = 'hidden';
			return;
		}

		levelsEl.style.visibility = 'visible';
		levelText.textContent = current + '/' + max;
	}

	updatePowerUpLandscapeBorder(index, powerUpType) {
		const row =
			this.landscapePowerRows && this.landscapePowerRows[index]
				? this.landscapePowerRows[index]
				: null;
		if (!row) return;

		row.classList.remove('pu-border-green', 'pu-border-red', 'pu-border-blue');
		if (!powerUpType || powerUpType === 'none') return;

		const color = this.getPowerUpWindowColor(powerUpType);
		row.classList.add('pu-border-' + color);
	}

	updatePowerUpLandscapeRow(index, powerUpType) {
		if (!this.landscapePowerRows || !this.landscapePowerRows[index]) return;

		const iconElement = this.landscapePowerIcons[index];
		const nameEl = this.landscapePowerNames[index];
		const descEl = this.landscapePowerDescs[index];
		const row = this.landscapePowerRows[index];
		const levelsEl = row.querySelector('.pu-landscape-levels');

		if (!powerUpType || powerUpType === 'none') {
			if (iconElement) iconElement.src = './src/img/clear.png';
			if (nameEl) nameEl.textContent = 'NONE';
			if (descEl) descEl.textContent = '';
			if (levelsEl) levelsEl.style.visibility = 'hidden';
			if (row) row.style.opacity = '1';
			this.updatePowerUpLandscapeBorder(index, powerUpType);
			return;
		}

		if (levelsEl) levelsEl.style.visibility = 'visible';
		if (iconElement) iconElement.src = this.getPowerUpIconPath(powerUpType);
		this.updatePowerUpLandscapeBorder(index, powerUpType);
		this.updatePowerUpWindow(index, powerUpType);
		this.getPowerIcon(powerUpType, index);
		if (nameEl) {
			nameEl.textContent = this.formatPowerUpTitle(this.puTitles[index].text);
		}
		if (descEl) {
			descEl.textContent = this.formatPowerUpDescriptionLandscape(
				this.puDiscs[index].text
			);
		}
		this.updatePowerUpLandscapeLevel(index, powerUpType);
	}

	getPowerUpIconPath(powerUpType) {
		switch (powerUpType) {
			case 'backwardsShot':
				return './src/img/puMenu/pi_backwardsShot.png';
			case 'biggerShot':
			case 'biggerShot2':
			case 'biggerShot3':
			case 'biggerShot4':
				return './src/img/puMenu/pi_biggerShot.png';
			case 'bombs':
			case 'bombs2':
			case 'bombs3':
				return './src/img/puMenu/pi_bombs.png';
			case 'extraShot':
			case 'extraShot2':
			case 'extraShot3':
			case 'extraShot4':
				return './src/img/puMenu/pi_extraShot.png';
			case 'fasterShot':
			case 'fasterShot2':
			case 'fasterShot3':
			case 'fasterShot4':
				return './src/img/puMenu/pi_fasterShot.png';
			case 'fireballs':
			case 'fireballs2':
			case 'fireballs3':
				return './src/img/puMenu/pi_fireballs.png';
			case 'footSpeed':
			case 'footSpeed2':
			case 'footSpeed3':
				return './src/img/puMenu/pi_footSpeed.png';
			case 'freeze':
			case 'freeze2':
				return './src/img/puMenu/pi_frost.png';
			case 'heal':
			case 'heal2':
				return './src/img/puMenu/pi_heal.png';
			case 'lightningStrike':
			case 'lightningStrike2':
			case 'lightningStrike3':
				return './src/img/puMenu/pi_lightningStrike.png';
			case 'magnet':
			case 'magnet2':
				return './src/img/puMenu/pi_magnet.png';
			case 'ninjaStar':
			case 'ninjaStar2':
			case 'ninjaStar3':
				return './src/img/puMenu/pi_ninjaStar.png';
			case 'splinter':
				return './src/img/puMenu/pi_splinter.png';
			case 'coinShot':
			case 'coinShot2':
			case 'coinShot3':
				return './src/img/puMenu/coinShot.png';
			case 'stealth':
			case 'stealth2':
				return './src/img/puMenu/stealth.png';
			case 'bulletShield':
			case 'bulletShield2':
				return './src/img/puMenu/bulletShield.png';
			case 'jewelKill':
			case 'jewelKill2':
			case 'jewelKill3':
				return './src/img/puMenu/jewelKill.png';
			default:
				return './src/img/clear.png';
		}
	}

	getPowerUpGuideTypes() {
		return [
			'backwardsShot',
			'biggerShot',
			'extraShot',
			'fasterShot',
			'splinter',
			'coinShot',
			'fireballs',
			'lightningStrike',
			'bombs',
			'ninjaStar',
			'jewelKill',
			'footSpeed',
			'freeze',
			'heal',
			'magnet',
			'stealth',
			'bulletShield',
		];
	}

	updatePowerUpGuideLevels(levelsEl, powerUpType) {
		if (!levelsEl) return;

		const bg = levelsEl.querySelector('.power-up-dots-bg');
		const fill = levelsEl.querySelector('.power-up-dots-fill');
		if (!bg || !fill) return;

		const max = this.getPowerUpMaxLevel(powerUpType);
		if (max <= 1) {
			levelsEl.style.visibility = 'hidden';
			return;
		}

		levelsEl.style.visibility = 'visible';
		bg.src = `./src/img/puMenu/dots_${max}.png`;
		bg.width = this.getDotsBarWidth(max);
		bg.height = 24;

		fill.innerHTML = '';
		for (let i = 0; i < max; i++) {
			const dot = document.createElement('span');
			dot.className = 'power-up-dot' + (i === 0 ? ' active' : '');
			dot.style.left = 15 + i * 12 + 'px';
			fill.appendChild(dot);
		}
	}

	createPowerUpGuideRow(powerUpType) {
		const cell = document.createElement('div');
		cell.className = 'power-up-guide-cell';

		const inner = document.createElement('div');
		inner.className = 'power-up-guide-row-inner';

		const icon = document.createElement('img');
		icon.className = 'power-up-icon';
		icon.src = this.getPowerUpIconPath(powerUpType);
		icon.width = 66;
		icon.height = 66;
		icon.alt = '';

		const color = this.getPowerUpWindowColor(powerUpType);
		const colorName = color.charAt(0).toUpperCase() + color.slice(1);
		const windowImg = document.createElement('img');
		windowImg.className = 'power-up-window';
		windowImg.src = `./src/img/puMenu/puWindow${colorName}.png`;
		windowImg.width = 310;
		windowImg.height = 142;
		windowImg.alt = '';

		const title = document.createElement('div');
		title.className = 'power-up-title';

		const description = document.createElement('div');
		description.className = 'power-up-description';

		const levels = document.createElement('div');
		levels.className = 'power-up-levels';
		levels.innerHTML =
			'<div class="power-up-dots-wrap">' +
			'<img class="power-up-dots-bg" src="./src/img/puMenu/dots_3.png" width="52" height="24" alt="">' +
			'<div class="power-up-dots-fill"></div></div>';

		inner.appendChild(icon);
		inner.appendChild(windowImg);
		inner.appendChild(title);
		inner.appendChild(description);
		inner.appendChild(levels);
		cell.appendChild(inner);

		if (this.puTitles && this.puTitles[0] && this.puDiscs && this.puDiscs[0]) {
			this.getPowerIcon(powerUpType, 0);
			title.textContent = this.formatPowerUpTitle(this.puTitles[0].text);
			description.textContent = this.formatPowerUpDescription(this.puDiscs[0].text);
		}

		this.updatePowerUpGuideLevels(levels, powerUpType);

		return cell;
	}

	populatePowerUpGuide() {
		const grid = document.getElementById('powerUpGuideGrid');
		if (!grid) return;

		grid.innerHTML = '';
		const types = this.getPowerUpGuideTypes();
		for (let i = 0; i < types.length; i++) {
			grid.appendChild(this.createPowerUpGuideRow(types[i]));
		}
	}

	updatePowerUpIcons(powerUpTypes) {
		for (let i = 0; i < 3; i++) {
			const powerUpType = powerUpTypes[i];

			if (this.useLandscapePowerUpMenu()) {
				this.updatePowerUpLandscapeRow(i, powerUpType);
				continue;
			}

			const row = this.powerRows[i];
			const iconElement = this.powerIcons[i];
			const levelsEl = row ? row.querySelector('.power-up-levels') : null;

			if (!powerUpType || powerUpType === 'none') {
				if (iconElement) iconElement.src = './src/img/clear.png';
				if (this.powerTitles[i]) this.powerTitles[i].textContent = 'NONE';
				if (this.powerDescriptions[i]) this.powerDescriptions[i].textContent = '';
				if (levelsEl) levelsEl.style.visibility = 'hidden';
				if (row) row.style.opacity = '1';
				continue;
			}

			if (levelsEl) levelsEl.style.visibility = 'visible';

			iconElement.src = this.getPowerUpIconPath(powerUpType);
			this.updatePowerUpWindow(i, powerUpType);

			// Update the text labels by calling getPowerIcon
			this.getPowerIcon(powerUpType, i);
			this.powerTitles[i].textContent = this.formatPowerUpTitle(this.puTitles[i].text);
			this.powerDescriptions[i].textContent = this.formatPowerUpDescription(this.puDiscs[i].text);
			this.updatePowerUpLevels(i, powerUpType);
		}
	}

	getPowerIcon(p, num) {
		// console.log("get power icon "+p")

		if (p === 'none') {
			this.puTitles[num].text = 'NONE';
			this.powerTitles[num].textContent = 'NONE';
			this.puDiscs[num].text = '';
			this.powerDescriptions[num].textContent = '';
			return this.clear;
		}

		if (p === "backwardsShot") {
			this.puTitles[num].text = "BACKWARDS SHOT";
			this.puDiscs[num].text = "fires a shot backward\neach time you shoot";
			// Update HTML elements
			this.powerTitles[num].textContent = "BACKWARDS SHOT";
			this.powerDescriptions[num].textContent = "fires a shot backward\neach time you shoot";

			return this.t_pi_backwardsShot;
		} else if (
			p === "biggerShot" ||
			p === "biggerShot2" ||
			p === "biggerShot3" ||
			p === "biggerShot4"
		) {
			if (p === "biggerShot") {
				this.puTitles[num].text = "BIGGER SHOT I.";
				this.powerTitles[num].textContent = "BIGGER SHOT I.";
			} else if (p === "biggerShot2") {
				this.puTitles[num].text = "BIGGER SHOT II.";
				this.powerTitles[num].textContent = "BIGGER SHOT II.";
			} else if (p === "biggerShot3") {
				this.puTitles[num].text = "BIGGER SHOT III.";
				this.powerTitles[num].textContent = "BIGGER SHOT III.";
			} else if (p === "biggerShot4") {
				this.puTitles[num].text = "BIGGER SHOT IV.";
				this.powerTitles[num].textContent = "BIGGER SHOT IV.";
			}
			this.puDiscs[num].text = "stronger, bigger shots";
			this.powerDescriptions[num].textContent = "stronger, bigger shots";

			return this.t_pi_biggerShot;
		} else if (p === "bombs" || p === "bombs2" || p === "bombs3") {
			if (p === "bombs") {
				this.puTitles[num].text = "BOMBS I.";
				this.powerTitles[num].textContent = "BOMBS I.";
			} else if (p === "bombs2") {
				this.puTitles[num].text = "BOMBS II.";
				this.powerTitles[num].textContent = "BOMBS II.";
			} else if (p === "bombs3") {
				this.puTitles[num].text = "BOMBS III.";
				this.powerTitles[num].textContent = "BOMBS III.";
			}
			this.puDiscs[num].text = "fused bombs that\nexplode";
			this.powerDescriptions[num].textContent = "fused bombs that\nexplode";

			return this.t_pi_bombs;
		} else if (
			p === "extraShot" ||
			p === "extraShot2" ||
			p === "extraShot3" ||
			p === "extraShot4"
		) {
			if (p === "extraShot") {
				this.puTitles[num].text = "EXTRA SHOT I.";
				this.powerTitles[num].textContent = "EXTRA SHOT I.";
			} else if (p === "extraShot2") {
				this.puTitles[num].text = "EXTRA SHOT II.";
				this.powerTitles[num].textContent = "EXTRA SHOT II.";
			} else if (p === "extraShot3") {
				this.puTitles[num].text = "EXTRA SHOT III.";
				this.powerTitles[num].textContent = "EXTRA SHOT III.";
			} else if (p === "extraShot4") {
				this.puTitles[num].text = "EXTRA SHOT IV.";
				this.powerTitles[num].textContent = "EXTRA SHOT IV.";
			}
			this.puDiscs[num].text = "shoot an extra shot\neach time you shoot";
			this.powerDescriptions[num].textContent = "shoot an extra shot\neach time you shoot";

			return this.t_pi_extraShot;
		} else if (
			p === "fasterShot" ||
			p === "fasterShot2" ||
			p === "fasterShot3" ||
			p === "fasterShot4"
		) {
			if (p === "fasterShot") {
				this.puTitles[num].text = "FASTER SHOT I.";
				this.powerTitles[num].textContent = "FASTER SHOT I.";
			} else if (p === "fasterShot2") {
				this.puTitles[num].text = "FASTER SHOT II.";
				this.powerTitles[num].textContent = "FASTER SHOT II.";
			} else if (p === "fasterShot3") {
				this.puTitles[num].text = "FASTER SHOT III.";
				this.powerTitles[num].textContent = "FASTER SHOT III.";
			} else if (p === "fasterShot4") {
				this.puTitles[num].text = "FASTER SHOT IV.";
				this.powerTitles[num].textContent = "FASTER SHOT IV.";
			}
			this.puDiscs[num].text = "shoot faster";
			this.powerDescriptions[num].textContent = "shoot faster";

			return this.t_pi_fasterShot;
		} else if (p === "fireballs" || p === "fireballs2" || p === "fireballs3") {
			if (p === "fireballs") {
				this.puTitles[num].text = "FIREBALLS I.";
				this.powerTitles[num].textContent = "FIREBALLS I.";
			} else if (p === "fireballs2") {
				this.puTitles[num].text = "FIREBALLS II.";
				this.powerTitles[num].textContent = "FIREBALLS II.";
			} else if (p === "fireballs3") {
				this.puTitles[num].text = "FIREBALLS III.";
				this.powerTitles[num].textContent = "FIREBALLS III.";
			}
			this.puDiscs[num].text = "instantly burn all\nenemies in their path";
			this.powerDescriptions[num].textContent = "instantly burn all\nenemies in their path";

			return this.t_pi_fireballs;
		} else if (p === "footSpeed" || p === "footSpeed2" || p === "footSpeed3") {
			if (p === "footSpeed") {
				this.puTitles[num].text = "FOOT SPEED I.";
				this.powerTitles[num].textContent = "FOOT SPEED I.";
			} else if (p === "footSpeed2") {
				this.puTitles[num].text = "FOOT SPEED II.";
				this.powerTitles[num].textContent = "FOOT SPEED II.";
			} else if (p === "footSpeed3") {
				this.puTitles[num].text = "FOOT SPEED III.";
				this.powerTitles[num].textContent = "FOOT SPEED III.";
			}
			this.puDiscs[num].text = "move faster";
			this.powerDescriptions[num].textContent = "move faster";

			return this.t_pi_footSpeed;
		} else if (p === "freeze" || p === "freeze2") {
			if (p === "freeze") {
				this.puTitles[num].text = "FREEZE I.";
				this.powerTitles[num].textContent = "FREEZE I.";
			} else if (p === "freeze2") {
				this.puTitles[num].text = "FREEZE II.";
				this.powerTitles[num].textContent = "FREEZE II.";
			}
			this.puDiscs[num].text = "freezes enemies near\nyou for a short time";
			this.powerDescriptions[num].textContent = "freezes enemies near\nyou for a short time";

			return this.t_pi_frost;
		} else if (p === "heal" || p === "heal2") {
			this.puTitles[num].text = "HEAL";
			this.powerTitles[num].textContent = "HEAL";

			this.puDiscs[num].text = "heals one heart";
			this.powerDescriptions[num].textContent = "heals one heart";

			return this.t_pi_heal;
		} else if (
			p === "lightningStrike" ||
			p === "lightningStrike2" ||
			p === "lightningStrike3"
		) {
			if (p === "lightningStrike") {
				this.puTitles[num].text = "LIGHTNING BOLTS I.";
				this.powerTitles[num].textContent = "LIGHTNING BOLTS I.";
			} else if (p === "lightningStrike2") {
				this.puTitles[num].text = "LIGHTNING BOLTS II.";
				this.powerTitles[num].textContent = "LIGHTNING BOLTS II.";
			} else if (p === "lightningStrike3") {
				this.puTitles[num].text = "LIGHTNING BOLTS III.";
				this.powerTitles[num].textContent = "LIGHTNING BOLTS III.";
			}
			this.puDiscs[num].text = "strikes down random\nenemies";
			this.powerDescriptions[num].textContent = "strikes down random\nenemies";

			return this.t_pi_lightningStrike;
		} else if (p === "magnet" || p === "magnet2") {
			if (p === "magnet") {
				this.puTitles[num].text = "MAGNET I.";
				this.powerTitles[num].textContent = "MAGNET I.";
			} else if (p === "magnet2") {
				this.puTitles[num].text = "MAGNET II.";
				this.powerTitles[num].textContent = "MAGNET II.";
			}
			this.puDiscs[num].text = "increases gold pickup\nrange";
			this.powerDescriptions[num].textContent = "increases gold pickup\nrange";

			return this.t_pi_magnet;
		} else if (p === "ninjaStar" || p === "ninjaStar2" || p === "ninjaStar3") {
			if (p === "ninjaStar") {
				this.puTitles[num].text = "NINJA STAR I.";
				this.powerTitles[num].textContent = "NINJA STAR I.";
			} else if (p === "ninjaStar2") {
				this.puTitles[num].text = "NINJA STAR II.";
				this.powerTitles[num].textContent = "NINJA STAR II.";
			} else if (p === "ninjaStar3") {
				this.puTitles[num].text = "NINJA STAR III.";
				this.powerTitles[num].textContent = "NINJA STAR III.";
			}
			this.puDiscs[num].text = "stars circle around you";
			this.powerDescriptions[num].textContent = "stars circle around you";

			return this.t_pi_ninjaStar;
		} else if (p === "splinter") {
			this.puTitles[num].text = "SPLINTER";
			this.powerTitles[num].textContent = "SPLINTER";
			this.puDiscs[num].text = "when killed, enemies\nshoot out 3 shots";
			this.powerDescriptions[num].textContent = "when killed, enemies\nshoot out 3 shots";

			return this.t_pi_splinter;
		} else if (p === "coinShot" || p === "coinShot2" || p === "coinShot3") {
			if (p === "coinShot") {
				this.puTitles[num].text = "COIN SHOT I.";
				this.powerTitles[num].textContent = "COIN SHOT I.";
			} else if (p === "coinShot2") {
				this.puTitles[num].text = "COIN SHOT II.";
				this.powerTitles[num].textContent = "COIN SHOT II.";
			} else if (p === "coinShot3") {
				this.puTitles[num].text = "COIN SHOT III.";
				this.powerTitles[num].textContent = "COIN SHOT III.";
			}
			this.puDiscs[num].text = "fire shots when\ncollecting coins";
			this.powerDescriptions[num].textContent = "fire shots when\ncollecting coins";

			return this.t_pi_coinShot;
		} else if (p === "stealth" || p === "stealth2") {
			if (p === "stealth") {
				this.puTitles[num].text = "STEALTH I.";
				this.powerTitles[num].textContent = "STEALTH I.";
			} else if (p === "stealth2") {
				this.puTitles[num].text = "STEALTH II.";
				this.powerTitles[num].textContent = "STEALTH II.";
			}
			this.puDiscs[num].text = "phase out and\nconfuse enemies";
			this.powerDescriptions[num].textContent = "phase out and\nconfuse enemies";

			return this.t_pi_stealth;
		} else if (p === "bulletShield" || p === "bulletShield2") {
			if (p === "bulletShield") {
				this.puTitles[num].text = "BULLET SHIELD I.";
				this.powerTitles[num].textContent = "BULLET SHIELD I.";
				this.puDiscs[num].text = "gain 1 bullet shield charge";
				this.powerDescriptions[num].textContent = "prevents 1 bullet hit\nfrom hurting you";
			} else if (p === "bulletShield2") {
				this.puTitles[num].text = "BULLET SHIELD II.";
				this.powerTitles[num].textContent = "BULLET SHIELD II.";
				this.puDiscs[num].text = "gain 2 bullet shield charges";
				this.powerDescriptions[num].textContent = "prevents 2 bullet hits\nfrom hurting you";
			}

			return this.t_pi_bulletShield;
		} else if (p === "jewelKill" || p === "jewelKill2" || p === "jewelKill3") {
			if (p === "jewelKill") {
				this.puTitles[num].text = "JEWEL KILL I.";
				this.powerTitles[num].textContent = "JEWEL KILL I.";
				this.puDiscs[num].text = "creates a protective barrier.";
				this.powerDescriptions[num].textContent = "creates a protective barrier.";
			} else if (p === "jewelKill2") {
				this.puTitles[num].text = "JEWEL KILL II.";
				this.powerTitles[num].textContent = "JEWEL KILL II.";
				this.puDiscs[num].text = "bigger jewel hex.\nLasts longer.";
				this.powerDescriptions[num].textContent = "bigger jewel hex.\nLasts longer.";
			} else if (p === "jewelKill3") {
				this.puTitles[num].text = "JEWEL KILL III.";
				this.powerTitles[num].textContent = "JEWEL KILL III.";
				this.puDiscs[num].text = "jewels wipe all enemies.\nNo spawns for 3 sec.";
				this.powerDescriptions[num].textContent = "jewels wipe all enemies.\nNo spawns for 3 sec.";
			}

			return this.t_pi_jewelKill;
		}
	}

	update() {
		const scene = this.e?.scene;
		const pauseUiAnimation =
			scene?.action === 'game' && scene.pause === true;
		if (!pauseUiAnimation) {
			this.animate();
		}

		// this.app.renderer.resolution = window.devicePixelRatio;

		// console.log(window.devicePixelRatio)

		if (this.scoreText !== null && this.scoreText !== undefined) {
			// this.app.renderer.resize(this.app.screen.width * this.app.renderer.resolution, this.app.screen.height * this.app.renderer.resolution);

			this.winText.position.x = Math.round(window.innerWidth / 2);
			this.winText.position.y = Math.round(window.innerHeight / 2) - 200;

			this.cover.position.x = Math.round(window.innerWidth / 2);
			this.cover.position.y = Math.round(window.innerHeight / 2);

			this.cover2.position.x = Math.round(window.innerWidth / 2);
			this.cover2.position.y = Math.round(window.innerHeight / 2);

			if (window.innerHeight < 600 || window.innerWidth < 1000) {
				this.cover.scale.x = this.cover.scale.y = 1;
				this.cover2.scale.x = this.cover2.scale.y = 1;
			} else {
				this.cover.scale.x = this.cover.scale.y = 3;
				this.cover2.scale.x = this.cover2.scale.y = 3;
			}

			this.instructions.position.x = Math.round(window.innerWidth / 2);
			this.instructions.position.y =
				Math.round(window.innerHeight / 2) + this.e.scene.t.topOffset;

			this.instructions2.position.x = Math.round(window.innerWidth / 2);
			this.instructions2.position.y =
				Math.round(window.innerHeight / 2) + this.e.scene.t.botOffset;

			// HTML power-up container positioning handled by CSS

			// PIXI hearts positioning removed - using HTML hearts instead

			this.faderRed.width = window.innerWidth;
			this.faderRed.height = window.innerHeight;

			this.faderBlack.width = window.innerWidth;
			this.faderBlack.height = window.innerHeight;

			this.vig.width = window.innerWidth;
			this.vig.height = window.innerHeight;

		// Old PIXI mute buttons removed - now using HTML button

			this.rightCont.position.x = window.innerWidth;
			this.botCont.position.x = 100;
			this.botCont.position.y = window.innerHeight;
			if (this.e.mobile !== true) {
				this.botCont.visible = true;
			}

			const vv = window.visualViewport;
			const vw = vv ? vv.width : window.innerWidth;
			const vh = vv ? vv.height : window.innerHeight;
            const isMobileLandscape =
                this.e && typeof this.e.isMobileLandscape === 'function' && this.e.isMobileLandscape();

			this.deathCont.position.x = Math.round(vw / 2);
			if (isMobileLandscape) {
				this.deathCont.position.y = Math.round(
					vh / 2 + this.e.scene.t.deathOffset
				);
				this.playerDeath.position.y = 0;
				this.logoGhost.position.y = 0;
			} else if (this.e.mobile === true) {
				this.deathCont.position.y = Math.round(
					vh / 2 + this.e.scene.t.deathOffset
				) - 120;
			} else {
				this.deathCont.position.y = Math.round(
					vh / 2 + this.e.scene.t.deathOffset
				);
			}

			if (this.e.mobile === true) {
				this.leftCont.scale.x = this.leftCont.scale.y = 2 * 0.5;
				this.rightCont.scale.x = this.rightCont.scale.y = 2 * 0.5;
				// PIXI hearts scaling removed - using HTML hearts instead
				// HTML power-up container scaling handled by CSS
				this.botCont.visible = false;
				this.botCont.scale.x = this.botCont.scale.y = 2 * 0.5;
				this.botCont.position.x = 10;
				this.instructions.scale.x = this.instructions.scale.y = 2 * 0.5;
				this.instructions2.scale.x = this.instructions2.scale.y = 2 * 0.5;
				// PIXI hearts positioning removed - using HTML hearts instead
				this.deathCont.scale.x = this.deathCont.scale.y = 2 * 0.5;
				this.coinsCollectedText.scale.x = this.coinsCollectedText.scale.y = 2 * 0.5;
				// if(this.e.mobile===true){
				this.instructions.texture = this.t_instructionsb;
				// }
		
			}
		}

		// //base cont
		// this.baseCont = new PIXI.Container();
		// this.baseCont.sortableChildren = true;
		// this.app.stage.addChild(this.baseCont);

		// this.tester = new PIXI.Sprite(this.white);
		// this.tester.width=50;
		// this.tester.height=50;
		// // this.tester.alpha=0;
		// this.tester._zIndex=100000;
		// this.app.stage.addChild(this.tester);

		// //main cont
		// this.mainCont = new PIXI.Container();
		// this.mainCont.sortableChildren = true;
		// this.baseCont.addChild(this.mainCont);

		// //center main cont
		// this.mainCont.position.x = Math.round(window.innerWidth/2);
	}

	animate() {
		for (var i = 0; i < this.animatedSprites.length; i++) {
			if (this.animatedSprites !== null) {
				var a = this.animatedSprites[i];

				if (a.aniCount === undefined) {
					a.aniCount = 0;
					a.curFrame = 0;
				}

				if (a.aniSpeed === undefined) {
					a.aniSpeed = 0.25;
				}

				if (a.ani === undefined) {
					a.ani = [];
				}

				a.aniCount += this.e.dt;

				if (a.aniCount > a.aniSpeed && a.dontAnimate !== true) {
					a.aniCount = 0;
					a.curFrame += 1;

					if (a.curFrame >= a.ani.length - 1 && a.aniLoop === false) {
						a.curFrame = a.ani.length - 1;
					}

					if (a.curFrame >= a.ani.length && a.aniLoop !== false) {
						a.curFrame = 0;
					}

					a.texture = a.ani[a.curFrame];
				}
			}
		}
	}
}