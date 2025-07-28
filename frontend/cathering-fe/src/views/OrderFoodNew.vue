<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Pesan Makanan</h1>
      <p class="text-gray-600">Pilih makanan untuk hari ini</p>
    </div>

    <!-- User Department Info -->
    <div v-if="authStore.user?.department" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <BuildingOfficeIcon class="h-5 w-5 text-blue-600 mr-2" />
          <span class="text-blue-800 font-medium">
            Departemen: {{ authStore.user.department.name }}
          </span>
        </div>
        <div class="text-sm text-blue-600">
          {{ authStore.user.department.canOrder ? 'Dapat memesan' : 'Tidak dapat memesan' }}
        </div>
      </div>
    </div>

    <!-- Cannot Order Alert -->
    <div v-if="!canOrder" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-600 mr-2" />
        <span class="text-red-800">
          Departemen Anda tidak memiliki izin untuk memesan makanan.
        </span>
      </div>
    </div>

    <!-- Order Form -->
    <div v-if="canOrder" class="space-y-6">
      <!-- Date Selection -->
      <div class="bg-white rounded-lg shadow p-6">
        <label for="orderDate" class="block text-sm font-medium text-gray-700 mb-2">
          Tanggal Pesanan
        </label>
        <input
          v-model="orderDate"
          type="date"
          id="orderDate"
          :min="today"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <!-- Food Selection -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Pilih Makanan</h2>

        <div v-if="foodStore.isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">Memuat makanan...</p>
        </div>

        <div v-else-if="availableFoods.length === 0" class="text-center py-8">
          <p class="text-gray-600">Tidak ada makanan yang tersedia.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(foods, category) in foodsByCategory" :key="category" class="space-y-3">
            <h3 class="font-medium text-gray-900 capitalize">{{ getCategoryName(category) }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="food in foods"
                :key="food.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ food.name }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ food.description }}</p>
                    <p class="text-lg font-semibold text-indigo-600 mt-2">
                      Rp {{ formatCurrency(food.price) }}
                    </p>
                  </div>
                  <div class="ml-4 flex items-center space-x-2">
                    <button
                      @click="decreaseQuantity(food.id)"
                      :disabled="!selectedItems[food.id] || selectedItems[food.id].quantity === 0"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MinusIcon class="h-4 w-4" />
                    </button>
                    <span class="w-8 text-center">
                      {{ selectedItems[food.id]?.quantity || 0 }}
                    </span>
                    <button
                      @click="increaseQuantity(food)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <PlusIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div v-if="orderItems.length > 0" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
        <div class="space-y-3">
          <div
            v-for="item in orderItems"
            :key="item.foodId"
            class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
          >
            <div>
              <span class="font-medium">{{ item.name }}</span>
              <span class="text-gray-600 ml-2">x {{ item.quantity }}</span>
            </div>
            <span class="font-semibold">Rp {{ formatCurrency(item.total) }}</span>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <span class="text-lg font-semibold">Total:</span>
            <span class="text-xl font-bold text-indigo-600"
              >Rp {{ formatCurrency(totalAmount) }}</span
            >
          </div>
        </div>

        <!-- Notes -->
        <div class="mt-6">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            v-model="orderNotes"
            id="notes"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Tambahkan catatan untuk pesanan..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="mt-6">
          <button
            @click="submitOrder"
            :disabled="isSubmitting"
            class="w-full px-4 py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Memproses Pesanan...' : 'Pesan Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckIcon class="h-6 w-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Pesanan Berhasil!</h3>
          <p class="text-sm text-gray-500 mt-2">
            Pesanan Anda telah berhasil dibuat dan sedang menunggu konfirmasi.
          </p>
          <div class="mt-6">
            <button
              @click="resetForm"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Buat Pesanan Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'
import { orderService } from '@/services/order'
import {
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const foodStore = useFoodStore()

// State
const orderDate = ref('')
const selectedItems = ref({})
const orderNotes = ref('')
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// Get today's date for min date
const today = new Date().toISOString().split('T')[0]

// Set default order date to tomorrow
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
orderDate.value = tomorrow.toISOString().split('T')[0]

// Computed
const canOrder = computed(() => {
  return authStore.user?.department?.canOrder === true
})

const availableFoods = computed(() => {
  return foodStore.foods.filter((food) => food.isAvailable)
})

const foodsByCategory = computed(() => {
  const grouped = {}
  availableFoods.value.forEach((food) => {
    if (!grouped[food.category]) {
      grouped[food.category] = []
    }
    grouped[food.category].push(food)
  })
  return grouped
})

const orderItems = computed(() => {
  return Object.values(selectedItems.value)
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }))
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.total, 0)
})

// Methods
const increaseQuantity = (food) => {
  if (!selectedItems.value[food.id]) {
    selectedItems.value[food.id] = {
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: 0,
    }
  }
  selectedItems.value[food.id].quantity++
}

const decreaseQuantity = (foodId) => {
  if (selectedItems.value[foodId] && selectedItems.value[foodId].quantity > 0) {
    selectedItems.value[foodId].quantity--
  }
}

const submitOrder = async () => {
  if (orderItems.value.length === 0) return

  isSubmitting.value = true

  try {
    const orderData = {
      orderDate: orderDate.value,
      items: orderItems.value.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
      })),
      notes: orderNotes.value || null,
    }

    const response = await orderService.createOrder(orderData)

    if (response.success) {
      showSuccessModal.value = true
    } else {
      alert(response.message || 'Gagal membuat pesanan')
    }
  } catch (error) {
    alert('Terjadi kesalahan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  selectedItems.value = {}
  orderNotes.value = ''
  showSuccessModal.value = false

  // Reset date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  orderDate.value = tomorrow.toISOString().split('T')[0]
}

const getCategoryName = (category) => {
  const categoryNames = {
    main_course: 'Makanan Utama',
    side_dish: 'Lauk Pauk',
    drink: 'Minuman',
    dessert: 'Penutup',
  }
  return categoryNames[category] || category
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

// Lifecycle
onMounted(async () => {
  await foodStore.fetchFoods()
})
</script>
