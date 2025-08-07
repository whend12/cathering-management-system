<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ schedule ? 'Edit Jadwal Mingguan' : 'Buat Jadwal Mingguan' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Week and Department Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Minggu</label>
              <input
                v-model="form.weekStartDate"
                type="week"
                required
                :disabled="!!schedule"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Departemen</label>
              <select
                v-model="form.departmentId"
                required
                :disabled="!!schedule"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Pilih Departemen</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Weekly Menu -->
          <div class="space-y-4">
            <h4 class="text-md font-medium text-gray-900">Menu Mingguan</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Monday -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Senin</label>
                <select
                  v-model="form.mondayMenu"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Menu</option>
                  <option v-for="food in availableFoods" :key="food.id" :value="food.name">
                    {{ food.name }}
                  </option>
                </select>
              </div>

              <!-- Tuesday -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Selasa</label>
                <select
                  v-model="form.tuesdayMenu"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Menu</option>
                  <option v-for="food in availableFoods" :key="food.id" :value="food.name">
                    {{ food.name }}
                  </option>
                </select>
              </div>

              <!-- Wednesday -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Rabu</label>
                <select
                  v-model="form.wednesdayMenu"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Menu</option>
                  <option v-for="food in availableFoods" :key="food.id" :value="food.name">
                    {{ food.name }}
                  </option>
                </select>
              </div>

              <!-- Thursday -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Kamis</label>
                <select
                  v-model="form.thursdayMenu"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Menu</option>
                  <option v-for="food in availableFoods" :key="food.id" :value="food.name">
                    {{ food.name }}
                  </option>
                </select>
              </div>

              <!-- Friday -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Jumat</label>
                <select
                  v-model="form.fridayMenu"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Menu</option>
                  <option v-for="food in availableFoods" :key="food.id" :value="food.name">
                    {{ food.name }}
                  </option>
                </select>
              </div>
            </div>
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
import { ref, reactive, computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  schedule: {
    type: Object,
    default: null,
  },
  departments: {
    type: Array,
    default: () => [],
  },
  foods: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  weekStartDate: '',
  departmentId: '',
  mondayMenu: '',
  tuesdayMenu: '',
  wednesdayMenu: '',
  thursdayMenu: '',
  fridayMenu: '',
})

const availableFoods = computed(() => {
  return props.foods.filter((food) => food.isAvailable)
})

// Convert week format to YYYY-MM-DD format
const convertWeekToDate = (weekValue) => {
  if (!weekValue) return ''

  const [year, weekStr] = weekValue.split('-W')
  const week = parseInt(weekStr)

  const startDate = new Date(year, 0, 1 + (week - 1) * 7)
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1) // Monday

  return startDate.toISOString().split('T')[0]
}

// Convert date to week format
const convertDateToWeek = (dateStr) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  const year = date.getFullYear()
  const firstDayOfYear = new Date(year, 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)

  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// Watch for schedule prop changes to populate form
watch(
  () => props.schedule,
  (newSchedule) => {
    if (newSchedule) {
      form.weekStartDate = convertDateToWeek(newSchedule.weekStartDate)
      form.departmentId = newSchedule.departmentId || ''
      form.mondayMenu = newSchedule.mondayMenu || ''
      form.tuesdayMenu = newSchedule.tuesdayMenu || ''
      form.wednesdayMenu = newSchedule.wednesdayMenu || ''
      form.thursdayMenu = newSchedule.thursdayMenu || ''
      form.fridayMenu = newSchedule.fridayMenu || ''
    } else {
      // Reset form for new schedule
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday

      form.weekStartDate = convertDateToWeek(startOfWeek.toISOString().split('T')[0])
      form.departmentId = ''
      form.mondayMenu = ''
      form.tuesdayMenu = ''
      form.wednesdayMenu = ''
      form.thursdayMenu = ''
      form.fridayMenu = ''
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const scheduleData = {
      ...form,
      weekStartDate: convertWeekToDate(form.weekStartDate),
    }

    emit('save', scheduleData)
  } catch (error) {
    errorMessage.value = error.message || 'Terjadi kesalahan saat menyimpan jadwal'
  } finally {
    loading.value = false
  }
}
</script>
