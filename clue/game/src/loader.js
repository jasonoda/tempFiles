import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';

export class Loader{

    setUp(e){

        this.e = e;

        this.ready=false;
        this.objectsLoaded=0;
        this.loaderArray=[];
        
        this.totalModels = 0;
        this.totalModelsLoaded = 0;

        this.isLoaded_CUBE=true;
        this.isLoaded_3DTEXTURES=false;
        this.isLoaded_3D=false;
        this.e.reflectionTexture=null;

        // console.log("loader set up")

    }

    loadCubeTexture(loader){
        
        // console.log("CUBE TEXTURE");
        // this.isLoaded_CUBE=true;
    
    }
    
    loadTexture(loader){

        loader.objectsLoaded+=1;
        // console.log("LOAD 3D TEXTURE: "+loader+" - "+this.objectsLoaded+" / "+this.loaderArray.length)

        if(this.objectsLoaded===this.loaderArray.length){
            this.isLoaded_3DTEXTURES=true;
        }
        
    }
    
   managerLoad(obName){
    
        this.objectsLoaded+=1;
        this.totalModelsLoaded+=1;

        // console.log("MODEL: "+obName+" - "+this.objectsLoaded+" / "+this.loaderArray.length)

        if(this.objectsLoaded===this.loaderArray.length){
            this.isLoaded_3D=true;
        }

   }

   load(){

        var e = this.e;

        //------------------------------------------------------------------

        // var loader = new THREE.CubeTextureLoader();
        // loader.name="skyboxLoaderName";

        // this.e.reflectionTexture = loader.load([
        // './src/img/ref/pos-x.png',
        // './src/img/ref/neg-x.png',
        // './src/img/ref/pos-y.png',
        // './src/img/ref/neg-y.png',
        // './src/img/ref/pos-z.png',
        // './src/img/ref/neg-z.png',
        // ], this.loadCubeTexture);

        // this.loaderArray.push("gradGlow"); this.e.gradGlow = new THREE.TextureLoader().load( './src/img/gradGlowWhite.png', this.loadTexture(this));

        // this.loaderArray.push("cartPic1"); this.e.cartPic1 = new THREE.TextureLoader().load( './src/img/cartPic1.png', this.loadTexture(this));
        // this.loaderArray.push("cartPic2"); this.e.cartPic2 = new THREE.TextureLoader().load( './src/img/cartPic2.png', this.loadTexture(this));
        // this.loaderArray.push("cartPic3"); this.e.cartPic3 = new THREE.TextureLoader().load( './src/img/cartPic3.png', this.loadTexture(this));
        // this.loaderArray.push("cartPic4"); this.e.cartPic4 = new THREE.TextureLoader().load( './src/img/cartPic4.png', this.loadTexture(this));

        // this.loaderArray.push("screen1"); this.e.screen1 = new THREE.TextureLoader().load( './src/img/screen1.png', this.loadTexture(this));
        // this.e.screen1.magFilter = THREE.NearestFilter;
        // this.e.screen1.minFilter = THREE.NearestMipmapNearestFilter;
        // this.e.screen1.anisotropy = this.e.renderer.capabilities.getMaxAnisotropy();

        this.loaderArray.push("enter_d_1"); this.e.enter_d_1 = new THREE.TextureLoader().load( './src/img/enter_d_1.png', this.loadTexture(this));
        this.loaderArray.push("enter_d_2"); this.e.enter_d_2 = new THREE.TextureLoader().load( './src/img/enter_d_2.png', this.loadTexture(this));

        this.loaderArray.push("enter_u_1"); this.e.enter_u_1 = new THREE.TextureLoader().load( './src/img/enter_u_1.png', this.loadTexture(this));
        this.loaderArray.push("enter_u_2"); this.e.enter_u_2 = new THREE.TextureLoader().load( './src/img/enter_u_2.png', this.loadTexture(this));

        this.loaderArray.push("enter_r_1"); this.e.enter_r_1 = new THREE.TextureLoader().load( './src/img/enter_r_1.png', this.loadTexture(this));
        this.loaderArray.push("enter_r_2"); this.e.enter_r_2 = new THREE.TextureLoader().load( './src/img/enter_r_2.png', this.loadTexture(this));

        this.loaderArray.push("enter_l_1"); this.e.enter_l_1 = new THREE.TextureLoader().load( './src/img/enter_l_1.png', this.loadTexture(this));
        this.loaderArray.push("enter_l_2"); this.e.enter_l_2 = new THREE.TextureLoader().load( './src/img/enter_l_2.png', this.loadTexture(this));

        this.loaderArray.push("skullBox"); this.e.skullBox = new THREE.TextureLoader().load( './src/img/skullBox.png', this.loadTexture(this));
        this.loaderArray.push("skullBox2"); this.e.skullBox2 = new THREE.TextureLoader().load( './src/img/skullBox2.png', this.loadTexture(this));

        //------------------------------------------------------------------

        console.log("BEGIN LOADER");

        this.myObject1 = "board"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.board=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "piece"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.piece=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

        this.myObject1 = "skull"; this.loaderArray.push(this.myObject1);  this.totalModels+=1;
        this.manage = new THREE.LoadingManager(); this.manage.onLoad = () => { this.managerLoad(this.myObject1) };
        this.loader = new GLTFLoader(this.manage); this.loader.load('./src/models/'+this.myObject1+'.glb', gltf => {  
        
            gltf.scene.traverse( function( object ) {

                e.skull=gltf.scene;

                if ( object.isMesh ){

                    object.castShadow=true;
                    object.receiveShadow=true;
                    object.material.side = THREE.FrontSide;

                }

            });

        }, this.loadSomething);

    }

}