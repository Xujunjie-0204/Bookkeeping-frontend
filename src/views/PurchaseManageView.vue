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

      <el-main
        class="dashboard-main purchase-drop-zone"
        :class="{ 'is-dragging': ocrDragging }"
        @dragenter.prevent="handleOcrDragEnter"
        @dragover.prevent="handleOcrDragOver"
        @dragleave.prevent="handleOcrDragLeave"
        @drop.prevent="handleOcrDrop"
      >
        <div v-if="ocrDragging" class="ocr-drop-mask">
          <el-icon><Upload /></el-icon>
          <strong>松开图片开始 OCR 识别</strong>
          <span>识别后会自动打开新增进货并回填订单信息</span>
        </div>
        <section class="table-panel">
          <div class="table-toolbar">
            <div>
              <h2>采购进货</h2>
              <p>记录二手平台进货订单，保存后自动生成库存批次和入库流水。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadPurchases">刷新</el-button>
              <el-button class="ocr-button" :icon="Upload" :loading="ocrRecognizing" @click="openOcrUpload">OCR识别</el-button>
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
                <el-option label="部分售出" :value="4" />
                <el-option label="已售出" :value="5" />
                <el-option label="已取消" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="采购时间">
              <el-date-picker
                v-model="purchaseDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateRangeChange"
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
              <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div v-if="selectedProducts.length" class="selected-product-tags">
            <el-tag
              v-for="product in selectedProducts"
              :key="product.id"
              closable
              @close="removeSelectedProduct(product.id)"
            >
              {{ productLabel(product) }}
            </el-tag>
          </div>

          <div class="purchase-summary-grid">
            <div class="purchase-summary-card">
              <span>采购总金额</span>
              <strong>{{ formatMoney(purchaseSummary.totalPurchaseAmount) }}</strong>
            </div>
            <div class="purchase-summary-card">
              <span>订单数</span>
              <strong>{{ purchaseSummary.orderCount || 0 }}</strong>
            </div>
          </div>

          <div class="table-scroll">
            <el-table v-loading="loading" :data="purchases" border>
              <el-table-column prop="purchaseNo" label="采购单号" min-width="160" show-overflow-tooltip />
              <el-table-column prop="platform" label="平台" min-width="110" />
              <el-table-column prop="platformOrderNo" label="平台订单号" min-width="150" show-overflow-tooltip />
              <el-table-column label="商品名称" min-width="170" show-overflow-tooltip>
                <template #default="{ row }">
                  <el-button class="link-button" text type="primary" @click="openPurchaseItems(row)">
                    {{ row.productName || '查看商品' }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="sellerAccount" label="卖家账号" min-width="150" show-overflow-tooltip />
              <el-table-column label="采购日期" width="170">
                <template #default="{ row }">
                  {{ formatDateTime(row.purchaseDate) }}
                </template>
              </el-table-column>
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
              <el-table-column label="备注" width="70" align="center">
                <template #default="{ row }">
                  <el-tooltip v-if="row.remark" :content="row.remark" placement="top" effect="light">
                    <el-icon class="remark-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                    <el-popconfirm title="确认删除该采购单？" @confirm="handleDelete(row)">
                      <template #reference>
                        <el-button :icon="Delete" text type="danger">删除</el-button>
                      </template>
                    </el-popconfirm>
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
              @size-change="loadPurchases"
              @current-change="loadPurchases"
            />
          </div>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑进货' : '新增进货'" width="min(1280px, calc(100vw - 64px))">
      <div v-if="!editingId" class="ocr-assist-bar">
        <div>
          <strong>OCR 辅助录入</strong>
          <span>{{ ocrRecognizing ? `正在识别图片，${ocrProgress}%` : '可上传京东、闲鱼等订单截图，自动回填部分采购信息。' }}</span>
        </div>
        <el-button :icon="Upload" :loading="ocrRecognizing" @click="triggerOcrFileInput">上传截图识别</el-button>
        <input ref="ocrFileInput" class="hidden-file-input" type="file" accept="image/*,.pdf" @change="handleOcrFileChange" />
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="98px">
        <div class="form-grid">
          <el-form-item label="采购平台" prop="platform">
            <el-select v-model="form.platform" filterable allow-create default-first-option placeholder="请选择" @change="handlePlatformChange">
              <el-option label="京东" value="京东" />
              <el-option label="闲鱼" value="闲鱼" />
              <el-option label="转转" value="转转" />
              <el-option label="淘宝" value="淘宝" />
              <el-option label="拼多多" value="拼多多" />
              <el-option label="线下" value="线下" />
            </el-select>
          </el-form-item>
          <el-form-item label="采购日期" prop="purchaseDate">
            <el-date-picker
              v-model="form.purchaseDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择采购时间"
            />
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
            <el-select v-model="form.paymentMethod" clearable filterable allow-create default-first-option placeholder="请选择">
              <el-option label="支付宝" value="支付宝" />
              <el-option label="微信" value="微信" />
              <el-option label="银行卡" value="银行卡" />
              <el-option label="现金" value="现金" />
            </el-select>
          </el-form-item>
          <el-form-item label="运费">
            <el-input-number v-model="form.freightAmount" :min="0" :precision="2" :step="1" :disabled="!!editingId" />
          </el-form-item>
          <el-form-item label="优惠金额">
            <el-input-number v-model="form.discountAmount" :min="0" :precision="2" :step="1" :disabled="!!editingId" />
          </el-form-item>
          <el-form-item label="其他费用">
            <el-input-number v-model="form.otherAmount" :min="0" :precision="2" :step="1" :disabled="!!editingId" />
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
          <el-button v-if="!editingId" :icon="Plus" @click="addItem">添加明细</el-button>
        </div>

        <div class="purchase-item-list">
          <div v-for="(row, index) in form.items" :key="index" class="purchase-item-card">
            <div class="purchase-item-index">
              <span>明细 {{ index + 1 }}</span>
                <el-button
                v-if="!editingId"
                :icon="Delete"
                text
                type="danger"
                :disabled="form.items.length === 1"
                @click="removeItem(index)"
              >
                删除
              </el-button>
            </div>

            <div class="purchase-item-grid">
              <label class="purchase-field purchase-field-product">
                <span>商品</span>
                <el-select
                  v-model="row.productId"
                  filterable
                  placeholder="请选择"
                  :disabled="!!editingId"
                  @change="handleProductChange(row)"
                >
                  <el-option
                    v-for="product in productOptions"
                    :key="product.id"
                    :label="productLabel(product)"
                    :value="product.id"
                  />
                </el-select>
                <div v-if="itemErrors[index]?.productId" class="field-error">{{ itemErrors[index].productId }}</div>
              </label>

              <label class="purchase-field">
                <span>设备编号</span>
                <el-input v-model.trim="row.deviceNo" maxlength="100" placeholder="IMEI/序列号" />
              </label>

              <label class="purchase-field purchase-field-condition">
                <span>成色/瑕疵</span>
                <el-input v-model.trim="row.conditionDesc" maxlength="200" placeholder="如 95新，边框小磕碰" />
              </label>

              <label class="purchase-field purchase-field-number">
                <span>数量</span>
                <el-input-number v-model="row.quantity" :min="1" :precision="0" :disabled="!!editingId" />
                <div v-if="itemErrors[index]?.quantity" class="field-error">{{ itemErrors[index].quantity }}</div>
              </label>

              <label class="purchase-field purchase-field-number">
                <span>单价</span>
                <el-input-number v-model="row.unitPrice" :min="0" :precision="2" :step="1" :disabled="!!editingId" />
                <div v-if="itemErrors[index]?.unitPrice" class="field-error">{{ itemErrors[index].unitPrice }}</div>
              </label>

              <div class="purchase-line-total">
                <span>小计</span>
                <strong>{{ lineAmount(row) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <el-form-item class="purchase-remark" label="备注">
          <el-input v-model.trim="form.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">{{ editingId ? '保存修改' : '保存并入库' }}</el-button>
      </template>
    </el-dialog>

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
            <el-input
              v-model.trim="pickerKeyword"
              clearable
              placeholder="请输入商品编码/名称/型号"
            />
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

    <el-dialog v-model="purchaseItemsVisible" title="商品详情" width="min(720px, calc(100vw - 64px))">
      <div v-loading="purchaseItemsLoading" class="purchase-detail-list">
        <el-empty v-if="!purchaseItemsLoading && !purchaseItems.length" description="暂无商品明细" />
        <section v-for="(item, index) in purchaseItems" :key="item.id" class="purchase-detail-card">
          <div class="purchase-detail-title">
            <strong>{{ item.productName || `商品 ${index + 1}` }}</strong>
            <div class="purchase-detail-actions">
              <el-tag size="small">{{ item.productTypeName || '未分类' }}</el-tag>
              <el-button :icon="Edit" size="small" type="primary" @click="goProductEdit(item.productId)">编辑商品</el-button>
            </div>
          </div>
          <div class="purchase-detail-grid">
            <div class="detail-field">
              <span>商品编码</span>
              <strong>{{ item.productCode || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>品牌</span>
              <strong>{{ item.brand || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>型号</span>
              <strong>{{ item.model || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>规格</span>
              <strong>{{ item.specification || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>成色/瑕疵</span>
              <strong>{{ item.conditionDesc || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>设备编号</span>
              <strong>{{ item.deviceNo || '-' }}</strong>
            </div>
            <div class="detail-field">
              <span>数量</span>
              <strong>{{ item.quantity }}</strong>
            </div>
            <div class="detail-field">
              <span>单价</span>
              <strong>{{ item.unitPrice }}</strong>
            </div>
            <div class="detail-field">
              <span>小计</span>
              <strong>{{ item.totalAmount }}</strong>
            </div>
            <div class="detail-field">
              <span>备注</span>
              <strong>{{ item.remark || '-' }}</strong>
            </div>
          </div>
        </section>
      </div>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CollectionTag,
  Box,
  DataLine,
  Delete,
  Edit,
  Goods,
  InfoFilled,
  Menu,
  Plus,
  Refresh,
  RefreshLeft,
  Search,
  Setting,
  Sell, ShoppingCart,
  SwitchButton,
  Upload,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { getProductsApi, getProductTypeTreeApi } from '@/api/product'
import {
  createPurchaseApi,
  deletePurchaseApi,
  getPurchaseItemsApi,
  getPurchaseSummaryApi,
  getPurchasesApi,
  recognizePurchaseOcrApi,
  updatePurchaseApi
} from '@/api/purchase'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const purchases = ref([])
const productOptions = ref([])
const productTypeOptions = ref([])
const total = ref(0)
const defaultDateRange = currentMonthRange()
const purchaseDateRange = ref([...defaultDateRange])
const purchaseSummary = reactive({
  totalPurchaseAmount: 0,
  orderCount: 0
})
const loading = ref(false)
const saving = ref(false)
const ocrRecognizing = ref(false)
const ocrDragging = ref(false)
const ocrProgress = ref(0)
const dialogVisible = ref(false)
const editingId = ref(null)
const productPickerVisible = ref(false)
const purchaseItemsVisible = ref(false)
const purchaseItemsLoading = ref(false)
const purchaseItems = ref([])
const formRef = ref()
const ocrFileInput = ref()
const itemErrors = ref([])
const pickerTypeId = ref(null)
const pickerKeyword = ref('')
const pickerCheckedIds = ref([])
let ocrDragDepth = 0

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  purchaseStatus: null,
  startDate: defaultDateRange[0],
  endDate: defaultDateRange[1],
  productIds: []
})

const form = reactive({
  platform: defaultPlatform(),
  platformOrderNo: '',
  supplierName: defaultSupplier(defaultPlatform()),
  sellerAccount: currentUserName(),
  purchaseDate: nowDateTime(),
  freightAmount: 0,
  discountAmount: 0,
  otherAmount: 0,
  paymentMethod: '银行卡',
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

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProductTypes()
  loadProducts()
  loadPurchases()
})

async function loadPurchases() {
  loading.value = true
  try {
    const [result, summary] = await Promise.all([
      getPurchasesApi(query),
      getPurchaseSummaryApi(query)
    ])
    purchases.value = result.list || []
    total.value = result.total || 0
    Object.assign(purchaseSummary, {
      totalPurchaseAmount: summary?.totalPurchaseAmount || 0,
      orderCount: summary?.orderCount || 0
    })
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

async function loadProductTypes() {
  productTypeOptions.value = await getProductTypeTreeApi()
}

function handleSearch() {
  query.pageNum = 1
  loadPurchases()
}

function handleReset() {
  const range = currentMonthRange()
  purchaseDateRange.value = [...range]
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    purchaseStatus: null,
    startDate: range[0],
    endDate: range[1],
    productIds: []
  })
  loadPurchases()
}

function handleDateRangeChange(value) {
  query.startDate = value?.[0] || ''
  query.endDate = value?.[1] || ''
  handleSearch()
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
  handleSearch()
}

function clearSelectedProducts() {
  query.productIds = []
  handleSearch()
}

function removeSelectedProduct(productId) {
  query.productIds = query.productIds.filter((id) => id !== productId)
  handleSearch()
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

async function openOcrUpload() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
  await nextTick()
  triggerOcrFileInput()
}

function triggerOcrFileInput() {
  if (ocrRecognizing.value) {
    return
  }
  ocrFileInput.value?.click()
}

async function handleOcrFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) {
    return
  }
  await recognizePurchaseImage(file)
}

function handleOcrDragEnter(event) {
  if (!hasImageFile(event.dataTransfer)) {
    return
  }
  ocrDragDepth += 1
  ocrDragging.value = true
}

function handleOcrDragOver(event) {
  if (hasImageFile(event.dataTransfer)) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleOcrDragLeave(event) {
  if (!ocrDragging.value) {
    return
  }
  ocrDragDepth = Math.max(ocrDragDepth - 1, 0)
  if (ocrDragDepth === 0) {
    ocrDragging.value = false
  }
}

async function handleOcrDrop(event) {
  ocrDragDepth = 0
  ocrDragging.value = false
  const file = Array.from(event.dataTransfer?.files || []).find(isOcrFile)
  if (!file) {
    ElMessage.warning('请拖入图片或 PDF 文件')
    return
  }
  editingId.value = null
  resetForm()
  dialogVisible.value = true
  await recognizePurchaseImage(file)
}

function hasImageFile(dataTransfer) {
  const items = Array.from(dataTransfer?.items || [])
  return items.some((item) => item.kind === 'file' && isOcrFile(item))
}

function isOcrFile(file) {
  return file?.type?.startsWith('image/') || file?.type === 'application/pdf'
}

async function recognizePurchaseImage(file) {
  if (ocrRecognizing.value) {
    return
  }
  ocrRecognizing.value = true
  ocrProgress.value = 10
  try {
    const parsed = await recognizePurchaseOcrApi(file)
    ocrProgress.value = 90
    applyOcrResult(parsed || {}, parsed?.rawText || '')
    ElMessage.success('OCR识别完成，请核对后保存')
  } catch (error) {
    ElMessage.error(error?.message || 'OCR识别失败，请确认后端Tesseract配置')
  } finally {
    ocrRecognizing.value = false
    ocrProgress.value = 0
  }
}

async function openEdit(row) {
  resetForm()
  editingId.value = row.id
  Object.assign(form, {
    platform: row.platform || defaultPlatform(),
    platformOrderNo: row.platformOrderNo || '',
    supplierName: row.supplierName || '',
    sellerAccount: row.sellerAccount || '',
    purchaseDate: normalizeDateTimeValue(row.purchaseDate) || nowDateTime(),
    freightAmount: Number(row.freightAmount || 0),
    discountAmount: Number(row.discountAmount || 0),
    otherAmount: Number(row.otherAmount || 0),
    paymentMethod: row.paymentMethod || '',
    remark: row.remark || ''
  })
  const items = await getPurchaseItemsApi(row.id)
  form.items = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    conditionDesc: item.conditionDesc || '',
    deviceNo: item.deviceNo || '',
    quantity: item.quantity || 1,
    unitPrice: Number(item.unitPrice || 0),
    remark: item.remark || ''
  }))
  itemErrors.value = form.items.map(() => ({}))
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
    if (editingId.value) {
      await updatePurchaseApi(editingId.value, {
        platform: form.platform,
        platformOrderNo: form.platformOrderNo,
        supplierName: form.supplierName,
        sellerAccount: form.sellerAccount,
        purchaseDate: form.purchaseDate,
        paymentMethod: form.paymentMethod,
        remark: form.remark,
        items: form.items.map((item) => ({
          id: item.id,
          conditionDesc: item.conditionDesc,
          deviceNo: item.deviceNo,
          remark: item.remark
        }))
      })
      ElMessage.success('采购单已更新')
    } else {
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
    }
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

async function openPurchaseItems(row) {
  purchaseItemsVisible.value = true
  purchaseItemsLoading.value = true
  try {
    purchaseItems.value = await getPurchaseItemsApi(row.id)
  } finally {
    purchaseItemsLoading.value = false
  }
}

function goProductEdit(productId) {
  if (!productId) {
    return
  }
  router.push({
    path: '/products',
    query: { editId: productId }
  })
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
  if (row.ocrAmountLocked) {
    return
  }
  const product = productOptions.value.find((item) => item.id === row.productId)
  row.unitPrice = product ? Number(product.defaultCost || 0) : 0
}

function handlePlatformChange(value) {
  form.supplierName = defaultSupplier(value)
}

function applyOcrResult(parsed, rawText) {
  const platform = parsed.platform || defaultPlatform()
  form.platform = platform
  form.platformOrderNo = parsed.platformOrderNo || form.platformOrderNo
  form.purchaseDate = normalizeDateTimeValue(parsed.purchaseDate) || form.purchaseDate
  form.paymentMethod = parsed.paymentMethod || form.paymentMethod || '银行卡'
  form.supplierName = parsed.supplierName || defaultSupplier(platform)
  form.sellerAccount = parsed.sellerAccount || form.sellerAccount || currentUserName()
  form.freightAmount = 0
  form.discountAmount = 0
  form.otherAmount = 0
  if (parsed.expressName) {
    form.remark = appendRemark(form.remark, `配送方式：${parsed.expressName}`)
  }
  if (parsed.productTitle) {
    form.remark = appendRemark(form.remark, `OCR商品：${parsed.productTitle}`)
  }
  form.remark = appendRemark(form.remark, `OCR识别来源：订单截图`)

  const item = form.items[0] || newItem()
  const product = matchProductByTitle(parsed.productTitle)
  item.productId = product?.id || item.productId
  item.conditionDesc = parsed.conditionDesc || item.conditionDesc
  item.quantity = 1
  item.unitPrice = parsed.payAmount || item.unitPrice || 0
  item.ocrAmountLocked = !!parsed.payAmount
  if (!form.items.length) {
    form.items.push(item)
  } else {
    form.items[0] = item
  }
  itemErrors.value = form.items.map(() => ({}))
  if (!parsed.platformOrderNo && !parsed.payAmount) {
    console.debug('OCR raw text:', rawText)
  }
}

function matchProductByTitle(title) {
  if (!title) {
    return null
  }
  const normalizedTitle = normalizeSearchText(title)
  let best = null
  let bestScore = 0
  productOptions.value.forEach((product) => {
    const fields = [product.productName, product.brand, product.model, product.specification].filter(Boolean)
    let score = 0
    fields.forEach((field) => {
      const normalizedField = normalizeSearchText(field)
      if (normalizedTitle.includes(normalizedField) || normalizedField.includes(normalizedTitle)) {
        score += 8
      }
      normalizedField.split('').forEach((char) => {
        if (normalizedTitle.includes(char)) score += 1
      })
    })
    if (score > bestScore) {
      best = product
      bestScore = score
    }
  })
  return bestScore >= 4 ? best : null
}

function normalizeSearchText(value) {
  return String(value || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
}

function appendRemark(existing, content) {
  if (!content) {
    return existing || ''
  }
  return existing ? `${existing}\n${content}` : content
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
  editingId.value = null
  Object.assign(form, {
    platform: defaultPlatform(),
    platformOrderNo: '',
    supplierName: defaultSupplier(defaultPlatform()),
    sellerAccount: currentUserName(),
    purchaseDate: nowDateTime(),
    freightAmount: 0,
    discountAmount: 0,
    otherAmount: 0,
    paymentMethod: '银行卡',
    remark: '',
    items: [newItem()]
  })
  itemErrors.value = [{}]
  formRef.value?.clearValidate()
}

function newItem() {
  return {
    id: null,
    productId: null,
    conditionDesc: '',
    deviceNo: '',
    quantity: 1,
    unitPrice: 0,
    ocrAmountLocked: false,
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

function statusText(status) {
  const map = {
    0: '已取消',
    1: '待到货',
    2: '已入库',
    4: '部分售出',
    5: '已售出'
  }
  return map[status] || '未知'
}

function statusType(status) {
  const map = {
    0: 'info',
    1: 'warning',
    2: 'success',
    4: 'warning',
    5: 'info'
  }
  return map[status] || 'info'
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function formatDateTime(value) {
  return normalizeDateTimeValue(value) || '-'
}

function defaultPlatform() {
  return '京东'
}

function defaultSupplier(platform) {
  const map = {
    京东: '京东',
    闲鱼: '闲鱼',
    转转: '转转',
    淘宝: '淘宝',
    拼多多: '拼多多',
    线下: '线下'
  }
  return map[platform] || platform || ''
}

function currentUserName() {
  return userStore.user?.nickname || userStore.user?.username || ''
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function nowDateTime() {
  const now = new Date()
  return `${formatDate(now)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function normalizeDateTimeValue(value) {
  if (!value) {
    return ''
  }
  const text = String(value).replace('T', ' ')
  return text.length === 10 ? `${text} 00:00:00` : text.slice(0, 19)
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






