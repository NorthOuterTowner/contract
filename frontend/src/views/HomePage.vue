<template>
  <div class="home-page">
    <!-- 顶部栏 -->
    <header class="header">
      <h1 class="logo">合同管理系统</h1>
      <div class="user-controls">
        <span class="welcome">欢迎您，{{ roleName }}</span>
        <button @click="login" class="btn">登录</button>
        <button @click="logout" class="btn">注销</button>
      </div>
    </header>

    <!-- 功能导航菜单 -->
    <nav class="nav-bar">
      <div class="dropdown" @mouseleave="hideDropdown">
      <div class="drop-trigger" @mouseover="showDropdown('contract')">
        合同处理
      </div>
      <div
        class="drop-menu"
        v-show="activeMenu === 'contract'"
        @mouseenter="showDropdown('contract')"
        @mouseleave="hideDropdown"
      >
        <div @click="go('/DraftContractList')">📝 起草合同</div>
        <div @click="go('/CoSignContractList')">🤝 会签合同</div>
        <div @click="go('/FinalizeContractList')">📑 定稿合同</div>
        <div @click="go('/SignContractList')">🖊 签订合同</div>
        <div @click="go('/approveList')">📝 审批合同</div>
      </div>
      </div>


      <div class="dropdown" @mouseleave="hideDropdown">
        <div class="drop-trigger" @mouseover="showDropdown('query')">
          信息查询
        </div>
        <div class="drop-menu" 
          v-show="activeMenu === 'query'"
          @mouseenter="showDropdown('query')"
          @mouseleave="hideDropdown">
          <div @click="go('/query')">🔍 合同查询</div>
          <!--<div @click="go('/approveList')">📑 审批合同</div>-->
        </div>
      </div>

      <div class="dropdown" @mouseleave="hideDropdown">
        <div class="drop-trigger" @mouseover="showDropdown('system')">
          系统管理
        </div>
        <div class="drop-menu" 
          v-show="activeMenu === 'system'"
          @mouseenter="showDropdown('system')"
          @mouseleave="hideDropdown">
          <div @click="go('/PendingContractList')">🗂️ 分配合同</div>
          <div @click="go('/user')">👥 用户管理</div>
          <div @click="go('/role')">🔐 角色管理</div>
          <div @click="go('/function')">⚙️ 功能管理</div>
          <div @click="go('/permission')">🛡️ 权限配置</div>
        </div>
      </div>
    </nav>

    <!-- 提示卡片 -->
    <div class="notification-card" v-if="cosignCount > 0" @click="go('/CoSignContractList')">
      🛎️ 当前有 {{ cosignCount }} 份合同待会签，点击跳转 →
    </div>
    <div class="notification-card" v-if="approveCount > 0" @click="go('/ApproveList')">
      🛎️ 当前有 {{ approveCount }} 份合同待审批，点击跳转 →
    </div>

    <!-- 系统介绍卡片 -->
    <section class="intro-card">
      <h2>欢迎使用合同管理系统</h2>
      <p>
        本系统为企业提供高效的合同起草、会签、审批与归档流程，结合权限控制与流程管理，提升工作效率与规范性。
      </p>
    </section>
  </div>
  <footer>@Copyright</footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const role = ref(localStorage.getItem('role') || 'operator')

const roleName = computed(() => {
  if (role.value === 'admin') return '合同管理员'
  if (role.value === 'operator') return '合同操作员'
  return '游客'
})

let activeMenu = ref('')
let hideTimer = null
function showDropdown(menu) {
  clearTimeout(hideTimer)
  activeMenu.value = menu
}
function hideDropdown() {
  hideTimer = setTimeout(()=>{
    activeMenu.value = ''
  },500)
}

function go(path) {
  router.push(path)
}

function logout() {
  localStorage.removeItem('role')
  router.push('/login')
}

function login() {
  router.push('/login')
}

let cosignCount = ref(0);
let approveCount = ref(0);

onMounted(async () => {
  try {
    let approveInfo = await axios.get("/approve/length");
    let cosignInfo = await axios.get("/cosign/length");

    approveCount.value = approveInfo.data.length || 0;
    cosignCount.value = cosignInfo.data.length || 0;
    
  } catch (err) {
    console.error("获取待审批合同数失败：", err)
  }
})
</script>

<style scoped>
.home-page {
  font-family: Arial, sans-serif;
  background-color: #f4f6f8;
  min-height: 100vh;
  padding: 20px 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #1f2937;
  padding-bottom: 10px;
}

.logo {
  font-size: 1.8em;
  color: #1f2937;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome {
  font-weight: 500;
  color: #374151;
}

.btn {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #111827;
}

.nav-bar {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 10px;
}

.dropdown {
  position: relative;
}

.drop-trigger {
  font-weight: bold;
  color: #1e293b;
  cursor: pointer;
}

.drop-menu {
  position: absolute;
  top: 28px;
  left: 0;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.drop-menu div {
  padding: 10px 15px;
  cursor: pointer;
  white-space: nowrap;
}

.drop-menu div:hover {
  background-color: #f3f4f6;
}

.notification-card {
  background-color: #fef9c3;
  border: 1px solid #facc15;
  padding: 12px 16px;
  border-radius: 10px;
  margin: 20px 0;
  cursor: pointer;
  font-weight: 500;
  color: #92400e;
}

.notification-card:hover {
  background-color: #fef08a;
}

.intro-card {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.intro-card h2 {
  color: #1f2937;
  margin-bottom: 10px;
}

.intro-card p {
  color: #374151;
  line-height: 1.6;
}
</style>