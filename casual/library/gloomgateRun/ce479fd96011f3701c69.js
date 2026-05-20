
const createGameDataCode = `function createGameData() {
  class MakeGameData {
    /**
     * Code to randomly generate locations for all game elements
     */
     makeRanLevelData() {

        this.cp1 = [];
        this.cp2 = [];
        this.cp3 = [];
        this.cp4 = [];
        this.cp5 = [];
        this.cp6 = [];
        this.cp7 = [];
        this.cp8 = [];
        this.cp9 = [];
        this.cp10 = [];
        this.allBitArray = [];
        this.allCoinPositions = [];

        // scale factor for bits
        var b = 2.5;

        var randomWithinRange = function(range) {
            return Math.floor(Math.random() * range);
        }

        var randomObjectFromArray = function(a) {
            const pick = randomWithinRange(a.length);
            const r = a.splice(pick, 1);
            return r[0];
        }

        var degreesToRadians = function(degrees) {
            return degrees * (Math.PI/180);
        }

        for (var j = 0; j < 2; j++) { // loop twice so there are 2 tracks

            //initially separate tracks
            if (j === 0) {
                var curRot = 0;
            } else {
                var curRot = 6;
            }

            this.levelLength = 700;

            // da - distance amount - distance is 5000 units. create bits until you reach this amount.
            for (var i = 0, da = -20; da < this.levelLength*10; i++) {

                // randomize turn

                var turn = randomWithinRange(2);
                if (turn === 0) {
                    curRot += 1
                } else {
                    curRot -= 1
                }

                if (curRot <= -1) {
                    curRot = 10;
                }

                if (curRot >= 10) {
                    curRot = 0;
                }

                var curRot2 = 10 - curRot;

                // level difficulties
                // extendEnd creates more overlap between 2 bits
                // bitscale makes the pieces longer. longer pieces make the game easier.

                if (da < (this.levelLength*1)) {
                    var extendEnd = 4;
                    var bitScale = randomWithinRange(16) + 16;
                } else if (da < (this.levelLength*2)) {
                    var extendEnd = 4;
                    var bitScale = randomWithinRange(14) + 14;
                } else if (da < (this.levelLength*3)) {
                    var extendEnd = 3;
                    var bitScale = randomWithinRange(12) + 12;
                } else if (da < (this.levelLength*4)) {
                    var extendEnd = 3;
                    var bitScale = randomWithinRange(11) + 11;
                } else if (da < (this.levelLength*5)) {
                    var extendEnd = 3;
                    var bitScale = randomWithinRange(10) + 10;
                } else if (da < (this.levelLength*6)) {
                    var extendEnd = 2;
                    var bitScale = randomWithinRange(9) + 9;
                } else if (da < (this.levelLength*7)) {
                    var extendEnd = 2;
                    var bitScale = randomWithinRange(9) + 7;
                } else if (da < (this.levelLength*8)) {
                    var extendEnd = 1;
                    var bitScale = randomWithinRange(9) + 6;
                } else if (da < (this.levelLength*9)) {
                    var extendEnd = 1;
                    var bitScale = randomWithinRange(9) + 5;
                } else {
                    var extendEnd = 1;
                    var bitScale = randomWithinRange(9) + 4;
                }

                // push the data to an array

                var z = da;
                var scale = bitScale + (3 * extendEnd);
                var rot = degreesToRadians(curRot2 * 36);

                this.allBitArray.push(new Array(z, scale, rot));

                for (var k = 3; k < scale - 3; k += 6) {

                    var tl = 75; // an offset factor so pieces don't appear in tunnels
                    var tl2 = -25; // an offset factor so pieces don't appear in tunnels

                    // push the coin position value to a series of arrays. one per each level.

                    if (da < (this.levelLength*1) + tl2 + tl2) {
                        this.cp1.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*1) + tl && da < (this.levelLength*2) + tl2) {
                        this.cp2.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*2) + tl && da < (this.levelLength*3) + tl2) {
                        this.cp3.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*3) + tl && da < (this.levelLength*4) + tl2) {
                        this.cp4.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*4) + tl && da < (this.levelLength*5) + tl2) {
                        this.cp5.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*5) + tl && da < (this.levelLength*6) + tl2) {
                        this.cp6.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*6) + tl && da < (this.levelLength*7) + tl2) {
                        this.cp7.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*7) + tl && da < (this.levelLength*8) + tl2) {
                        this.cp8.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*8) + tl && da < (this.levelLength*9) + tl2) {
                        this.cp9.push(new Array(da + (k * b), curRot));
                    } else if (da > (this.levelLength*9) + tl && da < (this.levelLength*10) + tl2) {
                        this.cp10.push(new Array(da + (k * b), curRot));
                    }

                }

                // finalize

                da += (b * bitScale); // add to the distance amount

            }

        }

        // remove coin position duplicates

        console.log(this.cp7.length)
        console.log(this.cp8.length)
        console.log(this.cp9.length)
        console.log(this.cp10.length)

        this.cpp1 = [...new Set(this.cp1)];
        this.cpp2 = [...new Set(this.cp2)];
        this.cpp3 = [...new Set(this.cp3)];
        this.cpp4 = [...new Set(this.cp4)];
        this.cpp5 = [...new Set(this.cp5)];
        this.cpp6 = [...new Set(this.cp6)];
        this.cpp7 = [...new Set(this.cp7)];
        this.cpp8 = [...new Set(this.cp8)];
        this.cpp9 = [...new Set(this.cp9)];
        this.cpp10 = [...new Set(this.cp10)];

        //----------------------------------------------------------
        //----------------------------------------------------------
        //----------------------------------------------------------
        //----------------------------------------------------------
        //----------------------------------------------------------

        // randomly place coins

        var amountPerLevel = 22; // total coins per level
        this.maxLarge = 3; // amount of large coins
        this.maxMedium = 6; // amount of medium coins, the rest are small

        for (var lev = 1; lev <= 10; lev++) {

            for (var i = 0; i < amountPerLevel; i++) {

                // assign small, medium, large

                if (i < this.maxLarge) {
                    var type = "l"
                } else if (i < this.maxLarge + this.maxMedium) {
                    var type = "m"
                } else {
                    var type = "s"
                }

                // apr is randomly remove one coin position from array and assign it to a coin position

                if (lev === 1) {
                    this.choice = randomObjectFromArray(this.cpp1);
                } else if (lev === 2) {
                    this.choice = randomObjectFromArray(this.cpp2);
                } else if (lev === 3) {
                    this.choice = randomObjectFromArray(this.cpp3);
                } else if (lev === 4) {
                    this.choice = randomObjectFromArray(this.cpp4);
                } else if (lev === 5) {
                    this.choice = randomObjectFromArray(this.cpp5);
                } else if (lev === 6) {
                    this.choice = randomObjectFromArray(this.cpp6);
                } else if (lev === 7) {
                    this.choice = randomObjectFromArray(this.cpp7);
                } else if (lev === 8) {
                    this.choice = randomObjectFromArray(this.cpp8);
                } else if (lev === 9) {
                    this.choice = randomObjectFromArray(this.cpp9);
                } else if (lev === 10) {
                    this.choice = randomObjectFromArray(this.cpp10);
                }

                var z = this.choice[0]; // the z position of the chosen coin position
                var rot = this.choice[1]; // the rotation factor of the chosen coin position
                this.allCoinPositions.push(new Array(z, rot, type, lev));

            }

        }

        return { allBitArray: this.allBitArray, allCoinPositions: this.allCoinPositions };

    }
  }
  
  const mgd = new MakeGameData();
  return mgd.makeRanLevelData();
}`
