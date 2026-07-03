import { createApp } from 'vue'
import { createPinia } from 'pinia'
import globaComponents from './plugins/globalComponents'
import App from './App.vue'
import router from './router'

import './assets/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(globaComponents)
app.use(router)

app.mount('#app')
