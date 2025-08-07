import { defineStore } from 'pinia'
import { foodService } from '@/services/food'

export const useFoodStore = defineStore('food', {
  state: () => ({
    foods: [],
    categories: [],
    currentFood: null,
    isLoading: false,
  }),

  getters: {
    availableFoods: (state) => state.foods.filter((food) => food.isAvailable),
    foodsByCategory: (state) => {
      const grouped = {}
      state.foods.forEach((food) => {
        if (!grouped[food.category]) {
          grouped[food.category] = []
        }
        grouped[food.category].push(food)
      })
      return grouped
    },
  },

  actions: {
    async fetchFoods() {
      this.isLoading = true
      try {
        const response = await foodService.getAllFoods()
        if (response.success) {
          this.foods = response.data
        }
        return response
      } catch (error) {
        console.error('Error fetching foods:', error)
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async fetchFoodById(id) {
      this.isLoading = true
      try {
        const response = await foodService.getFoodById(id)
        if (response.success) {
          this.currentFood = response.data
        }
        return response
      } catch (error) {
        console.error('Error fetching food:', error)
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async createFood(foodData) {
      this.isLoading = true
      try {
        const response = await foodService.createFood(foodData)
        if (response.success) {
          this.foods.push(response.data)
        }
        return response
      } catch (error) {
        console.error('Error creating food:', error)
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async updateFood(id, foodData) {
      this.isLoading = true
      try {
        const response = await foodService.updateFood(id, foodData)
        if (response.success) {
          const index = this.foods.findIndex((food) => food.id === id)
          if (index !== -1) {
            this.foods[index] = response.data
          }
        }
        return response
      } catch (error) {
        console.error('Error updating food:', error)
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async deleteFood(id) {
      this.isLoading = true
      try {
        const response = await foodService.deleteFood(id)
        if (response.success) {
          this.foods = this.foods.filter((food) => food.id !== id)
        }
        return response
      } catch (error) {
        console.error('Error deleting food:', error)
        return { success: false, message: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await foodService.getFoodCategories()
        if (response.success) {
          this.categories = response.data
        }
        return response
      } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false, message: error.message }
      }
    },
  },
})
