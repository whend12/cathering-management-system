<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Laporan</h1>
          <p class="text-gray-600">Lihat statistik dan laporan sistem catering</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshReports"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
          <button
            @click="exportReport"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <DocumentArrowDownIcon class="h-4 w-4 inline mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
          <input
            v-model="dateRange.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
          <input
            v-model="dateRange.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="generateReport"
            class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="text-gray-600 mt-2">Generating report...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ShoppingBagIcon class="h-8 w-8 text-blue-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Pesanan</p>
              <p class="text-2xl font-bold text-gray-900">{{ reportData.summary.totalOrders }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-8 w-8 text-green-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p class="text-2xl font-bold text-gray-900">
                Rp {{ formatCurrency(reportData.summary.totalRevenue) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-purple-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Departemen Aktif</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ reportData.summary.activeDepartments }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <StarIcon class="h-8 w-8 text-yellow-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rating Rata-rata</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ reportData.summary.averageRating }}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Orders by Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Pesanan berdasarkan Status</h3>
          <div class="space-y-3">
            <div
              v-for="status in reportData.ordersByStatus"
              :key="status.status"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <div :class="getStatusColor(status.status)" class="w-3 h-3 rounded-full mr-3"></div>
                <span class="text-sm font-medium">{{ getStatusLabel(status.status) }}</span>
              </div>
              <span class="text-sm text-gray-600">{{ status.count }} pesanan</span>
            </div>
          </div>
        </div>

        <!-- Top Foods -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Makanan Terpopuler</h3>
          <div class="space-y-3">
            <div
              v-for="food in reportData.topFoods"
              :key="food.id"
              class="flex items-center justify-between"
            >
              <div>
                <p class="text-sm font-medium">{{ food.name }}</p>
                <p class="text-xs text-gray-500">{{ food.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ food.totalOrdered }} pesanan</p>
                <p class="text-xs text-gray-500">Rp {{ formatCurrency(food.totalRevenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Performance -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Performa Departemen</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Departemen
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Pesanan
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Pengeluaran
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rata-rata per Pesanan
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status Voucher
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="dept in reportData.departmentPerformance" :key="dept.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ dept.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ dept.totalOrders }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rp {{ formatCurrency(dept.totalSpent) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rp {{ formatCurrency(dept.averagePerOrder) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="
                      dept.canOrder ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    "
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ dept.canOrder ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Feedback -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Feedback Terbaru</h3>
        <div class="space-y-4">
          <div
            v-for="feedback in reportData.recentFeedback"
            :key="feedback.id"
            class="border-l-4 border-indigo-400 pl-4"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center">
                <div class="flex items-center mr-3">
                  <StarIcon v-for="i in feedback.rating" :key="i" class="h-4 w-4 text-yellow-400" />
                </div>
                <span class="text-sm font-medium">{{ feedback.subject }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDate(feedback.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ feedback.message }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ feedback.order?.department?.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-12">
      <ChartBarIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">Pilih rentang tanggal untuk generate laporan.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportService } from '@/services/report'
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const reportData = ref(null)
const isLoading = ref(false)

const dateRange = ref({
  startDate: '',
  endDate: '',
})

// Methods
const generateReport = async () => {
  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    alert('Silakan pilih rentang tanggal')
    return
  }

  if (new Date(dateRange.value.startDate) > new Date(dateRange.value.endDate)) {
    alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir')
    return
  }

  isLoading.value = true
  try {
    const response = await reportService.generateReport({
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate,
    })

    if (response.success) {
      reportData.value = response.data
    } else {
      alert(response.message || 'Gagal generate laporan')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Terjadi kesalahan saat generate laporan')
  } finally {
    isLoading.value = false
  }
}

const refreshReports = () => {
  if (reportData.value) {
    generateReport()
  }
}

const exportReport = async () => {
  if (!reportData.value) {
    alert('Tidak ada data laporan untuk diekspor')
    return
  }

  try {
    const response = await reportService.exportReport({
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate,
    })

    if (response.success) {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `laporan-catering-${dateRange.value.startDate}-${dateRange.value.endDate}.xlsx`,
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } else {
      alert(response.message || 'Gagal export laporan')
    }
  } catch (error) {
    console.error('Error exporting report:', error)
    alert('Terjadi kesalahan saat export laporan')
  }
}

// Utility functions
const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-blue-400',
    cancelled: 'bg-red-400',
    completed: 'bg-green-400',
  }
  return colors[status] || 'bg-gray-400'
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Set default date range (last 30 days)
const setDefaultDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  dateRange.value.endDate = endDate.toISOString().split('T')[0]
  dateRange.value.startDate = startDate.toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
  // Check if user can access reports
  if (!authStore.canManage) {
    alert('Anda tidak memiliki akses ke halaman ini')
    return
  }

  setDefaultDateRange()
})
</script>
