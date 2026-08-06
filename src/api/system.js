import request from './request'

export function getMenuTreeApi() {
  return request({
    url: '/api/system/menus',
    method: 'get'
  })
}

export function createMenuApi(data) {
  return request({
    url: '/api/system/menus',
    method: 'post',
    data
  })
}

export function updateMenuApi(id, data) {
  return request({
    url: `/api/system/menus/${id}`,
    method: 'put',
    data
  })
}

export function deleteMenuApi(id) {
  return request({
    url: `/api/system/menus/${id}`,
    method: 'delete'
  })
}

export function getRolesApi() {
  return request({
    url: '/api/system/roles',
    method: 'get'
  })
}

export function createRoleApi(data) {
  return request({
    url: '/api/system/roles',
    method: 'post',
    data
  })
}

export function updateRoleApi(id, data) {
  return request({
    url: `/api/system/roles/${id}`,
    method: 'put',
    data
  })
}

export function deleteRoleApi(id) {
  return request({
    url: `/api/system/roles/${id}`,
    method: 'delete'
  })
}

export function getRoleMenuIdsApi(id) {
  return request({
    url: `/api/system/roles/${id}/menu-ids`,
    method: 'get'
  })
}

export function assignRoleMenusApi(id, menuIds) {
  return request({
    url: `/api/system/roles/${id}/menus`,
    method: 'put',
    data: { menuIds }
  })
}

export function getConfigsApi() {
  return request({
    url: '/api/system/configs',
    method: 'get'
  })
}

export function createConfigApi(data) {
  return request({
    url: '/api/system/configs',
    method: 'post',
    data
  })
}

export function updateConfigApi(id, data) {
  return request({
    url: `/api/system/configs/${id}`,
    method: 'put',
    data
  })
}

export function deleteConfigApi(id) {
  return request({
    url: `/api/system/configs/${id}`,
    method: 'delete'
  })
}
