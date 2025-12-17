import axios from 'axios'
import { getToken, removeToken } from '../utils/auth'
import { getBaseUrl } from '../utils/baseUrl'

const request = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 更新 baseURL 的函数
export function updateBaseURL(url) {
  request.defaults.baseURL = url
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 如果有响应数据，返回响应数据（包含code和message）
    if (error.response && error.response.data) {
      const res = error.response.data

      // 如果是401且不在登录页面，清除token并跳转
      if (error.response.status === 401 && window.location.pathname !== '/login') {
        removeToken()
        window.location.href = '/login'
      }

      return Promise.reject(res)
    }
    return Promise.reject(error)
  }
)

export default request
