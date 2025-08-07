<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Gambar Fullscreen -->
    <img
      :src="loginImage"
      alt="Background"
      class="absolute inset-0 w-screen h-screen object-cover z-0"
    />

    <!-- Layer Gelap (optional) -->
    <div class="absolute inset-0 bg-opacity-20 z-10"></div>

    <!-- Panel Tombol Login dengan animasi -->
    <transition name="slide-down">
      <div
        v-if="!showPICLogin"
        class="pointer-events-auto absolute bottom-0 w-full bg-[#27215d] rounded-t-3xl z-20 px-6 py-8 flex flex-col items-center space-y-4"
      >
        <button
          @click="showPICLogin = true"
          class="flex items-center space-x-2 bg-white text-[#27215d] font-semibold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Login Sebagai PIC</span>
        </button>

        <button
          @click="showAdminLogin = true"
          class="flex items-center space-x-2 bg-white text-[#27215d] font-semibold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Login Sebagai Admin</span>
        </button>
      </div>
    </transition>

    <!-- PIC Login Modal -->
    <PICLoginModal
      :showModal="showPICLogin"
      @close="closePICModal"
      @selectDepartment="selectDepartment"
    />

    <!-- PIN Login Modal -->
    <PINLoginModal
      :showModal="showPinModal"
      :isLoading="isLoading"
      :errorMessage="errorMessage"
      @close="closePinModal"
      @submitPin="loginWithPin"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import loginImage from '@/assets/login.png'
import PICLoginModal from './PICLoginModal.vue'
import PINLoginModal from './PINLoginModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const showPICLogin = ref(false)
const showAdminLogin = ref(false)
const showPinModal = ref(false)
const selectedDepartment = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Form data
const picForm = ref({
  username: '',
  password: '',
})

const adminForm = ref({
  username: '',
  password: '',
})

// Methods
const selectDepartment = (department) => {
  selectedDepartment.value = department
  showPICLogin.value = false
  showPinModal.value = true
  errorMessage.value = ''
}

const loginPIC = async () => {
  if (!picForm.value.username || !picForm.value.password) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login({
      username: picForm.value.username,
      password: picForm.value.password,
      type: 'pic_catering',
    })

    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message || 'Login gagal'
    }
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan saat login'
  } finally {
    isLoading.value = false
    showPICLogin.value = false
  }
}

const loginAdmin = async () => {
  if (!adminForm.value.username || !adminForm.value.password) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login({
      username: adminForm.value.username,
      password: adminForm.value.password,
      type: 'administrator',
    })

    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message || 'Login gagal'
    }
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan saat login'
  } finally {
    isLoading.value = false
    showAdminLogin.value = false
  }
}

const loginWithPin = async (pin) => {
  if (!pin || !selectedDepartment.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.loginWithPin({
      pin: pin,
      department: selectedDepartment.value,
    })

    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message || 'PIN tidak valid'
    }
  } catch (error) {
    errorMessage.value = 'PIN tidak valid atau terjadi kesalahan'
  } finally {
    isLoading.value = false
  }
}

const closePinModal = () => {
  showPinModal.value = false
  selectedDepartment.value = ''
  errorMessage.value = ''
}

const closePICModal = () => {
  showPICLogin.value = false
  errorMessage.value = ''
}

// Lifecycle
onMounted(() => {
  // Clear any existing auth state
  errorMessage.value = ''

  // Check if already authenticated
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Animasi slide-down untuk panel login */
.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.3s ease-in;
}

.slide-down-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Smooth animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
body {
  overflow: hidden;
}
</style>
