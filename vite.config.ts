import { defineConfig } from "vite";
import { qrcode } from 'vite-plugin-qrcode';
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  root: process.cwd(),
  base: "/",
  publicDir: path.resolve(__dirname, "public"),
  cacheDir: path.resolve(__dirname, "node_modules/.vite"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "lib"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  plugins:[
    qrcode()
  ],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    assetsDir: path.resolve(__dirname, "src/public"),
    cssCodeSplit: true,
    sourcemap: true,
    minify: "esbuild",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      name: "create-poster",
      fileName: (format) => `create-poster.${format}.js`,
    },
    rollupOptions: {
      /* input: {
        main: path.resolve(__dirname, "index.html"),
      }, */
      external: ["react", "react-dom", "vue",'index.html'],
    },
  },
  logLevel: "info",
  envDir: path.resolve(__dirname, "config"),
  envPrefix: ["VITE_"],
  server: {
    host: "127.0.0.1",
    port: 9527,
    strictPort: false,
    https: false,
    open: process.env.BROWSER !== "none",
    /* 
        https://vitejs.dev/config/#server-proxy
        proxy:{
           '/api': {
            target: 'http://example.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          },
        },
        */
    origin: "http://127.0.0.1:9527/",
  },
});
