<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Kelola Makanan</h1>
          <p class="text-gray-600">Kelola menu makanan yang tersedia</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="refreshFoods"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Refresh
          </button>
          <button
            v-if="authStore.canManage"
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon class="h-4 w-4 inline mr-2" />
            Tambah Makanan
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Semua Kategori</option>
            <option value="makanan-berat">Makanan Berat</option>
            <option value="makanan-ringan">Makanan Ringan</option>
            <option value="minuman">Minuman</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Semua Status</option>
            <option value="true">Tersedia</option>
            <option value="false">Tidak Tersedia</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Foods Grid -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="foodStore.isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600 mt-2">Memuat makanan...</p>
      </div>

      <div v-else-if="filteredFoods.length === 0" class="text-center py-12">
        <CakeIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Tidak ada makanan ditemukan.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        <div
          v-for="food in filteredFoods"
          :key="food.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Food Image -->
          <div class="h-48 bg-gray-200 relative">
            <img
              v-if="food.image"
              :src="food.image"
              :alt="food.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full">
              <CakeIcon class="h-16 w-16 text-gray-400" />
            </div>

            <!-- Status Badge -->
            <div class="absolute top-2 right-2">
              <span
                :class="
                  food.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                "
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ food.isAvailable ? 'Tersedia' : 'Tidak Tersedia' }}
              </span>
            </div>
          </div>

          <!-- Food Info -->
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-semibold text-gray-900 truncate">{{ food.name }}</h3>
              <p class="text-lg font-bold text-indigo-600 ml-2">
                Rp {{ formatCurrency(food.price) }}
              </p>
            </div>

            <p class="text-sm text-gray-600 mb-2 capitalize">
              {{ food.category?.replace('-', ' ') }}
            </p>

            <p v-if="food.description" class="text-sm text-gray-700 mb-3 line-clamp-2">
              {{ food.description }}
            </p>

            <!-- Actions -->
            <div v-if="authStore.canManage" class="flex space-x-2">
              <button
                @click="editFood(food)"
                class="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                <PencilIcon class="h-4 w-4 inline mr-1" />
                Edit
              </button>
              <button
                @click="toggleAvailability(food)"
                :class="
                  food.isAvailable
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                "
                class="flex-1 px-3 py-2 rounded-md text-sm"
              >
                {{ food.isAvailable ? 'Nonaktifkan' : 'Aktifkan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Food Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? 'Edit Makanan' : 'Tambah Makanan' }}
          </h3>

          <form @submit.prevent="submitFood" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama Makanan</label>
              <input
                v-model="foodForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan nama makanan"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                v-model="foodForm.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Pilih kategori</option>
                <option value="makanan-berat">Makanan Berat</option>
                <option value="makanan-ringan">Makanan Ringan</option>
                <option value="minuman">Minuman</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input
                v-model.number="foodForm.price"
                type="number"
                min="0"
                step="1000"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan harga"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                v-model="foodForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Deskripsi makanan (opsional)"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
              <input
                v-model="foodForm.image"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg (opsional)"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="foodForm.isAvailable"
                type="checkbox"
                id="isAvailable"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="isAvailable" class="ml-2 text-sm text-gray-700">
                Tersedia untuk dipesan
              </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'
import { ArrowPathIcon, PlusIcon, PencilIcon, CakeIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const foodStore = useFoodStore()

// State
const filters = ref({
  category: '',
  status: '',
})

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const editingFood = ref(null)

const foodForm = ref({
  name: '',
  category: '',
  price: 0,
  description: '',
  image: '',
  isAvailable: true,
})

// Computed
const filteredFoods = computed(() => {
  let foods = foodStore.foods

  if (filters.value.category) {
    foods = foods.filter((food) => food.category === filters.value.category)
  }

  if (filters.value.status !== '') {
    const isAvailable = filters.value.status === 'true'
    foods = foods.filter((food) => food.isAvailable === isAvailable)
  }

  return foods
})

// Methods
const refreshFoods = () => {
  foodStore.fetchFoods()
}

const applyFilters = () => {
  // Filters are applied via computed property
}

const openAddModal = () => {
  isEditing.value = false
  editingFood.value = null
  foodForm.value = {
    name: '',
    category: '',
    price: 0,
    description: '',
    image: '',
    isAvailable: true,
  }
  showModal.value = true
}

const editFood = (food) => {
  isEditing.value = true
  editingFood.value = food
  foodForm.value = {
    name: food.name,
    category: food.category,
    price: food.price,
    description: food.description || '',
    image: food.image || '',
    isAvailable: food.isAvailable,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingFood.value = null
}

const submitFood = async () => {
  isSubmitting.value = true
  try {
    let success
    if (isEditing.value) {
      success = await foodStore.updateFood(editingFood.value.id, foodForm.value)
    } else {
      success = await foodStore.createFood(foodForm.value)
    }

    if (success) {
      closeModal()
    }
  } catch (error) {
    console.error('Error submitting food:', error)
  } finally {
    isSubmitting.value = false
  }
}

const toggleAvailability = async (food) => {
  try {
    await foodStore.updateFood(food.id, {
      ...food,
      isAvailable: !food.isAvailable,
    })
  } catch (error) {
    console.error('Error toggling availability:', error)
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

// Lifecycle
onMounted(() => {
  foodStore.fetchFoods()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
