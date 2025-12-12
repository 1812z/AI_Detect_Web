import request from './request'

// 获取所有识别规则
export function getRuleList() {
  return request({
    url: '/api/rule/list',
    method: 'get'
  })
}

// 获取指定识别规则
export function getRule(id) {
  return request({
    url: `/api/rule/${id}`,
    method: 'get'
  })
}

// 创建识别规则
export function createRule(data) {
  return request({
    url: '/api/rule',
    method: 'post',
    data
  })
}

// 更新识别规则
export function updateRule(data) {
  return request({
    url: '/api/rule',
    method: 'put',
    data
  })
}

// 删除识别规则
export function deleteRule(id) {
  return request({
    url: `/api/rule/${id}`,
    method: 'delete'
  })
}
