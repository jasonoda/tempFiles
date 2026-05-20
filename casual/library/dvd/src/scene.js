import { gsap } from "./greensock/all.js";

export class Scene {
    
  setUp(e) {

    this.e=e;

  }

  buildScene(){

    // basic vars

    this.action="first";
    this.count=0;
    this.breakCount=0;
    this.logoMoveSpeed = 200;

    // containers
    
    this.baseCont = new PIXI.Container();
    this.baseCont.sortableChildren = true;
    this.e.ui.app.stage.addChild(this.baseCont);

    this.levCont = new PIXI.Container();
    this.levCont.sortableChildren = true;
    this.baseCont.addChild(this.levCont);
    this.levCont._zIndex=10;

    this.screenWidth=530;

    // background screen

    this.screen = new PIXI.Sprite(this.e.ui.t_white);
    this.screen.width=this.screenWidth;
    this.screen.height=370;
    this.screen.anchor.x=.5;
    this.screen.anchor.y=.5;
    this.screen.alpha=0.2;
    this.screen._zIndex=1;
    // this.levCont.addChild(this.screen);

    this.screenBack = new PIXI.Sprite(this.e.ui.t_black);
    this.screenBack.width=530;
    this.screenBack.height=376;
    this.screenBack.anchor.x=.5;
    this.screenBack.anchor.y=.5;
    this.screenBack.alpha=1;
    this.screenBack._zIndex=2;
    this.levCont.addChild(this.screenBack);

    this.screenFlash = new PIXI.Sprite(this.e.ui.t_white);
    this.screenFlash.width=530;
    this.screenFlash.height=376;
    this.screenFlash.anchor.x=.5;
    this.screenFlash.anchor.y=.5;
    this.screenFlash.alpha=0;
    this.screenFlash._zIndex=4;
    this.levCont.addChild(this.screenFlash);

    this.bgLogo = new PIXI.Sprite(this.e.ui.t_bgLogo);
    this.bgLogo.scale.x=.5;
    this.bgLogo.scale.y=.5;
    this.bgLogo.anchor.x=.5;
    this.bgLogo.anchor.y=.5;
    this.bgLogo.position.y=-10;
    this.bgLogo.alpha=0;
    this.bgLogo._zIndex=4;
    this.levCont.addChild(this.bgLogo);

    this.static = new PIXI.Sprite(this.e.ui.t_static);
    this.static.width=530;
    this.static.height=376;
    this.static.anchor.x=.5;
    this.static.anchor.y=.5;
    this.static.alpha=0;
    this.static._zIndex=4;
    this.levCont.addChild(this.static);

    this.static.ani = [this.e.ui.t_static_1,this.e.ui.t_static_2,this.e.ui.t_static_3,this.e.ui.t_static_4,this.e.ui.t_static_5,this.e.ui.t_static_6,this.e.ui.t_static_7,this.e.ui.t_static_8,this.e.ui.t_static_9,this.e.ui.t_static_10];
    this.static.aniSpeed=.02;

    this.e.ui.animatedSprites.push(this.static);

    this.break = new PIXI.Sprite(this.e.ui.t_break_1);
    this.break.width=530;
    this.break.height=376;
    this.break.anchor.x=.5;
    this.break.anchor.y=.5;
    this.break.alpha=0;
    this.break._zIndex=4;
    this.levCont.addChild(this.break);

    // smoke

    this.smokeArray = [];

    this.numSmoke=30;
    
    for(var i=0; i<this.numSmoke; i++){

      this.smokeScale = 700+this.e.u.ran(500);

      this.smoke = new PIXI.Sprite(this.e.ui.t_smoke);
      this.smoke.width=this.smokeScale;
      this.smoke.height=this.smokeScale;
      this.smoke.anchor.x=this.e.u.ran(10)/10;
      this.smoke.anchor.y=this.e.u.ran(10)/10;
      this.smoke._zIndex=1;
      this.smoke.alpha=.25;
      this.levCont.addChild(this.smoke);

      this.smoke.speed=this.e.u.nran(10)

      this.smoke.position.x = this.e.u.nran(700)
      this.smoke.position.y = this.e.u.nran(400)

      this.smokeArray.push(this.smoke);

    }

    // win logos

    this.logoArray = [];

    for(var i=0; i<100; i++){

      this.logoCol = this.e.u.ran(7)

      if(this.logoCol===0){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_white);
      }else if(this.logoCol===1){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_red);
      }else if(this.logoCol===2){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_yellow);
      }else if(this.logoCol===3){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_green);
      }else if(this.logoCol===4){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_cyan);
      }else if(this.logoCol===5){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_blue);
      }else if(this.logoCol===6){
        this.logo = new PIXI.Sprite(this.e.ui.t_logo_purple);
      }

      this.logoScale = 100+this.e.u.ran(100);

      this.logo.width=this.logoScale;
      this.logo.height=this.logoScale;
      this.logo.anchor.x=.5;
      this.logo.anchor.y=.5;

      this.logoRan = this.e.u.ran(2);
      if(this.logoRan===1){
        this.logo._zIndex=2;
      }else{
        this.logo._zIndex=15;
      }

      this.logo.alpha=0;
      this.baseCont.addChild(this.logo);

      this.logo.speed=this.e.u.ran(10)

      this.logo.position.x = this.e.u.nran(900)
      this.logo.position.y = (window.innerHeight/2)+200

      this.logoArray.push(this.logo);


    }

    // static boxes

    this.tileSize=15;
    this.tileNumX=19;
    this.tileNumY=13;

    this.staticArray = [];

    for(var x=-this.tileNumX; x<this.tileNumX; x++){
      for(var y=-this.tileNumY; y<this.tileNumY; y++){

        this.square = new PIXI.TilingSprite(this.e.ui.t_glitch_green);
        this.square.width=this.tileSize;
        this.square.height=this.tileSize;
        this.square.position.x=x*this.tileSize;
        this.square.position.y=y*this.tileSize;
        this.square._zIndex=5;
        this.square.alpha=0;
        this.levCont.addChild(this.square);

        this.square.xx=x;
        this.square.yy=y;

        this.staticArray.push(this.square);

      }
    }

    // logo

    this.logo = new PIXI.Sprite(this.e.ui.t_logo_white);
    this.logo.width=140;
    this.logo.height=90;
    this.logo.anchor.x=.5;
    this.logo.anchor.y=.5;
    this.logo._zIndex=2;
    this.levCont.addChild(this.logo);

    // vig

    this.vig = new PIXI.Sprite(this.e.ui.t_vig);
    this.vig.width=this.screenWidth;
    this.vig.height=750;
    this.vig.anchor.x=.5;
    this.vig.anchor.y=.5;
    this.vig.alpha=.4;
    this.vig._zIndex=10;
    // this.levCont.addChild(this.vig);

    // monitor

    this.monitor = new PIXI.Sprite(this.e.ui.t_monitor);
    this.monitor.anchor.x=.5;
    this.monitor.anchor.y=.5;
    this.monitor._zIndex=6;
    this.levCont.addChild(this.monitor);

    this.glass = new PIXI.Sprite(this.e.ui.t_glass);
    this.glass.anchor.x=.5;
    this.glass.anchor.y=.5;
    this.glass.position.y=-3;
    this.glass.alpha=.6
    this.glass._zIndex=5;
    this.levCont.addChild(this.glass);

    gsap.to( this.glass, { alpha: .4, duration: 2, yoyo: true, repeat: -1, ease: "linear"});
        
    //----------------------------------------------------------------------------

    this.topGrad = new PIXI.Sprite(this.e.ui.t_gradTop);
    this.topGrad.anchor.x=.5;
    this.topGrad.anchor.y=0;
    this.topGrad._zIndex=60;
    this.baseCont.addChild(this.topGrad);

    this.botGrad = new PIXI.Sprite(this.e.ui.t_gradBot);
    this.botGrad.anchor.x=.5;
    this.botGrad.anchor.y=1;
    this.botGrad._zIndex=60;
    this.baseCont.addChild(this.botGrad);

    this.botGradMobile = new PIXI.Sprite(this.e.ui.t_gradBot);
    this.botGradMobile.anchor.x=.5;
    this.botGradMobile.anchor.y=1;
    this.botGradMobile._zIndex=60;
    this.levCont.addChild(this.botGradMobile);

    this.botGradMobile2 = new PIXI.Sprite(this.e.ui.t_black);
    this.botGradMobile2.anchor.x=.5;
    this.botGradMobile2.anchor.y=0;
    this.botGradMobile2._zIndex=60;
    this.levCont.addChild(this.botGradMobile2);

    //----------------------------------------------------------------------------

    this.butScale=.8

    // buttons

    this.button_ul = new PIXI.Sprite(this.e.ui.t_bet1);
    this.button_ul.width=150*this.butScale;
    this.button_ul.height=70*this.butScale;
    this.button_ul.anchor.x=0;
    this.button_ul.anchor.y=0;
    this.button_ul._zIndex=3;
    this.levCont.addChild(this.button_ul);

    this.button_ul.interactive=true;
    this.button_ul.buttonMode=true;

    this.button_ul.on('mousedown', (event) => {

      this.betSide = 1
      this.action="placed";
        
    })

    this.button_ul.on('touchstart', (event) => {

      this.betSide = 1
      this.action="placed";
        
    })

    this.button_ur = new PIXI.Sprite(this.e.ui.t_bet2);
    this.button_ur.width=150*this.butScale;
    this.button_ur.height=70*this.butScale;
    this.button_ur.anchor.x=1;
    this.button_ur.anchor.y=0;
    this.button_ur._zIndex=3;
    this.levCont.addChild(this.button_ur);

    this.button_ur.on('mousedown', (event) => {

      this.betSide = 2
      this.action="placed";
        
    })

    this.button_ur.on('touchstart', (event) => {

      this.betSide = 2
      this.action="placed";
        
    })

    this.button_bl = new PIXI.Sprite(this.e.ui.t_bet3);
    this.button_bl.width=150*this.butScale;
    this.button_bl.height=70*this.butScale;
    this.button_bl.anchor.x=0;
    this.button_bl.anchor.y=1;
    this.button_bl._zIndex=3;
    this.levCont.addChild(this.button_bl);

    this.button_bl.on('mousedown', (event) => {

      this.betSide = 3
      this.action="placed";
        
    })

    this.button_bl.on('touchstart', (event) => {

      this.betSide = 3
      this.action="placed";
        
    })

    this.button_br = new PIXI.Sprite(this.e.ui.t_bet4);
    this.button_br.width=150*this.butScale;
    this.button_br.height=70*this.butScale;
    this.button_br.anchor.x=1;
    this.button_br.anchor.y=1;
    this.button_br._zIndex=3;
    this.levCont.addChild(this.button_br);

    this.button_br.on('mousedown', (event) => {

      this.betSide = 4
      this.action="placed";
        
    })

    this.button_br.on('touchstart', (event) => {

      this.betSide = 4
      this.action="placed";
        
    })

    //----------------------------------------------------------------------------

    // lose

    this.loseText = new PIXI.Sprite(this.e.ui.t_lose);
    this.loseText.width=170;
    this.loseText.height=70;
    this.loseText.anchor.x=.5;
    this.loseText.anchor.y=.5;
    this.loseText._zIndex=3;
    this.loseText.alpha=0;
    this.levCont.addChild(this.loseText);

    //----------------------------------------------------------------------------

    // reset button

    this.resetButton = new PIXI.Sprite(this.e.ui.t_reset);
    this.resetButton.width=170;
    this.resetButton.height=70;
    this.resetButton.anchor.x=.5;
    this.resetButton.anchor.y=.5;
    this.resetButton._zIndex=3;
    this.resetButton.alpha=0;
    this.levCont.addChild(this.resetButton);

    this.resetButton.on('mousedown', (event) => {

      this.e.s.p("click")

      this.action="set";
        
    })

    this.resetButton.on('touchstart', (event) => {

      this.e.s.p("click")

      this.action="set";
        
    })

  }

  alignParts(){

    // center base cont on screen

    this.baseCont.position.x = window.innerWidth/2;
    this.baseCont.position.y = window.innerHeight/2;

    // position buttons

    this.button_ul.position.x = -this.xLimit-40;
    this.button_ul.position.y = -this.yLimit-20;

    this.button_ur.position.x = this.xLimit+40;
    this.button_ur.position.y = -this.yLimit-20;

    this.button_bl.position.x = -this.xLimit-40;
    this.button_bl.position.y = this.yLimit+20;

    this.button_br.position.x = this.xLimit+40;
    this.button_br.position.y = this.yLimit+20;

    // grads

    this.topGrad.position.x = 0;
    this.topGrad.position.y = -window.innerHeight/2;
    this.topGrad.width = window.innerWidth;
    this.topGrad.height = 150;
    this.topGrad.alpha = .75;

    this.botGrad.position.x = 0;
    this.botGrad.position.y = window.innerHeight/2;
    this.botGrad.width = window.innerWidth;
    this.botGrad.height = 150;
    this.botGrad.alpha = .75;

    //

    this.botGradMobile.position.x = 0;
    this.botGradMobile.position.y = 525;
    this.botGradMobile.width = 2000;
    this.botGradMobile.height = 300;

    this.botGradMobile2.position.x = 0;
    this.botGradMobile2.position.y = 525;
    this.botGradMobile2.width = 2000;
    this.botGradMobile2.height = 2000;

    // scale base cont to the size of the screen

    if(this.e.mobile===true){
      this.screenScale=.6;
      this.botGradMobile.alpha = 1;
    }else{
      this.screenScale=.8;
      this.botGradMobile.alpha = 0;
    }

    var sx = (this.screenScale * window.innerWidth) / this.screenWidth;
    this.levCont.scale.x = this.levCont.scale.y = sx

    if( sx*this.screenWidth > window.innerHeight ){

      var sx = (this.screenScale * window.innerHeight) / 750;
      this.levCont.scale.x = this.levCont.scale.y = sx

    }

    // rotate smokes

    for(var i=0; i<this.smokeArray.length; i++){

      this.smokeArray[i].rotation+=this.e.dt * this.smokeArray[i].speed/20;

    }

  }

  update(){

    document.getElementById("feedback").innerHTML = this.action+"";

    // get limits

    this.xLimit = ( this.screen.width/2 ) - this.logo.width*.33;
    this.yLimit = ( this.screen.height/2 ) - this.logo.height*.33;

    // put things into position every frame

    this.alignParts();

    this.breaks();

    //---------------------------------------------------------------------------------------------------------

    // action loop

    //---------------------------------------------------------------------------------------------------------

    if(this.action==="first"){

      this.button_ul.alpha=0;
      this.button_ur.alpha=0;
      this.button_bl.alpha=0;
      this.button_br.alpha=0;
      this.logo.alpha=0;

      this.bgLogo.alpha=(this.e.u.ran(25)+25)/100;

      this.count+=this.e.dt;
      if(this.count>3){

        this.count=0;
        // this.bgLogo.alpha=0;
        this.action="fade bg";

      }

    }else if(this.action==="fade bg"){

      this.bgLogo.alpha-=this.e.dt;

      this.count+=this.e.dt;
      if(this.count>2){

        this.count=0;
        this.action="set";

      }


    }else if(this.action==="set"){

      this.e.s.p("start")

      // reset or start game - show all buttons

      this.button_ul.interactive=true;
      this.button_ul.buttonMode=true;
  
      this.button_ur.interactive=true;
      this.button_ur.buttonMode=true;
  
      this.button_bl.interactive=true;
      this.button_bl.buttonMode=true;
  
      this.button_br.interactive=true;
      this.button_br.buttonMode=true;

      // hide logo and reset stuff

      this.logo.alpha=0;
      this.resetButton.alpha=0;
      this.resetButton.interactive=false;
      this.resetButton.mouseButton=false;

      // get the win position
      // ankur, jimmy

      this.winSide = this.e.u.ran(4)+1;

      document.getElementById("feedback2").innerHTML = "win side: "+this.winSide;

      // end
      
      this.action="place bet"

    }else if(this.action==="place bet"){

      // waiting on button push

      this.button_ul.alpha=(this.e.u.ran(25)+75)/100;
      this.button_ur.alpha=(this.e.u.ran(25)+75)/100;
      this.button_bl.alpha=(this.e.u.ran(25)+75)/100;
      this.button_br.alpha=(this.e.u.ran(25)+75)/100;

      

    }else if(this.action==="placed"){

      this.e.s.p("click")

      // button pushed, hide buttons

      this.button_ul.interactive=false;
      this.button_ul.buttonMode=false;
      this.button_ul.alpha=0;
  
      this.button_ur.interactive=false;
      this.button_ur.buttonMode=false;
      this.button_ur.alpha=0;
  
      this.button_bl.interactive=false;
      this.button_bl.buttonMode=false;
      this.button_bl.alpha=0;
  
      this.button_br.interactive=false;
      this.button_br.buttonMode=false;
      this.button_br.alpha=0;
  
      // end

      this.action="predict"

    }else if(this.action==="predict"){

      // prediction code here

      if(this.winSide===1){

        // upper left

        this.logo.position.x=-this.xLimit;
        this.logo.position.y=-this.yLimit;

        this.xspeed=1
        this.yspeed=1

      }else if(this.winSide===2){

        // upper right

        this.logo.position.x=this.xLimit;
        this.logo.position.y=-this.yLimit;

        this.xspeed=-1
        this.yspeed=1

      }else if(this.winSide===3){

        // lower left

        this.logo.position.x=-this.xLimit;
        this.logo.position.y=this.yLimit;

        this.xspeed=1
        this.yspeed=-1

      }else if(this.winSide===4){

        // lower right

        this.logo.position.x=this.xLimit;
        this.logo.position.y=this.yLimit;

        this.xspeed=-1
        this.yspeed=-1

      }

      //--------------------------------------------------------------------------------

      // create an array with positions of all bounces

      this.bounceArray = [];

      // make the first entry where you will end which has been set to the corner (above)

      this.xyArray = [this.logo.position.x, this.logo.position.y];
      this.bounceArray.push(this.xyArray)

      // timer to measure how long it takes

      const startTime = new Date();

      // make the game have this many bounces before ending on the final position

      var numBounces = 7 + this.e.u.ran(9);

      // while loop - move the logo to find bounces and add them to the bounce array

      while(numBounces>0){

        this.logo.position.x+=this.xspeed;
        this.logo.position.y+=this.yspeed;

        if(this.logo.position.x >= this.xLimit){

          this.xyArray = [this.logo.position.x, this.logo.position.y];
          this.bounceArray.push(this.xyArray)
          this.xspeed=-1;
          numBounces-=1;

        }else if(this.logo.position.x <= -this.xLimit){

          this.xyArray = [this.logo.position.x, this.logo.position.y];
          this.bounceArray.push(this.xyArray)
          this.xspeed=1;
          numBounces-=1;

        }else if(this.logo.position.y >= this.yLimit){

          this.xyArray = [this.logo.position.x, this.logo.position.y];
          this.bounceArray.push(this.xyArray)
          this.yspeed=-1;
          numBounces-=1;

        }else  if(this.logo.position.y <= -this.yLimit){

          this.xyArray = [this.logo.position.x, this.logo.position.y];
          this.bounceArray.push(this.xyArray)
          this.yspeed=1;
          numBounces-=1;

        }

      }

      // see how long all this took

      const endTime = new Date();
      const timeDiff = endTime.getTime() - startTime.getTime();
      const secondsPassed = timeDiff / 1000;
      console.log("Time passed:", secondsPassed, "seconds");

      // set the bounce cue to the last position
      
      this.bounceCue=this.bounceArray.length-1;

      // end

      this.myDur=0;
      this.count=2;
      this.action="game"

    }else if(this.action==="game"){

      // show logo

      this.showLogoAndBlink();

      // cycle through the bounce positions from last to first moving from one position to another

      this.count+=this.e.dt;
      if(this.count>=this.myDur){

        this.count=0;

        console.log(">>"+this.bounceCue)

        this.bounceCue-=1;
        if(this.bounceCue===0){

          // end

          this.count=0;
          this.action="last move"
          
        }

        this.e.s.p("bounce")

        // change logo color

        if(this.logoColors===undefined || this.logoColors.length===0){
          this.logoColors = [this.e.ui.t_logo_red, this.e.ui.t_logo_purple, this.e.ui.t_logo_blue, this.e.ui.t_logo_cyan, this.e.ui.t_logo_green, this.e.ui.t_logo_yellow ];
        }

        this.logo.texture = this.e.u.apRemove(this.logoColors);

        // tween and use distance to calculate duration

        this.myDur = this.e.u.getDistance( this.logo.position.x, this.logo.position.y, this.bounceArray[this.bounceCue][0], this.bounceArray[this.bounceCue][1] )/this.logoMoveSpeed;
        gsap.to( this.logo.position, { x: this.bounceArray[this.bounceCue][0], y: this.bounceArray[this.bounceCue][1], duration: this.myDur, ease: "linear"});
        
      }

    }else if(this.action==="last move"){

      // wait for the logo to make it's last move into the corner position

      this.count+=this.e.dt;
      if(this.count>this.myDur){

        // end

        this.action="end"

      }

    }else if(this.action==="end"){

      // was it the correct corner?

      if(this.winSide===this.betSide){

        this.winEffects()

        this.e.s.p("win")

        this.action="won"

      }else{

        // this.e.scene.loseAction="start"

        this.e.s.p("lose")

        this.shakeAmount=70;
        this.shakeCount=0;
        this.shakeSide="r";

        this.count=0;
        this.action="static"

      }

    }else if(this.action==="static"){

      this.showLogoAndBlink()
      
      this.static.alpha=1;

      this.count+=this.e.dt;
      if(this.count>1.3){

        this.count=0;
        this.static.alpha=0;
        this.loseText.alpha=1;
        
        this.action="lose wait"

      }

    }else if(this.action==="lose wait"){

      this.showLogoAndBlink()

      this.loseText.alpha-=this.e.dt*.5;

      this.count+=this.e.dt;
      if(this.count>2.5){

        this.action="lose"

      }

    }else if(this.action==="lose"){

      // lose

      document.getElementById("feedback2").innerHTML = "LOSE";
      
      this.resetButton.alpha=(this.e.u.ran(25)+55)/100;
      this.resetButton.interactive=true;
      this.resetButton.mouseButton=true;

    }else if(this.action==="won"){

      this.showLogoAndBlink()

      // won

      document.getElementById("feedback2").innerHTML = "WIN";

      this.resetButton.alpha=(this.e.u.ran(25)+55)/100;
      this.resetButton.interactive=true;
      this.resetButton.mouseButton=true;

    }

    this.loseEffects()

  }

  winEffects(){

    this.screenFlash.alpha=1;

    gsap.to( this.screenFlash, { alpha: 0, duration: 1, ease: "linear"});

    for(var i=0; i<this.logoArray.length; i++){

      this.logoArray[i].position.y=(window.innerHeight/2)+100+this.e.u.ran(100);

      this.dur=(this.e.u.ran(30)/10)+.2;

      this.logoArray[i].alpha=1;

      gsap.to( this.logoArray[i].position, { y: (-window.innerHeight/2)-100, duration: this.dur, ease: "linear"});

    }

  }

  loseEffects(){

    // if(this.loseAction===""){

    // }else if(this.loseAction==="start"){

    //   this.staticCount=0;
    //   this.static.alpha=1;
    //   this.loseAction="show"

    // }else if(this.loseAction==="show"){

    //   this.staticCount+=this.e.dt;
    //   if(this.staticCount>2){

    //     this.loseAction=""
    //     this.staticCount=0;
    //     this.static.alpha=0;

    //   }

    // // }else if(this.loseAction==="show"){

    // }

    // if(this.loseAction===""){

    // }else if(this.loseAction==="start"){

    //   // set static boxes to a texture and scale

    //   for(var i=0; i<this.staticArray.length; i++){

    //     this.staticRan = this.e.u.ran(6);

    //     this.staticArray[i].alpha=1;

    //     if(this.staticArray[i].yy===0 ||
    //       this.staticArray[i].yy===-1 ||
    //       this.staticArray[i].yy===1 ||
    //       this.staticArray[i].yy===2 ||
    //       this.staticArray[i].yy===2){
    //       this.staticRan=4;
    //     }

    //     if(this.staticRan===0){
    //       this.staticArray[i].texture = this.e.ui.t_glitch_green;
    //     }else if(this.staticRan===1){
    //       this.staticArray[i].texture = this.e.ui.t_glitch_checker1;
    //     }else if(this.staticRan===2){
    //       this.staticArray[i].texture = this.e.ui.t_glitch_checker2;
    //     }else if(this.staticRan===3){
    //       this.staticArray[i].texture = this.e.ui.t_glitch_checker3;
    //     }else{
    //       this.staticArray[i].texture = this.e.ui.t_glitch_checker3;
    //       this.staticArray[i].alpha=0;
    //     }

    //     this.staticArray[i].tileScale.x=this.e.u.ran(100)/100;
    //     this.staticArray[i].tileScale.y=this.e.u.ran(100)/100;

    //     this.staticArray[i].fadeTime = 1.5 + (this.e.u.ran(50)/100)

    //   }

    //   // make certain static lines totally empty

    //   for(var i=0; i<8; i++){

    //     this.killLine = this.e.u.nran(13)

    //     for(var j=0; j<this.staticArray.length; j++){

    //       if( this.staticArray[j].yy === this.killLine ){

    //         this.staticArray[j].alpha=0;

    //       }

    //     }

    //   }

    //   // make certain static lines half empty

    //   for(var i=0; i<16; i++){

    //     this.killLine = this.e.u.nran(13)
    //     this.killLine2 = this.e.u.nran(35)-17

    //     for(var j=0; j<this.staticArray.length; j++){

    //       if( this.staticArray[j].yy === this.killLine ){
    //         if( this.staticArray[j].xx < this.killLine2 ){

    //           this.staticArray[j].alpha=0;

    //         }
    //       }

    //     }

    //   }

    //   this.shakeCount=0;
    //   this.shakeSide="r";
    //   this.shakeAmount=20;
    //   this.loseAction="show"

    // }else if(this.loseAction==="show"){

    //   // slowly fade out static

    //   this.foundAlpha = 0;

    //   for( var i=0; i<this.staticArray.length; i++){

    //     this.staticArray[i].fadeTime-=this.e.dt;
    //     this.staticArray[i].fadeTime-=this.e.dt;

    //     if(this.staticArray[i].fadeTime<=0){

    //       this.staticArray[i].alpha=0;

    //     }else{

    //       this.foundAlpha+=1;

    //     }

    //   }

      // shake screen

      this.shakeCount+=this.e.dt;

      if(this.shakeCount>.025){

        this.shakeCount=0;

        if(this.shakeSide==="r"){

          this.shakeSide="l";

          this.levCont.position.x = this.shakeAmount/2;

        }else if(this.shakeSide==="l"){

          this.shakeSide="r";

          this.levCont.position.x = -this.shakeAmount/2;

        }

        this.shakeAmount-=2.5;

        if(this.shakeAmount<0){

          this.shakeAmount=0;

        }

      }
      // if all are off, end effect

      // if(this.foundAlpha===0){

      //   this.loseAction="";

      //   this.levCont.position.x=0;

      // }


    // }

  }

  showLogoAndBlink(){

    this.logo.alpha=(this.e.u.ran(25)+75)/100;

  }

  breaks(){

    // break

    this.breakCount+=this.e.dt;
    if(this.breakCount>.1){

      this.breakCount=0;

      this.breakRan = this.e.u.ran(240)+1;
      this.break.alpha=.5;

      // console.log(this.breakRan);

      if(this.breakRan===1){
        this.break.texture=this.e.ui.t_break_1;
      }else if(this.breakRan===2){
        this.break.texture=this.e.ui.t_break_2;
      }else if(this.breakRan===3){
        this.break.texture=this.e.ui.t_break_3;
      }else if(this.breakRan===4){
        this.break.texture=this.e.ui.t_break_4;
      }else if(this.breakRan===5){
        this.break.texture=this.e.ui.t_break_5;
      }else if(this.breakRan===6){
        this.break.texture=this.e.ui.t_break_6;
      }else if(this.breakRan===7){
        this.break.texture=this.e.ui.t_break_7;
      }else if(this.breakRan===8){
        this.break.texture=this.e.ui.t_break_8;
      }else if(this.breakRan===9){
        this.break.texture=this.e.ui.t_break_9;
      }else if(this.breakRan===10){
        this.break.texture=this.e.ui.t_break_10;
      }else{
        this.break.alpha=0;
      }

    }

  }

}