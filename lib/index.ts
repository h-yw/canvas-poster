/**
 * @name CanvasPoster
 * @desc canvas poster，easy to create poster and export picture
 * @desc 创建canvas海报,便于快速生成海报并导出图片
 * @author Mr.Hou
 * @time 2021/11/18
 */
import { PosterConfig, TextConfig, ImageConfig, DrawProps } from "./type";
type Selector = string
class CanvasPoster {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _config: PosterConfig;
  public _ratio = 1;
  private _openEvent =false
  constructor(canvas: HTMLCanvasElement, config?: PosterConfig) {
    this._canvas = canvas;
    this._config = config;
    this._ctx = this._canvas.getContext("2d", { alpha: false });
    this._ratio =config.ratio
    config.onClick&&this.listener(config.onClick)
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
      this._canvas.width = this._config.width * devicePixelRatio;
      this._canvas.height = this._config.height * devicePixelRatio*this._ratio;
      this._ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    this._ctx.font = "24px sans-serif";
    this._ctx.fillStyle = "#000";
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
  }

  /**
   * @description 绘制
   * @param {Array[ImageConfig|TextConfig]} data
   * @returns
   */
  public async draw(data: Array<DrawProps>) {
    let len = data.length;
    for (let i = 0; i < len; i++) {
      if (data[i].type === "text") {
        this.drawText(data[i]);
        // continue
      }
      if (data[i].type === "image") {
        // if (data[i].image instanceof Image) {
        //   this.drawImage(data[i]);
        //   console.log(i);

        //   // continue
        // }
        if (typeof data[i].type === "string") {
          let img = await this.createImage(data[i].source as string);
          // console.log(img);
          data[i].source = img as CanvasImageSource;
          this.drawImage(data[i]);
        }
      }
      console.log(data[i]);
      
    }
  }


  /**
   * @description 绘制文字
   * @param {TextConfig} params
   * @returns
   */
  public async drawText(params: DrawProps): Promise<number> {
    return new Promise((resolve, reject) => {
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
      let MAX_WIDTH = params.maxWidth || 200;
      let totalLine = params.totalLine || 1;
      let lineHeight = params.lineHeight || 24;
      let startX = params.x || 0;
      let startY = params.y || 0;
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
    return new Promise((resolve, reject) => {
      if (params.borderRadius !== undefined) {
        this.creatBorderRect(
          params.x,
          params.y,
          params.width,
          params.height,
          params.borderRadius,
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
          params.source as CanvasImageSource,
          params.x*this._ratio,
          params.y*this._ratio,
          params.width*this._ratio,
          params.height*this._ratio,
        );
      } else {
        this._ctx.drawImage(
          params.source as CanvasImageSource,
          params.dx,
          params.dy,
          params.dWidth,
          params.dHeight,
          params.x,
          params.y,
          params.width,
          params.height,
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
  public canvas2Image(type: string, quality: number) {
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
  public setRatio(resW: number, deviceW: number) {
      this._ratio = deviceW / resW;
  }
  public listener(callback: Function) {
    this._canvas.addEventListener("click", (event)=>{
      let position = {
        x: event.offsetX,
        y: event.offsetY
      }
      event['$position'] = position;
      callback(event);
    });
  }
}
export default CanvasPoster;
