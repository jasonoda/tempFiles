//---setup--------------------------------------------------------------------------------------------------------------

var canvas = null;
var ctx = null;

var mobile = false;
var canvasAction = "setUp";
var dt=0;
var lt=0;

var mf=1;
var mf2=1;

var pause=false;
var ready2D=false;

var winCenterX=0;
var winCentery=0;

var useOutput=false;
var feedBack=false;

//---objects--------------------------------------------------------------------------------------------------------------

var faderBlack = null;
var faderWhite = null;
var bDot = null;

//---html--------------------------------------------------------------------------------------------------------------

var introType1 = null;
var introType2 = null;
var introType3 = null;

var scene2Type1 = null;
var scene2Type2 = null;

var scene3Type1 = null;
var scene3Type2 = null;

var section3Text = null;

//---array--------------------------------------------------------------------------------------------------------------

var bDots = [];
var timeLineArray = [];
var timeLineArray2 = [];
var dateArray = [];
var galleryPics =[];


//---bool--------------------------------------------------------------------------------------------------------------

var showDrag = false;
var facingRightDirection = false;

//---containers--------------------------------------------------------------------------------------------------------------

var dragCont = null;
var histCont = null;
var timeLineCont = null;
var timeLineCont2 = null;
var timeLineCont3 = null;

//---sprites--------------------------------------------------------------------------------------------------------------

var drag = null;
var dragGlow = null;
var histText = null;
var timelineBar = null;
var historyPic = null;
var timeLinePoint = null;
var testLine = null;
// 
var galleryRightButton = null;
var galleryLeftButton = null;

//---etc--------------------------------------------------------------------------------------------------------------

var dotFocus = null;
var currentDot = 0;
var delayPics = 1;

//---start--------------------------------------------------------------------------------------------------------------

function start(game) {

    canvas = document.getElementById("canvasUI");
    ctx = this.canvas.getContext("2d");
    
    //---checkifmobile--------------------------------------------------------------------------------------------------------------

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ) ) {
      mobile = true;
    }

    // mobile=true;

    if (mobile === false) {
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;

      window.addEventListener("resize", resizeBrowser);
      resizeBrowser();
    }

    //---external--------------------------------------------------------------------------------------------------------------

    setUpAudio();
    // setUpRenderer();

    document.getElementById("feedback").innerHTML += "";
    document.getElementById("feedback").style.opacity = 1;

}

//---update--------------------------------------------------------------------------------------------------------------

function updateCanvas(){
    
    

    //---clear--------------------------------------------------------------------------------------------------------------

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(mobile===true){
        resizeMobile();
    }

    //---deltatime--------------------------------------------------------------------------------------------------------------

    var ct = new Date().getTime();
    dt = (ct - lt) / 1000;
    lt = ct;

    //---mainloop--------------------------------------------------------------------------------------------------------------

    winCenterX = window.innerWidth/2;
    winCenterY = window.innerHeight/2;

    if(faderBlack!==null){
        faderBlack.w = window.innerWidth;
        faderBlack.h = window.innerHeight;

        // faderWhite.w = window.innerWidth;
        // faderWhite.h = window.innerHeight;
    }

    if(canvasAction==="setUp"){

        rootCont = newContainer("rootCont", 0, 0, null);

        faderBlack = button("closeVideo", "blackColor", "blackColor", 0,  0, window.innerWidth, window.innerHeight,  80, "closeVideo", this.rootCont );
        faderBlack.a=0;
        
        // faderWhite = inst("faderWhite", "whiteColor", 0,  0, window.innerWidth, window.innerHeight,  80, this.rootCont );
        
        //---createfloatingbuttons--------------------------------------------------------------------------------------------------------------

        for(var i=0; i<9; i++){

            var buttonAssignment = "";
            var buttonText = "";

            if(i===0){
                buttonAssignment="tourBut1"
                buttonText = "milk";
            }else if(i===1){
                buttonAssignment="tourBut2"
                buttonText = "espresso";
            }else if(i===2){
                buttonAssignment="tourBut3"
                buttonText = "specs";
            }else if(i===3){
                buttonAssignment="tourBut4"
                buttonText = "tamper";
            }else if(i===4){
                buttonAssignment="tourBut5"
                buttonText = "drink!";
            }else if(i===5){
                buttonAssignment="tourBut6"
                buttonText = "amount";
            }else if(i===6){
                buttonAssignment="tourBut7"
                buttonText = "macchiato";
            }else if(i===7){
                buttonAssignment="tourBut8"
                buttonText = "latte macchiato";
            }else if(i===8){
                buttonAssignment="tourBut9"
                buttonText = "cappuccino";
            }

            var bDotCont = newContainer("bDotCont", 0, 0, null);

            var butText = instText("butText", "[ "+buttonText+" ]", "Bitter", 12, "white", "center", 0, 0, 200, 50, 80, bDotCont);
            butText.a = 0;
            bDotCont.mainText = butText;

            if(i<=5){
                bDotCont.section=1;
            }else{
                bDotCont.section=2;
            }

            var ms=1;
            if(mobile===true){
               ms=.75; 
            }

            bDot = button("roundButton", "exploreDot", "whiteGlow", 0, 0, 22*ms, 22*ms, 80, buttonAssignment, bDotCont );
            bDot.a=0;
            bDot.useCenter=true;
            bDot.onRollOver = "makeDot";
            bDot.count=3;

            bDotCont.mainSprite = bDot;
            bDots.push(bDotCont);
        }

        //---draginpart1--------------------------------------------------------------------------------------------------------------

        dragCont = newContainer("dragCont", winCenterX, winCenterY, null);
        drag = inst("drag", "drag", 0,  0, 91, 61,  80, this.dragCont );
        drag.useCenter=true;
        drag.a=0;
        
        dragGlow = inst("whiteGlow", "whiteGlow", 0,  0, 310, 310,  80, this.dragCont );
        dragGlow.useCenter=true;
        dragGlow.a=0;
        
        //---setuphtmlparts--------------------------------------------------------------------------------------------------------------

        introType1 = document.getElementById("header1");
        introType2 = document.getElementById("sub1");
        introType3 = document.getElementById("tourButtonDiv");

        introType1.style.opacity="0";
        introType2.style.opacity="0";
        introType3.style.opacity="0";

        introType1.style.top="340px";
        introType2.style.top="514px";
        introType3.style.top="730px";

        scene2Type1 = document.getElementById("header2");
        scene2Type2 = document.getElementById("sub2");

        scene2Type1.style.opacity="0";
        scene2Type2.style.opacity="0";

        scene3Type1 = document.getElementById("header3");
        scene3Type2 = document.getElementById("sub3");

        section3Text = document.getElementById("section3Text");

        scene3Type1.style.opacity="0";
        scene3Type2.style.opacity="0";

        //---section3--------------------------------------------------------------------------------------------------------------

        histCont = newContainer("histCont", window.innerWidth/2, 0, this.rootCont);
        
        legacyBackground = inst("legacyBackground", "legacyBackground", 0,  0, 1537, 787,  40, histCont );
        legacyBackground.useCenterTop = true;
        legacyBackground.a=0;

        histText = document.getElementById("histText");
        histText.style.opacity=0;

        // timeLineCont = newContainer("timeLineCont", 0, canvas.height-180, histCont);
        // timeLineCont2 = newContainer("timeLineCont2", 0, canvas.height-180, histCont);

        // timelineBar = inst("timeline", "timeLine", 0, 3, 1259, 3,  80, timeLineCont );
        // timelineBar.useCenter=true;

        // historyPic = inst("historyPic", "clearColor", 0,  timelineBar.lp.y-62, 780, 520,  80, timeLineCont2 );
        // historyPic.useCenterBottom=true;
        // historyPic.a=0;
        // historyPic.visible=false;

        //---gallerypics--------------------------------------------------------------------------------------------------------------

        dateArray = ["80th Anniversary","1930","1936","1938","1939","1947","1948","1949","1950","1952","1955","1956","1957","1961","1962","1968","1977","1980","1991","1993","1999","2007","2009","2013","2018"];

        timeLineCont3 = newContainer("timeLineCont3", window.innerWidth/2, window.innerHeight/2, this.rootCont);

        for(var i=0; i<25; i++){

            // var tlPic = inst("historyPic", "1930", 0, 0, 780/2, 520/2, 80, timeLineCont3 );
            var tlPic = inst("historyPic", dateArray[i], 0, 0, 780, 520, 80, timeLineCont3 );
            tlPic.useCenter=true;
            tlPic.a=0;
            galleryPics.push(tlPic);

        }

        // var bf = -458;
        // var but1 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+30, -23, 10, 20, 80, "timeLine1", timeLineCont );
        // var but2 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+60, -23, 10, 20, 80, "timeLine2", timeLineCont );
        // var but3 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+80, -23, 10, 20, 80, "timeLine3", timeLineCont );
        // var but4 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+90, -23, 10, 20, 80, "timeLine4", timeLineCont );

        // var but5 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+170, -23, 10, 20, 80, "timeLine5", timeLineCont );
        // var but6 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+180, -23, 10, 20, 80, "timeLine6", timeLineCont );
        // var but7 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+190, -23, 10, 20, 80, "timeLine7", timeLineCont );

        // var but8 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+200, -23, 10, 20, 80, "timeLine8", timeLineCont );
        // var but9 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+220, -23, 10, 20, 80, "timeLine9", timeLineCont );
        // var but10 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+250, -23, 10, 20, 80, "timeLine10", timeLineCont );
        // var but11 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+260, -23, 10, 20, 80, "timeLine11", timeLineCont );
        // var but12 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+270, -23, 10, 20, 80, "timeLine12", timeLineCont );

        // var but13 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+310, -23, 10, 20, 80, "timeLine13", timeLineCont );
        // var but14 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+320, -23, 10, 20, 80, "timeLine14", timeLineCont );
        // var but15 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+380, -23, 10, 20, 80, "timeLine15", timeLineCont );

        // var but16 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+470, -23, 10, 20, 80, "timeLine16", timeLineCont );

        // var but17 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+500, -23, 10, 20, 80, "timeLine17", timeLineCont );

        // var but18 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+610, -23, 10, 20, 80, "timeLine18", timeLineCont );
        // var but19 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+630, -23, 10, 20, 80, "timeLine19", timeLineCont );
        // var but20 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+690, -23, 10, 20, 80, "timeLine20", timeLineCont );

        // var but21 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+770, -23, 10, 20, 80, "timeLine21", timeLineCont );
        // var but22 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+790, -23, 10, 20, 80, "timeLine22", timeLineCont );

        // var but23 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+830, -23, 10, 20, 80, "timeLine23", timeLineCont );
        // var but24 = button("timeLineDot", "timeLineDot", "timeLineDot2", bf+880, -23, 10, 20, 80, "timeLine24", timeLineCont );
        
        // timeLinePoint =  inst("timeLinePoint", "timeLinePoint", but1.lp.x,  timelineBar.lp.y, 27, 15,  81, timeLineCont );
        // timeLinePoint.useCenter=true;

        // timeLineArray = [but1,but2,but3,but4,but5,but6,but7,but8,but9,but10,but11,but12,but13,but14,but15,but16,but17,but18,but19,but20,but21,but22,but23,but24];
        
        // dotFocus = but1;

        // dotArray = [but1,but2,but3,but4,but5,but6,but7,but8,but9,but10,but11,but12,but13,but14,but15,but16,but17,but18,but19,but20,but21,but22,but23,but24];
        
        histArray = [
            "Celebrating the history of Gaggia on our 80th Anniversary.",

            "Working at his family's coffee bar, \"Caffè Achille\", in viale Premuda (Milan), Achille Gaggia immediately understood that the clients' preferences were changing and that it became necessary to improve the entire coffee extraction process, searching for a better flavor and look of the in-cup result. At that time, coffee was so bitter that Achille used to say it was similar to \"walking into a foggy Milan\". He started to work day after day in the bar's warehouse, studying and experimenting new extraction processes and searching for the perfect espresso.",

            "Thanks to the meeting with the engineer Antonio Cremonese, who shared his same desire to improve coffee extraction, Achille was able to refine his studies and invented the \"a torchio\" system (renamed \"Lampo\"). It definitely abandoned the use of steam and, finally, baristas could control accurately the process by which hot water under pressure passed through ground coffee.",

            "On Sept. 5, 1938, Achille filed the patent no. 365726 for \"Lampo\". This disruptive mechanism used hot water pressure instead of steam and prepared a delicious espresso, characterized by a soft layer of \"crema naturale\". A true revolution! This moment marks the beginning of the modern era of espresso",

            "To promote the new dispensing group for coffee crema, Gaggia exhibited “Lampo” at the 1939 Fiera Campionaria (Samples Fair) in Milan. Achille's aim was to sell the new groups to the bars owners, to substitute the ones on old coffee machines. Unfortunately, the idea was not easy to implement: the only solution was to produce coffee machines that already carried that innovative system.",
            
            "Achille Gaggia registered his second patent, for a lever-piston brewing mechanism. The legend says that this idea came up to his mind after seeing the piston engine of an American Army's jeep that used a hydraulic system. The new patent implied a spring, loaded by a lever, that pushed the piston through the filter: in this way hot water at high pressure passed through ground coffee, extracting all its marvelous aromas. The barista could obtain a creamy and flavorful espresso in just 25-30 seconds, and the mass production of the patent was just around the corner…",

            "Achille Gaggia, in collaboration with the entrepreneur Carlo Ernesto Valente, founded \"Officine Faema Brevetti Gaggia\", and could produce his first espresso machine: Tipo Classica. It was a technological and aesthetical revolution: horizontally developed, with beautiful levers, unmistakable slogan and logo, and a shape that allowed the set of more than one group in a row. The barista became a real artist, moving levers as a true stage performer.",

            "The Gaggia espresso is unique: the patented mechanism extracts the natural coffee oils and makes a delicious creamy layer on the top of the drink. Soon Gaggia installed his machines in the most elegant milanese bars, such as Motta and Biffi, with some appealing big billboards hanged on their windows, reporting \"Crema caffè di caffè naturale\". The trend of espresso began...",

            "Supported by the engineer Armando Migliorini, Achille designed and produced various ranges such as mod. Esportazione, Internazionale, Spagna and Treno, all characterized by elegant lines and impactful design. For the first time, the barista faced the clients while preparing espresso, and the back of the machines represented a new way to communicate with customers. Already brilliantly marketing-oriented, Achille took the opportunity and was the first to place right there his unique slogan \"Crema caffè naturale - Funziona senza vapore\".",

            "After various studies focused on a way to offer the same espresso of the bars in the comfort of the house, Gaggia launched its first coffee machine for domestic use: Gilda. Entirely and meticulously handcrafted, activated by piston pressure, it owes its name – as the legend says - to Rita Hayworth’s iconic interpretation of “Gilda” (1946).            After this model, came the variation “Tipo-Iris” and the famous and unforgettable “Tipo-Gilda 54”, named \"rabbit's ears\".",

            "The worldwide diffusion of espresso machines begins. When coffee was often made from chicory and essences, Gaggia was the protagonist of a true revolution. At the famous “Moka Bar” - inaugurated by Gina Lollobrigida - “Bar Italia”, \"Sirocci Bar\", \"El Cubano\" and \"The French House\", Gaggia machines gleamed on counters and served even 1000 people a day. The innovative “espressos with crema naturale” and cappuccinos delighted youngsters, as well as the most known writers, authors and actors.",

            "Gaggia is a real cult brand. The Danish catering company \"Oluf Brønnum\" created a \"Mobile Canteen\" with the exact same shape of Gaggia \"Tipo Internazionale\".",

            "Thanks to many Italians who emigrated, the espresso culture reached Africa, America and Australia. In Milan, Gaggia launched “Tipo-America”, designed to perfect the efficiency of the lever system. Later came \"Autono-Matic\" with revolutionary hydraulically operating groups that gradually substituted the lever, making the brewing of espresso easier.",

            "Achille Gaggia died prematurely and the management passed to his son Camillo and to the business partner Armando Migliorini.",

            "The high success achieved by the company led the decision to transfer the production to larger buildings to answer the growing worldwide needs: “Gaggia S.p.A.” opened in Robecco Sul Naviglio (Milan).",

            "Design and research on materials became every day more important, and Gaggia started collaborating with designers, experimenting lines and combinations. The first project of this kind is \"Tel 70\", created with Giuseppe de Gotzen. It was available in different colors, with a die-cast Silumin bodywork, a horizontal heat exchanger and two shells crossed by a neon tube. Another collaboration with de Gotzen was for \"Modello 80\" launched in 1975.",

            "Gaggia's desire to become a part of the daily life of families, by bringing to their houses the same espresso of the coffee bars, increased. The first model to be launched was \"Duo\", but it was with the unforgettable \"Baby Gaggia\", that the dream became true. Developed with the Japanese designer Makio Hasuike, it was the very first espresso machine to be mass produced. With a unique compact design and the high quality of its espresso, Baby Gaggia immediately entered the homes and hearts of the Italians, becoming a must have!",
            
            "The 80's: the years of bright colors, multiple aesthetic innovations and plastic. The ductility of this material led to experiments on new shapes-colors combinations. Gaggia focused every day more on the new business and launched \"Baby re-design\", \"Espresso\", \"Gran Gaggia\", \"Dandy\" and \"Fantastico\", all for domestic use. It is clear that the company aimed to become leader of this new market.",

            "Gaggia presented to the market \"Classic\". Characterized by a stainless steel body and bold lines, this domestic espresso machine perfectly combined Gaggia's long professional tradition with a timeless design. Beloved all over the world since the beginning, Classic has always been a best selling symbol of the brand's tradition, reliability and quality.",

            "From this year, until 1998, Gaggia focused on enriching the product range and worked with various designers and architects to launch new models, all characterized by innovative aesthetics. Besides the manual machines \"Paros\" and \"Carezza\", Gaggia created its first automatic espresso machine, \"Automatica Gaggia\".",

            "When the majority share of the group was acquired by Saeco, Gaggia could refine its offer of fully automatic espresso machines. The company launched \"Syncrony Digital\", \"Syncrony Logic\", \"Titanium\" and \"Platinum\". The new era of domestic machines began: at the push of a button, it automatically grinds, tamps and brews an espresso directly in cup!",

            "The Gaggia's production site was moved from Robecco sul Naviglio (Milan) to Gaggio Montano (Bologna), to the Saeco International HQ.",

            "Another era starts when the majority share of Gaggia was sold, together with Saeco Group, to Royal Philips Electronics. The Dutch multinational recognized the company's potential and operated consistent investments to develop the brand.",

            "On the occasion of the celebrations for the 75th Anniversary of Achille Gaggia's patent, the Group renovates the product range and revamps the brand, with the aim to strengthen Gaggia's competitive position in the market of domestic espresso machines. There is a come back to the historic logo GAGGIA MILANO, that underlines the strong bond with tradition and the company's values and hometown. For what concerns the product portfolio, in the years Gaggia launches various new ranges.",

            "Just like before, 80 years after the filing of the famous patent, we work and design every day with passion, honoring a unique tradition for the love of the Italian espresso."
            
        ]

        var totalWidth = 1200;

        //---createbuttons--------------------------------------------------------------------------------------------------------------

        // for(var i=0; i<10; i++){

        //     var time = instText("butText", 1930+(i*10), "Montserrat", 12, "white", "center", -450+(i*100),  timelineBar.lp.y+24, 100, 50,  80, timeLineCont);
        //     timeLineArray.push(time);
            
        // }

        // timeLineArray.push(timelineBar);
        // timeLineArray.push(timeLinePoint);

        //---createnav--------------------------------------------------------------------------------------------------------------

        // var arrowL = inst("arrowBut1", "arrowBut", -60, -53, 19, 21, 80, timeLineCont2 );
        // var arrowR = inst("arrowBut2", "arrowBut",  40, -53, 19, 21, 80, timeLineCont2 );
        // arrowR.f=true;

        // var arrowButL = button("arrowButL", "clearColor", "clearColor", -60, -53, 60, 20, 40, "prevDot", timeLineCont2 );
        // var arrowButR = button("arrowButR", "clearColor", "clearColor", 0, -53, 60, 20, 40, "nextDot", timeLineCont2 );

        galleryRightButton = button("grb", "clearColor", "clearColor", 0, -53, 60, 20, 80, "galleryRight", timeLineCont3 );
        galleryLeftButton = button("glb", "clearColor", "clearColor", 0, -53, 60, 20, 80, "galleryLeft", timeLineCont3 );
        galleryRightButton.useCenter=true;
        galleryLeftButton.useCenter=true;

        // var prev = instText("prev", "prev", "Montserrat", 12, "white", "right", -10,  timelineBar.lp.y-42, 100, 50,  80, timeLineCont2);
        // var next = instText("next", "next", "Montserrat", 12, "white", "left", 11,  timelineBar.lp.y-42, 100, 50,  80, timeLineCont2);

        // timeLineArray2.push(arrowL);
        // timeLineArray2.push(arrowR);
        // timeLineArray2.push(prev);
        // timeLineArray2.push(next);

        // for(var i=0; i<timeLineArray.length; i++){
        //     timeLineArray[i].a=0;
        // }

        // for(var i=0; i<timeLineArray2.length; i++){
        //     timeLineArray2[i].a=0;
        // }

        // timeLineCont.lp.y=2000;

        // testBox = inst("testPattern", "whiteColor", 0, 0, 10, canvas.height, 90, rootCont );
        // testBox.a=.3;


        canvasAction="waitForLoad";

    }else if(canvasAction==="waitForLoad"){

        if(soundsLoaded===true){
            ready2D=true;
        }

        if(ready2D===true && ready3D===true){
            
            console.log("done");
            dotsReady=true;
            canvasAction="introTweens";

        }
    
    }else if(canvasAction==="introTweens"){

        canvasAction="go";

    }else if(canvasAction==="go"){

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        //---makewhitefadergooff--------------------------------------------------------------------------------------------------------------

        // faderWhite.lp.y+=1000*dt;

        //---turnoffdrag--------------------------------------------------------------------------------------------------------------

        dragCont.p.x = winCenterX + 2;
        dragCont.p.y = winCenterY + 15;

        if(destRotation.x>-.25 || destRotation.x<-.35 || destRotation.y<-.05 || destRotation.y>.05){
            showDrag=false
        }

        if(showDrag===true){
            if(drag.a<1){
                drag.a+=dt*2;
            }
            if(drag.a>1){
                drag.a=1;
            }
            if(dragGlow.a<.2){
                dragGlow.a+=dt*2;
            }
        }else{
            if(drag.a>0){
                drag.a-=dt*2;
            }
            if(drag.a<0){
                drag.a=0;
            }
            if(dragGlow.a>0){
                dragGlow.a-=dt*2;
            }
        }

        if(histCont!==null){
            
            histCont.lp.x = (canvas.width/pr)/2;

        }

        
    }

    requestAnimationFrame(updateCanvas);

    //---loops--------------------------------------------------------------------------------------------------------------

    renderLoop();
    handleButtons();
    handleOngoingTouches();
    setUpMobileGameButtons();
    particleLoop();
    if(mobile===false){
        clickButtonCheck(this.mouseX, this.mouseY);
    }

    //---output--------------------------------------------------------------------------------------------------------------
    
    if(useOutput===true){

        this.ctx.font = "40px Ariel";
        this.ctx.id = "feedback";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";
        
        if(ready2D===true){
            this.ctx.fillText(
                currentDot +
                " / " +
                galleryDest +
                " / " +
                ongoingTouches.length +
                " / " +
                fps,
            0,
            200
            );
        }

    }

}

const times = [];
let fps;

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    refreshLoop();
  });
}

refreshLoop();

//---handle gallery--------------------------------------------------------------------------------------------------------------

function galleryRight(){

    galleryDest+=1;

}

function galleryLeft(){
    
    galleryDest-=1;

}

var galleryDest = 0;

function handleGallery(){

    if(action==="section3" || action==="move" && section==3){

        //---scroll--------------------------------------------------------------------------------------------------------------

        currentDot = Math.round(galleryDest);

        if(currentDot>24){
            currentDot=24;
        }

        if(currentDot<0){
            currentDot=0;
        }

        if(galleryDest>24){
            galleryDest=24;
        }

        if(galleryDest<0){
            galleryDest=0;
        }

        scene3Type1.innerHTML = dateArray[currentDot];
        histText.innerHTML = histArray[currentDot];

        //---position--------------------------------------------------------------------------------------------------------------

        timeLineCont3.lp.x=window.innerWidth/2;
        timeLineCont3.lp.y=window.innerHeight/2;

        for(var i=0; i<timeLineArray.length; i++){
            timeLineArray[i].a=0;
        }

        for(var i=0; i<timeLineArray2.length; i++){
            timeLineArray2[i].a=0;
        }

        //---sizethepictures--------------------------------------------------------------------------------------------------------------

        var picWidth = 780;
        var picHeight = 520;

        if(window.innerHeight<750 && window.innerWidth>window.innerHeight){

            picHeight=window.innerHeight*.7;
            picWidth=780*(picHeight/520);
    
        }else if(window.innerWidth<780 && window.innerWidth<window.innerHeight){

            picWidth=window.innerWidth;
            picHeight=520*(picWidth/780);

        }

        //---position--------------------------------------------------------------------------------------------------------------
        
        galleryRightButton.w = picWidth/2;
        galleryRightButton.h = picHeight;

        galleryRightButton.lp.x=picWidth/4;
        galleryRightButton.lp.y=0;

        galleryLeftButton.w = picWidth/2;
        galleryLeftButton.h = picHeight;

        galleryLeftButton.lp.x=-picWidth/4;
        galleryLeftButton.lp.y=0;

        //---aligntext--------------------------------------------------------------------------------------------------------------

        var extraSpace = (window.innerHeight-picHeight)/2;
        
        histText.style.bottom = (extraSpace-120)+"px";

        scene3Type2.style.opacity+=dt;
        if(scene3Type2.style.opacity>1){
            scene3Type2.style.opacity=1
        }

        // histText.style.opacity+=dt;
        // if(histText.style.opacity>1){
            // histText.style.opacity=1
        // }

        // histText.style.opacity = scene3Type1.style.opacity;

        if(window.innerHeight<750 && window.innerWidth>window.innerHeight){

            //if landscape
            histText.style.opacity = 0;
            histText.style.top = -1000;
            scene3Type2.style.opacity = 0;
            
            scene3Type1.style.fontSize = 80;

            section3Text.style.top = (extraSpace-35)+"px";
            scene3Type1.style.fontSize = "20px";

        }else if(window.innerWidth<700){

            section3Text.style.top = (extraSpace-75)+"px";
            scene3Type1.style.fontSize = "40px";

        }else if(window.innerWidth<1140){

            section3Text.style.top = (extraSpace-95)+"px";
            scene3Type1.style.fontSize = "40px";

        }else {

            section3Text.style.top = (extraSpace-120)+"px";
            scene3Type1.style.fontSize = "80px";

        }

        //---handle gallery--------------------------------------------------------------------------------------------------------------

        for(var i=0; i<galleryPics.length; i++){

            var gp = galleryPics[i];

            gp.destx = (i-currentDot)*15;

            var extrax = Math.abs(i-currentDot);
            
            var extraAmount = 20+(extrax*1);

            if(i<currentDot){
                gp.destx-=extrax*extraAmount;
            }else if(i>currentDot){
                gp.destx+=extrax*extraAmount;
            }
            
            gp.z = 50-(Math.abs(i-currentDot)*1)
            gp.desta = 1-(Math.abs(i-currentDot)*.1)

            if(gp.desta<0){
                gp.desta=0;
            }

            gp.dests = 1-(Math.abs(i-currentDot)*.045)
            if(gp.dests<.7){
                gp.dests=.7;
            }

            var gallerySpeed = 8;
            var gallerySpeed2 = 4;

            gp.lp.x = lerp(gp.lp.x, gp.destx, dt*gallerySpeed)

            
            if(delayPics<=0){
                if(gp.a<=0){
                    gp.a=0;
                }
                gp.a = lerp(gp.a, gp.desta, dt*gallerySpeed2)
            }else{
                gp.a=0
                // console.log(delayPics)
            }

            if(i===currentDot){
                gp.w = lerp(gp.w, gp.dests*picWidth, dt*gallerySpeed)
                gp.h = lerp(gp.h, gp.dests*picHeight, dt*gallerySpeed)
            }else{
                gp.w = lerp(gp.w, gp.dests*picWidth, dt*gallerySpeed2)
                gp.h = lerp(gp.h, gp.dests*picHeight, dt*gallerySpeed2)
            }

        }

        delayPics-=dt;
        
    }else{

        delayPics=.5;

        for(var i=0; i<galleryPics.length; i++){

            galleryPics[i].a-=dt*5;
            if(galleryPics[i].a<0){
                galleryPics[i].a=0;
            }

        }

        galleryRightButton.lp.y=-1000;
        galleryLeftButton.lp.y=-1000;

    }

}

//---handledots--------------------------------------------------------------------------------------------------------------

var dotsReady=false;

function handleDots(){

    if(dotsReady===true){

        if(Math.abs(camContY.rotation.y)<1.57){
            facingRightDirection=true;
        }else{
            facingRightDirection=false;
        }
        // 
        for(var i=0; i<bDots.length; i++){

            bDots[i].p.x = vectorToScreenPos(tourPoints[i]).x;
            bDots[i].p.y = vectorToScreenPos(tourPoints[i]).y;

            // console.log(i+" / "+ bDots[i].mainSprite.lp.x+" / "+bDots[i].mainSprite.lp.y );

            var mouseDist = getDistance( mouseX, mouseY, bDots[i].mainSprite.lp.x, bDots[i].mainSprite.lp.y );
            var mouseAlpha = mouseDist/200;
            if(mouseAlpha<0){
                mouseAlpha=0;
            }else if(mouseAlpha>.5){
                mouseAlpha=.5;
            }
            var closeNess = 1-mouseAlpha;

            //  console.log(i+" / "+bDots[i].section);

            if(facingRightDirection===false && bDots[i].section===1){

                // console.log("wrongdirecttion")

                bDots[i].mainSprite.a = lerp(bDots[i].mainSprite.a, 0, 8*dt);
            
            }else if(action==="tour" && bDots[i].section===1){

                bDots[i].mainSprite.a = lerp(bDots[i].mainSprite.a, 1, 8*dt);
            
            }else if(action==="section2" && bDots[i].section===2){
                
                bDots[i].mainSprite.a = lerp(bDots[i].mainSprite.a, 1, 8*dt);
            
            }else{

                bDots[i].mainSprite.a = 0;

            }
            
            if(bDots[i].mainSprite.rolledOver===false || bDots[i].section!==section || action==="landing" || action==="toLanding" || action==="startTour"){

                bDots[i].mainSprite.varFloat1 = lerp(bDots[i].mainSprite.varFloat1, 0, dt*20);

                bDots[i].mainSprite.count+=dt;
                if(bDots[i].mainSprite.count>1 && facingRightDirection===true && bDots[i].section===section){
                    bDots[i].mainSprite.count=0;
                    makeRollOverDot2(bDots[i],false);
                }

                bDots[i].mainText.a-=dt*2;
                if(bDots[i].mainText.a<0){
                    bDots[i].mainText.a=0;
                }

                bDots[i].mainText.lp.y = lerp(bDots[i].mainText.lp.y, 0, dt*3);
                bDots[i].mainText.a = lerp(bDots[i].mainText.a, 0, dt*3);
                

            }else if(action==="tour"){

                bDots[i].mainSprite.varFloat1 = lerp(bDots[i].mainSprite.varFloat1, 5, dt*20);

                bDots[i].mainSprite.count+=dt;
                if(bDots[i].mainSprite.count>.5 && facingRightDirection===true && bDots[i].section===section){
                    bDots[i].mainSprite.count=0;
                    makeRollOverDot2(bDots[i],true);
                }

                bDots[i].mainText.a = lerp(bDots[i].mainText.a, 1, dt*7);
                bDots[i].mainText.lp.y = lerp(bDots[i].mainText.lp.y, -30, dt*7);

            }

        }

    }

}

function makeRollOverDot(ob){

    if(action==="tour" || action==="section2"){

        var ms=1;
        if(mobile===true){
           ms=.5; 
        }

        var dot = inst("rollOverDot", "roundButton2", 0,  0, 10*ms, 10*ms,  60, ob );
        dot.useCenter=true;
        particles.push(dot);
        dot.section=section;

        var tMax1 = new TimelineMax();
        tMax1.to(dot, 1.75, {w: 130*ms, h:130*ms, a:0,  ease: Expo.easeOut})
    }

}

function makeRollOverDot2(ob,roll){

    if(action==="tour" || action==="section2"){

        var ms=1;
        if(mobile===true){
           ms=.75; 
        }

        var dot = inst("rollOverDot", "roundButton2", 0,  0, 10*ms, 10*ms,  60, ob );
        dot.useCenter=true;
        particles.push(dot);
        dot.section=section;

        var tMax1 = new TimelineMax();
        if(roll===true){
            tMax1.to(dot, 3, {w: 100, h:100, a:0,  ease: Expo.easeOut})
        }else{
            tMax1.to(dot, 8, {w: 70*ms, h:70*ms, a:0,  ease: Expo.easeOut})
        }
        
    }

}

//---resize--------------------------------------------------------------------------------------------------------------

var pixelWidth = 0;
var pixelHeight = 0;
var pr = 1;

var testBox = null;

function resizeMobile(){

    // var canvasHeight = window.innerHeight;
    // var canvasWidth = window.innerWidth;
    // var canvasWidth2 = window.innerWidth;
    // var canvasHeight2 = window.innerHeight;
    // 
    // if (window.innerWidth > window.innerHeight) {
    //     mf = canvasHeight / originalHeight;
    //     mf2 = originalHeight / canvasHeight;
    // } else {
    //     mf = canvasWidth / originalWidth;
    //     mf2 = originalWidth / canvasWidth;
    // }
    
    // if (window.innerWidth > window.innerHeight) {
    //     canvas.width = originalWidth * mf;
    //     canvas.height = canvasHeight2;
    // } else {
    //     canvas.width = canvasWidth2;
    //     canvas.height = originalHeight * mf;
    // }
    
    // var ctxScale = mf;
    // ctx.scale(ctxScale, ctxScale);
    
    // pixelWidth = canvasWidth2 * mf2;
    // pixelHeight = canvasHeight2 * mf2;

    // var scale = window.devicePixelRatio;
    // console.log("DEV PIX RATIO" )+window.devicePixelRatio;
    // canvas.width = Math.floor(window.innerWidth * scale);
    // canvas.height = Math.floor(window.innerHeight * scale);
    // ctx.scale(1/scale, 1/scale);
// 
    // var dpr = window.devicePixelRatio || 1;
    // // Get the size of the canvas in CSS pixels.
    // var rect = canvas.getBoundingClientRect();
    // // Give the canvas pixel dimensions of their CSS
    // // size * the device pixel ratio.
    // canvas.width = rect.width * dpr;
    // canvas.height = rect.height * dpr;
    // var ctx = canvas.getContext('2d');
    // // Scale all drawing operations by the dpr, so you
    // // don't have to worry about the difference.
    // ctx.scale(dpr, dpr);

    var contextM = ctx;
    width = window.innerWidth;
    height = window.innerHeight;

    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;

    pr = devicePixelRatio;

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = (
        contextM.webkitBackingStorePixelRatio ||
        contextM.mozBackingStorePixelRatio ||
        contextM.msBackingStorePixelRatio ||
        contextM.oBackingStorePixelRatio ||
        contextM.backingStorePixelRatio || 1
    );

    // determine the actual ratio we want to draw at
    const ratio = devicePixelRatio / backingStoreRatio;

    // console.log(devicePixelRatio+ " / "+backingStoreRatio)

    if (devicePixelRatio !== backingStoreRatio) {
        // set the 'real' canvas size to the higher width/height
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        // ...then scale it back down with CSS
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }
    else {
        // this is a normal 1:1 device; just scale it simply
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '';
        canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    // context.scale(ratio, ratio);

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    pixelWidth = window.innerWidth;
    pixelHeight = window.innerWidth;

    if(histCont!==null){
        histCont.p.x = window.innerWidth/2;
    }
    
    if(testBox!=null){
        // testBox.w=canvas.width;
        // testBox.h=canvas.height;
    }
    
    
}

function resizeBrowser(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
}

//---callloop--------------------------------------------------------------------------------------------------------------

start();
updateCanvas()
