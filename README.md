# CanvasPoster

## 介绍

CanvasPoster使用canvas原生接口快速绘制简单canvas,导出base64资源。

## 项目安装

```bash
    npm install
    # 或
    yarn install
```

## 项目运行

```bash
    npm dev
    # 或
    yarn dev
```

## 项目构建

```bash
    npm run build
    # 或
    yarn build
```

## 使用示例
```js
import CanvasPoster from 'canvas-poster';
    const poster = new CanvasPoster(canvas, {
      width: 600, 
      height: 820,
      type: "2d",
});
poster.draw([
    {
        type: "image",
        image: "./example/image/baina_wrap.png",
        x: 0,
        y: 0,
        width: 600,
        height: 820,
    },
    {
        type: "image",
        image: "https://static.seapard.com/zdm/2021/07/08/162572445063712.jpg",
        x: 75,
        y: 160,
        width: 450,
        height: 450,
        borderRadius: 16, // 圆角
    },
    {
        type: "text",
        text: "我是文字",
        x: 185, // 文字起始x坐标
        y: 203, // 文字起始y坐标
        color: "#000", // 字体颜色
        linHeight: 40, // 行高
        font:'24px sans-serif', //字体
        totalLine: 1, //显示行数
    },
    {
        type: "image",
        image: "./example/image/dialog_bottom.png",
        x: 0,
        y: 560,
        width: 600,
        height: 260,
    },
    {
        type: "text",
        text: "我是文字",
        x: 185,
        y: 600,
        color: "#000",
    },
]);
```