<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 侧边导航栏 -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col">
      <div class="p-4">
        <h1 class="text-2xl font-bold">AI识别系统</h1>
      </div>
      <nav class="mt-8 flex-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 hover:bg-gray-700 transition-colors"
          :class="{ 'bg-gray-700': $route.path === item.path }"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span class="ml-3">{{ item.title }}</span>
        </router-link>
      </nav>
      <!-- 登出按钮 -->
      <div class="p-4 border-t border-gray-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center px-6 py-3 hover:bg-gray-700 rounded transition-colors"
        >
          <span class="text-lg">🚪</span>
          <span class="ml-3">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <div class="p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logout } from '../api/auth'
import { removeToken } from '../utils/auth'
import { showSuccess, showError } from '../utils/message'

const router = useRouter()

const menuItems = [
  { path: '/dashboard', title: '监控画面墙', icon: '📺' },
  { path: '/models', title: '大模型管理', icon: '🤖' },
  { path: '/rules', title: '规则管理', icon: '📋' },
  { path: '/streams', title: '视频流管理', icon: '📹' },
  { path: '/stream-rules', title: '视频流规则管理', icon: '🔗' }
]

const handleLogout = async () => {
  if (!confirm('确定要退出登录吗？')) return

  try {
    await logout()
    removeToken()
    showSuccess('已退出登录')
    router.push('/login')
  } catch (error) {
    // 即使调用失败也清除本地token
    removeToken()
    router.push('/login')
  }
}
</script>
