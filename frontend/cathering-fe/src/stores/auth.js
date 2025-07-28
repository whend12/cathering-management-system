import { defineStore } from 'pinia'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isPICCatering: (state) => state.user?.role === 'pic_catering',
    isAdministrator: (state) => state.user?.role === 'administrator',
    isDepartmentOrder: (state) => state.user?.role === 'department_order',
    canManage: (state) =>
      state.user?.role === 'pic_catering' || state.user?.role === 'administrator',
    canOrder: (state) =>
      state.user?.role === 'department_order' ||
      state.user?.role === 'pic_catering' ||
      state.user?.role === 'administrator',
    userDisplayName: (state) => {
      if (!state.user) return ''
      if (state.user.type === 'department_login') {
        return `${state.user.department?.name} (${state.user.name})`
      }
      return state.user.name
    },
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await authService.login(credentials)

        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user

          // Store in localStorage
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },

    async loginWithPin(pin) {
      this.isLoading = true
      try {
        const response = await authService.loginWithPin(pin)

        if (response.success) {
          this.token = response.data.token

          // Handle department-based login
          if (response.data.type === 'department_login') {
            this.user = {
              id: response.data.department.id,
              name: response.data.department.picName,
              email: null,
              role: 'department_order',
              departmentId: response.data.department.id,
              department: response.data.department,
              type: 'department_login',
            }
          } else {
            // Handle regular user login (if PIN login structure changes back)
            this.user = response.data.user
          }

          // Store in localStorage
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        const message = error.response?.data?.message || 'PIN login failed'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        await authService.logout()
      } finally {
        this.user = null
        this.token = null
        this.isLoading = false
      }
    },

    async initializeAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)

        try {
          // Verify token by fetching profile
          const response = await authService.getProfile()
          if (response.success) {
            this.user = response.data
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        } catch (error) {
          // Token is invalid, clear auth
          this.logout()
        }
      }
    },

    async register(userData) {
      this.isLoading = true
      try {
        const response = await authService.register(userData)
        return response
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },
  },
})
