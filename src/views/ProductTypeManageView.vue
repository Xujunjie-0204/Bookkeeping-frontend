<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/product-types" router>
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
          <el-breadcrumb-item>商品类型</el-breadcrumb-item>
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
              <h2>商品类型</h2>
              <p>维护商品分类层级，用于商品资料归类和后续统计筛选。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadTypes">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate()">新增类型</el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="types"
            row-key="id"
            border
            default-expand-all
            :tree-props="{ children: 'children' }"
          >
            <el-table-column prop="typeName" label="类型名称" min-width="180" />
            <el-table-column prop="typeCode" label="类型编码" min-width="150" />
            <el-table-column prop="sortOrder" label="排序" width="90" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" width="230" fixed="right">
              <template #default="{ row }">
                <el-button :icon="Plus" text type="primary" @click="openCreate(row)">新增下级</el-button>
                <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                <el-popconfirm title="确认删除该商品类型？" @confirm="handleDelete(row)">
                  <template #reference>
                    <el-button :icon="Delete" text type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑商品类型' : '新增商品类型'" width="540px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="上级类型" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'typeName', value: 'id', children: 'children' }"
            check-strictly
            filterable
          />
        </el-form-item>
        <el-form-item label="类型编码" prop="typeCode">
          <el-input v-model.trim="form.typeCode" maxlength="50" placeholder="phone-accessory" />
        </el-form-item>
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model.trim="form.typeName" maxlength="100" placeholder="手机配件" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
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
import { computed, onMounted, reactive, ref } from 'vue'
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
  Setting,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import {
  createProductTypeApi,
  deleteProductTypeApi,
  getProductTypeTreeApi,
  updateProductTypeApi
} from '@/api/product'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const types = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({
  parentId: 0,
  typeCode: '',
  typeName: '',
  sortOrder: 0,
  status: 1,
  remark: ''
})

const rules = {
  typeCode: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9_-]{2,50}$/,
      message: '类型编码只能包含字母、数字、下划线和中横线',
      trigger: 'blur'
    }
  ],
  typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }]
}

const parentOptions = computed(() => [
  { id: 0, typeName: '根类型', children: types.value }
])

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadTypes()
})

async function loadTypes() {
  loading.value = true
  try {
    types.value = await getProductTypeTreeApi()
  } finally {
    loading.value = false
  }
}

function openCreate(parent) {
  editingId.value = null
  resetForm()
  if (parent) {
    form.parentId = parent.id
  }
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    parentId: row.parentId || 0,
    typeCode: row.typeCode || '',
    typeName: row.typeName || '',
    sortOrder: row.sortOrder || 0,
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
      await updateProductTypeApi(editingId.value, { ...form })
      ElMessage.success('商品类型已更新')
    } else {
      await createProductTypeApi({ ...form })
      ElMessage.success('商品类型已新增')
    }
    dialogVisible.value = false
    await loadTypes()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await deleteProductTypeApi(row.id)
  ElMessage.success('商品类型已删除')
  await loadTypes()
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function resetForm() {
  Object.assign(form, {
    parentId: 0,
    typeCode: '',
    typeName: '',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
}
</script>
