<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">视频流规则管理</h2>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + 新增绑定
      </button>
    </div>

    <!-- 绑定关系列表 -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">绑定关系列表</h3>
      </div>
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">视频流</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">识别规则</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in bindingList" :key="item.id">
            <td class="px-6 py-4 text-sm text-gray-900">{{ item.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ getStreamName(item.videoStreamId) }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ getRuleName(item.aiRuleId) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="item.enabled === 1 ? 'text-green-600' : 'text-gray-400'">
                {{ item.enabled === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="viewLogs(item.aiRuleId)" class="text-green-600 hover:text-green-800">
                查看日志
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
      <div v-if="bindingList.length === 0" class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>

    <!-- 日志查询 -->
    <div v-if="showLogs" class="bg-white rounded-lg shadow">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-semibold">执行日志 - {{ currentLogRuleName }}</h3>
        <div class="space-x-2">
          <select
            v-model="logLimit"
            @change="fetchLogs"
            class="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option :value="10">最近 10 条</option>
            <option :value="20">最近 20 条</option>
            <option :value="50">最近 50 条</option>
            <option :value="100">最近 100 条</option>
          </select>
          <button @click="fetchLogs" class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            刷新
          </button>
          <button @click="closeLogs" class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
            关闭
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">视频流</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">结果</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">耗时(ms)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">执行时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">错误信息</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="log in logList" :key="log.id">
              <td class="px-6 py-4 text-sm text-gray-900">{{ log.id }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ log.videoStreamName }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'">
                  {{ log.status === 'SUCCESS' ? '成功' : '失败' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-md">
                <button
                  v-if="log.result"
                  @click="showResultDetail(log.result)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  查看详情
                </button>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ log.duration }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(log.createTime) }}</td>
              <td class="px-6 py-4 text-sm text-red-600">{{ log.errorMessage || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="logList.length === 0" class="text-center py-8 text-gray-500">
          暂无日志数据
        </div>
      </div>
    </div>

    <!-- 绑定关系 Modal -->
    <Modal :show="showModal" :title="modalTitle" @close="closeModal" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">视频流</label>
          <select
            v-model="formData.videoStreamId"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择视频流</option>
            <option v-for="stream in streamList" :key="stream.id" :value="stream.id">
              {{ stream.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">识别规则</label>
          <select
            v-model="formData.aiRuleId"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择识别规则</option>
            <option v-for="rule in ruleList" :key="rule.id" :value="rule.id">
              {{ rule.name }}
            </option>
          </select>
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

    <!-- 结果详情 Modal -->
    <Modal :show="showResultModal" title="识别结果详情" @close="closeResultModal" @confirm="closeResultModal">
      <pre class="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">{{ resultDetail }}</pre>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getStreamRuleList,
  createStreamRule,
  updateStreamRule,
  deleteStreamRule
} from '../api/streamRule'
import { getStreamList } from '../api/stream'
import { getRuleList } from '../api/rule'
import { getLogs } from '../api/log'
import { showSuccess, showError } from '../utils/message'
import Modal from '../components/Modal.vue'

const bindingList = ref([])
const streamList = ref([])
const ruleList = ref([])
const showModal = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)

const showLogs = ref(false)
const logList = ref([])
const currentLogRuleId = ref(null)
const currentLogRuleName = ref('')
const logLimit = ref(20)

const showResultModal = ref(false)
const resultDetail = ref('')

const formData = ref({
  id: null,
  videoStreamId: '',
  aiRuleId: '',
  enabled: 1
})

const fetchBindingList = async () => {
  try {
    const res = await getStreamRuleList()
    bindingList.value = res.data || []
  } catch (error) {
    showError('获取绑定列表失败')
  }
}

const fetchStreamList = async () => {
  try {
    const res = await getStreamList()
    streamList.value = res.data || []
  } catch (error) {
    showError('获取视频流列表失败')
  }
}

const fetchRuleList = async () => {
  try {
    const res = await getRuleList()
    ruleList.value = res.data || []
  } catch (error) {
    showError('获取规则列表失败')
  }
}

const getStreamName = (streamId) => {
  const stream = streamList.value.find(s => s.id === streamId)
  return stream ? stream.name : '-'
}

const getRuleName = (ruleId) => {
  const rule = ruleList.value.find(r => r.id === ruleId)
  return rule ? rule.name : '-'
}

const openAddModal = () => {
  isEdit.value = false
  modalTitle.value = '新增绑定关系'
  formData.value = {
    id: null,
    videoStreamId: '',
    aiRuleId: '',
    enabled: 1
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  modalTitle.value = '编辑绑定关系'
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateStreamRule(formData.value)
      showSuccess('更新成功')
    } else {
      await createStreamRule(formData.value)
      showSuccess('创建成功')
    }
    closeModal()
    fetchBindingList()
  } catch (error) {
    showError(isEdit.value ? '更新失败' : '创建失败')
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除吗？')) return
  try {
    await deleteStreamRule(id)
    showSuccess('删除成功')
    fetchBindingList()
  } catch (error) {
    showError('删除失败')
  }
}

const viewLogs = async (ruleId) => {
  currentLogRuleId.value = ruleId
  const rule = ruleList.value.find(r => r.id === ruleId)
  currentLogRuleName.value = rule ? rule.name : `规则 ${ruleId}`
  showLogs.value = true
  await fetchLogs()
}

const fetchLogs = async () => {
  if (!currentLogRuleId.value) return
  try {
    const res = await getLogs(currentLogRuleId.value, logLimit.value)
    logList.value = res.data || []
  } catch (error) {
    showError('获取日志失败')
  }
}

const closeLogs = () => {
  showLogs.value = false
  logList.value = []
  currentLogRuleId.value = null
}

const showResultDetail = (result) => {
  try {
    const parsed = JSON.parse(result)
    resultDetail.value = JSON.stringify(parsed, null, 2)
  } catch {
    resultDetail.value = result
  }
  showResultModal.value = true
}

const closeResultModal = () => {
  showResultModal.value = false
  resultDetail.value = ''
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchBindingList()
  fetchStreamList()
  fetchRuleList()
})
</script>
