<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Kelola Pesanan</h1>
          <p class="text-gray-600">Kelola dan pantau semua pesanan makanan</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshOrders"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            v-model="filters.date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="completed">Selesai</option>
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

    <!-- Orders List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat pesanan...</p>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-12">
        <ClipboardDocumentListIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada pesanan ditemukan.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div v-for="order in orders" :key="order.id" class="p-6 hover:bg-gray-50">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Order Header -->
              <div class="flex items-center space-x-4 mb-3">
                <h3 class="text-lg font-semibold text-gray-900">Pesanan #{{ order.id }}</h3>
                <span
                  :class="getStatusClass(order.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
                <span
                  v-if="order.editRequestStatus !== 'none'"
                  :class="getEditStatusClass(order.editRequestStatus)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getEditStatusLabel(order.editRequestStatus) }}
                </span>
              </div>

              <!-- Order Info -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-600">Departemen</p>
                  <p class="font-medium">{{ order.department?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Tanggal</p>
                  <p class="font-medium">{{ formatDate(order.date) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total</p>
                  <p class="font-medium text-indigo-600">
                    Rp {{ formatCurrency(order.totalAmount) }}
                  </p>
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">Item Pesanan:</p>
                <div class="bg-gray-50 rounded-md p-3">
                  <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1">
                    <span class="text-sm">{{ item.food?.name }} x {{ item.quantity }}</span>
                    <span class="text-sm font-medium">Rp {{ formatCurrency(item.subtotal) }}</span>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="order.notes" class="mb-4">
                <p class="text-sm text-gray-600">Catatan:</p>
                <p class="text-sm bg-yellow-50 p-2 rounded">{{ order.notes }}</p>
              </div>

              <!-- Edit Request Info -->
              <div v-if="order.editRequestReason" class="mb-4 p-3 bg-orange-50 rounded-md">
                <p class="text-sm font-medium text-orange-800">Permintaan Edit:</p>
                <p class="text-sm text-orange-700">{{ order.editRequestReason }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="ml-6 flex flex-col space-y-2">
              <!-- Status Update (PIC only) -->
              <div
                v-if="
                  authStore.canManage &&
                  order.status !== 'completed' &&
                  order.status !== 'cancelled'
                "
              >
                <select
                  :value="order.status"
                  @change="updateOrderStatus(order.id, $event.target.value)"
                  class="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Menunggu</option>
                  <option value="confirmed">Konfirmasi</option>
                  <option value="cancelled">Batalkan</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>

              <!-- Edit Request Actions (PIC only) -->
              <div
                v-if="authStore.canManage && order.editRequestStatus === 'pending'"
                class="flex space-x-2"
              >
                <button
                  @click="approveEdit(order.id, true)"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Setujui
                </button>
                <button
                  @click="approveEdit(order.id, false)"
                  class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Tolak
                </button>
              </div>

              <!-- Request Edit (Department users) -->
              <button
                v-if="
                  !authStore.canManage &&
                  order.status === 'pending' &&
                  order.editRequestStatus === 'none'
                "
                @click="requestEdit(order)"
                class="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Minta Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Request Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Permintaan Edit Pesanan</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Alasan Edit: </label>
            <textarea
              v-model="editReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Jelaskan alasan permintaan edit..."
              required
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              @click="submitEditRequest"
              :disabled="!editReason.trim()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Kirim Permintaan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { orderService } from '@/services/order'
import { departmentService } from '@/services/department'
import { ArrowPathIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const orders = ref([])
const departments = ref([])
const isLoading = ref(false)
const filters = ref({
  date: '',
  status: '',
  departmentId: '',
})

// Edit modal
const showEditModal = ref(false)
const editingOrder = ref(null)
const editReason = ref('')

// Computed
const filteredOrders = computed(() => {
  return orders.value // Filtering is done on server side
})

// Methods
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const params = {}
    if (filters.value.date) params.date = filters.value.date
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.departmentId) params.departmentId = filters.value.departmentId

    const response = await orderService.getAllOrders(params)
    if (response.success) {
      orders.value = response.data
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    isLoading.value = false
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

const refreshOrders = () => {
  fetchOrders()
}

const applyFilters = () => {
  fetchOrders()
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await orderService.updateOrderStatus(orderId, newStatus)
    if (response.success) {
      // Update local order
      const orderIndex = orders.value.findIndex((o) => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = newStatus
      }
    } else {
      alert(response.message || 'Gagal mengupdate status')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat mengupdate status')
  }
}

const requestEdit = (order) => {
  editingOrder.value = order
  editReason.value = ''
  showEditModal.value = true
}

const submitEditRequest = async () => {
  if (!editReason.value.trim()) return

  try {
    const response = await orderService.requestOrderEdit(editingOrder.value.id, editReason.value)
    if (response.success) {
      // Update local order
      const orderIndex = orders.value.findIndex((o) => o.id === editingOrder.value.id)
      if (orderIndex !== -1) {
        orders.value[orderIndex].editRequestStatus = 'pending'
        orders.value[orderIndex].editRequestReason = editReason.value
      }
      showEditModal.value = false
      alert('Permintaan edit berhasil dikirim')
    } else {
      alert(response.message || 'Gagal mengirim permintaan edit')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat mengirim permintaan edit')
  }
}

const approveEdit = async (orderId, approved) => {
  try {
    const response = await orderService.approveOrderEdit(orderId, approved)
    if (response.success) {
      // Refresh orders to get updated data
      await fetchOrders()
      alert(`Permintaan edit ${approved ? 'disetujui' : 'ditolak'}`)
    } else {
      alert(response.message || 'Gagal memproses permintaan edit')
    }
  } catch (error) {
    alert('Terjadi kesalahan saat memproses permintaan edit')
  }
}

// Utility functions
const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
  }
  return labels[status] || status
}

const getEditStatusClass = (status) => {
  const classes = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getEditStatusLabel = (status) => {
  const labels = {
    pending: 'Edit Pending',
    approved: 'Edit Disetujui',
    rejected: 'Edit Ditolak',
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchOrders(), fetchDepartments()])
})
</script>
