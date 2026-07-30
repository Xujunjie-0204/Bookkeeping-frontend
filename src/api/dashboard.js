import request from './request'

function normalizeParams(params = {}) {
  const query = { ...params }
  if (Array.isArray(query.productIds)) {
    query.productIds = query.productIds.join(',')
  }
  if (Array.isArray(query.productTypeIds)) {
    query.productTypeIds = query.productTypeIds.join(',')
  }
  return query
}

export function getDashboardSummaryApi(params) {
  return request({
    url: '/api/dashboard/summary',
    method: 'get',
    params: normalizeParams(params)
  })
}

export function getDashboardChartsApi(params) {
  return request({
    url: '/api/dashboard/charts',
    method: 'get',
    params: normalizeParams(params)
  })
}

export function getDashboardTopApi(params) {
  return request({
    url: '/api/dashboard/top',
    method: 'get',
    params: normalizeParams(params)
  })
}
