import {createRouter, createWebHashHistory} from 'vue-router'
import HomePage from '../views/HomePage.vue';
import approveList from '../views/approveList.vue';
import approval from '../views/approval.vue';
let routes= [
    {path: '/', redirect: '/HomePage'},
    {path:'/HomePage',component :HomePage},
    {path:"/approveList",component:approveList},
    {path:'/approval',component:approval}
]

const router = createRouter({
    history:createWebHashHistory(),
    routes,
});

export { router ,routes };