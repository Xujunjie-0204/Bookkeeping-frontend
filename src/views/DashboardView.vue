<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/dashboard" router>
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
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>仪表盘</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="user-area">
          <span>{{ userStore.user?.nickname || userStore.user?.username || '管理员' }}</span>
          <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="dashboard-main">
        <section class="summary-grid">
          <div class="summary-card">
            <span>今日销售额</span>
            <strong>0.00</strong>
          </div>
          <div class="summary-card">
            <span>今日利润</span>
            <strong>0.00</strong>
          </div>
          <div class="summary-card">
            <span>本月销售额</span>
            <strong>0.00</strong>
          </div>
          <div class="summary-card">
            <span>当前库存数量</span>
            <strong>0</strong>
          </div>
        </section>

        <section class="empty-state">
          <h2>后台登录已接通</h2>
          <p>商品、采购、库存和销售页面会在后续阶段继续接入。</p>
        </section>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CollectionTag, DataLine, Goods, Menu, Setting, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
})

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}
</script>
