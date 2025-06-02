import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {router} from './common/router'
import {createDiscreteApi} from 'naive-ui'
import axios from 'axios'
import naive from 'naive-ui'

//先创建app实例
const app = createApp(App);

//设置axios默认配置
axios.defaults.baseURL = "http://localhost:3000";
//讲axios挂载到app的全局属性上
app.config.globalProperties.$axios = axios;
axios.defaults.withCredentials = true;


const {message,notification,dialog} = createDiscreteApi(["message","dialog","notification"]);


app.provide("axios",axios);
app.provide("message",message);

app.use(router);
app.use(naive);

app.mount('#app')
