import request from './request'

export function getSalesApi(params) {
  return request({
    url: '/api/sales',
    method: 'get',
    params: cleanQuery(params)
  })
}

export function getSaleSummaryApi(params) {
  return request({
    url: '/api/sales/summary',
    method: 'get',
    params: cleanQuery(params)
  })
}

export function getSaleDetailApi(id) {
  return request({
    url: `/api/sales/${id}`,
    method: 'get'
  })
}

export function getAvailableSaleStockApi(params) {
  return request({
    url: '/api/sales/available-stock',
    method: 'get',
    params: cleanQuery(params),
    paramsSerializer: {
      serialize: serializeQuery
    }
  })
}

export function createSaleApi(data) {
  return request({
    url: '/api/sales',
    method: 'post',
    data
  })
}

export function updateSaleApi(id, data) {
  return request({
    url: `/api/sales/${id}`,
    method: 'put',
    data
  })
}

export function getSaleItemsApi(id) {
  return request({
    url: `/api/sales/${id}/items`,
    method: 'get'
  })
}

export function recognizeSaleOcrApi(file) {
  const data = new FormData()
  data.append('file', file)
  return request({
    url: '/api/sales/ocr',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getPendingGoofishOrdersApi(params = {}) {
  return request({ url: '/api/goofish/orders', method: 'get', params: { importStatus: 0, ...params } })
}

export function markGoofishOrderProcessedApi(id, saleRecordId) {
  return request({ url: `/api/goofish/orders/${id}/processed`, method: 'post', params: { saleRecordId } })
}

function cleanQuery(params) {
  const query = { ...params }
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (value === '' || value === null || value === undefined) {
      delete query[key]
    }
    if (Array.isArray(value) && value.length === 0) {
      delete query[key]
    }
  })
  return query
}

function serializeQuery(params) {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
      return
    }
    searchParams.append(key, value)
  })
  return searchParams.toString()
}
