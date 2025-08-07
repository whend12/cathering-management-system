import api from './api'

export const departmentService = {
  async getAllDepartments() {
    const response = await api.get('/departments')
    return response.data
  },

  async verifyPin(pin) {
    const response = await api.post('/departments/verify-pin', { pin })
    return response.data
  },

  async createDepartment(departmentData) {
    const response = await api.post('/departments', departmentData)
    return response.data
  },

  async updateDepartment(id, departmentData) {
    const response = await api.put(`/departments/${id}`, departmentData)
    return response.data
  },

  async deleteDepartment(id) {
    const response = await api.delete(`/departments/${id}`)
    return response.data
  },
}
