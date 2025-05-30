<template>
  <div class="system-management">
    <header class="header">
      <h2>系统管理</h2>
      <!-- 继承主界面的用户信息栏 -->
      <div class="user-info">
        <span>欢迎您，{{ roleName }}</span>
        <button @click="logout">注销</button>
      </div>
    </header>

        <main class="menu-grid">
      <div
        v-for="item in features"
        :key="item.label"
        class="menu-item"
        :class="{ disabled: !hasAccess(item.roles) }"
        @click="handleClick(item.route)"
      >
        <div class="icon">{{ item.icon }}</div>
        <div class="label">{{ item.label }}</div>
      </div>
    </main>

    <footer class="footer">
      <p>系统管理模块，仅管理员可访问</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const role = ref(localStorage.getItem('role') || 'operator');

// 继承主界面的角色名称计算
const roleName = computed(() => {
  if (role.value === 'admin') return '合同管理员';
  if (role.value === 'operator') return '合同操作员';
  return '游客';
});

const features = [
  { label: '用户管理', route: '/system/user', roles: ['operator'], icon: '👥' },
  { label: '角色管理', route: '/', roles: ['operator'], icon: '🔐' },
  { label: '功能管理', route: '/system/function', roles: ['operator'], icon: '⚙️' },
  { label: '权限配置', route: '/', roles: ['operator'], icon: '🛡️' },
]

// 权限检查函数（继承主界面逻辑）
function hasAccess(allowedRoles) {
  return allowedRoles.includes(role.value);
}

// 路由跳转函数
function handleClick(route) {
//   if (!hasAccess(['admin'])) {
//     alert('权限不足，仅管理员可操作！');
//     return;
//   }
  router.push(route);
}

// 注销函数（复用主界面逻辑）
function logout() {
  localStorage.removeItem('role');
  router.push('/login');
}
</script>

<style scoped>
/* 继承主界面样式，保持一致性 */
.system-management {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.user-info span {
  margin-right: 15px;
  font-weight: bold;
}

.user-info button {
  background-color: #42b983;
  border: none;
  color: white;
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 4px;
}

.user-info button:hover {
  background-color: #369870;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.menu-item {
  background-color: white;
  border: 2px solid #42b983;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #42b983;
  color: white;
}

.menu-item .icon {
  font-size: 2.2em;
  margin-bottom: 10px;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.footer {
  margin-top: 50px;
  text-align: center;
  color: #666;
  font-size: 1.1em;
}
</style>