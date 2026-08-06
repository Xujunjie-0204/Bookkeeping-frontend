<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/dashboard" router>
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
          <el-breadcrumb-item>经营驾驶舱</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="user-area">
          <span>{{ userStore.user?.nickname || userStore.user?.username || '管理员' }}</span>
          <el-button :icon="SwitchButton" text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="dashboard-main cockpit-main" v-loading="loading">
        <div class="cockpit-action-bar">
          <span>经营概览</span>
          <el-button :icon="Refresh" @click="loadDashboard">刷新</el-button>
        </div>

        <section class="cockpit-filter">
          <el-form inline>
            <el-form-item label="时间">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateRangeChange"
              />
            </el-form-item>
            <el-form-item label="分类">
              <el-tree-select
                class="dashboard-type-select"
                v-model="selectedProductTypeId"
                :data="productTypeOptions"
                :props="{ label: 'typeName', value: 'id', children: 'children' }"
                check-strictly
                clearable
                placeholder="全部分类"
                @change="handleTypeChange"
              />
            </el-form-item>
            <el-form-item label="商品">
              <div class="selected-product-filter">
                <el-button :icon="Goods" @click="openProductPicker">
                  {{ query.productIds.length ? `已选 ${query.productIds.length} 个商品` : '选择商品' }}
                </el-button>
                <el-button v-if="query.productIds.length" text type="danger" @click="clearSelectedProducts">清空</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadDashboard">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
          <div v-if="selectedProducts.length" class="selected-product-tags">
            <el-tag v-for="product in selectedProducts" :key="product.id" closable @close="removeSelectedProduct(product.id)">
              {{ product.productName }}
            </el-tag>
          </div>
        </section>

        <el-row :gutter="12" class="cockpit-stat-row">
          <el-col v-for="card in statCards" :key="card.title" :xs="24" :sm="12" :md="6" :lg="3">
            <StatisticCard :title="card.title" :value="card.value" :type="card.type" :icon="card.icon" :tone="card.tone" />
          </el-col>
        </el-row>

        <el-row :gutter="16" class="cockpit-section">
          <el-col :xs="24" :lg="10">
            <el-card shadow="never" class="cockpit-card tax-card">
              <template #header>本季度销售额</template>
              <div class="tax-amount">￥{{ formatMoney(summary.quarterSale) }}</div>
              <el-progress :percentage="quarterProgress" :color="quarterColor" :stroke-width="16" />
              <div class="tax-meta">
                <span>{{ quarterProgress }}%</span>
                <strong>距离30万元：￥{{ formatMoney(summary.quarterRemain) }}</strong>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="14">
            <el-card shadow="never" class="cockpit-card">
              <template #header>预计经营利润</template>
              <div class="tax-reference-grid">
                <div><span>预计利润</span><strong>￥{{ formatMoney(summary.quarterProfit) }}</strong></div>
                <div><span>预计成本</span><strong>￥{{ formatMoney(summary.inventoryCost) }}</strong></div>
                <div><span>预计费用</span><strong>￥10720.00</strong></div>
                <div><span>预计税务提醒</span><strong>经营参考</strong></div>
              </div>
              <p class="tax-note">销售额接近季度目标时，建议关注开票、费用归集和现金流安排。</p>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="cockpit-section">
          <el-col :xs="24" :lg="8"><el-card shadow="never" class="cockpit-card"><template #header>最近30天销售趋势</template><SalesTrendChart :data="charts.salesTrend" /></el-card></el-col>
          <el-col :xs="24" :lg="8"><el-card shadow="never" class="cockpit-card"><template #header>最近30天利润趋势</template><ProfitTrendChart :data="charts.profitTrend" /></el-card></el-col>
          <el-col :xs="24" :lg="8"><el-card shadow="never" class="cockpit-card"><template #header>经营费用占比</template><ExpensePieChart :data="charts.expensePie" /></el-card></el-col>
        </el-row>

        <el-row :gutter="16" class="cockpit-section">
          <el-col :xs="24" :lg="12"><el-card shadow="never" class="cockpit-card top-rank-card"><template #header>商品销量TOP30</template><TopTable :data="top.productSalesTop" mode="sales" /></el-card></el-col>
          <el-col :xs="24" :lg="12"><el-card shadow="never" class="cockpit-card top-rank-card"><template #header>商品利润TOP30</template><TopTable :data="top.productProfitTop" mode="profit" /></el-card></el-col>
          <el-col :xs="24" :lg="12"><el-card shadow="never" class="cockpit-card"><template #header>库存预警</template><InventoryWarning :data="top.inventoryWarning" /></el-card></el-col>
          <el-col :xs="24" :lg="12"><el-card shadow="never" class="cockpit-card"><template #header>AI经营建议</template><AISuggestion :data="top.aiSuggestion" /></el-card></el-col>
        </el-row>

        <el-dialog v-model="productPickerVisible" title="选择商品" width="min(960px, calc(100vw - 64px))">
          <div class="product-picker">
            <aside class="product-picker-types">
              <el-button class="product-picker-all" :type="pickerTypeId === null ? 'primary' : 'default'" @click="handlePickerTypeChange(null)">
                全部商品
              </el-button>
              <el-tree
                :data="productTypeOptions"
                :props="{ label: 'typeName', children: 'children' }"
                node-key="id"
                highlight-current
                default-expand-all
                @node-click="handlePickerTypeChange"
              />
            </aside>

            <section class="product-picker-products">
              <div class="product-picker-toolbar">
                <el-input v-model.trim="pickerKeyword" clearable placeholder="请输入商品编码/名称/型号" />
                <span>已选 {{ pickerCheckedIds.length }} 个</span>
              </div>

              <el-checkbox-group v-model="pickerCheckedIds" class="product-picker-list">
                <label v-for="product in pickerProducts" :key="product.id" class="product-picker-item">
                  <el-checkbox :label="product.id">
                    <strong>{{ product.productName }}</strong>
                    <span>{{ product.productCode || '-' }}</span>
                    <small>{{ [product.productTypeName, product.brand, product.model, product.specification].filter(Boolean).join(' / ') }}</small>
                  </el-checkbox>
                </label>
              </el-checkbox-group>
            </section>
          </div>

          <template #footer>
            <el-button @click="productPickerVisible = false">取消</el-button>
            <el-button @click="pickerCheckedIds = []">清空选择</el-button>
            <el-button type="primary" @click="confirmProductPicker">确认</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Box, CollectionTag, Coin, DataLine, Goods, Menu, Money, Refresh, RefreshLeft, Search, Setting, Sell, ShoppingCart, SwitchButton, TrendCharts, User, UserFilled } from '@element-plus/icons-vue'
import { getDashboardChartsApi, getDashboardSummaryApi, getDashboardTopApi } from '@/api/dashboard'
import { getProductsApi, getProductTypeTreeApi } from '@/api/product'
import { useUserStore } from '@/stores/user'
import StatisticCard from './components/StatisticCard.vue'
import SalesTrendChart from './components/SalesTrendChart.vue'
import ProfitTrendChart from './components/ProfitTrendChart.vue'
import ExpensePieChart from './components/ExpensePieChart.vue'
import TopTable from './components/TopTable.vue'
import InventoryWarning from './components/InventoryWarning.vue'
import AISuggestion from './components/AISuggestion.vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const productTypeOptions = ref([])
const productOptions = ref([])
const selectedProductTypeId = ref(null)
const productPickerVisible = ref(false)
const pickerTypeId = ref(null)
const pickerKeyword = ref('')
const pickerCheckedIds = ref([])
const dateRange = ref(currentMonthRange())

const query = reactive({
  startDate: dateRange.value[0],
  endDate: dateRange.value[1],
  productIds: [],
  productTypeIds: []
})

const summary = reactive({
  todaySale: 0,
  todayProfit: 0,
  monthSale: 0,
  monthProfit: 0,
  quarterSale: 0,
  quarterProfit: 0,
  inventoryQuantity: 0,
  inventoryCost: 0,
  quarterTarget: 300000,
  quarterRemain: 0,
  quarterPercent: 0
})

const charts = reactive({
  salesTrend: [],
  profitTrend: [],
  expensePie: []
})

const top = reactive({
  productSalesTop: [],
  productProfitTop: [],
  inventoryWarning: [],
  aiSuggestion: []
})

const selectedProducts = computed(() => {
  return productOptions.value.filter((product) => query.productIds.includes(product.id))
})

const pickerProducts = computed(() => {
  const keyword = pickerKeyword.value.toLowerCase()
  const typeIds = pickerTypeId.value === null ? [] : collectTypeIds(productTypeOptions.value, pickerTypeId.value)
  return productOptions.value.filter((product) => {
    const matchType = pickerTypeId.value === null || typeIds.includes(product.productTypeId)
    const text = [
      product.productCode,
      product.productName,
      product.productTypeName,
      product.brand,
      product.model,
      product.specification
    ].filter(Boolean).join(' ').toLowerCase()
    return matchType && (!keyword || text.includes(keyword))
  })
})

const statCards = computed(() => [
  { title: '今日销售额', value: summary.todaySale, icon: TrendCharts, tone: 'sale' },
  { title: '今日利润', value: summary.todayProfit, icon: Coin, tone: 'profit' },
  { title: '本月销售额', value: summary.monthSale, icon: TrendCharts, tone: 'sale' },
  { title: '本月利润', value: summary.monthProfit, icon: Coin, tone: 'profit' },
  { title: '本季度销售额', value: summary.quarterSale, icon: DataLine, tone: 'sale' },
  { title: '本季度利润', value: summary.quarterProfit, icon: Coin, tone: 'profit' },
  { title: '当前库存数量', value: summary.inventoryQuantity, type: 'quantity', icon: Box, tone: 'inventory' },
  { title: '当前库存成本', value: summary.inventoryCost, icon: Box, tone: 'inventory' }
])

const quarterProgress = computed(() => Math.min(Number(summary.quarterPercent || 0), 100))
const quarterColor = computed(() => {
  const percent = Number(summary.quarterPercent || 0)
  if (percent > 100) return '#ef4444'
  if (percent >= 80) return '#f97316'
  if (percent >= 60) return '#f59e0b'
  return '#16a34a'
})

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProductTypes()
  loadProducts()
  loadDashboard()
})

async function loadDashboard() {
  loading.value = true
  const params = buildQueryParams()
  try {
    const [summaryData, chartData, topData] = await Promise.all([
      getDashboardSummaryApi(params),
      getDashboardChartsApi(params),
      getDashboardTopApi(params)
    ])
    Object.assign(summary, summaryData || {})
    Object.assign(charts, chartData || {})
    Object.assign(top, topData || {})
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  const result = await getProductsApi({
    pageNum: 1,
    pageSize: 500,
    status: 1
  })
  productOptions.value = result.list || []
}

async function loadProductTypes() {
  productTypeOptions.value = await getProductTypeTreeApi()
}

function buildQueryParams() {
  return {
    startDate: query.startDate,
    endDate: query.endDate,
    productIds: [...query.productIds],
    productTypeIds: [...query.productTypeIds]
  }
}

function handleDateRangeChange(value) {
  query.startDate = value?.[0] || ''
  query.endDate = value?.[1] || ''
  loadDashboard()
}

function handleTypeChange(value) {
  query.productTypeIds = value ? collectTypeIds(productTypeOptions.value, value) : []
  loadDashboard()
}

function openProductPicker() {
  pickerCheckedIds.value = [...query.productIds]
  pickerTypeId.value = null
  pickerKeyword.value = ''
  productPickerVisible.value = true
}

function handlePickerTypeChange(node) {
  pickerTypeId.value = node?.id ?? null
}

function confirmProductPicker() {
  query.productIds = [...pickerCheckedIds.value]
  productPickerVisible.value = false
  loadDashboard()
}

function clearSelectedProducts() {
  query.productIds = []
  loadDashboard()
}

function removeSelectedProduct(productId) {
  query.productIds = query.productIds.filter((id) => id !== productId)
  loadDashboard()
}

function handleReset() {
  const range = currentMonthRange()
  dateRange.value = [...range]
  selectedProductTypeId.value = null
  query.startDate = range[0]
  query.endDate = range[1]
  query.productIds = []
  query.productTypeIds = []
  loadDashboard()
}

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = now
  return [formatDate(start), formatDate(end)]
}

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function collectTypeIds(nodes, targetId) {
  for (const node of nodes || []) {
    if (node.id === targetId) {
      return flattenTypeIds(node)
    }
    const childIds = collectTypeIds(node.children, targetId)
    if (childIds.length) {
      return childIds
    }
  }
  return []
}

function flattenTypeIds(node) {
  return [node.id, ...(node.children || []).flatMap((child) => flattenTypeIds(child))]
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}
</script>
