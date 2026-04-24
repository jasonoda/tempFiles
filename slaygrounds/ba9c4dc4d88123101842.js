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

const validateGameDataCode = `function validateGameData(hurtData, breadcrumbs, finalGameData) {

    // add final breadcrumb

    breadcrumbs.push(finalGameData.metadata.breadcrumb);

    // validation object

    let validationObject = {
        isValid: true,
        reasons: []
    };

    var allScores = 0;

    // console.log(finalGameData);
    // console.log(finalGameData.winBonus);

    allScores+=finalGameData.winBonus;

    // console.log("win b "+allScores);

    for(var i=0; i<breadcrumbs.length; i++){

        allScores+=breadcrumbs[i].coinsFoundThisLevel;
        allScores+=breadcrumbs[i].enemiesKilledThisLevel;

        // console.log(i+" - "+allScores);

    }

    // console.log("f "+allScores+" / "+finalGameData.score);

    if(allScores!==finalGameData.score){
        validationObject.isValid = false;
        validationObject.reasons.push("scores don't add up")
    }

    // console.log(finalGameData.life);
    if(finalGameData.life>4){
        validationObject.isValid = false;
        validationObject.reasons.push("messing with high life")
    }

    // console.log(finalGameData.powerUps.length);
    if(finalGameData.powerUps.length>=21){
        validationObject.isValid = false;
        validationObject.reasons.push("too many power ups")
    }

    // console.log("wwc "+finalGameData.weaponWaitCount+" / "+finalGameData.powerUps.length*5.5)
    if(finalGameData.weaponWaitCount>finalGameData.powerUps.length*5.5){
        validationObject.isValid = false;
        validationObject.reasons.push("weapon wait count was over possible limit")
    }

    // console.log(finalGameData.playerLevel);
    if(finalGameData.playerLevel>=22){
        validationObject.isValid = false;
        validationObject.reasons.push("player level is too high")
    }

    // console.log(finalGameData.timesHurt);
    if(finalGameData.timesHurt>6){
        validationObject.isValid = false;
        validationObject.reasons.push("hurt more than 6 times")
    }

    return validationObject;


}`;
