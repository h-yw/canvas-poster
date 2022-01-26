/**
 * @name CanvasPoster
 * @desc canvas poster，easy to create poster and export picture
 * @desc 创建canvas海报,便于快速生成海报并导出图片
 * @author Mr.Hou
 * @time 2021/11/18
 */
import { DrawProps, PosterConfig, TargetType } from "./type";
class CanvasPoster {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _config: PosterConfig;
  public _ratio: number = 1;
  private _eventTarget: TargetType;
  constructor(canvas: HTMLCanvasElement, config?: PosterConfig) {
    this._canvas = canvas;
    this._config = config;
    this._ctx = this._canvas.getContext("2d", { alpha: false });
    this._ratio = config.ratio
    this._eventTarget = Object.create({});
    config.onClick && this._listener(config.onClick)
    config.target && this._addTargets(config.target)
    // 设置canvas
    this._setCanvas();
  }
  /**
   * @description 设置canvas参数
   * @return
   */
  private _setCanvas(): void {
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

  /**
   * @description 将自定义目标位置加入目标列表
   * @param {Array[TargetType]} targets
   * @returns
   */
  private _addTargets(targets: any) {
    if (!targets || Object.keys(targets).length <= 0) return
    for (let i in targets) {
      let target = {
        x: targets[i].x * this._ratio,
        y: targets[i].y * this._ratio,
        width: targets[i].width * this._ratio, // 宽度宽度
        height: targets[i].height * this._ratio, // 目标区域高
        left: (targets[i].x + targets[i].width) * this._ratio, // 右边距上距离
        top: (targets[i].y + targets[i].height) * this._ratio, // 底部距上距离
      };
      this._eventTarget[i] = target;
    }
  }

  /**
   * @description 判断点击位置是否在目标区域内
   * @param {number} x
   * @param {number} y
   * @returns {boolean, string} boolean: 点击在目标区域内，string: 点击的目标名称
   */
  private _isInTargets(x: number, y: number) {
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

  /**
   * @description 监听点击事件
   * @param {Function} callback
   * @returns
   */
  private _listener(callback: Function) {
    this._canvas.addEventListener("click", (event) => {
      let $target = this._isInTargets(event.offsetX, event.offsetY);
      let position = {
        x: event.offsetX,
        y: event.offsetY
      }
      event['$position'] = position;
      event['$target'] = $target;
      callback(event);
    });
  }
  /**
   * @description 绘制
   * @param {Array[ImageConfig|TextConfig]} data
   * @returns
   */
  public async draw(data: Array<DrawProps>) {
    let len = data.length;
    for (let i = 0; i < len; i++) {
      // this.addEvent(data[i].events);
      if (data[i].type === "text") {
        this.drawText(data[i]);
        continue
      }
      if (data[i].type === "image") {
        if (data[i].source instanceof Image) {
          this.drawImage(data[i]);
          continue;
        }
        if (typeof data[i].type === "string") {
          let img = await this.createImage(data[i].source as string);
          // console.log(img);
          data[i].source = img as HTMLImageElement;
          this.drawImage(data[i]);
        }
      }
    }
  }


  /**
   * @description 绘制文字
   * @param {TextConfig} params
   * @returns
   */
  public async drawText(params: DrawProps): Promise<number> {
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
        this._ctx.fillText(params.source as string, params.x, params.y);
        return;
      }
      let MAX_WIDTH = (params.maxWidth || 200);
      let totalLine = params.totalLine || 1;
      let lineHeight = params.lineHeight || 24;
      let startX = (params.x || 0) ;
      let startY = (params.y || 0) ;
      let allAtr = (params.source as string).split("");
      let rowArr = []; // 拆分出来的每一行
      let rowStrArr = []; // 每一行的文字数组
      for (let i = 0; i < allAtr.length; i++) {
        const currentStr = allAtr[i];
        rowStrArr.push(currentStr);
        const rowStr = rowStrArr.join("");
        if (this._ctx.measureText(rowStr).width > MAX_WIDTH) {
          rowStrArr.pop(); // 删除最后一个
          rowArr.push(rowStrArr.join("")); // 完成一行
          rowStrArr = [currentStr];
          continue;
        }
        // 最后一个字母 直接添加到一行
        if (i === allAtr.length - 1) {
          rowArr.push(rowStr); // 完成一行
        }
      }
      let line = rowArr.length > totalLine ? totalLine : rowArr.length;
      for (let i = 0; i < line; i++) {
        // console.log(rowArr[i], i, line);
        if (i + 1 === line && line !== 1) {
          rowArr[i] = rowArr[i] + "...";
        }
        this._ctx.fillText(rowArr[i], startX, startY + i * lineHeight);
      }
      resolve(rowArr.length);
    });
  }

  /**
   * @description 绘制图片
   * @param {ImageConfig} params
   * @returns
   */
  public async drawImage(params: DrawProps): Promise<void> {
    return new Promise(() => {
      if (params.borderRadius !== undefined) {
        this.creatBorderRect(
          Math.floor(params.x * this._ratio),
          Math.floor(params.y * this._ratio),
          Math.floor((params.source as HTMLImageElement).width * this._ratio),
          Math.floor((params.source as HTMLImageElement).height * this._ratio),
          Math.floor(params.borderRadius * this._ratio),
        );
        // this.restore()
      }
      // console.log('drawImage: params', params);

      if (
        params.dx == undefined ||
        params.dy == undefined ||
        params.dWidth == undefined ||
        params.dHeight == undefined
      ) {
        // console.log(params);

        this._ctx.drawImage(
          params.source as HTMLImageElement,
          Math.floor(params.x * this._ratio),
          Math.floor(params.y * this._ratio),
          Math.floor((params.source as HTMLImageElement).width * this._ratio),
          Math.floor((params.source as HTMLImageElement).height * this._ratio),
        );
      } else {
        this._ctx.drawImage(
          params.source as HTMLImageElement,
          params.dx * this._ratio,
          params.dy * this._ratio,
          params.dWidth * this._ratio,
          params.dHeight * this._ratio,
          params.x * this._ratio,
          params.y * this._ratio,
          (params.source as HTMLImageElement).width * this._ratio,
          (params.source as HTMLImageElement).height * this._ratio,
        );
      }
      this.restore();
    });
  }

  /**
   * @description 创建图片
   * @param {string} url
   * @returns {Promise<HTMLImageElement|unknown>}
   */
  public createImage(src: string): Promise<HTMLImageElement | unknown> {
    console.log(src);
    if (!Image) {
      console.log("不支持new Image(),传入CanvasImageSource");
      return;
    }
    let img = new Image();
    img.src = src;
    img.referrerPolicy = "no-referrer";
    let imgPo = new Promise((resolve, reject) => {
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function (e) {
        reject(e);
      };
    });
    return imgPo;
  }

  /**
   * @description 创建圆角矩形
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} width 宽度
   * @param {number} height 高度
   * @param {number} radius 圆角半径
   * @returns
   */
  public creatBorderRect(
    x: number,
    y: number,
    w: any,
    h: any,
    r: number,
    color?: string | CanvasGradient | CanvasPattern,
  ) {
    [x, y, w, h, r] = [x * this._ratio, y * this._ratio, w * this._ratio, h * this._ratio, r * this._ratio];
    this._ctx.beginPath();
    // 左上角
    this._ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
    this._ctx.moveTo(x + r, y);
    this._ctx.lineTo(x + w - r, y);
    this._ctx.lineTo(x + w, y + r);
    // 右上角
    this._ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 2 * Math.PI);
    this._ctx.lineTo(x + w, y + h - r);
    this._ctx.lineTo(x + w - r, y + h);
    // 右下角
    this._ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
    this._ctx.lineTo(x + r, y + h);
    this._ctx.lineTo(x, y + h - r);
    // 左下角
    this._ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI);
    this._ctx.lineTo(x, y + r);
    this._ctx.lineTo(x + r, y);

    this._ctx.fillStyle = color || "#5a5a5a";
    this._ctx.fill();
    this._ctx.closePath();
    this._ctx.save();
    this._ctx.clip();
  }

  /**
   * @description 恢复clip区域限制
   * @returns
   */
  public restore() {
    this._ctx.restore();
  }
  /**
   *
   * @param type 图片类型
   * @param quality 图片质量(0-1)
   * @returns String
   */
  public canvas2Image() {
    let canvasImg = this._canvas.toDataURL("image/png", 1);
    return canvasImg;
  }

  /**
   * @description 获取canvas
   * @returns {HTMLCanvasElement}
   */
  public getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
  /**
   * @description 获取canvas的上下文
   * @returns {RenderingContext}
   */
  public getCtx(): RenderingContext {
    return this._ctx;
  }

  /* public setRatio(resW: number, deviceW: number) {
    this._ratio = deviceW / resW;
  } */
}
export default CanvasPoster;
