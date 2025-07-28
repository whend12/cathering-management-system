import api from './api'

export const foodService = {
  async getAllFoods() {
    const response = await api.get('/foods')
    return response.data
  },

  async getFoodById(id) {
    const response = await api.get(`/foods/${id}`)
    return response.data
  },

  async createFood(foodData) {
    const response = await api.post('/foods', foodData)
    return response.data
  },

  async updateFood(id, foodData) {
    const response = await api.put(`/foods/${id}`, foodData)
    return response.data
  },

  async deleteFood(id) {
    const response = await api.delete(`/foods/${id}`)
    return response.data
  },

  async getFoodCategories() {
    const response = await api.get('/foods/categories')
    return response.data
  },
}
