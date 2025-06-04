import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import QueryContractList from '../views/QueryContractList.vue';
import QueryContract from '../views/QueryContract.vue';
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
import SystemManagement from '../views/SystemManagement.vue';
import UserManagement from '../views/UserManagement.vue';
import AddUser from '../views/AddUser.vue';
import ModifyUser from '../views/ModifyUser.vue';
import RoleManagement from '../views/RoleManagement.vue';
import AddRole from '../views/AddRole.vue';

let routes = [
  { path: '/', redirect: '/HomePage' },
  { path: '/HomePage', component: HomePage },
  { path: "/approveList", component: approveList },
  { path: '/approval', component: approval },
  { path: "/DraftContract", component: DraftContract },
  { path: "/DraftContractList", component: DraftContractList },
  { path: "/CoSignContract", component: CoSignContract },
  { path: "/CoSignContractList", component: CoSignContractList },
  { path: "/FinalizeContract", component: FinalizeContract },
  { path: "/FinalizeContractList", component: FinalizeContractList },
  { path: '/PendingContractList', component: PendingContractList },
  { path: '/allocate/:contractId', component: AssignContract },
  { path: "/approve/content", component: content },
  { path: '/system', component: SystemManagement },
  { path: '/system/user', component: UserManagement },
  { path: '/system/user/add', component: AddUser },
  { path: '/system/user/modify/:userId', component: ModifyUser },
  { path: '/system/role', component: RoleManagement },
  { path: '/system/role/add', component: AddRole },
  
  // 合同查询路由
  { path: '/query', name: 'QueryContractList', component: QueryContractList },
  { path: '/query/detail/:id', name: 'QueryContract', component: QueryContract },
  
  // 合同查询子路由
  { path: '/query/name', component: QueryContractList },
  { path: '/query/status', component: QueryContractList },
  { path: '/query/advanced', component: QueryContractList }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export { router, routes };