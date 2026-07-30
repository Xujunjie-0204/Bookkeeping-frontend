<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/sales" router>
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
          <el-breadcrumb-item>销售管理</el-breadcrumb-item>
          <el-breadcrumb-item>销售订单</el-breadcrumb-item>
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
              <h2>销售管理</h2>
              <p>记录销售订单，明细绑定具体进货批次，保存后自动扣减库存并同步采购状态。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadSales">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增订单</el-button>
            </div>
          </div>

          <el-form class="filter-bar sale-filter" :model="query" label-position="left">
            <el-form-item label="关键词">
              <el-input v-model.trim="query.keyword" clearable placeholder="销售单号/平台订单号/买家/商品/采购单号" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="收款状态">
              <el-select v-model="query.paymentStatus" clearable placeholder="全部状态">
                <el-option label="未收款" :value="0" />
                <el-option label="已收款" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="发货状态">
              <el-select v-model="query.shipmentStatus" clearable placeholder="全部状态">
                <el-option label="未发货" :value="0" />
                <el-option label="已发货" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="销售时间">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateRangeChange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="sale-summary-grid">
            <div class="purchase-summary-card"><span>销售总金额</span><strong>{{ formatMoney(summary.totalSaleAmount) }}</strong></div>
            <div class="purchase-summary-card"><span>销售利润</span><strong>{{ formatMoney(summary.totalProfitAmount) }}</strong></div>
            <div class="purchase-summary-card"><span>毛利率</span><strong>{{ grossProfitRate(summary.totalProfitAmount, summary.totalSaleAmount) }}</strong></div>
            <div class="purchase-summary-card"><span>订单数</span><strong>{{ summary.orderCount || 0 }}</strong></div>
          </div>

          <div class="table-scroll">
            <el-table v-loading="loading" :data="sales" border>
              <el-table-column prop="recordNo" label="销售单号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="platform" label="平台" width="100" />
              <el-table-column label="商品名称" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-button class="link-button" text type="primary" @click="openSaleDetail(row)">{{ row.productName || '查看详情' }}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="purchaseNo" label="关联采购单" min-width="160" show-overflow-tooltip />
              <el-table-column prop="businessDate" label="销售日期" width="120" />
              <el-table-column prop="itemCount" label="数量" width="80" />
              <el-table-column prop="totalSaleAmount" label="销售金额" width="110" />
              <el-table-column prop="totalCostAmount" label="成本金额" width="110" />
              <el-table-column prop="profitAmount" label="利润" width="100" />
              <el-table-column label="毛利率" width="90">
                <template #default="{ row }">{{ grossProfitRate(row.profitAmount, row.totalSaleAmount) }}</template>
              </el-table-column>
              <el-table-column label="收款" width="90">
                <template #default="{ row }"><el-tag :type="row.paymentStatus === 1 ? 'success' : 'warning'">{{ row.paymentStatus === 1 ? '已收款' : '未收款' }}</el-tag></template>
              </el-table-column>
              <el-table-column label="发货" width="90">
                <template #default="{ row }"><el-tag :type="row.shipmentStatus === 1 ? 'success' : 'info'">{{ row.shipmentStatus === 1 ? '已发货' : '未发货' }}</el-tag></template>
              </el-table-column>
              <el-table-column label="备注" width="70" align="center">
                <template #default="{ row }">
                  <el-tooltip v-if="row.remark" :content="row.remark" placement="top" effect="light"><el-icon class="remark-icon"><InfoFilled /></el-icon></el-tooltip>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button :icon="InfoFilled" text @click="openSaleDetail(row)">详情</el-button>
                    <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                  </div>
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
              @size-change="loadSales"
              @current-change="loadSales"
            />
          </div>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑销售订单' : '新增销售订单'" width="min(1240px, calc(100vw - 64px))" class="sale-order-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="92px" class="sale-order-form">
        <div class="sale-form-sections">
          <section class="sale-form-section">
            <div class="sale-section-title">订单信息</div>
            <div class="sale-form-grid">
              <el-form-item label="销售平台" prop="platform">
                <el-select v-model="form.platform" filterable allow-create default-first-option placeholder="请选择">
                  <el-option label="闲鱼" value="闲鱼" />
                  <el-option label="转转" value="转转" />
                  <el-option label="淘宝" value="淘宝" />
                  <el-option label="京东" value="京东" />
                  <el-option label="线下" value="线下" />
                </el-select>
              </el-form-item>
              <el-form-item label="销售日期" prop="businessDate">
                <el-date-picker v-model="form.businessDate" type="date" value-format="YYYY-MM-DD" />
              </el-form-item>
              <el-form-item label="平台订单号"><el-input v-model.trim="form.platformOrderNo" maxlength="80" /></el-form-item>
              <el-form-item label="买家名称"><el-input v-model.trim="form.buyerName" maxlength="80" /></el-form-item>
              <el-form-item label="买家电话"><el-input v-model.trim="form.buyerPhone" maxlength="30" /></el-form-item>
            </div>
          </section>

          <section class="sale-form-section">
            <div class="sale-section-title">配送状态</div>
            <div class="sale-form-grid">
              <el-form-item label="收款状态">
                <el-select v-model="form.paymentStatus" placeholder="请选择">
                  <el-option label="未收款" :value="0" />
                  <el-option label="已收款" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="发货状态">
                <el-select v-model="form.shipmentStatus" placeholder="请选择">
                  <el-option label="未发货" :value="0" />
                  <el-option label="已发货" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="快递公司">
                <el-select v-model="form.expressCompany" clearable placeholder="请选择">
                  <el-option label="韵达" value="韵达" />
                  <el-option label="京东" value="京东" />
                  <el-option label="顺丰" value="顺丰" />
                </el-select>
              </el-form-item>
              <el-form-item label="快递单号"><el-input v-model.trim="form.expressNo" maxlength="80" /></el-form-item>
            </div>
          </section>

          <section v-if="!editingId" class="sale-form-section sale-fee-section">
            <div class="sale-section-title">费用设置</div>
            <div class="sale-fee-grid">
              <el-form-item label="无忧卖">
                <el-switch v-model="form.worryFreeSale" active-text="是" inactive-text="否" />
              </el-form-item>
              <el-form-item label="平台费用"><el-input-number v-model="form.platformFee" :min="0" :precision="2" :step="1" /></el-form-item>
              <el-form-item label="快递费"><el-input-number v-model="form.expressFee" :min="0" :precision="2" :step="1" /></el-form-item>
              <el-form-item label="包装费"><el-input-number v-model="form.otherExpense" :min="0" :precision="2" :step="1" /></el-form-item>
            </div>
          </section>
        </div>

        <div class="purchase-items-head sale-items-head">
          <div>
            <strong>销售明细</strong>
            <span>请选择具体进货单下的库存批次，保存后会自动扣减对应库存。</span>
          </div>
          <el-button v-if="!editingId" :icon="Plus" @click="openStockPicker">选择进货商品</el-button>
        </div>

        <div class="table-scroll sale-items-table">
          <el-table :data="form.items" border>
            <el-table-column prop="purchaseNo" label="采购单号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="productName" label="商品名称" min-width="170" show-overflow-tooltip />
            <el-table-column prop="deviceNo" label="设备编号" min-width="130" show-overflow-tooltip />
            <el-table-column prop="availableQuantity" label="可售库存" width="90" />
            <el-table-column prop="unitCost" label="成本" width="90" />
            <el-table-column label="数量" width="120">
              <template #default="{ row }"><el-input-number v-model="row.quantity" :min="1" :max="row.availableQuantity" :precision="0" :disabled="!!editingId" /></template>
            </el-table-column>
            <el-table-column label="销售单价" width="140">
              <template #default="{ row }"><el-input-number v-model="row.saleUnitPrice" :min="0" :precision="2" :step="1" :disabled="!!editingId" /></template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="{ row }">{{ lineSaleAmount(row) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }"><el-button :icon="Delete" text type="danger" :disabled="!!editingId" @click="removeSaleItem($index)">删除</el-button></template>
            </el-table-column>
          </el-table>
        </div>

        <el-form-item class="purchase-remark" label="备注">
          <el-input v-model.trim="form.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="sale-dialog-footer">
          <div class="sale-dialog-total">
            <span>销售金额 <strong>{{ formatMoney(formSaleAmount) }}</strong></span>
            <span v-if="!editingId">平台费用 <strong>{{ formatMoney(form.platformFee) }}</strong></span>
            <span>预计利润 <strong>{{ formatMoney(formProfitAmount) }}</strong></span>
          </div>
          <div class="sale-dialog-actions">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">{{ editingId ? '保存修改' : '保存并出库' }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="stockPickerVisible" title="选择进货商品" width="min(1180px, calc(100vw - 64px))">
      <div class="stock-picker-layout">
        <aside class="stock-picker-types">
          <div class="stock-picker-type-head">
            <strong>商品分类</strong>
            <el-button text type="primary" @click="handleStockTypeSelect(null)">全部</el-button>
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
                <span class="inventory-type-name" @click.stop="handleStockTypeSelect(data)">{{ data.typeName }}</span>
                <el-tooltip v-if="hasChildren(data)" content="查询该分类及下级" placement="top" effect="light">
                  <el-button class="inventory-type-query" text :icon="Search" @click.stop="handleStockTypeSelect(data)" />
                </el-tooltip>
              </span>
            </template>
          </el-tree>
        </aside>

        <section class="stock-picker-content">
          <div class="stock-picker-toolbar">
            <el-input v-model.trim="stockKeyword" clearable placeholder="商品/采购单号/平台订单号/设备编号" @keyup.enter="loadAvailableStock" />
            <el-button type="primary" :icon="Search" @click="loadAvailableStock">查询</el-button>
          </div>
          <el-table v-loading="stockLoading" :data="availableStock" border @selection-change="handleStockSelection">
            <el-table-column type="selection" width="48" :selectable="stockSelectable" />
            <el-table-column prop="purchaseNo" label="采购单号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="purchaseDate" label="采购日期" width="110" />
            <el-table-column prop="productName" label="商品名称" min-width="170" show-overflow-tooltip />
            <el-table-column prop="deviceNo" label="设备编号" min-width="130" show-overflow-tooltip />
            <el-table-column prop="conditionDesc" label="成色/瑕疵" min-width="150" show-overflow-tooltip />
            <el-table-column prop="availableQuantity" label="可售库存" width="90" />
            <el-table-column prop="unitCost" label="成本" width="90" />
            <el-table-column prop="defaultSalePrice" label="默认售价" width="100" />
          </el-table>
        </section>
      </div>
      <template #footer>
        <el-button @click="stockPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStockPicker">加入明细</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="saleItemsVisible" title="销售详情" width="min(980px, calc(100vw - 64px))">
      <div v-if="currentSale" class="sale-detail-grid">
        <div class="detail-field"><span>销售单号</span><strong>{{ currentSale.recordNo || '-' }}</strong></div>
        <div class="detail-field"><span>平台订单号</span><strong>{{ currentSale.platformOrderNo || '-' }}</strong></div>
        <div class="detail-field"><span>买家名称</span><strong>{{ currentSale.buyerName || '-' }}</strong></div>
        <div class="detail-field"><span>买家电话</span><strong>{{ currentSale.buyerPhone || '-' }}</strong></div>
        <div class="detail-field"><span>快递公司</span><strong>{{ currentSale.expressCompany || '-' }}</strong></div>
        <div class="detail-field"><span>快递单号</span><strong>{{ currentSale.expressNo || '-' }}</strong></div>
      </div>
      <el-table v-loading="saleItemsLoading" :data="saleItems" border>
        <el-table-column prop="purchaseNo" label="采购单号" min-width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="160" />
        <el-table-column prop="deviceNo" label="设备编号" min-width="130" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="saleUnitPrice" label="销售单价" width="100" />
        <el-table-column prop="costUnitPrice" label="成本单价" width="100" />
        <el-table-column prop="profitAmount" label="利润" width="100" />
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, CollectionTag, DataLine, Delete, Edit, Goods, InfoFilled, Menu, Money, Plus, Refresh, RefreshLeft, Search, Sell, Setting, ShoppingCart, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { getProductTypeTreeApi } from '@/api/product'
import { createSaleApi, getAvailableSaleStockApi, getSaleItemsApi, getSaleSummaryApi, getSalesApi, updateSaleApi } from '@/api/sale'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const sales = ref([])
const saleItems = ref([])
const currentSale = ref(null)
const availableStock = ref([])
const productTypeOptions = ref([])
const stockSelection = ref([])
const total = ref(0)
const defaultDateRange = currentMonthRange()
const dateRange = ref([...defaultDateRange])
const loading = ref(false)
const saving = ref(false)
const stockLoading = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const stockPickerVisible = ref(false)
const saleItemsVisible = ref(false)
const saleItemsLoading = ref(false)
const stockKeyword = ref('')
const stockProductTypeIds = ref([])
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  paymentStatus: null,
  shipmentStatus: null,
  startDate: defaultDateRange[0],
  endDate: defaultDateRange[1]
})

const summary = reactive({
  orderCount: 0,
  totalSaleAmount: 0,
  totalProfitAmount: 0
})

const form = reactive(defaultForm())

const rules = {
  platform: [{ required: true, message: '请选择销售平台', trigger: 'change' }],
  businessDate: [{ required: true, message: '请选择销售日期', trigger: 'change' }]
}

const formSaleAmount = computed(() => form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.saleUnitPrice || 0), 0))
const formCostAmount = computed(() => form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0))
const formProfitAmount = computed(() => {
  const expenses = Number(form.platformFee || 0) + Number(form.expressFee || 0) + Number(form.packageFee || 0) + Number(form.promotionFee || 0) + Number(form.otherExpense || 0)
  return formSaleAmount.value - formCostAmount.value - expenses - Number(form.refundAmount || 0)
})

watch(
  [formSaleAmount, () => form.worryFreeSale],
  () => {
    form.platformFee = calculatePlatformFee()
  }
)

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProductTypes()
  loadSales()
})

async function loadSales() {
  loading.value = true
  try {
    const [result, totalSummary] = await Promise.all([getSalesApi(query), getSaleSummaryApi(query)])
    sales.value = result.list || []
    total.value = result.total || 0
    Object.assign(summary, {
      orderCount: totalSummary?.orderCount || 0,
      totalSaleAmount: totalSummary?.totalSaleAmount || 0,
      totalProfitAmount: totalSummary?.totalProfitAmount || 0
    })
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  loadSales()
}

function handleReset() {
  const range = currentMonthRange()
  dateRange.value = [...range]
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    paymentStatus: null,
    shipmentStatus: null,
    startDate: range[0],
    endDate: range[1]
  })
  loadSales()
}

function handleDateRangeChange(value) {
  query.startDate = value?.[0] || ''
  query.endDate = value?.[1] || ''
  handleSearch()
}

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

async function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    ...defaultForm(),
    platform: row.platform || '闲鱼',
    platformOrderNo: row.platformOrderNo || '',
    buyerName: row.buyerName || '',
    buyerPhone: row.buyerPhone || '',
    businessDate: row.businessDate || today(),
    paymentStatus: row.paymentStatus ?? 1,
    shipmentStatus: row.shipmentStatus ?? 0,
    expressCompany: row.expressCompany || '韵达',
    expressNo: row.expressNo || '',
    remark: row.remark || '',
    items: []
  })
  const items = await getSaleItemsApi(row.id)
  form.items = items.map((item) => ({
    batchId: item.batchId,
    purchaseNo: item.purchaseNo,
    productName: item.productName,
    deviceNo: item.deviceNo,
    availableQuantity: item.quantity,
    unitCost: Number(item.costUnitPrice || 0),
    quantity: item.quantity || 1,
    saleUnitPrice: Number(item.saleUnitPrice || 0),
    remark: item.remark || ''
  }))
  dialogVisible.value = true
}

async function openStockPicker() {
  stockKeyword.value = ''
  stockProductTypeIds.value = []
  stockSelection.value = []
  stockPickerVisible.value = true
  await loadAvailableStock()
}

async function loadProductTypes() {
  productTypeOptions.value = await getProductTypeTreeApi()
}

async function loadAvailableStock() {
  stockLoading.value = true
  try {
    availableStock.value = await getAvailableSaleStockApi({
      keyword: stockKeyword.value,
      productTypeIds: stockProductTypeIds.value
    })
  } finally {
    stockLoading.value = false
  }
}

function handleStockTypeSelect(node) {
  stockProductTypeIds.value = node ? flattenTypeIds(node) : []
  loadAvailableStock()
}

function hasChildren(node) {
  return Array.isArray(node?.children) && node.children.length > 0
}

function handleStockSelection(rows) {
  stockSelection.value = rows
}

function stockSelectable(row) {
  return !form.items.some((item) => item.batchId === row.batchId)
}

function confirmStockPicker() {
  stockSelection.value.forEach((row) => {
    if (form.items.some((item) => item.batchId === row.batchId)) {
      return
    }
    form.items.push({
      ...row,
      quantity: 1,
      saleUnitPrice: Number(row.defaultSalePrice || row.unitCost || 0),
      remark: ''
    })
  })
  stockPickerVisible.value = false
}

function removeSaleItem(index) {
  form.items.splice(index, 1)
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid || saving.value) {
    return
  }
  if (!form.items.length) {
    ElMessage.warning('请先选择进货商品')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateSaleApi(editingId.value, {
        platform: form.platform,
        platformOrderNo: form.platformOrderNo,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        businessDate: form.businessDate,
        paymentStatus: form.paymentStatus,
        shipmentStatus: form.shipmentStatus,
        expressCompany: form.expressCompany,
        expressNo: form.expressNo,
        remark: form.remark
      })
      ElMessage.success('销售订单已更新')
    } else {
      await createSaleApi({
        ...form,
        items: form.items.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
          saleUnitPrice: item.saleUnitPrice,
          remark: item.remark
        }))
      })
      ElMessage.success('销售订单已保存并出库')
    }
    dialogVisible.value = false
    await loadSales()
  } finally {
    saving.value = false
  }
}

async function openSaleDetail(row) {
  currentSale.value = row
  saleItemsVisible.value = true
  saleItemsLoading.value = true
  try {
    saleItems.value = await getSaleItemsApi(row.id)
  } finally {
    saleItemsLoading.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function defaultForm() {
  return {
    platform: '闲鱼',
    platformOrderNo: '',
    buyerName: '',
    buyerPhone: '',
    businessDate: today(),
    platformFee: 0,
    expressFee: 0,
    packageFee: 0,
    promotionFee: 0,
    refundAmount: 0,
    otherExpense: 0,
    paymentStatus: 1,
    shipmentStatus: 0,
    expressCompany: '韵达',
    worryFreeSale: false,
    expressNo: '',
    remark: '',
    items: []
  }
}

function lineSaleAmount(row) {
  return (Number(row.quantity || 0) * Number(row.saleUnitPrice || 0)).toFixed(2)
}

function calculatePlatformFee() {
  const rate = form.worryFreeSale ? 0.026 : 0.016
  return Number((formSaleAmount.value * rate).toFixed(2))
}

function flattenTypeIds(node) {
  return [node.id, ...(node.children || []).flatMap((child) => flattenTypeIds(child))]
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function grossProfitRate(profit, amount) {
  const saleAmount = Number(amount || 0)
  if (!saleAmount) {
    return '0.00%'
  }
  return `${((Number(profit || 0) / saleAmount) * 100).toFixed(2)}%`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [formatDate(start), formatDate(end)]
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>






