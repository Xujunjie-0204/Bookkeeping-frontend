<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/profile" router>
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>统计大屏</span>
        </el-menu-item>
        <el-sub-menu index="/product">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品列表</span>
          </el-menu-item>
          <el-menu-item index="/product-types">
            <el-icon><CollectionTag /></el-icon>
            <span>商品类型</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/purchases">
          <el-icon><ShoppingCart /></el-icon>
          <span>采购进货</span>
        </el-menu-item>
        <el-menu-item index="/sales"><el-icon><Sell /></el-icon><span>销售管理</span></el-menu-item>
        <el-menu-item index="/expenses"><el-icon><Money /></el-icon><span>经营支出</span></el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/menus">
            <el-icon><Menu /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/system/roles">
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/system/configs">
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="user-area">
          <span>{{ userStore.user?.nickname || userStore.user?.username || '管理员' }}</span>
          <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="dashboard-main">
        <section class="profile-layout">
          <div class="profile-panel">
            <div class="panel-heading">
              <h2>个人信息详情</h2>
              <el-button :icon="Refresh" text :loading="loadingProfile" @click="loadProfile">刷新</el-button>
            </div>

            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">{{ profile?.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ profile?.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="昵称">{{ profile?.nickname || '-' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ profile?.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="账号状态">
                <el-tag :type="profile?.status === 1 ? 'success' : 'danger'">
                  {{ profile?.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="上次登录">
                {{ formatDateTime(profile?.lastLoginAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="profile-panel">
            <div class="panel-heading">
              <h2>修改个人信息</h2>
            </div>

            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="90px">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model.trim="profileForm.nickname" maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model.trim="profileForm.phone" maxlength="20" placeholder="可不填" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
                  保存信息
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="profile-panel">
            <div class="panel-heading">
              <h2>修改密码</h2>
            </div>

            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="90px">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  show-password
                  @keyup.enter="handleChangePassword"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingPassword" @click="handleChangePassword">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </section>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, CollectionTag, DataLine, Goods, Menu, Money, Refresh, Setting, Sell, ShoppingCart, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const profileFormRef = ref()
const passwordFormRef = ref()
const profile = ref(null)
const loadingProfile = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({
  nickname: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 50, message: '昵称长度不能超过50位', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^$|^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 100, message: '新密码长度需为6-100位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的新密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

onMounted(loadProfile)

async function loadProfile() {
  loadingProfile.value = true
  try {
    profile.value = await userStore.fetchProfile()
    profileForm.nickname = profile.value.nickname || ''
    profileForm.phone = profile.value.phone || ''
  } finally {
    loadingProfile.value = false
  }
}

async function handleSaveProfile() {
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid || savingProfile.value) {
    return
  }
  savingProfile.value = true
  try {
    profile.value = await userStore.updateProfile(profileForm)
    profileForm.nickname = profile.value.nickname || ''
    profileForm.phone = profile.value.phone || ''
    ElMessage.success('个人信息已更新')
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid || savingPassword.value) {
    return
  }
  savingPassword.value = true
  try {
    await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.clearValidate()
    ElMessage.success('密码已修改')
  } finally {
    savingPassword.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ')
}
</script>






