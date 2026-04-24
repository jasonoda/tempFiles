var context = null;

var focusSound=true;
var sNum = 0;
var lastUrl = "";

var buffers = [];
var soundsLoaded = false;

//---switches--------------------------------------------------------------------------------------------------------------

var noSounds=false;

//---listofsoundfiles--------------------------------------------------------------------------------------------------------------

var soundArray = [
    "silence","click","espresso","cup1","cup2"
];

//---setup--------------------------------------------------------------------------------------------------------------

function setUpAudio(){

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    if(soundArray.length>0){
        nextSound(0);
    }

    window.addEventListener("click", onClick);
    document.addEventListener("touchstart", onClick);

}

//---focussound--------------------------------------------------------------------------------------------------------------

function onClick() {

    if (focusSound === true) {
        ps("test");
        focusSound = false;
    }

}

//---loadsound--------------------------------------------------------------------------------------------------------------

function loadSound(url) {

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
      context.decodeAudioData(request.response, soundComplete, onError);
    };
    request.send();

}

//---nextsound--------------------------------------------------------------------------------------------------------------

function nextSound(num) {

    if (noSounds === true) {
        soundArray = [];
        soundsLoaded = true;
    } else {
        loadSound("./src/sounds/" + soundArray[num] + ".mp3");
        lastUrl = soundArray[num];
    }

}

//---oncomplete--------------------------------------------------------------------------------------------------------------

function soundComplete(buffer) {

    //console.log("buffer complete " + lastUrl);

    buffers[lastUrl] = buffer;
    sNum += 1;

    if (sNum < soundArray.length) {
        nextSound(sNum);
    } else {
        soundsLoaded = true;
        console.log("SOUNDS LOADED");
    }

}

function onError() {
    console.log("error " + lastUrl);
}

//---playsound--------------------------------------------------------------------------------------------------------------

function ps(snd) {
    
    var buffer = buffers[snd];
    
    if (buffer !== undefined && noSounds === false) {

      //console.log(buffer);
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);

    } else {

      console.log("sound not found " + snd);

    }

  }