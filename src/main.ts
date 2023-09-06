import { createApp } from 'vue'
import { router } from "./router"
import App from './App.vue'
import Yuumi from "yuumi-ui-vue"
import i18n from "./i18n"

const app = createApp(App)
app.use(router)
app.use(Yuumi)
app.use(i18n)
app.mount('#app')
