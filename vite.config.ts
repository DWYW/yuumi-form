const pkg = require("./package.json")
import { resolve } from "path"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import eslintPlugin from "vite-plugin-eslint"

// https://vitejs.dev/config/
export default defineConfig({
  base: '/yuumi-form/latest',
  define: {
    __APP_NAME__: `"YuumiForm"`,
    __APP_VERSION__: `"${pkg.version}"`
  },
  plugins: [
    vue(),
    eslintPlugin({
      include: [
        'src/**/*.{j,t}s?(x)',
        'src/**/*.vue'
      ]
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
})
