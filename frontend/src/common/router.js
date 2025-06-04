import { createRouter, createWebHashHistory } from 'vue-router';
import { routerGuard } from '../common/permission.js';

// 导入各个视图组件
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

let routes = [
    { path: '/', redirect: '/FirstPage' },
    { path: '/FirstPage', component: FirstPage },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/HomePage', component: HomePage },
    { path: "/approveList", component: approveList },
    { path: '/approval', component: approval },
    { path: "/DraftContract", component: DraftContract },
    { path: "/DraftContractList", component: DraftContractList },
    { path: "/CoSignContract", component: CoSignContract },
    { path: "/CoSignContract/:contractId", component: CoSignContract },
    { path: "/CoSignContractList", component: CoSignContractList },
    { path: "/FinalizeContract", component: FinalizeContract },
    { path: "/FinalizeContractList", component: FinalizeContractList },
    { path: '/PendingContractList', component: PendingContractList },
    { path: '/allocate/:contractId', component: AssignContract },
    { path: "/approve/content", component: content },
    { path: '/user', component: UserManagement, meta: { requiredPermissions: ['查询用户'] } },
    { path: '/user/add', component: AddUser, meta: { requiredPermissions: ['新增用户'] } },
    { path: '/user/modify/:userId', component: ModifyUser, meta: { requiredPermissions: ['编辑用户'] } },
    { path: '/role', component: RoleManagement, meta: { requiredPermissions: ['查询角色'] } },
    { path: '/role/add', component: AddRole, meta: { requiredPermissions: ['新增角色'] } },
    { path: '/role/modify/:roleId', component: ModifyRole, meta: { requiredPermissions: ['编辑角色'] } },
    { path: '/function', component: FunctionManagement, meta: { requiredPermissions: ['查询功能'] } },
    { path: '/function/add', component: AddFunction, meta: { requiredPermissions: ['新增功能'] } },
    { path: '/permission', component: PermissionManagement, meta: { requiredPermissions: ['配置权限'] } },
    { path: '/permission/assign/:userId', component: AssignPermissions, meta: { requiredPermissions: ['配置权限'] } },
    { path: "/query", component: QueryPage },
    { path: "/SignContractList", component: SignContract },
    { path: "/sign/content", component: SignContent },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 使用全局前置守卫
router.beforeEach(routerGuard);

export { router, routes };