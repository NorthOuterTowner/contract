import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {router} from './common/router' // 确保你的路由文件路径是 common/router.js
import {createDiscreteApi} from 'naive-ui'
import axios from 'axios'
import naive from 'naive-ui' // Naive UI 基础库

//先创建app实例
const app = createApp(App);

//设置axios默认配置
axios.defaults.baseURL = "http://localhost:3000";
//讲axios挂载到app的全局属性上
app.config.globalProperties.$axios = axios;
axios.defaults.withCredentials = true;


const {message,notification,dialog} = createDiscreteApi(["message","dialog","notification"]);


app.provide("axios",axios);
app.provide("message",message); // message 提示将在组件中通过 inject('message') 使用
app.provide("dialog",dialog); // dialog 提示将在组件中通过 inject('dialog') 使用

app.use(router);
app.use(naive); // 全局注册 Naive UI 组件

app.mount('#app');