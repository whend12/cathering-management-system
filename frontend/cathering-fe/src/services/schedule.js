import api from './api'

export const scheduleService = {
  async generateWeeklySchedule(scheduleData) {
    const response = await api.post('/schedules/generate', scheduleData)
    return response.data
  },

  async getWeeklySchedule(params = {}) {
    const response = await api.get('/schedules', { params })
    return response.data
  },

  async updateWeeklySchedule(id, scheduleData) {
    const response = await api.put(`/schedules/${id}`, scheduleData)
    return response.data
  },

  async deleteWeeklySchedule(weekStartDate) {
    const response = await api.delete(`/schedules/week/${weekStartDate}`)
    return response.data
  },

  async getDepartmentSchedule(departmentId, params = {}) {
    const response = await api.get(`/schedules/department/${departmentId}`, { params })
    return response.data
  },
}
