import { gsap } from "./greensock/all.js";

export class UI {

    setUp(e) {

        this.e = e;

        //-----------------

        this.uiCanvas = document.getElementById('mycanvas');

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

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR_MIPMAP_NEAREST
        PIXI.settings.ROUND_PIXELS = true;
        PIXI.settings.RESOLUTION = window.devicePixelRatio;

        this.app.renderer.plugins.interaction.mouseOverRenderer = true;

        this.counter=0;

        this.animatedSprites=[];

    }

    load() {

        console.log("LOAD IMAGES")

        this.loader = new PIXI.Loader();
        this.loader.reset();
        
        //----------------------------------------------------

        this.loader.add('white', './src/img/white.png');
        this.loader.add('black', './src/img/black.png');
        this.loader.add('red', './src/img/red.png');

        this.loader.add('board', './src/img/board.png');
        this.loader.add('vig', './src/img/vig.png');

        this.loader.add('frameSide', './src/img/frameSide.png');
        this.loader.add('frameCorner', './src/img/frameCorner.png');
        this.loader.add('titleTop', './src/img/titleTop.png');
        this.loader.add('botLinkLeft', './src/img/botLinkLeft.png');
        this.loader.add('botLinkRight', './src/img/botLinkRight.png');
        this.loader.add('frameRight', './src/img/frameRight.png');
        this.loader.add('frameLeft', './src/img/frameLeft.png');

        this.loader.add('enter_l_1', './src/img/enter_l_1.png');
        this.loader.add('enter_l_2', './src/img/enter_l_2.png');
        this.loader.add('enter_r_1', './src/img/enter_r_1.png');
        this.loader.add('enter_r_2', './src/img/enter_r_2.png');
        this.loader.add('enter_u_1', './src/img/enter_u_1.png');
        this.loader.add('enter_u_2', './src/img/enter_u_2.png');
        this.loader.add('enter_d_1', './src/img/enter_d_1.png');
        this.loader.add('enter_d_2', './src/img/enter_d_2.png');
        this.loader.add('skullBox', './src/img/skullBox.png');
        this.loader.add('skullBox2', './src/img/skullBox2.png');

        this.loader.add('woodRepeat', './src/img/woodRepeat.jpg');

        this.loader.add('horseShoe', './src/img/horseShoe.png');
        this.loader.add('actionBar', './src/img/actionBar.png');
        this.loader.add('accusationBut', './src/img/accusationBut.png');
        this.loader.add('accusationWindow', './src/img/accusationWindow.png');
        this.loader.add('accusationFinal', './src/img/accusationFinal.png');

        this.loader.add('endRight', './src/img/endRight.png');
        this.loader.add('endWrong', './src/img/endWrong.png');
        
        this.loader.add('cardBack', './src/img/cards/cardBack.png');

        this.loader.add('doc', './src/img/cards/doc.png');
        this.loader.add('drunk', './src/img/cards/drunk.png');
        this.loader.add('gunSlinger', './src/img/cards/gunSlinger.png');
        this.loader.add('madam', './src/img/cards/madam.png');
        this.loader.add('preacher', './src/img/cards/preacher.png');
        this.loader.add('tycoon', './src/img/cards/tycoon.png');

        this.loader.add('generalStore', './src/img/cards/generalStore.png');
        this.loader.add('library', './src/img/cards/library.png');
        this.loader.add('poolHall', './src/img/cards/poolHall.png');
        this.loader.add('restaurant', './src/img/cards/restaurant.png');
        this.loader.add('saloon', './src/img/cards/saloon.png');
        this.loader.add('sheriffs', './src/img/cards/sheriffs.png');
        this.loader.add('stable', './src/img/cards/stable.png');
        this.loader.add('parlor', './src/img/cards/parlor.png');
        this.loader.add('studio', './src/img/cards/studio.png');

        this.loader.add('heartbreak', './src/img/cards/heartbreak.png');
        this.loader.add('knife', './src/img/cards/knife.png');
        this.loader.add('marlboros', './src/img/cards/marlboros.png');
        this.loader.add('midnightStare', './src/img/cards/midnightStare.png');
        this.loader.add('poisonKiss', './src/img/cards/poisonKiss.png');
        this.loader.add('whiskey', './src/img/cards/whiskey.png');

        this.loader.add('cross', './src/img/cards/cross.png');
        this.loader.add('mag', './src/img/cards/mag.png');

        this.loader.add('instructions', './src/img/instructions.png');
        this.loader.add('startMenu', './src/img/startMenu.png');

        this.loader.add('buttonUp', './src/img/buttons/buttonUp.png');
        this.loader.add('buttonDown', './src/img/buttons/buttonDown.png');
        this.loader.add('buttonRight', './src/img/buttons/buttonRight.png');
        this.loader.add('buttonLeft', './src/img/buttons/buttonLeft.png');

        this.loader.add('accButton', './src/img/buttons/accButton.png');

        //----------------------------------------------------

        this.loader.load((loader, resources) => {

            console.log("UI LOADED")

            this.isLoaded_UI=true;

            //----------------------------------------------------

            this.t_doc=resources.doc.texture;
            this.t_drunk=resources.drunk.texture;
            this.t_gunSlinger=resources.gunSlinger.texture;
            this.t_madam=resources.madam.texture;
            this.t_preacher=resources.preacher.texture;
            this.t_tycoon=resources.tycoon.texture;

            this.t_generalStore=resources.generalStore.texture;
            this.t_library=resources.library.texture;
            this.t_poolHall=resources.poolHall.texture;
            this.t_restaurant=resources.restaurant.texture;
            this.t_saloon=resources.saloon.texture;
            this.t_sheriffs=resources.sheriffs.texture;
            this.t_stables=resources.stable.texture;
            this.t_parlor=resources.parlor.texture;
            this.t_studio=resources.studio.texture;

            this.t_heartbreak=resources.heartbreak.texture;
            this.t_knife=resources.knife.texture;
            this.t_marlboros=resources.marlboros.texture;
            this.t_midnightStare=resources.midnightStare.texture;
            this.t_poisonKiss=resources.poisonKiss.texture;
            this.t_whiskey=resources.whiskey.texture;

            this.t_cross=resources.cross.texture;
            
            this.white=resources.white.texture;
            this.black=resources.black.texture;
            this.red=resources.red.texture;

            this.t_board=resources.board.texture;
            this.t_vig=resources.vig.texture;

            this.t_frameSide=resources.frameSide.texture;
            this.t_frameCorner=resources.frameCorner.texture;
            this.t_titleTop=resources.titleTop.texture;
            this.t_botLinkLeft=resources.botLinkLeft.texture;
            this.t_botLinkRight=resources.botLinkRight.texture;
            this.t_frameLeft=resources.frameLeft.texture;
            this.t_frameRight=resources.frameRight.texture;

            this.t_enter_l_1=resources.enter_l_1.texture;
            this.t_enter_l_2=resources.enter_l_2.texture;
            this.t_enter_r_1=resources.enter_r_1.texture;
            this.t_enter_r_2=resources.enter_r_2.texture;
            this.t_enter_u_1=resources.enter_u_1.texture;
            this.t_enter_u_2=resources.enter_u_2.texture;
            this.t_enter_d_1=resources.enter_d_1.texture;
            this.t_enter_d_2=resources.enter_d_2.texture;
            this.t_skullBox=resources.skullBox.texture;
            this.t_skullBox2=resources.skullBox2.texture;

            this.t_woodRepeat=resources.woodRepeat.texture;

            this.t_mag=resources.mag.texture;
            this.t_cardBack=resources.cardBack.texture;
            this.t_horseShoe=resources.horseShoe.texture;
            this.t_actionBar=resources.actionBar.texture;
            this.t_accusationBut=resources.accusationBut.texture;
            this.t_accusationWindow=resources.accusationWindow.texture;
            this.t_accusationFinal=resources.accusationFinal.texture;

            this.t_endRight=resources.endRight.texture;
            this.t_endWrong=resources.endWrong.texture;

            this.t_instructions=resources.instructions.texture;
            this.t_startMenu=resources.startMenu.texture;

            this.t_buttonUp=resources.buttonUp.texture;
            this.t_buttonDown=resources.buttonDown.texture;
            this.t_buttonLeft=resources.buttonLeft.texture;
            this.t_buttonRight=resources.buttonRight.texture;

            this.t_accButton=resources.accButton.texture;

        });

        //----------------------------------------------------
        //----------------------------------------------------
        //----------------------------------------------------

    }

    start(){

        
        // ---- buttons --------------------------------------------------------

        this.butCont = new PIXI.Container();
        this.butCont.sortableChildren = true;
        this.e.scene.mainCont.addChild(this.butCont);
    
        this.buttonSize = 80;

        this.leftBut = new PIXI.Sprite(this.t_buttonLeft);
        this.leftBut.anchor.x = 0;
        this.leftBut.anchor.y = 1;
        this.leftBut.width = this.buttonSize;
        this.leftBut.height = this.buttonSize;
        this.leftBut._zIndex = 60
        console.log(this.e.scene.mainCont);
        console.log(this.leftBut);
        this.butCont.addChild(this.leftBut);
        this.leftBut.interactive = true;
        this.leftBut.buttonMode = true;

        this.leftBut.on('touchstart', (event) => {
            this.e.input.keyLeft = true;
        })

        this.leftBut.on('touchend', (event) => {
            this.e.input.keyLeft = false;
        })

        this.leftBut.on('touchendoutside', (event) => {
            this.e.input.keyLeft = false;
        })

        this.rightBut = new PIXI.Sprite(this.t_buttonRight);
        this.rightBut.anchor.x = 0;
        this.rightBut.anchor.y = 1;
        this.rightBut.width = this.buttonSize;
        this.rightBut.height = this.buttonSize;
        this.rightBut._zIndex = 60
        this.butCont.addChild(this.rightBut);
        this.rightBut.interactive = true;
        this.rightBut.buttonMode = true;

        this.rightBut.on('touchstart', (event) => {
            this.e.input.keyRight = true;
            console.log("right")
  
        })

        this.rightBut.on('touchend', (event) => {
            this.e.input.keyRight = false;
            // console.log("right")
        })

        this.rightBut.on('touchendoutside', (event) => {
            this.e.input.keyRight = false;
            // console.log("right")
        })

        this.upBut = new PIXI.Sprite(this.t_buttonUp);
        this.upBut.anchor.x = 0;
        this.upBut.anchor.y = 1;
        this.upBut.width = this.buttonSize;
        this.upBut.height = this.buttonSize;
        this.upBut._zIndex = 60
        this.butCont.addChild(this.upBut);
        this.upBut.interactive = true;
        this.upBut.buttonMode = true;

        this.upBut.on('touchstart', (event) => {
            this.e.input.keyUp = true;
            console.log("up")
        })

        this.upBut.on('touchend', (event) => {
            this.e.input.keyUp = false;
        })

        this.upBut.on('touchendoutside', (event) => {
            this.e.input.keyUp = false;
        })

        this.downBut = new PIXI.Sprite(this.t_buttonDown);
        this.downBut.anchor.x = 0;
        this.downBut.anchor.y = 1;
        this.downBut.width = this.buttonSize;
        this.downBut.height = this.buttonSize;
        this.downBut._zIndex = 60
        this.butCont.addChild(this.downBut);
        this.downBut.interactive = true;
        this.downBut.buttonMode = true;

        this.downBut.on('touchstart', (event) => {
            this.e.input.keyDown = true;
            console.log("up")
        })

        this.downBut.on('touchend', (event) => {
            this.e.input.keyDown = false;
        })

        this.downBut.on('touchendoutside', (event) => {
            this.e.input.keyDown = false;
        })

        this.accMobBut = new PIXI.Sprite(this.t_accButton);
        this.accMobBut.anchor.x = .5;
        this.accMobBut.anchor.y = .5;
        this.accMobBut.scale.x = this.accMobBut.scale.y = .25;
        this.accMobBut.position.y = 10;
        this.accMobBut._zIndex = 60
        this.butCont.addChild(this.accMobBut);
        this.accMobBut.interactive = true;
        this.accMobBut.buttonMode = true;

        this.accMobBut.on('touchstart', (event) => {
            if(this.e.scene.pauseGame===false && this.e.scene.subAction==="play" && this.e.mobile===true){
                this.e.scene.pauseGame = true;
                this.e.scene.subAction = "set accusation"
            }
        })

        this.accMobBut.on('touchend', (event) => {
            
        })

        this.accMobBut.on('touchendoutside', (event) => {
            
        })

        this.accMobBut._zIndex = 100000;
        this.leftBut._zIndex = 100000;
        this.rightBut._zIndex = 100000;
        this.upBut._zIndex = 100000;
        this.downBut._zIndex = 100000;
        this.butCont._zIndex = 100000;

    }

    //---------------------------------------------------------------------------------------------------------

    update(){

        this.leftBut.position.y = window.innerHeight + -15;
        this.rightBut.position.y = window.innerHeight + -15;
        this.upBut.position.y = window.innerHeight + -15;
        this.downBut.position.y = window.innerHeight + -15;
        this.accMobBut.position.y = window.innerHeight + -115;

        this.butCont.position.x = window.innerWidth/2;

        this.leftBut.position.x =  ((this.buttonSize+3)*-2);
        this.rightBut.position.x = ((this.buttonSize+3)*-1);
        this.downBut.position.x =  ((this.buttonSize+3)*0);
        this.upBut.position.x =    ((this.buttonSize+3)*1);

        // this.downBut.position.x = this.e.screenWidth - this.buttonSize;
        // this.upBut.position.x = this.e.screenWidth - this.buttonSize*2;

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

        this.animate();

        this.fw = 37;
        this.updateFrame(this.e.scene.frame, window.innerWidth, window.innerHeight);

    }

    updateFrame(frame, w, h){

        if(this.e.mobile===true){
            w = w*4;
            h = h*4;
        }

        frame.topSide.width = w - (this.fw*2)
        frame.bottomSide.width = w - (this.fw*2)
        frame.leftSide.width = h - (this.fw*2)
        frame.rightSide.width = h - (this.fw*2)

        frame.topSide.position.set(w / 2, 0);
        frame.leftSide.position.set(0, h / 2);
        frame.rightSide.position.set(w, h / 2);
        frame.bottomSide.position.set(w / 2, h);

        frame.topLeftCorner.position.set(0, 0);
        frame.topRightCorner.position.set(w, 0);
        frame.bottomLeftCorner.position.set(0, h);
        frame.bottomRightCorner.position.set(w, h);

    }

    makeFrame(w, h, corner, side, fw){

        this.fw = fw;
        this.makeFrameVars=true;

        this.frameCont = new PIXI.Container();
        this.frameCont.sortableChildren = true;
        this.e.scene.mainCont.addChild(this.frameCont);

        if(this.e.mobile===true){
            this.frameCont.scale.x = .25; this.frameCont.scale.y = .25; 
        }

        this.frameCont._zIndex = 10000
    
        const cornerTexture = corner;
        const sideTexture = side;

        // Create corner sprites
        const topLeftCorner = new PIXI.Sprite(cornerTexture);
        const topRightCorner = new PIXI.Sprite(cornerTexture);
        const bottomLeftCorner = new PIXI.Sprite(cornerTexture);
        const bottomRightCorner = new PIXI.Sprite(cornerTexture);

        // Flip corner sprites as needed
        topRightCorner.scale.x = -1/2;
        topRightCorner.scale.y = 1/2;
        topRightCorner._zIndex=10;

        topLeftCorner.scale.x = 1/2;
        topLeftCorner.scale.y = 1/2;
        topLeftCorner._zIndex=10;

        bottomLeftCorner.scale.x = 1/2;
        bottomLeftCorner.scale.y = -1/2;
        bottomLeftCorner._zIndex=10;

        bottomRightCorner.scale.x = -1/2;
        bottomRightCorner.scale.y = -1/2;
        bottomRightCorner._zIndex=10;

        // Position the corner sprites
        topLeftCorner.position.set(0, 0);
        topRightCorner.position.set(w, 0);
        bottomLeftCorner.position.set(0, h);
        bottomRightCorner.position.set(w, h);

        // topLeftCorner.scale.x = topLeftCorner.scale.y = .5
        // topRightCorner.scale.x = topRightCorner.scale.y = .5
        // bottomLeftCorner.scale.x = bottomLeftCorner.scale.y = .5
        // bottomRightCorner.scale.x = bottomRightCorner.scale.y = .5

        // Create side sprites
        const topSide = new PIXI.TilingSprite(sideTexture);
        topSide.tileScale.set(.5, .5);
        const leftSide = new PIXI.TilingSprite(sideTexture);
        leftSide.tileScale.set(.5, .5);
        const rightSide = new PIXI.TilingSprite(sideTexture);
        rightSide.tileScale.set(.5, .5);
        const bottomSide = new PIXI.TilingSprite(sideTexture);
        bottomSide.tileScale.set(.5, .5);

        // topSide.alpha=0;
        // leftSide.alpha=0;
        // rightSide.alpha=0;
        // bottomSide.alpha=0;

        topSide.anchor.x = .5;
        bottomSide.anchor.x = .5;
        leftSide.anchor.x = .5;
        rightSide.anchor.x = .5;

        // topSide.scale.y = .45;
        topSide.height = 153/2;
        bottomSide.height = 153/2;
        leftSide.height = 153/2;
        rightSide.height = 153/2;

        topSide.width = w - (this.fw*2)
        bottomSide.width = w - (this.fw*2)
        leftSide.width = h - (this.fw*2)
        rightSide.width = h - (this.fw*2)

        // Rotate and position side sprites
        leftSide.rotation = this.e.u.ca(-90);
        rightSide.rotation = this.e.u.ca(90);
        bottomSide.rotation = this.e.u.ca(180);

        topSide.position.set(w / 2, 0);
        leftSide.position.set(0, h / 2);
        rightSide.position.set(w, h / 2);
        bottomSide.position.set(w / 2, h);

        // Add sprites to the stage
        this.frameCont.addChild(
            topLeftCorner,
            topRightCorner,
            bottomLeftCorner,
            bottomRightCorner,
            topSide,
            leftSide,
            rightSide,
            bottomSide
        );

        //-----------------------------------------------------

        this.frameCont.topRightCorner = topRightCorner;
        this.frameCont.bottomLeftCorner = bottomLeftCorner;
        this.frameCont.bottomRightCorner = bottomRightCorner;
        this.frameCont.topLeftCorner = topLeftCorner;

        this.frameCont.topSide = topSide;
        this.frameCont.leftSide = leftSide;
        this.frameCont.rightSide = rightSide;
        this.frameCont.bottomSide = bottomSide;

        // console.log("make frame")

        return this.frameCont;

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

                a.aniCount += this.e.dt;

                if (a.aniCount > a.aniSpeed) {

                    a.aniCount = 0;
                    a.curFrame += 1;

                    if(a.curFrame>=a.ani.length-1 && a.aniLoop===false){
                        a.curFrame=a.ani.length-1
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