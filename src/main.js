import 'vue-sonner/style.css'
import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
}