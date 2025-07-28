import api from './api'

export const orderService = {
  async getAllOrders(params = {}) {
    const response = await api.get('/orders', { params })
    return response.data
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  async updateOrderStatus(id, status) {
    const response = await api.put(`/orders/${id}/status`, { status })
    return response.data
  },

  async requestOrderEdit(id, editReason) {
    const response = await api.post(`/orders/${id}/edit-request`, { editReason })
    return response.data
  },

  async approveOrderEdit(id, approved, approvalNotes = '') {
    const response = await api.put(`/orders/${id}/approve-edit`, { approved, approvalNotes })
    return response.data
  },
}
