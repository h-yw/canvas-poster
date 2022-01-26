# CanvasPoster

## 介绍

CanvasPoster使用canvas原生接口快速绘制简单canvas,导出base64资源。

`Tips:` betas 版本可能会有bug，请谨慎使用。
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
  import CanvasPoster from "./lib/index.ts";
  const poster = new CanvasPoster(canvas, {
    width: window.innerWidth,
    height: 3615,
    type: "2d",
    ratio:375 / 750, // 缩放比例：canvas宽度/画稿宽度
    // 可选参数：点击区域
    target: {
      share: {
        x: 644,
        y: 58,
        width: 96,
        height: 96,
      }
    },
    // 可选参数：点击区域的回调,
    onClick: (event) => {
      // 点击位置
      console.log(event.$position);
      // 击中目标
      console.log(event.$target);
    }
  });
  poster.draw([
    {
      type: 'image',
      source: './example/image/bg.png',
      x: 0,
      y: 0,
      width: 750,
      height: 3615,
    },
    {
      type: 'text',
      source: '哈哈哈哈哈哈哈哈哈哈哈',
      x: Math.floor(320 / 2),
      y: 12,
      maxWidth: 375,
      color: '#f0f0ff'
    }
  ]);
```