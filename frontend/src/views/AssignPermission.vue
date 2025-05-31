<template>
  <div class="assign-permissions">
    <h2>分配权限 - 用户ID: {{ userId }}</h2>
    <!-- 这里可以实现具体的权限分配逻辑 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = ref(route.params.userId);

onMounted(() => {
  // 可以在这里获取用户的当前权限信息
});
</script>

<style scoped>
.assign-permissions {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}
</style>