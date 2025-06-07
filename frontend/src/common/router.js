import { createRouter, createWebHashHistory } from 'vue-router';

// 导入所有你现有队友的视图组件 (保持不变)
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

// 导入你负责的页面组件 (Naive UI 版本)
import QueryContractList from '../views/QueryContractList.vue'; 
import QueryContract from '../views/QueryContract.vue';       
import ContractStatisticsPage from '../views/ContractStatisticsPage.vue'; 

// 导入你模块的专用布局组件
import ContractManagementLayout from '../layouts/ContractManagementLayout.vue'; 

let routes = [
    // 队友的现有路由 (保持不变)
    { path:'/',redirect:'/FirstPage'},
    { path:'/FirstPage',component : FirstPage},
    { path:'/login',component:Login},
    { path:'/register',component:Register},
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
    { path: '/user', component: UserManagement },
    { path: '/user/add', component: AddUser },
    { path: '/user/modify/:userId', component: ModifyUser },
    { path: '/role', component: RoleManagement },
    { path: '/role/add', component: AddRole},
    { path: '/role/modify/:roleId', component: ModifyRole},
    { path: '/function', component: FunctionManagement },
    { path: '/function/add', component: AddFunction },
    { path: '/permission', component: PermissionManagement },
    { path: '/permission/assign/:userId', component: AssignPermissions },
    { path: "/SignContractList", component: SignContract},
    { path: "/sign/content", component: SignContent },

    // 【关键修改】这里务必确认，旧的 /query 路由已被移除。
    // 如果你的文件中有以下内容，请务必删除或注释掉它们：
    // { path: '/query', name: 'QueryContractList', component: QueryContractList },
    // { path: '/query/detail/:id', name: 'QueryContract', component: QueryContract },
    // { path: '/query/name', component: QueryContractList },
    // { path: '/query/status', component: QueryContractList },
    // { path: '/query/advanced', component: QueryContractList }

    // 【关键修改】添加你负责的模块的路由 (新的顶级路由和子路由)
    { 
        path: '/my-contract-module', // 你的模块的顶级路径
        component: ContractManagementLayout, // 使用你的模块专用布局
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
            // 如果你的合同查询还有其他子路由（如按名称、按状态、高级查询），也添加到这里并更新路径
            { path: 'query/name', component: QueryContractList }, 
            { path: 'query/status', component: QueryContractList },
            { path: 'query/advanced', component: QueryContractList }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(), 
    routes
});

export { router, routes };