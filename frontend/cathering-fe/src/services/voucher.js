import api from './api'

export const voucherService = {
  async getAllVouchers(params = {}) {
    const response = await api.get('/vouchers', { params })
    return response.data
  },

  async getVoucherById(id) {
    const response = await api.get(`/vouchers/${id}`)
    return response.data
  },

  async getVoucherByCode(code) {
    const response = await api.get(`/vouchers/code/${code}`)
    return response.data
  },

  async useVoucher(code) {
    const response = await api.post(`/vouchers/use/${code}`)
    return response.data
  },

  async generateVouchersForWeek(weekData) {
    const response = await api.post('/vouchers/generate', weekData)
    return response.data
  },

  async updateVoucherStatus(id, status) {
    const response = await api.put(`/vouchers/${id}/status`, { status })
    return response.data
  },

  async getDepartmentVouchers(departmentId) {
    const response = await api.get(`/vouchers/department/${departmentId}`)
    return response.data
  },

  async expireOldVouchers() {
    const response = await api.post('/vouchers/expire-old')
    return response.data
  },
}
