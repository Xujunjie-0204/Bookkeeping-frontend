import request from './request'

export function getInventoryApi(params) {
  return request({
    url: '/api/inventory',
    method: 'get',
    params: cleanQuery(params),
    paramsSerializer: {
      serialize: serializeQuery
    }
  })
}

export function getInventorySummaryApi(params) {
  return request({
    url: '/api/inventory/summary',
    method: 'get',
    params: cleanQuery(params),
    paramsSerializer: {
      serialize: serializeQuery
    }
  })
}

function cleanQuery(params) {
  const query = { ...params }
  if (Array.isArray(query.productTypeIds) && query.productTypeIds.length > 0) {
    delete query.productTypeId
  }
  Object.keys(query).forEach((key) => {
    const value = query[key]
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
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
