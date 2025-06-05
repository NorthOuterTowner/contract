<template>
  <div class="app-container">
    <!-- 右上角用户状态 -->
    <div class="user-status-container">
      <UserStatus />
    </div>
    
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup>
import UserStatus from './components/UserStatus.vue';
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}

.user-status-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}
</style>