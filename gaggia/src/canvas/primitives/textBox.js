class TextBox {

    //---setup--------------------------------------------------------------------------------------------------------------

    constructor() {
        this.name = "";
        this.type = "textBox";
        this.text = "";
        this.font = "";
        this.fontSize = 30;
        this.color = "black";
        this.textAlign = "left";
        this.p = { x: 0, y: 0 };
        this.lp = { x: 0, y: 0 };
        this.w = 0;
        this.h = 0;
        this.a = 1;
        this.cont = null;
        this.pr = 2;
    }

    //---setsprite--------------------------------------------------------------------------------------------------------------
      
    setSprite() {
        if (this.cont != null) {
            if (this.cont.p != null) {
                this.lp.x = this.p.x - this.cont.p.x;
                this.lp.y = this.p.y - this.cont.p.y;
            }
        }
    }
    
    //---draw--------------------------------------------------------------------------------------------------------------
     
    draw(ctx) {
        //ctx.font = this.font + "px " + this.font;
        ctx.font = (this.fontSize*this.pr)+"px "+this.font;
        ctx.id = this.name;
        ctx.fillStyle = this.color;
        ctx.textAlign = this.textAlign;
        // ctx.opacity = this.a;
        ctx.globalAlpha = this.a;
    
        ctx.fillText(this.text, this.p.x*this.pr, this.p.y*this.pr);
    }

}
      