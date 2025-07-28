import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async loginWithPin(pin) {
    const response = await api.post('/auth/login-pin', { pin })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async logout() {
    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },
}
