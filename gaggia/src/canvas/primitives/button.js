class Button {

    //---setup--------------------------------------------------------------------------------------------------------------

    constructor() {
        this.name = "";
        this.type = "button";
        this.count=0;
        this.ref = "i_mario";
        this.ref2 = "";
        this.p = { x: 0, y: 0 };
        this.lp = { x: 0, y: 0 };
        this.z = 0;
        this.w = 0;
        this.h = 0;
        this.a = 1;
        this.varFloat1 = 0;
        this.varFloat2 = 0;
        this.varFloat3 = 0;
        this.varFloat4 = 0;
        this.func = "";
        this.rolledOver = false;
        this.rollOverSound = null;
        this.cont = null;
        this.useCenter = false;
        this.onRollOverCheck = false;
        this.onRollOver = "";
        this.follow = null;
        this.section=0;
        this.pr = 1;
    }
  
    //---setsprite--------------------------------------------------------------------------------------------------------------

    setSprite() {

        this.image = document.getElementById(this.ref);

        if (this.w === 0) {
            this.w = this.image.width;
        }

        if (this.h === 0) {
            this.h = this.image.height;
        }

        if (this.cont != null) {
            this.lp.x = this.p.x - this.cont.p.x;
            this.lp.y = this.p.y - this.cont.p.y;
        }

    }
  
    //---draw--------------------------------------------------------------------------------------------------------------

    draw(ctx) {
        //console.log(this.ref);
        // this.ref2 = "whiteColor";

        if(this.useCenter===true){
            ctx.save();
            ctx.translate((-this.w*this.pr) / 2, (-this.h*this.pr) / 2);
            ctx.globalAlpha = this.a;
            // ctx.drawImage(this.image, -this.w / 2, -this.h / 2, this.w, this.h);
            ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
            ctx.restore();
        }else{
            if (this.f == true) {
                ctx.save();
                ctx.translate(this.p.x*this.pr, this.p.y*this.pr);
                ctx.scale(-1, 1);
                ctx.globalAlpha = this.a;
                ctx.drawImage(this.image, -this.w*this.pr, 0*this.pr, this.w*this.pr, this.h*this.pr);
                ctx.restore();
            }else{
                ctx.globalAlpha = this.a;
                if(this.image!==null && this.image!==""){
                    ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
                }
                ctx.globalAlpha = 1;
            }
            
        }

        if(this.rolledOver===true && this.onRollOverCheck===false){
            this.onRollOverCheck=true;
            rollOverAction(this.onRollOver, this);
        }

        if(this.rolledOver===false){
            this.onRollOverCheck=false;
        }

        
    }
  
    //---handlerollover--------------------------------------------------------------------------------------------------------------

    rollOver() {
        this.image = document.getElementById(this.ref2);
        this.rolledOver = true;
    }
  
    rollBack() {
        this.image = document.getElementById(this.ref);
        this.rolledOver = false;
    }

    center() {
        this.lp.x = 711 - this.w / 2;
    }

}
  