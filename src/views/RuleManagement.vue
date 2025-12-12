<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">规则管理</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + 新增规则
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">规则名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">绑定模型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in ruleList" :key="item.id">
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ item.description }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ getModelName(item.modelApiId) }}</td>
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
      <div v-if="ruleList.length === 0" class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>

    <Modal :show="showModal" :title="modalTitle" @close="closeModal" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: 老人摔倒检测"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">规则描述</label>
          <input
            v-model="formData.description"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入规则描述"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">绑定大模型</label>
          <select
            v-model="formData.modelApiId"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择大模型</option>
            <option v-for="model in modelList" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.modelName }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">提示词模板</label>
          <textarea
            v-model="formData.promptTemplate"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='例如: 请分析这张图片，检测是否有老人摔倒。返回 JSON 格式: {"has_fall": true/false, "confidence": 0-100, "description": "描述"}'
          ></textarea>
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
import { getRuleList, createRule, updateRule, deleteRule } from '../api/rule'
import { getModelList } from '../api/model'
import { showSuccess, showError } from '../utils/message'
import Modal from '../components/Modal.vue'

const ruleList = ref([])
const modelList = ref([])
const showModal = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)

const formData = ref({
  id: null,
  name: '',
  description: '',
  modelApiId: '',
  promptTemplate: '',
  enabled: 1
})

const fetchList = async () => {
  try {
    const res = await getRuleList()
    ruleList.value = res.data || []
  } catch (error) {
    showError('获取列表失败')
  }
}

const fetchModelList = async () => {
  try {
    const res = await getModelList()
    modelList.value = res.data || []
  } catch (error) {
    showError('获取大模型列表失败')
  }
}

const getModelName = (modelApiId) => {
  const model = modelList.value.find(m => m.id === modelApiId)
  return model ? `${model.name}` : '-'
}

const openAddModal = () => {
  isEdit.value = false
  modalTitle.value = '新增规则'
  formData.value = {
    id: null,
    name: '',
    description: '',
    modelApiId: '',
    promptTemplate: '',
    enabled: 1
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  modalTitle.value = '编辑规则'
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateRule(formData.value)
      showSuccess('更新成功')
    } else {
      await createRule(formData.value)
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
    await deleteRule(id)
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
  fetchModelList()
})
</script>
