<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Page title -->
      <div>
        <h1 class="text-xl font-semibold text-gray-800">
          {{ getPageTitle() }}
        </h1>
      </div>

      <!-- User menu -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button class="p-2 text-gray-400 hover:text-gray-600 relative">
          <BellIcon class="h-6 w-6" />
          <span class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User dropdown -->
        <div class="relative" ref="userMenu">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span class="text-white font-medium">
                {{ authStore.user?.name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-gray-700 font-medium">{{ authStore.user?.name }}</span>
            <ChevronDownIcon class="h-4 w-4 text-gray-400" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-show="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showUserMenu = false"
            >
              <UserIcon class="h-4 w-4 inline mr-2" />
              Profile
            </router-link>
            <button
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon class="h-4 w-4 inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)
const userMenu = ref(null)

const pageNames = {
  Dashboard: 'Dashboard',
  Foods: 'Kelola Makanan',
  Orders: 'Pesanan',
  OrderFood: 'Pesan Makanan',
  Feedback: 'Feedback',
  Reports: 'Laporan',
  Departments: 'Kelola Departemen',
  Vouchers: 'Kelola Voucher',
  Profile: 'Profil',
}

const getPageTitle = () => {
  return pageNames[route.name] || route.name || 'Catering System'
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
