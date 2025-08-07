<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Feedback</h1>
          <p class="text-gray-600">
            {{
              authStore.canManage
                ? 'Kelola feedback dari pengguna'
                : 'Berikan feedback untuk pesanan Anda'
            }}
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshFeedback"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
          <button
            v-if="!authStore.canManage"
            @click="openFeedbackModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon class="h-4 w-4 inline mr-2" />
            Beri Feedback
          </button>
        </div>
      </div>
    </div>

    <!-- Filters (for PIC) -->
    <div v-if="authStore.canManage" class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select
            v-model="filters.rating"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
          <select
            v-model="filters.departmentId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Semua Departemen</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            v-model="filters.date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview (for PIC) -->
    <div v-if="authStore.canManage && feedbackStats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <StarIcon class="h-8 w-8 text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Rating Rata-rata</p>
            <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.averageRating }}/5</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ChatBubbleLeftRightIcon class="h-8 w-8 text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Feedback</p>
            <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.totalFeedback }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <FaceSmileIcon class="h-8 w-8 text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Feedback Positif</p>
            <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.positiveFeedback }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <FaceFrownIcon class="h-8 w-8 text-red-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Feedback Negatif</p>
            <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.negativeFeedback }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat feedback...</p>
      </div>

      <div v-else-if="feedbacks.length === 0" class="text-center py-12">
        <ChatBubbleLeftRightIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada feedback ditemukan.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div v-for="feedback in feedbacks" :key="feedback.id" class="p-6 hover:bg-gray-50">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Feedback Header -->
              <div class="flex items-center space-x-4 mb-3">
                <div class="flex items-center">
                  <StarIcon
                    v-for="i in 5"
                    :key="i"
                    :class="i <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="h-5 w-5"
                  />
                </div>
                <span class="text-sm text-gray-600">
                  {{ formatDate(feedback.createdAt) }}
                </span>
              </div>

              <!-- Order Info -->
              <div class="mb-3">
                <p class="text-sm text-gray-600">
                  Pesanan #{{ feedback.order?.id }} - {{ feedback.order?.department?.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{
                    feedback.order?.items
                      ?.map((item) => `${item.food?.name} x${item.quantity}`)
                      .join(', ')
                  }}
                </p>
              </div>

              <!-- Feedback Content -->
              <div class="mb-4">
                <h4 class="font-medium text-gray-900 mb-1">{{ feedback.subject }}</h4>
                <p class="text-gray-700">{{ feedback.message }}</p>
              </div>

              <!-- Response (if exists) -->
              <div v-if="feedback.response" class="bg-blue-50 rounded-md p-3">
                <p class="text-sm font-medium text-blue-800 mb-1">Respon dari Admin:</p>
                <p class="text-sm text-blue-700">{{ feedback.response }}</p>
                <p class="text-xs text-blue-600 mt-1">
                  {{ formatDate(feedback.respondedAt) }}
                </p>
              </div>
            </div>

            <!-- Actions (for PIC) -->
            <div v-if="authStore.canManage && !feedback.response" class="ml-6">
              <button
                @click="respondToFeedback(feedback)"
                class="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Balas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Feedback Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Beri Feedback</h3>

          <form @submit.prevent="submitFeedback" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Pesanan</label>
              <select
                v-model="feedbackForm.orderId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Pilih pesanan</option>
                <option v-for="order in userOrders" :key="order.id" :value="order.id">
                  Pesanan #{{ order.id }} - {{ formatDate(order.date) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div class="flex items-center space-x-1">
                <StarIcon
                  v-for="i in 5"
                  :key="i"
                  @click="feedbackForm.rating = i"
                  :class="i <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'"
                  class="h-6 w-6 cursor-pointer hover:text-yellow-300"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
              <input
                v-model="feedbackForm.subject"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Subjek feedback"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
              <textarea
                v-model="feedbackForm.message"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tulis feedback Anda..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showAddModal = false"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Mengirim...' : 'Kirim Feedback' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div
      v-if="showResponseModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Balas Feedback</h3>

          <div class="mb-4 p-3 bg-gray-50 rounded-md">
            <div class="flex items-center mb-2">
              <StarIcon
                v-for="i in selectedFeedback?.rating"
                :key="i"
                class="h-4 w-4 text-yellow-400"
              />
            </div>
            <p class="text-sm font-medium">{{ selectedFeedback?.subject }}</p>
            <p class="text-sm text-gray-600">{{ selectedFeedback?.message }}</p>
          </div>

          <form @submit.prevent="submitResponse" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Respon</label>
              <textarea
                v-model="responseForm.response"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tulis respon untuk feedback ini..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showResponseModal = false"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Mengirim...' : 'Kirim Respon' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { feedbackService } from '@/services/feedback'
import { orderService } from '@/services/order'
import { departmentService } from '@/services/department'
import {
  ArrowPathIcon,
  PlusIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  FaceFrownIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const feedbacks = ref([])
const departments = ref([])
const userOrders = ref([])
const feedbackStats = ref(null)
const isLoading = ref(false)
const isSubmitting = ref(false)

const filters = ref({
  rating: '',
  departmentId: '',
  date: '',
})

// Modals
const showAddModal = ref(false)
const showResponseModal = ref(false)
const selectedFeedback = ref(null)

const feedbackForm = ref({
  orderId: '',
  rating: 0,
  subject: '',
  message: '',
})

const responseForm = ref({
  response: '',
})

// Methods
const fetchFeedback = async () => {
  isLoading.value = true
  try {
    const params = {}
    if (filters.value.rating) params.rating = filters.value.rating
    if (filters.value.departmentId) params.departmentId = filters.value.departmentId
    if (filters.value.date) params.date = filters.value.date

    const response = await feedbackService.getAllFeedback(params)
    if (response.success) {
      feedbacks.value = response.data
    }
  } catch (error) {
    console.error('Error fetching feedback:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchFeedbackStats = async () => {
  try {
    const response = await feedbackService.getFeedbackStats()
    if (response.success) {
      feedbackStats.value = response.data
    }
  } catch (error) {
    console.error('Error fetching feedback stats:', error)
  }
}

const fetchUserOrders = async () => {
  try {
    const response = await orderService.getUserOrders()
    if (response.success) {
      // Only show completed orders that don't have feedback yet
      userOrders.value = response.data.filter(
        (order) => order.status === 'completed' && !order.hasFeedback,
      )
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
  }
}

const fetchDepartments = async () => {
  try {
    const response = await departmentService.getAllDepartments()
    if (response.success) {
      departments.value = response.data
    }
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

const refreshFeedback = () => {
  fetchFeedback()
  if (authStore.canManage) {
    fetchFeedbackStats()
  }
}

const applyFilters = () => {
  fetchFeedback()
}

const openFeedbackModal = () => {
  feedbackForm.value = {
    orderId: '',
    rating: 0,
    subject: '',
    message: '',
  }
  showAddModal.value = true
  fetchUserOrders()
}

const submitFeedback = async () => {
  if (feedbackForm.value.rating === 0) {
    alert('Silakan pilih rating')
    return
  }

  isSubmitting.value = true
  try {
    const response = await feedbackService.createFeedback(feedbackForm.value)
    if (response.success) {
      showAddModal.value = false
      fetchFeedback()
      alert('Feedback berhasil dikirim')
    } else {
      alert(response.message || 'Gagal mengirim feedback')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat mengirim feedback')
  } finally {
    isSubmitting.value = false
  }
}

const respondToFeedback = (feedback) => {
  selectedFeedback.value = feedback
  responseForm.value.response = ''
  showResponseModal.value = true
}

const submitResponse = async () => {
  isSubmitting.value = true
  try {
    const response = await feedbackService.respondToFeedback(
      selectedFeedback.value.id,
      responseForm.value.response,
    )
    if (response.success) {
      showResponseModal.value = false
      fetchFeedback()
      alert('Respon berhasil dikirim')
    } else {
      alert(response.message || 'Gagal mengirim respon')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat mengirim respon')
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(async () => {
  await fetchFeedback()
  if (authStore.canManage) {
    await Promise.all([fetchFeedbackStats(), fetchDepartments()])
  }
})
</script>
