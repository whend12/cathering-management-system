import api from './api'

export const reportService = {
  async getDailyReport(params = {}) {
    const response = await api.get('/reports/daily', { params })
    return response.data
  },

  async getMonthlyReport(params = {}) {
    const response = await api.get('/reports/monthly', { params })
    return response.data
  },

  async getYearlyReport(params = {}) {
    const response = await api.get('/reports/yearly', { params })
    return response.data
  },

  async getDepartmentReport(params = {}) {
    const response = await api.get('/reports/department', { params })
    return response.data
  },

  async exportReport(type, params = {}) {
    const response = await api.get(`/reports/${type}`, {
      params: { ...params, export: 'excel' },
      responseType: 'blob',
    })
    return response
  },
}
