<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/system/menus" router>
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
          <el-breadcrumb-item>系统管理</el-breadcrumb-item>
          <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
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
              <h2>菜单管理</h2>
              <p>维护目录、页面菜单和按钮权限标识。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadMenus">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate()">新增菜单</el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="menus"
            row-key="id"
            border
            default-expand-all
            :tree-props="{ children: 'children' }"
          >
            <el-table-column prop="menuName" label="菜单名称" min-width="180" />
            <el-table-column prop="menuType" label="类型" width="92">
              <template #default="{ row }">
                <el-tag :type="typeMeta[row.menuType]?.tag || 'info'">
                  {{ typeMeta[row.menuType]?.label || row.menuType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="路由地址" min-width="150" show-overflow-tooltip />
            <el-table-column prop="component" label="组件" min-width="150" show-overflow-tooltip />
            <el-table-column prop="permissionCode" label="权限标识" min-width="180" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="82" />
            <el-table-column prop="visible" label="显示" width="82">
              <template #default="{ row }">
                <el-tag :type="row.visible === 1 ? 'success' : 'info'">
                  {{ row.visible === 1 ? '显示' : '隐藏' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="82">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="210" fixed="right" align="center">
              <template #default="{ row }">
                <div class="row-actions type-row-actions">
                  <el-button :icon="Plus" text type="primary" @click="openCreate(row)">新增下级</el-button>
                  <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                  <el-popconfirm title="确认删除该菜单？" @confirm="handleDelete(row)">
                    <template #reference>
                      <el-button :icon="Delete" text type="danger">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑菜单' : '新增菜单'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'menuName', value: 'id', children: 'children' }"
            check-strictly
            filterable
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model.trim="form.menuName" maxlength="50" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-segmented v-model="form.menuType" :options="menuTypeOptions" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model.trim="form.path" placeholder="/system/menus" maxlength="120" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model.trim="form.component" placeholder="MenuManageView" maxlength="120" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permissionCode">
          <el-input v-model.trim="form.permissionCode" placeholder="system:menu:view" maxlength="100" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model.trim="form.icon" placeholder="Menu" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="显示状态" prop="visible">
          <el-switch v-model="form.visible" :active-value="1" :inactive-value="0" />
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
  DataLine,
  Box,
  Delete,
  Edit,
  CollectionTag,
  Goods,
  Menu,
  Plus,
  Refresh,
  Setting,
  Sell, ShoppingCart,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { createMenuApi, deleteMenuApi, getMenuTreeApi, updateMenuApi } from '@/api/system'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const menus = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({
  parentId: 0,
  menuName: '',
  menuType: 'C',
  path: '',
  component: '',
  permissionCode: '',
  icon: '',
  sortOrder: 0,
  visible: 1,
  status: 1,
  remark: ''
})

const menuTypeOptions = [
  { label: '目录', value: 'M' },
  { label: '菜单', value: 'C' },
  { label: '按钮', value: 'F' }
]

const typeMeta = {
  M: { label: '目录', tag: 'warning' },
  C: { label: '菜单', tag: 'success' },
  F: { label: '按钮', tag: 'info' }
}

const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

const parentOptions = computed(() => [
  { id: 0, menuName: '根目录', children: menus.value }
])

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadMenus()
})

async function loadMenus() {
  loading.value = true
  try {
    menus.value = await getMenuTreeApi()
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
    menuName: row.menuName || '',
    menuType: row.menuType || 'C',
    path: row.path || '',
    component: row.component || '',
    permissionCode: row.permissionCode || '',
    icon: row.icon || '',
    sortOrder: row.sortOrder || 0,
    visible: row.visible ?? 1,
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
    const payload = { ...form }
    if (editingId.value) {
      await updateMenuApi(editingId.value, payload)
      ElMessage.success('菜单已更新')
    } else {
      await createMenuApi(payload)
      ElMessage.success('菜单已新增')
    }
    dialogVisible.value = false
    await loadMenus()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await deleteMenuApi(row.id)
  ElMessage.success('菜单已删除')
  await loadMenus()
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function resetForm() {
  Object.assign(form, {
    parentId: 0,
    menuName: '',
    menuType: 'C',
    path: '',
    component: '',
    permissionCode: '',
    icon: '',
    sortOrder: 0,
    visible: 1,
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
}
</script>






