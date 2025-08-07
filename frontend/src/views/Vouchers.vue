<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Kelola Voucher</h1>
          <p class="text-gray-600">Kelola sistem voucher dan rotasi departemen</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshVouchers"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
          <button
            v-if="authStore.canManage"
            @click="rotateVouchers"
            :disabled="isRotating"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            {{ isRotating ? 'Merotasi...' : 'Rotasi Voucher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Voucher Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TicketIcon class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Departemen</p>
            <p class="text-2xl font-bold text-gray-900">{{ voucherStats.totalDepartments }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Dapat Memesan</p>
            <p class="text-2xl font-bold text-gray-900">{{ voucherStats.activeVouchers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-8 w-8 text-red-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Tidak Dapat Memesan</p>
            <p class="text-2xl font-bold text-gray-900">{{ voucherStats.inactiveVouchers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClockIcon class="h-8 w-8 text-purple-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Rotasi Terakhir</p>
            <p class="text-sm font-bold text-gray-900">
              {{ voucherStats.lastRotation ? formatDate(voucherStats.lastRotation) : 'Belum ada' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rotation Settings (PIC only) -->
    <div v-if="authStore.canManage" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Pengaturan Rotasi</h2>

      <form @submit.prevent="updateRotationSettings" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Rotasi</label>
            <select
              v-model="rotationSettings.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="manual">Manual</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>

          <div v-if="rotationSettings.type === 'weekly'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Hari Rotasi</label>
            <select
              v-model="rotationSettings.dayOfWeek"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1">Senin</option>
              <option value="2">Selasa</option>
              <option value="3">Rabu</option>
              <option value="4">Kamis</option>
              <option value="5">Jumat</option>
              <option value="6">Sabtu</option>
              <option value="0">Minggu</option>
            </select>
          </div>

          <div v-if="rotationSettings.type === 'monthly'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Rotasi</label>
            <input
              v-model.number="rotationSettings.dayOfMonth"
              type="number"
              min="1"
              max="31"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Waktu Rotasi</label>
            <input
              v-model="rotationSettings.time"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="flex items-center">
          <input
            v-model="rotationSettings.enabled"
            type="checkbox"
            id="rotationEnabled"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="rotationEnabled" class="ml-2 text-sm text-gray-700">
            Aktifkan rotasi otomatis
          </label>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isUpdatingSettings"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isUpdatingSettings ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Voucher History -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-gray-900">Riwayat Rotasi</h2>
        <div class="flex space-x-2">
          <select
            v-model="historyFilter"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Semua</option>
            <option value="manual">Manual</option>
            <option value="automatic">Otomatis</option>
          </select>
        </div>
      </div>

      <div v-if="isLoadingHistory" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat riwayat...</p>
      </div>

      <div v-else-if="filteredHistory.length === 0" class="text-center py-12">
        <ClockIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada riwayat rotasi.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="history in filteredHistory"
          :key="history.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <ClockIcon class="h-5 w-5 text-gray-400" />
              <span class="text-sm font-medium text-gray-900">
                {{ formatDate(history.rotatedAt) }}
              </span>
              <span
                :class="
                  history.type === 'manual'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                "
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ history.type === 'manual' ? 'Manual' : 'Otomatis' }}
              </span>
            </div>
            <span class="text-sm text-gray-500">
              {{ history.affectedDepartments }} departemen terpengaruh
            </span>
          </div>

          <div v-if="history.changes && history.changes.length > 0" class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Perubahan:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="change in history.changes"
                :key="change.departmentId"
                class="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2"
              >
                <span>{{ change.departmentName }}</span>
                <div class="flex items-center space-x-2">
                  <span
                    :class="
                      change.previousStatus
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                    class="px-2 py-1 text-xs rounded"
                  >
                    {{ change.previousStatus ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                  <ArrowRightIcon class="h-3 w-3 text-gray-400" />
                  <span
                    :class="
                      change.newStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    "
                    class="px-2 py-1 text-xs rounded"
                  >
                    {{ change.newStatus ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="history.notes" class="mt-3 p-2 bg-yellow-50 rounded text-sm">
            <p class="text-yellow-800">{{ history.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Voucher Status -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Status Voucher Saat Ini</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="department in departments"
          :key="department.id"
          :class="department.canOrder ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'"
          class="border rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">{{ department.name }}</h3>
              <p class="text-sm text-gray-600">{{ department.userCount || 0 }} user</p>
            </div>
            <div class="text-right">
              <span
                :class="
                  department.canOrder ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                "
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ department.canOrder ? 'Aktif' : 'Tidak Aktif' }}
              </span>
              <p class="text-xs text-gray-500 mt-1">
                {{ department.monthlyOrders || 0 }} pesanan bulan ini
              </p>
            </div>
          </div>

          <div v-if="authStore.canManage" class="mt-3 flex justify-end">
            <button
              @click="toggleSingleVoucher(department)"
              :class="
                department.canOrder
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              "
              class="px-3 py-1 text-white text-xs rounded"
            >
              {{ department.canOrder ? 'Nonaktifkan' : 'Aktifkan' }}
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
import { voucherService } from '@/services/voucher'
import { departmentService } from '@/services/department'
import {
  ArrowPathIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const departments = ref([])
const voucherHistory = ref([])
const voucherStats = ref({
  totalDepartments: 0,
  activeVouchers: 0,
  inactiveVouchers: 0,
  lastRotation: null,
})

const rotationSettings = ref({
  type: 'manual',
  enabled: false,
  dayOfWeek: 1,
  dayOfMonth: 1,
  time: '00:00',
})

const historyFilter = ref('all')
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const isRotating = ref(false)
const isUpdatingSettings = ref(false)

// Computed
const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') {
    return voucherHistory.value
  }
  return voucherHistory.value.filter((h) => h.type === historyFilter.value)
})

// Methods
const fetchVoucherStats = async () => {
  try {
    const response = await voucherService.getVoucherStats()
    if (response.success) {
      voucherStats.value = response.data
    }
  } catch (error) {
    console.error('Error fetching voucher stats:', error)
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

const fetchVoucherHistory = async () => {
  isLoadingHistory.value = true
  try {
    const response = await voucherService.getVoucherHistory()
    if (response.success) {
      voucherHistory.value = response.data
    }
  } catch (error) {
    console.error('Error fetching voucher history:', error)
  } finally {
    isLoadingHistory.value = false
  }
}

const fetchRotationSettings = async () => {
  try {
    const response = await voucherService.getRotationSettings()
    if (response.success) {
      rotationSettings.value = { ...rotationSettings.value, ...response.data }
    }
  } catch (error) {
    console.error('Error fetching rotation settings:', error)
  }
}

const refreshVouchers = async () => {
  await Promise.all([fetchVoucherStats(), fetchDepartments(), fetchVoucherHistory()])
}

const rotateVouchers = async () => {
  if (
    !confirm('Yakin ingin merotasi voucher? Ini akan mengubah status voucher semua departemen.')
  ) {
    return
  }

  isRotating.value = true
  try {
    const response = await voucherService.rotateVouchers()
    if (response.success) {
      await refreshVouchers()
      alert('Rotasi voucher berhasil dilakukan')
    } else {
      alert(response.message || 'Gagal melakukan rotasi voucher')
    }
  } catch (error) {
    console.error('Error rotating vouchers:', error)
    alert('Terjadi kesalahan saat melakukan rotasi voucher')
  } finally {
    isRotating.value = false
  }
}

const updateRotationSettings = async () => {
  isUpdatingSettings.value = true
  try {
    const response = await voucherService.updateRotationSettings(rotationSettings.value)
    if (response.success) {
      alert('Pengaturan rotasi berhasil disimpan')
    } else {
      alert(response.message || 'Gagal menyimpan pengaturan rotasi')
    }
  } catch (error) {
    console.error('Error updating rotation settings:', error)
    alert('Terjadi kesalahan saat menyimpan pengaturan rotasi')
  } finally {
    isUpdatingSettings.value = false
  }
}

const toggleSingleVoucher = async (department) => {
  try {
    const response = await voucherService.toggleDepartmentVoucher(department.id)
    if (response.success) {
      // Update local department
      const deptIndex = departments.value.findIndex((d) => d.id === department.id)
      if (deptIndex !== -1) {
        departments.value[deptIndex].canOrder = !departments.value[deptIndex].canOrder
      }

      // Update stats
      await fetchVoucherStats()
      alert(`Status voucher departemen ${department.name} berhasil diubah`)
    } else {
      alert(response.message || 'Gagal mengubah status voucher')
    }
  } catch (error) {
    console.error('Error toggling voucher:', error)
    alert('Terjadi kesalahan saat mengubah status voucher')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  if (!authStore.canManage) {
    alert('Anda tidak memiliki akses ke halaman ini')
    return
  }

  await Promise.all([
    fetchVoucherStats(),
    fetchDepartments(),
    fetchVoucherHistory(),
    fetchRotationSettings(),
  ])
})
</script>
