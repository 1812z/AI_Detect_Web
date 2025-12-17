import request from './request'

// 获取统计摘要
export function getStatisticsSummary(params) {
  return request({
    url: '/api/statistics/summary',
    method: 'get',
    params
  })
}

// 获取趋势数据
export function getStatisticsTrend(params) {
  return request({
    url: '/api/statistics/trend',
    method: 'get',
    params
  })
}
