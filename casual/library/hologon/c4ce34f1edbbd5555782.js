
const createGameDataCode = 
`
function createGameData() {

  console.log("CREATE GAME DATA");

  class MakeGameData {

    makeRanLevelData() {

      this.allCoinPositions = [];

      for(var i=0; i<10; i++){

        for(var j=0; j<10; j++){

          var pos = [];

          pos.push( this.nran(300) )

          if(i===0){

            pos.push( -this.ran(9000)-1000 );

          }else{

            pos.push( (i * -10000) - this.ran(10000) );

          }

          this.allCoinPositions.push( pos );

        }

      }

      // console.log( this.allCoinPositions.length );

      return { allCoinPositions: this.allCoinPositions };

    }

    //-------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------
    
    ran(num) {
      var num1 = Math.random() * num;
      var num2 = Math.floor(num1);
      
      return num2;
    }
    
    nran(num) {
      var num1 = Math.random() * (num*2);
      var num2 = Math.floor(num1-num);
      
      return num2;
    }

  }

  //-------------------------------------------------------------------------------
  //-------------------------------------------------------------------------------
  //-------------------------------------------------------------------------------
  
  const mgd = new MakeGameData();
  return mgd.makeRanLevelData();

}
`;
