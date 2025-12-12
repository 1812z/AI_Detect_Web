import request from './request'

// 登录
export function login(password) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data: { password }
  })
}

// 登出
export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

// 检查登录状态
export function checkAuth() {
  return request({
    url: '/api/auth/check',
    method: 'get'
  })
}
