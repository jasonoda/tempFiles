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

  // were you hit more than 10 times

  this.timesHit=0;

  for(var i=0; i<breadcrumbs.length; i++){

    this.timesHit += breadcrumbs[i].timesHitThisLevel;

    if(this.timesHit>10){

      console.log("hit more than 10 times")

      isValid=false;
      reasons.push("hit more than 10 times: " + this.timesHit );

    }

  }

  //------------------------------------------------------------------------------------------------------------------------------------

  // did they add life somehow

  this.lowestLife = 10;

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].life>this.lowestLife){

      console.log("life was added somewhere")

      isValid=false;
      reasons.push("life was added somewhere");

    }

    this.lowestLife = breadcrumbs[i].life;

  }

  //------------------------------------------------------------------------------------------------------------------------------------

  // do all tiers add up

  this.allMedals = 0;

  // gold

  this.totalGold = 0;

  for(var i=0; i<breadcrumbs.length; i++){

    // console.log("cg "+i)

    if(breadcrumbs[i].tierHit===1){

      this.totalGold += 1;
      this.allMedals += 1;
      // console.log("gold tierHit "+i)

    }

    if(breadcrumbs[i].tierTime===1){

      this.totalGold += 1;
      this.allMedals += 1;
      // console.log("gold tierTime "+i)

    }

    if(breadcrumbs[i].tierFallBlock===1){

      this.totalGold += 1;
      this.allMedals += 1;
      // console.log("gold tierFallBlock "+i)

    }

  }

  console.log("gold "+finalGameData.tier1Medals+" / "+this.totalGold);

  if(finalGameData.tier1Medals > this.totalGold){

    console.log("gold medals didn't add up "+finalGameData.tier1Medals+" / "+this.totalGold);

    isValid=false;
    reasons.push("gold medals didn't add up "+finalGameData.tier1Medals+" / "+this.totalGold);

  }

  // silver

  this.totalSilver = 0;

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].tierHit===2){

      this.totalSilver += 1;
      this.allMedals += 1;

    }

    if(breadcrumbs[i].tierTime===2){

      this.totalSilver += 1;
      this.allMedals += 1;

    }

    if(breadcrumbs[i].tierFallBlock===2){

      this.totalSilver += 1;
      this.allMedals += 1;

    }

  }

  console.log("silver "+finalGameData.tier2Medals+" / "+this.totalSilver);

  if(finalGameData.tier2Medals > this.totalSilver){

    console.log("silver medals didn't add up "+finalGameData.tier2Medals+" / "+this.totalSilver);

    isValid=false;
    reasons.push("silver medals didn't add up "+finalGameData.tier2Medals+" / "+this.totalSilver);

  }

  // bronze

  this.totalBronze = 0;

  for(var i=0; i<breadcrumbs.length; i++){

    if(breadcrumbs[i].tierHit===3){

      this.totalBronze += 1;
      this.allMedals += 1;

    }

    if(breadcrumbs[i].tierTime===3){

      this.totalBronze += 1;
      this.allMedals += 1;

    }

    if(breadcrumbs[i].tierFallBlock===3){

      this.totalBronze += 1;
      this.allMedals += 1;

    }

  }

  console.log("bronze "+finalGameData.tier3Medals+" / "+this.totalBronze);

  if(finalGameData.tier3Medals > this.totalBronze){

    console.log("bronze medals didn't add up "+finalGameData.tier3Medals+" / "+this.totalBronze);

    isValid=false;
    reasons.push("bronze medals didn't add up "+finalGameData.tier3Medals+" / "+this.totalBronze);

  }

  // check if medal total is impossible

  console.log("all medals: "+this.allMedals+" / 27")

  if(this.allMedals>27){

    console.log("too many total medals "+this.allMedals+" / 27");

    isValid=false;
    reasons.push("too many total medals "+this.allMedals+" / 27");

  }

  //------------------------------------------------------------------------------------------------------------------------------------

  // check items

  this.totalItems = 0;

  for(var i=0; i<breadcrumbs.length; i++){

    this.totalItems += breadcrumbs[i].itemsBoughtThisLevel;
    
  }

  if(this.totalItems>finalGameData.itemsBoughtTotal){

    console.log("too many items "+this.totalItems+" / "+finalGameData.itemsBoughtTotal);

    isValid=false;
    reasons.push("too many items "+this.totalItems+" / "+finalGameData.itemsBoughtTotal);

  }

  //------------------------------------------------------------------------------------------------------------------------------------

  // check diamonds

  this.pickedUpDiamonds = 0;
  this.bonusDiamonds = 0;
  this.spentDiamonds = 0;

  // add the picked up diamonds

  for(var i=0; i<breadcrumbs.length; i++){

    this.pickedUpDiamonds += breadcrumbs[i].diamondsFoundThisLevel;
    console.log(i+" / "+breadcrumbs[i].diamondsFoundThisLevel)
    
  }

  // add the medal bonuses

  this.bonusDiamonds += finalGameData.tier1Medals*10;
  this.bonusDiamonds += finalGameData.tier2Medals*6;
  this.bonusDiamonds += finalGameData.tier3Medals*3;

  // subtract the amount paid

  this.spentDiamonds = finalGameData.itemsBoughtTotal*-50;

  // 

  console.log("picked up diamonds: "+this.pickedUpDiamonds)
  console.log("bonus diamonds: "+this.bonusDiamonds)
  console.log("spent: "+this.spentDiamonds)

  this.totalDiamonds = this.pickedUpDiamonds + this.bonusDiamonds + this.spentDiamonds;

  console.log("diamond result: "+this.totalDiamonds+" / "+finalGameData.endDiamondAmount)

  if(this.totalDiamonds>finalGameData.endDiamondAmount){

    console.log("too many items "+this.totalDiamonds+" / "+finalGameData.endDiamondAmount);

    isValid=false;
    reasons.push("too many items "+this.totalDiamonds+" / "+finalGameData.endDiamondAmount);

  }

  //------------------------------------------------------------------------------------------------------------------------------------

  // check level times

  for(var i=0; i<breadcrumbs.length-1; i++){

    if(breadcrumbs[i].levelTime<8){

      console.log("level time too short "+breadcrumbs[i].levelTime+" / 8");

      isValid=false;
      reasons.push("level time too short "+breadcrumbs[i].levelTime+" / 8");
  
    }

  }

  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------------

  console.log("---------------------------------------");

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

