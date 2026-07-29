import request from './request'

export function getProductsApi(params) {
  return request({
    url: '/api/products',
    method: 'get',
    params
  })
}

export function createProductApi(data) {
  return request({
    url: '/api/products',
    method: 'post',
    data
  })
}

export function updateProductApi(id, data) {
  return request({
    url: `/api/products/${id}`,
    method: 'put',
    data
  })
}

export function deleteProductApi(id) {
  return request({
    url: `/api/products/${id}`,
    method: 'delete'
  })
}

export function getProductTypeTreeApi() {
  return request({
    url: '/api/product-types',
    method: 'get'
  })
}

export function createProductTypeApi(data) {
  return request({
    url: '/api/product-types',
    method: 'post',
    data
  })
}

export function updateProductTypeApi(id, data) {
  return request({
    url: `/api/product-types/${id}`,
    method: 'put',
    data
  })
}

export function deleteProductTypeApi(id) {
  return request({
    url: `/api/product-types/${id}`,
    method: 'delete'
  })
}
