<template>
  <!-- Modal Pilih Departemen PIC dengan animasi slide dari bawah -->
  <transition name="slide-up">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center">
      <!-- Background overlay yang bisa diklik untuk menutup -->
      <div class="absolute inset-0 bg-opacity-30" @click="closeModal"></div>

      <!-- Panel modal dengan background sama seperti panel login -->
      <div
        class="relative w-full bg-[#27215d] rounded-t-3xl z-20 px-6 py-8 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <h2 class="text-xl font-bold text-center mb-6 text-white">Pilih Departemen Anda!</h2>

        <div class="space-y-3">
          <!-- Departemen Digital Solution -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen Digital Solution</div>
              <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full"
                >Completed</span
              >
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-1"
                >Request to edit</span
              >
            </div>
            <button
              @click="selectDepartment('digital-solution')"
              class="text-gray-600 hover:text-gray-800 p-2"
            >
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>

          <!-- Departemen Sales & Marketing -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen Sales & Marketing</div>
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Ongoing</span>
            </div>
            <button
              @click="selectDepartment('sales-marketing')"
              class="text-gray-600 hover:text-gray-800 p-2"
            >
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>

          <!-- Departemen FAT & Procurement -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen FAT & Procurement</div>
              <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                >Not Yet</span
              >
            </div>
            <button
              @click="selectDepartment('fat-procurement')"
              class="text-gray-600 hover:text-gray-800 p-2"
            >
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>

          <!-- Departemen HC -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen HC</div>
              <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                >Not Yet</span
              >
            </div>
            <button @click="selectDepartment('hc')" class="text-gray-600 hover:text-gray-800 p-2">
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>

          <!-- Departemen MIS -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen MIS</div>
              <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                >Not Started</span
              >
            </div>
            <button @click="selectDepartment('mis')" class="text-gray-600 hover:text-gray-800 p-2">
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>

          <!-- Departemen Ops -->
          <div
            class="flex items-center justify-between bg-white bg-opacity-90 rounded-xl p-4 hover:bg-opacity-100 transition-all"
          >
            <div>
              <div class="font-semibold text-gray-800">Departemen Ops</div>
              <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full"
                >Not Started</span
              >
            </div>
            <button @click="selectDepartment('ops')" class="text-gray-600 hover:text-gray-800 p-2">
              <!-- Icon PIN/Keypad -->
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'selectDepartment'])

const closeModal = () => {
  emit('close')
}

const selectDepartment = (department) => {
  emit('selectDepartment', department)
}
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

/* Smooth transitions untuk hover effects */
.transition-all {
  transition: all 0.2s ease;
}
</style>
