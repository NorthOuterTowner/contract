<template>
  <div class="login-container">
    <div class="login-card">
      <h3>用户登录</h3>
      
      <div class="form-group">
        <label for="username">用户名</label>
        <div class="input-wrapper">
          <i class="fa fa-user"></i>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入用户名"
          >
        </div>
        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <div class="input-wrapper">
          <i class="fa fa-lock"></i>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            placeholder="请输入密码"
          >
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
      </div>
      
      <button class="login-button" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      
      <div class="auth-links">
        <router-link to="/register">注册账号</router-link>
        <span>|</span>
        <a href="#">忘记密码?</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      errors: {
        username: '',
        password: ''
      },
      isLoading: false // 新增加载状态
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {};
      
      if (!this.form.username.trim()) {
        this.errors.username = '用户名不能为空';
        isValid = false;
      }
      
      if (!this.form.password) {
        this.errors.password = '密码不能为空';
        isValid = false;
      }
      
      return isValid;
    },
    
   async handleLogin() {
  if (this.isLoading) return; // 防止重复提交
  if (!this.validateForm()) return;
  
  this.isLoading = true; // 开始加载
  console.log('尝试登录:', this.form.username);
  
  try {
    const response = await this.$axios.post('/login', {
      username: this.form.username,
      password: this.form.password
    });
    
    console.log('登录响应:', response.data);
    
    // ✅ 根据后端返回的数据结构判断登录成功
    if (response && response.data && response.data.user) {
      // 保存用户信息到本地存储
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 显示成功消息
      //this.$message.success(response.data.message || '登录成功');
      
      // 跳转到首页
      this.$router.push('/HomePage');
    } else {
      // 登录失败，显示服务器返回的消息
      this.$message.error(response.data.message || '登录失败：服务器未返回用户信息');
    }
  } catch (error) {
    console.error('登录失败:', error);
    
    // ✅ 更详细的错误处理，避免访问未定义属性
    if (error.response && error.response.data) {
      // 服务器返回了错误响应
      this.$message.error(error.response.data.message || '登录失败，请检查用户名和密码');
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      this.$message.error('服务器无响应，请稍后重试');
    } else {
      // 请求设置时出错
      this.$message.error('请求配置错误: ' + error.message);
    }
  } finally {
    this.isLoading = false; // 无论成功失败都结束加载状态
  }
}
  }
}
</script>

<style scoped>
/* 样式部分保持不变 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(64, 158, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(64, 158, 255, 0.05) 0%, transparent 50%);
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 40px 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #64b5f6);
}

h3 {
  margin-top: 0;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
  font-weight: 500;
  font-size: 22px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.login-button:hover {
  background-color: #2c3e50;
}

.login-button:active {
  transform: translateY(1px);
}

.auth-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  font-size: 14px;
}

.auth-links a,
.auth-links router-link {
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

.auth-links a:hover,
.auth-links router-link:hover {
  text-decoration: underline;
}

.auth-links span {
  color: #ccc;
}
</style>