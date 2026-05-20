export class Utilities {

  setUp(e) {
      this.e=e;
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  ca(ang) {
    var pi = Math.PI;
    return ang * (pi/180);
  }

  ca2(ang){
    var pi = Math.PI;
    return ang * (180/pi);
  }

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

  getDistance(xA, yA, xB, yB) { 
    var xDiff = xA - xB; 
    var yDiff = yA - yB; 
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  isSpriteOutside(sprite1, sprite2) {
    const bounds1 = sprite1.getBounds();
    const bounds2 = sprite2.getBounds();

    return (
        bounds1.x + bounds1.width < bounds2.x || 
        bounds1.x > bounds2.x + bounds2.width || 
        bounds1.y + bounds1.height < bounds2.y || 
        bounds1.y > bounds2.y + bounds2.height 
    );
  }

  hitTest(sprite1, sprite2) {
    
    const bounds1 = sprite1.getBounds();
    const bounds2 = sprite2.getBounds();

    return (
        bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y
    );
    
  }

  roundToFourDigits(num) {
    return parseFloat(num.toFixed(4));
  }

  roundToTwoDigits(num) {
    return Math.round(num * 100) / 100;
}

  getRandomDecimal(min, max, precision) {
    var randomNumber = Math.random() * (max - min) + min;
    return parseFloat(randomNumber.toFixed(precision));
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `0x${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  rgbToHsl(r, g, b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
  
      if(max == min){
          h = s = 0; // achromatic
      }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }
  
      return [h*1000, s*1000, l*1000];
  }

  ap(ar){

    var r = this.ran(ar.length);

    return ar[r];

  }

  apRemove(ar){

    var r = this.ran(ar.length);

    var removeMe = ar[r];
    ar.splice(r, 1);

    return removeMe;

  }

  copyInto(ar1, ar2){

    for(var i=0; i<ar2.length; i++){

      ar1.push(ar2[i]);

    }

  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

}
  
