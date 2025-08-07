<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Selamat datang, {{ authStore.user?.name }}!
      </h1>
      <p class="text-gray-600">
        {{ getRoleWelcomeMessage() }}
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Today's Orders -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-md">
            <ShoppingCartIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayOrders }}</p>
          </div>
        </div>
      </div>

      <!-- Total Foods -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-md">
            <CakeIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Makanan</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalFoods }}</p>
          </div>
        </div>
      </div>

      <!-- Total Departments -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-md">
            <BuildingOfficeIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Departemen</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalDepartments }}</p>
          </div>
        </div>
      </div>

      <!-- Active Vouchers -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-md">
            <TicketIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Voucher Aktif</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.activeVouchers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions for Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>
        <div class="space-y-3">
          <router-link
            to="/order-food"
            class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ShoppingCartIcon class="h-5 w-5 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Pesan Makanan</span>
          </router-link>
          <router-link
            to="/feedback"
            class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChatBubbleLeftRightIcon class="h-5 w-5 text-green-600 mr-3" />
            <span class="font-medium text-gray-900">Berikan Feedback</span>
          </router-link>
          <router-link
            to="/orders"
            class="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon class="h-5 w-5 text-blue-600 mr-3" />
            <span class="font-medium text-gray-900">Lihat Pesanan</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Pesanan Terbaru</h2>
        <div v-if="recentOrders.length > 0" class="space-y-3">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ order.department?.name }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
            </div>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">Belum ada pesanan terbaru</div>
      </div>
    </div>

    <!-- Management Actions (PIC/Admin only) -->
    <div v-if="authStore.canManage" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Panel Manajemen</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link
          to="/foods"
          class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <CakeIcon class="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Kelola Makanan</p>
            <p class="text-sm text-gray-600">Tambah & edit menu</p>
          </div>
        </router-link>
        <router-link
          to="/departments"
          class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <BuildingOfficeIcon class="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Kelola Departemen</p>
            <p class="text-sm text-gray-600">Atur departemen</p>
          </div>
        </router-link>
        <router-link
          to="/vouchers"
          class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <TicketIcon class="h-8 w-8 text-yellow-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Kelola Voucher</p>
            <p class="text-sm text-gray-600">Sistem voucher</p>
          </div>
        </router-link>
        <router-link
          to="/reports"
          class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <DocumentChartBarIcon class="h-8 w-8 text-red-600 mr-3" />
          <div>
            <p class="font-medium text-gray-900">Laporan</p>
            <p class="text-sm text-gray-600">Analisis data</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  ShoppingCartIcon,
  CakeIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const stats = ref({
  todayOrders: 0,
  totalFoods: 0,
  totalDepartments: 0,
  activeVouchers: 0,
})

const recentOrders = ref([])

const getRoleWelcomeMessage = () => {
  if (authStore.isAdministrator) {
    return 'Anda memiliki akses penuh untuk mengelola sistem catering.'
  } else if (authStore.isPICCatering) {
    return 'Kelola makanan, pesanan, dan laporan catering dengan mudah.'
  } else {
    return 'Pesan makanan dan berikan feedback untuk layanan catering.'
  }
}

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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const fetchDashboardData = async () => {
  // This would be real API calls in production
  // For now, we'll use mock data
  stats.value = {
    todayOrders: 12,
    totalFoods: 25,
    totalDepartments: 5,
    activeVouchers: 8,
  }

  recentOrders.value = [
    {
      id: 1,
      department: { name: 'IT Department' },
      date: '2025-07-25',
      status: 'pending',
    },
    {
      id: 2,
      department: { name: 'Finance Department' },
      date: '2025-07-25',
      status: 'confirmed',
    },
    {
      id: 3,
      department: { name: 'HR Department' },
      date: '2025-07-24',
      status: 'completed',
    },
  ]
}

onMounted(() => {
  fetchDashboardData()
})
</script>
