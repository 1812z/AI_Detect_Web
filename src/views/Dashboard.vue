<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">监控画面墙</h2>
      <p class="text-gray-600 mt-1">实时监控所有视频流及识别结果</p>
    </div>

    <div v-if="monitorList.length === 0" class="text-center py-16">
      <div class="text-gray-400 text-lg">暂无启用的视频流监控</div>
      <router-link to="/streams" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">
        前往配置视频流
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="monitor in monitorList"
        :key="monitor.streamId"
        class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      >
        <!-- 视频流画面 -->
        <div class="relative bg-gray-900 aspect-video">
          <!-- HTTP图片流 -->
          <img
            v-if="isImageUrl(monitor.streamUrl)"
            :src="monitor.streamUrl"
            class="w-full h-full object-cover"
            :alt="monitor.streamName"
            @error="handleImageError"
          />
          <!-- 视频流 (HLS/FLV等) -->
          <video
            v-else-if="isVideoUrl(monitor.streamUrl)"
            :src="monitor.streamUrl"
            class="w-full h-full object-cover"
            autoplay
            muted
            loop
            @error="handleVideoError"
          ></video>
          <!-- RTSP或其他不支持的流 -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <div class="text-center px-4">
              <p class="text-sm">无法直接播放此类型视频流</p>
              <p class="text-xs mt-1">{{ monitor.streamUrl }}</p>
            </div>
          </div>

          <!-- 视频流名称标签 -->
          <div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm font-medium">
            {{ monitor.streamName }}
          </div>

          <!-- 最后更新时间 -->
          <div class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            {{ formatTime(monitor.lastUpdate) }}
          </div>
        </div>

        <!-- 识别结果区域 -->
        <div class="p-4">
          <div v-if="monitor.rules.length === 0" class="text-gray-400 text-sm text-center py-2">
            未绑定识别规则
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="rule in monitor.rules"
              :key="rule.ruleId"
              class="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <!-- 规则名称 -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-500 font-medium">{{ rule.ruleName }}</span>
                <span
                  v-if="rule.latestLog"
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    rule.latestLog.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ rule.latestLog.status === 'SUCCESS' ? '✓ 成功' : '✗ 失败' }}
                </span>
              </div>

              <!-- 识别结果 -->
              <div v-if="rule.latestLog">
                <div v-if="rule.latestLog.status === 'SUCCESS' && rule.latestLog.result">
                  <div class="bg-gray-50 rounded p-2 text-sm">
                    <div v-if="rule.parsedResult" class="space-y-1">
                      <div
                        v-for="(value, key) in rule.parsedResult"
                        :key="key"
                        class="flex justify-between gap-2"
                      >
                        <span class="text-gray-600 flex-shrink-0">{{ formatKey(key) }}:</span>
                        <span
                          class="font-medium text-gray-900 truncate text-right"
                          :title="String(formatValue(value))"
                        >
                          {{ formatValue(value) }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="text-gray-500 text-xs truncate" :title="rule.latestLog.result">
                      {{ rule.latestLog.result }}
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    耗时: {{ rule.latestLog.duration }}ms
                  </div>
                </div>
                <div v-else-if="rule.latestLog.status === 'FAIL'" class="text-sm text-red-600">
                  {{ rule.latestLog.errorMessage || '识别失败' }}
                </div>
              </div>
              <div v-else class="text-xs text-gray-400">
                等待首次识别...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getStreamList } from '../api/stream'
import { getStreamRulesByStream } from '../api/streamRule'
import { getRuleList } from '../api/rule'
import { getLogs } from '../api/log'

const monitorList = ref([])
let refreshTimer = null
let imageRefreshTimer = null

const fetchMonitorData = async () => {
  try {
    // 获取所有启用的视频流
    const streamRes = await getStreamList()
    const enabledStreams = (streamRes.data || []).filter(s => s.enabled === 1)

    // 获取所有规则（用于查找规则名称）
    const ruleRes = await getRuleList()
    const allRules = ruleRes.data || []

    // 为每个视频流构建监控数据
    const monitors = []
    for (const stream of enabledStreams) {
      const monitor = {
        streamId: stream.id,
        streamName: stream.name,
        streamUrl: stream.streamUrl,
        timestamp: Date.now(),
        lastUpdate: new Date(),
        rules: []
      }

      // 获取绑定的规则
      try {
        const bindingRes = await getStreamRulesByStream(stream.id)
        const bindings = (bindingRes.data || []).filter(b => b.enabled === 1)

        for (const binding of bindings) {
          const rule = allRules.find(r => r.id === binding.aiRuleId)
          if (rule) {
            const ruleInfo = {
              ruleId: rule.id,
              ruleName: rule.name,
              latestLog: null,
              parsedResult: null
            }

            // 获取该规则的最新日志
            try {
              const logRes = await getLogs(rule.id, 1)
              if (logRes.data && logRes.data.length > 0) {
                const log = logRes.data[0]
                ruleInfo.latestLog = log

                // 尝试解析 JSON 结果
                if (log.result) {
                  try {
                    ruleInfo.parsedResult = JSON.parse(log.result)
                  } catch (e) {
                    // 解析失败，保持原始字符串
                  }
                }
              }
            } catch (e) {
              console.error(`获取规则 ${rule.id} 日志失败:`, e)
            }

            monitor.rules.push(ruleInfo)
          }
        }
      } catch (e) {
        console.error(`获取视频流 ${stream.id} 绑定规则失败:`, e)
      }

      monitors.push(monitor)
    }

    monitorList.value = monitors
  } catch (error) {
    console.error('获取监控数据失败:', error)
  }
}

// 刷新图片流的时间戳
const refreshImageTimestamp = () => {
  monitorList.value.forEach(monitor => {
    if (isImageUrl(monitor.streamUrl)) {
      monitor.timestamp = Date.now()
      monitor.lastUpdate = new Date()
    }
  })
}

// 判断是否为图片URL
const isImageUrl = (url) => {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  // HTTP/HTTPS 图片URL，或者不包含常见视频流扩展名
  return (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) &&
         !lowerUrl.includes('.m3u8') &&
         !lowerUrl.includes('.flv') &&
         !lowerUrl.startsWith('rtsp://')
}

// 判断是否为视频URL
const isVideoUrl = (url) => {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return lowerUrl.includes('.m3u8') || lowerUrl.includes('.flv')
}

const handleImageError = (e) => {
  console.error('图片加载失败:', e.target.src)
}

const handleVideoError = (e) => {
  console.error('视频加载失败:', e.target.src)
}

const formatTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  return date.toLocaleTimeString('zh-CN')
}

const formatKey = (key) => {
  const keyMap = {
    'has_fall': '摔倒检测',
    'confidence': '置信度',
    'description': '描述',
    'person_count': '人数',
    'has_abnormal': '异常行为',
    'behavior_type': '行为类型',
    'has_fire': '火灾检测',
    'has_smoke': '烟雾检测',
    'person_position': '人物位置'
  }
  return keyMap[key] || key
}

const formatValue = (value) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (typeof value === 'number') {
    return value
  }
  return value
}

onMounted(() => {
  fetchMonitorData()

  // 每10秒刷新一次数据和日志
  refreshTimer = setInterval(() => {
    fetchMonitorData()
  }, 10000)

  // 每3秒刷新一次图片流（更新时间戳强制重新加载）
  imageRefreshTimer = setInterval(() => {
    refreshImageTimestamp()
  }, 3000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (imageRefreshTimer) {
    clearInterval(imageRefreshTimer)
  }
})
</script>
