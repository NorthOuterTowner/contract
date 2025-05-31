<template>
  <div class="home">
    <header class="header">
      <h1>合同管理系统</h1>
    </header>
    
    <main class="main-content">
      <div class="auth-buttons">
        <router-link to="/register">
          <button class="auth-btn">注册</button>
        </router-link>
        <router-link to="/login">
          <button class="auth-btn">登录</button>
        </router-link>
        <router-link to="/help">
          <button class="help-btn">帮助</button>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  text-align: center;
  padding: 50px 0;
  background-color: #2c3e50;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-btn, .help-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-btn {
  background-color: #3498db;
  color: white;
}

.auth-btn:hover {
  background-color: #2980b9;
}

.help-btn {
  background-color: #2980b9;
  color: white;
}

.help-btn:hover {
  background-color: #2980b9;
}
</style>