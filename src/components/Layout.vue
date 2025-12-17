<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边导航栏 -->
    <aside class="w-64 bg-white shadow-lg flex flex-col">
      <!-- Logo 区域 -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md animate-pulse-slow">
            AI
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            识别系统
          </h1>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 py-6 px-3">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item group flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 ease-in-out"
          :class="route.path === item.path ? 'active' : ''"
        >
          <span class="nav-icon text-xl transition-transform duration-300 group-hover:scale-110">
            {{ item.icon }}
          </span>
          <span class="ml-3 font-medium">{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- Github 链接 -->
      <div class="p-4 border-t border-gray-100">
        <a
          href="https://github.com/1812z/AI_Detect"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group"
        >
          <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span class="ml-3 font-medium">Github</span>
        </a>
      </div>

      <!-- 登出按钮 -->
      <div class="p-4 border-t border-gray-100">
        <button
          @click="handleLogout"
          class="logout-btn w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group"
        >
          <span class="text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            🚪
          </span>
          <span class="ml-3 font-medium">退出登录</span>
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
import { useRouter, useRoute } from 'vue-router'
import { logout } from '../api/auth'
import { removeToken } from '../utils/auth'
import { showSuccess, showError } from '../utils/message'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/home', title: '数据统计', icon: '📊' },
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

<style scoped>
/* 导航项样式 */
.nav-item {
  color: #4B5563;
  position: relative;
  overflow: hidden;
}

/* 默认状态 */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 0.75rem;
  z-index: -1;
}

/* 悬浮效果 */
.nav-item:hover {
  color: #1F2937;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.nav-item:hover::before {
  opacity: 0.08;
}

/* 激活状态 */
.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.nav-item.active .nav-icon {
  animation: bounce-icon 0.6s ease;
}

/* Github 链接样式 */
.github-link {
  color: #1F2937;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.github-link:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.github-link:active {
  transform: translateY(0);
}

/* 登出按钮样式 */
.logout-btn {
  color: #EF4444;
  border: 1px solid #FEE2E2;
  background: #FEF2F2;
}

.logout-btn:hover {
  background: #FEE2E2;
  border-color: #FECACA;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  transform: translateY(-2px);
}

.logout-btn:active {
  transform: translateY(0);
}

/* 脉冲动画 - Logo */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 图标弹跳动画 */
@keyframes bounce-icon {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scale(1.2) translateY(-4px);
  }
  50% {
    transform: scale(1.1) translateY(-2px);
  }
  75% {
    transform: scale(1.15) translateY(-3px);
  }
}

/* 平滑过渡 */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
