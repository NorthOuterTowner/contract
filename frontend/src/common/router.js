import {createRouter, createWebHashHistory} from 'vue-router'
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

let routes= [
    {path: '/', redirect: '/HomePage'},
    {path:'/HomePage',component :HomePage},
    {path:"/approveList",component:approveList},
    {path:'/approval',component:approval},
    { path: "/DraftContract", component: DraftContract },
    { path: "/DraftContractList", component: DraftContractList },
    { path: "/CoSignContract", component: CoSignContract },
    { path: "/CoSignContractList", component: CoSignContractList },
    { path: "/FinalizeContract", component: FinalizeContract },
    { path: "/FinalizeContractList", component: FinalizeContractList },
    { path: '/PendingContractList',component: PendingContractList },
    { path: '/allocate/:contractId',component: AssignContract },
    { path:"/approve/content",component:content },
]

const router = createRouter({
    history:createWebHashHistory(),
    routes,
});

export { router ,routes };