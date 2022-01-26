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
    __publicField(this, "_ratio", 1);
    __publicField(this, "_eventTarget");
    this._canvas = canvas;
    this._config = config;
    this._ctx = this._canvas.getContext("2d", { alpha: false });
    this._ratio = config.ratio;
    this._eventTarget = Object.create({});
    config.onClick && this._listener(config.onClick);
    config.target && this._addTargets(config.target);
    this._setCanvas();
  }
  _setCanvas() {
    let devicePixelRatio = window.devicePixelRatio || 1;
    if (this._config) {
      this._canvas.width = Math.floor(this._config.width * devicePixelRatio);
      this._canvas.height = Math.floor(this._config.height * devicePixelRatio * this._ratio);
      this._ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    this._ctx.font = "24px sans-serif";
    this._ctx.fillStyle = "#000";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
  }
  _addTargets(targets) {
    if (!targets || Object.keys(targets).length <= 0)
      return;
    for (let i in targets) {
      let target = {
        x: targets[i].x * this._ratio,
        y: targets[i].y * this._ratio,
        width: targets[i].width * this._ratio,
        height: targets[i].height * this._ratio,
        left: (targets[i].x + targets[i].width) * this._ratio,
        top: (targets[i].y + targets[i].height) * this._ratio
      };
      this._eventTarget[i] = target;
    }
  }
  _isInTargets(x, y) {
    let isIn = false;
    let t = null;
    for (let i in this._eventTarget) {
      let target = this._eventTarget[i];
      if (x >= target.x && x <= target.left && y >= target.y && y <= target.top) {
        isIn = true;
        t = i;
        break;
      }
    }
    return { isIn, t };
  }
  _listener(callback) {
    this._canvas.addEventListener("click", (event) => {
      let $target = this._isInTargets(event.offsetX, event.offsetY);
      let position = {
        x: event.offsetX,
        y: event.offsetY
      };
      event["$position"] = position;
      event["$target"] = $target;
      callback(event);
    });
  }
  async draw(data) {
    let len = data.length;
    for (let i = 0; i < len; i++) {
      if (data[i].type === "text") {
        this.drawText(data[i]);
        continue;
      }
      if (data[i].type === "image") {
        if (data[i].source instanceof Image) {
          this.drawImage(data[i]);
          continue;
        }
        if (typeof data[i].type === "string") {
          let img = await this.createImage(data[i].source);
          data[i].source = img;
          this.drawImage(data[i]);
        }
      }
    }
  }
  async drawText(params) {
    return new Promise((resolve) => {
      if (params.font) {
        this._ctx.font = params.font;
      }
      if (params.color) {
        this._ctx.fillStyle = params.color;
      }
      if (params.textAlign) {
        console.log(params.textAlign);
        this._ctx.textAlign = params.textAlign;
      }
      if (!params.maxWidth) {
        this._ctx.fillText(params.source, params.x, params.y);
        return;
      }
      let MAX_WIDTH = params.maxWidth || 200;
      let totalLine = params.totalLine || 1;
      let lineHeight = params.lineHeight || 24;
      let startX = params.x || 0;
      let startY = params.y || 0;
      let allAtr = params.source.split("");
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
    return new Promise(() => {
      if (params.borderRadius !== void 0) {
        this.creatBorderRect(Math.floor(params.x * this._ratio), Math.floor(params.y * this._ratio), Math.floor(params.source.width * this._ratio), Math.floor(params.source.height * this._ratio), Math.floor(params.borderRadius * this._ratio));
      }
      if (params.dx == void 0 || params.dy == void 0 || params.dWidth == void 0 || params.dHeight == void 0) {
        this._ctx.drawImage(params.source, Math.floor(params.x * this._ratio), Math.floor(params.y * this._ratio), Math.floor(params.source.width * this._ratio), Math.floor(params.source.height * this._ratio));
      } else {
        this._ctx.drawImage(params.source, params.dx * this._ratio, params.dy * this._ratio, params.dWidth * this._ratio, params.dHeight * this._ratio, params.x * this._ratio, params.y * this._ratio, params.source.width * this._ratio, params.source.height * this._ratio);
      }
      this.restore();
    });
  }
  createImage(src) {
    console.log(src);
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
    [x, y, w, h, r] = [x * this._ratio, y * this._ratio, w * this._ratio, h * this._ratio, r * this._ratio];
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
  canvas2Image() {
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
