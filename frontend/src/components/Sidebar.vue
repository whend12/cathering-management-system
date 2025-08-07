<template>
  <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
    <!-- Logo/Brand -->
    <div class="flex items-center justify-center h-16 px-4 bg-indigo-600">
      <h1 class="text-xl font-bold text-white">Catering System</h1>
    </div>

    <!-- Navigation -->
    <nav class="mt-6 px-4">
      <div class="space-y-2">
        <!-- Dashboard -->
        <router-link
          to="/"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'Dashboard' }"
        >
          <HomeIcon class="h-5 w-5" />
          <span>Dashboard</span>
        </router-link>

        <!-- Order Food (For all users) -->
        <router-link
          to="/order-food"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'OrderFood' }"
        >
          <ShoppingCartIcon class="h-5 w-5" />
          <span>Pesan Makanan</span>
        </router-link>

        <!-- Orders -->
        <router-link
          to="/orders"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'Orders' }"
        >
          <ClipboardDocumentListIcon class="h-5 w-5" />
          <span>Pesanan</span>
        </router-link>

        <!-- Feedback -->
        <router-link
          to="/feedback"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'Feedback' }"
        >
          <ChatBubbleLeftRightIcon class="h-5 w-5" />
          <span>Feedback</span>
        </router-link>

        <!-- PIC Catering & Admin only sections -->
        <div v-if="authStore.canManage">
          <hr class="my-4 border-gray-200" />

          <!-- Management section title -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelola</h3>
          </div>

          <!-- Foods Management -->
          <router-link
            to="/foods"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Foods' }"
          >
            <CakeIcon class="h-5 w-5" />
            <span>Kelola Makanan</span>
          </router-link>

          <!-- Departments Management -->
          <router-link
            to="/departments"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Departments' }"
          >
            <BuildingOfficeIcon class="h-5 w-5" />
            <span>Kelola Departemen</span>
          </router-link>

          <!-- Employees Management -->
          <router-link
            to="/employees"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Employees' }"
          >
            <UsersIcon class="h-5 w-5" />
            <span>Kelola Karyawan</span>
          </router-link>

          <!-- Schedules Management -->
          <router-link
            to="/schedules"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Schedules' }"
          >
            <CalendarDaysIcon class="h-5 w-5" />
            <span>Jadwal Mingguan</span>
          </router-link>

          <!-- Vouchers Management -->
          <router-link
            to="/vouchers"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Vouchers' }"
          >
            <TicketIcon class="h-5 w-5" />
            <span>Kelola Voucher</span>
          </router-link>

          <!-- Reports -->
          <router-link
            to="/reports"
            class="nav-item"
            :class="{ 'nav-item-active': $route.name === 'Reports' }"
          >
            <DocumentChartBarIcon class="h-5 w-5" />
            <span>Laporan</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User info at bottom -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
          <span class="text-white font-medium text-sm">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.user?.name }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ getRoleLabel(authStore.user?.role) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CakeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CalendarDaysIcon,
  TicketIcon,
  DocumentChartBarIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const getRoleLabel = (role) => {
  const roleLabels = {
    administrator: 'Administrator',
    pic_catering: 'PIC Catering',
  }
  return roleLabels[role] || 'User'
}
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(75 85 99);
  transition: all 0.2s;
}

.nav-item:hover {
  color: rgb(17 24 39);
  background-color: rgb(243 244 246);
}

.nav-item-active {
  background-color: rgb(238 242 255);
  color: rgb(67 56 202);
}

.nav-item-active:hover {
  color: rgb(67 56 202);
  background-color: rgb(238 242 255);
}
</style>
