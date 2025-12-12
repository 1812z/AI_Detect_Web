<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">视频流管理</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + 新增视频流
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">视频流地址</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">识别间隔(秒)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in streamList" :key="item.id">
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ item.streamUrl }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.intervalSeconds }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="item.enabled === 1 ? 'text-green-600' : 'text-gray-400'">
                {{ item.enabled === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="testCapture(item.id)" class="text-green-600 hover:text-green-800">
                测试
              </button>
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
      <div v-if="streamList.length === 0" class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>

    <Modal :show="showModal" :title="modalTitle" @close="closeModal" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">视频流名称</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: 家庭客厅摄像头"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">视频流地址</label>
          <input
            v-model="formData.streamUrl"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: rtsp://192.168.1.100:554/stream1"
          />
          <p class="text-xs text-gray-500 mt-1">支持 RTSP、HTTP 等协议</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">识别间隔(秒)</label>
          <input
            v-model.number="formData.intervalSeconds"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="建议 3-10 秒"
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

    <!-- 测试捕获结果 Modal -->
    <Modal :show="showTestModal" title="测试捕获结果" @close="closeTestModal" @confirm="closeTestModal">
      <div v-if="testLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">正在捕获图像...</p>
      </div>
      <div v-else-if="testResult">
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600"><strong>视频流名称:</strong> {{ testResult.streamName }}</p>
            <p class="text-sm text-gray-600"><strong>视频流地址:</strong> {{ testResult.streamUrl }}</p>
            <p class="text-sm text-gray-600"><strong>图像大小:</strong> {{ (testResult.imageSize / 1024).toFixed(2) }} KB</p>
          </div>
          <div v-if="testResult.imageBase64">
            <p class="text-sm font-medium text-gray-700 mb-2">捕获的图像:</p>
            <img :src="'data:image/jpeg;base64,' + testResult.imageBase64" class="w-full rounded border" alt="Captured Image" />
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStreamList, createStream, updateStream, deleteStream, testCapture as testCaptureApi } from '../api/stream'
import { showSuccess, showError } from '../utils/message'
import Modal from '../components/Modal.vue'

const streamList = ref([])
const showModal = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)

const showTestModal = ref(false)
const testLoading = ref(false)
const testResult = ref(null)

const formData = ref({
  id: null,
  name: '',
  streamUrl: '',
  intervalSeconds: 5,
  enabled: 1
})

const fetchList = async () => {
  try {
    const res = await getStreamList()
    streamList.value = res.data || []
  } catch (error) {
    showError('获取列表失败')
  }
}

const openAddModal = () => {
  isEdit.value = false
  modalTitle.value = '新增视频流'
  formData.value = {
    id: null,
    name: '',
    streamUrl: '',
    intervalSeconds: 5,
    enabled: 1
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  modalTitle.value = '编辑视频流'
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateStream(formData.value)
      showSuccess('更新成功')
    } else {
      await createStream(formData.value)
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
    await deleteStream(id)
    showSuccess('删除成功')
    fetchList()
  } catch (error) {
    showError('删除失败')
  }
}

const testCapture = async (id) => {
  showTestModal.value = true
  testLoading.value = true
  testResult.value = null

  try {
    const res = await testCaptureApi(id)
    testResult.value = res.data
    testLoading.value = false
  } catch (error) {
    showError('测试捕获失败')
    testLoading.value = false
    closeTestModal()
  }
}

const closeTestModal = () => {
  showTestModal.value = false
  testResult.value = null
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchList()
})
</script>
