<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
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