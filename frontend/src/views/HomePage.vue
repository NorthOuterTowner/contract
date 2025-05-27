<template>
  <div class="home-page">
    <header class="header">
      <h1>合同管理系统</h1>
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
        @click="handleClick(item)"
      >
        <div class="icon">{{ item.icon }}</div>
        <div class="label">{{ item.label }}</div>
      </div>
    </main>

    <footer class="footer">
      <p>请选择上方功能进入相应模块～</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = ref(localStorage.getItem('role') || 'operator') //默认为guest，测试临时修改



const roleName = computed(() => {
  if (role.value === 'admin') return '合同管理员'
  if (role.value === 'operator') return '合同操作员'
  return '游客'
})

const features = [
  { label: '起草合同', route: '/DraftContractList', roles: ['operator'], icon: '📝' },
  { label: '会签合同', route: '/CoSignContractList', roles: ['operator'], icon: '🤝' },
  { label: '定稿合同', route: '/FinalizeContractList', roles: ['operator'], icon: '📑' },
  { label: '分配合同', route: '/admin', roles: ['admin'], icon: '🗂️' },
  { label: '合同查询', route: '/query', roles: ['admin'], icon: '🔍' },
  { label: '用户管理', route: '/user-management', roles: ['admin'], icon: '👥' },
  { label: '审批合同', route: '/approveList',roles:['admin'],icon:'🔍'}
]

function hasAccess(allowedRoles) {
  return allowedRoles.includes(role.value)
}

function handleClick(item) {
  if (!hasAccess(item.roles)) {
    alert('权限不足，无法访问该功能喵～')
    return
  }
  router.push(item.route)
}

function logout() {
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<style scoped>
.home-page {
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
  pointer-events: auto;
}

.footer {
  margin-top: 50px;
  text-align: center;
  color: #666;
  font-size: 1.1em;
}
</style>
