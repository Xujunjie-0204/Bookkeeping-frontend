<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/system/configs" router>
        <el-menu-item index="/dashboard"><el-icon><DataLine /></el-icon><span>统计大屏</span></el-menu-item>
        <el-sub-menu index="/product">
          <template #title><el-icon><Goods /></el-icon><span>商品管理</span></template>
          <el-menu-item index="/products"><el-icon><Goods /></el-icon><span>商品列表</span></el-menu-item>
          <el-menu-item index="/product-types"><el-icon><CollectionTag /></el-icon><span>商品类型</span></el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/purchases"><el-icon><ShoppingCart /></el-icon><span>采购进货</span></el-menu-item>
        <el-menu-item index="/sales"><el-icon><Sell /></el-icon><span>销售管理</span></el-menu-item>
        <el-menu-item index="/expenses"><el-icon><Money /></el-icon><span>经营支出</span></el-menu-item>
        <el-menu-item index="/inventory"><el-icon><Box /></el-icon><span>库存管理</span></el-menu-item>
        <el-menu-item index="/profile"><el-icon><User /></el-icon><span>个人中心</span></el-menu-item>
        <el-sub-menu index="/system">
          <template #title><el-icon><Setting /></el-icon><span>系统管理</span></template>
          <el-menu-item index="/system/menus"><el-icon><Menu /></el-icon><span>菜单管理</span></el-menu-item>
          <el-menu-item index="/system/roles"><el-icon><UserFilled /></el-icon><span>角色管理</span></el-menu-item>
          <el-menu-item index="/system/configs"><el-icon><Setting /></el-icon><span>系统配置</span></el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>系统管理</el-breadcrumb-item>
          <el-breadcrumb-item>系统配置</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="user-area">
          <span>{{ userStore.user?.nickname || userStore.user?.username || '管理员' }}</span>
          <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="dashboard-main">
        <section class="table-panel">
          <div class="table-toolbar">
            <div>
              <h2>系统配置</h2>
              <p>维护系统内置集合配置。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadConfigs">刷新</el-button>
            </div>
          </div>

          <el-tabs v-model="activeCode" class="config-tabs">
            <el-tab-pane
              v-for="config in collectionConfigs"
              :key="config.id"
              :label="config.configName"
              :name="config.configCode"
            >
              <div class="collection-config-panel">
                <div class="collection-config-head">
                  <div>
                    <h3>{{ config.configName }}</h3>
                    <span>共 {{ collectionItems.length }} 项</span>
                  </div>
                  <el-tag :type="config.status === 1 ? 'success' : 'info'" effect="plain">
                    {{ config.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </div>

                <div class="employee-tags">
                  <el-tag
                    v-for="item in collectionItems"
                    :key="item"
                    class="employee-tag"
                    closable
                    @close="removeCollectionItem(item)"
                  >
                    {{ item }}
                  </el-tag>
                  <span v-if="!collectionItems.length" class="empty-collection">暂无{{ activeConfig?.configName || '配置' }}</span>
                </div>

                <div class="employee-input-row">
                  <el-input
                    v-model.trim="collectionInput"
                    maxlength="40"
                    :placeholder="`输入${activeConfig?.configName || '配置'}名称`"
                    @keyup.enter="addCollectionItem"
                  />
                  <el-button type="primary" :icon="Plus" @click="addCollectionItem">添加</el-button>
                </div>

                <div class="collection-actions">
                  <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
                  <el-button @click="resetActiveConfig">重置</el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <el-empty v-if="!loading && !collectionConfigs.length" description="暂无集合配置" />
        </section>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Box,
  CollectionTag,
  DataLine,
  Goods,
  Menu,
  Money,
  Plus,
  Refresh,
  Sell,
  Setting,
  ShoppingCart,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { getConfigsApi, updateConfigApi } from '@/api/system'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const configs = ref([])
const activeCode = ref('')
const loading = ref(false)
const saving = ref(false)
const collectionInput = ref('')

const editForm = reactive(defaultForm())

const collectionConfigs = computed(() => {
  return configs.value.filter((config) => parseCollectionOrNull(config.configValue) !== null)
})

const activeConfig = computed(() => {
  return collectionConfigs.value.find((item) => item.configCode === activeCode.value) || null
})

const collectionItems = computed(() => {
  return parseCollection(editForm.configValue)
})

watch(activeConfig, (config) => {
  fillEditForm(config)
})

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadConfigs()
})

async function loadConfigs() {
  loading.value = true
  try {
    configs.value = await getConfigsApi()
    if (!collectionConfigs.value.some((config) => config.configCode === activeCode.value)) {
      activeCode.value = collectionConfigs.value[0]?.configCode || ''
    }
    fillEditForm(activeConfig.value)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!activeConfig.value || saving.value) {
    return
  }
  saving.value = true
  try {
    const saved = await updateConfigApi(activeConfig.value.id, {
      configCode: editForm.configCode,
      configName: editForm.configName,
      configValue: editForm.configValue,
      status: editForm.status,
      remark: editForm.remark || ''
    })
    ElMessage.success('集合配置已保存')
    activeCode.value = saved.configCode
    await loadConfigs()
  } finally {
    saving.value = false
  }
}

function addCollectionItem() {
  const name = collectionInput.value.trim()
  if (!name) {
    return
  }
  const next = [...collectionItems.value]
  if (!next.includes(name)) {
    next.push(name)
  }
  collectionInput.value = ''
  editForm.configValue = JSON.stringify(next, null, 2)
}

function removeCollectionItem(item) {
  editForm.configValue = JSON.stringify(collectionItems.value.filter((value) => value !== item), null, 2)
}

function resetActiveConfig() {
  fillEditForm(activeConfig.value)
}

function fillEditForm(config) {
  Object.assign(editForm, config ? {
    id: config.id,
    configCode: config.configCode || '',
    configName: config.configName || '',
    configValue: JSON.stringify(parseCollection(config.configValue), null, 2),
    status: config.status ?? 1,
    remark: config.remark || ''
  } : defaultForm())
  collectionInput.value = ''
}

function parseCollection(value) {
  return parseCollectionOrNull(value) || []
}

function parseCollectionOrNull(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : null
  } catch (error) {
    return null
  }
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function defaultForm() {
  return {
    id: null,
    configCode: '',
    configName: '',
    configValue: '[]',
    status: 1,
    remark: ''
  }
}
</script>
