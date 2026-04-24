import { gsap } from "./greensock/all.js";

export class Engine {
    constructor(
        skipTo,
        showOutput,
        scene,
        input,
        loader,
        sounds,
        utilities,
        ui
    ) {
        this.skipTo = skipTo;
        this.showOutput = showOutput;
        this.scene = scene;
        this.input = input;
        this.loader = loader;
        this.s = sounds; 
        this.u = utilities; 
        this.ui = ui;

        this.mouse = new Object;
        this.mouse.x=0;
        this.mouse.y=0;
        this.touch = new Object;
        this.touch.x=0;
        this.touch.y=0;
         
        this.mobile = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) ) {
            this.mobile = true;
        }

        //---vars--------------------------------------------------------------------------------------------------------------

        this.action="set up"
        this.count=0;

        document.addEventListener('mousemove',  (event) => {
            if(this.mobile===false){
                this.mouse.x = event.offsetX
                this.mouse.y = event.offsetY
            }
            
        });
        
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
        if (this.dt > 1) {
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
            this.loader.load();
            this.action="wait for ui";

        }else if(this.action==="wait for ui"){

            //wait for all ui to be loaded

            if(this.ui.isLoaded_UI===true && this.loader.isLoaded_3D===true){
                this.scene.build3d();
                this.scene.buildScene();
                this.action="build";
            }

        }else if(this.action==="build"){

            this.count=0;
            this.action="wait";

        }else if(this.action==="wait"){

            //hide the loading back

            this.ui.update();
            this.scene.update();

            this.count+=this.dt;
            if(this.count>1){

                this.count=0;
                this.action="go"

                //hide

                document.getElementById("loadingBack").style.display="none"
                document.getElementById("loadingImage").style.display="none"

                if(this.mobile===true){

                    document.getElementById("spotifyPlayer").style.top = "40px";
                    document.getElementById("spotifyPlayer").style.bottom = "auto";
                    document.getElementById("spotifyPlayer").style.right = "auto";
                    document.getElementById("spotifyPlayer").style.left = "-254px";
                    document.getElementById("playerBack").style.display = "none";
    
                }

            }

        }else if(this.action==="go"){

            this.scene.update();
            this.ui.update();

        }

    }

}