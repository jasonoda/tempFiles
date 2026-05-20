

const scriptsInEvents = {

	async EventSheet1_Event2_Act36(runtime, localVars)
	{
		console.log("add listener here");
		window.addEventListener('message', event => {
			try {
				const message = JSON.parse(event.data);
				if (message?.type) {
					if (message.type === 'MuteState') {
						console.log("GET MUTE");
						
						const currentMuteSounds = message?.data?.soundsMuted;
						const currentMuteMusic = message?.data?.musicMuted;
						
						console.log("mute sounds: "+currentMuteSounds);
						
						if(currentMuteSounds===true){
							runtime.objects.engine.getFirstInstance().instVars.hearSounds=false;
							runtime.objects.engine.getFirstInstance().instVars.muteMult=-100000;
							console.log("m3");
							runtime.objects.muteButton.getFirstInstance().animationFrame=1;
							console.log("m4");
						}else{
							runtime.objects.engine.getFirstInstance().instVars.hearSounds=true;
							runtime.objects.engine.getFirstInstance().instVars.muteMult=0;
							console.log("m3");
							runtime.objects.muteButton.getFirstInstance().animationFrame=0;
							console.log("m4");
						}
						
						console.log("mute end");
						
					}
				}
			} catch (e) {
				console.log("fail");
				// Ignore exception - not a message for us and couldn't JSON parse it
				// console.log(e);
			}
		});
		
		
		
	},

	async EventSheet1_Event2_Act37(runtime, localVars)
	{
			// THIS IS THE GAMELOADED MESSAGE BEING SENT TO PARENT FRAME. THE _0xd7a82c function
			// is added to the string prototype in main.js. It is weirdly named to make it harder
			// for people to reverse engineer. 'TnzrY|nqrq' is 'GameLoaded' when de-obfuscated by
			// this function.
			if (window.parent && (typeof window.PBGAMEON === 'undefined')) {
				window.PBGAMEON = true; // Makes sure we are only going to send one of these messages to the parent container.
				try {
					window.parent.postMessage(JSON.stringify({
						  type: 'TnzrY|nqrq'._0xd7a82c(13)
						}), "*");
				} catch (e) {
					console.log('========= GAME NOT CONFIGURED ==========');
					console.log(e);
				}
			}
	},

	async EventSheet1_Event55_Act37(runtime, localVars)
	{
		console.log("no balls in play");
		
		//breadcrumb
		//bcObject.ballsLost+=1;
	},

	async EventSheet1_Event57_Act14(runtime, localVars)
	{
		//old end script was here
	},

	async EventSheet1_Event63_Act7(runtime, localVars)
	{
		console.log("resetallballs");
	},

	async EventSheet1_Event68_Act17(runtime, localVars)
	{
		console.log("tilt");
	},

	async EventSheet1_Event69_Act7(runtime, localVars)
	{
		console.log("tilt end 2");
	},

	async EventSheet1_Event141_Act1(runtime, localVars)
	{

	},

	async EventSheet1_Event317_Act15(runtime, localVars)
	{
		console.log("send to tilt");
	},

	async EventSheet1_Event326_Act4(runtime, localVars)
	{

	},

	async EventSheet1_Event328_Act4(runtime, localVars)
	{

	},

	async EventSheet1_Event331_Act2(runtime, localVars)
	{

	},

	async EventSheet1_Event337_Act1(runtime, localVars)
	{

	},

	async EventSheet1_Event338_Act2(runtime, localVars)
	{

	},

	async EventSheet1_Event340_Act3(runtime, localVars)
	{

	},

	async EventSheet1_Event344_Act1(runtime, localVars)
	{

	},

	async EventSheet1_Event370_Act4(runtime, localVars)
	{
		console.log(window.innerWidth)
	},

	async EventSheet1_Event370_Act7(runtime, localVars)
	{
		console.log(runtime.globalVars.cw)
	},

	async EventSheet1_Event399_Act1(runtime, localVars)
	{

	},

	async EventSheet1_Event400_Act4(runtime, localVars)
	{
		
		function MuteSounds(value) {
		
		
		   console.log("construct mute:");
		   console.log(value);
		   
		   runtime.objects.engine.getFirstInstance().instVars.hearSounds=false;
		   runtime.objects.engine.getFirstInstance().instVars.muteMult=-100000;
		   
		   window.parent.postMessage(JSON.stringify({
		       type: 'MuteSounds',
		       data: {
		                value
		       }
		   }), "*");
		}
		
		MuteSounds(true);
	},

	async EventSheet1_Event401_Act4(runtime, localVars)
	{
		
		function MuteSounds(value) {
		
		   console.log("construct mute:");
		   console.log(value);
		   
		   runtime.objects.engine.getFirstInstance().instVars.hearSounds=true;
		   runtime.objects.engine.getFirstInstance().instVars.muteMult=0;
		   
		   window.parent.postMessage(JSON.stringify({
		       type: 'MuteSounds',
		       data: {
		                value
		       }
		   }), "*");
		}
		
		MuteSounds(false);
	},

	async EventSheet1_Event406_Act1(runtime, localVars)
	{
// Play again
window.parent.postMessage(JSON.stringify({
              type: 'NewGame'
            }), "*");
console.log(`New Game`);            
setTimeout(() => { location.reload(); }, 250);      
	},

	async EventSheet1_Event408_Act1(runtime, localVars)
	{
		// Go Home
		window.parent.postMessage(JSON.stringify({
		              type: 'GoHome'
		            }), "*");
	},

	async EventSheet1_Event410_Act1(runtime, localVars)
	{
// Play again
window.parent.postMessage(JSON.stringify({
              type: 'NewGame'
            }), "*");
console.log(`New Game`);            
setTimeout(() => { location.reload(); }, 250);      
	},

	async EventSheet1_Event412_Act1(runtime, localVars)
	{
		// Go Home
		window.parent.postMessage(JSON.stringify({
		              type: 'GoHome'
		            }), "*");
	},

	async EventSheet1_Event426_Act3(runtime, localVars)
	{
		window.parent.postMessage(JSON.stringify({
		    type: 'GameStart'
		}), "*");
	},

	async EventSheet1_Event427_Act1(runtime, localVars)
	{

	},

	async EventSheet1_Event429_Act2(runtime, localVars)
	{

	},

	async EventSheet1_Event537_Act3(runtime, localVars)
	{

	},

	async EventSheet1_Event538_Act3(runtime, localVars)
	{

	},

	async EventSheet1_Event539_Act3(runtime, localVars)
	{

	},

	async EventSheet1_Event540_Act2(runtime, localVars)
	{
		console.log("fixer hit");
	},

	async EventSheet1_Event543_Act7(runtime, localVars)
	{
		console.log("hit reset");
	},

	async EventSheet1_Event557_Act1(runtime, localVars)
	{
		
	},

	async EventSheet1_Event559_Act1(runtime, localVars)
	{
var bc = new Object();
bc.num = runtime.objects.bcEngine.getFirstInstance().instVars.bcNum;
bc.score = runtime.objects.engine.getFirstInstance().instVars.score;
bc.ball = runtime.objects.engine.getFirstInstance().instVars.ballNum;
bc.scoreLog = runtime.objects.bcEngine.getFirstInstance().instVars.scoreLog;
bc.actionLog = runtime.objects.bcEngine.getFirstInstance().instVars.actionLog;

var bcValidate = runtime.objects.bcEngine.getFirstInstance().instVars.bcValidate;
var resultArray = bc.scoreLog.split(", ");
var finalArray = [];

for(var i=0; i<resultArray.length; i++){

	console.log(resultArray[i]);

	var resultArrayInner = resultArray[i].split("_");
	if(resultArrayInner.length>1){
		finalArray.push(resultArrayInner);
	}

}

var resultArray2 = bc.actionLog.split(", ");
var finalArray2 = [];

for(var i=0; i<resultArray2.length; i++){

	console.log(resultArray2[i]);

	var resultArrayInner2 = resultArray2[i].split("_");
	if(resultArrayInner2.length>1){
		finalArray2.push(resultArrayInner2);
	}

}

bc.scoreLogArray = finalArray;
bc.actionLogArray = finalArray2;

//--- BELOW IS WHERE WE SEND THE BREADCRUMB OR FINAL MESSAGE TO PARENT FRAME ---

if (typeof CryptoJS !== 'undefined') {
	// Create the breadcrumb payload
	const breadCrumbPayload = {
		clientTimestamp: Date.now(),
		scoreLogArray: bc.scoreLogArray,
		actionLogArray: bc.actionLogArray,
		level: 0,
		bcValidate: runtime.objects.bcEngine.getFirstInstance().instVars.bcValidate
	}
	if (bcValidate) {
		// We completed the game, so breadcrumb is sent in the final payload metadata in the final message
		//
		// Uses the prototype function added to the string type in main.js _0xd7a82c which de-obfuscates the string
		// it is called on. '@BEEsoAB:BrBE:A=?r:osBA:>DFo@CEAA>Aq' de-obfuscates to the key that is required for
		// encrypting the payload, and 'Sv{ny`p|r' de-obfuscates to the string value "FinalScores".
		//
		const finalPayload = {
			score: runtime.objects.engine.getFirstInstance().instVars.score,
			metadata: {
				breadcrumb: breadCrumbPayload,
			}
		};
		try {
			var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(finalPayload), '@BEEsoAB:BrBE:A=?r:osBA:>DFo@CEAA>Aq'._0xd7a82c(13)).toString();
			const message = JSON.stringify({ type: 'Sv{ny`p|r'._0xd7a82c(13), data: ciphertext });
			if (window.parent) {
				window.parent.postMessage(message, "*")
			} else {
				console.log(`no parent`);
			}
		} catch {
			console.log('Not configured properly');
		}
	} else {
		// Simply send the breadcrumb (game is in progress) as a breadcrumb message
		//
		// Uses the prototype function added to the string type in main.js _0xd7a82c which de-obfuscates the string
		// it is called on. '@BEEsoAB:BrBE:A=?r:osBA:>DFo@CEAA>Aq' de-obfuscates to the key that is required for
		// encrypting the payload, and 'OrnqPzo' de-obfuscates to the string value "BreadCrumb".
		//
		try {
			var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(breadCrumbPayload), '@BEEsoAB:BrBE:A=?r:osBA:>DFo@CEAA>Aq'._0xd7a82c(13)).toString();
			var message = JSON.stringify({type: 'OrnqPzo'._0xd7a82c(13), data: ciphertext});
			if (window.parent) {
				window.parent.postMessage(message, "*");
			} else {
				console.log('no parent');
			}
		} catch {
			console.log('Not configured properly');
		}
	}
} else {
	console.log('CryptoJS is not defined');
}
	},

	async EventSheet1_Event396_Act8(runtime, localVars)
	{
		console.log(runtime.objects.engine.getFirstInstance().instVars.startPushed);
	},

	async EventSheet1_Event372_Act4(runtime, localVars)
	{
		console.log("touch1");
	},

	async EventSheet1_Event373_Act4(runtime, localVars)
	{
		console.log("touch2");
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
