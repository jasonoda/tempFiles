var deltaTime=0;
var lastTime=0;

var action="setUp";
var count=0;
var ready3D = false;

//---setup--------------------------------------------------------------------------------------------------------------

var scene = null;
var renderer = null;
var camera = null;
var loader = null;
var camContX = null;
var camContY = null;
var machCont = null;
var liquidCont = null;

//---textures--------------------------------------------------------------------------------------------------------------

var reflectionTexture = null;
var pngBackground = null;
var machineShadow = null;
var blackGlow = null;
var glassCoffee = null;
var cupDecal3 = null;
var cupDecal4 = null;
var liquidTexture = null;
var liquidMaterial = null;
var bigRedDotText = null;
var redDot = null;

//---models--------------------------------------------------------------------------------------------------------------

var machine = null;
var cup = null;
var cup2 = null;
var cup3 = null;
var plate = null;
var tamper = null;
var capCupModel = null;
var glassModel = null;
var cupWithCoffee = null;
var beans = null;
var capTop = null;
var coffeePot = null;
var milkJar = null;
var pots = null;
var simplePlane = null;
var eCup1 = null;
var eCup2 = null;
var eCup3 = null;
var eCupCont1 = null;
var eCupCont2 = null;
var esp1 = null;
var esp2 = null;
var liquid = null;
var closePlate = null;
var closePlate2 = null;

var eCup1StartPos = new THREE.Vector3( 0, 0, 0 );
var eCup2StartPos = new THREE.Vector3( 0, 0, 0 );

//---primitives--------------------------------------------------------------------------------------------------------------

var floor = null;
var tourBox1 = null;
var tourBox2 = null;
var tourBox3 = null;
var tourBox4 = null;
var tourBox5 = null;
var tourBox6 = null;
var cupBox = null;

//---lights--------------------------------------------------------------------------------------------------------------

var dl = null;

//---numbers--------------------------------------------------------------------------------------------------------------

var dotDelayCount = 0;
var onceDot = true;

//---arrays--------------------------------------------------------------------------------------------------------------


var loaderArray = [];
var loaderArray2 = [];
var tourPoints = [];
var sec2Objects = [];
var sidePieces = [];

//---video--------------------------------------------------------------------------------------------------------------

var videoPlayer = null;
var videoDiv = null;
var redCover = null;

//---tweens--------------------------------------------------------------------------------------------------------------

var introYoYo = null;
var dotYoYo = null;
var landingTween1 = null;
var landingTween2 = null;
var landingTween3 = null;
var histTween = null;

//---containers--------------------------------------------------------------------------------------------------------------

var mainCont = null;
var glassCont = null;
var capCont = null;

//---html--------------------------------------------------------------------------------------------------------------

var specsWindow = null;
var closeSpecs = null;
var socialMediaIcons = null;
var loadingCover = null;
var loadingBar = null;
var loadingBarBack = null;
var videoDivBlack = null;
var fb1 = null;
var fb2 = null;
var playVideoButton = null;
var playVideoDiv = null;
var youtubeIframe = null;
var youtubeDiv = null;
var stepCont = null;
var step1Div = null;
var step2Div = null;
var step3Div = null;
var step4Div = null;
var stepDot1 = null;
var stepDot2 = null;
var stepDot3 = null;
var stepDot4 = null;

//---floats--------------------------------------------------------------------------------------------------------------

var faderAlpha = .9;
var timelineAlpha = 0;
var histPermGoalAlpha = 0;
var histFaderGoalAlpha = 0;
var histFadeDelay = 0;
var objectsLoaded = 0;
var loadPerc = 0;
var topDown = 0;
var liqCount = 0;

//---string--------------------------------------------------------------------------------------------------------------

var videoAction="stopped";

//---bools--------------------------------------------------------------------------------------------------------------

var timelineShow = true;
var timelineLandscape = false;
var histAlphaDown = false;
var moveFader = true;

//---loadchecker--------------------------------------------------------------------------------------------------------------

function loadSomething(data){
//     // console.log("object loaded")
//     if(data!==null && data!==undefined){
//         if(data.target!==null && data!==undefined){
//             // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
//             // console.log(data.target.responseURL)
//             // console.log(data.target)
//             if(data.target.readyState===4){
//                 // objectsLoaded+=1;

//                 var st = data.target.responseURL;
//                 var st2 = st.replace("http://jasonoda.com/temp2020/gaggia2/src/models/","");
//                 var st3 = st2.replace(".glb","");

//                 removeFromArray(loaderArray2, st3);

//                 // console.log("-----------------------------");
//                 // for(var i=0; i<loaderArray2.length; i++){
//                 //     console.log(loaderArray2[i])
//                 // }
//                 // // 

//                 // console.log(objectsLoaded+" M "+st3)
//             }
//         }
//     }
}

function loadTexture(data){

    var st = data.image.src;
    var st2 = st.replace("http://jasonoda.com/temp2020/gaggia2/src/","");
    var st3 = st2.replace("models/maps/","");
    var st4 = st3.replace("img/","");

    console.log(objectsLoaded+" TEXTURE: "+st4)
    objectsLoaded+=1;

}

function loadCubeTexture(data){

    console.log(objectsLoaded+" CUBE TEXTURE")
    objectsLoaded+=1;

}

function managerLoad(obName){

    objectsLoaded+=1;
    console.log(objectsLoaded+" MODEL: "+obName)

    // fb1.innerHTML += "load ";

}

//---update--------------------------------------------------------------------------------------------------------------

function update(){

    if(objectsLoaded!==null && loadingBar!==null){
        document.getElementById("feedback2").innerHTML = objectsLoaded+" / "+loaderArray.length +" / "+loadingBar.style.width+" / "+window.innerWidth;
        document.getElementById("feedback2").style.opacity = 1;
    }
    
    //---deltatime--------------------------------------------------------------------------------------------------------------

    var currentTime = new Date().getTime();
    deltaTime = (currentTime - lastTime) / 1000;
    if (deltaTime > 1) {
      deltaTime = 0;
    }
    lastTime = currentTime;

    //---loop--------------------------------------------------------------------------------------------------------------

    // console.log(action)

    if(fb1!==null){
        // fb2.innerHTML = action;
        // fb2.innerHTML = window.innerWidth+" / "+window.innerHeight+" / "+canvas.width+" / "+canvas.height;
        if(feedBack===false){
            fb1.style.opacity=0;
            fb2.style.opacity=0;
        }else{
            fb1.style.opacity=1;
            fb2.style.opacity=1;
        }
    }

    if(action==="setUp"){

        videoDiv = document.getElementById("videoDiv");
        videoPlayer = document.getElementById("videoPlayer");
        redCover = document.getElementById("redCover");
        socialMediaIcons = document.getElementById("socialMediaIcons");

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,.1, 1000);
        scene.fog = new THREE.Fog(0x1b0101, 4, 24);

        mainCont = new THREE.Group();
        scene.add(mainCont);

        camContX = new THREE.Group();
        camContY = new THREE.Group();
        scene.add(camContX);
        scene.add(camContY);

        camContY.add(camContX)
        camContX.add(camera);
        camera.position.z=6;
        camera.position.y=1.15;

        //---cupbox--------------------------------------------------------------------------------------------------------------

        var cupBoxGeo = new THREE.BoxGeometry( .1, .1, .1 );
        var cupBoxMat = new THREE.MeshBasicMaterial( {color: 0x00ff00, opacity:0} );
        cupBox= new THREE.Mesh( cupBoxGeo, cupBoxMat );

        scene.add( cupBox );
        camContX.add(cupBox)
        cupBox.position.z=4;
        // cupBox.position.y=0;
        // cupBox.position.x=-.3;
        cupBox.material.visible=false;

        //---webgl--------------------------------------------------------------------------------------------------------------

        if(mobile===true){
            renderer = new THREE.WebGLRenderer({antialias:false, powerPreference: "high-performance"})
        }else{
            renderer = new THREE.WebGLRenderer({antialias:true, powerPreference: "high-performance"})
        }
        
        renderer.setClearColor("#1b0101");
        renderer.setSize(window.innerWidth,window.innerHeight);

        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;

        renderer.shadowCameraNear = 3;
        renderer.shadowCameraFar = camera.far;
        renderer.shadowCameraFov = 50;

        renderer.shadowMapBias = 0.0039;
        renderer.shadowMapDarkness = 0.5;
        renderer.shadowMapWidth = 1024;
        renderer.shadowMapHeight = 1024;

        document.body.appendChild(renderer.domElement);

        renderer.outputEncoding = THREE.sRGBEncoding;

        loadingBar=document.getElementById("loadingBar");
        loadingBarBack=document.getElementById("loadingBarBack");
        loadingCover=document.getElementById("loadingCover");
        videoDivBlack=document.getElementById("videoDivBlack");
        fb1=document.getElementById("feedback");
        fb2=document.getElementById("feedback2");
        playVideoButton=document.getElementById("playVideoButton");
        // playVideoDiv=document.getElementById("playVideoDiv");
        youtubeIframe=document.getElementById("youtubeIframe");
        youtubeDiv=document.getElementById("youtubeDiv");
        stepCont=document.getElementById("stepCont");
        step1Div=document.getElementById("step1Div");
        step2Div=document.getElementById("step2Div");
        step3Div=document.getElementById("step3Div");
        step4Div=document.getElementById("step4Div");
        stepDot1=document.getElementById("stepDot1");
        stepDot2=document.getElementById("stepDot2");
        stepDot3=document.getElementById("stepDot3");
        stepDot4=document.getElementById("stepDot4");

        action="load";
// 
    }else if(action==="load"){

        /*
        var pmremGenerator = new THREE.PMREMGenerator( renderer );
		pmremGenerator.compileEquirectangularShader();

        new THREE.TextureLoader().load( './src/models/maps/equirectangular.png', function ( texture ) {

            texture.encoding = THREE.sRGBEncoding;

            pngCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );

            pngBackground = pngCubeRenderTarget.texture;

            texture.dispose();

        } );
        */

        //---loadtextures--------------------------------------------------------------------------------------------------------------

        loaderArray.push("IM liquidTexture");
        loaderArray.push("IM machineShadow");
        loaderArray.push("IM cupDecal3");
        loaderArray.push("IM cupDecal4");
        loaderArray.push("IM espTexture");
        loaderArray.push("IM blackGlow");
        loaderArray.push("IM glassCoffee");
        loaderArray.push("IM capTop");
        // loaderArray.push("IM bigRedDot");
        
        liquidTexture = new THREE.TextureLoader().load( './src/models/maps/liquidTexture.png', loadTexture);
        machineShadow = new THREE.TextureLoader().load( './src/models/maps/machineShadow.png', loadTexture);
        cupDecal = new THREE.TextureLoader().load( './src/models/maps/cupDecal2.jpg', loadTexture);
        cupDecal3 = new THREE.TextureLoader().load( './src/models/maps/cupDecal3.png', loadTexture);
        cupDecal4 = new THREE.TextureLoader().load( './src/models/maps/cupDecal4.png', loadTexture);
        blackGlow = new THREE.TextureLoader().load( './src/img/blackGlow.png', loadTexture);
        glassCoffee = new THREE.TextureLoader().load( './src/img/coffeeTest.png', loadTexture);
        capTop = new THREE.TextureLoader().load( './src/img/capTop.png', loadTexture);
        // bigRedDotText = new THREE.TextureLoader().load( './src/img/bigRedCircle.png', loadTexture);

        liquidTexture.wrapS = liquidTexture.wrapT = THREE.RepeatWrapping;
        liquidTexture.offset.set( 0, 0 );
        liquidTexture.repeat.set( 2, 2 );

        // var redDotGeo = new THREE.PlaneGeometry( 1.2, 1.2, 1 );
        // var redDotMat = new THREE.MeshBasicMaterial( {map:bigRedDotText, transparent: true, opacity:0} );
        // redDot = new THREE.Mesh( redDotGeo, redDotMat );
        // scene.add( redDot );
        // camContX.add( redDot )
        // redDot.position.x=0;
        // redDot.position.y=1.15;
        // redDot.position.z=3;
        
       //---loadskybox--------------------------------------------------------------------------------------------------------------

        loaderArray.push("IM reflectionTexture");

        var loader = new THREE.CubeTextureLoader();
        loader.name="skyboxLoaderName";

        reflectionTexture = loader.load([
        './src/models/skybox/pos-x.png',
        './src/models/skybox/neg-x.png',
        './src/models/skybox/pos-y.png',
        './src/models/skybox/neg-y.png',
        './src/models/skybox/pos-z.png',
        './src/models/skybox/neg-z.png',
        ], loadCubeTexture);

        //---loadmachine--------------------------------------------------------------------------------------------------------------

        loaderArray.push("coffeeMachine");

        var manager2 = new THREE.LoadingManager(); manager2.onLoad = function ( ) { managerLoad("coffeeMachine") };

        var loader2 = new THREE.GLTFLoader(manager2);

        machCont = new THREE.Group();
        scene.add(machCont);

        loader2.load( './src/models/coffeeMachine.glb', gltf => {

            scene.add( gltf.scene );
            machine = gltf.scene;
            machCont.add(machine);

            gltf.scene.traverse( function( object ) {
// 
                if ( object.isMesh ){
                    // console.log("machpart")
                    if(object.material!==null){
                        //  console.log(object.name);
                        // console.log("-->"+object.material.name);
                        //  console.log(object.material);
                        if(object.material.name==="chrome" || object.material.name==="chrome2" || object.material.name==="chrome3"  ||  object.material.name==="buttons1"){
                            
                            var materialShine = new THREE.MeshLambertMaterial( {color: 0xcccccc, envMap: reflectionTexture} );
                            object.material=materialShine;
                        
                        }else if(  object.material.name==="buttons2" || object.material.name==="buttons3"){

                            var materialShine2 = new THREE.MeshLambertMaterial( {color: 0x000000, envMap: reflectionTexture} );
                            object.material=materialShine2;

                        }else if(object.material.name==="gaggiaText"){

                            var materialShine2 = new THREE.MeshLambertMaterial( {color: 0xffffff, envMap: reflectionTexture} );
                            object.material=materialShine2;
                        
                        }else if(object.material.name==="glass"){
                            
                            var glassMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, opacity:.5, transparent: true, envMap: reflectionTexture} );
                            object.material=glassMaterial;

                        }else if(object.material.name==="redLights"){
                            
                            var glassMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000, opacity:1, transparent: true, envMap: reflectionTexture} );
                            object.material=glassMaterial;

                        }else if(object.material.name==="plastic" || object.material.name==="rubber" || object.material.name==="sideBlack"){
                            
                            var rubberMaterial = new THREE.MeshLambertMaterial( {color: 0x050505, opacity:1, transparent: true, envMap: reflectionTexture} );
                            rubberMaterial.metalness=1;
                            rubberMaterial.roughness=1;
                            rubberMaterial.envMapIntensity=3;
                            object.material=rubberMaterial;
                            
                        }

                        object.castShadow=true;
                        object.receiveShadow=true;

                        machine.scale.x=3;
                        machine.scale.y=3;
                        machine.scale.z=3;

                        mainCont.add(machCont);
                    }
                    
                        
                } 
                
            });

        }, loadSomething);

        //---loadcup--------------------------------------------------------------------------------------------------------------

        var manager3 = new THREE.LoadingManager(); manager3.onLoad = function ( ) { managerLoad("cup") };

        loaderArray.push("cup");

        var loader3 = new THREE.GLTFLoader(manager3);
        loader3.load('./src/models/cup.glb', gltf => {  

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    cupWithCoffee=gltf.scene;

                    if(object.name==="cup"){

                        cup2=object;
                        var materialShine = new THREE.MeshStandardMaterial( {color: 0xcccccc, envMap: reflectionTexture} );
                        materialShine.metalness=.5;
                        materialShine.roughness=.4;
                        materialShine.map = cupDecal;
                        materialShine.envMapIntensity=1;
                        object.material = materialShine;
                        materialShine.needsUpdate = true;

                    }else if(object.name==="coffee"){

                        cup3=object;
                        var espMat = new THREE.MeshStandardMaterial( {color: 0x666666, envMap: reflectionTexture, map: cupDecal4} );
                        object.material = espMat;

                    }

                    
                }

            });
            
        }, loadSomething);

        //---loadplate--------------------------------------------------------------------------------------------------------------

        loaderArray.push("plate");

        var manager4 = new THREE.LoadingManager(); manager4.onLoad = function ( ) { managerLoad("plate") };

        var loader4 = new THREE.GLTFLoader(manager4);
        loader4.load('./src/models/plate.glb', gltf => {  

            plate = gltf.scene;

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    if(object.material.name==="whitePart"){
                        var materialShine = new THREE.MeshStandardMaterial( {color: 0x999999, envMap: reflectionTexture} );
                        materialShine.metalness=.5;
                        materialShine.roughness=.4;
                        materialShine.envMapIntensity=1;
                        object.material = materialShine;
                        object.receiveShadow=true;
                        object.castShadow=true;
                        materialShine.needsUpdate = true;
                    }else{
                        var materialShine = new THREE.MeshLambertMaterial( {color: 0x444444, } );
                        materialShine.metalness=0;
                        materialShine.roughness=1;
                        materialShine.envMapIntensity=0;
                        object.material = materialShine;
                        object.receiveShadow=true;
                        object.castShadow=true;
                        materialShine.needsUpdate = true;
                    }

                }

            });

        }, loadSomething);
        
        //---glass--------------------------------------------------------------------------------------------------------------

        loaderArray.push("glass");

        var manager5 = new THREE.LoadingManager(); manager5.onLoad = function ( ) { managerLoad("glass") };

        glassCont = new THREE.Group();
        scene.add(glassCont);

        var loader5 = new THREE.GLTFLoader(manager5);
        loader5.load('./src/models/glass.glb', gltf => {  

            gltf.scene.traverse( function( object ) {

                glassModel = gltf.scene;
                
                if ( object.isMesh ){

                    // console.log(object.geometry)

                    if(object.name==="glass"){

                        var materialGlass = new THREE.MeshBasicMaterial( { transparent:true, opacity: .15, refractionRatio: 0.985 } );
                        
                        materialGlass.envMap=reflectionTexture;
                        object.material = materialGlass;

                        sec2Objects.push(object)

                    }else if(object.name==="coffee"){

                        var materialCoffee = new THREE.MeshLambertMaterial( {color: 0x999999, transparent:true} );
                        materialCoffee.map=glassCoffee;
                        object.material = materialCoffee;
                        sec2Objects.push(object)

                    }

                    object.receiveShadow=true;

                }
                
            });

            scene.add( gltf.scene );
            glassCont.add(gltf.scene);

            mainCont.add(glassCont);
            glassCont.position.x=10;
            glassCont.position.z=-.5;
            glassCont.position.y=.555;

            glassCont.scale.set(1,1,1)

        }, loadSomething);

        //---capCup--------------------------------------------------------------------------------------------------------------

        loaderArray.push("capCup");

        var manager6 = new THREE.LoadingManager(); manager6.onLoad = function ( ) { managerLoad("capCup") };

        capCont = new THREE.Group();
        scene.add(capCont);

        var loader6 = new THREE.GLTFLoader(manager6);
        loader6.load('./src/models/capCup.glb', gltf => {  

            gltf.scene.traverse( function( object ) {
                
                capCupModel = gltf.scene;
                
                if ( object.isMesh ){

                    if(object.name==="cup"){

                        var materialShine = new THREE.MeshStandardMaterial( {color: 0xcccccc, envMap: reflectionTexture} );
                        materialShine.metalness=.6;
                        materialShine.roughness=0;
                        materialShine.envMapIntensity=1;
                        object.material = materialShine;
                        materialShine.needsUpdate = true;
                        object.rotation.z=-2.5;

                        sec2Objects.push(object)

                    }else if(object.name==="saucer"){

                        var materialShine = new THREE.MeshStandardMaterial( {color: 0xcccccc, envMap: reflectionTexture} );
                        materialShine.metalness=.6;
                        materialShine.roughness=.2;
                        materialShine.envMapIntensity=1;
                        object.material = materialShine;
                        materialShine.needsUpdate = true;

                        sec2Objects.push(object)

                    }else if(object.name==="coffee"){

                        var materialCoffee = new THREE.MeshLambertMaterial( {color: 0x999999} );
                        materialCoffee.map = capTop;
                        object.material = materialCoffee;

                        sec2Objects.push(object)

                    }

                    object.castShadow=true;
                    object.receiveShadow=true;

                }
                
            });

            scene.add( gltf.scene );
            capCont.add(gltf.scene);

            mainCont.add(capCont);
            capCont.position.x=11.2;
            capCont.position.z=-.5;
            capCont.position.y=0.1;

            capCont.scale.set(15,15,15)
            
        }, loadSomething);

        //---tamper--------------------------------------------------------------------------------------------------------------

        loaderArray.push("tamper");

        var manager7 = new THREE.LoadingManager(); manager7.onLoad = function ( ) { managerLoad("tamper") };

        var loader7 = new THREE.GLTFLoader(manager7);
        loader7.load('./src/models/tamper.glb', gltf => {  

            tamper = gltf.scene;

            gltf.scene.traverse( function( object ) {
                if ( object.isMesh ){

                    if(object.material.name==="blackTamper"){

                        var rubberMaterial = new THREE.MeshStandardMaterial( {color: 0x000000, opacity:1, transparent: true, envMap: reflectionTexture} );
                        rubberMaterial.metalness=.5;
                        rubberMaterial.roughness=0;
                        rubberMaterial.envMapIntensity=.3;
                        object.material=rubberMaterial;

                    }else if(object.material.name==="redTamper"){

                        var rubberMaterial = new THREE.MeshStandardMaterial( {color: 0x510000, opacity:1, transparent: true, envMap: reflectionTexture} );
                        rubberMaterial.metalness=.5;
                        rubberMaterial.roughness=0;
                        // rubberMaterial.envMapIntensity=1;
                        object.material=rubberMaterial;
                        
                    }else if(object.material.name==="chromeTamper"){

                        var materialShine = new THREE.MeshStandardMaterial( {color: 0x999999, envMap: reflectionTexture} );
                        materialShine.metalness=1;
                        materialShine.roughness=.25;
                        object.material=materialShine;
                        
                    }

                    object.castShadow=true;
                    // materialShine.needsUpdate = true;

                }

                tamper.scale.set(.17,.17,.17)
                scene.add( gltf.scene );
                machCont.add(gltf.scene);
                tamper.position.z=.9;
                tamper.position.x=-.7;
                
            });

        }, loadSomething);
        
        //---beans--------------------------------------------------------------------------------------------------------------

        loaderArray.push("beans");
        
        var manager8 = new THREE.LoadingManager(); manager8.onLoad = function ( ) { managerLoad("beans") };

        var loader8 = new THREE.GLTFLoader(manager8);
        loader8.load('./src/models/beans.glb', gltf => {  

            beans = gltf.scene;

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    if(object.material.name==="bagMaterial"){

                        object.material.metalness=.5;
                        object.material.roughness=0;
                        object.material.envMap=reflectionTexture;
                        object.material.transparent=true;
                        sidePieces.push(object);
                        // console.log(object)

                    }

                    object.castShadow=true;
                   
                }

                beans.scale.set(.04,.04,.04)
                scene.add( gltf.scene );
                machCont.add(gltf.scene);
                beans.position.z=-.4;
                beans.position.x=-2.51;
                beans.rotation.y=.3;

            });

        }, loadSomething);
        
        //---simpleplane--------------------------------------------------------------------------------------------------------------

        loaderArray.push("plane");

        var manager9 = new THREE.LoadingManager(); manager9.onLoad = function ( ) { managerLoad("plane") };

        var loader9 = new THREE.GLTFLoader(manager9);
        loader9.load('./src/models/plane.glb', gltf => {  

            gltf.scene.traverse( function( object ) {
                if ( object.isMesh ){

                    // console.log("simplePlane!")
                    simplePlane=object;

                }
            });
            
        }, loadSomething
        );
        
        //---milkjar--------------------------------------------------------------------------------------------------------------

        loaderArray.push("milkJar");

        var manager10 = new THREE.LoadingManager(); manager10.onLoad = function ( ) { managerLoad("milkJar") };

        var loader10 = new THREE.GLTFLoader(manager10);
        loader10.load('./src/models/milkJar.glb', gltf => {  

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    var materialShine = new THREE.MeshStandardMaterial( {color: 0x999999, envMap: reflectionTexture, transparent: true} );
                    materialShine.metalness=1;
                    materialShine.roughness=.25;
                    materialShine.envMap=reflectionTexture;

                    object.material=materialShine;
                    object.castShadow=true;

                    milkJar=object;

                    sidePieces.push(object);

                }

                object.scale.set(.4,.4,.4)
                object.rotation.y=-0.3;
                object.position.x=1.4;
                object.position.z=-.4;
                object.position.y=.007;

                

                scene.add( gltf.scene );
                machCont.add(gltf.scene);
                
            });

        }, loadSomething);
        
        //---coffeepot--------------------------------------------------------------------------------------------------------------

        loaderArray.push("coffeePot");

        var manager11 = new THREE.LoadingManager(); manager11.onLoad = function ( ) { managerLoad("coffeePot") };

        var loader11 = new THREE.GLTFLoader(manager11);
        loader11.load('./src/models/coffeePot.glb', gltf => {  

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    if(object.material.name==="chrome"){

                        var materialShine = new THREE.MeshStandardMaterial( {color: 0x999999, transparent: true, envMap: reflectionTexture} );
                        materialShine.metalness=1;
                        materialShine.roughness=.15;
                        materialShine.envMap=reflectionTexture;
                        object.material=materialShine;

                    }else  if(object.material.name==="rubber"){

                        var rubberMaterial = new THREE.MeshLambertMaterial( {color: 0x050505, opacity:1, transparent: true, envMap: reflectionTexture} );
                        rubberMaterial.metalness=1;
                        rubberMaterial.roughness=1;
                        rubberMaterial.envMapIntensity=3;
                        object.material=rubberMaterial;
    
                    }else  if(object.material.name==="bottom"){

                        var rubberMaterial = new THREE.MeshStandardMaterial( {color: 0x000000, opacity:1, transparent: true, envMap: reflectionTexture} );
                        rubberMaterial.metalness=.5;
                        rubberMaterial.roughness=.2;
                        rubberMaterial.envMapIntensity=.3;
                        object.material=rubberMaterial;
    
                    }

                    object.castShadow=true;
                    object.receiveShadow=true;

                    sidePieces.push(object);

                    coffeePot=object;

                }

                object.scale.set(.53,.53,.53)
                object.rotation.y=-0.6;
                object.position.x=1.15;
                object.position.z=-1.35;
                
                scene.add( gltf.scene );
                machCont.add(gltf.scene);
                
            });

        }, loadSomething);

        //---spoon--------------------------------------------------------------------------------------------------------------

        loaderArray.push("spoon");

        var manager12 = new THREE.LoadingManager(); manager12.onLoad = function ( ) { managerLoad("spoon") };

        var loader12 = new THREE.GLTFLoader(manager12);
        loader12.load('./src/models/spoon.glb', gltf => {  

            gltf.scene.traverse( function( object ) {

                if ( object.isMesh ){

                    var materialShine = new THREE.MeshStandardMaterial( {color: 0x222222, transparent: true, envMap: reflectionTexture} );
                    materialShine.metalness=1;
                    materialShine.roughness=0;
                    materialShine.envMap=reflectionTexture;
                    object.material=materialShine;

                    object.castShadow=true;
                    object.receiveShadow=true;

                    sidePieces.push(object);

                    coffeePot=object;

                }

                object.scale.set(.43,.43,.43)
                object.rotation.y=0.4;
                object.position.x=.9;
                object.position.z=.8;
                
                scene.add( gltf.scene );
                machCont.add(gltf.scene);
                
            });

        }, loadSomething);

        //---liquid--------------------------------------------------------------------------------------------------------------

        loaderArray.push("liquid");

        var manager13 = new THREE.LoadingManager(); manager13.onLoad = function ( ) { managerLoad("liquid2") };
// 
        var loader13 = new THREE.GLTFLoader(manager13);
        // loader13.load('./src/models/liquid.glb', gltf => {  
        loader13.load('./src/models/liquid2.glb', gltf => {  

            if(gltf!==null){

                console.log(gltf.scene)

                gltf.scene.traverse( function( object ) {

                    if(object!==undefined){

                        if ( object.isMesh ){

                            console.log("liquid2 "+object.name)

                            // liquidMaterial = new THREE.MeshPhongMaterial( {color: 0x614836, map: liquidTexture } );
                            liquidMaterial = new THREE.MeshPhongMaterial( {color: 0x614836, map: liquidTexture, transparent: true } );
                            // liquidMaterial.map.repeat.set(200, 200);
                            object.material=liquidMaterial;
                            object.material.map.offset.y=-.5;
                            object.material.visible=false;

                            object.castShadow=true;
                            object.receiveShadow=true;

                            liquid=object;

                        }

                        // gltf.scene.scale.set(.6,.6,.6)
                        object.scale.set(.36,.4,.15)
                        // object.scale.set(2.6,2.6,2.6)
                        // object.rotation.y=0.4;
                        // object.position.x=.9;
                        // object.position.y=-.075;
                        // object.position.z=-1.082;
                        object.position.y=.94;
                        object.position.z=.395;
                        
                        scene.add( object );
                        machCont.add(object);

                    }
                    
                });

            }

        }, loadSomething);

        for(var i=0; i<loaderArray.length; i++){
            // console.log("waiting for: "+loaderArray[i]);
        }

        for(var i=0; i<loaderArray.length; i++){
            loaderArray2.push(loaderArray[i]);
        }

        action="waitLoad";

    }else if(action==="waitLoad"){

        //---load checker--------------------------------------------------------------------------------------------------------------

        // console.log(objectsLoaded+" / "+loaderArray.length);

        var perc = window.innerWidth*(objectsLoaded/loaderArray.length);
        loadPerc = lerp(loadPerc, perc, dt*2);
        if(mobile===true){
            loadPerc = perc;
        }
        loadingBar.style.width = Math.round(loadPerc)+"px";
        
        // console.log(loadPerc/window.innerWidth)

        if(objectsLoaded===loaderArray.length && simplePlane!==null && (loadPerc/window.innerWidth)>.999){
            action="setScene";
            resize3D();
            loadingBar.style.opacity=1;
        }


    }else if(action==="setScene"){

        //-----------------------------------------------------------------------------------------------------------------
        //-------LIGHTS----------------------------------------------------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------

        //---amblight--------------------------------------------------------------------------------------------------------------

        var light = new THREE.AmbientLight( 0x666666 );
        scene.add( light );

        //---dirlight--------------------------------------------------------------------------------------------------------------
        
        dl = new THREE.DirectionalLight(0xffffff, 1);
        dl.position.z=3;
        dl.position.y=3;
        if(mobile===false){
            dl.castShadow=true;
        }
        scene.add(dl);
        
        dl.shadow.mapSize.width = 1024;
        dl.shadow.mapSize.height = 1024;
        
        var sSize = 4;
        dl.shadow.camera.near = 0.5;
        dl.shadow.camera.far = 9;
        dl.shadow.camera.left = -sSize;
        dl.shadow.camera.right = sSize;
        dl.shadow.camera.top = sSize;
        dl.shadow.camera.bottom = -sSize;
        dl.shadow.radius = 2;

        //---light helper--------------------------------------------------------------------------------------------------------------

        //  var helper = new THREE.CameraHelper( dl.shadow.camera );
        //  scene.add( helper );

        //---shadow plane--------------------------------------------------------------------------------------------------------------

        var shadGeo = new THREE.PlaneGeometry( 9, 9, 111 );
        var shadMat = new THREE.MeshBasicMaterial( {map:machineShadow, transparent: true} );
        shadMat.depthWrite = false
        shadMat.depthTest = true
        var shadMach = new THREE.Mesh( shadGeo, shadMat );
        shadMach.position.y=.01;
        shadMach.rotation.x=-1.57;
        scene.add( shadMach );
        machCont.add(shadMach);
        
        
        //---bag shadow--------------------------------------------------------------------------------------------------------------

        var shadGeo2 = new THREE.PlaneGeometry( 1.2, 1.2, 10 );
        var shadMat2 = new THREE.MeshBasicMaterial( {map:blackGlow, transparent: true, opacity:.55} );

        shadMat2.depthWrite = false
        shadMat2.depthTest = true
        var shad1 = new THREE.Mesh( shadGeo2, shadMat2 );

        scene.add( shad1 );
       
        shad1.position.y=.01;
        shad1.position.x=beans.position.x;
        shad1.position.z=beans.position.z;
        shad1.rotation.x=-1.57;
        
        sidePieces.push(shad1);
        mainCont.add(shad1);
        
        //---jar shadow--------------------------------------------------------------------------------------------------------------

        var shadGeo = new THREE.PlaneGeometry( 1.2, 1.2, 10 );
        var shadMat3 = new THREE.MeshBasicMaterial( {map:blackGlow, transparent: true, opacity:.55} );

        shadMat3.depthWrite = false
        shadMat3.depthTest = true
        var shad2 = new THREE.Mesh( shadGeo, shadMat3 );
        scene.add( shad2 );
       
        shad2.position.y=.005;
        shad2.position.x=milkJar.position.x+.75;
        shad2.position.z=milkJar.position.z+.2;
        shad2.rotation.x=-1.57;
        
        sidePieces.push(shad2);
        mainCont.add(shad2);
        
        //---pot shadow--------------------------------------------------------------------------------------------------------------

        var shadGeo = new THREE.PlaneGeometry( 2.8, 2.8, 10 );
        var shadMat3 = new THREE.MeshBasicMaterial( {map:blackGlow, transparent: true,  opacity:.95} );

        shadMat3.depthWrite = false
        shadMat3.depthTest = true
        var shad3 = new THREE.Mesh( shadGeo, shadMat3 );
        scene.add( shad3 );
       
        shad3.position.y=.015;
        shad3.position.x=2.65;
        shad3.position.z=-1.2;
        shad3.rotation.x=-1.57;

        console.log("shad: "+shad3.position.x)
        console.log("shad: "+shad3.position.z)
        
        sidePieces.push(shad3);
        mainCont.add(shad3);
        
        //---floor--------------------------------------------------------------------------------------------------------------

        var floorGeo = new THREE.BoxGeometry( 111, 1, 111, 100 );
        var floorMat = new THREE.MeshLambertMaterial  ( {color: 0x1b0101, roughness:0} );

        floor = new THREE.Mesh( floorGeo, floorMat );
        scene.add( floor );
        floor.position.y=-.5;
        floor.receiveShadow = true;

        //---placeholdersection2--------------------------------------------------------------------------------------------------------------
        
        // var phGeo = new THREE.BoxGeometry( 1, 1, 1 );
        // var phMat = new THREE.MeshLambertMaterial( {color: 0x333333} );
        // var placeHolder = new THREE.Mesh( phGeo, phMat );
        // scene.add( placeHolder ); placeHolder.position.x=20; placeHolder.position.y=0; placeHolder.position.z=-1;
        
        //---tourBox1--------------------------------------------------------------------------------------------------------------

        var tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        var tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox1 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox1 ); tourBox1.position.x=1.42; tourBox1.position.y=1; tourBox1.position.z=.61;
        machCont.add(tourBox1); tourPoints.push(tourBox1);

        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox2 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox2 ); tourBox2.position.x=0.02; tourBox2.position.y=1.07; tourBox2.position.z=.75;
        machCont.add(tourBox2); tourPoints.push(tourBox2);
        
        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox3 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox3 ); tourBox3.position.x=.3; tourBox3.position.y=1.65; tourBox3.position.z=.75;
        machCont.add(tourBox3); tourPoints.push(tourBox3);
        
        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox4 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox4 ); tourBox4.position.x=-.7; tourBox4.position.y=.3; tourBox4.position.z=.9;
        machCont.add(tourBox4); tourPoints.push(tourBox4);
        
        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox5 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox5 ); tourBox5.position.x=-.2; tourBox5.position.y=2.1; tourBox5.position.z=.15;
        machCont.add(tourBox5); tourPoints.push(tourBox5);
        
        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox6 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox6 ); tourBox6.position.x=-1.2; tourBox6.position.y=1.58; tourBox6.position.z=.75;
        machCont.add(tourBox6); tourPoints.push(tourBox6);
        
        //---tourBox2--------------------------------------------------------------------------------------------------------------

        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox7 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox7 ); tourBox7.position.x=8.8; tourBox7.position.y=.5; tourBox7.position.z=-.5;
        machCont.add(tourBox7); tourPoints.push(tourBox7);

        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox8 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox8 ); tourBox8.position.x=10; tourBox8.position.y=1.55; tourBox8.position.z=-.5;
        machCont.add(tourBox8); tourPoints.push(tourBox8);

        tbGeo = new THREE.BoxGeometry( .05, .05, .05 );
        tbMat = new THREE.MeshLambertMaterial( {color: 0x333333, visible:false} );
        tourBox9 = new THREE.Mesh( tbGeo, tbMat );
        scene.add( tourBox9 ); tourBox9.position.x=11.2; tourBox9.position.y=.75; tourBox9.position.z=-.5;
        machCont.add(tourBox9); tourPoints.push(tourBox9);

        //---cups--------------------------------------------------------------------------------------------------------------

        for(var i=0; i<8; i++){
            for(var j=0; j<4; j++){
                if(i===0 && j===2){
                    //no cup
                }else{
                    var newCup = cup2.clone();
                    newCup.position.y=2.05;
                    newCup.rotation.y=ca(90);
                    newCup.scale.x=2.7;
                    newCup.scale.y=2.7;
                    newCup.scale.z=2.7;
                    scene.add(newCup);
                    var extra=0;
                    if(j%2===0){
                        extra=.15;
                    }
                    newCup.position.x=(i*-.24)+.35+extra;
                    newCup.position.z=j*-.24+.05;
                    newCup.castShadow=true;
                    newCup.receiveShadow=true;
                    machCont.add(newCup);

                    if(j===0 && i===2){
                        eCup1=newCup;
                        eCup1StartPos.copy(eCup1.position);
                    }
                    if(j===0 && i===3){
                        eCup2=newCup;
                        eCup2StartPos.copy(eCup2.position);
                    }

                    newCup.material.opacity=.3;
                }
            }
        }

        //---movablecups--------------------------------------------------------------------------------------------------------------

        eCupCont1 = new THREE.Group();
        eCupCont1.add(eCup1);

        eCup1.position.x=0;
        eCup1.position.y=0;
        eCup1.position.z=0;

        esp1 = cup3.clone();
        esp1.position.x = 0;
        esp1.position.y = .1;
        esp1.position.z = 0;
        esp1.scale.x=2.2;
        esp1.scale.y=2.2;
        esp1.scale.z=2.2;

        scene.add(esp1);
        eCupCont1.add(esp1);
        scene.add(eCupCont1);
        machCont.add(eCupCont1);

        eCupCont1.position.x=eCup1StartPos.x;
        eCupCont1.position.y=eCup1StartPos.y;
        eCupCont1.position.z=eCup1StartPos.z;
        
        //---movablecups--------------------------------------------------------------------------------------------------------------

        eCupCont2 = new THREE.Group();
        eCupCont2.add(eCup2);

        eCup2.position.x=0;
        eCup2.position.y=0;
        eCup2.position.z=0;

        esp2 = cup3.clone();
        esp2.position.x = 0;
        esp2.position.y = .1;
        esp2.position.z = 0;
        esp2.scale.x=2.2;
        esp2.scale.y=2.2;
        esp2.scale.z=2.2;
        esp2.rotation.y=3.14;

        scene.add(esp2);
        eCupCont2.add(esp2);
        scene.add(eCupCont2);
        machCont.add(eCupCont2);

        eCupCont2.position.x=eCup2StartPos.x;
        eCupCont2.position.y=eCup2StartPos.y;
        eCupCont2.position.z=eCup2StartPos.z;

        closePlate = plate.clone();
        closePlate.position.y=-.5;
        closePlate.scale.x=3.7;
        closePlate.scale.y=3.7;
        closePlate.scale.z=3.7;
        closePlate.castShadow=true;
        closePlate.receiveShadow=true;
        scene.add(closePlate);
        closePlate.position.x=0;
        closePlate.position.z=1;
        closePlate.position.y=-3;

        closePlate2 = plate.clone();
        closePlate2.scale.x=3.7;
        closePlate2.scale.y=3.7;
        closePlate2.scale.z=3.7;
        closePlate2.castShadow=true;
        closePlate2.receiveShadow=true;
        scene.add(closePlate2);
        closePlate2.position.x=0;
        closePlate2.position.z=9;
        closePlate2.position.y=0.02;
        mainCont.add(closePlate2);
        
        
        //---plates--------------------------------------------------------------------------------------------------------------

        for(var i=0; i<8; i++){
            var newPlate = plate.clone();
            newPlate.position.y=1.95+(i*.03);
            newPlate.position.x=1.2;
            newPlate.position.z=-.08;
            newPlate.scale.x=3.7;
            newPlate.scale.y=3.7;
            newPlate.scale.z=3.7;
            scene.add(newPlate);
            newPlate.castShadow=true;
            newPlate.receiveShadow=true;
            machCont.add(newPlate);
        }

        for(var i=0; i<8; i++){
            var newPlate = plate.clone();
            newPlate.position.y=1.95+(i*.03);
            newPlate.position.x=1.1;
            newPlate.position.z=-.58;
            newPlate.scale.x=3.7;
            newPlate.scale.y=3.7;
            newPlate.scale.z=3.7;
            scene.add(newPlate);
            newPlate.castShadow=true;
            newPlate.receiveShadow=true;
            machCont.add(newPlate);
        }

        for(var i=0; i<8; i++){
            var newPlate = plate.clone();
            newPlate.position.y=1.95+(i*.03);
            newPlate.position.x=.75;
            newPlate.position.z=-.26;
            newPlate.scale.x=3.7;
            newPlate.scale.y=3.7;
            newPlate.scale.z=3.7;
            scene.add(newPlate);
            newPlate.castShadow=true;
            newPlate.receiveShadow=true;
            machCont.add(newPlate);
        }

        //---section2--------------------------------------------------------------------------------------------------------------
        
        //---drink1--------------------------------------------------------------------------------------------------------------
        
        var drinkZ = -.5;

        var cs=1.3;

        var drink1 = cupWithCoffee.clone();
        drink1.rotation.y=ca(90);
        drink1.scale.x=2.7*cs;
        drink1.scale.y=2.7*cs;
        drink1.scale.z=2.7*cs;
        scene.add(drink1);
        drink1.position.x=8.8;
        drink1.position.z=drinkZ;
        drink1.position.y=.19;
        drink1.rotation.x=3.14;
        drink1.rotation.y=-1.5;
        drink1.castShadow=true;
        // drink1.receiveShadow=true;
        mainCont.add(drink1);

        sec2Objects.push(drink1);

        var newPlate = plate.clone();
        newPlate.position.y=0.05;
        newPlate.position.x=8.8;
        newPlate.position.z=drinkZ;
        newPlate.scale.x=3.7*cs;
        newPlate.scale.y=3.7*cs;
        newPlate.scale.z=3.7*cs;
        scene.add(newPlate);
        newPlate.castShadow=true;
        newPlate.receiveShadow=true;
        mainCont.add(newPlate);

        sec2Objects.push(newPlate);

        var shadGeo = new THREE.PlaneGeometry( 1.2, 1.2, 1 );
        var shadMat = new THREE.MeshBasicMaterial( {map:blackGlow,transparent: true,opacity:.75} );
        var shad = new THREE.Mesh( shadGeo, shadMat );
        scene.add( shad );
        shad.position.y=.01;
        shad.position.x=8.8;
        shad.rotation.x=-1.57;
        shad.position.z=drinkZ;
        shad.receiveShadow=true;
        mainCont.add(shad);

        sec2Objects.push(shad);

        //---drink2--------------------------------------------------------------------------------------------------------------
        
        var shadGeo = new THREE.PlaneGeometry( 1.2, 1.2, 1 );
        var shadMat = new THREE.MeshBasicMaterial( {map:blackGlow,transparent: true,opacity:.75} );
        var shad = new THREE.Mesh( shadGeo, shadMat );
        scene.add( shad );
        shad.position.y=.01;
        shad.position.x=10;
        shad.rotation.x=-1.57;
        shad.position.z=drinkZ;
        // shad.opacity=.1;
        shad.receiveShadow=true;
        mainCont.add(shad);

        sec2Objects.push(shad);

        //---drink3--------------------------------------------------------------------------------------------------------------
        
        var shadGeo = new THREE.PlaneGeometry( 1.2, 1.2, 1 );
        var shadMat = new THREE.MeshBasicMaterial( {map:blackGlow,transparent: true,opacity:.75} );
        var shad = new THREE.Mesh( shadGeo, shadMat );
        scene.add( shad );
        shad.position.y=.01;
        shad.position.x=11.2;
        shad.rotation.x=-1.57;
        shad.position.z=drinkZ;
        shad.receiveShadow=true;
        mainCont.add(shad);

        sec2Objects.push(shad);

        for(var i=0; i<sec2Objects.length; i++){
            sec2Objects[i].visible=false;
        }

        for(var i=0; i<sidePieces.length; i++){
            if(sidePieces[i]!==null){
                if(sidePieces[i].material!==null){
                    sidePieces[i].material.opacity=0;
                    sidePieces[i].material.visible=false;
                }
            }
        }

        action="fadeLoaders1";

    }else if(action==="fadeLoaders1"){

        loadingBarBack.style.opacity=0;
        inc(loadingBar, "opacity", -1*dt)
        if(loadingBar.style.opacity<0){
            loadingBar.style.opacity=0;
        }

        if(loadingBar.style.opacity==="0"){
            action="toLanding";
            loadingCover.width = window.innerWidth+"px";
            loadingCover.height = window.innerHeight+"px";
        }

    }else if(action==="fadeLoaders2"){

        topDown = lerp(topDown, window.innerHeight+5, dt*1);
        loadingCover.style.setProperty("top", topDown+"px");

        if(topDown>window.innerHeight){
            loadingCover.style.setProperty("opacity", "0");
            action="toLanding";
        }

    }else if(action==="toLanding"){
    
        //---timeline--------------------------------------------------------------------------------------------------------------
        
        destRotation = { x: -.3, y: .7 };

        landingTween1 = new TimelineMax();
        landingTween1.to(introType1, 1, {delay: 0, top:240, opacity:1,  ease: Circ.easeOut})
        landingTween2 = new TimelineMax();
        landingTween2.to(introType2, 1, {delay: 0, top:414, opacity:1,  ease: Circ.easeOut})
        landingTween3 = new TimelineMax();
        landingTween3.to(introType3, 1, {delay: 0    , top:630, opacity:1,  ease: Circ.easeOut})
        // var tMax = new TimelineMax();
        // tMax.to(camera.position, 2, { x:-.3});

        destRotation.y=.72;

        introYoYo = new TimelineMax();
        introYoYo.to(destRotation, 6, {y:.8, repeat:-1, yoyo:true, ease: Power2.easeInOut})

        //-----------------------------------------------------------------------------------------------------------------

        canDrag=false;
        ready3D=true;
        action="landingGo";

    }else if(action==="landingGo"){

        if(moveFader===true){

            topDown = lerp(topDown, window.innerHeight+5, dt*5);
            loadingCover.style.setProperty("top", topDown+"px");

            if(topDown>window.innerHeight){
                
                moveFader=false;

                loadingCover.style.setProperty("opacity", "0");

            }

        }

        lerpCamera();

        count+=dt;
        if(count>4.4){
            for(var i=0; i<sec2Objects.length; i++){
                sec2Objects[i].visible=false;
            }
            count=0
            action="landing";
        }

    }else if(action==="landing"){

        //---lerpcamera--------------------------------------------------------------------------------------------------------------

        lerpCamera();

        //---screenpoints--------------------------------------------------------------------------------------------------------------

    }else if(action==="startTour"){

        introYoYo.kill();
        destZoom = .5;
        destRotation.y=0;
        destRotation.x=-.3;
        lerpCamera();

        count+=dt;
        if(count>3){
            count=0;
            showDrag=true;
            action="startTour2";
        }

        var tMax2 = new TimelineMax();
        tMax2.to(camera.position, 2, { x:0 });

        for(var i=0; i<sidePieces.length; i++){
            if(sidePieces[i]!==null){
                if(sidePieces[i].material!==null){
                    sidePieces[i].material.opacity+=dt*3;
                    if(sidePieces[i].material.opacity>1){
                        sidePieces[i].material.opacity=1;
                    }
                    sidePieces[i].material.visible=true;
                }
            }
        }

        introTypeOut();

    }else if(action==="startTour2"){

        canDrag=true;
        action="tour";

    }else if(action==="tour"){

        for(var i=0; i<sidePieces.length; i++){
            if(sidePieces[i]!==null){
                if(sidePieces[i].material!==null){
                    sidePieces[i].material.opacity+=dt*3;
                    if(sidePieces[i].material.opacity>1){
                        sidePieces[i].material.opacity=1;
                    }
                    sidePieces[i].material.visible=true;
                }
            }
        }

        lerpCamera();

    //---specs--------------------------------------------------------------------------------------------------------------
    //---specs--------------------------------------------------------------------------------------------------------------
    //---specs--------------------------------------------------------------------------------------------------------------

    }else if(action==="toSpces"){

        specsWindow=document.getElementById("specsWindow");
        closeSpecs=document.getElementById("closeSpecs");

        specsWindow.style.display="inline";

        specsMove = new TimelineMax();
        specsMove.to(specsWindow, .25, { right:0,  ease: Sine.easeOut});

        action="spces"

    }else if(action==="spces"){

        closeSpecs.style.opacity = 1;
        if(mobile===true){
            closeSpecs.style.right="";
            closeSpecs.style.left="0px"
        }else{
            closeSpecs.style.right=-window.innerWidth/2;
        }

    }else if(action==="outSpecs"){

        if(specsMove!==null){
            specsMove.kill();
        }

        specsMove.to(specsWindow, .25, { right:-window.innerWidth,  ease: Sine.easeOut, onComplete:hideSpecs});
        closeSpecs.style.opacity = 0;

        action="tour"

    //---milk--------------------------------------------------------------------------------------------------------------
    //---milk--------------------------------------------------------------------------------------------------------------
    //---milk--------------------------------------------------------------------------------------------------------------

    }else if(action==="toMilk"){

        prevAction=action;

        canDrag=false;

        destZoom=-.7;
        destRotation.x=0;
        destRotation.y=1;

        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/milk.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/OcyK4jl3OGY?autoplay=1"

        }

        showingVideo=true;
        
        action="toMilk2";

    }else if(action==="toMilk2"){

        lerpCamera();

    // ---espresso--------------------------------------------------------------------------------------------------------------
    // ---espresso--------------------------------------------------------------------------------------------------------------
    // ---espresso--------------------------------------------------------------------------------------------------------------
    
    }else if(action==="toEspresso"){

        prevAction=action;

        canDrag=false;

        destZoom=-.7;
        destRotation.x=-.44;
        destRotation.y=-.44;

        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/espresso.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/d29bPgaxzE0?autoplay=1"

        }

        showingVideo=true;
        
        action="toEspresso2";

    }else if(action==="toEspresso2"){

        lerpCamera();

    // ---amount--------------------------------------------------------------------------------------------------------------
    // ---amount--------------------------------------------------------------------------------------------------------------
    // ---amount--------------------------------------------------------------------------------------------------------------

    }else if(action==="toAmount"){

        prevAction=action;

        canDrag=false;

        destZoom=-.7;
        destRotation.x=-.44;
        destRotation.y=-.44;

        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/amount.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/cVLFPXjYqEQ?autoplay=1"

        }

        showingVideo=true;

        action="toAmount2";

    }else if(action==="toAmount2"){

        lerpCamera();

    // ---tamping--------------------------------------------------------------------------------------------------------------
    // ---tamping--------------------------------------------------------------------------------------------------------------
    // ---tamping--------------------------------------------------------------------------------------------------------------

    }else if(action==="toTamping"){

        prevAction=action;

        canDrag=false;

        destZoom=-.7;
        destRotation.x=-.44;
        destRotation.y=-.44;

        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/tamping.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/fWFJVGJG57I?autoplay=1"

        }

        showingVideo=true;
        
        action="toTamping2";

    }else if(action==="toTamping2"){

        lerpCamera();

    // ---drink1--------------------------------------------------------------------------------------------------------------
    // ---drink1--------------------------------------------------------------------------------------------------------------
    // ---drink1--------------------------------------------------------------------------------------------------------------

    }else if(action==="toDrink1"){

        prevAction=action;

        canDrag=false;

        videoPlayer.currentTime = 0;
        destZoom=.7;
        
        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/drink1.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/FsH6EyU5rUM?autoplay=1"

        }

        showingVideo=true;
        
        action="toDrink1Wait";

    }else if(action==="toDrink1Wait"){

        lerpCamera();

    // ---drink2--------------------------------------------------------------------------------------------------------------
    // ---drink2--------------------------------------------------------------------------------------------------------------
    // ---drink2--------------------------------------------------------------------------------------------------------------

    }else if(action==="toDrink2"){

        prevAction=action;

        canDrag=false;

        videoPlayer.currentTime = 0;
        destZoom=.7;

        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/drink3.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/3hziUR9RAYc?autoplay=1"

        }

        showingVideo=true;
        
        action="toDrink2Wait";

    }else if(action==="toDrink2Wait"){

        lerpCamera();
    
    // ---drink3--------------------------------------------------------------------------------------------------------------
    // ---drink3--------------------------------------------------------------------------------------------------------------
    // ---drink3--------------------------------------------------------------------------------------------------------------

    }else if(action==="toDrink3"){

        prevAction=action;

        canDrag=false;

        videoPlayer.currentTime = 0;
        destZoom=.7;
        
        var tMax6b = new TimelineMax();
        tMax6b.to(faderBlack, 1, { delay:1, a:faderAlpha,  ease: Power2.easeOut});

        if(mobile===false){

            var tMax6 = new TimelineMax();
            tMax6.to(videoDiv, 3, { delay:1, opacity:1,  ease: Power2.easeOut});

            videoPlayer.currentTime = 0;
        
            sizeVideoPlayer();

            videoPlayer.src = "./src/video/drink2.mp4";
            videoPlayer.play();

        }else{

            var tMax7 = new TimelineMax();
            tMax7.to(youtubeDiv, 1, { delay:1, opacity:1, ease: Power2.easeOut});
                
            youtubeIframe.style.pointerEvents="auto";
            youtubeIframe.src = "https://www.youtube.com/embed/3LYcY3G-TQU?autoplay=1"

        }

        showingVideo=true;
        
        action="toDrink3Wait";

    }else if(action==="toDrink3Wait"){

        lerpCamera();

    }else if(action==="closeVideo"){

        // ---closevideo--------------------------------------------------------------------------------------------------------------
        // ---closevideo--------------------------------------------------------------------------------------------------------------
        // ---closevideo--------------------------------------------------------------------------------------------------------------

        var tMax8 = new TimelineMax();
        tMax8.to(videoDiv, .5, { opacity:0,  ease: Power2.easeOut});

        var tMax8b = new TimelineMax();
        tMax8b.to(youtubeDiv, .5, { opacity:0,  ease: Power2.easeOut, onComplete:killYoutube});

        if(section===1){
            action="tour";
        }else if(section===2){
            action="section2";
        }else if(section===3){
            action="section3";
        }
        

    // ---tosection--------------------------------------------------------------------------------------------------------------
    // ---tosection--------------------------------------------------------------------------------------------------------------
    // ---tosection--------------------------------------------------------------------------------------------------------------

    }else if(action==="toSection1"){

        var tMax8 = new TimelineMax();
        tMax8.to(mainCont.position, 2, { x:0,  ease: Power2.easeOut});

        var tMax9 = new TimelineMax();
        tMax9.to(camera.position, 2, { x:0,  ease: Power2.easeOut});

        destRotation.y=0;
        destRotation.y=.72;
        destRotation.x=-.3;

        count=0;
        action="move";

    }else if(action==="toSection2"){

        var tMax8 = new TimelineMax();
        tMax8.to(mainCont.position, 2, { x:-10,  ease: Power2.easeOut});

        var tMax9 = new TimelineMax();
        tMax9.to(camera.position, 2, { x:0,  ease: Power2.easeOut});

        var tMax1 = new TimelineMax();
        tMax1.to(scene2Type1, 1, {delay: 1.4, top:-30, opacity:1,  ease: Circ.easeOut})

        var tMax2 = new TimelineMax();
        tMax2.to(scene2Type2, 1, {delay: 1.4, top:154, opacity:1,  ease: Circ.easeOut})

        destZoom = .1;
        destRotation.y=0;
        destRotation.x=-.226;

        for(var i=0; i<sec2Objects.length; i++){
            sec2Objects[i].visible=true;
        }

        count=0;
        action="move";

    }else if(action==="toSection3"){

        var tMax8 = new TimelineMax();
        tMax8.to(mainCont.position, 2, { x:-20,  ease: Power2.easeOut});

        var tMax9 = new TimelineMax();
        tMax9.to(camera.position, 2, { x:0,  ease: Power2.easeOut});

        var tMax1 = new TimelineMax();
        tMax1.to(scene3Type1, 3, {delay: .8, opacity:1,  ease: Circ.easeOut})

        var tMax2 = new TimelineMax();
        tMax2.to(scene3Type2, 3, {delay: .8, opacity:1,  ease: Circ.easeOut})

        var tMax3 = new TimelineMax();
        tMax3.to(legacyBackground, 3, {delay: .4, a:.3,  ease: Circ.easeOut})

        histTween = new TimelineMax();
        histTween.to(histText, 3, {delay: .8, opacity:1,  ease: Circ.easeOut})

        if(window.innerHeight<787){
            legacyBackground.h=window.innerHeight;
            legacyBackground.w=1537*(window.innerHeight/787);
        }

        histFadeDelay=.7;

        destZoom = .1;
        destRotation.y=0;
        destRotation.x=-.226;

        introYoYo.kill();

        for(var i=0; i<sec2Objects.length; i++){
            sec2Objects[i].visible=true;
        }

        dotDelayCount=0;
        timelineAlpha=0;

        canDrag=false;
        count=0;
        onceDot=true;
        action="move";

    }else if(action==="move"){

        lerpCamera();

        count+=dt;
        if(count>2){

            if(section===1){

                action="toLanding";

                for(var i=0; i<sec2Objects.length; i++){
                    sec2Objects[i].visible=false;
                }

            }else if(section===2){

                destZoom = .1;
                
                for(var i=0; i<sidePieces.length; i++){
                    if(sidePieces[i]!==null){
                        if(sidePieces[i].material!==null){
                            sidePieces[i].material.opacity=0;
                            sidePieces[i].material.visible=false;
                        }
                    }
                }

                action="section2";

            }else if(section===3){

                for(var i=0; i<sidePieces.length; i++){
                    if(sidePieces[i]!==null){
                        if(sidePieces[i].material!==null){
                            sidePieces[i].material.opacity=0;
                            sidePieces[i].material.visible=false;
                        }
                    }
                }

                action="section3";

            }
        }
    
    }else if(action==="section2"){

        lerpCamera();
        canDrag=true;

    }else if(action==="section3"){

        // handleGallery() makes this work

        destRotation.x=-.3;
        destRotation.y=0;

        // ---legacyBackground--------------------------------------------------------------------------------------------------------------

        if(window.innerHeight<787){
            legacyBackground.h=window.innerHeight;
            legacyBackground.w=1537*(window.innerHeight/787);
        }
        
        //---hidesocialmedia--------------------------------------------------------------------------------------------------------------

        if(window.innerWidth<1140 && timelineLandscape===false){
            socialMediaIcons.style.display="none";
        }else{
            socialMediaIcons.style.display="inline";
        }

        //---basics--------------------------------------------------------------------------------------------------------------

        lerpCamera();
        canDrag=false;

    }else if(action==="cupMove"){

        //reset coffee cup and have it go up

        esp1.material.transparent=false;
        esp2.material.transparent=false;
        esp1.material.map = cupDecal4;
        esp2.material.map = cupDecal4;

        destZoom=.1;
        destRotation.x=-.4;
        destRotation.y=.75;

        ps("cup2");

        console.log("startcuprot1 " + eCupCont1.rotation.y)
        console.log("startcuprot2 " + eCupCont2.rotation.y)

        var tMaxP1 = new TimelineMax();
        tMaxP1.to(eCupCont1.position, 1, {delay: 0, y: eCupCont1.position.y+.5, z: eCupCont1.position.z+.9, x: machine.position.x+.25, ease: Circ.easeOut})

        var tMaxR1 = new TimelineMax();
        tMaxR1.to(eCupCont1.rotation, 1, {delay: 0,  x: eCupCont1.rotation.x+(3.14), y: eCupCont1.rotation.y-.8, ease: Circ.easeOut})

        var tMaxP2 = new TimelineMax();
        tMaxP2.to(eCupCont2.position, 1, {delay: 0, y: eCupCont2.position.y+.5, z: eCupCont2.position.z+.9, x: machine.position.x-.25, ease: Circ.easeOut})

        var tMaxR2 = new TimelineMax();
        tMaxR2.to(eCupCont2.rotation, 1, {delay: 0,  x: eCupCont2.rotation.x+(3.14), y: eCupCont2.rotation.y-.8, ease: Circ.easeOut})

        count=0;
        action="cupMoveWait"

    }else if(action==="cupMoveWait"){

        //wait to go up

        count+=dt;
        if(count>1){

            count=0;
            action="cupMove2"

        }

        lerpCamera();

    }else if(action==="cupMove2"){

        //bring the coffee cup down

        var tMaxP1 = new TimelineMax();
        tMaxP1.to(eCupCont1.position, 1.5, {delay: 0, y: .73,  ease: Circ.easeOut})

        var tMaxP2 = new TimelineMax();
        tMaxP2.to(eCupCont2.position, 1.5, {delay: 0, y: .73,  ease: Circ.easeOut})

        var tMaxP3 = new TimelineMax();
        tMaxP3.to(eCupCont1.position, 1.25, {delay: .25, z: eCupCont1.position.z-.55, x: machine.position.x+.12, ease: Power3.easeInOut})

        var tMaxP4 = new TimelineMax();
        tMaxP4.to(eCupCont2.position, 1.25, {delay: .25, z: eCupCont2.position.z-.55, x: machine.position.x-.12, ease: Power3.easeInOut})

        action="cupMoveWait2"

    }else if(action==="cupMoveWait2"){

        //wait for it to go down

        count+=dt;
        if(count>1.5){

            count=0;

            action="cupMoveWait3"

        }

        lerpCamera();

    }else if(action==="cupMoveWait3"){

        //fill up the cups

        ps("cup1");
        ps("espresso");

        

        esp1.material.visible=true;
        esp2.material.visible=true;
        
        var tMaxP1 = new TimelineMax();
        tMaxP1.to(esp1.position, 5.5, {delay: 1.5, y: 0,  ease: Circ.easeOut})

        var tMaxP2 = new TimelineMax();
        tMaxP2.to(esp2.position, 5.5, {delay: 1.5, y: 0,  ease: Circ.easeOut})

        // var tMaxP2b = new TimelineMax();
        // tMaxP2b.to(liquid.scale, 2, {delay: 5, z: 1,  ease: Circ.easeOut})

        var tMaxP3 = new TimelineMax();
        tMaxP3.to(esp1.scale, 5.5, {delay: 1.5, x: 2.68, y: 2.65, z: 2.65,  ease: Circ.easeOut})

        var tMaxP4 = new TimelineMax();
        tMaxP4.to(esp2.scale, 5.5, {delay: 1.5, x: 2.68, y: 2.65, z: 2.65,  ease: Circ.easeOut})

        liquid.material.visible=true;
        // liquid.material.depthWrite = false
        // liquid.material.depthTest = true
        

        count=0;
        action="cupMoveWait4"

    }else if(action==="cupMoveWait4"){

        if(count<1.5){

            liquid.scale.z = .05;

        }else if(count>1.5 && count<2.5){

            liquid.material.visible=true;
            liquid.scale.z+=dt*.1;

        }else{

            liqCount+=dt;
            if(liqCount>.04){
                liqCount=0;
                liquid.scale.z = (13+ran(8))/100;
            }
    
        }

        if(count>1.5){
            liquid.material.map.offset.y=lerp(liquid.material.map.offset.y, 0, dt*6);
        }

        //fill up cup
        count+=dt;
        if(count>7){

            count=0;

            action="cupMoveWait5b"
            // action="tour"

        }

        cupBox.position.z=camera.position.z*.8;
        cupBox.position.y=1.10;
        // cupBox.position.x=-.15;

    }else if(action==="cupMoveWait5b"){

        //make liquid clear

        liquid.material.map.offset.y=lerp(liquid.material.map.offset.y, -.5, dt*2);

        count+=dt;
        if(count>2){

            count=0;

            liquid.material.visible=false;
            esp1.material.transparent=true;
            esp2.material.transparent=true;
            esp1.material.map = cupDecal3;
            esp2.material.map = cupDecal3;
            // esp1.material.color.setHex( 0xcccccc );
            // esp2.material.color.setHex( 0xcccccc );
            // TweenLite.to(esp1.material, 1, { color: "0xcccccc" }); // text color
            // TweenLite.to(esp2.material, 1, { color: "0xcccccc" }); // text color

            action="cupMoveWait5"
            action="cupV2Part1"

        }

    }else if(action==="cupV2Part1"){

        var goDist = 2;
        var goDist2 = 3;

        // closePlate2.position.z=goDist2;

        closePlate2.position.y=0.02;

        var tMax7 = new TimelineMax();
        tMax7.to(closePlate2.position, 2, { z:goDist2,  ease: Power2.easeInOut});

        var tMaxP1 = new TimelineMax();
        tMaxP1.to(eCupCont1.position, 2, {delay: 0, x:0, y:.13, z:goDist2, ease: Power2.easeInOut})

        var tMaxP2 = new TimelineMax();
        tMaxP2.to(eCupCont1.rotation, 2, {delay: 0, y: eCupCont1.rotation.y-1.5, ease: Power2.easeInOut})

        var tMax8 = new TimelineMax();
        tMax8.to(mainCont.position, 2, { z:-goDist-1.15,  ease: Power2.easeInOut});

        destRotation.x=-.4;
        destRotation.y=0;
        // destZoom=-2.3;
        

        action="stepWait"

    }else if(action==="stepWait"){

        count+=dt;
        if(count>2){
            stepCont.style.visibility = "visible";
            eCupCont2.position.z=20;
            ps("cup2");
            // stepCont.style.visible = "visible";
            toStep1();
            action="stepAction";
            count=0;
        }
        lerpCamera();
       
    }else if(action==="stepAction"){
 
        //
        preventSectionChange=true;
       
    }else if(action==="closeStep"){

        stepCont.style.visibility = "hidden";
        step1Div.style.visibility = "hidden";
        step2Div.style.visibility = "hidden";
        step3Div.style.visibility = "hidden";
        step4Div.style.visibility = "hidden";

        var tMax8 = new TimelineMax();
        tMax8.to(mainCont.position, 2, { z:0,  ease: Power2.easeInOut});
        count=0;

        var tMax6 = new TimelineMax();
        tMax6.to(eCupCont1.position, 2, { z:9,  ease: Power2.easeInOut});

        closePlate2.position.y=0.02;
        var tMax7 = new TimelineMax();
        tMax7.to(closePlate2.position, 2, { z:9,  ease: Power2.easeInOut});

        action="closeStep2"

    }else if(action==="closeStep2"){

        count+=dt;
        if(count>2){
            count=0;
            action="closeStep4";
        }

    }else if(action==="closeStep4"){

        count+=dt;
        if(count>2){

            eCupCont1.rotation.x=0;
            eCupCont1.position.x=eCup1StartPos.x;
            eCupCont1.position.z=eCup1StartPos.z;
            eCupCont1.position.y=eCup1StartPos.y+4;
            eCupCont1.rotation.y=0;

            esp1.position.x = 0;
            esp1.position.y = .1;
            esp1.position.z = 0;
            esp1.scale.x=2.2;
            esp1.scale.y=2.2;
            esp1.scale.z=2.2;

            var tMaxP1 = new TimelineMax();
            tMaxP1.to(eCupCont1.position, 2, {delay: 0, y: eCup1StartPos.y, ease: Circ.easeOut})

            eCupCont2.rotation.x=0;
            eCupCont2.position.x=eCup2StartPos.x;
            eCupCont2.position.z=eCup2StartPos.z;
            eCupCont2.position.y=eCup2StartPos.y+4
            eCupCont2.rotation.y=0;

            esp2.position.x = 0;
            esp2.position.y = .1;
            esp2.position.z = 0;
            esp2.scale.x=2.2;
            esp2.scale.y=2.2;
            esp2.scale.z=2.2;

            var tMaxP2 = new TimelineMax();
            tMaxP2.to(eCupCont2.position, 2, {delay: 0, y: eCup2StartPos.y, ease: Circ.easeOut})

            esp1.material.opacity=1;
            esp2.material.opacity=1;
            eCup1.material.opacity=1;
            eCup2.material.opacity=1;

            closePlate2.position.y=-2;

            // esp1.material.color = 0x666666;
            // esp2.material.color = 0x666666;

            closePlate.position.y=-3;

            destRotation.y=0;
            action="setReset";
            count=0;

        }
        
    }else if(action="setReset"){
            
        count+=dt;
        if(count>2){
            preventSectionChange=false
            action="tour"
        }
        
        lerpCamera();

    }

    //---handlefaderalpha--------------------------------------------------------------------------------------------------------------

    if(videoDivBlack!==null && faderBlack!==null){
        videoDivBlack.style.setProperty("opacity", faderBlack.a);
    }

    //---neededtoassisttouchmove--------------------------------------------------------------------------------------------------------------

    if(ongoingTouches.length===0){
        previousTouchPosition={x:0,y:0};
    }

    //---resizeyoutubeframe--------------------------------------------------------------------------------------------------------------

    if(youtubeIframe!==null){
        
        var ytw = Math.floor(window.innerWidth*.75);

        youtubeIframe.style.width = ytw+"px";
        
        var ip = ytw/854;
        youtubeIframe.style.height = (480*ip)+"px";

    }

    //---others--------------------------------------------------------------------------------------------------------------

    renderer.render(scene, camera);

    handleGallery();

    handleDots();

    requestAnimationFrame(update);

    if(liquid!==null){
        // liquid.material.map.offset.y+=.01;
    }
    
}

//---steps--------------------------------------------------------------------------------------------------------------

var curStep = 1;

function prevStep(){
    curStep-=1;
    if(curStep<1){
        curStep=1;
    }
    updateStep();
}

function nextStep(){
    curStep+=1;
    if(curStep>4){
        curStep=4;
    }
    updateStep();
}

function updateStep(){
    step1Div.style.visibility = "hidden";
    step2Div.style.visibility = "hidden";
    step3Div.style.visibility = "hidden";
    step4Div.style.visibility = "hidden";
    stepDot1.src="./src/img/stepDot1.png";
    stepDot2.src="./src/img/stepDot1.png";
    stepDot3.src="./src/img/stepDot1.png";
    stepDot4.src="./src/img/stepDot1.png";
    if(curStep===1){
        step1Div.style.visibility = "visible";
        stepDot1.src="./src/img/stepDot2.png";
    }else  if(curStep===2){
        step2Div.style.visibility = "visible";
        stepDot2.src="./src/img/stepDot2.png";
    }else  if(curStep===3){
        step3Div.style.visibility = "visible";
        stepDot3.src="./src/img/stepDot2.png";
    }else  if(curStep===4){
        step4Div.style.visibility = "visible";
        stepDot4.src="./src/img/stepDot2.png";
    }
}

function toStep1(){
    curStep=1;
    updateStep()
}

function toStep2(){
    curStep=2;
    updateStep()
}

function toStep3(){
    curStep=3;
    updateStep()
}

function toStep4(){
    curStep=4;
    updateStep()
}

function stepClose(){
    action="closeStep"
}

//---video--------------------------------------------------------------------------------------------------------------

function killYoutube(){
    youtubeIframe.src="";
    console.log("kill")
}

function playVideoCall(){
    videoAction="isPlaying";
    videoPlayer.play();
    playVideoDiv.style.opacity=0;
    playVideoDiv.style.pointerEvents="none";
}

function hideSpecs(){
    specsWindow.style.display="none";
}

//---specs--------------------------------------------------------------------------------------------------------------

function closeSpecsCall(){

    console.log("closeSPECS")
    action="outSpecs"

}

function sizeVideoPlayer(){
    /*
    var videoDiv = document.getElementById("videoDiv");
    var videoPlayer = document.getElementById("videoPlayer");

    videoDiv.style.height=(window.innerHeight*.70)+"px";
    console.log(videoDiv.style.height)
    videoDiv.style.width=((960*(window.innerHeight*.70))/540)+"px";
    console.log(videoDiv.style.width)
    videoPlayer.style.height=videoDiv.style.height;
    videoPlayer.style.width=videoDiv.style.width;
    */
}

//---lerpcamera--------------------------------------------------------------------------------------------------------------

function lerpCamera(){

    myZoom = lerp(myZoom, (destZoom-1), .02);
    
    if(window.innerWidth<420){
        camera.position.z=12+myZoom;
    }else if(window.innerWidth<window.innerHeight && window.innerWidth>420){
        camera.position.z=9+myZoom;
    }else{
        camera.position.z=6+myZoom;
    }

    if(section===1){

        if(destRotation.y>4.71){
            destRotation.y-=6.28;
            camContY.rotation.y-=6.28;
        }else if(destRotation.y<-4.71){
            destRotation.y+=6.28;
            camContY.rotation.y+=6.28;
        }
    
    }else if(section===2){

        var turny = 0;

        if(destRotation.y>turny){
            destRotation.y=turny;
        }else if(destRotation.y<-turny){
            destRotation.y=-turny;
        }

        var turnx = .06;
        
        if(destRotation.x>-.226+turnx){
            destRotation.x=-.226+turnx;
        }else if(destRotation.x<-.226-turnx){
            destRotation.x=-.226-turnx;
        }
    
    }

    camContX.rotation.x = lerp(camContX.rotation.x, destRotation.x, .04);
    camContY.rotation.y = lerp(camContY.rotation.y, destRotation.y, .04);

}

//---closeVideo--------------------------------------------------------------------------------------------------------------

var prevAction = "";
var showingVideo = false;

function closeVideo(){

    if(showingVideo===true){

        showingVideo=false;

        if(prevAction==="toMilk"){

            destRotation.y=.6;
            destRotation.x=-.2;

        }else if(prevAction==="toEspresso"){

            destRotation.y=0;
            destRotation.x=-.34;

        }else{

            destRotation.y=-.6;
            destRotation.x=-.2;

        }

        if(section===1){
            destZoom=.7;
        }else if(section===2){
            destZoom=.1;
        }else if(section===3){
            destZoom=.1;
        }
        
        var tMax7 = new TimelineMax();
        tMax7.to(faderBlack, 1, { a:0,  ease: Power2.easeOut});
        
        videoPlayer.pause();
        canDrag=true;
        action="closeVideo";

        youtubeIframe.style.pointerEvents="none";

    }

}

//---changesection--------------------------------------------------------------------------------------------------------------

var section=1;
var preventSectionChange = false;

function changeSection(sec){

    console.log("sec "+sec)

    if(preventSectionChange===false){

        showDrag=false;

        if(sec===1){

            if(section!==1){
                section=1;
                part2LettersOut();
                part3LettersOut();
                action="toSection1";
                if(dotYoYo!==null){
                    dotYoYo.kill();
                }
                TweenMax.killChildTweensOf( dotFocus );
            }

        }else if(sec===2){

            if(section!==2){
                section=2;
                introTypeOut();
                part3LettersOut();
                if(action==="landing"){
                    introYoYo.kill();
                }
                action="toSection2";
                if(dotYoYo!==null){
                    dotYoYo.kill();
                }
                TweenMax.killChildTweensOf( dotFocus );
            }

        }else if(sec===3){

            if(section!==3){
                section=3;
                introTypeOut();
                part2LettersOut();
                if(dotYoYo!==null){
                    dotYoYo.kill();
                }
                TweenMax.killChildTweensOf( dotFocus );
                if(action==="landing"){
                    introYoYo.kill();
                }
                socialMediaIcons.style.display="inline";
                action="toSection3";
            }

        }

    }else{
        if(action==="stepAction"){
            action="closeStep"
        }
        
    }

}

function part2LettersOut(){

    var tMax1 = new TimelineMax();
    tMax1.to(scene2Type1, 1, {opacity:0,  ease: Circ.easeOut})

    var tMax2 = new TimelineMax();
    tMax2.to(scene2Type2, 1, {opacity:0,  ease: Circ.easeOut})

}

function part3LettersOut(){

    histAlphaDown=true;

    var tMax1 = new TimelineMax();
    tMax1.to(scene3Type1, 1, {opacity:0,  ease: Circ.easeOut})

    var tMax2 = new TimelineMax();
    tMax2.to(scene3Type2, 1, {opacity:0,  ease: Circ.easeOut})

    var tMax3 = new TimelineMax();
    tMax3.to(legacyBackground, 1, {a:0,  ease: Circ.easeOut})

    var tMax5 = new TimelineMax();
    tMax5.to(histText, 1, {opacity:0,  ease: Circ.easeOut})

    if(dotYoYo!==null){
        dotYoYo.kill();
    }

}

function introTypeOut(){

    if(introType1.opacity!=="0"){

        landingTween1.kill();
        landingTween2.kill();
        landingTween3.kill();

        var tMax3 = new TimelineMax();
        var tMax4 = new TimelineMax();
        var tMax5 = new TimelineMax();
        tMax3.to(introType1, 1, {delay: 0, opacity:0,  ease: Circ.easeOut})
        tMax4.to(introType2, 1, {delay: 0, opacity:0,  ease: Circ.easeOut})
        tMax5.to(introType3, 1, {delay: 0, opacity:0,  ease: Circ.easeOut})

    }

}

//---starttour--------------------------------------------------------------------------------------------------------------

function startTour(){

    action="startTour";

}

//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------

//---mousemove--------------------------------------------------------------------------------------------------

var isDragging=false;
var canDrag=false;
var previousMousePosition  = { x: 0, y: 0 };
var destRotation = { x: -.3, y: .7 };

document.addEventListener('mousemove', function(event) {

    var deltaMove = {
        x: event.offsetX-previousMousePosition.x,
        y: event.offsetY-previousMousePosition.y
    };

    if(isDragging && canDrag===true || isDragging && action==="section3") {
      
        if(action==="section3"){

            galleryDest-=deltaMove.x*.008;

        }else{

            destRotation.x+=deltaMove.y*-.002;
            destRotation.y+=deltaMove.x*-.002;
    
             if(destRotation.x>0){
                destRotation.x=0;
            }
            if(destRotation.x<-1.5){
                 destRotation.x=-1.5;
            }
    
        }
    }

    
    previousMousePosition = {x: event.offsetX,y: event.offsetY};

}, false);

document.body.addEventListener("mousedown", function(event) { isDragging = true }, false);
document.body.addEventListener("mouseup", function(event) { isDragging = false }, false);

//---touchmove--------------------------------------------------------------------------------------------------

var previousTouchPosition  = { x: 0, y: 0 };

document.addEventListener('touchmove', function(event) {

    var deltaMove2 = {
        x: parseInt(event.touches[ 0 ].clientX)-previousTouchPosition.x,
        y: parseInt(event.touches[ 0 ].clientY)-previousTouchPosition.y
    };

    var ignoreFirst=false;
    if(previousTouchPosition.x===0 && previousTouchPosition.y===0){
        ignoreFirst=true;
        console.log("ignore");
    }

    if(canDrag===true && ignoreFirst===false || action==="section3" && ignoreFirst===false) {
      
        if(action==="section3"){

            galleryDest-=deltaMove2.x*.02;

        }else{

            console.log(deltaMove2.y)

            destRotation.x+=deltaMove2.y*-.01;
            destRotation.y+=deltaMove2.x*-.01;

            if(destRotation.x>0){
                destRotation.x=0;
            }
            if(destRotation.x<-1.5){
                destRotation.x=-1.5;
            }

        }
        
    }
    
    previousTouchPosition = {x: event.touches[ 0 ].clientX, y: event.touches[ 0 ].clientY};

}, false);

document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
}, false);
  
//---wheelcontrol--------------------------------------------------------------------------------------------------

var destZoom = 0;
var myZoom = -.5;
var minZoom = -.5;
var maxZoom = .5;

window.addEventListener("wheel", event => {

    const delta = Math.sign(event.deltaY);
    
    destZoom+=delta*.2;

    if(destZoom<minZoom){
        destZoom=minZoom;
    }
    if(destZoom>maxZoom){
        destZoom=maxZoom;
    }

});

//---resize--------------------------------------------------------------------------------------------------

window.addEventListener("resize", () => {
    resize3D();
})

var topAmount=0;

function resize3D(){

    console.log('RESIZE 3D ')
    renderer.setPixelRatio( window.devicePixelRatio );

    var tWidth = document.documentElement.clientWidth;
    var tHeight = document.documentElement.clientHeight;

    renderer.setSize(tWidth,tHeight);
    camera.aspect = tWidth/tHeight;
    camera.updateProjectionMatrix();
    console.log(renderer.domElement)

}

//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------

update();