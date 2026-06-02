import { CrazyGamesAPI } from './crazyGames.js';

export class Engine {
    constructor(
        skipTo,
        showOutput,
        scene,
        input,
        sounds,
        utilities,
        ui
    ) {
        this.skipTo = skipTo;
        this.showOutput = showOutput;
        this.scene = scene;
        this.input = input;
        this.s = sounds;
        this.u = utilities;
        this.ui = ui;
        this.debugMode = window.__DEBUG_RUNTIME === true;

        this.mouse = new Object;
        this.mouse.x=0;
        this.mouse.y=0;
        this.touch = new Object;
        this.touch.x=0;
        this.touch.y=0;
        this._isRenderContextLost = false;

        this.mobile = this.detectMobile();
        this.applyMobileClass();
        this.syncSplashLayout();
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.applyMobileClass();
                this.syncSplashLayout();
                this.syncViewportForDisplay();
            });
        }
        window.addEventListener('resize', () => {
            const next = this.detectMobile();
            if (next !== this.mobile) {
                this.mobile = next;
            }
            this.applyMobileClass();
            this.syncSplashLayout();
            this.syncViewportForDisplay();
            if (this.scene && this.scene.instructionsVisible) {
                if (this.scene.updateInstructionsImage) {
                    this.scene.updateInstructionsImage();
                }
                if (this.scene.updateInstructionsCloseButton) {
                    this.scene.updateInstructionsCloseButton();
                }
            }
            if (this.scene && this.scene.setGameplayHudVisible) {
                const hearts = document.getElementById('htmlHeartsContainer');
                if (hearts && hearts.style.display === 'flex') {
                    this.scene.setGameplayHudVisible(true);
                }
            }
        });

        //---vars--------------------------------------------------------------------------------------------------------------

        this.action="set up"
        this.count=0;

        document.addEventListener('mousemove',  (event) => {
            if(this.mobile===false){
                this.mouse.x = event.offsetX
                this.mouse.y = event.offsetY
            }

        });

        this.loadGame();

    }

    detectMobile() {
        if (navigator.userAgentData?.mobile === true) {
            return true;
        }

        const ua = navigator.userAgent || '';

        if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
            return true;
        }

        if (/iPad/i.test(ua)) {
            return true;
        }

        // iPadOS 13+ often reports as Macintosh
        if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) {
            return true;
        }

        if (/Android/i.test(ua)) {
            return true;
        }

        // Touch-primary devices only — never treat desktop window size as mobile
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const noHover = window.matchMedia('(hover: none)').matches;
        const canHover = window.matchMedia('(hover: hover)').matches;

        if (coarsePointer && noHover && !finePointer && !canHover) {
            return true;
        }

        return false;
    }

    isMobileLandscape() {
        if (!this.mobile) {
            return false;
        }
        const { width, height } = this.getViewportSize();
        return width > height;
    }

    applyMobileClass() {
        if (this.mobile) {
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
        if (this.isMobileLandscape()) {
            document.body.classList.add('is-landscape');
        } else {
            document.body.classList.remove('is-landscape');
        }
    }

    getViewportSize() {
        const vv = window.visualViewport;
        return {
            width: vv ? vv.width : window.innerWidth,
            height: vv ? vv.height : window.innerHeight,
        };
    }

    forcePixiRender() {
        if (this._isRenderContextLost) return;
        const app = this.ui?.app;
        if (!app?.renderer) return;
        try {
            if (app.ticker && app.ticker.started === false) {
                app.ticker.start();
            }
            app.renderer.render(app.stage);
        } catch (err) {
            console.warn('[render] warm-up render failed:', err);
        }
    }

    schedulePostLoadRepaints() {
        if (this._postLoadRepaintsActive) return;
        this._postLoadRepaintsActive = true;

        const delays = [0, 50, 150, 400, 1000];
        for (let i = 0; i < delays.length; i++) {
            setTimeout(() => {
                if (this.scene?.syncMainMaskSize) {
                    this.scene.syncMainMaskSize();
                }
                if (this.scene?.snapCameraToPlayer) {
                    this.scene.snapCameraToPlayer();
                }
                this.syncViewportForDisplay();
            }, delays[i]);
        }

        setTimeout(() => {
            this._postLoadRepaintsActive = false;
        }, delays[delays.length - 1] + 50);
    }

    syncViewportForDisplay() {
        if (this.ui?.resizeRendererToWindow) {
            this.ui.resizeRendererToWindow();
        } else if (this.scene?.snapCameraToPlayer) {
            this.scene.snapCameraToPlayer();
        }
        this.forcePixiRender();
    }

    syncSplashLayout() {
        const root = document.documentElement;
        const { width, height } = this.getViewportSize();
        const isLandscape = this.isMobileLandscape();

        if (!isLandscape) {
            root.style.removeProperty('--splash-top');
            root.style.removeProperty('--splash-transform');
            return;
        }

        const topPx = Math.round(height * 0.4);
        root.style.setProperty('--splash-top', `${topPx}px`);
        root.style.setProperty(
            '--splash-transform',
            height < 285
                ? 'translate(-50%, -50%) scale(0.5)'
                : 'translate(-50%, -50%)'
        );
    }

    start(){

    }

    update(){
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);

        //---deltatime--------------------------------------------------------------------------------------------------------------

        var currentTime = new Date().getTime();
        this.dt = (currentTime - this.lastTime) / 1000;
        if (this.dt > .1) {
            this.dt = 0;
        }
        this.lastTime = currentTime;

        // console.log(this.action)

        //---loop--------------------------------------------------------------------------------------------------------------

        if(this.mobile===true){

            if(this.input.ongoingTouches.length>0){
                this.touch.x = this.input.ongoingTouches[0].clientX
                this.touch.y = this.input.ongoingTouches[0].clientY
            }else{
                this.touch.x = 0
                this.touch.y = 0
            }

            this.mouse.x=this.touch.x;
            this.mouse.y=this.touch.y;
        }

        //make a square that shows where the mouse is

        if(this.ui.tester!==null && this.ui.tester!==undefined){
            this.ui.tester.position.x=this.mouse.x;
            this.ui.tester.position.y=this.mouse.y;
        }

        // document.getElementById("feedback").innerHTML = this.action+"";

        if(this.action==="set up"){

            this.coverDiv = document.getElementById("coverDiv");
            this.coverBack = document.getElementById("coverBack");

            this.action="load images";


        }else if(this.action==="load images"){

            //load ui

            this.ui.load();
            this.action="wait for ui";

        }else if(this.action==="wait for ui"){

            const assetsReady = this.ui.isLoaded_UI === true;
            const soundsReady = this.s.isReadyForGameplay && this.s.isReadyForGameplay();

            if (assetsReady && soundsReady) {
                if (this.s.startDeferredSounds) {
                    this.s.startDeferredSounds();
                }
                if (!this.scene.sceneBuilt) {
                    try {
                        this.scene.buildScene();
                    } catch (err) {
                        console.error('[buildScene] failed:', err);
                    }
                }
                if (this.scene.sceneBuilt) {
                    this._warmFrames = 0;
                    this.action = "warming";
                }
            }

        }else if(this.action==="warming"){

            if (this.ui.resizeRendererToWindow) {
                this.ui.resizeRendererToWindow();
            }

            if (this.scene.sceneBuilt && this.ui._pixiUiBuilt !== true && this.ui.build) {
                this.ui.build();
            }

            if (this.scene.isWorldGraphicsReady()) {
                this.scene.snapCameraToPlayer();
                this.forcePixiRender();
                this._warmFrames = (this._warmFrames || 0) + 1;
            }

            const warmTarget = this.mobile ? 6 : 2;
            if (
                this.scene.isWorldGraphicsReady() &&
                this.ui._pixiUiBuilt === true &&
                (this._warmFrames || 0) >= warmTarget
            ) {
                this.scene.splashRevealReady = true;
                this.schedulePostLoadRepaints();
                this.action = "wait";
            }

            this.ui.update();
            this.scene.update();

        }else if(this.action==="wait"){

            if (this.ui.resizeRendererToWindow) {
                this.ui.resizeRendererToWindow();
            }

            this.ui.update();
            this.scene.update();

            if (this.scene.isWorldGraphicsReady()) {
                this.scene.snapCameraToPlayer();
                this.forcePixiRender();
                this._waitReadyFrames = (this._waitReadyFrames || 0) + 1;
            }

            const waitFrames = this.mobile ? 2 : 1;
            if (
                !this._loaderFadeStarted &&
                (this._waitReadyFrames || 0) >= waitFrames
            ) {
                this._loaderFadeStarted = true;
                this.schedulePostLoadRepaints();
                this.scene.fadeOutLoadingChrome();
                this.action = "go";
            }

        }else if(this.action==="go"){

            this.scene.update();
            this.ui.update();
            this.input.update();

        }

    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------

    // GENERIC LOADING CODE

    loadGame(){

        this.muteState=false;
        this.mutePosition = 0;

        this.createMuteButton();
        this.createPauseButton();
        if (this.debugMode) {
            this.createCanvasDebugTools();
        }

    }

    initMuteState() {
        if (CrazyGamesAPI.environment === 'crazygames') {
            if (!this.muteState) {
                this.gameStartSound = true;
            }
            this.syncMuteButtonIcon();
            return;
        }

        const storedMuteState = localStorage.getItem("mutestate");
        this.muteState = storedMuteState === "true";

        if (!this.muteState) {
            this.gameStartSound = true;
        }

        this.syncMuteButtonIcon();
    }

    bindHudControl(element, onActivate) {
        element.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            onActivate(e);
        });
    }

    createMuteButton() {
        const muteButton = document.getElementById('muteButton');
        if (!muteButton || muteButton.dataset.bound === 'true') {
            this.syncMuteButtonIcon();
            return;
        }

        muteButton.dataset.bound = 'true';

        this.bindHudControl(muteButton, () => {
            this.toggleMute(!this.muteState);
        });

        this.syncMuteButtonIcon();
    }

    syncMuteButtonIcon() {
        const icon = document.getElementById('muteIcon');
        if (!icon) return;
        icon.src = this.muteState
            ? './src/img/soundButton_off.png'
            : './src/img/soundButton_on.png';
    }

    createPauseButton() {
        const pauseButton = document.getElementById('pauseButton');
        if (!pauseButton || pauseButton.dataset.bound === 'true') {
            return;
        }

        pauseButton.dataset.bound = 'true';

        this.bindHudControl(pauseButton, () => {
            if (this.scene && typeof this.scene.togglePause === 'function') {
                this.scene.togglePause();
            }
        });
    }

    createCanvasDebugTools() {
        if (document.getElementById('canvasDebugBackdrop')) {
            return;
        }

        const backdrop = document.createElement('div');
        backdrop.id = 'canvasDebugBackdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '50vh';
        backdrop.style.zIndex = '4';
        backdrop.style.pointerEvents = 'none';
        backdrop.style.background = 'linear-gradient(180deg, rgba(255,0,255,0.2) 0%, rgba(0,255,255,0.2) 100%)';
        document.body.appendChild(backdrop);

        const opacityButton = document.createElement('button');
        opacityButton.id = 'canvasDebugOpacityButton';
        opacityButton.type = 'button';
        opacityButton.textContent = 'DEBUG CANVAS 50%';
        opacityButton.style.position = 'fixed';
        opacityButton.style.top = '10px';
        opacityButton.style.left = '10px';
        opacityButton.style.zIndex = '300000';
        opacityButton.style.padding = '8px 10px';
        opacityButton.style.fontSize = '12px';
        opacityButton.style.cursor = 'pointer';
        document.body.appendChild(opacityButton);

        opacityButton.addEventListener('click', () => {
            const canvas = document.getElementById('mycanvas');
            if (canvas) {
                canvas.style.opacity = '0.5';
            }
        });

        const reloadButton = document.createElement('button');
        reloadButton.id = 'canvasDebugReloadButton';
        reloadButton.type = 'button';
        reloadButton.textContent = 'DEBUG RELOAD CANVAS (DISABLED)';
        reloadButton.style.position = 'fixed';
        reloadButton.style.top = '10px';
        reloadButton.style.left = '170px';
        reloadButton.style.zIndex = '300000';
        reloadButton.style.padding = '8px 10px';
        reloadButton.style.fontSize = '12px';
        reloadButton.style.cursor = 'pointer';
        reloadButton.disabled = true;
        reloadButton.style.opacity = '0.5';
        document.body.appendChild(reloadButton);

        this.createDebugErrorPanel();
    }

    reloadCanvasDrawing() {
        this.pushDebugError('[debug] reloadCanvasDrawing disabled during Safari context-loss testing');
    }

    setRenderContextLost(isLost) {
        this._isRenderContextLost = isLost === true;
        if (this._isRenderContextLost) {
            this.pushDebugError('[debug] render context paused');
            return;
        }
        this.pushDebugError('[debug] render context resumed');
        if (this.ui?.resizeRendererToWindow) {
            this.ui.resizeRendererToWindow();
        }
        this.forcePixiRender();
    }

    createDebugErrorPanel() {
        if (document.getElementById('canvasDebugErrorPanel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'canvasDebugErrorPanel';
        panel.style.position = 'fixed';
        panel.style.left = '10px';
        panel.style.right = '10px';
        panel.style.bottom = '10px';
        panel.style.height = '180px';
        panel.style.padding = '8px';
        panel.style.zIndex = '300000';
        panel.style.overflowY = 'auto';
        panel.style.background = 'rgba(0,0,0,0.85)';
        panel.style.color = '#9bff9b';
        panel.style.fontFamily = 'monospace';
        panel.style.fontSize = '11px';
        panel.style.whiteSpace = 'pre-wrap';
        panel.style.border = '1px solid #2cff2c';
        panel.textContent = '[debug] error panel ready';
        document.body.appendChild(panel);

        this._debugErrorPanel = panel;

        window.addEventListener('error', (event) => {
            const file = event.filename || 'unknown';
            const line = event.lineno || 0;
            const col = event.colno || 0;
            const msg = event.message || 'Unknown error';
            this.pushDebugError(`[window.onerror] ${msg} @ ${file}:${line}:${col}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            const reasonText = reason && reason.stack
                ? reason.stack
                : String(reason);
            this.pushDebugError(`[unhandledrejection] ${reasonText}`);
        });
    }

    pushDebugError(message) {
        if (!this._debugErrorPanel) return;
        const timestamp = new Date().toISOString().slice(11, 23);
        this._debugErrorPanel.textContent += `\n${timestamp} ${message}`;
        this._debugErrorPanel.scrollTop = this._debugErrorPanel.scrollHeight;
    }

  toggleMute(value) {
        this.muteState = value;

        if (CrazyGamesAPI.environment !== 'crazygames') {
            localStorage.setItem("mutestate", value.toString());
        }

        this.syncMuteButtonIcon();
    }

    /** Restore mute UI/state after an ad without touching localStorage. */
    setMuteStateRuntime(value) {
        this.muteState = value;
        this.syncMuteButtonIcon();
    }

    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------

}
