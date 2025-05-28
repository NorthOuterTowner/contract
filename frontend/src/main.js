import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {router} from './common/router'
import {createDiscreteApi} from 'naive-ui'
import axios from 'axios'
import naive from 'naive-ui'
axios.defaults.baseURL = "http://localhost:3000";
const {message,notification,dialog} = createDiscreteApi(["message","dialog","notification"]);
const app = createApp(App);

app.provide("axios",axios);
app.provide("message",message);

app.use(router);
app.use(naive);

app.mount('#app')
