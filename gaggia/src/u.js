function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function ca(ang) {
    return (180 * ang) / 3.14;
}

function removeFromArray(arr, ob) {
    
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] !== null) {
      if (arr[i] === ob) {
        //console.log(">>>>>>>>>" + ob.name);
         arr.splice(i, 1);
      }
    }
  }

}

function vectorToScreenPos(ob){
    
  var width = window.innerWidth;
  var height = window.innerHeight;
  var widthHalf = width / 2, heightHalf = height / 2;

  var vector = ob.geometry.vertices[0].clone();
  vector.applyMatrix4( ob.matrixWorld );

  var pos = vector.clone();
  // var pos = ob.position.clone();

  pos.project(camera);
  pos.x = ( pos.x * widthHalf ) + widthHalf;
  pos.y = - ( pos.y * heightHalf ) + heightHalf;

  var result = {x:pos.x-5, y:pos.y-5};
  
  return result;

}

function getDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;

  var c = Math.sqrt(a * a + b * b);
  return c;
}

function inc(el, type, amount){
    if(type==="opacity"){
        // console.log("op")
        var theOpacity = parseFloat(el.style.opacity);
        if(theOpacity==="" || isNaN(theOpacity)){
            theOpacity=0;
        }
        theOpacity+=amount;
        if(theOpacity>1){
            theOpacity=1;
        }
        if(theOpacity<0){
            theOpacity=0;
        }
        el.style.opacity = theOpacity+"";
        // console.log(theOpacity)
    }else if(type==="top"){
        
        var theTop = parseFloat(el.style.top);

        console.log(el.style.top)

        if(theTop==="" || isNaN(theTop)){
            theTop=0;
        }
        theTop+=amount;
        
        el.style.top = theTop+"";
        
    }
}


function ran(num) {
    var num1 = Math.random() * num;
    var num2 = Math.floor(num1);
    return num2;
  }
