export class Sounds {

    setUp(e) {

        this.e=e;
        this.soundArray = ["scroll", "bell", "chime", "guitar1", "guitar2", "lose", "move", "mystery", "scroll", "softBoom", "enter", "click", "cancel", "steps"];
        this.loadedSounds = [];

        for(var i=0; i<this.soundArray.length; i++){
            this.loadSounds(this.soundArray[i]);
        }
        
    }

    loadSounds(url){

        var theSound = new Howl({
            src: ['./src/sounds/'+url+".mp3"]
        });

        theSound.on('load', (event) => {
            theSound.name=url;
            this.loadedSounds.push(theSound);
            // console.log("SOUND: "+url+" - "+this.loadedSounds.length+" / "+this.soundArray.length);
        });

    }

    p(type){

        // console.log(type)

        // if(this.e.mobile===false){
            for(var i=0; i<this.loadedSounds.length; i++){

                // console.log(type+" / "+this.loadedSounds[i].name)

                if(this.loadedSounds[i].name===type){
                    // console.log("-->"+type)
                    this.loadedSounds[i].play();
                }
                
            }
        // }

    }
}