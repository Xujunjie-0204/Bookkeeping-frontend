import { defineStore } from 'pinia'
import { loginApi, getProfileApi, updateProfileApi, changePasswordApi, logoutApi } from '@/api/auth'

const TOKEN_KEY = 'bookkeeping_token'
const USER_KEY = 'bookkeeping_user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  }),
  actions: {
    async login(form) {
      const result = await loginApi(form)
      this.token = result.token
      this.user = result.user
      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      return result
    },
    async fetchProfile() {
      const profile = await getProfileApi()
      this.user = profile
      localStorage.setItem(USER_KEY, JSON.stringify(profile))
      return profile
    },
    async updateProfile(form) {
      const profile = await updateProfileApi(form)
      this.user = profile
      localStorage.setItem(USER_KEY, JSON.stringify(profile))
      return profile
    },
    async changePassword(form) {
      return changePasswordApi(form)
    },
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.clearSession()
      }
    },
    clearSession() {
      this.token = ''
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
})
