<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/products" router>
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
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
              <h2>商品列表</h2>
              <p>维护商品基础资料、默认售价、成本价和库存预警值。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadProducts">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增商品</el-button>
            </div>
          </div>

          <el-form class="filter-bar product-filter" :model="query" label-position="left">
            <el-form-item label="关键字">
              <el-input
                v-model.trim="query.keyword"
                clearable
                placeholder="商品编码/名称"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="商品类型">
              <el-tree-select
                v-model="query.productTypeId"
                :data="productTypeOptions"
                :props="{ label: 'typeName', value: 'id', children: 'children' }"
                check-strictly
                clearable
                filterable
                placeholder="全部类型"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="query.status" clearable placeholder="全部状态">
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
              <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="table-scroll">
            <el-table v-loading="loading" :data="products" border>
              <el-table-column prop="productCode" label="商品编码" min-width="130" />
              <el-table-column prop="productName" label="商品名称" min-width="180" show-overflow-tooltip />
              <el-table-column prop="productTypeName" label="商品类型" min-width="130" show-overflow-tooltip />
              <el-table-column prop="brand" label="品牌" min-width="110" show-overflow-tooltip />
              <el-table-column prop="model" label="型号" min-width="120" show-overflow-tooltip />
              <el-table-column prop="specification" label="规格" min-width="150" show-overflow-tooltip />
              <el-table-column prop="defaultCost" label="默认成本" width="110" />
              <el-table-column prop="defaultSalePrice" label="默认售价" width="110" />
              <el-table-column prop="warningStock" label="预警库存" width="100" />
              <el-table-column prop="status" label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                    {{ row.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                    <el-popconfirm title="确认删除该商品？" @confirm="handleDelete(row)">
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
              @size-change="loadProducts"
              @current-change="loadProducts"
            />
          </div>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑商品' : '新增商品'" width="720px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <div class="form-grid">
          <el-form-item label="商品编码" prop="productCode">
            <el-input v-model.trim="form.productCode" maxlength="50" />
          </el-form-item>
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model.trim="form.productName" maxlength="100" />
          </el-form-item>
          <el-form-item label="商品类型" prop="productTypeId">
            <el-tree-select
              v-model="form.productTypeId"
              :data="productTypeOptions"
              :props="{ label: 'typeName', value: 'id', children: 'children' }"
              check-strictly
              clearable
              filterable
            />
          </el-form-item>
          <el-form-item label="品牌" prop="brand">
            <el-input v-model.trim="form.brand" maxlength="50" />
          </el-form-item>
          <el-form-item label="型号" prop="model">
            <el-input v-model.trim="form.model" maxlength="80" />
          </el-form-item>
          <el-form-item label="规格" prop="specification">
            <el-input v-model.trim="form.specification" maxlength="200" />
          </el-form-item>
          <el-form-item label="默认成本" prop="defaultCost">
            <el-input-number v-model="form.defaultCost" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="默认售价" prop="defaultSalePrice">
            <el-input-number v-model="form.defaultSalePrice" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="预警库存" prop="warningStock">
            <el-input-number v-model="form.warningStock" :min="0" :precision="0" />
          </el-form-item>
          <el-form-item label="启用状态" prop="status">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="form.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CollectionTag,
  DataLine,
  Delete,
  Edit,
  Goods,
  Menu,
  Plus,
  Refresh,
  RefreshLeft,
  Search,
  Setting,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import {
  createProductApi,
  deleteProductApi,
  getProductsApi,
  getProductTypeTreeApi,
  updateProductApi
} from '@/api/product'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const products = ref([])
const productTypeOptions = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  productTypeId: null,
  status: null
})

const form = reactive({
  productCode: '',
  productName: '',
  productTypeId: null,
  brand: '',
  model: '',
  specification: '',
  defaultCost: 0,
  defaultSalePrice: 0,
  warningStock: 0,
  status: 1,
  remark: ''
})

const rules = {
  productCode: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  defaultCost: [{ required: true, message: '请输入默认成本', trigger: 'blur' }],
  defaultSalePrice: [{ required: true, message: '请输入默认售价', trigger: 'blur' }],
  warningStock: [{ required: true, message: '请输入预警库存', trigger: 'blur' }]
}

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadProductTypes()
  loadProducts()
})

async function loadProducts() {
  loading.value = true
  try {
    const result = await getProductsApi(query)
    products.value = result.list || []
    total.value = result.total || 0
  } finally {
    loading.value = false
  }
}

async function loadProductTypes() {
  productTypeOptions.value = await getProductTypeTreeApi()
}

function handleSearch() {
  query.pageNum = 1
  loadProducts()
}

function handleReset() {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    productTypeId: null,
    status: null
  })
  loadProducts()
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    productCode: row.productCode || '',
    productName: row.productName || '',
    productTypeId: row.productTypeId || null,
    brand: row.brand || '',
    model: row.model || '',
    specification: row.specification || '',
    defaultCost: Number(row.defaultCost || 0),
    defaultSalePrice: Number(row.defaultSalePrice || 0),
    warningStock: row.warningStock || 0,
    status: row.status ?? 1,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid || saving.value) {
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateProductApi(editingId.value, { ...form })
      ElMessage.success('商品已更新')
    } else {
      await createProductApi({ ...form })
      ElMessage.success('商品已新增')
    }
    dialogVisible.value = false
    await loadProducts()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await deleteProductApi(row.id)
  ElMessage.success('商品已删除')
  await loadProducts()
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function resetForm() {
  Object.assign(form, {
    productCode: '',
    productName: '',
    productTypeId: null,
    brand: '',
    model: '',
    specification: '',
    defaultCost: 0,
    defaultSalePrice: 0,
    warningStock: 0,
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
}
</script>
