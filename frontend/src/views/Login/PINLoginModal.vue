<template>
  <!-- Modal Masukkan PIN dengan animasi slide dari bawah -->
  <transition name="slide-up">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center">
      <!-- Background overlay yang bisa diklik untuk menutup -->
      <div class="absolute inset-0 bg-black bg-opacity-30" @click="closeModal"></div>

      <!-- Panel modal dengan background sama seperti panel login -->
      <div
        class="relative w-full bg-[#27215d] rounded-t-3xl z-20 px-8 py-8 text-center"
        @click.stop
      >
        <!-- Icon PIN dan Title -->
        <div class="flex items-center justify-center mb-6">
          <svg
            class="w-8 h-8 text-white mr-3"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2 class="text-xl font-bold text-white">Masukkan PIN Anda!</h2>
        </div>

        <div class="mb-6">
          <input
            v-model="pin"
            type="password"
            maxlength="6"
            class="w-full text-center text-2xl tracking-widest border-2 border-white border-opacity-30 bg-white bg-opacity-10 text-white rounded-lg py-3 px-4 focus:border-white focus:border-opacity-60 focus:outline-none placeholder-white placeholder-opacity-50"
            placeholder="••••••"
            @keyup.enter="submitPin"
          />
        </div>

        <div class="flex space-x-4">
          <button
            @click="closeModal"
            class="flex-1 py-2 px-4 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition"
          >
            Cancel
          </button>
          <button
            @click="submitPin"
            :disabled="!pin || isLoading"
            class="flex-1 py-2 px-4 bg-white text-[#27215d] rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {{ isLoading ? 'Loading...' : 'Login' }}
          </button>
        </div>

        <div v-if="errorMessage" class="mt-4 text-red-300 text-sm">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'submitPin'])

const pin = ref('')

const closeModal = () => {
  pin.value = ''
  emit('close')
}

const submitPin = () => {
  if (!pin.value) return
  emit('submitPin', pin.value)
}

// Reset PIN when modal is closed
watch(
  () => props.showModal,
  (newVal) => {
    if (!newVal) {
      pin.value = ''
    }
  },
)
</script>

<style scoped>
/* Animasi slide-up untuk modal */
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s ease-in;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Smooth transitions */
.transition {
  transition: all 0.2s ease;
}
</style>
