<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">大模型管理</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + 新增大模型
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base URL</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in modelList" :key="item.id">
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ item.baseUrl }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.modelName }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="item.enabled === 1 ? 'text-green-600' : 'text-gray-400'">
                {{ item.enabled === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-800">
                编辑
              </button>
              <button @click="handleDelete(item.id)" class="text-red-600 hover:text-red-800">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="modelList.length === 0" class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>

    <Modal :show="showModal" :title="modalTitle" @close="closeModal" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: OpenAI"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
          <input
            v-model="formData.baseUrl"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: https://api.openai.com/v1"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            v-model="formData.apiKey"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入 API Key"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
          <input
            v-model="formData.modelName"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: gpt-4o"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            v-model="formData.enabled"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getModelList, createModel, updateModel, deleteModel } from '../api/model'
import { showSuccess, showError } from '../utils/message'
import Modal from '../components/Modal.vue'

const modelList = ref([])
const showModal = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)

const formData = ref({
  id: null,
  name: '',
  baseUrl: '',
  apiKey: '',
  modelName: '',
  enabled: 1
})

const fetchList = async () => {
  try {
    const res = await getModelList()
    modelList.value = res.data || []
  } catch (error) {
    showError('获取列表失败')
  }
}

const openAddModal = () => {
  isEdit.value = false
  modalTitle.value = '新增大模型'
  formData.value = {
    id: null,
    name: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    enabled: 1
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  modalTitle.value = '编辑大模型'
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateModel(formData.value)
      showSuccess('更新成功')
    } else {
      await createModel(formData.value)
      showSuccess('创建成功')
    }
    closeModal()
    fetchList()
  } catch (error) {
    showError(isEdit.value ? '更新失败' : '创建失败')
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除吗？')) return
  try {
    await deleteModel(id)
    showSuccess('删除成功')
    fetchList()
  } catch (error) {
    showError('删除失败')
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchList()
})
</script>
