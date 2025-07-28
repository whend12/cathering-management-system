import api from './api'

export const feedbackService = {
  async getAllFeedbacks(params = {}) {
    const response = await api.get('/feedbacks', { params })
    return response.data
  },

  async getFeedbackById(id) {
    const response = await api.get(`/feedbacks/${id}`)
    return response.data
  },

  async createFeedback(feedbackData) {
    const response = await api.post('/feedbacks', feedbackData)
    return response.data
  },

  async getFeedbackStats(params = {}) {
    const response = await api.get('/feedbacks/stats', { params })
    return response.data
  },

  async updateFeedback(id, feedbackData) {
    const response = await api.put(`/feedbacks/${id}`, feedbackData)
    return response.data
  },

  async deleteFeedback(id) {
    const response = await api.delete(`/feedbacks/${id}`)
    return response.data
  },
}
