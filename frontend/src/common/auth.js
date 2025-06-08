// src/common/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,
    isLoggedIn: false,
    loading: false,
    error: null, 
  }),

  actions: {
    // 初始化认证状态
    async initAuth() {
      this.loading = true;
      try {
        const res = await axios.get('/login/status');
        this.isLoggedIn = res.data.isLoggedIn;
        if (this.isLoggedIn) {
          this.user = res.data.user; 
          this.role = res.data.role; // 获取角色信息
        } else {
          this.resetAuth(); 
        }
        console.log('initAuth: isLoggedIn', this.isLoggedIn); // 添加日志
      } catch (err) {
        this.error = err.message;
        this.resetAuth(); 
      } finally {
        this.loading = false;
      }
    },

    // 登录方法
    async login(username, password) {
      this.loading = true
      try {
        const res = await axios.post('/login', { username, password })
        this.isLoggedIn = true
        this.user = res.data.user
        this.role = res.data.role; // 获取角色信息
        this.error = null 
        return true;
      } catch (err) {
        this.resetAuthForLogin(); 
        this.error = err.response?.data?.message || '用户名或密码错误';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 重置认证状态
    resetAuth() {
      this.user = null
      this.isLoggedIn = false
      this.error = null
      this.role = null; // 重置角色信息
    },

    // 登出方法
    async logout() {
      this.loading = true;
      try {
        await axios.post('/login/logout'); 
        this.resetAuth(); 
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || '登出失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    resetAuthForLogin() {
      this.user = null; 
      this.error = null; 
    }
  },

  getters: {
    currentUser: (state) => state.user,
    isAuthenticated: (state) => state.isLoggedIn,
    authError: (state) => state.error,
    userRole: (state) => state.role // 新增获取角色的 getter
  }
})