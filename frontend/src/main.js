import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia' // Keep this import
import App from './App.vue'
import {router} from './common/router' 
import {createDiscreteApi} from 'naive-ui'
import axios from 'axios'
import naive from 'naive-ui'
import { useAuthStore } from './common/auth' // Keep this import


const pinia = createPinia(); // Keep this line
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
app.provide("dialog",dialog); 

app.use(pinia); // Keep this line (use Pinia)
app.use(router);
app.use(naive); // 全局注册 Naive UI 组件

// Combine the authentication initialization logic here
// The app should only mount AFTER authentication is initialized
const authStore = useAuthStore(pinia); // Initialize auth store
authStore.initAuth().then(() => {
  // Authentication state is initialized, then mount the application
  app.mount('#app'); // Mount the app
});