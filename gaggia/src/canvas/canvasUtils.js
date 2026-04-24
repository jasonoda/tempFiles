
//---createasprite--------------------------------------------------------------------------------------------------------------

function inst(name, spriteName, px, py, w, h, z, cont) {
  
  var spr = new Sprite();
  spr.name = name;
  spr.ref = spriteName;
  spr.p.x = px;
  spr.p.y = py;
  spr.w = w;
  spr.h = h;
  spr.z = z;
  spr.cont = cont;

  if (cont != null) {
    for (var i = 0; i < containers.length; i++) {
      if (cont === containers[i]) {
        containers[i].children.push(spr);
        spr.p.x = containers[i].p.x + px;
        spr.p.y = containers[i].p.y + py;
      }
    }
  }

  spr.setSprite();
  render.push(spr);

  // console.log("spr " + spr.name);

  return spr;

}

//---createatextbox--------------------------------------------------------------------------------------------------------------

function instText(name, text, font, fontSize, color, align, px, py, w, h, z, cont) {
  
  var spr = new TextBox();
  spr.name = name;
  spr.text = text;
  spr.font = font;
  spr.fontSize = fontSize;
  spr.color = color;
  spr.textAlign = align;
  spr.p.x = px;
  spr.p.y = py;
  spr.w = w;
  spr.h = h;
  spr.z = z;
  spr.cont = cont;

  if (cont != null) {
    for (var i = 0; i < containers.length; i++) {
      if (cont === containers[i]) {
        containers[i].children.push(spr);
        spr.p.x = containers[i].p.x + px;
        spr.p.y = containers[i].p.y + py;
      }
    }
  }

  spr.setSprite();
  render.push(spr);
  return spr;

}

//---createabutton--------------------------------------------------------------------------------------------------------------

function button(name, spriteName, rollover, px, py, w, h, z, func, cont) {
  
  var spr = new Button();
  spr.name = name;
  spr.ref = spriteName;
  spr.ref2 = rollover;
  spr.p.x = px;
  spr.p.y = py;
  spr.w = w;
  spr.h = h;
  spr.z = z;
  spr.func = func;
  spr.cont = cont;

  if (cont != null) {
    for (var i = 0; i < containers.length; i++) {
      if (cont === containers[i]) {
        containers[i].children.push(spr);
        spr.p.x = containers[i].p.x + px;
        spr.p.y = containers[i].p.y + py;
      }
    }
  }

  spr.setSprite();
  render.push(spr);
  buttons.push(spr);
  return spr;

}

//---newContainer--------------------------------------------------------------------------------------------------------------

function newContainer(name, x, y, contsCont) {
  
  var cont = new Container();
  cont.name = name;
  cont.p.x = x;
  cont.p.y = y;
  cont.cont = cont;

  if (cont != null) {
    for (var i = 0; i < containers.length; i++) {
      if (contsCont === containers[i]) {
        containers[i].children.push(cont);
        cont.lp.x = x;
        cont.lp.y = y;
        cont.p.x = containers[i].p.x + x;
        cont.p.y = containers[i].p.y + y;
      }
    }
  }

  render.push(cont);
  containers.push(cont);
  //console.log(cont);
  return cont;

}

//---destroySprite--------------------------------------------------------------------------------------------------------------

function destroySprite(ob) {
  
  //remove the children from the rendering cue

  for (var k = 0; k < render.length; k++) {
    if (ob === render[k]) {
      // console.log("-ren: " + render[k].name);
      removeFromArray(render, render[k]);
    }
  }
  
  //remove the child references from all containers

  for (var i = 0; i < containers.length; i++) {
    for (var j = 0; j < containers[i].children.length; j++) {
      if (containers[i].children[j] === ob) {
        // console.log("-ren2: " + containers[i].children[j].name);
        //removeFromArray(containers[i].children, ob);
      }
    }
  }

  //if it's a button, cancel the button click actions

  if (ob != null) {
    if (ob.type === "button") {
      for (k = 0; k < buttons.length; k++) {
        if (ob === buttons[k]) {
          removeFromArray(buttons, ob);
        }
      }
    }
  }
}

//---destroyCont--------------------------------------------------------------------------------------------------------------

function destroyCont(ob) {
  
  for (var i = 0; i < containers.length; i++) {
    if (containers[i] === ob) {

      //you've found the container you want to kill
      //cycle through it's children

      for (var j = 0; j < containers[i].children.length; j++) {
        
        console.log("---------");
        console.log("-c-" + containers[i].children[j].name);
        
        if (containers[i].children[j] != null) {
          if (containers[i].children[j].type === "container") {
            
            //destroyCont(containers[i].children[j]);
            toDestroy.push(containers[i].children[j]);
            
          } else {
            
            for (var k = 0; k < render.length; k++) {

              //remove the children from the rendering cue

              if (containers[i].children[j] === render[k]) {
                console.log("-r-" + render[k].name);
                removeFromArray(render, render[k]);
                k = 0;
              }

              //remove the crosshair of destroyed container

              if (ob === render[k]) {
                console.log("-cr-" + render[k].name);
                removeFromArray(render, render[k]);
                k = 0;
              }

            }
          }
        }
        console.log("---------");
      }
    }
  }

  //now run through the containers, and if the deleted container was a child
  //of any of the other containers, delete it

  for (i = 0; i < containers.length; i++) {
    for (j = 0; j < containers[i].children.length; j++) {
      if (containers[i].children[j] === ob) {
        console.log("-td-" + containers[i].children[j].name);
        removeFromArray(
          containers[i].children,
          containers[i].children[j]
        );
      }
    }
  }

  //console.log(toDestroy.length);

  if (toDestroy.length > 0) {
    endDestroy();
  }

}

function endDestroy() {
  
  for (var i = 0; i < toDestroy.length; i++) {

    var saveKill = toDestroy[i];
    removeFromArray(toDestroy, toDestroy[i]);
    i = 0;
    destroyCont(saveKill);
    console.log("todestroy: " + saveKill.name);

  }

  toDestroy = [];

}