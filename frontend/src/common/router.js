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
//import QueryPage from '../views/QueryPage.vue';
import QueryContractList from '../views/QueryContractList.vue';
import QueryContract from '../views/QueryContract.vue';
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
import CustomerInfo from '../views/CustomerInfo.vue';
import ContractInfo from '../views/ContractInfo.vue';

let routes= [

  
   { path:'/',redirect:'/FirstPage'},
    { path:'/FirstPage',component : FirstPage},
    { path:'/login',component:Login},
    { path:'/register',component:Register},

    //{ path: '/', redirect: '/HomePage'},
    { path: '/HomePage', component :HomePage},
    { path: "/approveList", component:approveList },
    { path: '/approval', component:approval },
    { path: "/DraftContract", component: DraftContract },
    { path: "/DraftContractList", component: DraftContractList },
    { path: "/CoSignContract", component: CoSignContract },
    { path: "/CoSignContract/:contractId", component: CoSignContract },
    { path: "/CoSignContractList", component: CoSignContractList },
    { path: "/FinalizeContract", component: FinalizeContract },
    { path: "/FinalizeContractList", component: FinalizeContractList },
    { path: '/PendingContractList',component: PendingContractList },
    { path: '/allocate/:contractId',component: AssignContract },
    { path: "/approve/content",component:content },
    //用户管理子路由
    { path: '/user', component: UserManagement },
    { path: '/user/add', component: AddUser },
    //角色管理子路由
    { path: '/user/modify/:userId', component: ModifyUser },
    { path: '/role', component: RoleManagement },
    { path: '/role/add', component: AddRole},
    { path: '/role/modify/:roleId', component: ModifyRole},
    //功能管理子路由
    { path: '/function', component: FunctionManagement },
    { path: '/function/add', component: AddFunction },
    //权限分配子路由
    { path: '/permission', component: PermissionManagement },
    { path: '/permission/assign/:userId', component: AssignPermissions },
    //{ path: "/query", component: QueryPage },
    { path: "/SignContractList", component: SignContract},
    { path: "/sign/content", component: SignContent },

      // 合同查询路由
    { path: '/query', name: 'QueryContractList', component: QueryContractList },
    { path: '/query/detail/:id', name: 'QueryContract', component: QueryContract },
  
    // 合同查询子路由
    { path: '/query/name', component: QueryContractList },
    { path: '/query/status', component: QueryContractList },
    { path: '/query/advanced', component: QueryContractList },

    // 客户信息路由
    {path: '/customerInfo', name: 'CustomerInfo', component: CustomerInfo },
    {path: '/contractInfo', name: 'ContractInfo', component: ContractInfo }

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
    next('/login');//未登陆时跳转登录页
  } else {
    next();
  }
});


export { router, routes };

