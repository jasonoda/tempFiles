import { gsap } from "./greensock/all.js";
import * as THREE from '../../build/three.module.js';

export class Scene {
  
  setUp(e) {

    this.e=e;

    this.action="set";
    this.subAction="play";
    this.playerAction="ready"

    this.count=0;
    this.subCount=0;
    this.subCount2=0;
    this.gameCount=0
    this.myDoorSpot=null;
    this.threeAction="main menu";
    this.threeCount="";

    this.t = new Object;
    this.t.cardDown = 0;

    this.actionText="";

    this.camLerp=true;

    this.shaftCol=0;
    this.shaftColorCount=0;

    this.showMobileButtons=false;

    this.secret1Usable=true;
    this.secret2Usable=true;
    this.secret3Usable=true;
    this.secret4Usable=true;

    this.secret1Count=0;
    this.secret2Count=0;
    this.secret3Count=0;
    this.secret4Count=0;

    this.level=1;
    
  }

  build3d(){

    //---scene parts--------------------------------------------------------------------------------------------------------------

    this.scene3D = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,.1, 520);
    this.scene3D.background = new THREE.Color( 0x0a0706 );
    this.scene3D.fog = new THREE.Fog(0x000000, 140, 241);

    this.mainCont3D = new THREE.Group();
    this.scene3D.add(this.mainCont);

    //---carmera rig--------------------------------------------------------------------------------------------------------------

    this.camContX = new THREE.Group();
    this.camContY = new THREE.Group();
    this.scene3D.add(this.camContX);
    this.scene3D.add(this.camContY);

    this.camContY.add(this.camContX)
    this.camContX.add(this.camera);
    this.camera.position.z = 70;
    this.camera.position.y = 0;

    this.camContX.rotation.x = this.e.u.ca(-80)
    // this.camContY.rotation.y = this.e.u.ca(45)
    // this.camContY.position.z = 200;

    this.testBoxGeo = new THREE.BoxGeometry( .5, .5, 2 );
    this.testBoxMat = new THREE.MeshStandardMaterial({color: "green", wireframe: false, visible: false});
    this.camPos = new THREE.Mesh( this.testBoxGeo, this.testBoxMat );
    this.camContX.add( this.camPos );

    //---webgl--------------------------------------------------------------------------------------------------------------

    if(this.mobile===true){
        this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})
    }else{
        this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance", alpha: true})
    }

    this.renderer.setSize(window.innerWidth,window.innerHeight);

    this.renderer.setPixelRatio(window.devicePixelRatio);

    // this.renderer.autoClear = false;
    // renderer.setClearColor(0x000000, 0.0);

    this.renderer.setClearColor( 0x000000, 0 );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;

    this.renderer.shadowCameraNear = 3;
    this.renderer.shadowCameraFar = this.camera.far;
    this.renderer.shadowCameraFov = 50;

    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.5;
    this.renderer.shadowMapWidth = 2048;
    this.renderer.shadowMapHeight = 2048;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.renderer.domElement.style.position="absolute"
    this.renderer.domElement.style.zIndex="2";
    // this.renderer.domElement.style.opacity=".1"
    // this.renderer.domElement.style.border="2px red solid";

    document.body.appendChild(this.renderer.domElement);

    this.mainCont3D = new THREE.Group();
    this.scene3D.add(this.mainCont3D)

    window.addEventListener("resize", () => {
      this.resize3D();
  })
    //---LIGHTS--------------------------------------------------------------------------------------------------------------

    this.dl = new THREE.DirectionalLight(0xffffff, .5);
    this.dl.position.x=10;
    this.dl.position.z=30;
    this.dl.position.y=30;
    this.mainCont3D.add(this.dl);

    this.dl_shad = new THREE.DirectionalLight(0xffffff, 1);
    this.dl_shad.position.x=12;
    this.dl_shad.position.z=12;
    this.dl_shad.position.y=40;
    this.mainCont3D.add(this.dl_shad);

    this.dl_shad.castShadow=true;

    this.dl_shad.shadow.mapSize.width = 4096;
    this.dl_shad.shadow.mapSize.height = 4096;
    
    this.e.sSize = 50;
    this.dl_shad.shadow.camera.near = 0.1;
    this.dl_shad.shadow.camera.far = 80;
    this.dl_shad.shadow.camera.left = -this.e.sSize;
    this.dl_shad.shadow.camera.right = this.e.sSize;
    this.dl_shad.shadow.camera.top = this.e.sSize;
    this.dl_shad.shadow.camera.bottom = -this.e.sSize;
    this.dl_shad.shadow.radius = 2;

    this.ambLight = new THREE.AmbientLight( 0xffffff, .25 );
    this.mainCont3D.add( this.ambLight );

    // this.testBoxGeo = new THREE.BoxGeometry( 1.5, 1.5, 1.5 );
    // this.testBoxMat = new THREE.MeshStandardMaterial({color: "beige", wireframe: false});
    // this.player3D = new THREE.Mesh( this.testBoxGeo, this.testBoxMat );
    // this.player3D.castShadow=true;
    // this.player3D.receiveShadow=true;
    // this.mainCont3D.add( this.player3D );

    //------------------------------------------------------------

    // create player 3d

    this.player3D = this.e.piece.clone();

    this.player3D.traverse( ( object ) =>  {
      if ( object.isMesh ){
        object.material = new THREE.MeshStandardMaterial({color: 0x3db0c2, wireframe: false, roughness: .5, metalness: .5, transparent: true});
        object.castShadow=true;
        object.receiveShadow=true;
        this.playerBody = object;
      }
    });

    this.player3D.scale.x = this.player3D.scale.y = this.player3D.scale.z = .25
    this.mainCont3D.add( this.player3D );

    //------------------------------------------------------------

    // create board?

    this.board = this.e.board.clone();
    this.board.scale.x = this.board.scale.y = this.board.scale.z = .25
    this.mainCont3D.add(this.board);

    this.board.traverse( ( object ) =>  {
      if ( object.isMesh ){

        // if(object.name === "edges"){
        if(object.material.name === "blacka"){

          this.blackTop = object;
          object.material.color.set(0x92662f);
          // object.material.color.set(0x611f1f);
          object.material.metalness = .5;
          object.material.roughness = .5;

          const targetColor = new THREE.Color(0xd0a46e);

          gsap.to(  object.material.color, {  r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1, ease: "linear", repeat: -1, yoyo: true});

        }
        // console.log(object.name);

        if(object.name==="lab1" || object.name==="lab2" || object.name==="lab3" || object.name==="lab4" || object.name==="lab5" || object.name==="lab6" || object.name==="lab7" || object.name==="lab8" || object.name==="lab9"){

          object.material.transparent = true;
          object.material.opacity = .75;

        }else if(object.name==='tile'){

          this.tile = object;
          this.tile.material.color.set(0x7A5629)
          this.tile.material.roughness = .4;
          this.tile.material.metalness = .5;
          this.tile.material.opacity = .5;
          this.tile.material.transparent = true;

        }else if(object.name==='env'){

          this.envelope = object;
          this.envelope.material.transparent=true;

          this.envelope.startPosY = object.position.y;

        }else if(object.name==='shaftEdges'){

          this.shaftEdges = object;

        }else if(object.name==='door1'){

          var saveMap = object.material.map;

          this.door1 = object;
          object.material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false, visible:false, map: saveMap});

        }else if(object.name==='door2'){

          var saveMap = object.material.map;

          this.door2 = object;
          object.material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false, visible:false, map: saveMap});

        }else if(object.name==='door3'){

          var saveMap = object.material.map;

          this.door3 = object;
          object.material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false, visible:false, map: saveMap});

        }else if(object.name==='door4'){

          var saveMap = object.material.map;

          this.door4 = object;
          object.material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false, visible:false, map: saveMap});

        }else if(object.name==='envcard'){

          this.envCard = object;
          this.envCard.material.transparent=true;

          this.envCard.startPosZ = object.position.z;
          this.envCard.startPosY = object.position.y;

        }else{

          object.castShadow=true;
          object.receiveShadow=true;
  
        }

      }
    });

    //------------------------------------------------------------

    // create enemies

    this.enemies3D = [];
    this.enemyBodies = [];

    for(var i=0; i<6; i++){

      this.enemy = this.e.piece.clone();

      this.enemy.traverse( ( object ) =>  {
        if ( object.isMesh ){
          object.material = new THREE.MeshStandardMaterial({color: 0xcb3434, wireframe: false, roughness: .5, metalness: .5});
          object.castShadow=true;
          object.receiveShadow=true;
          this.enemyBody = object;
        }
      });
  
      this.enemy.scale.x = this.enemy.scale.y = this.enemy.scale.z = .25
      this.mainCont3D.add( this.enemy );

      this.enemies3D.push(this.enemy);
      this.enemyBodies.push(this.enemyBody);

    }

  }

  makeenterBoxes3d(){

    for(var i=0; i<this.enterBoxes.length; i++){

      this.testBoxGeo = new THREE.PlaneGeometry( 2.45, 2.45 );
      this.testBoxMat = new THREE.MeshStandardMaterial({map: this.e.enter_d_1, wireframe: false, visible: false});
      this.enterPlane = new THREE.Mesh( this.testBoxGeo, this.testBoxMat );
      this.enterPlane.rotation.x=this.e.u.ca(-90);
      this.enterPlane.position.x = this.tpx(this.enterBoxes[i].position.x);
      this.enterPlane.position.z = this.tpy(this.enterBoxes[i].position.y);
      this.enterPlane.position.y = -.035;
      this.enterPlane.castShadow=true;
      this.enterPlane.receiveShadow=true;
      this.mainCont3D.add( this.enterPlane );

      this.enterBoxes[i].plane3d = this.enterPlane;

    }

    for(var i=0; i<20; i++){

      this.skull = this.e.skull.clone();

      this.skull.position.y = -.032;
      this.skull.position.x = 10000;
      this.skull.castShadow=true;
      this.skull.receiveShadow=true;
      this.mainCont3D.add( this.skull );

      this.skullBoxes[i].plane3d = this.skull;

      this.testBoxGeo = new THREE.PlaneGeometry( 3.75, 3.75 );
      this.testBoxMat = new THREE.MeshStandardMaterial({color: 0x000000, wireframe: false, transparent: true, opacity: .3});
      this.skullPlane = new THREE.Mesh( this.testBoxGeo, this.testBoxMat );
      this.skullPlane.rotation.x=this.e.u.ca(-90);
      this.skull.add( this.skullPlane );

      this.skull.scale.x = this.skull.scale.y = this.skull.scale.z = .66;

    }

  }

  handleEnterBoxes3d(){

    for(var i=0; i<this.enterBoxes.length; i++){

      var eb = this.enterBoxes[i];

      if(eb.texture===this.e.ui.t_enter_l_1){
        eb.plane3d.material.map=this.e.enter_l_1;
      }else if(eb.texture===this.e.ui.t_enter_l_2){
        eb.plane3d.material.map=this.e.enter_l_2;

      }else if(eb.texture===this.e.ui.t_enter_r_1){
        eb.plane3d.material.map=this.e.enter_r_1;
      }else if(eb.texture===this.e.ui.t_enter_r_2){
        eb.plane3d.material.map=this.e.enter_r_2;

      }else if(eb.texture===this.e.ui.t_enter_u_1){
        eb.plane3d.material.map=this.e.enter_u_1;
      }else if(eb.texture===this.e.ui.t_enter_u_2){
        eb.plane3d.material.map=this.e.enter_u_2;

      }else if(eb.texture===this.e.ui.t_enter_d_1){
        eb.plane3d.material.map=this.e.enter_d_1;
      }else if(eb.texture===this.e.ui.t_enter_d_2){
        eb.plane3d.material.map=this.e.enter_d_2;
      }

    }

    // for(var i=0; i<this.skullBoxes.length; i++){

    //   var eb = this.skullBoxes[i];

    //   if(eb.texture===this.e.ui.t_skullBox){
    //     eb.plane3d.material.map=this.e.skullBox;
    //   }else if(eb.texture===this.e.ui.t_skullBox2){
    //     eb.plane3d.material.map=this.e.skullBox2;
    //   }

    // }

  }

  buildScene(){

    console.log("build scene");

    //main cont

    this.mainCont = new PIXI.Container();
    this.mainCont.sortableChildren = true;
    this.e.ui.app.stage.addChild(this.mainCont);

    this.e.ui.start()

    this.frame = this.e.ui.makeFrame(98, 98, this.e.ui.t_frameCorner, this.e.ui.t_frameSide, 10)

    //-------------------------

    this.startMenu = new PIXI.Sprite(this.e.ui.t_startMenu);
    this.startMenu.anchor.x=0.5
    this.startMenu.anchor.y=0.5
    this.startMenu.scale.x=this.startMenu.scale.y=0.5
    this.startMenu._zIndex=100001
    this.startMenu.alpha=1;
    this.mainCont.addChild(this.startMenu);

    this.startMenu.buttonMode=true;
    this.startMenu.interactive=true;

    this.instructions = new PIXI.Sprite(this.e.ui.t_instructions);
    this.instructions.anchor.x=0.5
    this.instructions.anchor.y=0.5
    this.instructions.scale.x=this.instructions.scale.y=0.5
    this.instructions._zIndex=100001
    this.instructions.alpha=0;
    this.mainCont.addChild(this.instructions);

    //-------------------------

    this.startMenu.on('click', (event) => {
      this.e.s.p("click");
      this.subAction = "instructions"
      this.instructions.alpha=1;
      this.instructions.buttonMode=true;
      this.instructions.interactive=true;
      this.startMenu.alpha=0;
      this.startMenu.buttonMode=false;
      this.startMenu.interactive=false;
    })

    this.startMenu.on('touchstart', (event) => {
      console.log("touch")
      this.e.s.p("click");
      this.subAction = "instructions"
      this.instructions.alpha=1;
      this.instructions.buttonMode=true;
      this.instructions.interactive=true;
      this.startMenu.alpha=0;
      this.startMenu.buttonMode=false;
      this.startMenu.interactive=false;
    })
      
    //-------------------------

    this.instructions.on('click', (event) => {
      this.e.s.p("guitar2");
      this.instructions.buttonMode=false;
      this.instructions.interactive=false;
      this.instructions.alpha=0;
      this.subAction = "start game"
      this.threeAction = "game";
    })

    this.instructions.on('touchstart', (event) => {
      this.e.s.p("guitar2");
      this.instructions.buttonMode=false;
      this.instructions.interactive=false;
      this.instructions.alpha=0;
      this.subAction = "start game"
      this.threeAction = "game";
    })
      
    //-------------------------

    this.vig = new PIXI.Sprite(this.e.ui.t_vig);
    this.vig.anchor.x=0
    this.vig.anchor.y=0
    this.vig._zIndex=1000
    this.vig.alpha=1;
    this.mainCont.addChild(this.vig);
    
    this.titleTop = new PIXI.Sprite(this.e.ui.t_titleTop);
    this.titleTop.scale.x=this.titleTop.scale.y=0.5
    this.titleTop.anchor.x=0.5
    this.titleTop.anchor.y=0
    this.titleTop._zIndex=100000
    this.titleTop.alpha=1;
    this.mainCont.addChild(this.titleTop);

    this.botLinkLeft = new PIXI.Sprite(this.e.ui.t_botLinkLeft);
    this.botLinkLeft.scale.x=this.botLinkLeft.scale.y=0.5
    this.botLinkLeft.anchor.x=1
    this.botLinkLeft.anchor.y=1
    this.botLinkLeft._zIndex=100000
    this.botLinkLeft.alpha=1;
    this.mainCont.addChild(this.botLinkLeft);

    this.botLinkRight = new PIXI.Sprite(this.e.ui.t_botLinkRight);
    this.botLinkRight.scale.x=this.botLinkRight.scale.y=0.5
    this.botLinkRight.anchor.x=0
    this.botLinkRight.anchor.y=1
    this.botLinkRight._zIndex=100000
    this.botLinkRight.alpha=1;
    this.mainCont.addChild(this.botLinkRight);

    if(this.e.mobile===true){
      this.titleTop.scale.x = this.titleTop.scale.y = .25;
      this.botLinkLeft.alpha=0;
      this.botLinkRight.alpha=0;
    }
    
    //-----------------------------------------------------------

    this.getCont = new PIXI.Container();
    this.getCont.sortableChildren = true;
    this.mainCont.addChild(this.getCont);
    this.getCont._zIndex=1999;

    this.getBack = new PIXI.Sprite(this.e.ui.black);
    this.getBack.width=30000;
    this.getBack.height=30000;
    this.getBack.anchor.x=.5
    this.getBack.anchor.y=.5
    this.getBack._zIndex=100
    this.getBack.alpha=0;
    this.getCont.addChild(this.getBack);

    this.getCard = new PIXI.Sprite(this.e.ui.t_cardBack);
    this.getCard.scale.x=this.getCard.scale.y=1;
    this.getCard.anchor.x=.5
    this.getCard.anchor.y=.5
    this.getCard.alpha=0;
    this.getCard._zIndex=200;
    this.getCont.addChild(this.getCard);

    this.lostLifeText = new PIXI.Text('');
    this.lostLifeText.anchor.x = 0.5;
    this.lostLifeText.position.x = 0; this.lostLifeText.position.y = -250;
    this.lostLifeText._zIndex = 2335;
    this.lostLifeText.style = new PIXI.TextStyle({ align: "center", lineHeight: 36, fill: 0xFFFFFF, fontSize: 30, letterSpacing: 2, fontFamily: "hypatia" })
    this.lostLifeText.resolution = 1;
    // this.lostLifeText.alpha = 0;
    this.mainCont.addChild(this.lostLifeText);

    //-----------------------------------------------------------

    this.endCont = new PIXI.Container();
    this.endCont.sortableChildren = true;
    this.mainCont.addChild(this.endCont);
    this.endCont._zIndex=1999;
    this.endCont.alpha=0;

    this.endBack = new PIXI.Sprite(this.e.ui.black);
    this.endBack.width=30000;
    this.endBack.height=30000;
    this.endBack.anchor.x=.5
    this.endBack.anchor.y=.5
    this.endBack._zIndex=100
    this.endBack.alpha=.9;
    this.endCont.addChild(this.endBack);

    this.endCard1 = new PIXI.Sprite(this.e.ui.t_cardBack);
    this.endCard1.scale.x=this.endCard1.scale.y=.75;
    this.endCard1.position.x=-300;
    this.endCard1.anchor.x=.5
    this.endCard1.anchor.y=.5
    this.endCard1.alpha=1;
    this.endCard1._zIndex=200;
    this.endCont.addChild(this.endCard1);
    
    this.endCircle1 = new PIXI.Sprite(this.e.ui.t_endRight);
    this.endCircle1.scale.x=this.endCircle1.scale.y=.5;
    this.endCircle1.position.x=-300;
    this.endCircle1.position.y=182;
    this.endCircle1.anchor.x=.5
    this.endCircle1.anchor.y=.5
    this.endCircle1.alpha=0;
    this.endCircle1._zIndex=200;
    this.endCont.addChild(this.endCircle1);

    this.endCard2 = new PIXI.Sprite(this.e.ui.t_cardBack);
    this.endCard2.scale.x=this.endCard2.scale.y=.75;
    this.endCard2.position.x=0;
    this.endCard2.anchor.x=.5
    this.endCard2.anchor.y=.5
    this.endCard2.alpha=1;
    this.endCard2._zIndex=200;
    this.endCont.addChild(this.endCard2);

    this.endCircle2 = new PIXI.Sprite(this.e.ui.t_endRight);
    this.endCircle2.scale.x=this.endCircle2.scale.y=.5;
    this.endCircle2.position.x=0;
    this.endCircle2.position.y=182;
    this.endCircle2.anchor.x=.5
    this.endCircle2.anchor.y=.5
    this.endCircle2.alpha=0;
    this.endCircle2._zIndex=200;
    this.endCont.addChild(this.endCircle2);

    this.endCard3 = new PIXI.Sprite(this.e.ui.t_cardBack);
    this.endCard3.scale.x=this.endCard3.scale.y=.75;
    this.endCard3.position.x=300;
    this.endCard3.anchor.x=.5
    this.endCard3.anchor.y=.5
    this.endCard3.alpha=1;
    this.endCard3._zIndex=200;
    this.endCont.addChild(this.endCard3);

    this.endCircle3 = new PIXI.Sprite(this.e.ui.t_endRight);
    this.endCircle3.scale.x=this.endCircle3.scale.y=.5;
    this.endCircle3.position.x=300;
    this.endCircle3.position.y=182;
    this.endCircle3.anchor.x=.5
    this.endCircle3.anchor.y=.5
    this.endCircle3.alpha=0;
    this.endCircle3._zIndex=200;
    this.endCont.addChild(this.endCircle3);

    this.goText = new PIXI.Text('');
    this.goText.anchor.x = 0.5
    this.goText.position.x = 0; this.goText.position.y = -290;
    this.goText._zIndex = 335;
    this.goText.style = new PIXI.TextStyle({ align: "center", lineHeight: 28, fill: 0xFFFFFF, fontSize: 30, letterSpacing: 2, fontFamily: "hypatia" })
    this.goText.resolution = 1;
    this.goText.alpha = 0;
    this.endCont.addChild(this.goText);

    this.goText2 = new PIXI.Text('');
    this.goText2.anchor.x = 0.5
    this.goText2.position.x = 0; this.goText2.position.y = -250;
    this.goText2._zIndex = 335;
    this.goText2.style = new PIXI.TextStyle({ align: "center", lineHeight: 28, fill: 0xFFFFFF, fontSize: 14, letterSpacing: 2, fontFamily: "hypatia" })
    this.goText2.resolution = 1;
    this.goText2.alpha = 0;
    this.endCont.addChild(this.goText2);

    this.resetText = new PIXI.Text('PLAY AGAIN');
    this.resetText.anchor.x = 0.5
    this.resetText.anchor.y = 0.5
    this.resetText.position.x = 0; this.resetText.position.y = 260;
    this.resetText._zIndex = 335;
    this.resetText.style = new PIXI.TextStyle({ align: "center", lineHeight: 28, fill: 0xFFFFFF, fontSize: 30, letterSpacing: 2, fontFamily: "hypatia" })
    this.resetText.resolution = 1;
    this.resetText.alpha = 0;
    this.endCont.addChild(this.resetText);

    this.resetButton = new PIXI.Sprite(this.e.ui.white);
    this.resetButton.scale.x=this.resetButton.scale.y=.5;
    this.resetButton.position.y=260;
    this.resetButton.anchor.x=.5
    this.resetButton.anchor.y=.5
    this.resetButton.width = 300;
    this.resetButton.height = 40;
    this.resetButton.alpha=0;
    this.resetButton._zIndex=400;
    this.endCont.addChild(this.resetButton);

    this.resetButton.on('click', (event) => {
        this.e.s.p("click");
        
        this.showMobileButtons=true;

        this.action = "set"
    })

    this.resetButton.on('touchstart', (event) => {
      this.e.s.p("click");
      this.showMobileButtons=true;

        this.action = "set"
    })

    //-----------------------------------------------------------

    this.cardCont = new PIXI.Container();
    this.cardCont.sortableChildren = true;
    this.mainCont.addChild(this.cardCont);
    this.cardCont._zIndex=100001

    this.cardBack = new PIXI.Sprite(this.e.ui.t_cardBack);
    this.cardBack.scale.x=this.cardBack.scale.y=0.45
    this.cardBack.anchor.x=.5
    this.cardBack.anchor.y=1
    this.cardBack.alpha=1;
    this.cardCont.addChild(this.cardBack);

    this.cardCont.alpha=1;

    if(this.e.mobile===false){
      this.cardBack.interactive=true;
      this.cardBack.buttonMode=true;
    }
    

    this.pauseGame = false;

    if(this.e.mobile===true){

      this.cardBack.on('touchstart', (event) => {
        if(this.pauseGame===false && this.subAction==="play"){
          this.pauseGame = true;
          this.subAction = "pause set"
        }
      })
  
    }else{

      this.cardBack.on('click', (event) => {
        if(this.pauseGame===false && this.subAction==="play"){
          this.pauseGame = true;
          this.subAction = "pause set"
        }
      })
  
    }

    //-----------------------------------------------------------

    this.actionBar = new PIXI.Sprite(this.e.ui.t_actionBar);
    this.actionBar.scale.x=this.actionBar.scale.y=0.5
    this.actionBar.anchor.x=.5
    this.actionBar.anchor.y=1
    this.actionBar.alpha=1;
    this.actionBar._zIndex=100010;
    this.mainCont.addChild(this.actionBar);

    //-----------------------------------------------------------

    this.lifeCont = new PIXI.Container();
    this.lifeCont.sortableChildren = true;
    this.mainCont.addChild(this.lifeCont);
    this.lifeCont._zIndex=100001

    this.hsArray = [];

    for(var i=0; i<3; i++){
        
      this.hs = new PIXI.Sprite(this.e.ui.t_horseShoe);
      this.hs.scale.x=this.hs.scale.y=0.4
      this.hs.anchor.x=.5
      this.hs.anchor.y=1
      this.hs.alpha=1;
      this.hs.position.x=i*45;
      this.lifeCont.addChild(this.hs);
      this.hsArray.push(this.hs);

    }

    //-----------------------------------------------------------

    this.mobileCharCards = [];
    this.mobileWeaponCards = [];
    this.mobileRoomCards = [];

    this.clueContMobile = new PIXI.Container();
    this.clueContMobile.sortableChildren = true;
    this.mainCont.addChild(this.clueContMobile);
    this.clueContMobile._zIndex=9900
    this.clueContMobile.alpha=1;

    //

    this.mobileAccInstructions = new PIXI.Sprite(this.e.ui.t_accusationWindow);
    this.mobileAccInstructions.scale.x=this.mobileAccInstructions.scale.y=0.25
    this.mobileAccInstructions.anchor.x=.5; this.mobileAccInstructions.anchor.y=.5;
    this.mobileAccInstructions.alpha=0
    this.mobileAccInstructions._zIndex=1;
    this.clueContMobile.addChild(this.mobileAccInstructions);

    this.mobileAccInstructions.on('touchstart', (event) => {

      console.log(this.subAction);
      
      if(this.subAction==="accusation window wait"){
        console.log("in")
        this.subAction="accusation window press mobile"
      }

      this.e.s.p("click");
      
    })

    //-----------------------------------------------------------

    this.mobileCancelAccCont = new PIXI.Container();
    this.mobileCancelAccCont.sortableChildren = true;
    this.clueContMobile.addChild(this.mobileCancelAccCont);
    this.mobileCancelAccCont._zIndex=199900
    this.mobileCancelAccCont.alpha=0;

    this.mobileCancelAccText = new PIXI.Text('CANCEL');
    this.mobileCancelAccText.anchor.x = 0.5
    this.mobileCancelAccText.position.x = 0; this.mobileCancelAccText.position.y = -180;
    this.mobileCancelAccText._zIndex = 335;
    this.mobileCancelAccText.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 26, letterSpacing: 2, fontFamily: "hypatia" })
    this.mobileCancelAccText.resolution = 1;
    this.mobileCancelAccText.position.y=100;
    this.mobileCancelAccCont.addChild(this.mobileCancelAccText);

    this.mobileCancelAccBut = new PIXI.Sprite(this.e.ui.white);
    this.mobileCancelAccBut.scale.x=this.mobileCancelAccBut.scale.y=0.25
    this.mobileCancelAccBut.anchor.x=.5
    this.mobileCancelAccBut.anchor.y=.5
    this.mobileCancelAccBut.alpha=0;
    this.mobileCancelAccBut._zIndex=1;
    this.mobileCancelAccBut.height=30;
    this.mobileCancelAccBut.width=140;
    this.mobileCancelAccBut.position.x=0;
    this.mobileCancelAccBut.position.y=115;
    this.mobileCancelAccCont.addChild(this.mobileCancelAccBut);

    this.mobileCancelAccBut.on('touchstart', (event) => {
      console.log("cancel")
      this.e.s.p("click");
      if(this.clueContMobile.alpha===1){
        this.subAction="exit acc mobile"
      }
    })

    //-----------------------------------------------------------

    this.suspectCont = new PIXI.Container();
    this.suspectCont.sortableChildren = true;
    this.clueContMobile.addChild(this.suspectCont);
    this.suspectCont._zIndex=199900
    this.suspectCont.alpha=0;

    this.cardInstructions = new PIXI.Text('SELECT A SUSPECT');
    this.cardInstructions.anchor.x = 0.5
    this.cardInstructions.position.x = 0; this.cardInstructions.position.y = -180;
    this.cardInstructions._zIndex = 335;
    this.cardInstructions.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 18, letterSpacing: 2, fontFamily: "hypatia" })
    this.cardInstructions.resolution = 1;
    this.suspectCont.addChild(this.cardInstructions);

    for(var xx=-1; xx<2; xx++){
      for(var yy=0; yy<2; yy++){

        this.cardCont2 = new PIXI.Container();
        this.cardCont2.sortableChildren = true;
        this.suspectCont.addChild(this.cardCont2);
          
        this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
        this.theCard.scale.x=this.theCard.scale.y=0.25
        this.theCard.anchor.x=.5
        this.theCard.anchor.y=.5
        this.theCard._zIndex=1;
        this.theCard.position.x=(xx*100);
        this.theCard.position.y=(yy*135)-135+67;
        
        this.theCard.alpha=1;
        this.cardCont2.addChild(this.theCard);

        this.theCard.interactive=false;
        this.theCard.buttonMode=false;

        //

        this.cross = new PIXI.Sprite(this.e.ui.t_cross);
        this.cross.scale.x=this.cross.scale.y=0.35
        this.cross.anchor.x=.5
        this.cross.anchor.y=.5
        this.cross.position.x=(xx*100);
        this.cross.position.y=(yy*135)-135+67;
        this.cross._zIndex=1000;
        this.cardCont2.addChild(this.cross);

        this.cardCont2.cross = this.cross;
        this.cardCont2.card = this.theCard;

        //

        if(xx===-1 && yy===0){
          this.theCard.texture = this.e.ui.t_doc
        }else if(xx===0 && yy===0){
          this.theCard.texture = this.e.ui.t_drunk
        }else if(xx===1 && yy===0){
          this.theCard.texture = this.e.ui.t_gunSlinger
        }else if(xx===-1 && yy===1){
          this.theCard.texture = this.e.ui.t_madam
        }else if(xx===0 && yy===1){
          this.theCard.texture = this.e.ui.t_preacher
        }else if(xx===1 && yy===1){
          this.theCard.texture = this.e.ui.t_tycoon
        }

        this.theCard.clueTexture = this.theCard.texture;

        this.mobileCharCards.push(this.cardCont2);

      }
    }

    //-----------------------------------------------------------

    this.weaponCont = new PIXI.Container();
    this.weaponCont.sortableChildren = true;
    this.clueContMobile.addChild(this.weaponCont);
    this.weaponCont._zIndex=199900
    this.weaponCont.alpha=0;

    this.cardInstructions = new PIXI.Text('SELECT A WEAPON');
    this.cardInstructions.anchor.x = 0.5
    this.cardInstructions.position.x = 0; this.cardInstructions.position.y = -180;
    this.cardInstructions._zIndex = 335;
    this.cardInstructions.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 18, letterSpacing: 2, fontFamily: "hypatia" })
    this.cardInstructions.resolution = 1;
    this.weaponCont.addChild(this.cardInstructions);

    for(var xx=-1; xx<2; xx++){
      for(var yy=0; yy<2; yy++){
          
        this.cardCont2 = new PIXI.Container();
        this.cardCont2.sortableChildren = true;
        this.weaponCont.addChild(this.cardCont2);
          
        this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
        this.theCard.scale.x=this.theCard.scale.y=0.25
        this.theCard.anchor.x=.5
        this.theCard.anchor.y=.5
        this.theCard.position.x=(xx*100);
        this.theCard.position.y=(yy*135)-135+67;
        
        this.theCard.alpha=1;
        this.cardCont2.addChild(this.theCard);
        
        this.theCard.interactive=false;
        this.theCard.buttonMode=false;

        //

        this.cross = new PIXI.Sprite(this.e.ui.t_cross);
        this.cross.scale.x=this.cross.scale.y=0.35
        this.cross.anchor.x=.5
        this.cross.anchor.y=.5
        this.cross.position.x=(xx*100);
        this.cross.position.y=(yy*135)-135+67;
        this.cross._zIndex=1000;
        this.cardCont2.addChild(this.cross);

        this.cardCont2.cross = this.cross;
        this.cardCont2.card = this.theCard;

        //

        if(xx===-1 && yy===0){
          this.theCard.texture = this.e.ui.t_heartbreak
        }else if(xx===0 && yy===0){
          this.theCard.texture = this.e.ui.t_knife
        }else if(xx===1 && yy===0){
          this.theCard.texture = this.e.ui.t_marlboros
        }else if(xx===-1 && yy===1){
          this.theCard.texture = this.e.ui.t_midnightStare
        }else if(xx===0 && yy===1){
          this.theCard.texture = this.e.ui.t_poisonKiss
        }else if(xx===1 && yy===1){
          this.theCard.texture = this.e.ui.t_whiskey
        } 

        this.theCard.clueTexture = this.theCard.texture;

        this.mobileWeaponCards.push(this.cardCont2);

      }
    }

    //-----------------------------------------------------------
    //-----------------------------------------------------------
    //-----------------------------------------------------------

                this.locationCont = new PIXI.Container();
                this.locationCont.sortableChildren = true;
                this.clueContMobile.addChild(this.locationCont);
                this.locationCont._zIndex=199
                this.locationCont.alpha=0;

                this.cardInstructions = new PIXI.Text('SELECT YOUR CURRENT ROOM');
                this.cardInstructions.anchor.x = 0.5
                this.cardInstructions.position.x = 0; this.cardInstructions.position.y = -180;
                this.cardInstructions._zIndex = 335;
                this.cardInstructions.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 18, letterSpacing: 2, fontFamily: "hypatia" })
                this.cardInstructions.resolution = 1;
                this.locationCont.addChild(this.cardInstructions);

                this.theLocCardCont = new PIXI.Container();
                this.theLocCardCont.sortableChildren = true;
                this.locationCont.addChild(this.theLocCardCont);
                  
                this.theLocCard = new PIXI.Sprite(this.e.ui.t_cardBack);
                this.theLocCard.scale.x=this.theLocCard.scale.y=0.25
                this.theLocCard.anchor.x=.5
                this.theLocCard.anchor.y=.5
                this.theLocCard.alpha=.5;
                this.theLocCard.position.x=(0*100);
                this.theLocCard.position.y=(0*135)-135+67;
                
                this.theLocCard.alpha=1;
                this.theLocCardCont.addChild(this.theLocCard);
                
                this.theLocCard.interactive=false;
                this.theLocCard.buttonMode=false;

                //

                this.cross = new PIXI.Sprite(this.e.ui.t_cross);
                this.cross.scale.x=this.cross.scale.y=0.35
                this.cross.anchor.x=.5
                this.cross.anchor.y=.5
                this.cross.position.x=(0*100);
                this.cross.position.y=(0*135)-135+67;
                this.cross._zIndex=1000;
                this.theLocCardCont.addChild(this.cross);

                this.theLocCardCont.cross = this.cross;
                this.theLocCardCont.card = this.theLocCard;

                //

                if(yy===0){
                  this.theLocCard.texture = this.e.ui.t_knife
                }else{
                  this.theLocCard.texture = this.e.ui.t_heartbreak
                }
                
                this.theLocCard.clueTexture = this.theLocCard.texture;

                document.addEventListener("touchstart", () => {

                  // console.log("doc click")

                  if(this.subAction==="wait room pick mobile"){
                    console.log("the loc card presssed")
                    this.subAction = "exit room pick mobile";
                  }

                });

                // this.theLocCard.on('touchstart', (event) => {
                //   console.log("the loc card presssed")
                //   this.subAction = "exit room pick mobile"
                // })

    //-----------------------------------------------------------
    //-----------------------------------------------------------
    //-----------------------------------------------------------

    this.locationContAll = new PIXI.Container();
    this.locationContAll.sortableChildren = true;
    this.clueContMobile.addChild(this.locationContAll);
    this.locationContAll._zIndex=199
    this.locationContAll.position.y=-100;
    this.locationContAll.alpha=0;

    this.cardInstructions = new PIXI.Text('SELECT THE LOCATION');
    this.cardInstructions.anchor.x = 0.5
    this.cardInstructions.position.x = 0; this.cardInstructions.position.y = -180;
    this.cardInstructions._zIndex = 335;
    this.cardInstructions.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 18, letterSpacing: 2, fontFamily: "hypatia" })
    this.cardInstructions.resolution = 1;
    this.locationContAll.addChild(this.cardInstructions);

    for(var xx=-1; xx<2; xx++){
      for(var yy=0; yy<3; yy++){  

        this.cardCont2 = new PIXI.Container();
        this.cardCont2.sortableChildren = true;
        this.locationContAll.addChild(this.cardCont2);
          
        this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
        this.theCard.scale.x=this.theCard.scale.y=0.25
        this.theCard.anchor.x=.5
        this.theCard.anchor.y=.5
        this.theCard.alpha=1;
        this.theCard.position.x=(xx*100);
        this.theCard.position.y=(yy*135)-135+67;
        
        this.theCard.alpha=1;
        this.cardCont2.addChild(this.theCard);
        
        this.theCard.interactive=false;
        this.theCard.buttonMode=false;

        //

        this.cross = new PIXI.Sprite(this.e.ui.t_cross);
        this.cross.scale.x=this.cross.scale.y=0.35
        this.cross.anchor.x=.5
        this.cross.anchor.y=.5
        this.cross.position.x=(xx*100);
        this.cross.position.y=(yy*135)-135+67;
        this.cross._zIndex=1000;
        this.cardCont2.addChild(this.cross);

        this.cardCont2.cross = this.cross;
        this.cardCont2.card = this.theCard;

        //

        if(xx===-1 && yy===0){
          this.theCard.texture = this.e.ui.t_generalStore
        }else if(xx===0 && yy===0){
          this.theCard.texture = this.e.ui.t_library
        }else if(xx===1 && yy===0){
          this.theCard.texture = this.e.ui.t_poolHall
        }else if(xx===-1 && yy===1){
          this.theCard.texture = this.e.ui.t_parlor
        }else if(xx===0 && yy===1){
          this.theCard.texture = this.e.ui.t_saloon
        }else if(xx===1 && yy===1){
          this.theCard.texture = this.e.ui.t_sheriffs
        } else if(xx===-1 && yy===2){
          this.theCard.texture = this.e.ui.t_stables
        }else if(xx===0 && yy===2){
          this.theCard.texture = this.e.ui.t_restaurant
        }else if(xx===1 && yy===2){
          this.theCard.texture = this.e.ui.t_studio
        } 

        this.theCard.clueTexture = this.theCard.texture;

        this.mobileRoomCards.push(this.cardCont2);

      }
    }

    this.suspectCont.position.x = 10000;
    this.weaponCont.position.x = 10000;
    this.locationCont.position.x = 10000;
    this.locationContAll.position.x = 10000;

    this.cardListenersMobile()

    //-----------------------------------------------------------
    //-----------------------------------------------------------
    //-----------------------------------------------------------

    this.accusationMobileBack = new PIXI.Sprite(this.e.ui.black);
    this.accusationMobileBack.width=1000;
    this.accusationMobileBack.height=1000;
    this.accusationMobileBack.anchor.x=.5; this.accusationMobileBack.anchor.y=.5;
    this.accusationMobileBack.alpha=0;
    this.accusationMobileBack._zIndex=-1;
    this.clueContMobile.addChild(this.accusationMobileBack);

    //
    // //-----------------------------------------------------------

    // this.locationCont = new PIXI.Container();
    // this.locationCont.sortableChildren = true;
    // this.clueContMobile.addChild(this.locationCont);
    // this.locationCont._zIndex=19990
    // this.locationCont.alpha=1;
    // this.locationCont.position.x=0;
    // this.locationCont.position.y=0;

    // this.cardCont = new PIXI.Container();
    // this.cardCont.sortableChildren = true;
    // this.locationCont.addChild(this.cardCont);
      
    // this.cardInstructions = new PIXI.Text('YOUR CURRENT LOCATION');
    // this.cardInstructions.anchor.x = 0.5
    // this.cardInstructions.position.x = 0; this.cardInstructions.position.y = -180;
    // this.cardInstructions._zIndex = 335;
    // this.cardInstructions.style = new PIXI.TextStyle({ align: "center", lineHeight: 14, fill: 0xFFFFFF, fontSize: 18, letterSpacing: 2, fontFamily: "hypatia" })
    // this.cardInstructions.resolution = 1;
    // this.cardCont.addChild(this.cardInstructions);

    // this.cardBack = new PIXI.Sprite(this.e.ui.t_cardBack);
    // this.cardBack.scale.x=this.cardBack.scale.y=2.25
    // this.cardBack.anchor.x=.5
    // this.cardBack.anchor.y=.5
    // this.cardBack.position.x=0
    // this.cardBack.position.y=-135+67;
    // // this.cardBack.position.y=(0*135)-135+67;
    
    // this.cardBack.alpha=1;
    // this.cardCont.addChild(this.cardBack);

    // this.cross = new PIXI.Sprite(this.e.ui.t_cross);
    // this.cross.scale.x=this.cross.scale.y=0.35
    // this.cross.anchor.x=.5
    // this.cross.anchor.y=.5
    // // this.cross.position.x=(xx*100);
    // this.cross.position.y=-135+67;
    // this.cross._zIndex=1000;
    // this.cardCont.addChild(this.cross);

    // this.cardCont.cross = this.cross;
    // this.cardCont.card = this.cardBack;

    // this.cardBack.on('touchstart', (event) => {
    //   this.susChar=this.cardBack.texture;
    //   this.e.s.p("click");
    //   console.log(this.susChar);
    // })

    //-----------------------------------------------------------

    this.clueCont = new PIXI.Container();
    this.clueCont.sortableChildren = true;
    this.mainCont.addChild(this.clueCont);
    this.clueCont._zIndex=1999
    this.clueCont.alpha=0;

    this.clueCards=[];
    this.charCards=[];
    this.roomCards=[];
    this.weaponCards=[];

    // character cards

    for(var i=-3; i<3; i++){
        
      this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
      this.theCard.scale.x=this.theCard.scale.y=0.4
      this.theCard.anchor.x=.5
      this.theCard.anchor.y=.5
      this.theCard.position.x=(i*164)+82;
      this.theCard.position.y=-220;
      this.theCard.alpha=1;
      this.clueCont.addChild(this.theCard);

      this.clueCards.push(this.theCard);
      this.charCards.push(this.theCard);

      if(i===-3){
        this.theCard.clueTexture = this.e.ui.t_doc
      }else if(i===-2){
        this.theCard.clueTexture = this.e.ui.t_drunk
      }else if(i===-1){
        this.theCard.clueTexture = this.e.ui.t_gunSlinger
      }else if(i===0){
        this.theCard.clueTexture = this.e.ui.t_madam
      }else if(i===1){
        this.theCard.clueTexture = this.e.ui.t_preacher
      }else if(i===2){
        this.theCard.clueTexture = this.e.ui.t_tycoon
      } 

    }

    // room cards
      
    for(var i=-4; i<5; i++){
        
      this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
      this.theCard.scale.x=this.theCard.scale.y=0.4
      this.theCard.anchor.x=.5
      this.theCard.anchor.y=.5
      this.theCard.position.x=(i*164);
      // this.theCard.position.y=-220;
      this.theCard.alpha=1;
      this.clueCont.addChild(this.theCard);

      this.clueCards.push(this.theCard);
      this.roomCards.push(this.theCard);

      if(i===-4){
        this.theCard.clueTexture = this.e.ui.t_generalStore
      }else if(i===-3){
        this.theCard.clueTexture = this.e.ui.t_library
      }else if(i===-2){
        this.theCard.clueTexture = this.e.ui.t_poolHall
      }else if(i===-1){
        this.theCard.clueTexture = this.e.ui.t_parlor
      }else if(i===0){
        this.theCard.clueTexture = this.e.ui.t_saloon
      }else if(i===1){
        this.theCard.clueTexture = this.e.ui.t_sheriffs
      }else if(i===2){
        this.theCard.clueTexture = this.e.ui.t_stables
      } else if(i===3){
        this.theCard.clueTexture = this.e.ui.t_restaurant
      } else if(i===4){
        this.theCard.clueTexture = this.e.ui.t_studio
      } 

    }
      
    // weapon cards

    for(var i=-3; i<3; i++){
        
      this.theCard = new PIXI.Sprite(this.e.ui.t_cardBack);
      this.theCard.scale.x=this.theCard.scale.y=0.4
      this.theCard.anchor.x=.5
      this.theCard.anchor.y=.5
      this.theCard.position.x=(i*164)+82;
      this.theCard.position.y=220;
      this.theCard.alpha=1;
      this.clueCont.addChild(this.theCard);

      this.clueCards.push(this.theCard);
      this.weaponCards.push(this.theCard);

      if(i===-3){
        this.theCard.clueTexture = this.e.ui.t_heartbreak
      }else if(i===-2){
        this.theCard.clueTexture = this.e.ui.t_knife
      }else if(i===-1){
        this.theCard.clueTexture = this.e.ui.t_marlboros
      }else if(i===0){
        this.theCard.clueTexture = this.e.ui.t_midnightStare
      }else if(i===1){
        this.theCard.clueTexture = this.e.ui.t_poisonKiss
      }else if(i===2){
        this.theCard.clueTexture = this.e.ui.t_whiskey
      } 

    }

    // all cards

    this.crosses=[];

    for(var i=0; i<this.clueCards.length; i++){

      // the vars

      this.clueCards[i].eliminated=false;
      this.clueCards[i].answer = "";
      this.clueCards[i].name = this.textureToCard(this.clueCards[i].clueTexture);

      // cross

      this.cross = new PIXI.Sprite(this.e.ui.t_cross);
      this.cross.scale.x=this.cross.scale.y=0.35
      this.cross.anchor.x=.5
      this.cross.anchor.y=.5
      this.clueCont.addChild(this.cross);

      this.clueCards[i].cross = this.cross;
      this.cross.card = this.clueCards[i];

      this.crosses.push(this.cross);
      
    }

    this.clueCardBack = new PIXI.Sprite(this.e.ui.black);
    this.clueCardBack.width=30000;
    this.clueCardBack.height=30000;
    this.clueCardBack.anchor.x=.5
    this.clueCardBack.anchor.y=.5
    this.clueCardBack._zIndex=-2
    this.clueCardBack.alpha=0.9;
    this.clueCont.addChild(this.clueCardBack);

    this.cancelBut = new PIXI.Sprite(this.e.ui.white);
    this.cancelBut.width=140;
    this.cancelBut.height=60;
    this.cancelBut.anchor.x=.5
    this.cancelBut.anchor.y=.5
    this.cancelBut.position.x = 600;
    this.cancelBut.position.y = 225;
    this.cancelBut._zIndex=2
    this.cancelBut.alpha=0;
    this.clueCont.addChild(this.cancelBut);

    this.cancelBut.interactive=false;
    this.cancelBut.buttonMode=false;
    
    this.cancelBut.on('click', (event) => {
      if(this.subAction==="pause" || this.subAction==="card pick" || this.subAction==="accusation window wait"){
        
        this.e.s.p("cancel");
        this.subAction = "unpause"

      }
    })
    
    this.cancelButText = new PIXI.Text('CANCEL');
    this.cancelButText.anchor.x = 0.5
    this.cancelButText.position.x = 600;
    this.cancelButText.position.y = 210;
    this.cancelButText._zIndex = 215;
    this.cancelButText.alpha = 0;
    this.cancelButText.style = new PIXI.TextStyle({
        align: "center",
        lineHeight: 0,
        fill: 0xffffff,
        fontSize: 24,
        fontFamily: "Hypatia"
    })
    this.cancelButText.resolution = 2;
    this.clueCont.addChild(this.cancelButText);

    // mags

    this.mag1 = new PIXI.Sprite(this.e.ui.t_mag);
    this.mag1.scale.x=this.mag1.scale.y=0.35
    this.mag1.anchor.x=.5
    this.mag1.anchor.y=.5
    this.mag1.position.y=-220;
    this.mag1.alpha=1;
    this.clueCont.addChild(this.mag1);
      
    this.mag2 = new PIXI.Sprite(this.e.ui.t_mag);
    this.mag2.scale.x=this.mag2.scale.y=0.35
    this.mag2.anchor.x=.5
    this.mag2.anchor.y=.5
    this.mag2.position.y=0;
    this.mag2.alpha=1;
    this.clueCont.addChild(this.mag2);
      
    this.mag3 = new PIXI.Sprite(this.e.ui.t_mag);
    this.mag3.scale.x=this.mag3.scale.y=0.35
    this.mag3.anchor.x=.5
    this.mag3.anchor.y=.5
    this.mag3.position.y=220;
    this.mag3.alpha=1;
    this.clueCont.addChild(this.mag3);
      
    this.accusationWindow = new PIXI.Sprite(this.e.ui.t_accusationWindow);
    this.accusationWindow.scale.x=this.accusationWindow.scale.y=0.5
    this.accusationWindow.anchor.x=.5
    this.accusationWindow.anchor.y=.5
    this.accusationWindow.alpha=0;
    this.accusationWindow._zIndex=100010;
    this.clueCont.addChild(this.accusationWindow);

    this.accusationWindow.buttonMode=false;
    this.accusationWindow.interactive=false;

    this.accusationWindow.on('click', (event) => {
      if(this.subAction==="accusation window wait"){
        this.subAction = "accusation window press"
      }
    })
    
    this.accusationWindow.on('touchstart', (event) => {
      if(this.subAction==="accusation window wait"){
        this.subAction = "accusation window press"
      }
    })
    
    //-----------------------------------------------------------

    this.accusationBut = new PIXI.Sprite(this.e.ui.t_accusationBut);
    this.accusationBut.scale.x=this.accusationBut.scale.y=0.5
    this.accusationBut.anchor.x=.5
    this.accusationBut.anchor.y=1
    this.accusationBut.alpha=1;
    this.accusationBut._zIndex=100010;
    this.mainCont.addChild(this.accusationBut);

    this.accusationBut.buttonMode=true;
    this.accusationBut.interactive=true;

    this.accusationBut.on('click', (event) => {
      if(this.pauseGame===false && this.subAction==="play"){
        this.pauseGame = true;
        this.subAction = "set accusation"
      }
    });

    if(this.e.mobile===true){
      this.accusationBut.alpha=0;
      this.accusationBut.buttonMode=false;
      this.accusationBut.interactive=false;
      document.getElementById("accText").style.opacity = 0;
  
    }
    
    this.cardListeners()

    //-----------------------------------------------------------

    this.frameLeft = new PIXI.Sprite(this.e.ui.t_frameLeft);
    this.frameLeft.anchor.x=0
    this.frameLeft.anchor.y=.5
    this.frameLeft._zIndex=100000
    this.frameLeft.alpha=1;
    this.mainCont.addChild(this.frameLeft);

    this.frameRight = new PIXI.Sprite(this.e.ui.t_frameRight);
    this.frameRight.anchor.x=1
    this.frameRight.anchor.y=.5
    this.frameRight._zIndex=100000
    this.frameRight.alpha=1;
    this.mainCont.addChild(this.frameRight);

    if(this.e.mobile===true){
      this.frameLeft.alpha=0;
      this.frameRight.alpha=0;
    }

    //level cont

    this.levelCont = new PIXI.Container();
    this.levelCont.sortableChildren = true;
    this.mainCont.addChild(this.levelCont);

    // this.levelCont.alpha=0.2;

    this.wood = new PIXI.TilingSprite(this.e.ui.t_woodRepeat);
    this.wood.anchor.x=0.5
    this.wood.anchor.y=0.5
    this.wood.tileScale.set(.5, .5);
    this.wood.width=4000;
    this.wood.height=4000;
    this.wood._zIndex=-1
    this.wood.alpha=1;
    this.levelCont.addChild(this.wood);

    this.board = new PIXI.Sprite(this.e.ui.t_board);
    this.board.anchor.x = this.board.anchor.y = .5;
    this.board._zIndex=-1;
    this.levelCont.addChild(this.board);

    // 2d player

    this.playerCont = new PIXI.Container();
    this.playerCont.sortableChildren = true;
    this.levelCont.addChild(this.playerCont);
    this.playerCont._zIndex=100;

    this.player = new PIXI.Sprite(this.e.ui.white);
    this.player.anchor.x = this.player.anchor.y = .5;
    this.player.width=25;
    this.player.height=25;
    this.playerCont.addChild(this.player);

    this.playerCont.position.x = -55;
    this.playerCont.position.y = 225;

    // secret passages

    this.secret1 = new PIXI.Sprite(this.e.ui.red);
    this.secret1.anchor.x = this.secret1.anchor.y = .5;
    this.secret1.position.x = -55 + (73*-4);
    this.secret1.position.y = 225 + (73*-13);
    this.secret1.width=25;
    this.secret1.height=25;
    this.secret1._zIndex=2500;
    this.levelCont.addChild(this.secret1);

    this.secret2 = new PIXI.Sprite(this.e.ui.black);
    this.secret2.anchor.x = this.secret2.anchor.y = .5;
    this.secret2.position.x = -55 + (73*5);
    this.secret2.position.y = 225 + (73*-14);
    this.secret2.width=25;
    this.secret2.height=25;
    this.secret2._zIndex=2500;
    this.levelCont.addChild(this.secret2);

    this.secret3 = new PIXI.Sprite(this.e.ui.white);
    this.secret3.anchor.x = this.secret3.anchor.y = .5;
    this.secret3.position.x = -55 + (73*-4);
    this.secret3.position.y = 225 + (73*8);
    this.secret3.width=25;
    this.secret3.height=25;
    this.secret3._zIndex=2500;
    this.levelCont.addChild(this.secret3);

    this.secret4 = new PIXI.Sprite(this.e.ui.mag);
    this.secret4.anchor.x = this.secret4.anchor.y = .5;
    this.secret4.position.x = -55 + (73*5);
    this.secret4.position.y = 225 + (73*8);
    this.secret4.width=25;
    this.secret4.height=25;
    this.secret4._zIndex=2500;
    this.levelCont.addChild(this.secret4);

    // 2d enemies

    this.enemies = [];

    for(var i=0; i<6; i++){

      this.enemyCont = new PIXI.Container();
      this.enemyCont.sortableChildren = true;
      this.levelCont.addChild(this.enemyCont);
      this.enemyCont._zIndex=100;

      this.enemy = new PIXI.Sprite(this.e.ui.black);
      this.enemy.anchor.x = this.enemy.anchor.y = .5;
      this.enemy.width=25;
      this.enemy.height=25;
      this.enemyCont.addChild(this.enemy);

      this.enLimit = new PIXI.Sprite(this.e.ui.black);
      this.levelCont.addChild(this.enLimit);

      this.enLimit.alpha=0;

      this.enemyCont.enLimit = this.enLimit;

      if(i===0){

        //bottom left

        this.enLimit.position.x= -55 -36 + (73*3);
        this.enLimit.position.y = 225 - 36 + (73*0);
        this.enLimit.width=800;
        this.enLimit.height=800;

        this.enemyCont.position.x = -55 + (73*10);
        this.enemyCont.position.y = 225 + (73*2);
  
      }else if(i===1){

        // bottom right

        this.enLimit.position.x= -55 -36 + (73*-11);
        this.enLimit.position.y = 225 - 36 + (73*0);
        this.enLimit.width=73*9;
        this.enLimit.height=800;

        this.enemyCont.position.x = -55 + (73*-6);
        this.enemyCont.position.y = 225 + (73*5);
  
      }else if(i===2){

        // enemy on left

        this.enLimit.position.x= -55 -36 + (73*-11);
        this.enLimit.position.y = 225 - 36 + (73*-9);
        this.enLimit.width=73*14;
        this.enLimit.height=73*11;

        this.enemyCont.position.x = -55 + (73*-4);
        this.enemyCont.position.y = 225 + (73*-4);
  
      }else if(i===3){

        // enemy on right

        this.enLimit.position.x= -55 -36 + (73*-2);
        this.enLimit.position.y = 225 - 36 + (73*-9);
        this.enLimit.width=73*14;
        this.enLimit.height=73*11;

        this.enemyCont.position.x = -55 + (73*4);
        this.enemyCont.position.y = 225 + (73*-4);
  
      // }else if(i===4){

      //   this.enLimit.position.x= -55 -36 + (73*-5);
      //   this.enLimit.position.y = 225 - 36 + (73*-14);
      //   this.enLimit.width=73*11;
      //   this.enLimit.height=73*13;

        // this.enemyCont.position.x = -55 + (73*0);
        // this.enemyCont.position.y = 225 + (73*-7);
  
      }else if(i===4){

        this.enLimit.position.x= -55 -36 + (73*-11);
        this.enLimit.position.y = 225 - 36 + (73*-14);
        this.enLimit.width=73*10;
        this.enLimit.height=73*8;

        this.enemyCont.position.x = -55 + (73*-8);
        this.enemyCont.position.y = 225 + (73*-11);
  
      }else if(i===5){

        //library one

        this.enLimit.position.x= -55 -36 + (73*2);
        this.enLimit.position.y = 225 - 36 + (73*-14);
        this.enLimit.width=73*10;
        this.enLimit.height=73*8;

        this.enemyCont.position.x = -55 + (73*5);
        this.enemyCont.position.y = 225 + (73*-9);
  
      }

      this.enemyCont.startx=this.enemyCont.position.x;
      this.enemyCont.starty=this.enemyCont.position.y;

      this.enemyCont.enemy3D = this.enemies3D[i];
      this.enemyCont.enemyBody = this.enemyBodies[i];

      this.enemies.push(this.enemyCont);

    }

    //

    this.checker = new PIXI.Sprite(this.e.ui.black);
    this.checker.anchor.x = this.checker.anchor.y = .5;
    this.checker.width=50;
    this.checker.height=50;
    this.checker.alpha=0;
    this.levelCont.addChild(this.checker);

    //

    var spots = [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,
      0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
      0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,4,0,0,0,0,0,0,0,
      2,1,1,1,2,1,3,0,0,0,0,0,0,0,3,1,0,0,0,0,0,0,0,
      0,1,5,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,
      0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1,4,1,1,0,
      0,0,0,0,0,1,1,1,3,1,1,1,3,1,1,1,1,1,1,1,1,1,0,
      0,0,0,0,0,5,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,0,0,
      0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
      0,0,0,0,0,1,1,1,0,0,0,0,0,1,6,0,0,0,0,0,0,0,0,
      0,1,5,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
      0,1,7,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
      0,0,0,0,0,1,1,1,0,0,0,0,0,1,6,0,0,0,0,0,0,0,0,
      0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,
      0,0,0,0,0,7,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,0,
      0,0,0,0,0,1,1,1,9,1,1,1,1,9,1,1,1,1,1,1,1,1,1,
      0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1,10,1,1,1,
      0,1,7,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
      1,1,8,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
      0,0,0,0,1,1,9,0,0,0,0,0,0,0,0,9,1,0,0,0,0,0,0,
      0,0,0,0,8,1,1,0,0,0,0,0,0,0,0,1,10,0,0,0,0,0,0,
      0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,
      0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,
    ];

    this.spotBoxes = [];
    this.enterBoxes = [];
    this.skullBoxes = [];
    this.skullBoxPlaces = [];

    for(var i=0; i<20; i++){

      this.skullBox = new PIXI.Sprite(this.e.ui.t_skullBox);
      this.skullBox.anchor.x = this.skullBox.anchor.y = .5;
      this.skullBox.width=70;
      this.skullBox.height=70;
      this.skullBox._zIndex=10;
      this.skullBox.position.x=10000;
      this.skullBox.position.y=10000;
      // this.skullBox.alpha=0;
      this.levelCont.addChild(this.skullBox);
      this.skullBoxes.push(this.skullBox);

      this.skullBox.ani = [this.e.ui.t_skullBox,this.e.ui.t_skullBox2];
      this.skullBox.aniSpeed = .6;
      // this.e.ui.animatedSprites.push(this.skullBox);
      
    }

    for(var i=0; i<spots.length; i++){

      var yy = Math.floor(i/23);
      var xx = i - (yy*23);

      if(spots[i]!==0){

        this.spot = new PIXI.Sprite(this.e.ui.white);
        this.spot.anchor.x = this.spot.anchor.y = .5;
        this.spot.width=70;
        this.spot.height=70;
        this.spot._zIndex=10;
        this.spot.alpha=0;
        this.levelCont.addChild(this.spot);
  
        this.spot.position.x = ((xx-11) * 73) + 18;
        this.spot.position.y = ((yy-11) * 73) + 7;

        this.spotBoxes.push(this.spot);

      }

      if(spots[i]===1){

        // console.log(xx +" / "+yy)

        if(xx===6 && yy===1){

          console.log("found1")

          // this.spot2 = new PIXI.Sprite(this.e.ui.white);
          // this.spot2.anchor.x = this.spot2.anchor.y = .5;
          // this.spot2.width=170;
          // this.spot2.height=170;
          // this.spot2._zIndex=310;
          // this.spot2.alpha=0.5;
          // this.levelCont.addChild(this.spot2);

          // this.spot2.position.x = ((xx-11) * 73) + 18;
          // this.spot2.position.y = ((yy-11) * 73) + 7;
  
        }else if(xx===15 && yy===0){

          console.log("found2")

          // this.spot2 = new PIXI.Sprite(this.e.ui.white);
          // this.spot2.anchor.x = this.spot2.anchor.y = .5;
          // this.spot2.width=170;
          // this.spot2.height=170;
          // this.spot2._zIndex=310;
          // this.spot2.alpha=0.5;
          // this.levelCont.addChild(this.spot2);

          // this.spot2.position.x = ((xx-11) * 73) + 18;
          // this.spot2.position.y = ((yy-11) * 73) + 7;
  
        }else if(xx===6 && yy===22){

          console.log("found3")

          // this.spot2 = new PIXI.Sprite(this.e.ui.white);
          // this.spot2.anchor.x = this.spot2.anchor.y = .5;
          // this.spot2.width=170;
          // this.spot2.height=170;
          // this.spot2._zIndex=310;
          // this.spot2.alpha=0.5;
          // this.levelCont.addChild(this.spot2);

          // this.spot2.position.x = ((xx-11) * 73) + 18;
          // this.spot2.position.y = ((yy-11) * 73) + 7;
  
        }else if(xx===15 && yy===22){

          console.log("found4")

          // this.spot2 = new PIXI.Sprite(this.e.ui.white);
          // this.spot2.anchor.x = this.spot2.anchor.y = .5;
          // this.spot2.width=170;
          // this.spot2.height=170;
          // this.spot2._zIndex=310;
          // this.spot2.alpha=0.5;
          // this.levelCont.addChild(this.spot2);

          // this.spot2.position.x = ((xx-11) * 73) + 18;
          // this.spot2.position.y = ((yy-11) * 73) + 7;
  
        }else if(xx===10 && yy===14){

          console.log("found5")

          this.spot2 = new PIXI.Sprite(this.e.ui.white);
          this.spot2.anchor.x = this.spot2.anchor.y = .5;
          this.spot2.width=170;
          this.spot2.height=170;
          this.spot2._zIndex=310;
          this.spot2.alpha=0.5;
          this.levelCont.addChild(this.spot2);

          this.spot2.position.x = ((xx-11) * 73) + 10;
          this.spot2.position.y = ((yy-11) * 73) + 14;
  
        }else{

            var sbo = new Object;
            sbo.xx = xx;
            sbo.yy = yy;
            this.skullBoxPlaces.push(sbo);

          }

        }


      if(spots[i]!==0 && spots[i]!==1){

        this.spot = new PIXI.Sprite(this.e.ui.white);

        if(spots[i]===2){
          this.spot.room="stables";
        }else if(spots[i]===3){
          this.spot.room="generalStore";
        }else if(spots[i]===4){
          this.spot.room="library";
        }else if(spots[i]===5){
          this.spot.room="poolHall";
        }else if(spots[i]===6){
          this.spot.room="parlor";
        }else if(spots[i]===7){
          this.spot.room="sheriffs";
        }else if(spots[i]===8){
          this.spot.room="studio";
        }else if(spots[i]===9){
          this.spot.room="saloon";
        }else if(spots[i]===10){
          this.spot.room="restaurant";
          console.log("10: "+xx+" / "+yy)
        }

        // create 2d enter spots

        if(xx===14 && yy===3 || xx===4 && yy===20 || xx===15 && yy===19 || xx===5 && yy===14 || xx===5 && yy===7){

          //left

          this.spot.ani = [this.e.ui.t_enter_l_1,this.e.ui.t_enter_l_2];

        }else if(xx===6 && yy===3 || xx===15 && yy===2 || xx===6 && yy===19 || xx===14 && yy===9 || xx===16 && yy===20 || xx===14 && yy===12){

          // right

          this.spot.ani = [this.e.ui.t_enter_r_1,this.e.ui.t_enter_r_2];

        }else if(xx===0 && yy===3 || xx===4 && yy===3 || xx===8 && yy===6  ||
                 xx===12 && yy===6 || xx===19 && yy===6 || xx===19 && yy===5 || xx===2 && yy===10 || 
                 xx===2 && yy===17 || xx===19 && yy===14
          ){

            // up

          this.spot.ani = [this.e.ui.t_enter_u_1,this.e.ui.t_enter_u_2];

        }else if(xx===19 && yy===5 || xx===2 && yy===4 || xx===2 && yy===11 || xx===2 && yy===18 || 
          xx===8 && yy===15 || xx===13 && yy===15 || xx===19 && yy===16 || xx===19 && yy===7
          ){

            // down

          this.spot.ani = [this.e.ui.t_enter_d_1,this.e.ui.t_enter_d_2];

        }

        this.spot.aniSpeed = .6;

        this.e.ui.animatedSprites.push(this.spot);
        
        this.spot.anchor.x = this.spot.anchor.y = .5;
        this.spot.width=72;
        this.spot.height=72;
        this.spot._zIndex=50;
        this.spot.alpha=0;
        this.levelCont.addChild(this.spot);
  
        this.spot.position.x = ((xx-11) * 73) + 18;
        this.spot.position.y = ((yy-11) * 73) + 7;

        this.enterBoxes.push(this.spot);

      }

    }

    this.makeenterBoxes3d();

    this.keyRightCount=0;
    this.keyLeftCount=0;
    this.keyUpCount=0;
    this.keyDownCount=0;

    this.takenSpaces=[];

    //------------------------------------------------------------------------------------------------------------------------

  }

  tpx(num){
    return (num*.0343)+.6;
  }

  tpy(num){
    return (num*.0343)+1.0;
  }

  handleCrosses(){

    for(var i=0; i<this.crosses.length; i++){

      this.crosses[i].position.x = this.crosses[i].card.position.x;
      this.crosses[i].position.y = this.crosses[i].card.position.y;
      this.crosses[i].scale.x = this.crosses[i].card.scale.x;
      this.crosses[i].scale.y = this.crosses[i].card.scale.y;

    }

  }

  resetPieces(){

    this.playerCont.position.x = -55;
    this.playerCont.position.y = 225;
    this.playerCont.alpha = 1;
    this.playerBody.position.y=0;
    this.playerBody.rotation.x=0;
    this.playerBody.rotation.y=0;
    this.playerBody.rotation.z=0;
    this.playerBody.material.opacity=1

    for( var i=0; i<this.enemies.length; i++){
      gsap.killTweensOf(this.enemies[i].position);
      gsap.killTweensOf(this.enemies[i].enemyBody.position);
      gsap.killTweensOf(this.enemies[i].enemyBody.rotation);
    }

    for(var i=0; i<this.enemies.length; i++){

      this.enemies[i].position.x = this.enemies[i].startx;
      this.enemies[i].position.y = this.enemies[i].starty;
      this.enemies[i].enemyBody.position.y = 0;
      this.enemies[i].enemyBody.rotation.x = 0;
      this.enemies[i].enemyBody.rotation.y = 0;
      this.enemies[i].enemyBody.rotation.z = 0;
      this.enemies[i].alpha = 1;

      this.enemies[i].moveCount = -5;
      this.enemies[i].action="wait";

    }

  }

  uiControl(){

    this.vig.width = window.innerWidth;
    this.vig.height = window.innerHeight;

    this.titleTop.position.x = window.innerWidth/2;
    this.titleTop.position.y = 0;

    document.getElementById("buyText").style.left = ((window.innerWidth/2)-280)+"px";
    document.getElementById("buyText").style.bottom = "37px";

    document.getElementById("infoText").style.right = ((window.innerWidth/2)-280)+"px";
    document.getElementById("infoText").style.bottom = "37px";

    document.getElementById("actionDiv").style.top = "88px";
    document.getElementById("actionDiv").style.fontSize = "7pt";

    document.getElementById("accDiv").style.bottom = "88px";

    document.getElementById("livesText").style.left = "200px";
    document.getElementById("livesText").style.bottom = "140px";

    document.getElementById("cardText").style.right = "200px";
    document.getElementById("cardText").style.bottom = "120px";

    if(this.e.mobile===true){

      this.lifeCont.position.x = (window.innerWidth/2)-21;
      this.lifeCont.position.y = 75;
      this.lifeCont.scale.x = this.lifeCont.scale.y = .5

      document.getElementById("livesText").style.opacity = 0;
  
    }else{

      this.lifeCont.position.x = 170;
      this.lifeCont.position.y = window.innerHeight-85;
  
    }

    this.actionBar.position.x = window.innerWidth/2;
    this.actionBar.position.y = 120;

    this.startMenu.position.x = window.innerWidth/2;
    this.startMenu.position.y = window.innerHeight/2;

    this.instructions.position.x = window.innerWidth/2;
    this.instructions.position.y = window.innerHeight/2;

    this.accusationBut.position.x = window.innerWidth/2;
    this.accusationBut.position.y = window.innerHeight-85;

    this.cardCont.position.x = window.innerWidth-220;
    this.cardCont.position.y = window.innerHeight+50+this.t.cardDown;

    this.getCont.position.x = window.innerWidth/2;
    this.getCont.position.y = window.innerHeight/2;

    this.endCont.position.x = window.innerWidth/2;
    this.endCont.position.y = window.innerHeight/2;

    this.botLinkLeft.position.x = (window.innerWidth/2)-110;
    this.botLinkLeft.position.y = window.innerHeight-19;

    this.botLinkRight.position.x = (window.innerWidth/2)+110;
    this.botLinkRight.position.y = window.innerHeight-19;

    this.frameRight.position.x = window.innerWidth-52;
    this.frameRight.position.y = window.innerHeight/2;

    this.frameLeft.position.x = 52;
    this.frameLeft.position.y = window.innerHeight/2;

    this.clueCont.position.x = window.innerWidth/2;
    this.clueCont.position.y = window.innerHeight/2;

    this.lostLifeText.position.x = window.innerWidth/2;
    this.lostLifeText.position.y = window.innerHeight/3;

    if(window.innerWidth<1670){

      this.clueCont.scale.x = (1*window.innerWidth)/1770;
      this.clueCont.scale.y = this.clueCont.scale.x;

    }else if(window.innerHeight<940){

      this.clueCont.scale.x = (1*window.innerHeight)/1100;
      this.clueCont.scale.y = this.clueCont.scale.x;

    }else{

      this.clueCont.scale.x = 1;
      this.clueCont.scale.y = 1;

    }

    if(this.lives===3){

      if(this.e.mobile===true){
        document.getElementById("livesText").style.opacity = "1";
      }
      
      this.hsArray[0].alpha=1;
      this.hsArray[1].alpha=1;
      this.hsArray[2].alpha=1;

      this.hsArray[0].position.x=0;
      this.hsArray[1].position.x=45;
      this.hsArray[2].position.x=90;

    }else if(this.lives===2){

      if(this.e.mobile===true){
        document.getElementById("livesText").style.opacity = "1";
      }

      this.hsArray[0].alpha=1;
      this.hsArray[1].alpha=1;
      this.hsArray[2].alpha=0;

      this.hsArray[0].position.x=22;
      this.hsArray[1].position.x=22+45;

    }else if(this.lives===1){

      if(this.e.mobile===true){
        document.getElementById("livesText").style.opacity = "1";
      }

      this.hsArray[0].alpha=0;
      this.hsArray[1].alpha=1;
      this.hsArray[2].alpha=0;

      this.hsArray[0].position.x=0;
      this.hsArray[1].position.x=45;
      this.hsArray[2].position.x=90;

    }else if(this.lives===0){

      document.getElementById("livesText").style.opacity = "0";

      this.hsArray[0].alpha=0;
      this.hsArray[1].alpha=0;
      this.hsArray[2].alpha=0;

    }

    if(this.e.mobile===true){
      document.getElementById("livesText").style.opacity = "0";
    }

  }

  update(){

    this.clueContMobile.position.x = window.innerWidth/2;
    this.clueContMobile.position.y = window.innerHeight/2;

    this.shaftColorCount+=this.e.dt;
    if(this.shaftColorCount>1){

      this.shaftColorCount=0;

      if(this.shaftCol===1){
        this.shaftEdges.material.color.set(0x410c0c);
        this.shaftCol=0;
      }else{
        this.shaftEdges.material.color.set(0xFFFFFF)
        this.shaftCol=1;
      }
      

    }

    if(this.e.mobile===true){

      document.getElementById("actionText").style.opacity=0;
      document.getElementById("cardText").style.opacity=0;
      document.getElementById("jodaLink").style.display="none";

      this.actionBar.alpha=0;
      this.cardCont.alpha=0;
      this.accusationBut.alpha=0;

      this.mobileCancelAccCont.position.y = 150;

      if(this.showMobileButtons===true){
          
        this.e.ui.leftBut.alpha=1;
        this.e.ui.rightBut.alpha=1;
        this.e.ui.downBut.alpha=1;
        this.e.ui.upBut.alpha=1;
        this.e.ui.accMobBut.alpha=1;
        this.e.ui.accMobBut.interactive=true;
        this.e.ui.accMobBut.buttonMode=true;
        
      }else{

        this.e.ui.leftBut.alpha=0;
        this.e.ui.rightBut.alpha=0;
        this.e.ui.downBut.alpha=0;
        this.e.ui.upBut.alpha=0;
        this.e.ui.accMobBut.alpha=0;
        this.e.ui.accMobBut.interactive=false;
        this.e.ui.accMobBut.buttonMode=false;
        
      }

    }else{

      this.actionBar.alpha=1;
      document.getElementById("actionText").style.opacity="1";

      this.e.ui.leftBut.alpha=0;
      this.e.ui.rightBut.alpha=0;
      this.e.ui.downBut.alpha=0;
      this.e.ui.upBut.alpha=0;
      this.e.ui.accMobBut.alpha=0;
      this.accusationBut.alpha=1;

    }

    document.getElementById("actionText").innerHTML = this.actionText;

    // loops

    this.mixer();

    this.handleEnterBoxes3d();
    this.handleCrosses();

    this.renderer.render(this.scene3D, this.camera);

    this.uiControl();

    this.levelCont.alpha=0;
    // this.camera.position.z=70;

    document.getElementById("feedback").innerHTML = this.action+" / "+this.subAction+" / "+this.susRoom;

    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------------

    if(this.action==="set"){

      this.lives = 3;
      this.isFinalGuess=false;
      this.level = 1;
      this.playerAction="ready"

      this.subCount2=0;

      this.gameCount=5;

      this.goText.alpha=0;
      this.resetText.alpha=0;
      this.goText2.text="";

      this.endCont.alpha=0

      this.endCard1.texture = this.e.ui.t_cardBack;
      this.endCard2.texture = this.e.ui.t_cardBack;
      this.endCard3.texture = this.e.ui.t_cardBack;

      this.endCircle1.alpha = 0;
      this.endCircle2.alpha = 0;
      this.endCircle3.alpha = 0;

      this.envelope.position.y = this.envelope.startPosY;
      this.envelope.rotation.x = 0;

      this.envCard.position.y = this.envCard.startPosY;
      this.envCard.position.z = this.envCard.startPosZ;
      this.envCard.rotation.x = 0;

      for(var i=0; i<this.clueCards.length; i++){

        this.clueCards[i].eliminated=false;
        this.clueCards[i].answer="";

      }

      this.resetButton.interactive=false;
      this.resetButton.buttonMode=false;

      this.camLerp=true;

      // set up the game

      this.charCardsCopy = this.e.u.copyArray(this.charCards);
      this.myCharCard = this.e.u.pickRemoveFromArray(this.charCardsCopy);
      this.myCharCard.answer = "char";

      this.roomCardsCopy = this.e.u.copyArray(this.roomCards);
      this.myRoomCard = this.e.u.pickRemoveFromArray(this.roomCardsCopy);
      this.myRoomCard.answer = "room";

      this.weaponCardsCopy = this.e.u.copyArray(this.weaponCards);
      this.myWeaponCard = this.e.u.pickRemoveFromArray(this.weaponCardsCopy);
      this.myWeaponCard.answer = "weapon";

      //-------------------------------------

      console.log("---------------");
      console.log(this.myCharCard.name);
      console.log(this.myRoomCard.name);
      console.log(this.myWeaponCard.name);
      console.log("---------------");

      // get remaining cards

      this.remainingCards = [];

      for(var i=0; i<this.charCardsCopy.length; i++){
        this.remainingCards.push(this.charCardsCopy[i]);
      }
      
      for(var i=0; i<this.roomCardsCopy.length; i++){
        this.remainingCards.push(this.roomCardsCopy[i]);
      }
      
      for(var i=0; i<this.weaponCardsCopy.length; i++){
        this.remainingCards.push(this.weaponCardsCopy[i]);
      }
      
      // copy all
        
      for(var i=0; i<5; i++){

        this.pick = this.e.u.pickRemoveFromArray(this.remainingCards);
        this.pick.eliminated = true;

        console.log("eliminated: "+this.pick.name);

      }

      for(var i=0; i<2; i++){
        this.pick = this.e.u.pickRemoveFromArray(this.roomCardsCopy);
        this.pick.eliminated = true;
      }
      
      this.resetPieces();
      
      this.t.cardDown = 0

      document.getElementById("cardText").style.display="inline";
      
      this.pauseGame=false;

      gsap.to(  this.camContX.rotation, {x: this.e.u.ca(-82), duration: 1, ease: "sine.out"});

      this.action="game";
      this.subAction="play";

    }else if(this.action==="game"){

      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------

      // lerp

      this.destx = -this.playerCont.position.x+(window.innerWidth/2);
      this.desty = -this.playerCont.position.y+(window.innerHeight/2);

      this.levelCont.position.x = this.e.u.lerp(this.levelCont.position.x, this.destx, 2*this.e.dt);
      this.levelCont.position.y = this.e.u.lerp(this.levelCont.position.y, this.desty, 2*this.e.dt);
  
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------

      // 3D parts

      this.player3D.position.x = (this.playerCont.position.x*.0343)+.5;
      this.player3D.position.z = (this.playerCont.position.y*.0343)+1.1;

      if(this.camLerp===true){
        this.camContY.position.x = this.e.u.lerp(this.camContY.position.x, this.player3D.position.x/1, this.e.dt*2);
        this.camContY.position.z = this.e.u.lerp(this.camContY.position.z, this.player3D.position.z/1, this.e.dt*2);
      }

      if(this.threeAction==="main menu"){

        this.camera.position.z = 100;
        // if(this.e.mobile===true){
          // this.camera.position.z = 240;
        // }
        this.camContX.rotation.x = this.e.u.ca(-60);
        this.camContY.rotation.y += this.e.dt*.2;
        if(this.camContY.rotation.y>this.e.u.ca(360)){
          this.camContY.rotation.y-=this.e.u.ca(360);
        }
        this.camContY.position.x = 0;
        this.camContY.position.z = 0;
        this.camLerp=false;
        this.playerAction="";
        this.subAction="";

      }else if(this.threeAction==="game"){

        // this.camContY.rotation.y = this.e.u.ca(this.player3D.position.x*-.05);
    
      }else if(this.threeAction==="enterRoom"){

        gsap.to(  this.camContX.rotation, { x: this.e.u.ca(-45), duration: 2, ease: "quart.out"});
        gsap.to(  this.camContY.rotation, { y: this.e.u.ca(45), duration: 2, ease: "quart.out"});

        this.threeCount=0;
        this.threeAction="inRoom"

      }else if(this.threeAction==="enteringRoom"){

        //

      }else if(this.threeAction==="exitRoom"){

        gsap.to(  this.camContX.rotation, { x: this.e.u.ca(-82), duration: 2, ease: "quart.out"});
        gsap.to(  this.camContY.rotation, { y: this.e.u.ca(0), duration: 2, ease: "quart.out"});

        this.threeCount=0;
        this.threeAction=""

      }else if(this.threeAction==="exitingRoom"){

        this.threeCount+=this.e.dt;
        if(this.threeCount>2){
          this.threeAction="game";
          this.threeCount=0;
        }

      }

      for(var i=0; i<this.enemies3D.length; i++){

        this.enemies3D[i].position.x = (this.enemies[i].position.x*.0343)+.5;
        this.enemies3D[i].position.z = (this.enemies[i].position.y*.0343)+1.1;
        
      }

      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------

      if(this.playerAction==="ready"){

         // dir keys

         if(this.e.input.keyRight===true){

          if(this.keyRightUp===true || this.e.mobile===true){
            this.keyRightUp=false;
            this.moveCheck(this.playerCont,73,0,"r");
          }

          this.keyRightCount+=this.e.dt;
          if(this.keyRightCount>.125){
            this.keyRightUp=true;
            this.keyRightCount=0;
          }
          
        }else{

          this.keyRightUp=true;

        }
        
        if(this.e.input.keyLeft===true){

          if(this.keyLeftUp===true || this.e.mobile===true){
            this.keyLeftUp=false;
            this.moveCheck(this.playerCont,-73,0,"l");
          }
          
          this.keyLeftCount+=this.e.dt;
          if(this.keyLeftCount>.125){
            this.keyLeftUp=true;
            this.keyLeftCount=0;
          }
          
        }else{

          this.keyLeftUp=true;

        }
        
        if(this.e.input.keyUp===true){

          if(this.keyUpUp===true || this.e.mobile===true){
            this.keyUpUp=false;
            this.moveCheck(this.playerCont,0,-73,"u");
          }
          
          this.keyUpCount+=this.e.dt;
          if(this.keyUpCount>.125){
            this.keyUpUp=true;
            this.keyUpCount=0;
          }
          
        }else{

          this.keyUpUp=true;

        }
        if(this.e.input.keyDown===true){

          if(this.keyDownUp===true || this.e.mobile===true){
            this.keyDownUp=false;
            this.moveCheck(this.playerCont,0,73,"d");
          }
          
          this.keyDownCount+=this.e.dt;
          if(this.keyDownCount>.125){
            this.keyDownUp=true;
            this.keyDownCount=0;
          }
          
        }else{

          this.keyDownUp=true;

        }

      }else if(this.playerAction==="moving"){

        this.subCount+=this.e.dt;
        if(this.subCount>=.125){

          this.playerAction="ready"
          this.subCount=0;

        }

      }

      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------
      //----------------------------------------------------------------------------------------------------------------------------

      if(this.subAction==="start game"){

        gsap.to(  this.camContY.rotation, {y: 0, duration: 1, ease: "sine.out"});
        gsap.to(  this.camContX.rotation, {x: this.e.u.ca(-82), duration: 1, ease: "sine.out"});
        if(this.e.mobile===true){
          gsap.to(  this.camera.position, {z: 120, duration: 1, ease: "sine.out"});
        }else{
          gsap.to(  this.camera.position, {z: 70, duration: 1, ease: "sine.out"});
        }
        
        this.camLerp=true;

        this.showMobileButtons=true;

        this.subAction="wait start";

      }else if(this.subAction==="wait start"){

        this.subCount+=this.e.dt;
        if(this.subCount>2){

          this.playerAction="ready";

          this.subCount=0;
          this.subCount2=0;
          this.subAction="play";
          this.lostLifeText.text = "GO!\n(USE ARROW KEYS TO MOVE)"

          if(this.e.mobile===true){
            this.lostLifeText.style.fontSize = 16;
            this.lostLifeText.text = "GO!"
          }

        }

      }else if(this.subAction==="play"){

        

        this.subCount2+=this.e.dt;

        if(this.subCount2>3){
          this.subCount2=0;
          this.lostLifeText.text = "";
        }
        
        if(this.e.mobile===false){
          this.cardBack.interactive=true;
          this.cardBack.buttonmode=true;
        }
        
        //----------------------------------------

        this.moveEnemies();

        this.handleSecretDoors();
          
        //----------------------------------------
        
        // secret passages

        if(this.e.u.hitTest(this.player,this.secret1)===true && this.secret1Usable===true){

          this.subAction="down secret";
          this.secretDoor = 1;

        }else  if(this.e.u.hitTest(this.player,this.secret2)===true && this.secret2Usable===true){

          this.subAction="down secret";
          this.secretDoor = 2;

        }else  if(this.e.u.hitTest(this.player,this.secret3)===true && this.secret3Usable===true){

          this.subAction="down secret";
          this.secretDoor = 3;

        }else  if(this.e.u.hitTest(this.player,this.secret4)===true && this.secret4Usable===true){

          this.subAction="down secret";
          this.secretDoor = 4;

        }

        //----------------------------------------

        this.susChar=null;
        this.susRoom=null;
        this.susWeapon=null;

        // player enters a room

        for(var i=0; i<this.enterBoxes.length; i++){

          if(this.e.u.hitTest(this.player,this.enterBoxes[i])===true && this.enterBoxes[i].alpha===1){

            this.e.s.p("enter");

            this.playerAction="off";

            gsap.killTweensOf(this.player.position);

            this.myRoom = this.enterBoxes[i].room;

            var po = -this.board.width/2;

            console.log(this.enterBoxes[i].room);

            this.myDoorSpot = this.enterBoxes[i];

            if(this.enterBoxes[i].room==="stables"){
              
              gsap.to(  this.playerCont.position, {x: po+390, y: po+270, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="generalStore"){

              gsap.to(  this.playerCont.position, {x: po+970, y: po+380, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="library"){

              gsap.to(  this.playerCont.position, {x: po+1630, y: po+340, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="poolHall"){

              gsap.to(  this.playerCont.position, {x: po+350, y: po+740, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="parlor"){

              gsap.to(  this.playerCont.position, {x: po+1500, y: po+1000, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="sheriffs"){

              gsap.to(  this.playerCont.position, {x: po+350, y: po+1260, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="studio"){

              gsap.to(  this.playerCont.position, {x: po+310, y: po+1765, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="saloon"){

              gsap.to(  this.playerCont.position, {x: po+1000, y: po+1670, duration: 1, delay: .25, ease: "sine.out"});

            }else if(this.enterBoxes[i].room==="restaurant"){

              gsap.to(  this.playerCont.position, {x: po+1600, y: po+1690, duration: 1, delay: .25, ease: "sine.out"});
              
            }

            // get the sus room

            for(var j=0; j<this.clueCards.length; j++){

              // console.log(this.clueCards[j].name+" / "+this.enterBoxes[i].room);

              if( this.clueCards[j].name===this.enterBoxes[i].room){

                this.susRoom = this.clueCards[j];

              }

            }

            // stop enemies when you enter into room

            for(var j=0; j<this.enemies.length; j++){

              this.enemies[j].action="stopped";
  
            }

            this.threeAction="enterRoom";
            this.subAction="entering room"

          }

        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // make enter boxes shift

        // console.log(this.gameCount);

        this.gameCount+=this.e.dt;

        if(this.gameCount>10){
          this.actionText="ENTER ROOMS";
        }else{
          this.actionText="AVOID ENEMIES";
        }

        if(this.gameCount>10 && this.pauseGame===false){

          // console.log("change")

          this.e.s.p("bell");

          this.gameCount=0;
          
          var copyArray = [];

          for(var i=0; i<this.enterBoxes.length; i++){

            this.enterBoxes[i].alpha=0;
            this.enterBoxes[i].plane3d.material.visible=false;
            copyArray.push(this.enterBoxes[i]);

          }

          for(var i=0; i<5; i++){

            var pick = this.e.u.pickRemoveFromArray(copyArray);
            pick.alpha=1;
            pick.plane3d.material.visible=true;

          }

          var skullNum = Math.round( 5+this.level*1.5 );
          if(skullNum>20){
            skullNum=20;
          }

          for(var i=0; i<skullNum; i++){

            this.skullBoxCopy = this.e.u.copyArray(this.skullBoxPlaces);

            this.skullPick = this.e.u.pickRemoveFromArray(this.skullBoxCopy);

            var sd = this.e.u.getDistance(this.playerCont.position.x, this.playerCont.position.y, ((this.skullPick.xx-11) * 73) + 18, ((this.skullPick.yy-11) * 73) + 7);
            // console.log(sd);

            if( sd > 200 ){

              this.skullBoxes[i].position.x = ((this.skullPick.xx-11) * 73) + 18;
              this.skullBoxes[i].position.y = ((this.skullPick.yy-11) * 73) + 7;
  
            }else{

              this.skullBoxes[i].position.x = 10000;
              this.skullBoxes[i].position.y = 10000;
  
            }

            this.skullBoxes[i].plane3d.position.x = this.tpx(this.skullBoxes[i].position.x);
            this.skullBoxes[i].plane3d.position.z = this.tpy(this.skullBoxes[i].position.y);

          }

        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // player hits enemy

        for( var i=0; i<this.enemies.length; i++){
          if(this.e.u.hitTest(this.player,this.enemies[i])===true){
            this.subAction="set die";
            this.dieType="enemy";
          }
        }
        
        for( var i=0; i<this.skullBoxes.length; i++){
          if(this.e.u.hitTest(this.player,this.skullBoxes[i])===true){
            this.subAction="set die";
            this.dieType="skull";
          }
        }
        
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // set enemy speeds
        
        this.enemySpeed=1 + ((10-this.level)/13);

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // secret passage

      }else if(this.subAction==="down secret"){

        

        console.log(this.player3D.position.y)

        gsap.killTweensOf(this.player3D.position);
        gsap.to(  this.player3D.position, {y: -10, duration: .25, delay: .25, ease: "sine.out"});

        this.stepOnce=true;
        this.subAction="down move";

      }else if(this.subAction==="down move"){

        this.subCount+=this.e.dt;

        if(this.subCount>.2 && this.stepOnce===true){

          this.stepOnce=false;
          this.e.s.p("steps")

        }
      
        if(this.subCount>.5){

          

          this.subCount=0;

          if(this.secretDoor===1){

            this.playerCont.position.x = this.secret4.position.x;
            this.playerCont.position.y = this.secret4.position.y;
            this.secret4Usable=false;
            this.secret4Count=5

          }else if(this.secretDoor===2){

            this.playerCont.position.x = this.secret3.position.x;
            this.playerCont.position.y = this.secret3.position.y;
            this.secret3Usable=false;
            this.secret3Count=5

          }else if(this.secretDoor===3){

            this.playerCont.position.x = this.secret2.position.x;
            this.playerCont.position.y = this.secret2.position.y;
            this.secret2Usable=false;
            this.secret2Count=5

          }else if(this.secretDoor===4){

            this.playerCont.position.x = this.secret1.position.x;
            this.playerCont.position.y = this.secret1.position.y;
            this.secret1Usable=false;
            this.secret1Count=5

          }

          gsap.killTweensOf(this.player3D.position);
          gsap.to(  this.player3D.position, {y: -0, duration: .01, delay: .2, ease: "linear"});
  
          this.subAction="play"
  
        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // death stuff

      }else if(this.subAction==="set die"){

        this.showMobileButtons=false;

        this.actionText="YOU DIED";

        this.playerAction="die";
        this.subAction="die ani";

        this.e.s.p("lose")
        
      }else if(this.subAction==="die ani"){

        this.subCount+=this.e.dt;
        if(this.subCount>.07 && this.dieType==="enemy" || this.subCount>.4 && this.dieType==="skull"){

          this.subCount=0;

          gsap.killTweensOf(this.playerCont.position);
          gsap.killTweensOf(this.playerBody.rotation);
          gsap.killTweensOf(this.playerBody.position);
  
          for( var i=0; i<this.enemies.length; i++){
            gsap.killTweensOf(this.enemies[i].position);
            gsap.killTweensOf(this.enemies[i].enemyBody.position);
            gsap.killTweensOf(this.enemies[i].enemyBody.rotation);
          }

          this.lostLifeText.text = "LIFE LOST - "+(this.lives-1)+ " LEFT"
  
          this.playerAction="die";
          this.subAction="die";

          this.blinkCount=0;
        
        }

      }else if(this.subAction==="die"){

        this.blinkCount+=this.e.dt;

        if(this.blinkCount>.03){

          this.blinkCount=0;

          if(this.playerBody.material.opacity===1){
            this.playerBody.material.opacity=0;
          }else{
            this.playerBody.material.opacity=1;
          }

        }

        this.subCount+=this.e.dt;
        if(this.subCount>5){
          this.subCount=5;
          this.subAction="die reset"
        }

      }else if(this.subAction==="die reset"){

        for(var i=0; i<this.skullBoxes.length; i++){
          
          this.skullBoxes[i].position.x = 10000;
          this.skullBoxes[i].position.y = 10000;

          this.skullBoxes[i].plane3d.position.x = this.tpx(this.skullBoxes[i].position.x);
          this.skullBoxes[i].plane3d.position.z = this.tpy(this.skullBoxes[i].position.y);

        }

        this.lostLifeText.text="";

        this.clearEnterBoxes();
        this.gameCount=5;

        this.lives-=1;

        if(this.lives<=0){

          this.playerBody.material.opacity=0;
          this.subAction="set accusation";
          this.isFinalGuess=true;
  
        }else{

          this.resetPieces();

          this.e.s.p("guitar2")

          this.playerAction="ready";
          this.subAction="play";
          
          this.actionText="AVOID ENEMIES";
  
        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // pressed the card in lower right corner

      }else if(this.subAction==="pause set"){

        this.actionText="PAUSED";

        this.e.s.p("mystery")

        this.mag1.alpha = 0;
        this.mag2.alpha = 0;
        this.mag3.alpha = 0;
        
        this.cancelBut.buttonMode=true;
        this.cancelBut.interactive=true;
        this.cancelButText.text = "CLOSE"
        this.cancelButText.alpha=1;

        this.accusationWindow.alpha=0

        this.cardBack.interactive=false;
        this.cardBack.buttonmode=false;

        this.clueCardBack.texture = this.e.ui.black;

        for(var i=0; i<this.clueCards.length; i++){
          
          this.clueCards[i].alpha = 1;

          this.clueCards[i].texture = this.clueCards[i].clueTexture;

          if(this.clueCards[i].eliminated===true){
            this.clueCards[i].cross.alpha = 1;
          }else{
            this.clueCards[i].cross.alpha = 0;
          }

        }

        document.getElementById("cardText").style.display="none";
        gsap.to(  this.t, {cardDown: 200, duration: .5, ease: "expo.out"});
        gsap.to(  this.clueCont, {alpha: 1, duration: .5, ease: "linear"});

        this.subAction="pause"

      }else if(this.subAction==="pause"){



      }else if(this.subAction==="unpause"){

        this.cancelBut.interactive=false;
        this.cancelBut.buttonMode=false;
        
        gsap.killTweensOf(this.t);
        gsap.to(  this.t, {cardDown: 0, duration: .5, ease: "expo.out"});
        gsap.to(  this.clueCont, {alpha: 0, duration: .5, ease: "linear"});

        this.subAction="unpausing"

      }else if(this.subAction==="unpausing"){

        this.subCount+=this.e.dt;
        if(this.subCount>.5){
          this.pauseGame = false;
          document.getElementById("cardText").style.display="inline";
          this.subAction="play";
          this.actionText="AVOID ENEMIES";
          this.subCount=0;
        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // entering room

      }else if(this.subAction==="entering room"){

        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x = 10000;
        this.locationContAll.position.x = 10000;

        this.lostLifeText.text="";

        this.showMobileButtons=false;

        this.accusationWindow.alpha=0;
        this.accusationWindow.buttonMode=false;
        this.accusationWindow.interactive=false;

        this.mag1.alpha=0;
        this.mag2.alpha=0;
        this.mag3.alpha=0;

        this.isAccusation=false;

        this.subCount+=this.e.dt;

        if(this.subCount>1){

          this.level+=1;
          if(this.level>10){
            this.level=10;
          }
  
          this.subCount=0;
          this.subAction="card fade in";

          this.clearEnterBoxes();

        }

      }else if(this.subAction==="card fade in"){

        // this.clueContMobile
        // this.mobileAccInstructions
        // this.mobileCancelAccCont
        // this.suspectCont
        // this.weaponCont
        // this.locationCont
        // this.locationContAll
        // this.accusationMobileBack

        this.actionText="SELECT CLUE CARDS";

        this.e.s.p("mystery");

        if(this.e.mobile===true){

          gsap.to(  this.clueContMobile, {alpha: 1, duration: .5, ease: "linear"});
          this.mobileAccInstructions.alpha = 0;
          this.mobileCancelAccCont.alpha = 0;
          this.suspectCont.alpha = 1;
          this.weaponCont.alpha = 0;
          this.locationCont.alpha = 0;
          this.accusationMobileBack.alpha = .8;

        }else{

          this.clueCardBack.texture = this.e.ui.black;

          for(var i=0; i<this.clueCards.length; i++){

            this.clueCards[i].texture = this.e.ui.t_cardBack;
            this.clueCards[i].cross.alpha = 0;

          }

          document.getElementById("cardText").style.display = "none";

          gsap.to(  this.t, {cardDown: 200, duration: .5, ease: "sine.out"});
          gsap.to(  this.clueCont, {alpha: 1, duration: .5, ease: "linear"});

        }

        this.subAction="card fade in wait"

      }else if(this.subAction==="card fade in wait"){

        this.subCount+=this.e.dt;

        if(this.subCount>.5){

          this.turnX = -800;
          this.subCount=0;

          if(this.e.mobile===true){

            this.susChar=null;
            this.susWeapon=null;
            // this.susRoom=null;

            this.subAction = "start pick mobile"

          }else{

            this.subAction = "card turner set"

          }

        }

        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------

      }else if(this.subAction==="card turner set"){

        for(var i=0; i<this.clueCards.length; i++){

          this.clueCards[i].myDelay = Math.abs(this.clueCards[i].position.x)/700
          this.clueCards[i].turnedYet = false;

          gsap.to( this.clueCards[i].scale, {x: 0, duration: .125, delay: this.clueCards[i].myDelay, ease: "linear"});

        }

        this.subAction="card turner";
        
      }else if(this.subAction==="card turner"){

        this.subCount+=this.e.dt;

        for(var i=0; i<this.clueCards.length; i++){

          if(this.subCount>=this.clueCards[i].myDelay+.125 && this.clueCards[i].turnedYet===false){

            this.clueCards[i].turnedYet=true;

            this.clueCards[i].texture = this.clueCards[i].clueTexture;
            gsap.killTweensOf(this.clueCards[i].scale);
            gsap.to( this.clueCards[i].scale, {x: .4, duration: .125, ease: "linear"});

            if(this.clueCards[i].eliminated===true){
              this.clueCards[i].cross.alpha = 1;
            }

          }

        }

        if(this.subCount>2){

          for(var i=0; i<this.clueCards.length; i++){

            if(this.clueCards[i].eliminated===false){
              this.clueCards[i].buttonMode=true;
              this.clueCards[i].interactive=true;
            }

          }

          for(var i=0; i<this.roomCards.length; i++){
            this.roomCards[i].buttonMode=false;
            this.roomCards[i].interactive=false;
          }

          this.subAction="card pick";

        }

        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------

        // mobile

      }else if(this.subAction==="start pick mobile"){

        this.subAction="set char pick mobile"

        //-------------------------------------------------------------

      }else if(this.subAction==="set char pick mobile"){

        for(var i=0; i<this.mobileCharCards.length; i++){

          this.cardAvailable = false;

          for(var j=0; j<this.clueCards.length; j++){

            if(this.mobileCharCards[i].card.texture === this.clueCards[j].clueTexture){

              if(this.clueCards[j].eliminated === false){

                this.cardAvailable=true;

              }

            }

          }

          if(this.cardAvailable===true){

            this.mobileCharCards[i].cross.alpha = 0;
            this.mobileCharCards[i].card.interactive = true;
            this.mobileCharCards[i].card.buttonMode = true;
  
          }else{

            this.mobileCharCards[i].cross.alpha = 1;
            this.mobileCharCards[i].card.interactive = false;
            this.mobileCharCards[i].card.buttonMode = false;
  
          }
           
        }

        this.suspectCont.alpha = 1;
        this.weaponCont.alpha = 0;
        this.locationCont.alpha = 0;

        this.suspectCont.position.x = 0;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x =  10000;
        this.locationContAll.position.x =  10000;

        this.subAction="wait char pick mobile";

      }else if(this.subAction==="wait char pick mobile"){

        if(this.susChar!==null){

          this.subAction="set weapon pick mobile";

          for(var j=0; j<this.clueCards.length; j++){

            // console.log("------------------")
            // console.log(j)
            // console.log(this.clueCards[j].clueTexture)
            // console.log(this.susChar)
            // console.log(this.susChar.card)
            // console.log(this.susChar.card.texture)

            if(this.clueCards[j].clueTexture ===  this.susChar.card.texture){

              console.log("FOUND CHAR")

              this.susChar = this.clueCards[j];
              j=1000;

            }

          }
            
          for(var i=0; i<this.mobileCharCards.length; i++){

            this.mobileCharCards[i].buttonMode=false;
            this.mobileCharCards[i].interactive=false;

          }


        }

        //-------------------------------------------------------------

      }else if(this.subAction==="set weapon pick mobile"){

        for(var i=0; i<this.mobileWeaponCards.length; i++){

          this.cardAvailable = false;

          for(var j=0; j<this.clueCards.length; j++){

            if(this.mobileWeaponCards[i].card.texture === this.clueCards[j].clueTexture){

              if(this.clueCards[j].eliminated === false){

                this.cardAvailable=true;

              }

            }

          }

          if(this.cardAvailable===true){

            this.mobileWeaponCards[i].cross.alpha = 0;
            this.mobileWeaponCards[i].card.interactive = true;
            this.mobileWeaponCards[i].card.buttonMode = true;
  
          }else{

            this.mobileWeaponCards[i].cross.alpha = 1;
            this.mobileWeaponCards[i].card.interactive = false;
            this.mobileWeaponCards[i].card.buttonMode = false;
  
          }
           
        }

        this.suspectCont.alpha = 0;
        this.weaponCont.alpha = 1;
        this.locationCont.alpha = 0;

        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 0;
        this.locationCont.position.x =  10000;
        this.locationContAll.position.x =  10000;

        this.subAction="wait weapon pick mobile";

      }else if(this.subAction==="wait weapon pick mobile"){

        if(this.susWeapon!==null){

          this.subAction="set room pick mobile";
          
          for(var j=0; j<this.clueCards.length; j++){

            console.log("------------------")
            console.log(j)
            console.log(this.clueCards[j])
            console.log(this.clueCards[j].clueTexture)

            if(this.clueCards[j].clueTexture ===  this.susWeapon.card.texture){

              this.susWeapon = this.clueCards[j];
              j=1000;

              console.log("------------------")
              console.log("FOUND WEAPON")
              console.log(this.susWeapon)

            }

          }

        }

        for(var i=0; i<this.mobileWeaponCards.length; i++){

          this.mobileWeaponCards[i].buttonMode=false;
          this.mobileWeaponCards[i].interactive=false;

        }

        //-------------------------------------------------------------

      }else if(this.subAction==="set room pick mobile"){

        this.isAccusation=false;

        this.suspectCont.alpha = 0;
        this.weaponCont.alpha = 0;
        this.locationCont.alpha = 1;

        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x = 0;
        this.locationContAll.position.x = 10000;

        this.theLocCardCont.cross.alpha = 0;
        this.theLocCard.interactive = true;
        this.theLocCard.buttonMode = true;

        // console.log(this.susRoom);
        // console.log(this.susRoom.texture);
        // console.log(this.theLocCard);

        this.theLocCard.texture = this.susRoom.clueTexture;

        this.subAction="wait room pick mobile"

      }else if(this.subAction==="wait room pick mobile"){

        this.theLocCard.interactive = true;
        this.theLocCard.buttonMode = true;

        // if(this.susRoom!==null){

          // this.subAction="cards selected";

        // }

      }else if(this.subAction==="exit room pick mobile"){
        
        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x = 10000;
        this.locationContAll.position.x = 10000;

        console.log("-------------------------------------------------")
        console.log("susroom");
        console.log(this.susRoom);
        console.log("-------------------------------------------------")

        // for(var j=0; j<this.clueCards.length; j++){

        //   if(this.clueCards[j].clueTexture === this.susRoom.texture){

        //     console.log("FOUND ROOM")

        //     this.susRoom = this.clueCards[j];
        //     j=1000;

        //   }

        // }
        
        this.theLocCard.interactive = false;
        this.theLocCard.buttonMode = false;

        this.clueContMobile.alpha = 0;

        this.subAction="pick choice";

        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------

      }else if(this.subAction==="card pick"){

        // waiting on pick here

        // console.log("-------------------");
        // console.log(this.susChar)
        // console.log(this.susRoom)
        // console.log(this.susWeapon)

        if(this.susChar!==null){

          for(var i=0; i<this.charCards.length; i++){

            if(this.susChar === this.charCards[i]){

              this.mag1.alpha=1;
              this.mag1.position.x = this.charCards[i].position.x;

            }

          }

        }

        // console.log(this.susRoom);

        if(this.susRoom!==null){

          for(var i=0; i<this.roomCards.length; i++){

            // console.log(this.susRoom);
            // console.log(this.roomCards[i].texture);
            // console.log("--------");

            if(this.susRoom === this.roomCards[i]){

              // console.log(this.mag2);

              this.mag2.alpha=1;
              this.mag2.position.x = this.roomCards[i].position.x;

            }

          }

        }
        
        if(this.susWeapon!==null){

          for(var i=0; i<this.weaponCards.length; i++){

            if(this.susWeapon === this.weaponCards[i]){

              this.mag3.alpha=1;
              this.mag3.position.x = this.weaponCards[i].position.x;

            }

          }

        }
        
        if(this.susChar!==null && this.susRoom!==null && this.susWeapon!==null){

          this.subAction="cards selected"

        }

      }else if(this.subAction==="cards selected"){

        gsap.to(  this.clueCont, {alpha: 0, duration: .5, ease: "linear"});

        for(var i=0; i<this.clueCards.length; i++){

            this.clueCards[i].buttonMode=false;
            this.clueCards[i].interactive=false;

        }

        this.subCount=0;

        if(this.isAccusation===true){

          this.subAction="set final accusation"
            
        }else{

          this.subAction="pick choice"

        }

      }else if(this.subAction==="pick choice"){

        this.actionText="YOUR NEW CLUE!";

        this.possibleCards = [];

        // can you add the character

        if(this.susChar.answer!=="char"){
          this.possibleCards.push(this.susChar);
        }

        // can you add the room
        // is the added room exed out?

        if(this.susRoom.answer!=="room" && this.susRoom.eliminated===false){
          this.possibleCards.push(this.susRoom);
        }

        // can you add the weapon

        if(this.susWeapon.answer!=="weapon"){
          this.possibleCards.push(this.susWeapon);
        }

        console.log("char: "+this.susChar.name);
        console.log("room: "+this.susRoom.name);
        console.log("weapon: "+this.susWeapon.name);

        for(var i=0; i<this.possibleCards.length; i++){
          console.log("-------------------------------------------------")
          console.log("pos "+i)
          console.log(this.possibleCards[i] )
          console.log(this.possibleCards[i].name)
          // console.log(this.possibleCards[i])
        }

        // take all the choices and pick a random one

        this.myChoice = null;

        if(this.possibleCards.length>0){

          this.myChoice = this.e.u.pickFromArray(this.possibleCards);
        
        }else{

          // if there are no choices, and the room is exed out, show the exed out

          if(this.susRoom.eliminated===true){
            this.myChoice = this.susRoom;
          }

        }

        // if there still are no choices, say so

        if(this.myChoice===null){

          //

        }else{

          // console.log("-------------------------------------------------")
          // console.log("-------------------------------------------------")
          // console.log("-------------------------------------------------")
          // console.log("myChoice")
          // console.log(this.myChoice)
          // console.log(this.myChoice.name)
          // console.log(this.myChoice.clueTexture)

          this.getCard.texture = this.myChoice.clueTexture;
          this.myChoice.eliminated=true;

        }

        // action

        this.subAction="cards pressed"

      }else if(this.subAction==="cards pressed"){

        this.subCount+=this.e.dt;

        if(this.subCount>.5){

          this.subAction="fade in get"
          this.subCount=0;

        }

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // get

      }else if(this.subAction==="fade in get"){

        this.e.s.p("guitar2");

        gsap.to(  this.getBack, {alpha: .8, duration: .5, ease: "linear"});

        if(this.myChoice===null){

          // fade in text

          document.getElementById("noCardsDiv").style.opacity="1";

        }else{

          this.getCard.alpha=1;
          this.getCard.position.y=-1000;
          gsap.to(  this.getCard.position, {y: 0, duration: 1, ease: "expo.out"});
  
          this.getCard.rotation=this.e.u.ca(30);
          gsap.to(  this.getCard, {rotation: 0, duration: 1, ease: "expo.out"});
  
        }

        this.subAction="fade in wait";

      }else if(this.subAction==="fade in wait"){

        this.subCount+=this.e.dt;

        if(this.subCount>3){

          document.getElementById("noCardsDiv").style.opacity="0";

          this.subAction="fade out get"
          this.subCount=0;

        }

      }else if(this.subAction==="fade out get"){

        // animate get card out

        gsap.to(  this.getBack, {alpha: 0, duration: 1, ease: "linear"});
        gsap.to(  this.getCard.position, {y: 1000, duration: 1, ease: "expo.inOut"});
        gsap.to(  this.getCard, {rotation: this.e.u.ca(-70), duration: 1, ease: "expo.in"});

        this.subAction="fading out get"

      }else if(this.subAction==="fading out get"){

        // reposition stuff when done

        gsap.to(  this.playerCont, {alpha: 0, duration: 2, ease: "sine.out"});
        for(var i=0; i<this.enemies.length; i++){

          gsap.to(  this.enemies[i], {alpha: 0, duration: 2, ease: "sine.out"});

        }

        document.getElementById("cardText").style.display = "inline";

        gsap.to(  this.t, {cardDown: 0, duration: .5, ease: "sine.out"});

        this.subCount=0;
        this.threeAction="exitRoom"

        this.playerCont.position.x = this.myDoorSpot.position.x;
        this.playerCont.position.y = this.myDoorSpot.position.y;
        this.playerCont.alpha = 1;

        for(var i=0; i<this.enemies.length; i++){

          this.enemies[i].position.x = this.enemies[i].startx;
          this.enemies[i].position.y = this.enemies[i].starty;
          this.enemies[i].alpha = 1;;

          this.enemies[i].moveCount = -3;
          this.enemies[i].action="wait";

        }

        this.gameCount=-10;

        this.playerAction="ready";

        this.subAction="play";

        this.showMobileButtons=true;

        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // accusation button

      }else if(this.subAction==="set accusation"){

        this.lostLifeText.text="";

        this.e.s.p("mystery");

        if(this.e.mobile===true){

          gsap.to(  this.clueContMobile, {alpha: 1, duration: .5, ease: "linear"});
          this.mobileAccInstructions.alpha = 1;
          
          this.suspectCont.alpha = 0;
          this.weaponCont.alpha = 0;
          this.locationCont.alpha = 0;
          this.locationContAll.alpha = 0;
          this.accusationMobileBack.alpha = .8;

          if(this.isFinalGuess===true){
            this.mobileCancelAccBut.interactive=false;
            this.mobileCancelAccBut.buttonMode=false;
            this.mobileCancelAccCont.alpha = 0;
          }else{
            this.mobileCancelAccBut.interactive=true;
            this.mobileCancelAccBut.buttonMode=true;
            this.mobileCancelAccCont.alpha = 1;
          }

          this.mobileAccInstructions.interactive=true;
          this.mobileAccInstructions.buttonMode=true;

          for(var i=0; i<this.mobileCharCards.length; i++){

            this.mobileCharCards[i].cross.alpha = 0;

          }
          

        }else{

          this.actionText="ACCUSE!";

          this.mag1.alpha = 0;
          this.mag2.alpha = 0;
          this.mag3.alpha = 0;
          
          this.cardBack.interactive=false;
          this.cardBack.buttonmode=false;
  
          for(var i=0; i<this.clueCards.length; i++){
  
            this.clueCards[i].texture = this.clueCards[i].clueTexture;
  
            this.clueCards[i].alpha = 1;
  
            if(this.clueCards[i].eliminated===true){
              this.clueCards[i].cross.alpha = 1;
            }else{
              this.clueCards[i].cross.alpha = 0;
            }
  
            this.clueCards[i].buttonMode=false;
            this.clueCards[i].interactive=false;
  
          }
  
          this.clueCardBack.texture = this.e.ui.red;
  
          this.accusationWindow.alpha = 1;
          this.accusationWindow.buttonMode=true;
          this.accusationWindow.interactive=true;
  
          document.getElementById("cardText").style.display="none";
          gsap.to(  this.t, {cardDown: 200, duration: .5, ease: "expo.out"});
          gsap.to(  this.clueCont, {alpha: 1, duration: .5, ease: "linear"});
  
          if(this.isFinalGuess===true){
  
            this.accusationWindow.texture = this.e.ui.t_accusationFinal;
  
          }else{
  
            this.accusationWindow.texture = this.e.ui.t_accusationWindow;
  
            this.cancelBut.buttonMode=true;
            this.cancelBut.interactive=true;
            this.cancelButText.text = "CANCEL"
            this.cancelButText.alpha=1;
            
          }

        }

        this.showMobileButtons=false;

        this.subAction="accusation window wait"

      }else if(this.subAction==="accusation window wait"){

        //

        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------

        //acc mobile

      }else if(this.subAction==="accusation window press mobile"){

        this.mobileAccInstructions.buttonMode=false;
        this.mobileAccInstructions.interactive=false;

        // this.e.s.p("click");

        this.mobileAccInstructions.alpha=0;
        this.suspectCont.alpha=1;

        this.susChar=null;
        this.susRoom=null;
        this.susWeapon=null;

        this.subAction="accusation char"

        // -------------------------------------------------------------------------------------

      }else if(this.subAction==="accusation char"){

        this.suspectCont.position.x = 0;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x = 10000;
        this.locationContAll.position.x = 10000;

        for(var i=0; i<this.mobileCharCards.length; i++){

          this.cardAvailable = false;

          for(var j=0; j<this.clueCards.length; j++){

            if(this.mobileCharCards[i].card.texture === this.clueCards[j].clueTexture){

              if(this.clueCards[j].eliminated === false){

                this.cardAvailable=true;

              }

            }

          }

          if(this.cardAvailable===true){

            this.mobileCharCards[i].cross.alpha = 0;
            this.mobileCharCards[i].card.interactive = true;
            this.mobileCharCards[i].card.buttonMode = true;
  
          }else{

            this.mobileCharCards[i].cross.alpha = 1;
            this.mobileCharCards[i].card.interactive = false;
            this.mobileCharCards[i].card.buttonMode = false;
  
          }
           
        }

        this.e.s.p("click");

        this.mobileAccInstructions.alpha=0;
        this.suspectCont.alpha=1;
        this.weaponCont.alpha=0;
        this.locationContAll.alpha=0;
        this.locationCont.alpha=0;

        // this.mobileCancelAccCont.alpha=1;
        // this.mobileCancelAccCont.interactive=true;
        // this.mobileCancelAccCont.buttonMode=true;

        this.subAction="accusation char wait"

      }else if(this.subAction==="accusation char wait"){

        // wait for char press

        if(this.susChar!==null){

          for(var i=0; i<this.mobileCharCards.length; i++){

            this.mobileCharCards[i].card.interactive=false;
            this.mobileCharCards[i].card.buttonMode=false;

          }

          this.subAction="accusation weapon";
        }

        // -------------------------------------------------------------------------------------

      }else if(this.subAction==="accusation weapon"){

        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 0;
        this.locationCont.position.x = 10000;
        this.locationContAll.position.x = 10000;

        for(var i=0; i<this.mobileWeaponCards.length; i++){

          this.cardAvailable = false;

          for(var j=0; j<this.clueCards.length; j++){

            if(this.mobileWeaponCards[i].card.texture === this.clueCards[j].clueTexture){

              if(this.clueCards[j].eliminated === false){

                this.cardAvailable=true;

              }

            }

          }

          if(this.cardAvailable===true){

            this.mobileWeaponCards[i].cross.alpha = 0;
            this.mobileWeaponCards[i].card.interactive = true;
            this.mobileWeaponCards[i].card.buttonMode = true;
  
          }else{

            this.mobileWeaponCards[i].cross.alpha = 1;
            this.mobileWeaponCards[i].card.interactive = false;
            this.mobileWeaponCards[i].card.buttonMode = false;
  
          }
           
        }

        // this.e.s.p("click");

        this.mobileAccInstructions.alpha=0;
        this.suspectCont.alpha=0;
        this.weaponCont.alpha=1;
        this.locationContAll.alpha=0;
        this.locationCont.alpha=0;

        this.subAction="accusation weapon wait";

      }else if(this.subAction==="accusation weapon wait"){

        // wait for weapon press

        if(this.susWeapon!==null){

          for(var i=0; i<this.mobileWeaponCards.length; i++){

            this.mobileWeaponCards[i].card.interactive=false;
            this.mobileWeaponCards[i].card.buttonMode=false;

          }

          this.subAction="accusation location";
        }

        // -------------------------------------------------------------------------------------

      }else if(this.subAction==="accusation location"){

        this.suspectCont.position.x = 10000;
        this.weaponCont.position.x = 10000;
        this.locationCont.position.x = 10000;
        this.locationContAll.position.x = 0;

        for(var i=0; i<this.mobileRoomCards.length; i++){

          this.cardAvailable = false;

          for(var j=0; j<this.clueCards.length; j++){

            if(this.mobileRoomCards[i].card.texture === this.clueCards[j].clueTexture){

              if(this.clueCards[j].eliminated === false){

                this.cardAvailable=true;

              }

            }

          }

          if(this.cardAvailable===true){

            this.mobileRoomCards[i].cross.alpha = 0;
            this.mobileRoomCards[i].card.interactive = true;
            this.mobileRoomCards[i].card.buttonMode = true;
  
          }else{

            this.mobileRoomCards[i].cross.alpha = 1;
            this.mobileRoomCards[i].card.interactive = false;
            this.mobileRoomCards[i].card.buttonMode = false;
  
          }
           
        }
        
        this.e.s.p("click");

        this.mobileAccInstructions.alpha=0;
        this.suspectCont.alpha=0;
        this.weaponCont.alpha=0;
        this.locationContAll.alpha=1;
        this.locationCont.alpha=0;

        this.subAction="accusation location wait"

      }else if(this.subAction==="accusation location wait"){

        if(this.susRoom!==null){

          for(var i=0; i<this.mobileRoomCards.length; i++){

            this.mobileRoomCards[i].card.interactive=false;
            this.mobileRoomCards[i].card.buttonMode=false;

          }

          this.clueContMobile.alpha=0;
          this.mobileAccInstructions.alpha = 0;
          this.mobileCancelAccCont.alpha = 0;
          this.suspectCont.alpha = 0;
          this.weaponCont.alpha = 0;
          this.locationCont.alpha = 0;
          this.accusationMobileBack.alpha = 0;

          this.subAction="set final accusation";
        }

      }else if(this.subAction==="exit acc mobile"){

        this.clueContMobile.alpha = 0;

        this.showMobileButtons = true;

        this.mobileAccInstructions.interactive=false;
        this.mobileAccInstructions.buttonMode=false;
        this.mobileCancelAccBut.interactive=false;
        this.mobileCancelAccBut.buttonMode=false;

        this.subAction = "unpause"

        // this.subAction="exit acc mobile"

        // wait for location press

        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------------

      }else if(this.subAction==="accusation window press"){

        this.e.s.p("click")

        for(var i=0; i<this.clueCards.length; i++){

          this.clueCards[i].texture = this.clueCards[i].clueTexture;

          this.clueCards[i].alpha = 1;
         
          if(this.clueCards[i].eliminated===true){
            this.clueCards[i].cross.alpha = 1;
            this.clueCards[i].buttonMode=false;
            this.clueCards[i].interactive=false;
          }else{
            this.clueCards[i].cross.alpha = 0;
            this.clueCards[i].buttonMode=true;
            this.clueCards[i].interactive=true;
          }

        }

        this.accusationWindow.alpha = 0;
        this.accusationWindow.buttonMode=false;
        this.accusationWindow.interactive=false

        this.isAccusation=true;
        
        this.subAction="card pick"
        
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------

        // has chosen accusation cards

      }else if(this.subAction==="set final accusation"){

        this.actionText="FINAL ACCUSATION!";

        this.e.s.p("guitar2");

        this.subAction="move to center"
        this.subCount=0;

      }else if(this.subAction==="move to center"){

        this.camLerp=false;
        gsap.to(  this.camContY.position, {x: -1.2, z: -.3, duration: 2, ease: "sine.out"});
        gsap.to(  this.camContX.rotation, {x: this.e.u.ca(-90), duration: 2, ease: "sine.out"});

        this.subAction="move to center wait";

      }else if(this.subAction==="move to center wait"){

        this.subCount+=this.e.dt;

        if(this.subCount>2){
          this.subAction="fade folder out";
          this.subCount=0;
        }

      }else if(this.subAction==="fade folder out"){

        //gsap folder out

        gsap.to(  this.envelope.position, {y: 40, duration: 2, ease: "sine.out"});
        gsap.to(  this.envelope.rotation, {x: this.e.u.ca(45), duration: 2, ease: "sine.out"});

        gsap.to(  this.envCard.position, {y: 40, duration: 2, ease: "sine.out"});
        gsap.to(  this.envCard.rotation, {x: this.e.u.ca(45), duration: 2, ease: "sine.out"});
        gsap.to(  this.envCard.position, {z: this.envCard.position.z-100, y: this.envCard.position.y+100, duration: 1, delay: 2, ease: "sine.out"});

        // gsap.to(  this.envelope.material, {opacity: 1, duration: .1, delay: 3, ease: "sine.out"});

        this.subAction="fade folder out wait";

      }else if(this.subAction==="fade folder out wait"){

        this.subCount+=this.e.dt;

        if(this.subCount>2.5){
          this.subAction="fade finals in";
          this.subCount=0;
        }

      }else if(this.subAction==="fade finals in"){

        gsap.to(  this.endCont, {alpha: 1, duration: 2, ease: "sine.out"});

        if(this.e.mobile===true){
          this.endCont.scale.x = this.endCont.scale.y = .3;
        }

        this.subAction="fade finals in wait"

      }else if(this.subAction==="fade finals in wait"){

        this.subCount+=this.e.dt;

        if(this.subCount>2){
          this.subAction="wait card 1";
          this.subCount=0;
        }

      }else if(this.subAction==="wait card 1"){

        this.subCount+=this.e.dt;

        if(this.subCount>3){

          //flip card 1
          this.endCard1.texture=this.myCharCard.clueTexture;
          this.endCircle1.alpha=1;

          console.log(this.susChar);
          // console.log(this.susChar);

          console.log(this.susChar.clueTexture)
          console.log(this.myCharCard.clueTexture)

          if(this.susChar.clueTexture===this.myCharCard.clueTexture){
            //right sound
            this.e.s.p("bell");
            this.endCircle1.texture=this.e.ui.t_endRight;
          }else{
            //wrong sound
            this.e.s.p("softBoom");
            this.endCircle1.texture=this.e.ui.t_endWrong;
            //show wrong x
          }

          this.subAction="wait card 2";
          this.subCount=0;
        }

      }else if(this.subAction==="wait card 2"){

        this.subCount+=this.e.dt;

        if(this.subCount>3){

          //flip card 2
          this.endCard2.texture=this.myRoomCard.clueTexture;
          this.endCircle2.alpha=1;

          console.log(this.susRoom.clueTexture)
          console.log(this.myRoomCard.clueTexture)

          if(this.susRoom.clueTexture===this.myRoomCard.clueTexture){
            //right sound
            this.e.s.p("bell");
            this.endCircle2.texture=this.e.ui.t_endRight;
          }else{
            //wrong sound
            this.e.s.p("softBoom");
            this.endCircle2.texture=this.e.ui.t_endWrong;
            //show wrong x
          }

          this.subAction="wait card 3";
          this.subCount=0;
        }

      }else if(this.subAction==="wait card 3"){

        this.subCount+=this.e.dt;

        if(this.subCount>3){

          //flip card 3
          this.endCard3.texture=this.myWeaponCard.clueTexture;
          this.endCircle3.alpha=1;

          console.log(this.susWeapon.clueTexture)
          console.log(this.myWeaponCard.clueTexture)

          if(this.susWeapon.clueTexture===this.myWeaponCard.clueTexture){
            //right sound
            this.e.s.p("bell");
            this.endCircle3.texture=this.e.ui.t_endRight;
          }else{
            //wrong sound
            this.e.s.p("softBoom");
            this.endCircle3.texture=this.e.ui.t_endWrong;
            //show wrong x
          }

          this.subAction="result";
          this.subCount=0;
        }

      }else if(this.subAction==="result"){

        if(this.e.mobile===true){
          this.goText.position.y-=70;
          this.goText2.position.y-=30;
          this.goText.style.fontSize = 60;
          this.goText2.style.fontSize = 45;
          this.resetText.style.fontSize = 60;
          this.resetButton.width*=2;
          this.resetButton.height*=2;
          this.resetButton.alpha=0;
          this.resetText.position.y+=20;
          this.resetButton.position.y+=20;
        }

        // console.log(this.myCharCard.texture)
        // console.log(this.myRoomCard.texture)
        // console.log(this.myWeaponCard.texture)

        console.log(this.myCharCard.name)
        console.log(this.myRoomCard.name)
        console.log(this.myWeaponCard.name)

        if(this.susChar.clueTexture===this.myCharCard.clueTexture 
          && this.susRoom.clueTexture===this.myRoomCard.clueTexture 
          && this.susWeapon.clueTexture===this.myWeaponCard.clueTexture){

            if(this.e.mobile===true){
              this.goText.text = "CORRECT!"
              this.goText2.text = "YOU FIGURED OUT WHO KILLED THE COWBOY!"
            }else{
              this.goText.text = "CORRECT! YOU FIGURED OUT WHO KILLED THE COWBOY!"
            }
          

        }else{

          this.goText.text = "INCORRECT. GAME OVER."
          this.goText2.text = this.textureToWords(this.myCharCard.clueTexture) + " in the " + 
                              this.textureToWords(this.myRoomCard.clueTexture) + " with " + 
                              this.textureToWords(this.myWeaponCard.clueTexture);

        }

        this.goText.alpha=1;
        this.goText2.alpha=1;
        this.resetText.alpha=1;

        
        

        this.subAction="game over set"
        
        this.resetButton.interactive=true;
        this.resetButton.buttonMode=true;

      }else if(this.subAction==="game over set"){

        this.subAction="game over"

      }else if(this.subAction==="game over"){

        //wait for reset

        //-----------------------------------------------------------------------------------------

      }

      //---------------------------------------------------------------------------------------------------
      //---------------------------------------------------------------------------------------------------
      //---------------------------------------------------------------------------------------------------
      //---------------------------------------------------------------------------------------------------


    }

  }

  clearEnterBoxes(){

    // console.log("clear enter boxes")
    
    for(var i=0; i<this.enterBoxes.length; i++){

      this.enterBoxes[i].alpha=0;
      this.enterBoxes[i].plane3d.material.visible=false;

    }

  }

  handleSecretDoors(){

    if(this.secret1Usable===false){

      this.door1.material.visible=true;

      this.secret1Count-=this.e.dt;
      if(this.secret1Count<=0){
        this.secret1Usable=true;
      }

    }else{

      this.door1.material.visible=false;

    }

    // ---

    if(this.secret2Usable===false){

      this.door2.material.visible=true;

      this.secret2Count-=this.e.dt;
      if(this.secret2Count<=0){
        this.secret2Usable=true;
      }

    }else{

      this.door2.material.visible=false;

    }

    // ---

    if(this.secret3Usable===false){

      this.door3.material.visible=true;

      this.secret3Count-=this.e.dt;
      if(this.secret3Count<=0){
        this.secret3Usable=true;
      }

    }else{

      this.door3.material.visible=false;

    }

    // ---

    if(this.secret4Usable===false){

      this.door4.material.visible=true;

      this.secret4Count-=this.e.dt;
      if(this.secret4Count<=0){
        this.secret4Usable=true;
      }

    }else{

      this.door4.material.visible=false;

    }

    // ---
  }

  moveEnemies(){

    for(var i=0; i<this.enemies.length; i++){

      var en = this.enemies[i];

      if(en.action===undefined){

        // set initial values

        en.moveCount=0;
        en.action="wait";

      }else if(en.action==="stopped"){

        // stopped

      }else if(en.action==="wait"){

        en.moveCount+=this.e.dt;
        if(en.moveCount>this.enemySpeed){

          en.moveCount=0;
          en.action="move";

        }

      }else if(en.action==="move"){

        var vert = "";

        if(Math.abs(this.playerCont.position.y - en.position.y)<5){
          vert = "e";
        }else if(this.playerCont.position.y<en.position.y){
          vert = "u";
        }else if(this.playerCont.position.y>en.position.y){
          vert = "d";
        }

        var hor = "";

        if(Math.abs(this.playerCont.position.x - en.position.x)<5){
          hor = "e";
        }else if(this.playerCont.position.x<en.position.x){
          hor = "l";
        }else if(this.playerCont.position.x>en.position.x){
          hor = "r";
        }

        //---------------------------------------------------------

        //find other dirs in case the dir you choose is wrong

        var otherOptions = [];

        if( this.enCheck(en,0,-73)==="good" ){
          otherOptions.push("u");
        }
        if( this.enCheck(en,0,73)==="good" ){
          otherOptions.push("d");
        }
        if( this.enCheck(en,-73,0)==="good" ){
          otherOptions.push("l");
        }
        if( this.enCheck(en,73,0)==="good" ){
          otherOptions.push("r");
        }

        //---------------------------------------------------------

        var canVert = true;

        if(vert==="e"){
          canVert = false;
        }else if(vert==="d" && this.enCheck(en,0,73)==="bad"){
          canVert = false;
        }else if(vert==="u" && this.enCheck(en,0,-73)==="bad"){
          canVert = false;
        }

        var canHor = true;

        if(hor==="e"){
          canHor = false;
        }else if(hor==="r" && this.enCheck(en,73,0)==="bad"){
          canHor = false;
        }else if(hor==="l" && this.enCheck(en,-73,0)==="bad"){
          canHor = false;
        }

        //---------------------------------------------------------

        var finalDir = "";

        if(canHor===true && canVert===true){

          var dr = this.e.u.ran(2);
          if(dr===0){
            finalDir=hor;
          }else{
            finalDir=vert;
          }

        }else if(canHor===true){

          finalDir=hor;
          
        }else if(canVert===true){

          finalDir=vert;
          
        }else if(canHor===false && canVert===false){

          if(hor==="e"){

            var dr = this.e.u.ran(2);
            if(dr===0){
              finalDir="l";
            }else{
              finalDir="r";
            }

          }else if(vert==="e"){

            var dr = this.e.u.ran(2);
            if(dr===0){
              finalDir="u";
            }else{
              finalDir="d";
            }

          }

        }

        //---------------------------------------------------------

        // if you're too far pick another option

        // console.log("- "+finalDir)

        var useOtherOption=false;

        if(finalDir==="r" && this.enCheck(en, 73, 0)==="too far"){
          useOtherOption=true;
          // console.log("tf r")
        }else if(finalDir==="l" && this.enCheck(en, -73, 0)==="too far"){
          useOtherOption=true;
          // console.log("tf l")
        }else if(finalDir==="u" && this.enCheck(en, 0, -73)==="too far"){
          useOtherOption=true;
          // console.log("tf u")
        }else if(finalDir==="d" && this.enCheck(en, 0, 73)==="too far"){
          useOtherOption=true;
          // console.log("tf d")
        }

        if(useOtherOption===true){

          for(var i=0; i<otherOptions.length; i++){
            // console.log("oo "+otherOptions[i])
          }

          if(otherOptions.length>0){
            finalDir = this.e.u.pickRemoveFromArray(otherOptions);
          }
          
          // console.log("other option "+finalDir)

        }

        //---------------------------------------------------------

        if(finalDir==="r"){
          this.moveCheck(en,73,0,"r");
        }else if(finalDir==="l"){
          this.moveCheck(en,-73,0,"l");
        }else if(finalDir==="u"){
          this.moveCheck(en,0,-73,"u");
        }else if(finalDir==="d"){
          this.moveCheck(en,0,73,"d");
        }

        //---------------------------------------------------------

        en.action="wait";

      }

    }

    this.takenSpaces=[];

  }

  enCheck(en,x,y){

    this.checker.position.x = en.position.x + x;
    this.checker.position.y = en.position.y + y;

    var hitBox = false;

    // is there a space box there? default no

    for(var i=0; i<this.spotBoxes.length; i++){

      if(this.e.u.hitTest(this.spotBoxes[i], this.checker)===true){

        hitBox=true;

        i=10000;

      }

    }

    // if you hit an enemy can't go

    for(var i=0; i<this.enemies.length; i++){

      if(this.e.u.hitTest(this.enemies[i], this.checker)===true){

        hitBox=false;

        i=10000;

      }

    }

    // if you hit an enemy can't go

    for(var i=0; i<this.skullBoxes.length; i++){

      if(this.e.u.hitTest(this.skullBoxes[i], this.checker)===true){

        hitBox=false;

        i=10000;

      }

    }

    // check to see if it's too far away from origin

    var dister = this.e.u.getDistance(this.checker.position.x, this.checker.position.y, en.startx, en.starty);

    if(this.e.u.hitTest(this.checker, en.enLimit)===false){

      return "too far"

    }

    if(hitBox===true){
      return "good";
    }else if(hitBox===false){
      return "bad";
    }

  }

  moveCheck(actor,x,y,dir){

    this.checker.position.x = actor.position.x + x;
    this.checker.position.y = actor.position.y + y;

    var hitBox = false;
    var hitSpot = null;

    for(var i=0; i<this.spotBoxes.length; i++){

      if(this.e.u.hitTest(this.spotBoxes[i], this.checker)===true){

        hitSpot=this.spotBoxes[i];
        hitBox=true;

        i=10000;

      }

    }

    if(hitBox===true){

      if(actor!==this.playerCont){

        var moveGood = true;

        for(var i=0; i<this.takenSpaces.length; i++){

          if(hitSpot===this.takenSpaces[i]){

            moveGood=false;

          }

        }

        if(moveGood===true){

          // enemy

          gsap.killTweensOf(actor.position);
          gsap.to(  actor.position, {x: hitSpot.position.x+4, y: hitSpot.position.y-4, duration: .25, ease: "sine.out"});

          var moveNum = 90;

          if(dir==="r"){
            actor.enemyBody.rotation.z = this.e.u.ca(moveNum);
          }else if(dir==="l"){
            actor.enemyBody.rotation.z = this.e.u.ca(-moveNum);
          }else if(dir==="u"){
            actor.enemyBody.rotation.x = this.e.u.ca(moveNum);
          }else if(dir==="d"){
            actor.enemyBody.rotation.x = this.e.u.ca(-moveNum);
          }
  
          actor.enemyBody.position.y=10;
          
          gsap.killTweensOf(actor.enemyBody.position);
          gsap.killTweensOf(actor.enemyBody.rotation);
          gsap.to(  actor.enemyBody.rotation, {x: 0, z:0, duration: .5, ease: "sine.out"});
          gsap.to(  actor.enemyBody.position, {y: 0, duration: .5, ease: "sine.out"});
    
        }

      }else{

        // player

        this.e.s.p("move");

        gsap.killTweensOf(actor.position);
        gsap.to(  actor.position, {x: hitSpot.position.x+4, y: hitSpot.position.y-4, duration: .125, ease: "sine.out"});
        this.playerAction = "moving"

        var moveNum = 90;

        if(dir==="r"){
          this.playerBody.rotation.z = this.e.u.ca(moveNum);
        }else if(dir==="l"){
          this.playerBody.rotation.z = this.e.u.ca(-moveNum);
        }else if(dir==="u"){
          this.playerBody.rotation.x = this.e.u.ca(moveNum);
        }else if(dir==="d"){
          this.playerBody.rotation.x = this.e.u.ca(-moveNum);
        }

        this.playerBody.position.y=10;
        
        gsap.killTweensOf(this.playerBody.position);
        gsap.killTweensOf(this.playerBody.rotation);
        gsap.to(  this.playerBody.rotation, {x: 0, z:0, duration: .5, ease: "sine.out"});
        gsap.to(  this.playerBody.position, {y: 0, duration: .5, ease: "sine.out"});
  
      }
      
    }

    if(actor!==this.playerCont){

      this.takenSpaces.push(hitSpot);

    }


  }

  cardListenersMobile(){

    this.mobileCharCards[0].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[0];
      this.e.s.p("click");
    })

    this.mobileCharCards[1].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[1];
      this.e.s.p("click");
    })

    this.mobileCharCards[2].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[2];
      this.e.s.p("click");
    })

    this.mobileCharCards[3].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[3];
      this.e.s.p("click");
    })

    this.mobileCharCards[4].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[4];
      this.e.s.p("click");
    })

    this.mobileCharCards[5].card.on('touchstart', (event) => {
      this.susChar=this.mobileCharCards[5];
      this.e.s.p("click");
    })

    // ------------------------------------

    this.mobileWeaponCards[0].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[0];
      this.e.s.p("click");
    })

    this.mobileWeaponCards[1].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[1];
      this.e.s.p("click");
    })

    this.mobileWeaponCards[2].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[2];
      this.e.s.p("click");
    })

    this.mobileWeaponCards[3].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[3];
      this.e.s.p("click");
    })

    this.mobileWeaponCards[4].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[4];
      this.e.s.p("click");
    })

    this.mobileWeaponCards[5].card.on('touchstart', (event) => {
      this.susWeapon=this.mobileWeaponCards[5];
      this.e.s.p("click");
    })

    // ------------------------------------

    this.mobileRoomCards[0].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[0];
      this.e.s.p("click");
    })

    this.mobileRoomCards[1].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[1];
      this.e.s.p("click");
    })

    this.mobileRoomCards[2].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[2];
      this.e.s.p("click");
    })

    this.mobileRoomCards[3].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[3];
      this.e.s.p("click");
    })

    this.mobileRoomCards[4].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[4];
      this.e.s.p("click");
    })

    this.mobileRoomCards[5].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[5];
      this.e.s.p("click");
    })

    this.mobileRoomCards[6].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[6];
      this.e.s.p("click");
    })

    this.mobileRoomCards[7].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[7];
      this.e.s.p("click");
    })

    this.mobileRoomCards[8].card.on('touchstart', (event) => {
      this.susRoom=this.mobileRoomCards[8];
      this.e.s.p("click");
    })

  }

  cardListeners(){

    // for(var i=0; i<this.clueCards.length; i++){

      this.clueCards[0].on('click', (event) => {
        this.susChar=this.clueCards[0];
        this.e.s.p("click");
      })
  
      this.clueCards[1].on('click', (event) => {
        this.susChar=this.clueCards[1];
        this.e.s.p("click");
      })
  
      this.clueCards[2].on('click', (event) => {
        this.susChar=this.clueCards[2];
        this.e.s.p("click");
      })
  
      this.clueCards[3].on('click', (event) => {
        this.susChar=this.clueCards[3];
        this.e.s.p("click"); 
      })
  
      this.clueCards[4].on('click', (event) => {
        this.susChar=this.clueCards[4];
        this.e.s.p("click");
      })
  
      this.clueCards[5].on('click', (event) => { 
        this.susChar=this.clueCards[5];
        this.e.s.p("click");
      })

      //----------------------------
  
      this.clueCards[6].on('click', (event) => {
        this.susRoom=this.clueCards[6];
        this.e.s.p("click");
      })
  
      this.clueCards[7].on('click', (event) => {
        this.susRoom=this.clueCards[7];
        this.e.s.p("click");
      })
  
      this.clueCards[8].on('click', (event) => {
        this.susRoom=this.clueCards[8];
        this.e.s.p("click");
      })
  
      this.clueCards[9].on('click', (event) => {
        this.susRoom=this.clueCards[9];
        this.e.s.p("click");
      })
  
      this.clueCards[10].on('click', (event) => {
        this.susRoom=this.clueCards[10];
        this.e.s.p("click");
      })
  
      this.clueCards[11].on('click', (event) => {
        this.susRoom=this.clueCards[11];
        this.e.s.p("click");
      })
  
      this.clueCards[12].on('click', (event) => {
        this.susRoom=this.clueCards[12];
        this.e.s.p("click");
      })
  
      this.clueCards[13].on('click', (event) => {
        this.susRoom=this.clueCards[13];
        this.e.s.p("click");
      })
  
      this.clueCards[14].on('click', (event) => {
        this.susRoom=this.clueCards[14];
        this.e.s.p("click");
      })
  
      //----------------------------
  
      this.clueCards[15].on('click', (event) => {
        this.susWeapon=this.clueCards[15];
        this.e.s.p("click");
      })
  
      this.clueCards[16].on('click', (event) => {
        this.susWeapon=this.clueCards[16];
        this.e.s.p("click");
      })
  
      this.clueCards[17].on('click', (event) => {
        this.susWeapon=this.clueCards[17];
        this.e.s.p("click");
      })
  
      this.clueCards[18].on('click', (event) => {
        this.susWeapon=this.clueCards[18];
        this.e.s.p("click");
      })
  
      this.clueCards[19].on('click', (event) => {
        this.susWeapon=this.clueCards[19];
        this.e.s.p("click");
      })
  
      this.clueCards[20].on('click', (event) => {
        this.susWeapon=this.clueCards[20];
        this.e.s.p("click");
      })
  
    // }

  }

  cardToTexture(card){

    var text=null;

    if(card==="doc"){
      text = this.e.ui.t_doc;
    }else if(card==="drunk"){
      text = this.e.ui.t_drunk;
    }else if(card==="gunSlinger"){
      text = this.e.ui.t_gunSlinger;
    }else if(card==="madam"){
      text = this.e.ui.t_madam;
    }else if(card==="preacher"){
      text = this.e.ui.t_preacher;
    }else if(card==="tycoon"){
      text = this.e.ui.t_tycoon;

    }else if(card==="generalStore"){
      text = this.e.ui.t_doc;
    }else if(card==="library"){
      text = this.e.ui.t_library;
    }else if(card==="poolHall"){
      text = this.e.ui.t_poolHall;
    }else if(card==="parlor"){
      text = this.e.ui.t_parlor;
    }else  if(card==="saloon"){
      text = this.e.ui.t_saloon;
    }else  if(card==="sheriffs"){
      text = this.e.ui.t_sheriffs;
    }else  if(card==="stables"){
      text = this.e.ui.t_stables;
    }else  if(card==="restaurant"){
      text = this.e.ui.t_restaurant;
    }else  if(card==="studio"){
      text = this.e.ui.t_studio;
      
    }else  if(card==="heartbreak"){
      text = this.e.ui.t_heartbreak;
    }else if(card==="knife"){
      text = this.e.ui.t_knife;
    }else if(card==="marlboros"){
      text = this.e.ui.t_marlboros;
    }else if(card==="midnightStare"){
      text = this.e.ui.t_midnightStare;
    }else if(card==="poisonKiss"){
      text = this.e.ui.t_poisonKiss;
    }else if(card==="whiskey"){
      text = this.e.ui.t_whiskey;
    }

    return text;

  }

  textureToCard(text){

    var card=null;

    if(text===this.e.ui.t_doc){
      card = "doc";
    }else if(text===this.e.ui.t_drunk){
      card = "drunk";
    }else if(text===this.e.ui.t_gunSlinger){
      card = "gunSlinger";
    }else if(text===this.e.ui.t_madam){
      card = "madam";
    }else if(text===this.e.ui.t_preacher){
      card = "preacher";
    }else if(text===this.e.ui.t_tycoon){
      card = "tycoon";

    }else if(text===this.e.ui.t_generalStore){
      card = "generalStore";
    }else if(text===this.e.ui.t_library){
      card = "library";
    }else if(text===this.e.ui.t_poolHall){
      card = "poolHall";
    }else if(text===this.e.ui.t_parlor){
      card = "parlor";
    }else  if(text===this.e.ui.t_saloon){
      card = "saloon";
    }else  if(text===this.e.ui.t_sheriffs){
      card = "sheriffs";
    }else  if(text===this.e.ui.t_stables){
      card = "stables";
    }else  if(text===this.e.ui.t_restaurant){
      card = "restaurant";
    }else  if(text===this.e.ui.t_studio){
      card = "studio";
      
    }else  if(text===this.e.ui.t_heartbreak){
      card = "heartbreak";
    }else if(text===this.e.ui.t_knife){
      card = "knife";
    }else if(text===this.e.ui.t_marlboros){
      card = "marlboros";
    }else if(text===this.e.ui.t_midnightStare){
      card = "midnightStare";
    }else if(text===this.e.ui.t_poisonKiss){
      card = "poisonKiss";
    }else if(text===this.e.ui.t_whiskey){
      card = "whiskey";
    }

    return card;

  }

  textureToWords(text){

    var card=null;

    // console.log("----------------------")
    // console.log(text)

    if(text===this.e.ui.t_doc){
      card = "The doc";
    }else if(text===this.e.ui.t_drunk){
      card = "The drunk";
    }else if(text===this.e.ui.t_gunSlinger){
      card = "The gunSlinger";
    }else if(text===this.e.ui.t_madam){
      card = "The madam";
    }else if(text===this.e.ui.t_preacher){
      card = "The preacher";
    }else if(text===this.e.ui.t_tycoon){
      card = "The tycoon";

    }else if(text===this.e.ui.t_generalStore){
      card = "general store";
    }else if(text===this.e.ui.t_library){
      card = "library";
    }else if(text===this.e.ui.t_poolHall){
      card = "pool hall";
    }else if(text===this.e.ui.t_parlor){
      card = "parlor";
    }else  if(text===this.e.ui.t_saloon){
      card = "saloon";
    }else  if(text===this.e.ui.t_sheriffs){
      card = "sheriffs";
    }else  if(text===this.e.ui.t_stables){
      card = "stables";
    }else  if(text===this.e.ui.t_restaurant){
      card = "restaurant";
    }else  if(text===this.e.ui.t_studio){
      card = "studio";
      
    }else  if(text===this.e.ui.t_heartbreak){
      card = "heartbreak";
    }else if(text===this.e.ui.t_knife){
      card = "the knife";
    }else if(text===this.e.ui.t_marlboros){
      card = "the Marlboros";
    }else if(text===this.e.ui.t_midnightStare){
      card = "the midnight stare";
    }else if(text===this.e.ui.t_poisonKiss){
      card = "the poison kiss";
    }else if(text===this.e.ui.t_whiskey){
      card = "the whiskey";
    }

    // console.log(card)

    return card;

  }
  mixer(){

    // console.log("mix")

    if(document.getElementById("mix").checked === true){

        // console.log("mix2")

        this.fogH = document.getElementById("fogH").value;
        this.fogS = document.getElementById("fogS").value;
        this.fogL = document.getElementById("fogL").value;

        document.getElementById("fogColor").value = this.hslToHex(this.fogH,this.fogS,this.fogL);

        this.blackTop.material.color.setHex( "0x"+this.hslToHex(this.fogH,this.fogS,this.fogL) );

        //-------------------------------------

        this.tubeH = document.getElementById("tubeH").value;
        this.tubeS = document.getElementById("tubeS").value;
        this.tubeL = document.getElementById("tubeL").value;

        document.getElementById("tubeColor").value = this.hslToHex(this.tubeH,this.tubeS,this.tubeL);

        //-------------------------------------

        this.chH = document.getElementById("chH").value;
        this.chS = document.getElementById("chS").value;
        this.chL = document.getElementById("chL").value;

        document.getElementById("charColor").value = this.hslToHex(this.chH,this.chS,this.chL);

        //-------------------------------------

        this.blackTop.material.roughness = document.getElementById("test1").value/100;
        this.blackTop.material.metalness = document.getElementById("test2").value/100;
        
      }

    }

    resize3D(){

      console.log("resize")
  
      var width = window.innerWidth;
      var height = window.innerHeight;

      var width = document.documentElement.clientWidth;
      var height = document.documentElement.clientHeight;
  
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      // var canvas = document.getElementById("mycanvas");
      // var devicePixelRatio = window.devicePixelRatio || 1;

      // // set the size of the drawingBuffer based on the size it's displayed.
      // canvas.width = canvas.clientWidth * devicePixelRatio;
      // canvas.height = canvas.clientHeight * devicePixelRatio;

  
      this.renderer.setSize( width, height );
  
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `${f(0)}${f(8)}${f(4)}`;
    }

}