import { gsap } from "./greensock/all.js";

export class UI {

    setUp(e) {

        this.e = e;

        //-----------------

        this.uiCanvas = document.getElementById('mycanvas');

        this.animatedSprites=[];

        this.app = new PIXI.Application({
            view: this.uiCanvas,
            width: window.innerWidth, 
            height: window.innerHeight,
            transparent: true,
			resolution: window.devicePixelRatio,
			appDensity: true
        });

        window.addEventListener('resize', (event) => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
        PIXI.settings.RESOLUTION = window.devicePixelRatio;

        this.app.renderer.plugins.interaction.mouseOverRenderer = true;

        this.counter=0;

    }

    load() {

        console.log("LOAD IMAGES")

        this.loader = new PIXI.Loader();
        this.loader.reset();
        
        //----------------------------------------------------

        this.loader.add('white', './src/img/white.png');
        this.loader.add('black', './src/img/black.png');

        this.loader.add('logo_white', './src/img/logo/logo_white.png');
        this.loader.add('logo_red', './src/img/logo/logo_red.png');
        this.loader.add('logo_yellow', './src/img/logo/logo_yellow.png');
        this.loader.add('logo_green', './src/img/logo/logo_green.png');
        this.loader.add('logo_cyan', './src/img/logo/logo_cyan.png');
        this.loader.add('logo_blue', './src/img/logo/logo_blue.png');
        this.loader.add('logo_purple', './src/img/logo/logo_purple.png');

        this.loader.add('monitor', './src/img/monitor.png');
        this.loader.add('glass', './src/img/glass.png');
        this.loader.add('vig', './src/img/vig.png');

        this.loader.add('bet1', './src/img/bet1.png');
        this.loader.add('bet2', './src/img/bet2.png');
        this.loader.add('bet3', './src/img/bet3.png');
        this.loader.add('bet4', './src/img/bet4.png');
        this.loader.add('reset', './src/img/reset.png');
        this.loader.add('lose', './src/img/lose.png');

        this.loader.add('gradBot', './src/img/gradBot.png');
        this.loader.add('gradTop', './src/img/gradTop.png');
        this.loader.add('smoke', './src/img/smoke.png');

        this.loader.add('glitch_checker1', './src/img/glitch_checker1.png');
        this.loader.add('glitch_checker2', './src/img/glitch_checker2.png');
        this.loader.add('glitch_checker3', './src/img/glitch_checker3.png');
        this.loader.add('glitch_green', './src/img/glitch_green.png');

        this.loader.add('static_1', './src/img/static/static_1.jpg');
        this.loader.add('static_2', './src/img/static/static_2.jpg');
        this.loader.add('static_3', './src/img/static/static_3.jpg');
        this.loader.add('static_4', './src/img/static/static_4.jpg');
        this.loader.add('static_5', './src/img/static/static_5.jpg');
        this.loader.add('static_6', './src/img/static/static_6.jpg');
        this.loader.add('static_7', './src/img/static/static_7.jpg');
        this.loader.add('static_8', './src/img/static/static_8.jpg');
        this.loader.add('static_9', './src/img/static/static_9.jpg');
        this.loader.add('static_10', './src/img/static/static_10.jpg');

        this.loader.add('break_1', './src/img/breaks/break_1.png');
        this.loader.add('break_2', './src/img/breaks/break_2.png');
        this.loader.add('break_3', './src/img/breaks/break_3.png');
        this.loader.add('break_4', './src/img/breaks/break_4.png');
        this.loader.add('break_5', './src/img/breaks/break_5.png');
        this.loader.add('break_6', './src/img/breaks/break_6.png');
        this.loader.add('break_7', './src/img/breaks/break_7.png');
        this.loader.add('break_8', './src/img/breaks/break_8.png');
        this.loader.add('break_9', './src/img/breaks/break_9.png');
        this.loader.add('break_10', './src/img/breaks/break_10.png');

        this.loader.add('bgLogo', './src/img/bgLogo.png');
        
        //----------------------------------------------------

        this.loader.load((loader, resources) => {

            console.log("UI LOADED")

            this.isLoaded_UI=true;

            //----------------------------------------------------

            this.t_white=resources.white.texture;
            this.t_black=resources.black.texture;

            this.t_logo_white=resources.logo_white.texture;
            this.t_logo_red=resources.logo_red.texture;
            this.t_logo_yellow=resources.logo_yellow.texture;
            this.t_logo_green=resources.logo_green.texture;
            this.t_logo_cyan=resources.logo_cyan.texture;
            this.t_logo_blue=resources.logo_blue.texture;
            this.t_logo_purple=resources.logo_purple.texture;

            this.t_monitor=resources.monitor.texture;
            this.t_glass=resources.glass.texture;
            this.t_vig=resources.vig.texture;

            this.t_bet1=resources.bet1.texture;
            this.t_bet2=resources.bet2.texture;
            this.t_bet3=resources.bet3.texture;
            this.t_bet4=resources.bet4.texture;
            this.t_reset=resources.reset.texture;
            this.t_lose=resources.lose.texture;

            this.t_gradBot=resources.gradBot.texture;
            this.t_gradTop=resources.gradTop.texture;
            this.t_smoke=resources.smoke.texture;

            this.t_glitch_checker1=resources.glitch_checker1.texture;
            this.t_glitch_checker2=resources.glitch_checker2.texture;
            this.t_glitch_checker3=resources.glitch_checker3.texture;
            this.t_glitch_green=resources.glitch_green.texture;

            this.t_static_1=resources.static_1.texture;
            this.t_static_2=resources.static_2.texture;
            this.t_static_3=resources.static_3.texture;
            this.t_static_4=resources.static_4.texture;
            this.t_static_5=resources.static_5.texture;
            this.t_static_6=resources.static_6.texture;
            this.t_static_7=resources.static_7.texture;
            this.t_static_8=resources.static_8.texture;
            this.t_static_9=resources.static_9.texture;
            this.t_static_10=resources.static_10.texture;

            this.t_break_1=resources.break_1.texture;
            this.t_break_2=resources.break_2.texture;
            this.t_break_3=resources.break_3.texture;
            this.t_break_4=resources.break_4.texture;
            this.t_break_5=resources.break_5.texture;
            this.t_break_6=resources.break_6.texture;
            this.t_break_7=resources.break_7.texture;
            this.t_break_8=resources.break_8.texture;
            this.t_break_9=resources.break_9.texture;
            this.t_break_10=resources.break_10.texture;

            this.t_bgLogo=resources.bgLogo.texture;
            
        });

        //----------------------------------------------------
        //----------------------------------------------------
        //----------------------------------------------------

    }

    //---------------------------------------------------------------------------------------------------------

    update(){

        this.animate();

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
                    a.aniSpeed = .25;
                }

                if (a.ani === undefined) {
                    a.ani = [];
                }

                if(a.aniPause!==true){
                    a.aniCount += this.e.dt;
                }

                if (a.aniCount > a.aniSpeed) {

                    a.aniCount = 0;
                    if(a.aniLoop===false){
                        if (a.curFrame < a.ani.length-1){
                            a.curFrame += 1;
                        }
                    }else{
                        a.curFrame += 1;
                    }
                    
                    if (a.curFrame >= a.ani.length && a.aniLoop!==false) {
                        a.curFrame = 0;
                    }

                    a.texture = a.ani[a.curFrame];

                }

            }

        }

    }

}