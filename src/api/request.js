import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

let lastErrorMessage = ''
let lastErrorAt = 0

const service = axios.create({
  baseURL: '',
  timeout: 15000
})

service.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('application/octet-stream')) {
      return response
    }
    const body = response.data
    if (body && body.success === false) {
      showError(body.message || '操作失败')
      return Promise.reject(new Error(body.message || '操作失败'))
    }
    return body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '网络异常'
    if (status === 401) {
      const userStore = useUserStore()
      userStore.clearSession()
      router.replace('/login')
      showError('登录已失效，请重新登录')
    } else {
      showError(message)
    }
    return Promise.reject(error)
  }
)

function showError(message) {
  const now = Date.now()
  if (message === lastErrorMessage && now - lastErrorAt < 1500) {
    return
  }
  lastErrorMessage = message
  lastErrorAt = now
  ElMessage.error(message)
}

export default service
