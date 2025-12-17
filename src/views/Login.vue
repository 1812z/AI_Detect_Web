<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">AI识别系统</h1>
        <p class="text-gray-600">请输入密码登录</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            后端地址
          </label>
          <input
            v-model="baseUrl"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="http://localhost:8080"
            required
            :disabled="loading"
          />
          <p class="text-xs text-gray-500 mt-1">请输入后端服务器地址</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码"
            required
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          <span v-if="!loading">登录</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
        </button>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { setToken } from '../utils/auth'
import { getBaseUrl, setBaseUrl } from '../utils/baseUrl'
import { updateBaseURL } from '../api/request'

const router = useRouter()
const baseUrl = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  // 加载已保存的后端地址
  baseUrl.value = getBaseUrl()
})

const handleLogin = async () => {
  if (!baseUrl.value) {
    errorMessage.value = '请输入后端地址'
    return
  }

  if (!password.value) {
    errorMessage.value = '请输入密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 保存并更新后端地址
    setBaseUrl(baseUrl.value)
    updateBaseURL(baseUrl.value)

    const res = await login(password.value)
    if (res.code === 200 && res.data && res.data.token) {
      // 保存token
      setToken(res.data.token)
      // 跳转到首页
      router.push('/home')
    } else {
      errorMessage.value = res.message || '登录失败'
    }

  } catch (error) {
    console.log(error)
    // 通过 code 判断密码错误
    if (error && error.code === 401) {
      errorMessage.value = error.message || '密码错误'
    } else {
      errorMessage.value = error.message || '登录失败，请检查后端地址是否正确'
    }
  } finally {
    loading.value = false
  }
}
</script>
