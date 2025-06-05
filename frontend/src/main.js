import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import {router} from './common/router'
import {createDiscreteApi} from 'naive-ui'
import axios from 'axios'
import naive from 'naive-ui'
import { useAuthStore } from './common/auth'

const pinia = createPinia();
//先创建app实例
const app = createApp(App);



//设置axios默认配置
axios.defaults.baseURL = "http://localhost:3000";
//axios挂载到app的全局属性上

axios.defaults.withCredentials = true;

app.config.globalProperties.$axios = axios;

const {message,notification,dialog} = createDiscreteApi(["message","dialog","notification"]);


app.provide("axios",axios);
app.provide("message",message);

app.use(pinia);
app.use(router);
app.use(naive);

//app.mount('#app')
// 初始化认证状态
const authStore = useAuthStore(pinia);
authStore.initAuth().then(() => {
  // 认证状态初始化完成后再挂载应用
  app.mount('#app')
});