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
    async initAuth() {
      this.loading = true
      try {
        const res = await axios.get('/login/status')
        this.isLoggedIn = res.data.isLoggedIn
        if (this.isLoggedIn) {
          this.user = res.data.user
        }
      } catch (err) {
        this.error = err.message
        this.isLoggedIn = false
      } finally {
        this.loading = false
      }
    },

    // 登录方法
    async login(username, password) {
      this.loading = true
      try {
        const res = await axios.post('/login', { username, password })
        this.isLoggedIn = true
        this.user = res.data.user
        return true
      } catch (err) {
        this.error = err.response?.data?.message || '登录失败'
        return false
      } finally {
        this.loading = false
      }
    },

    // 登出方法
    async logout() {
      this.loading = true
      try {
        await axios.post('/login/logout')
        this.resetAuth()
        return true
      } catch (err) {
        this.error = err.response?.data?.message || '登出失败'
        return false
      } finally {
        this.loading = false
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