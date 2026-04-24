/**
 * This function should return an object that looks like this:
 *
 * {
 *   isValid: true | false,
 *   reasons: [] // an array of strings
 * }
 *
 * @param initialGameData This is the same data structure passed to the iFrame using the window.CG_API.InitGame message
 * @param breadcrumbs This is an array of breadcrumb objects received from the game using the window.GC_API.BreadCrumb message
 * @param finalGameData This is the final score object sent from the game using the window.GC_API.FinalScores message
 */

const validateGameDataCode = 
`
function validateGameData(initialGameData, breadcrumbs, finalGameData) {

  // add final breadcrumb

  breadcrumbs.push(finalGameData.metadata.breadcrumb);

  console.log("validate game data");
  
  var isValid = true;
  var reasons = [];

  console.log("---------------------------------------");

  for(var i=0; i<breadcrumbs.length; i++){

    console.log(i);
    console.log(breadcrumbs[i]);

  }

  console.log("---------------------------------------");

  console.log(finalGameData);

  console.log("---------------------------------------");

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // did time ever bump up?

  for(var i=1; i<breadcrumbs.length; i++){

    if( breadcrumbs[i].timeLeft > breadcrumbs[i-1].timeLeft){

      console.log("Time was subtracted")

      isValid=false;
      reasons.push("Time was subtracted: " + breadcrumbs[i].timeLeft +" > "+ breadcrumbs[i-1].timeLeft );

    }

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // do all tiers add up to final?

  var tier1Count = 0;
  var tier2Count = 0;
  var tier3Count = 0;

  // test hit tiers

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].hitTier===1){

      tier1Count+=1;

    }else if(breadcrumbs[i].hitTier===2){

      tier2Count+=1;

    }else if(breadcrumbs[i].hitTier===3){

      tier3Count+=1;

    }

  }

  // test hit tiers

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].timeTier===1){

      tier1Count+=1;

    }else if(breadcrumbs[i].timeTier===2){

      tier2Count+=1;

    }else if(breadcrumbs[i].timeTier===3){

      tier3Count+=1;

    }

  }

  // test hit tiers

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].keyTier===1){

      tier1Count+=1;

    }else if(breadcrumbs[i].keyTier===2){

      tier2Count+=1;

    }else if(breadcrumbs[i].keyTier===3){

      tier3Count+=1;

    }

  }

  // did they match

  if(tier1Count!==finalGameData.tier1Medals){

    console.log("Tier 1 didn't add up")

    isValid=false;
    reasons.push("Tier 1 didn't add up: " + tier1Count +" / "+ finalGameData.tier1Medals );

  }

  if(tier2Count!==finalGameData.tier2Medals){

    console.log("Tier 2 didn't add up")

    isValid=false;
    reasons.push("Tier 2 didn't add up: " + tier2Count +" / "+ finalGameData.tier2Medals );

  }

  if(tier3Count!==finalGameData.tier3Medals){

    console.log("Tier 3 didn't add up")

    isValid=false;
    reasons.push("Tier 3 didn't add up: " + tier3Count +" / "+ finalGameData.tier3Medals );

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // does all the life stuff add up?
  // -track hits and heals

  var myLife = 10;

  console.log("bread down");
  for(var i=0; i<breadcrumbs.length; i++){

    myLife-=breadcrumbs[i].levelHits;
    myLife+=breadcrumbs[i].levelHeals;

    console.log(breadcrumbs[i].levelHits+" / "+breadcrumbs[i].levelHeals)
    
  }
  console.log("----------------");

  if(myLife!==finalGameData.life){

    console.log("Life didn't add up")

    isValid=false;
    reasons.push("Hits and heals didn't add up: " + myLife +" / "+ finalGameData.life);

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // are there more keys than the total possible?

  if(finalGameData.keysFound>breadcrumbs.length*4){

    console.log("Too many keys")

    isValid=false;
    reasons.push("Too many keys: " + finalGameData.keysFound +" / "+ breadcrumbs.length*4 );

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // are there more coins than the total created?
  // -track coins created

  if(finalGameData.coinsFound>finalGameData.coinsMade){

    console.log("Has found more coins than were created")

    isValid=false;
    reasons.push("Has found more coins than were created: " + finalGameData.coinsFound +" / "+ finalGameData.coinsMade );

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // was there more money spent than picked up?
  // -track money spent

  if(finalGameData.coinsSpent>finalGameData.coinsFound){

    console.log("Has spent more coins than were created")

    isValid=false;
    reasons.push("Has spent more coins than were created: " + finalGameData.coinsSpent +" --- "+ finalGameData.coinsMade+" / "+ finalGameData.coinsFound );

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  // was too much time taken in gameplay?
  // -calculate extra time

  var timePassedSinceGameStarted = Math.round((300-this.seconds) + this.extraTime);
  console.log("total game time: "+timePassedSinceGameStarted);

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  for(var i=0; i<reasons.length; i++){

    console.log( reasons[i] );

  }

  if(reasons.length===0){
    console.log("IS VALID!")
  }

  console.log("---------------------------------------");

  var status = {
    isValid: isValid,
    reasons: reasons
  }

  return status

}
`


const validateGameDataCodeTest = function validateGameData(initialGameData, breadcrumbs, finalGameData) {

    const NUMBER_OF_EXPECTED_BREADCRUMBS = 10;

    // NOTE TO GAME DEVELOPER. All internally called functions should be scoped within
    // the validateGameData function. The only exposed function that will end up in the
    // caller's namespace should be validateGameData().

    // Function outputs to console if uncommented
    function validateGameDataLogger(val) {
      //console.log(val);
    }

    // Function that checks the coin arrays
    function checkCoinArray( allCoinPositions, breadCrumbCoins, reasons ){

        var badCoins = 0;

        for(var i=0; i<breadCrumbCoins.length; i++){

            var hasFound=false;
            var closest=100000;

            for(var j=0; j<allCoinPositions.length; j++){

                if( Math.abs(allCoinPositions[j][0] - breadCrumbCoins[i][0]) < closest){
                    closest = Math.abs(allCoinPositions[j][0] - breadCrumbCoins[i][0]);
                }

                //check to see if the z difference is within 3 which is the max difference to be logged
                //check to see if the rotation matches

                if( Math.abs(allCoinPositions[j][0] - breadCrumbCoins[i][0] < 3) && allCoinPositions[j][1]===breadCrumbCoins[i][1]){

                    hasFound=true;
                    j=10000;

                }

            }

            if(hasFound===true){
                validateGameDataLogger("coin ok "+i)
            }else{
                validateGameDataLogger("coin bad "+i+" / "+closest)
                validateGameDataLogger(breadCrumbCoins[i]);
                badCoins+=1;
            }

        }

        if(badCoins>=1){
            reasons.push("FOUND "+badCoins+" BAD COINS");

            for(var i=0; i<allCoinPositions.length; i++){
                // console.log(allCoinPositions[i]);
            }

            return true;
        }else{
            return false;
        }

    }

    // Function that checks the score array
    function checkScoreArray( breadCrumbScores, finalScores, pointScore, reasons ){

        var isCheating = false;

        if ((breadCrumbScores.length !== NUMBER_OF_EXPECTED_BREADCRUMBS) || (finalScores.length !== NUMBER_OF_EXPECTED_BREADCRUMBS)) {

            //see if there is no record or improper entries of the breadCrumbScores

            reasons.push("INCORRECT QUANTITY (SHOULD BOTH BE " + NUMBER_OF_EXPECTED_BREADCRUMBS + ") OF BREADCRUMBS SCORES = " + breadCrumbScores.length + " OR FINAL SCORES = " + finalScores.length);
            validateGameDataLogger("INCORRECT NUMBER OF BREADCRUMBS "+breadCrumbScores.length)
            isCheating=true;

            for(var i=0; i<finalScores.length; i++){
                // console.log(">>>? "+finalScores[i]);
            }

        } else {

            var totalScore = 0;

            for(var i=0; i<breadCrumbScores.length; i++){

                if(breadCrumbScores[i]>2000){

                    // flag for cheating - level score too high
                    reasons.push("LEVEL "+i+" SCORE TOO HIGH "+breadCrumbScores[i]);
                    validateGameDataLogger("FLAG FOR CHEATING - LEVEL SCORE TOO HIGH")
                    isCheating=true;

                }

                totalScore+=breadCrumbScores[i];

            }

            // get the final score recorded at end of game and compare to all these numbers recorded along the way.
            if(totalScore!=pointScore){

                reasons.push("BREADCRUMB SCORES NOT ADDING UP "+pointScore+" / "+totalScore);
                validateGameDataLogger("FLAG FOR CHEATING - BREADCRUMB SCORES NOT ADDING UP "+pointScore+" / "+totalScore)
                isCheating=true;

            }

            // get the final levelScores recorded at end of game and see if they differ from the bread crumb scores
            if( breadCrumbScores[0]!==finalScores[0] ||
                breadCrumbScores[1]!==finalScores[1] ||
                breadCrumbScores[2]!==finalScores[2] ||
                breadCrumbScores[3]!==finalScores[3] ||
                breadCrumbScores[4]!==finalScores[4] ||
                breadCrumbScores[5]!==finalScores[5] ||
                breadCrumbScores[6]!==finalScores[6] ||
                breadCrumbScores[7]!==finalScores[7]  ||
                breadCrumbScores[8]!==finalScores[8]  ||
                breadCrumbScores[9]!==finalScores[9]  ) {

                validateGameDataLogger(breadCrumbScores[0]+" / "+finalScores[0]);
                validateGameDataLogger(breadCrumbScores[1]+" / "+finalScores[1]);
                validateGameDataLogger(breadCrumbScores[2]+" / "+finalScores[2]);
                validateGameDataLogger(breadCrumbScores[3]+" / "+finalScores[3]);
                validateGameDataLogger(breadCrumbScores[4]+" / "+finalScores[4]);
                validateGameDataLogger(breadCrumbScores[5]+" / "+finalScores[5]);
                validateGameDataLogger(breadCrumbScores[6]+" / "+finalScores[6]);
                validateGameDataLogger(breadCrumbScores[7]+" / "+finalScores[7]);
                validateGameDataLogger(breadCrumbScores[8]+" / "+finalScores[8]);
                validateGameDataLogger(breadCrumbScores[9]+" / "+finalScores[9]);

                reasons.push("BREADCRUMB SCORES NOT MATHCING FINAL SCORES");
                validateGameDataLogger("FLAG FOR CHEATING - BREADCRUMB SCORES NOT MATHCING FINAL SCORES")
                isCheating=true;

            }

        }

        return isCheating;

    }

    // Function to check last cheat tricks
    function otherCheatingChecks( finalGameData, reasons ){

        var score = finalGameData.score
        var pointScore = finalGameData.metadata.pointScore
        var spikePenaltyScore = finalGameData.metadata.spikePenaltyScore
        var penaltyScore = finalGameData.metadata.penaltyScore
        var levelScore1 = finalGameData.metadata.levelScore1
        var levelScore2 = finalGameData.metadata.levelScore2
        var levelScore3 = finalGameData.metadata.levelScore3
        var levelScore4 = finalGameData.metadata.levelScore4
        var levelScore5 = finalGameData.metadata.levelScore5
        var levelScore6 = finalGameData.metadata.levelScore6
        var levelScore7 = finalGameData.metadata.levelScore7
        var levelScore8 = finalGameData.metadata.levelScore8
        var levelScore9 = finalGameData.metadata.levelScore9
        var levelScore10 = finalGameData.metadata.levelScore10
        var smallEthe = finalGameData.metadata.smallEthe
        var mediumEthe = finalGameData.metadata.mediumEthe
        var largeEthe = finalGameData.metadata.largeEthe
        var scoreLog = finalGameData.metadata.scoreLog

        var isCheating = false;

        validateGameDataLogger("-----------------------");

        validateGameDataLogger("ls1 "+levelScore1);
        validateGameDataLogger("ls2 "+levelScore2);
        validateGameDataLogger("ls3 "+levelScore3);
        validateGameDataLogger("ls4 "+levelScore4);
        validateGameDataLogger("ls5 "+levelScore5);
        validateGameDataLogger("ls6 "+levelScore6);
        validateGameDataLogger("ls7 "+levelScore7);
        validateGameDataLogger("ls8 "+levelScore8);
        validateGameDataLogger("ls9 "+levelScore9);
        validateGameDataLogger("ls10 "+levelScore10);

        validateGameDataLogger("-----------------------");

        validateGameDataLogger("large ethe "+largeEthe);
        validateGameDataLogger("medium ethe "+mediumEthe);
        validateGameDataLogger("small ethe "+smallEthe);

        validateGameDataLogger("-----------------------");

        validateGameDataLogger("pointscore "+ pointScore);
        validateGameDataLogger("spikePenaltyScore "+ spikePenaltyScore);
        validateGameDataLogger("penaltyScore "+ penaltyScore);

        validateGameDataLogger("-----------------------");

        validateGameDataLogger("Score "+ score);

        validateGameDataLogger("-----------------------");

        for(var i=0; i<scoreLog.length; i++){
            validateGameDataLogger(">>>>> "+scoreLog[i][0]+" / "+scoreLog[i][2]+" / "+scoreLog[i][3]+" / "+scoreLog[i][4]);
        }

        validateGameDataLogger("-----------------------");

        var maxAmount = 2000;

        //test break
        // score = 50000;

        if(score>maxAmount*NUMBER_OF_EXPECTED_BREADCRUMBS){

            // flag for cheating - impossible score, over 14000
            reasons.push("IMPOSSIBLY HIGH SCORE");
            validateGameDataLogger("FLAG FOR CHEATING - IMPOSSIBLY HIGH SCORE");
            isCheating=true;

        }

        validateGameDataLogger("-----------------------");

        //test break
        // levelScore1 = 50000;

        if (levelScore1>maxAmount ||
            levelScore2>maxAmount ||
            levelScore3>maxAmount ||
            levelScore4>maxAmount ||
            levelScore5>maxAmount ||
            levelScore6>maxAmount ||
            levelScore7>maxAmount ||
            levelScore8>maxAmount ||
            levelScore9>maxAmount ||
            levelScore10>maxAmount) {

            // flag for cheating - level score too high
            reasons.push("IMPOSSIBLY LEVEL HIGH SCORE "+levelScore1+" / "+levelScore2+" / "+levelScore3+" / "+levelScore4+" / "+levelScore5+" / "+levelScore6+" / "+levelScore7+" / "+levelScore8+" / "+levelScore9+" / "+levelScore10);
            validateGameDataLogger("FLAG FOR CHEATING - LEVEL SCORE");
            isCheating=true;

        }

        //test break
        // smallEthe = 50000;

        if( smallEthe > 13*NUMBER_OF_EXPECTED_BREADCRUMBS ||
            mediumEthe > 6*NUMBER_OF_EXPECTED_BREADCRUMBS ||
            largeEthe > 3*NUMBER_OF_EXPECTED_BREADCRUMBS ){

            // flag for cheating - tampering with ethe totals
            reasons.push("COIN TOTALS TAMPERED WITH "+smallEthe+" / "+mediumEthe+" / "+largeEthe);
            validateGameDataLogger("FLAG FOR CHEATING - COIN TOTALS TAMPERED WITH");
            isCheating=true;

        }

        //test break
        // penaltyScore = 0;

        if( penaltyScore===0 ){

            // flag for cheating - never went off platform - very unlikely
            reasons.push("NEVER WENT OFF PLATFORM");
            validateGameDataLogger("FLAG FOR CHEATING - NEVER WENT OFF PLATFORM");
            isCheating=true;

        }

        console.log("fs "+score+" / "+penaltyScore);

        if( score != pointScore - penaltyScore - spikePenaltyScore ){

            // flag for cheating - final score variable not adding up
            reasons.push("SCORES NOT ADDING UP "+score+" NOT EUQAL TO "+pointScore+" - "+penaltyScore+" - "+spikePenaltyScore)
            validateGameDataLogger("FLAG FOR CHEATING - SCORES NOT ADDING UP");
            isCheating=true;

        }

        return isCheating;

    }

    var isValid = true;
    var reasons = [];

    if (initialGameData===null || breadcrumbs===null || finalGameData===null) {

        validateGameDataLogger("FAILED INITAL CHECK")
        reasons.push("FAILED INITAL CHECK")

        isValid = false;

    } else {

        //-------------------------------------------------------------------------------

        // get inital coin positions

        var allCoinPositions = [];

        for(var i=0; i<initialGameData.allCoinPositions.length; i++){

            allCoinPositions.push( initialGameData.allCoinPositions[i] );

        }

        // get bc coin positions

        var bcCoinPositions = [];

        //test break
        // var breakArray = new Array(9,999);
        // bcCoinPositions.push(breakArray)

        for(var i=0; i<breadcrumbs.length; i++){

            for(var j=0; j<breadcrumbs[i].coinsFoundThisLevel.length; j++){

                bcCoinPositions.push( breadcrumbs[i].coinsFoundThisLevel[j] );

            }

        }

        // check coin positions

        if( checkCoinArray( allCoinPositions, bcCoinPositions, reasons ) === true ){

            validateGameDataLogger(">>>>>>>>>>>>FAILED COIN POSITIONS")

            isValid = false;

        }

        //-------------------------------------------------------------------------------

        // bread crumb scores

        var breadCrumbScores = [];

        validateGameDataLogger(breadcrumbs);

        if (breadcrumbs.length !== NUMBER_OF_EXPECTED_BREADCRUMBS) {
            isValid = false;
            reasons.push("INVALID NUMBER OF BREADCRUMBS (SHOULD BE " + NUMBER_OF_EXPECTED_BREADCRUMBS + ", BUT FOUND " + breadcrumbs.length + ")");
        } else {

            for (var i = 0; i < breadcrumbs.length; i++){

                breadCrumbScores.push(breadcrumbs[i].scoreThisLevel)

            }

            //test break
            // breadCrumbScores[0]=9999;

            // final scores

            var finalScores = [];

            if (finalGameData?.metadata?.levelScore1) {
              finalScores.push( finalGameData.metadata.levelScore1 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore2) {
              finalScores.push( finalGameData.metadata.levelScore2 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore3) {
              finalScores.push( finalGameData.metadata.levelScore3 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore4) {
              finalScores.push( finalGameData.metadata.levelScore4 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore5) {
              finalScores.push( finalGameData.metadata.levelScore5 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore6) {
              finalScores.push( finalGameData.metadata.levelScore6 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore7) {
              finalScores.push( finalGameData.metadata.levelScore7 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore8) {
              finalScores.push( finalGameData.metadata.levelScore8 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore9) {
              finalScores.push( finalGameData.metadata.levelScore9 );
            } else {
              finalScores.push(0);
            }
            if (finalGameData?.metadata?.levelScore10) {
              finalScores.push( finalGameData.metadata.levelScore10 );
            } else {
              finalScores.push(0);
            }

            //test break
            // finalScores[1]=7777;

            // check scores

            if( checkScoreArray( breadCrumbScores, finalScores, finalGameData.metadata.pointScore, reasons ) === true ){

                validateGameDataLogger(">>>>>>>>>>>>FAILED SCORE CHECK");

                isValid = false;

            }
        }

        //-------------------------------------------------------------------------------

        if( otherCheatingChecks( finalGameData, reasons ) === true){

            validateGameDataLogger(">>>>>>>>>>>>FAILED FINAL CHECK");

            isValid = false;

        }

        //-------------------------------------------------------------------------------

    }

    if(reasons.length>0){

        validateGameDataLogger("REASONS FOR CHEATING:")

        for(var i=0; i<reasons.length; i++){

            validateGameDataLogger(reasons[i]);

        }

    }

    var status = {
        isValid: isValid,
        reasons: reasons
    }

    return status

};
