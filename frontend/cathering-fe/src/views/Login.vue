<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Masuk ke Catering System
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Silakan masukkan kredensial Anda</p>
      </div>

      <!-- Login Type Toggle -->
      <div class="flex justify-center">
        <div class="bg-gray-100 p-1 rounded-lg">
          <button
            @click="loginType = 'email'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              loginType === 'email'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Email & Password
          </button>
          <button
            @click="loginType = 'pin'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              loginType === 'pin'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            PIN
          </button>
        </div>
      </div>

      <!-- Email/Password Login Form -->
      <form v-if="loginType === 'email'" class="mt-8 space-y-6" @submit.prevent="handleEmailLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="emailForm.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="emailForm.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="authStore.isLoading"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ authStore.isLoading ? 'Masuk...' : 'Masuk' }}
          </button>
        </div>
      </form>

      <!-- PIN Login Form -->
      <form v-if="loginType === 'pin'" class="mt-8 space-y-6" @submit.prevent="handlePinLogin">
        <div>
          <label for="pin" class="sr-only">PIN</label>
          <input
            id="pin"
            v-model="pinForm.pin"
            name="pin"
            type="text"
            maxlength="6"
            pattern="[0-9]{6}"
            required
            class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
            placeholder="000000"
            @input="onPinInput"
          />
          <p class="mt-2 text-sm text-gray-500 text-center">Masukkan PIN 6 digit Anda</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading || pinForm.pin.length !== 6"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="authStore.isLoading"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ authStore.isLoading ? 'Masuk...' : 'Masuk dengan PIN' }}
          </button>
        </div>
      </form>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ errorMessage }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Test Credentials -->
      <div
        v-if="loginType === 'email'"
        class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4"
      >
        <h4 class="text-sm font-medium text-blue-800 mb-2">Kredensial Test:</h4>
        <div class="text-xs text-blue-700 space-y-1">
          <div><strong>Administrator:</strong> admin@catering.com / password123</div>
          <div><strong>PIC Catering:</strong> pic@catering.com / password123</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const loginType = ref('email')

const emailForm = reactive({
  email: '',
  password: '',
})

const pinForm = reactive({
  pin: '',
})

const errorMessage = ref('')

const handleEmailLogin = async () => {
  errorMessage.value = ''

  const result = await authStore.login({
    email: emailForm.email,
    password: emailForm.password,
  })

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.message
  }
}

const handlePinLogin = async () => {
  errorMessage.value = ''

  const result = await authStore.loginWithPin(pinForm.pin)

  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.message
  }
}

const onPinInput = (event) => {
  // Only allow numbers
  const value = event.target.value.replace(/\D/g, '')
  pinForm.pin = value.substring(0, 6)
  event.target.value = pinForm.pin
}
</script>
