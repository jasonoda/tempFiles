
var containers = [];
var render = [];

//---setup--------------------------------------------------------------------------------------------------------------

function renderLoop(){

    canvaszOrder();
    canvasMoveContainers();
    canvasRenderer();

    // requestAnimationFrame(renderLoop);
}

//---movecontainers--------------------------------------------------------------------------------------------------------------

function canvasMoveContainers() {
    
    for (var i = 0; i < containers.length; i++) {
        if (containers[i] != null) {
            for (var j = 0; j < containers[i].children.length; j++) {
            containers[i].children[j].p.x =
                containers[i].p.x + containers[i].children[j].lp.x;
            containers[i].children[j].p.y =
                containers[i].p.y + containers[i].children[j].lp.y;
            }
        }
    }
}

//---zorder--------------------------------------------------------------------------------------------------------------

function canvaszOrder() {
    
    //put the objects in render order according to the z var

    var tempRender = [];
    var j = 0;

    while (j < 100) {

        for (var i = 0; i < render.length; i++) {
            if (render[i] != null) {
                if (render[i].z != null) {

                    if (render[i].z <= j) {
                        
                        tempRender.push(render[i]);
                        render[i] = null;

                    }
                }
            }
        }

        j++;

    }

    render = [];

    for (i = 0; i < tempRender.length; i++) {
        render.push(tempRender[i]);
    }

}

function canvasRenderer() {
    
    for (var i = 0; i < render.length; i++) {
        if (render[i] != null) {
            if (render[i].kill === true) {
                destroySprite(render[i]);
                i = 0;
            }
        }
    }

    for (i = 0; i < render.length; i++) {

        if (render[i] != null) {

            render[i].pr=pr;
            render[i].draw(ctx);

            if (render[i].cont === null && render[i].cont !== rootCont) {
                render[i] = null;
            }

            if (render[i] != null) {

                if (render[i].ani != null) {
                    if (render[i].ani.length > 0) {
                        render[i].animate(deltaTime);
                    }
                }

                if (render[i].aniAlphaArray != null) {
                    if (render[i].aniAlphaArray.length > 0) {
                        render[i].alphaAnimate(deltaTime);
                    }
                }

            }
        }
    }
}

