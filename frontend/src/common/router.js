import { createRouter, createWebHashHistory } from 'vue-router';

//import test from '../views/test.vue';
import { useAuthStore } from './auth'; 
import FirstPage from '../views/FirstPage.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import HomePage from '../views/HomePage.vue';

// 导入其他页面组件
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

// 统计和查询 (Naive UI 版本)
import QueryContractList from '../views/QueryContractList.vue'; 
import QueryContract from '../views/QueryContract.vue';       
import ContractStatisticsPage from '../views/ContractStatisticsPage.vue'; 

// 统计和查询——布局组件
import ContractManagementLayout from '../layouts/ContractManagementLayout.vue'; 

let routes = [
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
    { path: "/SignContractList", component: SignContract},
    { path: "/sign/content", component: SignContent },

    // 查询和统计——移除旧的 /query 路由。
    // { path: '/query', name: 'QueryContractList', component: QueryContractList },
    // { path: '/query/detail/:id', name: 'QueryContract', component: QueryContract },
    // { path: '/query/name', component: QueryContractList },
    // { path: '/query/status', component: QueryContractList },
    // { path: '/query/advanced', component: QueryContractList }

    // 查询和统计——新的顶级路由和子路由)
    { 
        path: '/my-contract-module', // 顶级路径
        component: ContractManagementLayout, // 专用布局
        children: [
            { 
                path: 'query', // 合同查询列表页 (完整路径: /my-contract-module/query)
                name: 'MyModuleContractQueryList', 
                component: QueryContractList, 
            },
            { 
                path: 'query/detail/:id', // 合同查询详情页 (完整路径: /my-contract-module/query/detail/:id)
                name: 'MyModuleContractQueryDetail', 
                component: QueryContract, 
            },
            {
                path: 'statistics', // 合同统计页 (完整路径: /my-contract-module/statistics)
                name: 'MyModuleContractStatistics',
                component: ContractStatisticsPage, 
            },
            // 其他子路由（如按名称、按状态、高级查询），也添加到这里并更新路径。目前暂时弃用
            { path: 'query/name', component: QueryContractList }, 
            { path: 'query/status', component: QueryContractList },
            { path: 'query/advanced', component: QueryContractList }
        ]
    },
    // 客户信息路由
    {path: '/customerInfo', name: 'CustomerInfo', component: CustomerInfo },
    {path: '/contractInfo', name: 'ContractInfo', component: ContractInfo }
];
const router = createRouter({
    history: createWebHashHistory(), 
    routes
});

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
    // 获取用户的角色和权限
    const userRole = authStore.userRole;
    const userPermissions = await getPermissionsByRole(userRole);

    // 获取目标路由对应的功能
    const targetFunction = await getFunctionByRoute(to.path);

    // 检查用户是否有访问该功能的权限
    if (targetFunction && !userPermissions.includes(targetFunction.FunctionID)) {
      next('/403'); // 无权限访问，重定向到 403 页面
    } else {
      next();
    }
  }
});

// 获取用户角色对应的权限
const getPermissionsByRole = async (roleId) => {
  try {
    const response = await axios.get(`/role/permissions?roleId=${roleId}`);
    return response.data.map(item => item.FunctionID);
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return [];
  }
};

// 根据路由获取对应的功能
const getFunctionByRoute = async (route) => {
  try {
    const response = await axios.get(`/function/query?functionRoute=${route}`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('获取功能信息失败:', error);
    return null;
  }
};

export { router, routes };


