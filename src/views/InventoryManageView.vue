<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/inventory" router>
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
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>库存管理</el-breadcrumb-item>
          <el-breadcrumb-item>当前库存</el-breadcrumb-item>
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
              <h2>库存管理</h2>
              <p>按商品汇总当前库存数量、锁定数量、已售数量和库存金额。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadInventory">刷新</el-button>
            </div>
          </div>

          <div class="inventory-layout">
            <aside class="inventory-type-panel">
              <div class="inventory-type-head">
                <strong>商品类型</strong>
                <el-button text type="primary" @click="handleTypeSelect(null)">全部</el-button>
              </div>
              <el-tree
                :data="productTypeOptions"
                :props="{ label: 'typeName', children: 'children' }"
                node-key="id"
                highlight-current
                default-expand-all
                :expand-on-click-node="false"
              >
                <template #default="{ node, data }">
                  <span class="inventory-type-node">
                    <span class="inventory-type-name" @click.stop="handleTypeNameClick(data, node)">
                      {{ data.typeName }}
                    </span>
                    <el-tooltip v-if="hasChildren(data)" content="查询该分类及下级" placement="top" effect="light">
                      <el-button class="inventory-type-query" text :icon="Search" @click.stop="handleTypeSelect(data)" />
                    </el-tooltip>
                  </span>
                </template>
              </el-tree>
            </aside>

            <section class="inventory-content">
              <el-form class="filter-bar inventory-filter" :model="query" label-position="left">
                <el-form-item label="关键词">
                  <el-input v-model.trim="query.keyword" clearable placeholder="商品编码/名称/品牌/型号" @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="只看预警">
                  <el-switch v-model="query.warningOnly" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
                  <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
                </el-form-item>
              </el-form>

              <div class="inventory-summary-grid">
                <div class="purchase-summary-card"><span>可用库存</span><strong>{{ summary.availableQuantity }}</strong></div>
                <div class="purchase-summary-card"><span>锁定库存</span><strong>{{ summary.lockedQuantity }}</strong></div>
                <div class="purchase-summary-card"><span>已售数量</span><strong>{{ summary.soldQuantity }}</strong></div>
                <div class="purchase-summary-card"><span>库存金额</span><strong>{{ formatMoney(summary.stockAmount) }}</strong></div>
              </div>

              <div class="table-scroll">
                <el-table v-loading="loading" :data="inventoryList" border>
                  <el-table-column prop="productCode" label="商品编码" min-width="130" />
                  <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="productTypeName" label="商品类型" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="brand" label="品牌" width="110" show-overflow-tooltip />
                  <el-table-column prop="model" label="型号" min-width="120" show-overflow-tooltip />
                  <el-table-column prop="initialQuantity" label="入库数量" width="100" />
                  <el-table-column prop="lockedQuantity" label="锁定库存" width="100" />
                  <el-table-column prop="soldQuantity" label="已售数量" width="100" />
                  <el-table-column prop="stockAmount" label="库存金额" width="120" />
                  <el-table-column label="状态" width="90">
                    <template #default="{ row }">
                      <el-tooltip :content="`当前库存：${row.availableQuantity || 0}，预警值：${row.warningStock || 0}`" placement="top" effect="light">
                        <el-tag :type="row.availableQuantity <= row.warningStock ? 'danger' : 'success'">
                          {{ row.availableQuantity <= row.warningStock ? '预警' : '正常' }}
                        </el-tag>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="pagination-bar">
                <el-pagination
                  v-model:current-page="query.pageNum"
                  v-model:page-size="query.pageSize"
                  :total="total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="loadInventory"
                  @current-change="loadInventory"
                />
              </div>
            </section>
          </div>
        </section>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Box, CollectionTag, DataLine, Goods, Menu, Money, Refresh, RefreshLeft, Search, Setting, Sell, ShoppingCart, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { getProductTypeTreeApi } from '@/api/product'
import { getInventoryApi, getInventorySummaryApi } from '@/api/inventory'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const inventoryList = ref([])
const productTypeOptions = ref([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  productTypeId: null,
  productTypeIds: [],
  warningOnly: false
})

const summary = reactive({
  availableQuantity: 0,
  lockedQuantity: 0,
  soldQuantity: 0,
  stockAmount: 0
})

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProductTypes()
  loadInventory()
})

async function loadInventory() {
  loading.value = true
  try {
    const [result, totalSummary] = await Promise.all([
      getInventoryApi(query),
      getInventorySummaryApi(query)
    ])
    inventoryList.value = result.list || []
    total.value = result.total || 0
    Object.assign(summary, {
      availableQuantity: totalSummary?.availableQuantity || 0,
      lockedQuantity: totalSummary?.lockedQuantity || 0,
      soldQuantity: totalSummary?.soldQuantity || 0,
      stockAmount: totalSummary?.stockAmount || 0
    })
  } finally {
    loading.value = false
  }
}

async function loadProductTypes() {
  productTypeOptions.value = await getProductTypeTreeApi()
}

function handleSearch() {
  query.pageNum = 1
  loadInventory()
}

function handleReset() {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    productTypeId: null,
    productTypeIds: [],
    warningOnly: false
  })
  loadInventory()
}

function handleTypeSelect(node) {
  query.productTypeId = node?.id || null
  query.productTypeIds = node ? collectTypeIds(node) : []
  query.pageNum = 1
  loadInventory()
}

function handleTypeNameClick(data, node) {
  if (hasChildren(data)) {
    node.expanded = !node.expanded
    return
  }
  handleTypeSelect(data)
}

function hasChildren(node) {
  return Array.isArray(node?.children) && node.children.length > 0
}

function collectTypeIds(node) {
  const ids = []
  const walk = (item) => {
    if (!item) {
      return
    }
    ids.push(item.id)
    ;(item.children || []).forEach(walk)
  }
  walk(node)
  return ids
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}
</script>






