<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        数据统计
      </h2>
      <p class="text-gray-600 mt-1">实时监控系统运行状态和识别效果</p>
    </div>

    <!-- 筛选器区域 -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 时间范围 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
          <div class="flex gap-2">
            <button
              @click="filters.timeRange = '24h'"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300',
                filters.timeRange === '24h'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              24小时
            </button>
            <button
              @click="filters.timeRange = '7d'"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300',
                filters.timeRange === '7d'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              7天
            </button>
          </div>
        </div>

        <!-- 成功类型 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">统计类型</label>
          <select
            v-model="filters.successType"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="execution">执行成功</option>
            <option value="ai_result">AI识别成功</option>
          </select>
        </div>

        <!-- 视频流选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">视频流</label>
          <select
            v-model="filters.videoStreamId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option :value="null">全部视频流</option>
            <option v-for="stream in streamList" :key="stream.id" :value="stream.id">
              {{ stream.name }}
            </option>
          </select>
        </div>

        <!-- 规则选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">规则</label>
          <select
            v-model="filters.ruleId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option :value="null">全部规则</option>
            <option v-for="rule in ruleList" :key="rule.id" :value="rule.id">
              {{ rule.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-4">加载中...</p>
    </div>

    <!-- 统计数据 -->
    <div v-else>
      <!-- 顶部统计卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- 视频流总数 -->
        <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">视频流</span>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              📹
            </div>
          </div>
          <div class="text-2xl font-bold mb-1">{{ statsInfo.totalStreams || 0 }}</div>
          <div class="text-xs opacity-75">已启用: {{ statsInfo.enabledStreams || 0 }}</div>
        </div>

        <!-- 规则总数 -->
        <div class="stat-card bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">识别规则</span>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              📋
            </div>
          </div>
          <div class="text-2xl font-bold mb-1">{{ statsInfo.totalRules || 0 }}</div>
          <div class="text-xs opacity-75">已启用: {{ statsInfo.enabledRules || 0 }}</div>
        </div>

        <!-- 大模型总数 -->
        <div class="stat-card bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">AI模型</span>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              🤖
            </div>
          </div>
          <div class="text-2xl font-bold mb-1">{{ statsInfo.totalModels || 0 }}</div>
          <div class="text-xs opacity-75">已启用: {{ statsInfo.enabledModels || 0 }}</div>
        </div>

        <!-- 执行总数 -->
        <div class="stat-card bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">执行总数</span>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              ⚡
            </div>
          </div>
          <div class="text-2xl font-bold mb-1">{{ summary.totalCount || 0 }}</div>
          <div class="text-xs opacity-75">{{ filters.timeRange === '24h' ? '最近24小时' : '最近7天' }}</div>
        </div>
      </div>

      <!-- 图表区域：饼图和折线图并排 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：饼状图 -->
        <div class="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">执行统计</h3>
          <div class="flex flex-col items-center">
            <!-- 饼状图 -->
            <div class="relative w-48 h-48 mb-4">
              <svg viewBox="0 0 200 200" class="w-full h-full transform -rotate-90">
                <!-- 背景圆 -->
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#F3F4F6"
                  stroke-width="40"
                />
                <!-- 成功比例 -->
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="40"
                  :stroke-dasharray="`${successCircumference} ${totalCircumference}`"
                  stroke-linecap="round"
                  class="pie-success"
                />
                <!-- 失败比例 -->
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#EF4444"
                  stroke-width="40"
                  :stroke-dasharray="`${failureCircumference} ${totalCircumference}`"
                  :stroke-dashoffset="`-${successCircumference}`"
                  stroke-linecap="round"
                  class="pie-failure"
                />
              </svg>
              <!-- 中心文字 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-3xl font-bold text-gray-800">{{ (summary.successRate || 0).toFixed(1) }}%</div>
                <div class="text-sm text-gray-500">成功率</div>
              </div>
            </div>

            <!-- 图例 -->
            <div class="w-full space-y-3">
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-700">成功次数</span>
                </div>
                <span class="text-lg font-bold text-green-600">{{ summary.successCount || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-700">失败次数</span>
                </div>
                <span class="text-lg font-bold text-red-600">{{ summary.failureCount || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-700">总次数</span>
                </div>
                <span class="text-lg font-bold text-blue-600">{{ summary.totalCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：趋势图表 -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-800">数据趋势</h3>
            <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-gray-600">总数</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-gray-600">成功</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="text-gray-600">失败</span>
            </div>
          </div>
        </div>

        <!-- 图表容器 -->
        <div class="relative" style="height: 400px;">
          <svg ref="chartSvg" class="w-full h-full">
            <!-- 网格线 -->
            <g v-for="i in 5" :key="'grid-' + i">
              <line
                :x1="chartPadding.left"
                :y1="chartPadding.top + (chartHeight - chartPadding.top - chartPadding.bottom) * i / 5"
                :x2="chartWidth - chartPadding.right"
                :y2="chartPadding.top + (chartHeight - chartPadding.top - chartPadding.bottom) * i / 5"
                stroke="#E5E7EB"
                stroke-width="1"
                stroke-dasharray="4,4"
              />
            </g>

            <!-- 总数折线 -->
            <polyline
              v-if="chartPoints.total.length > 0"
              :points="chartPoints.total"
              fill="none"
              stroke="#3B82F6"
              stroke-width="3"
              stroke-linejoin="round"
              class="chart-line"
            />

            <!-- 成功折线 -->
            <polyline
              v-if="chartPoints.success.length > 0"
              :points="chartPoints.success"
              fill="none"
              stroke="#10B981"
              stroke-width="3"
              stroke-linejoin="round"
              class="chart-line"
            />

            <!-- 失败折线 -->
            <polyline
              v-if="chartPoints.failure.length > 0"
              :points="chartPoints.failure"
              fill="none"
              stroke="#EF4444"
              stroke-width="3"
              stroke-linejoin="round"
              class="chart-line"
            />

            <!-- 数据点 -->
            <g v-for="(point, index) in chartPoints.total" :key="'dot-total-' + index">
              <circle
                :cx="point.split(',')[0]"
                :cy="point.split(',')[1]"
                r="4"
                fill="#3B82F6"
                class="chart-dot"
              />
            </g>
            <g v-for="(point, index) in chartPoints.success" :key="'dot-success-' + index">
              <circle
                :cx="point.split(',')[0]"
                :cy="point.split(',')[1]"
                r="4"
                fill="#10B981"
                class="chart-dot"
              />
            </g>
            <g v-for="(point, index) in chartPoints.failure" :key="'dot-failure-' + index">
              <circle
                :cx="point.split(',')[0]"
                :cy="point.split(',')[1]"
                r="4"
                fill="#EF4444"
                class="chart-dot"
              />
            </g>

            <!-- X轴标签 -->
            <g v-for="(label, index) in trend.labels" :key="'label-' + index">
              <text
                :x="chartPadding.left + (chartWidth - chartPadding.left - chartPadding.right) * index / Math.max(1, trend.labels.length - 1)"
                :y="chartHeight - chartPadding.bottom + 20"
                text-anchor="middle"
                class="text-xs fill-gray-600"
              >
                {{ label }}
              </text>
            </g>

            <!-- Y轴标签 -->
            <g v-for="i in 6" :key="'y-label-' + i">
              <text
                :x="chartPadding.left - 10"
                :y="chartPadding.top + (chartHeight - chartPadding.top - chartPadding.bottom) * (5 - i + 1) / 5"
                text-anchor="end"
                dominant-baseline="middle"
                class="text-xs fill-gray-600"
              >
                {{ Math.round(maxValue * (i - 1) / 5) }}
              </text>
            </g>
          </svg>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { getStatisticsSummary, getStatisticsTrend } from '../api/statistics'
import { getStreamList } from '../api/stream'
import { getRuleList } from '../api/rule'
import { getModelList } from '../api/model'

// 筛选器
const filters = reactive({
  timeRange: '24h',
  successType: 'execution',
  videoStreamId: null,
  ruleId: null
})

// 数据
const loading = ref(false)
const summary = ref({
  totalCount: 0,
  successCount: 0,
  failureCount: 0,
  successRate: 0
})
const trend = ref({
  labels: [],
  totalCounts: [],
  successCounts: [],
  failureCounts: []
})

// 下拉列表数据
const streamList = ref([])
const ruleList = ref([])
const modelList = ref([])

// 统计信息
const statsInfo = ref({
  totalStreams: 0,
  enabledStreams: 0,
  totalRules: 0,
  enabledRules: 0,
  totalModels: 0,
  enabledModels: 0
})

// 图表相关
const chartSvg = ref(null)
const chartWidth = ref(800)
const chartHeight = ref(400)
const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 }

// 饼状图计算
const totalCircumference = computed(() => 2 * Math.PI * 80) // 2πr, r=80

const successCircumference = computed(() => {
  const total = summary.value.totalCount || 0
  if (total === 0) return 0
  return (summary.value.successCount / total) * totalCircumference.value
})

const failureCircumference = computed(() => {
  const total = summary.value.totalCount || 0
  if (total === 0) return 0
  return (summary.value.failureCount / total) * totalCircumference.value
})

// 计算最大值
const maxValue = computed(() => {
  const max = Math.max(
    ...trend.value.totalCounts,
    ...trend.value.successCounts,
    ...trend.value.failureCounts,
    1
  )
  return Math.ceil(max * 1.1) // 增加10%的空间
})

// 计算图表点坐标
const chartPoints = computed(() => {
  const width = chartWidth.value - chartPadding.left - chartPadding.right
  const height = chartHeight.value - chartPadding.top - chartPadding.bottom

  const getPoints = (data) => {
    if (!data || data.length === 0) return []
    return data.map((value, index) => {
      const x = chartPadding.left + (width * index) / Math.max(1, data.length - 1)
      const y = chartPadding.top + height - (height * value) / maxValue.value
      return `${x},${y}`
    }).join(' ')
  }

  return {
    total: getPoints(trend.value.totalCounts),
    success: getPoints(trend.value.successCounts),
    failure: getPoints(trend.value.failureCounts)
  }
})

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {
      timeRange: filters.timeRange,
      successType: filters.successType
    }
    if (filters.videoStreamId) params.videoStreamId = filters.videoStreamId
    if (filters.ruleId) params.ruleId = filters.ruleId

    // 获取摘要数据
    const summaryRes = await getStatisticsSummary(params)
    if (summaryRes.code === 200) {
      summary.value = summaryRes.data
    }

    // 获取趋势数据
    const trendRes = await getStatisticsTrend(params)
    if (trendRes.code === 200) {
      trend.value = trendRes.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取视频流列表
const fetchStreams = async () => {
  try {
    const res = await getStreamList()
    if (res.code === 200) {
      streamList.value = res.data || []
      statsInfo.value.totalStreams = streamList.value.length
      statsInfo.value.enabledStreams = streamList.value.filter(s => s.enabled === 1).length
    }
  } catch (error) {
    console.error('获取视频流列表失败:', error)
  }
}

// 获取规则列表
const fetchRules = async () => {
  try {
    const res = await getRuleList()
    if (res.code === 200) {
      ruleList.value = res.data || []
      statsInfo.value.totalRules = ruleList.value.length
      statsInfo.value.enabledRules = ruleList.value.filter(r => r.enabled === 1).length
    }
  } catch (error) {
    console.error('获取规则列表失败:', error)
  }
}

// 获取模型列表
const fetchModels = async () => {
  try {
    const res = await getModelList()
    if (res.code === 200) {
      modelList.value = res.data || []
      statsInfo.value.totalModels = modelList.value.length
      statsInfo.value.enabledModels = modelList.value.filter(m => m.enabled === 1).length
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
  }
}

// 监听筛选器变化
watch(filters, () => {
  fetchStatistics()
}, { deep: true })

// 更新图表尺寸
const updateChartSize = () => {
  if (chartSvg.value) {
    chartWidth.value = chartSvg.value.parentElement.offsetWidth
  }
}

let refreshTimer = null

onMounted(async () => {
  await Promise.all([
    fetchStreams(),
    fetchRules(),
    fetchModels(),
    fetchStatistics()
  ])

  updateChartSize()
  window.addEventListener('resize', updateChartSize)

  // 每30秒自动刷新
  refreshTimer = setInterval(() => {
    fetchStatistics()
  }, 30000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pie-success,
.pie-failure {
  transition: all 0.6s ease-out;
  animation: drawPie 1.2s ease-out;
}

@keyframes drawPie {
  from {
    stroke-dasharray: 0 1000;
  }
  to {
    stroke-dasharray: var(--final-dash);
  }
}

.chart-line {
  animation: drawLine 1.5s ease-out;
}

@keyframes drawLine {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}

.chart-dot {
  animation: popIn 0.6s ease-out;
  cursor: pointer;
  transition: r 0.3s ease;
}

.chart-dot:hover {
  r: 6;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
