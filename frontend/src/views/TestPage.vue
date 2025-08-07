<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Test Page</h1>
    <p>This is a test page to check if routing works</p>
    <button @click="testAPI" class="bg-blue-500 text-white px-4 py-2 rounded">Test API</button>
    <div v-if="result" class="mt-4">
      <h3 class="font-bold">API Result:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { employeeService } from '@/services/employee'

const result = ref(null)

const testAPI = async () => {
  try {
    const response = await employeeService.getAllEmployees()
    result.value = response
  } catch (error) {
    result.value = { error: error.message }
  }
}
</script>
