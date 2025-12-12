import request from './request'

// 查询指定规则的历史执行记录
export function getLogs(ruleId, limit = 50) {
  return request({
    url: `/api/logs/${ruleId}`,
    method: 'get',
    params: { limit }
  })
}
