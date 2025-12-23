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

    <!-- 加载状态：使用 v-show 避免 DOM 销毁 -->
    <div v-show="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-4">加载中...</p>
    </div>

    <!-- 统计数据 -->
    <div v-show="!loading" class="transition-opacity duration-300">
      <!-- 顶部统计卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
            v-for="(card, index) in statCards"
            :key="index"
            class="stat-card rounded-xl shadow-lg p-4 transform transition-all duration-300 will-change-transform"
            :class="card.bgClass"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">{{ card.label }}</span>
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
              {{ card.icon }}
            </div>
          </div>
          <div class="text-2xl font-bold mb-1">{{ card.value || 0 }}</div>
          <div class="text-xs opacity-75">{{ card.subText }}</div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 饼图 -->
        <div class="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">执行统计</h3>
          <div class="flex flex-col items-center">
            <div class="relative w-48 h-48 mb-4">
              <svg viewBox="0 0 200 200" class="w-full h-full transform -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#F3F4F6" stroke-width="40" />
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
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-3xl font-bold text-gray-800">{{ (summary.successRate || 0).toFixed(1) }}%</div>
                <div class="text-sm text-gray-500">成功率</div>
              </div>
            </div>

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

        <!-- 折线图 -->
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
              <!-- 折线（带 transition） -->
              <polyline
                  v-if="chartPoints.total.length > 0"
                  :points="chartPoints.total"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="3"
                  stroke-linejoin="round"
                  class="chart-line"
              />
              <polyline
                  v-if="chartPoints.success.length > 0"
                  :points="chartPoints.success"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="3"
                  stroke-linejoin="round"
                  class="chart-line"
              />
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
              <g v-for="(point, index) in parsedPoints.total" :key="'dot-total-' + index">
                <circle
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="#3B82F6"
                    class="chart-dot"
                />
              </g>
              <g v-for="(point, index) in parsedPoints.success" :key="'dot-success-' + index">
                <circle
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="#10B981"
                    class="chart-dot"
                />
              </g>
              <g v-for="(point, index) in parsedPoints.failure" :key="'dot-failure-' + index">
                <circle
                    :cx="point.x"
                    :cy="point.y"
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

// 工具函数：防抖
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const filters = reactive({
  timeRange: '24h',
  successType: 'execution',
  videoStreamId: null,
  ruleId: null
})

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

const streamList = ref([])
const ruleList = ref([])
const modelList = ref([])

const statsInfo = ref({
  totalStreams: 0,
  enabledStreams: 0,
  totalRules: 0,
  enabledRules: 0,
  totalModels: 0,
  enabledModels: 0
})

const chartSvg = ref(null)
const chartWidth = ref(800)
const chartHeight = ref(400)
const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 }

// 卡片数据计算
const statCards = computed(() => [
  {
    label: '视频流',
    icon: '📹',
    value: statsInfo.value.totalStreams,
    subText: `已启用: ${statsInfo.value.enabledStreams}`,
    bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
  },
  {
    label: '识别规则',
    icon: '📋',
    value: statsInfo.value.totalRules,
    subText: `已启用: ${statsInfo.value.enabledRules}`,
    bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
  },
  {
    label: 'AI模型',
    icon: '🤖',
    value: statsInfo.value.totalModels,
    subText: `已启用: ${statsInfo.value.enabledModels}`,
    bgClass: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
  },
  {
    label: '执行总数',
    icon: '⚡',
    value: summary.value.totalCount,
    subText: filters.timeRange === '24h' ? '最近24小时' : '最近7天',
    bgClass: 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
  }
])

// 饼图计算
const totalCircumference = 2 * Math.PI * 80
const successCircumference = computed(() => {
  const total = summary.value.totalCount || 0
  return total ? (summary.value.successCount / total) * totalCircumference : 0
})
const failureCircumference = computed(() => {
  const total = summary.value.totalCount || 0
  return total ? (summary.value.failureCount / total) * totalCircumference : 0
})

// 图表最大值
const maxValue = computed(() => {
  const max = Math.max(
      ...trend.value.totalCounts,
      ...trend.value.successCounts,
      ...trend.value.failureCounts,
      1
  )
  return Math.ceil(max * 1.1)
})

// 解析点坐标（用于 circle）
const parsedPoints = computed(() => {
  const width = chartWidth.value - chartPadding.left - chartPadding.right
  const height = chartHeight.value - chartPadding.top - chartPadding.bottom

  const getPoints = (data) => {
    if (!data || data.length === 0) return []
    return data.map((value, index) => ({
      x: chartPadding.left + (width * index) / Math.max(1, data.length - 1),
      y: chartPadding.top + height - (height * value) / maxValue.value
    }))
  }

  return {
    total: getPoints(trend.value.totalCounts),
    success: getPoints(trend.value.successCounts),
    failure: getPoints(trend.value.failureCounts)
  }
})

// 折线 points 字符串（用于 polyline）
const chartPoints = computed(() => {
  const format = (points) => points.map(p => `${p.x},${p.y}`).join(' ')
  return {
    total: format(parsedPoints.value.total),
    success: format(parsedPoints.value.success),
    failure: format(parsedPoints.value.failure)
  }
})

// 获取统计数据（带防抖）
const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {
      timeRange: filters.timeRange,
      successType: filters.successType,
      ...(filters.videoStreamId && { videoStreamId: filters.videoStreamId }),
      ...(filters.ruleId && { ruleId: filters.ruleId })
    }

    const [summaryRes, trendRes] = await Promise.all([
      getStatisticsSummary(params),
      getStatisticsTrend(params)
    ])

    if (summaryRes.code === 200) summary.value = summaryRes.data
    if (trendRes.code === 200) trend.value = trendRes.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

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

// 监听筛选器（带防抖）
watch(filters, debounce(() => fetchStatistics(), 300), { deep: true })

const updateChartSize = () => {
  if (chartSvg.value) {
    chartWidth.value = chartSvg.value.parentElement.offsetWidth
  }
}

let refreshTimer = null

onMounted(async () => {
  await Promise.all([fetchStreams(), fetchRules(), fetchModels(), fetchStatistics()])
  updateChartSize()
  window.addEventListener('resize', updateChartSize)

  // 自动刷新（带防抖）
  const debouncedRefresh = debounce(fetchStatistics, 500)
  refreshTimer = setInterval(debouncedRefresh, 30000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.stat-card {
  animation: fadeInUp 0.6s ease-out;
  will-change: transform;
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

/* 关键：移除入场动画，改用 transition 平滑更新 */
.pie-success,
.pie-failure {
  transition: stroke-dasharray 0.6s ease-out;
  transform: translateZ(0); /* 启用 GPU 加速 */
}

.chart-line {
  transition: points 0.6s ease-out;
  transform: translateZ(0);
}

.chart-dot {
  transition: r 0.3s ease, transform 0.3s ease;
  transform: translateZ(0);
  cursor: pointer;
}

.chart-dot:hover {
  r: 6;
}
</style>
