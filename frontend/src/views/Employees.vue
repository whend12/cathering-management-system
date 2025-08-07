<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>
          <p class="text-gray-600">Kelola data karyawan perusahaan</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Karyawan
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari karyawan..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="debouncedSearch"
        />
      </div>
      <select
        v-model="filterDepartment"
        @change="loadEmployees"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Departemen</option>
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
          {{ dept.name }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Employees Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Karyawan
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Departemen
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Posisi
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employees" :key="employee.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ employee.name }}</p>
                <p class="text-sm text-gray-500">{{ employee.employeeId }}</p>
                <p class="text-sm text-gray-500">{{ employee.email }}</p>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ employee.department?.name }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ employee.position || '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                ]"
              >
                {{ employee.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button @click="openEditModal(employee)" class="text-blue-600 hover:text-blue-900">
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button @click="handleDelete(employee)" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="employees.length === 0" class="text-center py-8">
        <p class="text-gray-500">Tidak ada data karyawan</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
      <nav class="flex space-x-2">
        <button
          v-for="page in paginationPages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-3 py-2 text-sm rounded-md',
            page === pagination.currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>
      </nav>
    </div>

    <!-- Employee Modal -->
    <EmployeeModal
      v-if="showModal"
      :employee="selectedEmployee"
      :departments="departments"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { employeeService } from '@/services/employee'
import { departmentService } from '@/services/department'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import EmployeeModal from '@/components/EmployeeModal.vue'

const employees = ref([])
const departments = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterDepartment = ref('')
const showModal = ref(false)
const selectedEmployee = ref(null)

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  limit: 10,
})

const paginationPages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.currentPage - 2)
  const end = Math.min(pagination.totalPages, pagination.currentPage + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.currentPage = 1
    loadEmployees()
  }, 500)
}

const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await employeeService.getAllEmployees({
      page: pagination.currentPage,
      limit: pagination.limit,
      search: searchQuery.value,
      departmentId: filterDepartment.value,
    })

    if (response.success) {
      employees.value = response.data
      pagination.totalPages = response.pagination.totalPages
      pagination.totalItems = response.pagination.total
    }
  } catch (error) {
    console.error('Error loading employees:', error)
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const response = await departmentService.getAllDepartments()
    if (response.success) {
      departments.value = response.data
    }
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

const changePage = (page) => {
  pagination.currentPage = page
  loadEmployees()
}

const openCreateModal = () => {
  selectedEmployee.value = null
  showModal.value = true
}

const openEditModal = (employee) => {
  selectedEmployee.value = { ...employee }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEmployee.value = null
}

const handleSave = async (employeeData) => {
  try {
    if (selectedEmployee.value) {
      // Update
      await employeeService.updateEmployee(selectedEmployee.value.id, employeeData)
    } else {
      // Create
      await employeeService.createEmployee(employeeData)
    }

    closeModal()
    loadEmployees()
  } catch (error) {
    console.error('Error saving employee:', error)
  }
}

const handleDelete = async (employee) => {
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${employee.name}?`)) {
    try {
      await employeeService.deleteEmployee(employee.id)
      loadEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }
}

onMounted(() => {
  loadEmployees()
  loadDepartments()
})
</script>
