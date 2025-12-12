import request from './request'

// 获取所有视频流
export function getStreamList() {
  return request({
    url: '/api/stream/list',
    method: 'get'
  })
}

// 获取指定视频流
export function getStream(id) {
  return request({
    url: `/api/stream/${id}`,
    method: 'get'
  })
}

// 创建视频流
export function createStream(data) {
  return request({
    url: '/api/stream',
    method: 'post',
    data
  })
}

// 更新视频流
export function updateStream(data) {
  return request({
    url: '/api/stream',
    method: 'put',
    data
  })
}

// 删除视频流
export function deleteStream(id) {
  return request({
    url: `/api/stream/${id}`,
    method: 'delete'
  })
}

// 测试视频流捕获
export function testCapture(streamId) {
  return request({
    url: `/api/test/capture/${streamId}`,
    method: 'get'
  })
}
