class Sprite {
    
    //---setup--------------------------------------------------------------------------------------------------------------
// 
    constructor() {
        this.name = "";
        this.type = "sprite";
        this.visible = true;
        this.ref = "";
        this.z = 0;
        this.p = { x: 0, y: 0 };
        this.lp = { x: 0, y: 0 };
        this.w = 0;
        this.h = 0;
        this.r = 0;
        this.f = false;
        this.a = 1;
        this.cont = null;
        this.ani = [];
        this.aniTime = 0;
        this.aniSpeed = 0;
        this.aniCue = 0;
        this.aniAlphaArray = [];
        this.aniAlphaTime = 0;
        this.aniAlphaSpeed = 0;
        this.aniAlphaCue = 0;
        this.saveX = 0;
        this.saveY = 0;
        this.timer1 = 0;
        this.timer2 = 0;
        this.count = 0;
        this.varString1 = "";
        this.varString2 = "";
        this.varString3 = "";
        this.varString4 = "";
        this.varFloat1 = 0;
        this.varFloat2 = 0;
        this.varFloat3 = 0;
        this.varFloat4 = 0;
        this.killOnAniFinish = false;
        this.hasHitPlayer = false;
        this.kill = false;
        this.useHitTest = true;
        //
        this.enemyType = "";
        this.action = "";
        this.action2 = "";
        this.life = 1;
        this.xspeed = 0;
        this.yspeed = 0;
        this.useCenter = false;
        this.useCenterTop = false;
        this.useCenterBottom = false;
        this.section = 0;
        this.destx = 0;
        this.desta = 0;
        this.dests = 0;
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
  
    //---animate--------------------------------------------------------------------------------------------------------------

    animate(dt) {

        this.aniTime += dt;

        if (this.aniTime > this.aniSpeed) {
            this.aniTime = 0;
            this.aniCue++;
            if (this.aniCue >= this.ani.length) {
                if (this.killOnAniFinish == true) {
                    this.kill = true;
                } else {
                    this.aniCue = 0;
                }
            }
            this.image = document.getElementById(this.ani[this.aniCue]);
        }

    }

    //---alphaAnimate--------------------------------------------------------------------------------------------------------------

    alphaAnimate(dt) {
      
        this.aniAlphaTime += dt;
        if (this.aniAlphaTime > this.aniAlphaSpeed) {
            this.aniAlphaTime = 0;
            this.aniAlphaCue++;
            if (this.aniAlphaCue >= this.aniAlphaArray.length) {
            this.aniAlphaCue = 0;
            }
            this.a = this.aniAlphaArray[this.aniAlphaCue];
        }

    }
  
    //---draw--------------------------------------------------------------------------------------------------------------

    draw(ctx) {
      
    
      if (this.image != null && this.visible===true) {
            if (this.a < 0) {
                this.a = 0;
            }
    
            if (this.r != 0) {

                ctx.save();
                ctx.translate(this.p.x, this.cont.p.y);
                ctx.translate(this.w / 2, this.h / 2);
                ctx.rotate(this.r);
                ctx.globalAlpha = this.a;
                ctx.drawImage(this.image, -this.w / 2, -this.h / 2, this.w, this.h);
                ctx.restore();

            } else {

                if (this.f == true) {

                    ctx.save();
                    ctx.translate(this.p.x*this.pr, this.p.y*this.pr);
                    ctx.scale(-1, 1);
                    ctx.globalAlpha = this.a;
                    ctx.drawImage(this.image, -this.w*this.pr, 0, this.w*this.pr, this.h*this.pr);
                    ctx.restore();

                } else {
                    
                    ctx.globalAlpha = this.a;
                    if (this.image === null) {
                        console.log("error: " + this.ref);
                    }
                    if(this.useCenter===true){

                        ctx.save();
                        ctx.translate((-this.w*this.pr ) / 2, (-this.h*this.pr) / 2);
                        ctx.globalAlpha = this.a;
                        ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
                        ctx.restore();

                    }else if(this.useCenterTop===true){

                        ctx.save();
                        ctx.translate((-this.w*this.pr) / 2, 0);
                        ctx.globalAlpha = this.a;
                        ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
                        ctx.restore();

                    }else if(this.useCenterBottom===true){

                        ctx.save();
                        ctx.translate((-this.w*this.pr) / 2, -this.h*this.pr);
                        ctx.globalAlpha = this.a;
                        ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
                        ctx.restore();

                    }else{
                        ctx.drawImage(this.image, this.p.x*this.pr, this.p.y*this.pr, this.w*this.pr, this.h*this.pr);
                    }
                    

                }
            }
            
            ctx.globalAlpha = 1;
        }

    }

    //---drawrot--------------------------------------------------------------------------------------------------------------

    drawRot(ctx, img, x, y, scale, ang) {
        var vx = Math.cos(ang) * scale;
        var vy = Math.sin(ang) * scale;
    
        var imH = -(this.h / 2);
        var imW = -(this.w / 2);
        x += imW * vx + imH * -vy;
        y += imW * vy + imH * vx;
        
        ctx.setTransform(vx, vy, -vy, vx, x, y);
        ctx.drawImage(img, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

  }
  