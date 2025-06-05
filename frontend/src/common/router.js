import { createRouter, createWebHashHistory } from 'vue-router';

//import test from '../views/test.vue';
import { useAuthStore } from './auth'; 
import FirstPage from '../views/FirstPage.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import HomePage from '../views/HomePage.vue';
import approveList from '../views/approveList.vue';
import approval from '../views/approval.vue';
import DraftContract from '../views/DraftContract.vue';
import DraftContractList from '../views/DraftContractList.vue';
import CoSignContract from '../views/CoSignContract.vue';
import CoSignContractList from '../views/CoSignContractList.vue';
import FinalizeContract from '../views/FinalizeContract.vue';
import FinalizeContractList from '../views/FinalizeContractList.vue';
import content from '../views/content.vue';
import PendingContractList from '../views/PendingContractList.vue';
import AssignContract from '../views/AssignContract.vue';
import QueryPage from '../views/QueryPage.vue';
import UserManagement from '../views/UserManagement.vue';
import AddUser from '../views/AddUser.vue';
import ModifyUser from '../views/ModifyUser.vue';
import RoleManagement from '../views/RoleManagement.vue';
import AddRole from '../views/AddRole.vue';
import ModifyRole from '../views/ModifyRole.vue';
import FunctionManagement from '../views/FunctionManagement.vue';
import AddFunction from '../views/AddFunction.vue';
import PermissionManagement from '../views/PermissionManagement.vue';
import AssignPermissions from '../views/AssignPermission.vue'; 
import SignContract from '../views/SignContract.vue';
import SignContent from '../views/signContent.vue';


let routes= [

  
   { path:'/',redirect:'/FirstPage'},
    { path:'/FirstPage',component : FirstPage},
    { path:'/login',component:Login},
    { path:'/register',component:Register},
    { path: '/HomePage', component :HomePage,meta: { requiresAuth: true }},
    { path: "/approveList", component:approveList ,meta: { requiresAuth: true }},
    { path: '/approval', component:approval ,meta: { requiresAuth: true }},
    { path: "/DraftContract", component: DraftContract ,meta: { requiresAuth: true }},
    { path: "/DraftContractList", component: DraftContractList,meta: { requiresAuth: true }},
    { path: "/CoSignContract", component: CoSignContract,meta: { requiresAuth: true } },
    { path: "/CoSignContractList", component: CoSignContractList ,meta: { requiresAuth: true }},
    { path: "/FinalizeContract", component: FinalizeContract ,meta: { requiresAuth: true }},
    { path: "/FinalizeContractList", component: FinalizeContractList ,meta: { requiresAuth: true }},
    { path: '/PendingContractList',component: PendingContractList,meta: { requiresAuth: true } },
    { path: '/allocate/:contractId',component: AssignContract ,meta: { requiresAuth: true }},
    { path: "/approve/content",component:content,meta: { requiresAuth: true } },
    { path: '/user', component: UserManagement,meta: { requiresAuth: true } },
    { path: '/user/add', component: AddUser ,meta: { requiresAuth: true }},
    { path: '/user/modify/:userId', component: ModifyUser ,meta: { requiresAuth: true }},
    { path: '/role', component: RoleManagement,meta: { requiresAuth: true } },
    { path: '/role/add', component: AddRole,meta: { requiresAuth: true }},
    { path: '/role/modify/:roleId', component: ModifyRole,meta: { requiresAuth: true }},
    { path: '/function', component: FunctionManagement,meta: { requiresAuth: true } },
    { path: '/function/add', component: AddFunction,meta: { requiresAuth: true } },
    { path: '/permission', component: PermissionManagement ,meta: { requiresAuth: true }},
    { path: '/permission/assign/:userId', component: AssignPermissions,meta: { requiresAuth: true } },
    { path: "/query", component: QueryPage,meta: { requiresAuth: true } },
    { path: "/SignContractList", component: SignContract,meta: { requiresAuth: true }},
    { path: "/sign/content", component: SignContent,meta: { requiresAuth: true } },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 前置路由守卫
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore()
  
//   // 如果还没有初始化认证状态，则先初始化
//   if (authStore.isLoggedIn === null) {
//     await authStore.initAuth()
//   }

//   // 需要登录的路由保护
//   const requiresAuth = !['/login', '/register', '/FirstPage'].includes(to.path)
  
//   if (requiresAuth && !authStore.isLoggedIn) {
//     next('/login')
//   } else {
//     next()
//   }
// });

// router.js（修改后）
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // 初始化认证状态（确保获取最新的登录状态）
  await authStore.initAuth();

  // 公开路由列表（无需登录）
  const publicRoutes = ['/login', '/register', '/FirstPage'];
  const isPublic = publicRoutes.includes(to.path);
  
  // 判断路由是否需要认证
  const requiresAuth = to.meta.requiresAuth;
  
 // 未登录且访问非公开路由，重定向到登录页
  if (!isPublic && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});


export { router, routes };

