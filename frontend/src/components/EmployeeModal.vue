<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ employee ? 'Edit Karyawan' : 'Tambah Karyawan' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">ID Karyawan</label>
            <input
              v-model="form.employeeId"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan ID karyawan"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nomor Telepon</label>
            <input
              v-model="form.phone"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Departemen</label>
            <select
              v-model="form.departmentId"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih Departemen</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Posisi</label>
            <input
              v-model="form.position"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan posisi"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
            <input
              v-model="form.joinDate"
              type="date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">Aktif</label>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Buttons -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  employee: {
    type: Object,
    default: null,
  },
  departments: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  departmentId: '',
  position: '',
  joinDate: '',
  isActive: true,
})

// Watch for employee prop changes to populate form
watch(
  () => props.employee,
  (newEmployee) => {
    if (newEmployee) {
      form.employeeId = newEmployee.employeeId || ''
      form.name = newEmployee.name || ''
      form.email = newEmployee.email || ''
      form.phone = newEmployee.phone || ''
      form.departmentId = newEmployee.departmentId || ''
      form.position = newEmployee.position || ''
      form.joinDate = newEmployee.joinDate ? newEmployee.joinDate.split('T')[0] : ''
      form.isActive = newEmployee.isActive !== false
    } else {
      // Reset form for new employee
      form.employeeId = ''
      form.name = ''
      form.email = ''
      form.phone = ''
      form.departmentId = ''
      form.position = ''
      form.joinDate = ''
      form.isActive = true
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const employeeData = { ...form }
    if (employeeData.joinDate) {
      employeeData.joinDate = new Date(employeeData.joinDate).toISOString()
    }

    emit('save', employeeData)
  } catch (error) {
    errorMessage.value = error.message || 'Terjadi kesalahan saat menyimpan data'
  } finally {
    loading.value = false
  }
}
</script>
