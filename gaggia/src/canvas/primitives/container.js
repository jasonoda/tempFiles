class Container {

    //---setup--------------------------------------------------------------------------------------------------------------

    constructor() {
        this.name = "";
        this.type = "container";
        this.children = [];
        this.p = { x: 0, y: 0 };
        this.lp = { x: 0, y: 0 };
        this.r_lp = { x: 0, y: 0 };
        this.dest = { x: 0, y: 0 };
        this.w = 0;
        this.h = 0;
        this.z = 90;
        this.action = "";
        this.varString1 = "";
        this.varString2 = "";
        this.varFloat1 = 0;
        this.varFloat2 = 0;
        this.sideDir = "r";
        this.cont = null;
        this.count = 0;
        this.delay = 0;
        this.xspeed = 0;
        this.yspeed = 0;
        this.goalDir = 0;
        this.changeDirCount = 0;
        this.bulletCount = 0;
        this.bulletLim = 0;
        this.maxBullets = 0;
        this.comingIn = true;
        this.image = document.getElementById("clearColor");
        this.mainSprite = null;
        this.life = 1;
        this.done = false;
        this.section = 0;
        this.mainText = null;
        this.pr = 1;
    }
    
    //---setup2--------------------------------------------------------------------------------------------------------------

    setUp() {
        if (this.cont != null) {
            this.lp.x = this.p.x - this.cont.p.x;
            this.lp.y = this.p.y - this.cont.p.y;
        }
    }
    
    //---draw--------------------------------------------------------------------------------------------------------------

    draw(ctx) {
      ctx.drawImage(this.image, this.p.x - 280, this.p.y - 280, 560, 560);
    }

  }
  