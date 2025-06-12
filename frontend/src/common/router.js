import { createRouter, createWebHashHistory } from 'vue-router';
import axios from "axios";
import { useAuthStore } from './auth'; 
import { createDiscreteApi } from 'naive-ui';

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
import UserManagement from '../views/UserManagement.vue';
import AddUser from '../views/AddUser.vue';
import ModifyUser from '../views/ModifyUser.vue';
import RoleManagement from '../views/RoleManagement.vue';
import AddRole from '../views/AddRole.vue';
import ModifyRole from '../views/ModifyRole.vue';
import FunctionManagement from '../views/FunctionManagement.vue';
import AddFunction from '../views/AddFunction.vue';
import ModifyFunction from '../views/ModifyFunction.vue';
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
    { path: "/FinalizeContract/:contractId", component: FinalizeContract },
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
    { path: '/function/modify/:functionId', component: ModifyFunction },
    //权限分配子路由
    { path: '/permission', component: PermissionManagement },
    { path: '/permission/assign/:userId', component: AssignPermissions },
    { path: "/SignContractList", component: SignContract},
    { path: "/sign/content", component: SignContent },

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
            //{ path: 'query/name', component: QueryContractList }, 
            //{ path: 'query/status', component: QueryContractList },
            //{ path: 'query/advanced', component: QueryContractList }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(), 
    routes
});

// 创建 message 实例
const { message } = createDiscreteApi(["message"]);

// 获取用户所有可访问的路由
const getUserAccessibleRoutes = async (userId) => {
  try {
    const response = await axios.get("/permission/checkPermission", {
      params: {
        userId,
        route: '*' // 表示获取所有可访问路由
      }
    });
    return response.data.allowedRoutes || [];
  } catch (error) {
    console.error("获取用户可访问路由失败:", error);
    return [];
  }
};

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // 初始化认证状态（确保获取最新的登录状态）
  await authStore.initAuth();

  // 公开路由列表（无需登录）
  const publicRoutes = ['/login', '/register', '/FirstPage', '/', '/HomePage',];
  const isPublic = publicRoutes.includes(to.path);

  // 如果是公开路由，直接放行
  if (isPublic) {
    console.log(`访问公开路由 ${to.path}，直接放行`);
    next();
    return;
  }

  // 未登录且访问非公开路由，重定向到登录页
  if (!isPublic && !authStore.isLoggedIn) {
    next('/login'); // 未登录时跳转登录页
    return;
  }

  const userId = authStore.user?.id;
  console.log('userId:', userId);
  if (userId) {
    try {
      const accessibleRoutes = await getUserAccessibleRoutes(userId);
      const hasPermission = accessibleRoutes.some(allowedRoute => {
        // 将路由转换为正则表达式
        const regexRoute = allowedRoute        
        .replace(/:userId/g, '\\d+')
        .replace(/:contractId/g, '[^/]{1,10}') // 匹配不超过 10 个非斜杠字符
        .replace(/:roleId/g, '\\d+')
        .replace(/:functionId/g, '\\d+');
              
        const routeRegex = new RegExp(`^${regexRoute}$`);
        return routeRegex.test(to.path);
      });
      console.log('hasPermission:', hasPermission);
      if (hasPermission) {
        next();
      } else {
        // 没有权限，弹框提示
        message.error('您没有权限访问该页面');
        next(false); // 阻止路由跳转
      }
    } catch (error) {
      console.error("检查权限失败:", error);
      message.error('检查权限失败，请稍后重试');
      next(false); // 阻止路由跳转
    }
  } else {
    // 如果 userId 为空，重定向到登录页
    next('/login');
  }
});

export { router, routes };