import api from './api'

export const employeeService = {
  async getAllEmployees(params = {}) {
    const response = await api.get('/employees', { params })
    return response.data
  },

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData)
    return response.data
  },

  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData)
    return response.data
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`)
    return response.data
  },

  async getEmployeesByDepartment(departmentId) {
    const response = await api.get(`/employees/department/${departmentId}`)
    return response.data
  },
}
