<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Jadwal Makanan Mingguan</h1>
          <p class="text-gray-600">Kelola jadwal makanan untuk setiap departemen</p>
        </div>
        <button
          @click="openGenerateModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon class="h-5 w-5" />
          Buat Jadwal Baru
        </button>
      </div>
    </div>

    <!-- Week Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          v-model="selectedWeek"
          type="week"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="loadSchedules"
        />
      </div>
      <select
        v-model="filterDepartment"
        @change="loadSchedules"
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

    <!-- Schedule Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="schedules.length === 0" class="text-center py-12">
        <CalendarDaysIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 text-lg">Belum ada jadwal untuk minggu ini</p>
        <p class="text-gray-400 text-sm">Klik "Buat Jadwal Baru" untuk membuat jadwal</p>
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
                Senin
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Selasa
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rabu
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kamis
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jumat
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="schedule in schedules" :key="schedule.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ schedule.department?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatWeekRange(schedule.weekStartDate) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ schedule.mondayMenu || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ schedule.tuesdayMenu || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ schedule.wednesdayMenu || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ schedule.thursdayMenu || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ schedule.fridayMenu || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="openEditModal(schedule)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button @click="handleDelete(schedule)" class="text-red-600 hover:text-red-900">
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Generate Schedule Modal -->
    <ScheduleModal
      v-if="showModal"
      :schedule="selectedSchedule"
      :departments="departments"
      :foods="foods"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { scheduleService } from '@/services/schedule'
import { departmentService } from '@/services/department'
import { foodService } from '@/services/food'
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import ScheduleModal from '@/components/ScheduleModal.vue'

const schedules = ref([])
const departments = ref([])
const foods = ref([])
const loading = ref(false)
const selectedWeek = ref('')
const filterDepartment = ref('')
const showModal = ref(false)
const selectedSchedule = ref(null)

// Set current week as default
const getCurrentWeek = () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday

  const year = startOfWeek.getFullYear()
  const month = String(startOfWeek.getMonth() + 1).padStart(2, '0')
  const day = String(startOfWeek.getDate()).padStart(2, '0')

  return `${year}-W${getWeekNumber(startOfWeek)}`
}

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)).padStart(2, '0')
}

const formatWeekRange = (weekStartDate) => {
  const start = new Date(weekStartDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 4) // Friday

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    })
  }

  return `${formatDate(start)} - ${formatDate(end)}`
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const params = {}

    if (selectedWeek.value) {
      // Convert week format to date
      const [year, week] = selectedWeek.value.split('-W')
      const startDate = new Date(year, 0, 1 + (week - 1) * 7)
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1) // Monday
      params.weekStartDate = startDate.toISOString().split('T')[0]
    }

    if (filterDepartment.value) {
      params.departmentId = filterDepartment.value
    }

    const response = await scheduleService.getWeeklySchedule(params)
    if (response.success) {
      schedules.value = response.data
    }
  } catch (error) {
    console.error('Error loading schedules:', error)
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

const loadFoods = async () => {
  try {
    const response = await foodService.getAllFoods({ limit: 1000 })
    if (response.success) {
      foods.value = response.data.foods || response.data
    }
  } catch (error) {
    console.error('Error loading foods:', error)
  }
}

const openGenerateModal = () => {
  selectedSchedule.value = null
  showModal.value = true
}

const openEditModal = (schedule) => {
  selectedSchedule.value = { ...schedule }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSchedule.value = null
}

const handleSave = async (scheduleData) => {
  try {
    if (selectedSchedule.value) {
      // Update
      await scheduleService.updateWeeklySchedule(selectedSchedule.value.id, scheduleData)
    } else {
      // Generate new
      await scheduleService.generateWeeklySchedule(scheduleData)
    }

    closeModal()
    loadSchedules()
  } catch (error) {
    console.error('Error saving schedule:', error)
  }
}

const handleDelete = async (schedule) => {
  if (
    confirm(
      `Apakah Anda yakin ingin menghapus jadwal minggu ${formatWeekRange(schedule.weekStartDate)}?`,
    )
  ) {
    try {
      await scheduleService.deleteWeeklySchedule(schedule.weekStartDate)
      loadSchedules()
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }
}

onMounted(() => {
  selectedWeek.value = getCurrentWeek()
  loadSchedules()
  loadDepartments()
  loadFoods()
})
</script>
