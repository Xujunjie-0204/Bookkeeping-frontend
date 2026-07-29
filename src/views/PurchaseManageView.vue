<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/purchases" router>
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
          <el-breadcrumb-item>采购管理</el-breadcrumb-item>
          <el-breadcrumb-item>采购进货</el-breadcrumb-item>
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
              <h2>采购进货</h2>
              <p>记录二手平台进货订单，保存后自动生成库存批次和入库流水。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadPurchases">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增进货</el-button>
            </div>
          </div>

          <el-form class="filter-bar purchase-filter" :model="query" label-position="left">
            <el-form-item label="关键词">
              <el-input
                v-model.trim="query.keyword"
                clearable
                placeholder="采购单号/平台订单号/卖家"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="query.purchaseStatus" clearable placeholder="全部状态">
                <el-option label="待到货" :value="1" />
                <el-option label="已入库" :value="2" />
                <el-option label="已取消" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="table-scroll">
            <el-table v-loading="loading" :data="purchases" border>
              <el-table-column prop="purchaseNo" label="采购单号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="platform" label="平台" min-width="110" />
              <el-table-column prop="platformOrderNo" label="平台订单号" min-width="170" show-overflow-tooltip />
              <el-table-column prop="sellerAccount" label="卖家账号" min-width="150" show-overflow-tooltip />
              <el-table-column prop="purchaseDate" label="采购日期" width="120" />
              <el-table-column prop="itemCount" label="数量" width="80" />
              <el-table-column prop="goodsAmount" label="商品金额" width="110" />
              <el-table-column prop="freightAmount" label="运费" width="90" />
              <el-table-column prop="payAmount" label="实付金额" width="110" />
              <el-table-column prop="purchaseStatus" label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="statusType(row.purchaseStatus)">
                    {{ statusText(row.purchaseStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
              <el-table-column label="操作" width="96" fixed="right" align="center">
                <template #default="{ row }">
                  <el-popconfirm title="确认删除该采购单？" @confirm="handleDelete(row)">
                    <template #reference>
                      <el-button :icon="Delete" text type="danger">删除</el-button>
                    </template>
                  </el-popconfirm>
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
              @size-change="loadPurchases"
              @current-change="loadPurchases"
            />
          </div>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" title="新增进货" width="980px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="98px">
        <div class="form-grid">
          <el-form-item label="采购平台" prop="platform">
            <el-select v-model="form.platform" filterable allow-create default-first-option>
              <el-option label="闲鱼" value="闲鱼" />
              <el-option label="转转" value="转转" />
              <el-option label="淘宝" value="淘宝" />
              <el-option label="线下" value="线下" />
            </el-select>
          </el-form-item>
          <el-form-item label="采购日期" prop="purchaseDate">
            <el-date-picker v-model="form.purchaseDate" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="平台订单号">
            <el-input v-model.trim="form.platformOrderNo" maxlength="80" />
          </el-form-item>
          <el-form-item label="卖家账号">
            <el-input v-model.trim="form.sellerAccount" maxlength="100" />
          </el-form-item>
          <el-form-item label="供应商">
            <el-input v-model.trim="form.supplierName" maxlength="100" />
          </el-form-item>
          <el-form-item label="付款方式">
            <el-select v-model="form.paymentMethod" clearable filterable allow-create default-first-option>
              <el-option label="支付宝" value="支付宝" />
              <el-option label="微信" value="微信" />
              <el-option label="银行卡" value="银行卡" />
              <el-option label="现金" value="现金" />
            </el-select>
          </el-form-item>
          <el-form-item label="运费">
            <el-input-number v-model="form.freightAmount" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="优惠金额">
            <el-input-number v-model="form.discountAmount" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="其他费用">
            <el-input-number v-model="form.otherAmount" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="本单实付">
            <el-input :model-value="payAmountText" disabled />
          </el-form-item>
        </div>

        <div class="purchase-items-head">
          <div>
            <strong>采购明细</strong>
            <span>常规一单一台，特殊情况可继续添加明细。</span>
          </div>
          <el-button :icon="Plus" @click="addItem">添加明细</el-button>
        </div>

        <div class="table-scroll">
          <el-table :data="form.items" border>
            <el-table-column label="商品" min-width="220">
              <template #default="{ row, $index }">
                <el-select
                  v-model="row.productId"
                  filterable
                  placeholder="选择商品"
                  @change="handleProductChange(row)"
                >
                  <el-option
                    v-for="product in productOptions"
                    :key="product.id"
                    :label="productLabel(product)"
                    :value="product.id"
                  />
                </el-select>
                <div v-if="itemErrors[$index]?.productId" class="field-error">{{ itemErrors[$index].productId }}</div>
              </template>
            </el-table-column>
            <el-table-column label="设备编号" min-width="150">
              <template #default="{ row }">
                <el-input v-model.trim="row.deviceNo" maxlength="100" placeholder="IMEI/序列号" />
              </template>
            </el-table-column>
            <el-table-column label="成色/瑕疵" min-width="180">
              <template #default="{ row }">
                <el-input v-model.trim="row.conditionDesc" maxlength="200" placeholder="如 95新，边框小磕碰" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template #default="{ row, $index }">
                <el-input-number v-model="row.quantity" :min="1" :precision="0" />
                <div v-if="itemErrors[$index]?.quantity" class="field-error">{{ itemErrors[$index].quantity }}</div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150">
              <template #default="{ row, $index }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" :step="1" />
                <div v-if="itemErrors[$index]?.unitPrice" class="field-error">{{ itemErrors[$index].unitPrice }}</div>
              </template>
            </el-table-column>
            <el-table-column label="小计" width="110">
              <template #default="{ row }">{{ lineAmount(row) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button :icon="Delete" text type="danger" :disabled="form.items.length === 1" @click="removeItem($index)" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-form-item class="purchase-remark" label="备注">
          <el-input v-model.trim="form.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存并入库</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CollectionTag,
  DataLine,
  Delete,
  Goods,
  Menu,
  Plus,
  Refresh,
  RefreshLeft,
  Search,
  Setting,
  ShoppingCart,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { getProductsApi } from '@/api/product'
import { createPurchaseApi, deletePurchaseApi, getPurchasesApi } from '@/api/purchase'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const purchases = ref([])
const productOptions = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const itemErrors = ref([])

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  purchaseStatus: null
})

const form = reactive({
  platform: '闲鱼',
  platformOrderNo: '',
  supplierName: '',
  sellerAccount: '',
  purchaseDate: today(),
  freightAmount: 0,
  discountAmount: 0,
  otherAmount: 0,
  paymentMethod: '',
  remark: '',
  items: [newItem()]
})

const rules = {
  platform: [{ required: true, message: '请选择或输入采购平台', trigger: 'change' }],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }]
}

const goodsAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0)
})

const payAmountText = computed(() => {
  const totalAmount = goodsAmount.value + Number(form.freightAmount || 0) + Number(form.otherAmount || 0) - Number(form.discountAmount || 0)
  return totalAmount.toFixed(2)
})

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProducts()
  loadPurchases()
})

async function loadPurchases() {
  loading.value = true
  try {
    const result = await getPurchasesApi(query)
    purchases.value = result.list || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  const result = await getProductsApi({
    pageNum: 1,
    pageSize: 200,
    status: 1
  })
  productOptions.value = result.list || []
}

function handleSearch() {
  query.pageNum = 1
  loadPurchases()
}

function handleReset() {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    purchaseStatus: null
  })
  loadPurchases()
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  const itemsValid = validateItems()
  if (!valid || !itemsValid || saving.value) {
    return
  }
  saving.value = true
  try {
    await createPurchaseApi({
      ...form,
      items: form.items.map((item) => ({
        productId: item.productId,
        conditionDesc: item.conditionDesc,
        deviceNo: item.deviceNo,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        remark: item.remark
      }))
    })
    ElMessage.success('采购单已入库')
    dialogVisible.value = false
    await loadPurchases()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await deletePurchaseApi(row.id)
  ElMessage.success('采购单已删除')
  await loadPurchases()
}

function addItem() {
  form.items.push(newItem())
  itemErrors.value.push({})
}

function removeItem(index) {
  if (form.items.length === 1) {
    return
  }
  form.items.splice(index, 1)
  itemErrors.value.splice(index, 1)
}

function handleProductChange(row) {
  const product = productOptions.value.find((item) => item.id === row.productId)
  if (product && (!row.unitPrice || row.unitPrice === 0)) {
    row.unitPrice = Number(product.defaultCost || 0)
  }
}

function validateItems() {
  let valid = true
  itemErrors.value = form.items.map((item) => {
    const errors = {}
    if (!item.productId) {
      errors.productId = '请选择商品'
      valid = false
    }
    if (!item.quantity || item.quantity < 1) {
      errors.quantity = '数量至少为 1'
      valid = false
    }
    if (item.unitPrice === null || item.unitPrice === undefined || Number(item.unitPrice) < 0) {
      errors.unitPrice = '单价不能小于 0'
      valid = false
    }
    return errors
  })
  return valid
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function resetForm() {
  Object.assign(form, {
    platform: '闲鱼',
    platformOrderNo: '',
    supplierName: '',
    sellerAccount: '',
    purchaseDate: today(),
    freightAmount: 0,
    discountAmount: 0,
    otherAmount: 0,
    paymentMethod: '',
    remark: '',
    items: [newItem()]
  })
  itemErrors.value = [{}]
  formRef.value?.clearValidate()
}

function newItem() {
  return {
    productId: null,
    conditionDesc: '',
    deviceNo: '',
    quantity: 1,
    unitPrice: 0,
    remark: ''
  }
}

function lineAmount(row) {
  return (Number(row.quantity || 0) * Number(row.unitPrice || 0)).toFixed(2)
}

function productLabel(product) {
  const parts = [product.productName, product.model, product.specification].filter(Boolean)
  return `${parts.join(' / ')}${product.productCode ? `（${product.productCode}）` : ''}`
}

function statusText(status) {
  const map = {
    0: '已取消',
    1: '待到货',
    2: '已入库'
  }
  return map[status] || '未知'
}

function statusType(status) {
  const map = {
    0: 'info',
    1: 'warning',
    2: 'success'
  }
  return map[status] || 'info'
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
</script>
