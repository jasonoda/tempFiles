import { Howl, Howler } from 'howler';
export class Sounds {

    setUp(e) {

        this.e=e;
        this.soundArray = ["scroll", "tallyRight", "bomb", "coin", "deathSong", "enemyDeath", "fireball", "frost", "hurt", "lightning", "lightningSofter", "powerUp", "shot", "select", "slice", "loop", "howl", "howlSoft", "winSound", "winMusic", "ghostPop", "achievement1", "brightClick", "click1", "click2", "click3", "jewelKill", "jewelPickup", "shieldBlock", "intro" ];
        this.essentialSoundArray = ["click2", "click3", "select", "shot", "hurt", "coin", "scroll"];
        this.deferredSoundArray = this.soundArray.filter((name) => this.essentialSoundArray.indexOf(name) === -1);
        this.loadedSounds = [];
        this._deferredLoadStarted = false;
        this._pendingLoads = {};

        for (let i = 0; i < this.essentialSoundArray.length; i++) {
            this.loadSounds(this.essentialSoundArray[i]);
        }

        this.bindIOSAudioContextResume();
    }

    isReadyForGameplay() {
        for (let i = 0; i < this.essentialSoundArray.length; i++) {
            const name = this.essentialSoundArray[i];
            let found = false;
            for (let j = 0; j < this.loadedSounds.length; j++) {
                if (this.loadedSounds[j].name === name) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        return true;
    }

    startDeferredSounds() {
        if (this._deferredLoadStarted) return;
        this._deferredLoadStarted = true;
        for (let i = 0; i < this.deferredSoundArray.length; i++) {
            this.loadSounds(this.deferredSoundArray[i]);
        }
    }

    /** iOS leaves Howler's AudioContext suspended after background/interrupt; resume on user gesture. */
    bindIOSAudioContextResume() {
        if (this._audioContextResumeBound) return;
        this._audioContextResumeBound = true;

        const resumeAudioContext = () => {
            const ctx = Howler.ctx;
            if (!ctx) return;
            if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                const resumed = ctx.resume();
                if (resumed && typeof resumed.catch === 'function') {
                    resumed.catch(() => {});
                }
            }
        };

        document.addEventListener('touchend', resumeAudioContext, { passive: true });
        document.addEventListener('click', resumeAudioContext, { passive: true });
    }

    resumeAudioContextIfNeeded() {
        const ctx = Howler.ctx;
        if (!ctx) return;
        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
            const resumed = ctx.resume();
            if (resumed && typeof resumed.catch === 'function') {
                resumed.catch(() => {});
            }
        }
    }

    loadSounds(url){

        if (this._pendingLoads[url]) return;

        if(url==="loop"){

            var theSound = new Howl({
                src: ['./src/sounds/loop.ogg'], volume:0, loop:true
            });
    
        }else{

            var theSound = new Howl({
                src: ['./src/sounds/'+url+".mp3"]
            });
    
        }

        this._pendingLoads[url] = theSound;

        const markSoundLoaded = () => {
            if (theSound.name === url) return;
            theSound.name = url;
            this.loadedSounds.push(theSound);
            delete this._pendingLoads[url];
            if (theSound.name === "loop") {
                this.musicLoop = theSound;
            }
            if (!this._deferredLoadStarted && this.isReadyForGameplay()) {
                this.startDeferredSounds();
            }
        };

        theSound.on('load', markSoundLoaded);
        theSound.on('loaderror', () => {
            console.warn('[Sounds] failed to load:', url);
            markSoundLoaded();
        });

    }

    p(type){

        if(this.e.muteState===false){

            this.resumeAudioContextIfNeeded();

            let played = false;
            
            for(var i=0; i<this.loadedSounds.length; i++){

                if(this.loadedSounds[i].name===type){

                    this.loadedSounds[i].play();
                    played = true;
                    
                }
                
            }

            if (!played && this.soundArray.indexOf(type) !== -1) {
                this.loadSounds(type);
            }
    
        }

    }
}
