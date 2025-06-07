<template>
  <div class="user-status">
    <span v-if="authStore.isLoggedIn" class="status-row">
      <span class="welcome-text">欢迎，</span>
      <!-- 显示角色名和用户名 -->
      <span class="username">{{ getRoleName(authStore.user.role) }} {{ authStore.user.username }}</span>
      <span class="separator">|</span>
      <button @click="logout" class="logout-btn">注销</button>
    </span>
    <span v-else>
      <button @click="login" class="login-btn">登录</button>
    </span>
  </div>
</template>

<script setup>
import { useAuthStore } from '../common/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref, onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const roles = ref([]);

// 获取所有角色信息
const getAllRoles = async () => {
  try {
    const response = await axios.get('/role/all');
    roles.value = response.data;
  } catch (error) {
    console.error('获取角色列表失败！', error);
  }
};

// 根据角色 ID 获取角色名称
const getRoleName = (roleId) => {
  const role = roles.value.find(role => role.RoleID === roleId);
  return role ? role.RoleName : '未知角色';
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const login = () => {
  router.push('/login');
};

onMounted(async () => {
  await getAllRoles();
});
</script>

<style scoped>
.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-text {
  color: #333;
}

.username {
  font-weight: bold;
  color: #081541;
}

.separator {
  color: #ccc;
  margin: 0 4px;
}

.login-btn,
.logout-btn {
  background: none;
  border: none;
  color: #081541;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.login-btn:hover,
.logout-btn:hover {
  color: #1a2c6b;
}
</style>