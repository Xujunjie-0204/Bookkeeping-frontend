import request from './request'

export function getPurchasesApi(params) {
  return request({
    url: '/api/purchases',
    method: 'get',
    params: cleanQuery(params),
    paramsSerializer: {
      indexes: null
    }
  })
}

export function getPurchaseSummaryApi(params) {
  return request({
    url: '/api/purchases/summary',
    method: 'get',
    params: cleanQuery(params),
    paramsSerializer: {
      indexes: null
    }
  })
}

export function createPurchaseApi(data) {
  return request({
    url: '/api/purchases',
    method: 'post',
    data
  })
}

export function updatePurchaseApi(id, data) {
  return request({
    url: `/api/purchases/${id}`,
    method: 'put',
    data
  })
}

export function getPurchaseItemsApi(id) {
  return request({
    url: `/api/purchases/${id}/items`,
    method: 'get'
  })
}

export function recognizePurchaseOcrApi(file) {
  const data = new FormData()
  data.append('file', file)
  return request({
    url: '/api/purchases/ocr',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deletePurchaseApi(id) {
  return request({
    url: `/api/purchases/${id}`,
    method: 'delete'
  })
}

function cleanQuery(params) {
  const query = { ...params }
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete query[key]
    }
  })
  return query
}
