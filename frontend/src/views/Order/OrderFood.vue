<template>
  <div class="space-y-6">
    <!-- Header with Food Stock -->
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Pesan Makanan Hari Ini</h1>

      <!-- Food Stock Display -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div
          v-for="food in availableFoods"
          :key="food.id"
          class="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <h3 class="font-semibold text-gray-900 text-sm">{{ food.name }}</h3>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-xs text-gray-600">Stok Tersisa:</span>
            <span
              :class="[
                'px-2 py-1 rounded-full text-xs font-semibold',
                food.stock > 10
                  ? 'bg-green-100 text-green-800'
                  : food.stock > 5
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800',
              ]"
            >
              {{ food.stock || 'Unlimited' }} porsi
            </span>
          </div>
          <div class="text-xs text-indigo-600 font-medium mt-1">
            Rp {{ formatCurrency(food.price) }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="foodStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat data makanan...</p>
      </div>
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

    <!-- Simple Order Form -->
    <div v-if="canOrder" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Form Pemesanan</h2>

      <!-- Date Selection -->
      <div class="mb-6">
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

      <!-- Employee Orders List -->
      <div class="space-y-4">
        <div
          v-for="(order, index) in employeeOrders"
          :key="index"
          class="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg"
        >
          <!-- Employee Name Input -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1"> Nama Karyawan </label>
            <input
              v-model="order.employeeName"
              type="text"
              placeholder="Masukkan nama karyawan"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Food Selection Dropdown -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1"> Menu Makanan </label>
            <select
              v-model="order.foodId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Pilih menu makanan</option>
              <optgroup
                v-for="(foods, category) in foodsByCategory"
                :key="category"
                :label="getCategoryName(category)"
              >
                <option v-for="food in foods" :key="food.id" :value="food.id">
                  {{ food.name }} - Rp {{ formatCurrency(food.price) }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Quantity -->
          <div class="w-24">
            <label class="block text-sm font-medium text-gray-700 mb-1"> Jumlah </label>
            <input
              v-model.number="order.quantity"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Remove Button -->
          <div class="flex items-end">
            <button
              v-if="employeeOrders.length > 1"
              @click="removeEmployeeOrder(index)"
              class="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              title="Hapus pesanan ini"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add Employee Button -->
      <div class="mt-4">
        <button
          @click="addEmployeeOrder"
          class="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Karyawan
        </button>
      </div>

      <!-- Order Summary -->
      <div v-if="validOrders.length > 0" class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
        <div class="space-y-2">
          <div
            v-for="order in validOrders"
            :key="order.index"
            class="flex justify-between items-center text-sm"
          >
            <span
              >{{ order.employeeName }} - {{ getFoodName(order.foodId) }} ({{
                order.quantity
              }}x)</span
            >
            <span class="font-medium"
              >Rp {{ formatCurrency(getFoodPrice(order.foodId) * order.quantity) }}</span
            >
          </div>
          <div class="border-t border-gray-300 pt-2 mt-4">
            <div class="flex justify-between items-center font-semibold">
              <span>Total Pesanan:</span>
              <span class="text-lg text-indigo-600">Rp {{ formatCurrency(totalAmount) }}</span>
            </div>
            <div class="text-sm text-gray-600 mt-1">
              Total {{ validOrders.length }} karyawan, {{ totalQuantity }} porsi
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="mt-6">
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
          Catatan Pesanan (Opsional)
        </label>
        <textarea
          v-model="orderNotes"
          id="notes"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Tambahkan catatan untuk pesanan (contoh: alergi, preferensi, dll.)"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <div class="mt-6">
        <button
          @click="submitOrder"
          :disabled="isSubmitting || validOrders.length === 0"
          class="w-full px-4 py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{
            isSubmitting
              ? 'Memproses Pesanan...'
              : `Pesan Sekarang (${validOrders.length} karyawan)`
          }}
        </button>
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
            Pesanan untuk {{ validOrders.length }} karyawan telah berhasil dibuat dan sedang
            menunggu konfirmasi.
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
import { employeeService } from '@/services/employee'
import {
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const foodStore = useFoodStore()

// State
const orderDate = ref(new Date().toISOString().split('T')[0])
const employees = ref([])
const isLoadingEmployees = ref(false)
const employeeOrders = ref([
  {
    employeeId: '',
    foodId: '',
    quantity: 1,
  },
])
const orderNotes = ref('')
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// Computed
const today = new Date().toISOString().split('T')[0]

const canOrder = computed(() => {
  return authStore.user?.department?.canOrder || false
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

const validOrders = computed(() => {
  return employeeOrders.value
    .map((order, index) => ({ ...order, index }))
    .filter((order) => order.employeeName.trim() && order.foodId && order.quantity > 0)
})

const totalAmount = computed(() => {
  return validOrders.value.reduce((total, order) => {
    const food = availableFoods.value.find((f) => f.id === parseInt(order.foodId))
    return total + (food ? food.price * order.quantity : 0)
  }, 0)
})

const totalQuantity = computed(() => {
  return validOrders.value.reduce((total, order) => total + order.quantity, 0)
})

// Methods
const getCategoryName = (category) => {
  const categoryNames = {
    main: 'Makanan Utama',
    side: 'Makanan Pendamping',
    drink: 'Minuman',
    dessert: 'Pencuci Mulut',
  }
  return categoryNames[category] || category
}

const getFoodName = (foodId) => {
  const food = availableFoods.value.find((f) => f.id === parseInt(foodId))
  return food ? food.name : ''
}

const getFoodPrice = (foodId) => {
  const food = availableFoods.value.find((f) => f.id === parseInt(foodId))
  return food ? food.price : 0
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const addEmployeeOrder = () => {
  employeeOrders.value.push({
    employeeName: '',
    foodId: '',
    quantity: 1,
  })
}

const removeEmployeeOrder = (index) => {
  if (employeeOrders.value.length > 1) {
    employeeOrders.value.splice(index, 1)
  }
}

const submitOrder = async () => {
  if (validOrders.value.length === 0) {
    alert('Harap isi minimal satu pesanan karyawan')
    return
  }

  isSubmitting.value = true

  try {
    // Create order items for API
    const orderItems = validOrders.value.map((order) => ({
      foodId: parseInt(order.foodId),
      quantity: order.quantity,
      employeeName: order.employeeName.trim(),
    }))

    const orderData = {
      orderDate: orderDate.value,
      items: orderItems,
      notes: orderNotes.value.trim(),
      departmentId: authStore.user.departmentId,
      totalAmount: totalAmount.value,
    }

    const response = await orderService.createOrder(orderData)

    if (response.success) {
      showSuccessModal.value = true
    } else {
      alert('Error: ' + (response.message || 'Gagal membuat pesanan'))
    }
  } catch (error) {
    console.error('Submit order error:', error)
    alert(
      'Terjadi kesalahan saat membuat pesanan: ' + (error.response?.data?.message || error.message),
    )
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  showSuccessModal.value = false
  employeeOrders.value = [
    {
      employeeName: '',
      foodId: '',
      quantity: 1,
    },
  ]
  orderNotes.value = ''
  orderDate.value = new Date().toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
  foodStore.loadFoods()
})
</script>
