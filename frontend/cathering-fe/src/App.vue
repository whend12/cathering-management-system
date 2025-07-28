<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await authStore.initializeAuth()

  // Redirect to login if not authenticated and not already on login page
  if (!authStore.isAuthenticated && router.currentRoute.value.name !== 'Login') {
    router.push('/login')
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Show layout only if authenticated -->
    <div v-if="authStore.isAuthenticated" class="flex">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main content -->
      <div class="flex-1 ml-64">
        <!-- Navbar -->
        <Navbar />

        <!-- Page content -->
        <main class="p-6">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Show only router-view for login page -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>
