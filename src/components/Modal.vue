<template>
  <div v-if="show" class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <span class="text-2xl">&times;</span>
        </button>
      </div>
      <div class="p-6">
        <slot></slot>
      </div>
      <div class="flex justify-end gap-2 p-4 border-t">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          取消
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String
})

defineEmits(['close', 'confirm'])
</script>
