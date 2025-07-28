<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Kelola Departemen</h1>
          <p class="text-gray-600">Kelola departemen dan rotasi voucher</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshDepartments"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
          <button
            v-if="authStore.canManage"
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon class="h-4 w-4 inline mr-2" />
            Tambah Departemen
          </button>
        </div>
      </div>
    </div>

    <!-- Voucher Rotation Status -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-gray-900">Status Rotasi Voucher</h2>
        <button
          v-if="authStore.canManage"
          @click="rotateVouchers"
          :disabled="isRotating"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <ArrowPathIcon class="h-4 w-4 inline mr-2" />
          {{ isRotating ? 'Merotasi...' : 'Rotasi Manual' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <CheckCircleIcon class="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-green-800">Dapat Memesan</p>
              <p class="text-2xl font-bold text-green-900">{{ voucherStats.canOrder }}</p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center">
            <XCircleIcon class="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-red-800">Tidak Dapat Memesan</p>
              <p class="text-2xl font-bold text-red-900">{{ voucherStats.cannotOrder }}</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center">
            <ClockIcon class="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p class="text-sm font-medium text-blue-800">Rotasi Terakhir</p>
              <p class="text-sm font-bold text-blue-900">
                {{
                  voucherStats.lastRotation ? formatDate(voucherStats.lastRotation) : 'Belum ada'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Departments List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat departemen...</p>
      </div>

      <div v-else-if="departments.length === 0" class="text-center py-12">
        <BuildingOfficeIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada departemen ditemukan.</p>
      </div>

      <div v-else class="overflow-x-auto">
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
                PIC
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status Voucher
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Pesanan Bulan Ini
              </th>
              <th
                v-if="authStore.canManage"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="department in departments" :key="department.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <BuildingOfficeIcon class="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ department.name }}</div>
                    <div v-if="department.description" class="text-sm text-gray-500">
                      {{ department.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ department.picName || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ department.userCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    department.canOrder ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ department.canOrder ? 'Dapat Memesan' : 'Tidak Dapat Memesan' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ department.monthlyOrders || 0 }} pesanan
              </td>
              <td
                v-if="authStore.canManage"
                class="px-6 py-4 whitespace-nowrap text-sm font-medium"
              >
                <div class="flex space-x-2">
                  <button
                    @click="editDepartment(department)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="toggleVoucherStatus(department)"
                    :class="
                      department.canOrder
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    "
                  >
                    {{ department.canOrder ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                  <button
                    @click="viewDepartmentUsers(department)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    <UsersIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Department Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? 'Edit Departemen' : 'Tambah Departemen' }}
          </h3>

          <form @submit.prevent="submitDepartment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Departemen</label>
              <input
                v-model="departmentForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan nama departemen"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                v-model="departmentForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Deskripsi departemen (opsional)"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama PIC</label>
              <input
                v-model="departmentForm.picName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nama PIC departemen (opsional)"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="departmentForm.canOrder"
                type="checkbox"
                id="canOrder"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="canOrder" class="ml-2 text-sm text-gray-700">
                Dapat memesan makanan
              </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Department Users Modal -->
    <div
      v-if="showUsersModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              User Departemen: {{ selectedDepartment?.name }}
            </h3>
            <button @click="showUsersModal = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div v-if="departmentUsers.length === 0" class="text-center py-8">
            <UsersIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">Tidak ada user di departemen ini.</p>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="user in departmentUsers"
              :key="user.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">PIN: {{ user.pin }}</p>
                <span
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ user.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { departmentService } from '@/services/department'
import { voucherService } from '@/services/voucher'
import {
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const departments = ref([])
const departmentUsers = ref([])
const voucherStats = ref({
  canOrder: 0,
  cannotOrder: 0,
  lastRotation: null,
})
const isLoading = ref(false)
const isSubmitting = ref(false)
const isRotating = ref(false)

// Modal state
const showModal = ref(false)
const showUsersModal = ref(false)
const isEditing = ref(false)
const editingDepartment = ref(null)
const selectedDepartment = ref(null)

const departmentForm = ref({
  name: '',
  description: '',
  picName: '',
  canOrder: true,
})

// Methods
const fetchDepartments = async () => {
  isLoading.value = true
  try {
    const response = await departmentService.getAllDepartments()
    if (response.success) {
      departments.value = response.data
      updateVoucherStats()
    }
  } catch (error) {
    console.error('Error fetching departments:', error)
  } finally {
    isLoading.value = false
  }
}

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

const updateVoucherStats = () => {
  const canOrder = departments.value.filter((d) => d.canOrder).length
  const cannotOrder = departments.value.filter((d) => !d.canOrder).length

  voucherStats.value.canOrder = canOrder
  voucherStats.value.cannotOrder = cannotOrder
}

const refreshDepartments = () => {
  fetchDepartments()
  fetchVoucherStats()
}

const openAddModal = () => {
  isEditing.value = false
  editingDepartment.value = null
  departmentForm.value = {
    name: '',
    description: '',
    picName: '',
    canOrder: true,
  }
  showModal.value = true
}

const editDepartment = (department) => {
  isEditing.value = true
  editingDepartment.value = department
  departmentForm.value = {
    name: department.name,
    description: department.description || '',
    picName: department.picName || '',
    canOrder: department.canOrder,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingDepartment.value = null
}

const submitDepartment = async () => {
  isSubmitting.value = true
  try {
    let response
    if (isEditing.value) {
      response = await departmentService.updateDepartment(
        editingDepartment.value.id,
        departmentForm.value,
      )
    } else {
      response = await departmentService.createDepartment(departmentForm.value)
    }

    if (response.success) {
      closeModal()
      fetchDepartments()
      alert(`Departemen berhasil ${isEditing.value ? 'diupdate' : 'ditambahkan'}`)
    } else {
      alert(
        response.message || `Gagal ${isEditing.value ? 'mengupdate' : 'menambahkan'} departemen`,
      )
    }
  } catch (error) {
    console.error('Error submitting department:', error)
    alert(`Terjadi kesalahan saat ${isEditing.value ? 'mengupdate' : 'menambahkan'} departemen`)
  } finally {
    isSubmitting.value = false
  }
}

const toggleVoucherStatus = async (department) => {
  try {
    const response = await voucherService.toggleDepartmentVoucher(department.id)
    if (response.success) {
      // Update local department
      const deptIndex = departments.value.findIndex((d) => d.id === department.id)
      if (deptIndex !== -1) {
        departments.value[deptIndex].canOrder = !departments.value[deptIndex].canOrder
        updateVoucherStats()
      }
      alert(`Status voucher departemen ${department.name} berhasil diubah`)
    } else {
      alert(response.message || 'Gagal mengubah status voucher')
    }
  } catch (error) {
    console.error('Error toggling voucher status:', error)
    alert('Terjadi kesalahan saat mengubah status voucher')
  }
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
      fetchDepartments()
      fetchVoucherStats()
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

const viewDepartmentUsers = async (department) => {
  selectedDepartment.value = department
  try {
    const response = await departmentService.getDepartmentUsers(department.id)
    if (response.success) {
      departmentUsers.value = response.data
      showUsersModal.value = true
    } else {
      alert(response.message || 'Gagal mengambil data user departemen')
    }
  } catch (error) {
    console.error('Error fetching department users:', error)
    alert('Terjadi kesalahan saat mengambil data user departemen')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchDepartments(), fetchVoucherStats()])
})
</script>
