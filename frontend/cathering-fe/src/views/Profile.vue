<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <UserCircleIcon class="h-16 w-16 text-gray-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p class="text-gray-600">Kelola informasi profil dan keamanan akun Anda</p>
        </div>
      </div>
    </div>

    <!-- Profile Information -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">Informasi Profil</h2>
        <button
          @click="editProfile = !editProfile"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PencilIcon class="h-4 w-4 inline mr-2" />
          {{ editProfile ? 'Batal Edit' : 'Edit Profil' }}
        </button>
      </div>

      <form v-if="editProfile" @submit.prevent="updateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              v-model="profileForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="profileForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
            <select
              v-model="profileForm.departmentId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih departemen</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              :value="profileForm.role === 'pic' ? 'PIC' : 'User'"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="editProfile = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isUpdatingProfile"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Departemen</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.department?.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <p class="mt-1 text-sm text-gray-900">
              <span
                :class="
                  authStore.user?.role === 'pic'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                "
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ authStore.user?.role === 'pic' ? 'PIC' : 'User' }}
              </span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">PIN</label>
            <p class="mt-1 text-sm text-gray-900 font-mono">{{ authStore.user?.pin }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <p class="mt-1">
              <span
                :class="
                  authStore.user?.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ authStore.user?.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">Ubah Password</h2>
        <button
          @click="changePassword = !changePassword"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <LockClosedIcon class="h-4 w-4 inline mr-2" />
          {{ changePassword ? 'Batal' : 'Ubah Password' }}
        </button>
      </div>

      <form v-if="changePassword" @submit.prevent="updatePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Masukkan password lama"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Masukkan password baru (min. 6 karakter)"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Konfirmasi Password Baru</label
          >
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Konfirmasi password baru"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="changePassword = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isUpdatingPassword"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ isUpdatingPassword ? 'Mengubah...' : 'Ubah Password' }}
          </button>
        </div>
      </form>

      <div v-else class="text-center py-8">
        <LockClosedIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Klik tombol "Ubah Password" untuk mengubah password Anda.</p>
      </div>
    </div>

    <!-- Activity Log -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-medium text-gray-900">Aktivitas Terakhir</h2>
        <button
          @click="refreshActivityLog"
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <ArrowPathIcon class="h-4 w-4 inline mr-2" />
          Refresh
        </button>
      </div>

      <div v-if="isLoadingActivity" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat aktivitas...</p>
      </div>

      <div v-else-if="activityLog.length === 0" class="text-center py-12">
        <ClockIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada aktivitas ditemukan.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="activity in activityLog"
          :key="activity.id"
          class="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
        >
          <div class="flex-shrink-0">
            <component :is="getActivityIcon(activity.type)" class="h-5 w-5 text-gray-400 mt-0.5" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900">{{ activity.description }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(activity.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Statistics -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-6">Statistik Akun</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div
            class="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center"
          >
            <ShoppingBagIcon class="h-8 w-8 text-blue-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ userStats.totalOrders }}</p>
          <p class="text-sm text-gray-600">Total Pesanan</p>
        </div>

        <div class="text-center">
          <div
            class="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center"
          >
            <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">
            Rp {{ formatCurrency(userStats.totalSpent) }}
          </p>
          <p class="text-sm text-gray-600">Total Pengeluaran</p>
        </div>

        <div class="text-center">
          <div
            class="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center"
          >
            <StarIcon class="h-8 w-8 text-yellow-600" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ userStats.feedbackCount }}</p>
          <p class="text-sm text-gray-600">Feedback Diberikan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import { departmentService } from '@/services/department'
import {
  UserCircleIcon,
  PencilIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ClockIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// State
const departments = ref([])
const activityLog = ref([])
const userStats = ref({
  totalOrders: 0,
  totalSpent: 0,
  feedbackCount: 0,
})

const editProfile = ref(false)
const changePassword = ref(false)
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const isLoadingActivity = ref(false)

const profileForm = ref({
  name: '',
  email: '',
  departmentId: '',
  role: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Methods
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

const fetchUserStats = async () => {
  try {
    const response = await authService.getUserStats()
    if (response.success) {
      userStats.value = response.data
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

const fetchActivityLog = async () => {
  isLoadingActivity.value = true
  try {
    const response = await authService.getUserActivityLog()
    if (response.success) {
      activityLog.value = response.data
    }
  } catch (error) {
    console.error('Error fetching activity log:', error)
  } finally {
    isLoadingActivity.value = false
  }
}

const refreshActivityLog = () => {
  fetchActivityLog()
}

const updateProfile = async () => {
  isUpdatingProfile.value = true
  try {
    const response = await authService.updateProfile(profileForm.value)
    if (response.success) {
      // Update auth store
      await authStore.fetchUser()
      editProfile.value = false
      alert('Profil berhasil diperbarui')
    } else {
      alert(response.message || 'Gagal memperbarui profil')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Terjadi kesalahan saat memperbarui profil')
  } finally {
    isUpdatingProfile.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Konfirmasi password tidak cocok')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    alert('Password baru harus minimal 6 karakter')
    return
  }

  isUpdatingPassword.value = true
  try {
    const response = await authService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    if (response.success) {
      changePassword.value = false
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      alert('Password berhasil diubah')
    } else {
      alert(response.message || 'Gagal mengubah password')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Terjadi kesalahan saat mengubah password')
  } finally {
    isUpdatingPassword.value = false
  }
}

const getActivityIcon = (type) => {
  const icons = {
    login: UserCircleIcon,
    order: ShoppingBagIcon,
    feedback: ChatBubbleLeftRightIcon,
    profile: PencilIcon,
    password: LockClosedIcon,
  }
  return icons[type] || ClockIcon
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
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

const initializeProfileForm = () => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || '',
      email: authStore.user.email || '',
      departmentId: authStore.user.departmentId || '',
      role: authStore.user.role || '',
    }
  }
}

// Lifecycle
onMounted(async () => {
  initializeProfileForm()

  await Promise.all([fetchDepartments(), fetchUserStats(), fetchActivityLog()])
})

// Watch for auth store changes
watch(
  () => authStore.user,
  () => {
    initializeProfileForm()
  },
  { deep: true },
)
</script>
