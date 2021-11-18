var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class CanvasPoster {
  constructor(canvas, config) {
    __publicField(this, "_canvas");
    __publicField(this, "_ctx");
    __publicField(this, "_config");
    this._canvas = canvas;
    this._config = config;
    this._ctx = this._canvas.getContext("2d");
    this._setCanvas();
  }
  _setCanvas() {
    if (this._config) {
      this._canvas.width = this._config.width;
      this._canvas.height = this._config.height;
    }
    this._ctx.font = "24px sans-serif";
    this._ctx.fillStyle = "#000";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
  }
  async draw(data) {
    let len = data.length;
    for (let i = 0; i < len; i++) {
      if (data[i].type === "text") {
        this.drawText(data[i]);
        console.log(i);
      }
      if (data[i].type === "image") {
        if (data[i].image instanceof Image) {
          this.drawImage(data[i]);
          console.log(i);
        }
        if (typeof data[i].image === "string") {
          let img = await this.createImage(data[i].image);
          data[i].image = img;
          this.drawImage(data[i]);
          console.log(i);
        }
      }
    }
  }
  async drawText(params) {
    return new Promise((resolve, reject) => {
      if (params.font) {
        this._ctx.font = params.font;
      }
      if (params.color) {
        this._ctx.fillStyle = params.color;
      }
      if (params.textAlign) {
        this._ctx.textAlign = params.textAlign;
      }
      if (!params.maxWidth) {
        this._ctx.fillText(params.text, params.x, params.y);
        return;
      }
      let MAX_WIDTH = params.maxWidth || 200;
      let totalLine = params.totalLine || 1;
      let lineHeight = params.lineHeight || 24;
      let startX = params.x || 0;
      let startY = params.y || 0;
      let allAtr = params.text.split("");
      let rowArr = [];
      let rowStrArr = [];
      for (let i = 0; i < allAtr.length; i++) {
        const currentStr = allAtr[i];
        rowStrArr.push(currentStr);
        const rowStr = rowStrArr.join("");
        if (this._ctx.measureText(rowStr).width > MAX_WIDTH) {
          rowStrArr.pop();
          rowArr.push(rowStrArr.join(""));
          rowStrArr = [currentStr];
          continue;
        }
        if (i === allAtr.length - 1) {
          rowArr.push(rowStr);
        }
      }
      let line = rowArr.length > totalLine ? totalLine : rowArr.length;
      for (let i = 0; i < line; i++) {
        if (i + 1 === line && line !== 1) {
          rowArr[i] = rowArr[i] + "...";
        }
        this._ctx.fillText(rowArr[i], startX, startY + i * lineHeight);
      }
      resolve(rowArr.length);
    });
  }
  async drawImage(params) {
    return new Promise((resolve, reject) => {
      if (params.borderRadius !== void 0) {
        this.creatBorderRect(params.x, params.y, params.width, params.height, params.borderRadius);
      }
      if (params.dx == void 0 || params.dy == void 0 || params.dWidth == void 0 || params.dHeight == void 0) {
        this._ctx.drawImage(params.image, params.x, params.y, params.width, params.height);
      } else {
        this._ctx.drawImage(params.image, params.dx, params.dy, params.dWidth, params.dHeight, params.x, params.y, params.width, params.height);
      }
      this.restore();
    });
  }
  createImage(src) {
    if (!Image) {
      console.log("\u4E0D\u652F\u6301new Image(),\u4F20\u5165CanvasImageSource");
      return;
    }
    let img = new Image();
    img.src = src;
    img.referrerPolicy = "no-referrer";
    let imgPo = new Promise((resolve, reject) => {
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function(e) {
        reject(e);
      };
    });
    return imgPo;
  }
  creatBorderRect(x, y, w, h, r, color) {
    this._ctx.beginPath();
    this._ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
    this._ctx.moveTo(x + r, y);
    this._ctx.lineTo(x + w - r, y);
    this._ctx.lineTo(x + w, y + r);
    this._ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 2 * Math.PI);
    this._ctx.lineTo(x + w, y + h - r);
    this._ctx.lineTo(x + w - r, y + h);
    this._ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
    this._ctx.lineTo(x + r, y + h);
    this._ctx.lineTo(x, y + h - r);
    this._ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI);
    this._ctx.lineTo(x, y + r);
    this._ctx.lineTo(x + r, y);
    this._ctx.fillStyle = color || "#5a5a5a";
    this._ctx.fill();
    this._ctx.closePath();
    this._ctx.save();
    this._ctx.clip();
  }
  restore() {
    this._ctx.restore();
  }
  canvas2Image(type, quality) {
    let canvasImg = this._canvas.toDataURL("image/png", 1);
    return canvasImg;
  }
  getCanvas() {
    return this._canvas;
  }
  getCtx() {
    return this._ctx;
  }
}
export { CanvasPoster as default };
//# sourceMappingURL=create-poster.es.js.map
