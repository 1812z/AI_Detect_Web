// Toast 容器管理
const toastContainer = []
const TOAST_GAP = 12 // toast 之间的间距
const TOAST_DURATION = 3000 // 显示时长

// 创建 toast 样式（仅执行一次）
let styleInjected = false
function injectStyles() {
  if (styleInjected) return
  styleInjected = true

  const style = document.createElement('style')
  style.textContent = `
    @keyframes toast-slide-in {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes toast-slide-out {
      from {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
      to {
        transform: translateX(400px) scale(0.9);
        opacity: 0;
      }
    }

    .toast-enter {
      animation: toast-slide-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .toast-exit {
      animation: toast-slide-out 0.3s cubic-bezier(0.4, 0, 1, 1);
    }

    .toast-item:hover {
      transform: translateX(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
  `
  document.head.appendChild(style)
}

// 更新所有 toast 的位置
function updateToastPositions() {
  let topOffset = 16 // 初始顶部偏移

  toastContainer.forEach((toast) => {
    if (toast.element && toast.element.parentNode) {
      toast.element.style.top = `${topOffset}px`
      topOffset += toast.element.offsetHeight + TOAST_GAP
    }
  })
}

// 移除 toast
function removeToast(toast) {
  if (!toast.element) return

  // 添加退出动画
  toast.element.classList.add('toast-exit')

  setTimeout(() => {
    if (toast.element && toast.element.parentNode) {
      toast.element.remove()
    }
    // 从容器中移除
    const index = toastContainer.indexOf(toast)
    if (index > -1) {
      toastContainer.splice(index, 1)
    }
    // 更新其他 toast 位置
    updateToastPositions()
  }, 300) // 等待退出动画完成
}

export function showMessage(message, type = 'success') {
  injectStyles()

  // 创建 toast 元素
  const div = document.createElement('div')

  // 设置图标
  const icon = type === 'success' ? '✓' : '✕'
  const iconBg = type === 'success'
    ? 'bg-white/20'
    : 'bg-white/20'
  const bgGradient = type === 'success'
    ? 'from-green-500 to-emerald-600'
    : 'from-red-500 to-rose-600'

  // 设置样式
  div.className = `toast-item toast-enter fixed right-4 px-5 py-4 rounded-2xl shadow-2xl z-50 bg-gradient-to-r ${bgGradient} text-white transition-all duration-300 ease-out flex items-center gap-3 min-w-[300px] max-w-[400px] backdrop-blur-sm`

  // 设置内容
  div.innerHTML = `
    <div class="flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center font-bold text-lg">
      ${icon}
    </div>
    <div class="flex-1 font-medium leading-tight">
      ${escapeHtml(message)}
    </div>
    <button class="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white" onclick="this.parentElement.click()">
      ✕
    </button>
  `

  // 添加关闭事件
  div.style.cursor = 'pointer'
  div.addEventListener('click', () => {
    removeToast(toast)
    if (toast.timer) clearTimeout(toast.timer)
  })

  // 添加到 DOM
  document.body.appendChild(div)

  // 创建 toast 对象
  const toast = {
    element: div,
    timer: null
  }

  // 添加到容器
  toastContainer.push(toast)

  // 更新位置
  updateToastPositions()

  // 设置自动移除定时器
  toast.timer = setTimeout(() => {
    removeToast(toast)
  }, TOAST_DURATION)
}

export function showSuccess(message) {
  showMessage(message, 'success')
}

export function showError(message) {
  showMessage(message, 'error')
}

// HTML 转义函数，防止 XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
