<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900">Manajemen Karyawan (Simple)</h1>
    <p class="text-gray-600">Kelola data karyawan perusahaan</p>

    <button
      @click="loadEmployees"
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
    >
      Load Employees
    </button>

    <div v-if="loading" class="mt-4">Loading...</div>

    <div v-if="employees.length > 0" class="mt-6">
      <h3 class="font-bold mb-4">Employees:</h3>
      <div v-for="employee in employees" :key="employee.id" class="border p-4 mb-2 rounded">
        <p>
          <strong>{{ employee.name }}</strong> ({{ employee.employeeId }})
        </p>
        <p>{{ employee.email }}</p>
        <p>Department: {{ employee.department?.name }}</p>
        <p>Position: {{ employee.position }}</p>
        <p>Status: {{ employee.isActive ? 'Active' : 'Inactive' }}</p>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-red-600">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { employeeService } from '@/services/employee'

const employees = ref([])
const loading = ref(false)
const error = ref('')

const loadEmployees = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await employeeService.getAllEmployees()
    if (response.success) {
      employees.value = response.data
    } else {
      error.value = 'Failed to load employees'
    }
  } catch (err) {
    error.value = err.message
    console.error('Error loading employees:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEmployees()
})
</script>
