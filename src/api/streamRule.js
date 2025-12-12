import request from './request'

// 获取所有绑定关系
export function getStreamRuleList() {
  return request({
    url: '/api/stream-rule/list',
    method: 'get'
  })
}

// 获取指定绑定关系
export function getStreamRule(id) {
  return request({
    url: `/api/stream-rule/${id}`,
    method: 'get'
  })
}

// 创建绑定关系
export function createStreamRule(data) {
  return request({
    url: '/api/stream-rule',
    method: 'post',
    data
  })
}

// 更新绑定关系
export function updateStreamRule(data) {
  return request({
    url: '/api/stream-rule',
    method: 'put',
    data
  })
}

// 删除绑定关系
export function deleteStreamRule(id) {
  return request({
    url: `/api/stream-rule/${id}`,
    method: 'delete'
  })
}

// 获取指定视频流的所有规则
export function getStreamRulesByStream(streamId) {
  return request({
    url: `/api/stream-rule/by-stream/${streamId}`,
    method: 'get'
  })
}
