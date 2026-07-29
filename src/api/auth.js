import request from './request'

export function loginApi(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getProfileApi() {
  return request({
    url: '/api/auth/profile',
    method: 'get'
  })
}

export function updateProfileApi(data) {
  return request({
    url: '/api/auth/profile',
    method: 'put',
    data
  })
}

export function changePasswordApi(data) {
  return request({
    url: '/api/auth/password',
    method: 'put',
    data
  })
}

export function logoutApi() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}
