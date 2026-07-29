import request from './request'

export function getPurchasesApi(params) {
  return request({
    url: '/api/purchases',
    method: 'get',
    params
  })
}

export function createPurchaseApi(data) {
  return request({
    url: '/api/purchases',
    method: 'post',
    data
  })
}

export function deletePurchaseApi(id) {
  return request({
    url: `/api/purchases/${id}`,
    method: 'delete'
  })
}
