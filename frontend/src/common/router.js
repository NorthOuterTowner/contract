import {createRouter, createWebHashHistory} from 'vue-router'

let routes= [
    {path: '/', redirect: '/HomePage'},
    {path:"/HomePage",component : ()=>import("../views/HomePage.vue")}
]

const router = createRouter({
    history:createWebHashHistory(),
    routes,
});

export { router ,routes };