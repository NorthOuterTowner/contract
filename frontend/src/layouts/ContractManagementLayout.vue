<template>
  <div class="contract-management-layout">
    <div class="sidebar-container">
      <QueryAndStatisticsSidebar :active-path="$route.path" />
    </div>

    <div class="main-content-container">
      <router-view /> 
    </div>
  </div>
</template>

<script>
// 导入你的简化侧边栏组件
import QueryAndStatisticsSidebar from '../components/QueryAndStatisticsSidebar.vue'; 

export default {
  name: 'ContractManagementLayout',
  components: {
    QueryAndStatisticsSidebar 
  }
}
</script>

<style scoped>
.contract-management-layout {
  display: flex; 
  height: 100vh; 
  overflow: hidden; 
}

.sidebar-container {
  width: 200px; 
  background-color: #2c3e50; /* 与 QueryAndStatisticsSidebar 的背景色匹配 */
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; 
}

.main-content-container {
  flex-grow: 1; 
  overflow-y: auto; /* 允许内容区域垂直滚动 */
  padding: 0; 
  background-color: #f4f6f8; /* 与你的页面背景色一致 */
}
</style>