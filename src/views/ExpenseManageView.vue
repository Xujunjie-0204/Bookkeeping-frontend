<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/expenses" router>
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
          <el-breadcrumb-item>经营支出</el-breadcrumb-item>
          <el-breadcrumb-item>支出记录</el-breadcrumb-item>
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
              <h2>经营支出</h2>
              <p>记录快递、包装和其他经营支出，销售单填写快递费时会自动生成物流包装支出。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadExpenses">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增支出</el-button>
            </div>
          </div>

          <el-form class="filter-bar expense-filter" :model="query" label-position="left">
            <el-form-item label="关键词">
              <el-input v-model.trim="query.keyword" clearable placeholder="支出单号/名称/销售单号/快递公司" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="支出类型">
              <el-select v-model="query.expenseType" clearable placeholder="全部类型">
                <el-option label="物流包装" value="物流包装" />
                <el-option label="平台费用" value="平台费用" />
                <el-option label="其他支出" value="其他支出" />
              </el-select>
            </el-form-item>
            <el-form-item label="支出时间">
              <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleDateRangeChange" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="purchase-summary-grid">
            <div class="purchase-summary-card"><span>支出总金额</span><strong>{{ formatMoney(summary.totalExpenseAmount) }}</strong></div>
            <div class="purchase-summary-card"><span>支出笔数</span><strong>{{ summary.expenseCount || 0 }}</strong></div>
          </div>

          <div class="table-scroll">
            <el-table v-loading="loading" :data="expenses" border>
              <el-table-column prop="expenseNo" label="支出单号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="expenseDate" label="支出日期" width="120" />
              <el-table-column prop="expenseType" label="类型" width="110" />
              <el-table-column prop="expenseName" label="支出名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="amount" label="金额" width="110" />
              <el-table-column prop="expressCompany" label="快递公司" width="110" />
              <el-table-column prop="relatedOrderNo" label="关联销售单" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-button
                    v-if="row.relatedSaleId"
                    class="link-button"
                    text
                    type="primary"
                    @click="openSaleDetail(row)"
                  >
                    {{ row.relatedOrderNo || '查看销售单' }}
                  </el-button>
                  <span v-else>{{ row.relatedOrderNo || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="来源" width="90">
                <template #default="{ row }"><el-tag :type="row.independentFlag === 0 ? 'success' : 'info'">{{ row.independentFlag === 0 ? '销售生成' : '手动录入' }}</el-tag></template>
              </el-table-column>
              <el-table-column label="备注" width="70" align="center">
                <template #default="{ row }">
                  <el-tooltip v-if="row.remark" :content="row.remark" placement="top" effect="light"><el-icon class="remark-icon"><InfoFilled /></el-icon></el-tooltip>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-bar">
            <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="loadExpenses" @current-change="loadExpenses" />
          </div>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" title="新增经营支出" width="min(760px, calc(100vw - 64px))">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <div class="form-grid">
          <el-form-item label="支出日期" prop="expenseDate"><el-date-picker v-model="form.expenseDate" type="date" value-format="YYYY-MM-DD" /></el-form-item>
          <el-form-item label="支出类型" prop="expenseType">
            <el-select v-model="form.expenseType" filterable allow-create default-first-option placeholder="请选择">
              <el-option label="物流包装" value="物流包装" />
              <el-option label="平台费用" value="平台费用" />
              <el-option label="其他支出" value="其他支出" />
            </el-select>
          </el-form-item>
          <el-form-item label="支出名称" prop="expenseName"><el-input v-model.trim="form.expenseName" maxlength="100" /></el-form-item>
          <el-form-item label="金额" prop="amount"><el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="1" /></el-form-item>
          <el-form-item label="快递公司">
            <el-select v-model="form.expressCompany" clearable placeholder="请选择">
              <el-option label="韵达" value="韵达" />
              <el-option label="京东" value="京东" />
              <el-option label="顺丰" value="顺丰" />
            </el-select>
          </el-form-item>
          <el-form-item label="付款方式"><el-input v-model.trim="form.paymentMethod" maxlength="50" /></el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" type="textarea" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="saleDetailVisible" title="销售详情" width="min(1240px, calc(100vw - 64px))" class="sale-order-dialog">
      <div v-if="currentSale" class="sale-detail-view">
        <div class="sale-form-sections">
          <section class="sale-form-section">
            <div class="sale-section-title">订单信息</div>
            <div class="sale-detail-fields">
              <div class="detail-field"><span>销售单号</span><strong>{{ currentSale.recordNo || '-' }}</strong></div>
              <div class="detail-field"><span>销售平台</span><strong>{{ currentSale.platform || '-' }}</strong></div>
              <div class="detail-field"><span>销售日期</span><strong>{{ currentSale.businessDate || '-' }}</strong></div>
              <div class="detail-field"><span>平台订单号</span><strong>{{ currentSale.platformOrderNo || '-' }}</strong></div>
              <div class="detail-field"><span>买家名称</span><strong>{{ currentSale.buyerName || '-' }}</strong></div>
              <div class="detail-field"><span>买家电话</span><strong>{{ currentSale.buyerPhone || '-' }}</strong></div>
            </div>
          </section>

          <section class="sale-form-section">
            <div class="sale-section-title">配送状态</div>
            <div class="sale-detail-fields">
              <div class="detail-field"><span>收款状态</span><strong>{{ currentSale.paymentStatus === 1 ? '已收款' : '未收款' }}</strong></div>
              <div class="detail-field"><span>发货状态</span><strong>{{ currentSale.shipmentStatus === 1 ? '已发货' : '未发货' }}</strong></div>
              <div class="detail-field"><span>快递公司</span><strong>{{ currentSale.expressCompany || '-' }}</strong></div>
              <div class="detail-field"><span>快递单号</span><strong>{{ currentSale.expressNo || '-' }}</strong></div>
            </div>
          </section>

          <section class="sale-form-section sale-fee-section">
            <div class="sale-section-title">费用设置</div>
            <div class="sale-detail-fees">
              <div class="detail-field"><span>无忧卖</span><strong>{{ saleFeeConfig.worryFreeSale ? '是' : '否' }}</strong></div>
              <div class="detail-field"><span>平台费率</span><strong>{{ saleFeeConfig.platformFeeRate ? `${(Number(saleFeeConfig.platformFeeRate) * 100).toFixed(2)}%` : '-' }}</strong></div>
              <div class="detail-field"><span>平台费用</span><strong>{{ formatMoney(currentSale.platformFee) }}</strong></div>
              <div class="detail-field"><span>快递费</span><strong>{{ formatMoney(currentSale.expressFee) }}</strong></div>
              <div class="detail-field"><span>包装费</span><strong>{{ formatMoney(currentSale.packageFee) }}</strong></div>
              <div class="detail-field"><span>其它费用</span><strong>{{ formatMoney(currentSale.otherExpense) }}</strong></div>
              <div class="detail-field"><span>退款金额</span><strong>{{ formatMoney(currentSale.refundAmount) }}</strong></div>
              <div class="detail-field"><span>推广费</span><strong>{{ formatMoney(currentSale.promotionFee) }}</strong></div>
            </div>
          </section>
        </div>

        <div class="purchase-items-head sale-items-head">
          <div>
            <strong>销售明细</strong>
            <span>从经营支出关联销售单打开，方便核对物流包装费用。</span>
          </div>
        </div>
        <div class="table-scroll sale-items-table">
          <el-table v-loading="saleDetailLoading" :data="saleItems" border>
            <el-table-column prop="purchaseNo" label="采购单号" min-width="150" show-overflow-tooltip />
            <el-table-column prop="productName" label="商品名称" min-width="170" show-overflow-tooltip />
            <el-table-column prop="deviceNo" label="设备编号" min-width="130" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="saleUnitPrice" label="销售单价" width="100" />
            <el-table-column prop="costUnitPrice" label="成本单价" width="100" />
            <el-table-column prop="profitAmount" label="利润(含费用)" width="120" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="sale-dialog-footer">
          <div class="sale-dialog-total">
            <span>销售金额 <strong>{{ formatMoney(currentSale?.totalSaleAmount) }}</strong></span>
            <span>成本金额 <strong>{{ formatMoney(currentSale?.totalCostAmount) }}</strong></span>
            <span>费用合计 <strong>{{ formatMoney(saleExpenseAmount) }}</strong></span>
            <span>利润 <strong>{{ formatMoney(currentSale?.profitAmount) }}</strong></span>
          </div>
          <div class="sale-dialog-actions">
            <el-button @click="saleDetailVisible = false">关闭</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, CollectionTag, DataLine, Goods, InfoFilled, Menu, Money, Plus, Refresh, RefreshLeft, Search, Sell, Setting, ShoppingCart, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { createExpenseApi, getExpenseSummaryApi, getExpensesApi } from '@/api/expense'
import { getSaleDetailApi, getSaleItemsApi } from '@/api/sale'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const expenses = ref([])
const saleItems = ref([])
const currentSale = ref(null)
const total = ref(0)
const range = currentMonthRange()
const dateRange = ref([...range])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const saleDetailVisible = ref(false)
const saleDetailLoading = ref(false)
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  expenseType: '',
  startDate: range[0],
  endDate: range[1]
})

const summary = reactive({
  expenseCount: 0,
  totalExpenseAmount: 0
})

const form = reactive(defaultForm())

const saleFeeConfig = computed(() => parseFeeConfig(currentSale.value?.feeConfig))
const saleExpenseAmount = computed(() => {
  const sale = currentSale.value || {}
  return Number(sale.platformFee || 0)
    + Number(sale.expressFee || 0)
    + Number(sale.packageFee || 0)
    + Number(sale.otherExpense || 0)
    + Number(sale.promotionFee || 0)
    + Number(sale.refundAmount || 0)
})

const rules = {
  expenseDate: [{ required: true, message: '请选择支出日期', trigger: 'change' }],
  expenseType: [{ required: true, message: '请选择支出类型', trigger: 'change' }],
  expenseName: [{ required: true, message: '请输入支出名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadExpenses()
})

async function loadExpenses() {
  loading.value = true
  try {
    const [result, totalSummary] = await Promise.all([getExpensesApi(query), getExpenseSummaryApi(query)])
    expenses.value = result.list || []
    total.value = result.total || 0
    Object.assign(summary, {
      expenseCount: totalSummary?.expenseCount || 0,
      totalExpenseAmount: totalSummary?.totalExpenseAmount || 0
    })
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  loadExpenses()
}

function handleReset() {
  const currentRange = currentMonthRange()
  dateRange.value = [...currentRange]
  Object.assign(query, { pageNum: 1, pageSize: 10, keyword: '', expenseType: '', startDate: currentRange[0], endDate: currentRange[1] })
  loadExpenses()
}

function handleDateRangeChange(value) {
  query.startDate = value?.[0] || ''
  query.endDate = value?.[1] || ''
  handleSearch()
}

function openCreate() {
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid || saving.value) return
  saving.value = true
  try {
    await createExpenseApi(form)
    ElMessage.success('支出已保存')
    dialogVisible.value = false
    await loadExpenses()
  } finally {
    saving.value = false
  }
}

async function openSaleDetail(row) {
  if (!row.relatedSaleId) {
    return
  }
  saleDetailVisible.value = true
  saleDetailLoading.value = true
  currentSale.value = null
  saleItems.value = []
  try {
    const [sale, items] = await Promise.all([
      getSaleDetailApi(row.relatedSaleId),
      getSaleItemsApi(row.relatedSaleId)
    ])
    currentSale.value = sale
    saleItems.value = items || []
  } finally {
    saleDetailLoading.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function defaultForm() {
  return { expenseDate: today(), expenseType: '物流包装', expenseName: '经营支出', amount: 0, expressCompany: '', paymentMethod: '', remark: '' }
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function parseFeeConfig(value) {
  if (!value) {
    return {}
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return {}
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function currentMonthRange() {
  const now = new Date()
  return [formatDate(new Date(now.getFullYear(), now.getMonth(), 1)), formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))]
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>



