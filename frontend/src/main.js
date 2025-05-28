import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {router} from './common/router'
import axios from 'axios'
axios.defaults.baseURL = "http://localhost:3000";

const app = createApp(App);
app.provide("axios",axios);
app.use(router);

app.mount('#app')
