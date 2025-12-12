import request from './request'

// 获取所有大模型配置
export function getModelList() {
  return request({
    url: '/api/model/list',
    method: 'get'
  })
}

// 获取指定大模型配置
export function getModel(id) {
  return request({
    url: `/api/model/${id}`,
    method: 'get'
  })
}

// 创建大模型配置
export function createModel(data) {
  return request({
    url: '/api/model',
    method: 'post',
    data
  })
}

// 更新大模型配置
export function updateModel(data) {
  return request({
    url: '/api/model',
    method: 'put',
    data
  })
}

// 删除大模型配置
export function deleteModel(id) {
  return request({
    url: `/api/model/${id}`,
    method: 'delete'
  })
}
