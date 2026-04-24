
var showMobileButtons = false;

//---what happens when you push buttons--------------------------------------------------------------------------------------------------------------

// var histTween = null;

function updateHistory(){
    dotFocus = dotArray[currentDot];
    scene3Type1.innerHTML = dateArray[currentDot];
    histText.innerHTML = histArray[currentDot];

    if(dotYoYo!==null){
        dotYoYo.kill();
    }
    TweenMax.killChildTweensOf( dotFocus );

    dotFocus.a=.6;
    dotYoYo = new TimelineMax();
    dotYoYo.to(dotFocus.lp, 1, {y:-32, repeat:-1, yoyo:true, ease: Power2.easeOut})
    dotYoYo.to(dotFocus, 1, {a:.2, repeat:-1, yoyo:true})

    
    historyPic.ref = dateArray[currentDot];
    historyPic.setSprite();
    historyPic.a=0;

    if(action!=="toSection3"){
        if(histTween!==null){
            histTween.kill();
        }
        // TweenMax.killChildTweensOf( histTween );
        // histText.style.opacity=0;
        // histTween = new TimelineMax();
        // histTween.to(histText, 2, { opacity:1})
        histText.style.opacity=0;
        historyPic.opacity=0;
    }
}

function buttonsFunction(com) {

    console.log(com)
    
    if (com === "jodaLink") {
        
        window.open("http://jasonoda.com", "_blank");
        
    }else if(com === "galleryRight"){

        galleryRight();

    }else if(com === "galleryLeft"){

        galleryLeft();

    }else if(com === "tourBut1"){

        if(action==="tour" && facingRightDirection===true){
            action="toMilk";
            ps("click");
        }

    }else if(com === "tourBut2" && facingRightDirection===true){

        if(action==="tour"){
            action="toEspresso";
            ps("click");
        }

    }else if(com === "tourBut3" && facingRightDirection===true){

        if(action==="tour"){
            // action="toAmount";
            action="toSpces";
            ps("click");
        }

    }else if(com === "tourBut4" && facingRightDirection===true){

        if(action==="tour"){
            action="toTamping";
            ps("click");
        }

    }else if(com === "tourBut5" && facingRightDirection===true){

        if(action==="tour"){
            action="cupMove";
        }

    }else if(com === "tourBut6" && facingRightDirection===true){

        if(action==="tour"){
            action="toAmount";
            ps("click");
        }

    }else if(com === "tourBut7" && facingRightDirection===true){

        if(action==="section2"){
            action="toDrink1";
            ps("click");
        }

    }else if(com === "tourBut8" && facingRightDirection===true){

        if(action==="section2"){
            console.log("gooo")
            action="toDrink2";
            ps("click");
        }

    }else if(com === "tourBut9" && facingRightDirection===true){

        if(action==="section2"){
            action="toDrink3";
            ps("click");
        }

    }else if(com==="closeVideo"){
// 
        if(action!=="tour" && faderBlack.a>=.6){
        // if(action!=="tour" && faderBlack.a>=.6 && videoAction==="isPlaying"){
            console.log("CLOSE")
            videoAction="stopped"
            closeVideo();
        }

    }else if(com==="prevDot"){

        if(action==="section3"){
            currentDot-=1;
            if(currentDot<0){
                currentDot=0;
            }
            updateHistory();
        }

    }else if(com==="nextDot"){

        if(action==="section3"){
            currentDot+=1;
            if(currentDot>23){
                currentDot=23;
            }
            updateHistory();
        }

    }else if(com==="timeLine1"){

        currentDot=0;
        updateHistory();

    }else if(com==="timeLine2"){

        currentDot=1;
        updateHistory();

    }else if(com==="timeLine3"){

        currentDot=2;
        updateHistory();

    }else if(com==="timeLine4"){

        currentDot=3;
        updateHistory();

    }else if(com==="timeLine5"){

        currentDot=4;
        updateHistory();

    }else if(com==="timeLine6"){

        currentDot=5;
        updateHistory();

    }else if(com==="timeLine7"){

        currentDot=6;
        updateHistory();

    }else if(com==="timeLine8"){

        currentDot=7;
        updateHistory();

    }else if(com==="timeLine9"){

        currentDot=8;
        updateHistory();

    }else if(com==="timeLine10"){

        currentDot=9;
        updateHistory();

    }else if(com==="timeLine11"){

        currentDot=10;
        updateHistory();
    }else if(com==="timeLine12"){

        currentDot=11;
        updateHistory();

    }else if(com==="timeLine13"){

        currentDot=12;
         updateHistory();

    }else if(com==="timeLine14"){

        currentDot=13;
        updateHistory();

    }else if(com==="timeLine15"){

        currentDot=14;
        updateHistory();

    }else if(com==="timeLine16"){

        currentDot=15;
        updateHistory();

    }else if(com==="timeLine17"){

        currentDot=16;
        updateHistory();

    }else if(com==="timeLine18"){

        currentDot=17;
        updateHistory();

    }else if(com==="timeLine19"){

        currentDot=18;
        updateHistory();

    }else if(com==="timeLine20"){

        currentDot=19;
        updateHistory();

    }else if(com==="timeLine21"){

        currentDot=20;
        updateHistory();

    }else if(com==="timeLine22"){

        currentDot=21;
        updateHistory();

    }else if(com==="timeLine23"){

        currentDot=22;
        updateHistory();

    }else if(com==="timeLine24"){

        currentDot=23;
        updateHistory();

    }
     
      
    if (mobile === true) {

        if (com === "leftBut") {

            leftMobileDown = true;
            rightMobileDown = false;

        } else if (com === "rightBut") {
          
            leftMobileDown = false;
            rightMobileDown = true;

        }
    }
      
    if (com === "jumpBut") {
        
    }
      
    if (com === "shootBut") {
        
    }
      
}

//---rollOverFunction--------------------------------------------------------------------------------------------------------------

function rollOverAction(com, but){
    if(ready2D===true && ready3D===true){
        if(com==="makeDot"){

            if(but.section===section){
                console.log("makeDot");
                makeRollOverDot(but.cont);
            }

        }
    }

}

//---clickbuttoncheck--------------------------------------------------------------------------------------------------------------

var touchOnce=true;

function clickButtonCheck(x, y) {
      
    if(mouseIsDown===false){
        clickOnce=true;
    }

    if ((mobile === false && mouseIsDown === true && clickOnce===true) || mobile === true && touchOnce==true) {
    // if ((mobile === false && mouseIsDown === true && clickOnce===true)) {
        
        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i] != null) {

            var cx = 0;
            var cy = 0;
            if(buttons[i].useCenter===true){
                cx = buttons[i].w/2;
                cy = buttons[i].h/2;
            }

            if (
              x > buttons[i].p.x-cx &&
              x < buttons[i].p.x + buttons[i].w-cx &&
              y > buttons[i].p.y-cy &&
              y < buttons[i].p.y + buttons[i].h-cy
            ) {
              buttonsFunction(buttons[i].func);
              clickOnce=false
              touchOnce=false
            }

          }
        }
        
    }
}

//---handlebuttons--------------------------------------------------------------------------------------------------------------

var mousePoint = null;
var buttonHover = false;
var buttons = [];
var sideTouch = 0;
var downTouch = 0;

function handleButtons() {
    
    if(ongoingTouches.length===0){
        touchOnce=true;
    }

    //tester to see where mouse is inputting

    if (mousePoint === null && ready2D === true) {
        mousePoint = inst(
          "mousePoint",
          "red",
          0,
          0,
          100,
          100,
          99,
          rootCont
        );
        // mousePoint.a = 0;
    }
      
    if (mousePoint !== null) {
        mousePoint.lp.x = mouseX - 50;
        mousePoint.lp.y = mouseY - 50;
    }
      
    buttonHover = false;

    if (mobile === true) {
        
        //if mobile make buttons when not pushed go back to normal

        for (var i = 0; i < buttons.length; i++) {
          
            if (buttons[i] != null) {
                if (buttons[i].rolledOver === true) {
                    buttons[i].rollBack();
                }
            }
          
        }

        //if mobile do rollover
  
        for (var j = 0; j < ongoingTouches.length; j++) {
          
            var myTouchX = (ongoingTouches[j].pageX - sideTouch) * mf2;
            var myTouchY = (ongoingTouches[j].pageY - downTouch) * mf2;
          
            for (i = 0; i < buttons.length; i++) {
                if (buttons[i] != null) {
            
                    if (myTouchX > buttons[i].p.x && myTouchX < buttons[i].p.x + buttons[i].w && myTouchY > buttons[i].p.y && myTouchY < buttons[i].p.y + buttons[i].h) {
                
                        if (buttons[i].rolledOver === false) {

                            buttons[i].rollOver();
                            if (buttons[i].rollOverSound != null) {
                                //playSound(buttons[i].rollOverSound, 1);
                            }

                        }
                    }
                }
            }
        }
        
    } else {

        //if browser check for button push

        var makePointer = false;

        for (i = 0; i < buttons.length; i++) {
            if (buttons[i] != null) {

                var cx = 0;
                var cy = 0;
                
                if(buttons[i].useCenter===true){
                    cx = buttons[i].w/2;
                    cy = buttons[i].h/2;
                }

                if (mouseX > buttons[i].p.x-cx &&  mouseX < buttons[i].p.x + buttons[i].w-cx && mouseY > buttons[i].p.y-cy && mouseY < buttons[i].p.y + buttons[i].h-cy  ) {
                    if (buttons[i].rolledOver === false) {

                        buttons[i].rollOver();
                        if (buttons[i].rollOverSound != null) {
                            //playSound(buttons[i].rollOverSound, 1);
                            //consollog(buttons[i].rollOverSound);
                        }
                        
                    }
                    buttonHover = true;
                    if(buttons[i].name!=="closeVideo"){
                        makePointer=true;
                    }
                    

                } else {

                    if (buttons[i].rolledOver === true) {
                        buttons[i].rollBack();
                    }

                }
            }
        }

        canvasUI = document.getElementById("canvasUI");

        if(ready2D===true && ready3D===true){
            if(makePointer===true){
                if(action!=="tour" && action!=="section2" && action!=="section3"){
                    canvasUI.style.cursor = 'default';
                }else{
                    canvasUI.style.cursor = 'pointer';
                }
            }else{
                canvasUI.style.cursor = 'default';
            }
        }

    }
}

//---touchpushes--------------------------------------------------------------------------------------------------------------

var leftMobileDown = false;
var rightMobileDown = false;
var touchX = 0;
var touchY = 0;
var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;
var ongoingTouches = [];

function handleOngoingTouches() {
     
    leftMobileDown = false;
    rightMobileDown = false;
    
    var downTouch = (window.innerHeight - canvas.height) / 2;
    var sideTouch = (window.innerWidth - canvas.width) / 2;
    
    for (var i = 0; i < ongoingTouches.length; i++) {
        // console.log(ongoingTouches[i].pageX+" / "+ongoingTouches[i].pageY);
        // touchX = (ongoingTouches[i].pageX - sideTouch) * mf2;
        // touchY = (ongoingTouches[i].pageY - downTouch) * mf2;
        // console.log(touchX+" / "+touchY);
        // clickButtonCheck(touchX, touchY);
        clickButtonCheck(ongoingTouches[i].pageX, ongoingTouches[i].pageY);
    }
      
}

//---setupmobilebuttons--------------------------------------------------------------------------------------------------------------

var mobileLeftButCont = null;
var mobileRightButCont = null;
var leftBut = null;
var rightBut = null;
var jumpBut = null;
var shootBut = null;
var rightSide = 0;
var leftSide = 0;
var bottomSide = 0;

function setUpMobileGameButtons(){
  
    if (mobileLeftButCont === null && mobile === true && ready2D === true) {
        
        mobileLeftButCont = newContainer(
          "mobileLeftButCont",
          0,
          0,
          rootCont
        );

        mobileRightButCont = newContainer(
          "mobileRightButCont",
          1422,
          0,
          rootCont
        );
        
        leftBut = button(
          "leftBut",
          "m_leftBut",
          "m_leftBut2",
          0,
          0,
          100,
          150,
          95,
          "leftBut",
          mobileLeftButCont
        );

        rightBut = button(
          "rightBut",
          "m_rightBut",
          "m_rightBut2",
          100,
          0,
          100,
          150,
          95,
          "rightBut",
          mobileLeftButCont
        );

        jumpBut = button(
          "jumpBut",
          "m_jumpBut",
          "m_jumpBut2",
          -200,
          0,
          100,
          60,
          95,
          "jumpBut",
          mobileRightButCont
        );
        
        shootBut = button(
          "shootBut",
          "m_shootBut",
          "m_shootBut2",
          -200,
          0,
          120,
          150,
          95,
          "shootBut",
          mobileRightButCont
        );
        
    }
      
    if (mobile === true && ready2D === true) {
        
        if (window.innerHeight > window.innerWidth) {
          ori = "v";
        } else {
          ori = "h";
        }
        
        rightSide = canvas.width * mf2;
        bottomSide = canvas.height * mf2;
        
        leftSide = 0;
        
        mobileLeftButCont.lp.y = bottomSide;
        mobileLeftButCont.lp.x = leftSide;
        mobileRightButCont.lp.y = bottomSide;
        mobileRightButCont.lp.x = rightSide;
  
        if (ori === "h") {
          jumpBut.w = pixelWidth / 8;
          shootBut.w = pixelWidth / 8;
          leftBut.w = pixelWidth / 8;
          rightBut.w = pixelWidth / 8;
        } else {
          jumpBut.w = pixelWidth / 4;
          shootBut.w = pixelWidth / 4;
          leftBut.w = pixelWidth / 4;
          rightBut.w = pixelWidth / 4;
        }
        
        if (showMobileButtons === true) {
          shootBut.a = 1;
          leftBut.a = 1;
          rightBut.a = 1;
        } else {
          shootBut.a = 0;
          leftBut.a = 0;
          rightBut.a = 0;
        }
        
        leftBut.lp.x = 0;
        jumpBut.lp.x = -jumpBut.w - 18;
        shootBut.lp.x = -jumpBut.w * 2 - 18;
        shootBut.lp.y = leftBut.lp.y = rightBut.lp.y = -leftBut.h - 10;
  
        rightBut.lp.x = leftBut.lp.x + leftBut.w;
        shootBut.h = leftBut.h = rightBut.h = rightBut.w * 0.5;
    }
}
  
//---keyboard--------------------------------------------------------------------------------------------------------------

var leftKey = false;
var rightKey = false;
var upKey = false;
var downKey = false;
var shootKey = false;
var jumpKey = false;
     
//---keydown--------------------------------------------------------------------------------------------------------------

document.addEventListener("keydown", event => {
    switch (event.keyCode) {
        case 37:
            camContY.position.x-=.1;
            leftKey = true;
            break;
        case 65:
            leftKey = true;
            break;
        case 38:
            camContY.position.z+=.1;
            upKey = true;
            break;
        case 40:
            camContY.position.z-=.1;
            // upKey = true;
            break;
        case 87:
            upKey = true;
            break;
        case 68:
            rightKey = true;
            break;
        case 39:
            camContY.position.x+=.1;
            rightKey = true;
            break;
        case 32:
            shootKey = true;
            break;
        case 75:
            break;
        case 74:
            break;
        case 88:

            // histCont.lp.x-=20;
            // console.log(destZoom+" / "+ destRotation.x+" / "+destRotation.y +" / "+camContY.position.x+" / "+camContY.position.y)
            // console.log("-----------")
            // console.log(eCup1.position)
            // console.log(eCup2.position)
            console.log(destRotation)
            // console.log(camContY.position.x+" / "+camContY.position.z+" / "+camContY.position.x+" / "+camContY.position.z+" / "+camera.position.x+" / "+camera.position.z);

            //pause
            // liquid.material.map.offset.y-=.01;
            // console.log(liquid.material.map.offset.y);

            for( var i=0; i<render.length; i++){
                if(render[i]!==null){
                    if(render[i].ref==="exploreDot"){
                        console.log(render[i].name)
                        console.log(render[i])
                    }
                }
            }

            if (pause === false) {
                pause = true;
            } else {
                pause = false;
            }
            break;

        case 90:

            console.log("liquid "+liquid.renderOrder);
            console.log("esp1 "+esp1.renderOrder);
            console.log("esp2 "+esp2.renderOrder);

            break;
        case 72:
            break;

        default:
    }
});

//---keyup--------------------------------------------------------------------------------------------------------------

document.addEventListener("keyup", event => {
    switch (event.keyCode) {
        case 37:
            leftKey = false;
            break;
        case 65:
            leftKey = false;
            break;
        case 38:
            upKey = false;
            break;
        case 87:
            upKey = false;
            break;
        case 68:
            rightKey = false;
            break;
        case 39:
            rightKey = false;
            break;
        case 32:
            shootKey = false;
            break;
        default:
    }
});

//---keyboardpress--------------------------------------------------------------------------------------------------------------

document.addEventListener("keypress", event => {
    switch (event.keyCode) {
        case 32:
            break;
        case 65:
            break;
        default:
    }
});

//---mousedown--------------------------------------------------------------------------------------------------------------

document.addEventListener("mousedown", function(evt) {});
    
//---mousemove--------------------------------------------------------------------------------------------------------------

document.addEventListener("mousemove", function(evt) {
    if (mobile === false) {
        var rect = canvas.getBoundingClientRect();
        mouseX = evt.clientX - rect.left - mf;
        mouseY = evt.clientY - rect.top;
        mouseX *= mf2;
        mouseY *= mf2;
    }
});

//---mousedown--------------------------------------------------------------------------------------------------------------

document.addEventListener("mousedown", event => {
    mouseIsDown = true;
});

//---mouseup--------------------------------------------------------------------------------------------------------------

document.addEventListener("mouseup", event => {
    mouseIsDown = false;
});

//---touches--------------------------------------------------------------------------------------------------------------

// document.addEventListener("touchmove", function(evt) {
    
//     for (var i = 0; i < ongoingTouches.length; i++) {}
    
//     var touches = evt.changedTouches;
    
//     for (i = 0; i < touches.length; i++) {
//         for (var j = 0; j < ongoingTouches.length; j++) {

//             if (touches[i].identifier === ongoingTouches[j].identifier) {
//                 ongoingTouches.splice(j, 1, touches[i]);
//             }
            
//         }
//     }

// });

//---touchstart--------------------------------------------------------------------------------------------------------------

document.addEventListener("touchstart", evt => {
    
    for (var i = 0; i < evt.touches.length; i++) {
        var found = false;
        
        //only add the touch if it is not listed yet, prevent doubles
        
        for (var j = 0; j < ongoingTouches.length; j++) {

            if (evt.touches[i].identifier === ongoingTouches[j].identifier) {
                found = true;
            }

        }
        
        if (found === false) {
            ongoingTouches.push(evt.touches[i]);
        }
    }
    
});

//---touchend--------------------------------------------------------------------------------------------------------------

document.addEventListener("touchend", evt => {
    
    //evt.preventDefault();
    var touches = evt.changedTouches;
    
    for (var i = 0; i < touches.length; i++) {
        
        for (var j = 0; j < ongoingTouches.length; j++) {
        
            if (touches[i].identifier === ongoingTouches[j].identifier) {
                ongoingTouches.splice(j, 1);
            }
        }
    }

});

//---touchcancel--------------------------------------------------------------------------------------------------------------

document.addEventListener("touchcancel", evt => {

    //evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
            
        for (var j = 0; j < ongoingTouches.length; j++) {
            
            if (touches[i].identifier === ongoingTouches[j].identifier) {
                ongoingTouches.splice(j, 1);
            }

        }
        
    }
});


  
  