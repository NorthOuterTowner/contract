// src/common/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null
  }),

  actions: {
    // 初始化认证状态
    // async initAuth() {
    //   this.loading = true
    //   try {
    //     const res = await axios.get('/login/status')
    //     this.isLoggedIn = res.data.isLoggedIn
    //     if (this.isLoggedIn) {
    //       this.user = res.data.user
    //     }
    //   } catch (err) {
    //     this.error = err.message
    //     this.isLoggedIn = false
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // auth.js（修改后）
async initAuth() {
  this.loading = true;
  try {
    const res = await axios.get('/login/status');
    this.isLoggedIn = res.data.isLoggedIn;
    if (this.isLoggedIn) {
      this.user = res.data.user; // 确保接口返回 user 对象
    } else {
      this.resetAuth(); // 未登录时重置状态
    }
  } catch (err) {
    this.error = err.message;
    this.resetAuth(); // 错误时重置状态
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
        this.error = null // 清除错误信息
        return true;
      } catch (err) {
        this.resetAuthForLogin(); 
        this.error = err.response?.data?.message || '用户名或密码错误';
        return false;
      } finally {
        this.loading = false;
      }
    },

     resetAuthForLogin() {
      this.user = null; // 清空用户信息
      this.error = null; // 清空旧错误（在catch中会重新设置新错误）
      // 注意：isLoggedIn保持false，不重置，避免影响登录状态判断
    },

     resetAuth() {
      this.user = null;
      this.isLoggedIn = false;
      this.error = null;
    },

    // 登出方法
    // async logout() {
    //   this.loading = true
    //   try {
    //     await axios.post('/login/logout')
    //     this.resetAuth()
    //     return true
    //   } catch (err) {
    //     this.error = err.response?.data?.message || '登出失败'
    //     return false
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // auth.js
async logout() {
  this.loading = true;
  try {
    await axios.post('/login/logout'); // 调用后端登出接口
    this.resetAuth(); // 重置本地状态
    return true;
  } catch (err) {
    this.error = err.response?.data?.message || '登出失败';
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
    }
  },

  getters: {
    currentUser: (state) => state.user,
    isAuthenticated: (state) => state.isLoggedIn,
    authError: (state) => state.error
  }
})