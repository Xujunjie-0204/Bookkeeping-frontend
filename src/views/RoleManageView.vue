<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-title">经营记账</div>
      <el-menu default-active="/system/roles" router>
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
          <el-breadcrumb-item>系统管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色管理</el-breadcrumb-item>
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
              <h2>角色管理</h2>
              <p>维护角色，并给角色分配菜单和按钮权限。</p>
            </div>
            <div class="toolbar-actions">
              <el-button :icon="Refresh" :loading="loading" @click="loadRoles">刷新</el-button>
              <el-button type="primary" :icon="Plus" @click="openCreate">新增角色</el-button>
            </div>
          </div>

          <el-table v-loading="loading" :data="roles" border>
            <el-table-column prop="roleCode" label="角色编码" min-width="150" />
            <el-table-column prop="roleName" label="角色名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="230" fixed="right" align="center">
              <template #default="{ row }">
                <div class="row-actions type-row-actions">
                  <el-button :icon="Key" text type="primary" @click="openAssign(row)">分配权限</el-button>
                  <el-button :icon="Edit" text @click="openEdit(row)">编辑</el-button>
                  <el-popconfirm title="确认删除该角色？" @confirm="handleDelete(row)">
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑角色' : '新增角色'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model.trim="form.roleCode" maxlength="50" placeholder="admin" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="form.roleName" maxlength="50" />
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

    <el-drawer v-model="assignVisible" title="分配菜单权限" size="420px">
      <div class="assign-header">
        <strong>{{ currentRole?.roleName }}</strong>
        <span>{{ currentRole?.roleCode }}</span>
      </div>
      <el-tree
        ref="menuTreeRef"
        v-loading="assignLoading"
        :data="menus"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ label: 'menuName', children: 'children' }"
      >
        <template #default="{ data }">
          <span class="permission-node">
            <span>{{ data.menuName }}</span>
            <small v-if="data.permissionCode">{{ data.permissionCode }}</small>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignSaving" @click="handleAssignSubmit">保存权限</el-button>
      </template>
    </el-drawer>
  </el-container>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataLine,
  Box,
  Delete,
  Edit,
  CollectionTag,
  Goods,
  Key,
  Menu,
  Plus,
  Refresh,
  Setting,
  Sell, ShoppingCart,
  SwitchButton,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import {
  assignRoleMenusApi,
  createRoleApi,
  deleteRoleApi,
  getMenuTreeApi,
  getRoleMenuIdsApi,
  getRolesApi,
  updateRoleApi
} from '@/api/system'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const roles = ref([])
const menus = ref([])
const loading = ref(false)
const saving = ref(false)
const assignLoading = ref(false)
const assignSaving = ref(false)
const dialogVisible = ref(false)
const assignVisible = ref(false)
const editingId = ref(null)
const currentRole = ref(null)
const formRef = ref()
const menuTreeRef = ref()

const form = reactive({
  roleCode: '',
  roleName: '',
  status: 1,
  remark: ''
})

const rules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9_:.-]{2,50}$/,
      message: '角色编码只能包含字母、数字、下划线、冒号、点和中横线',
      trigger: 'blur'
    }
  ],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

onMounted(() => {
  if (!userStore.user) {
    userStore.fetchProfile()
  }
  loadRoles()
})

async function loadRoles() {
  loading.value = true
  try {
    roles.value = await getRolesApi()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    roleCode: row.roleCode || '',
    roleName: row.roleName || '',
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
      await updateRoleApi(editingId.value, { ...form })
      ElMessage.success('角色已更新')
    } else {
      await createRoleApi({ ...form })
      ElMessage.success('角色已新增')
    }
    dialogVisible.value = false
    await loadRoles()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await deleteRoleApi(row.id)
  ElMessage.success('角色已删除')
  await loadRoles()
}

async function openAssign(row) {
  currentRole.value = row
  assignVisible.value = true
  assignLoading.value = true
  try {
    const [tree, checkedIds] = await Promise.all([
      getMenuTreeApi(),
      getRoleMenuIdsApi(row.id)
    ])
    menus.value = tree
    await nextTick()
    menuTreeRef.value?.setCheckedKeys(filterLeafCheckedIds(tree, checkedIds))
  } finally {
    assignLoading.value = false
  }
}

async function handleAssignSubmit() {
  if (!currentRole.value || assignSaving.value) {
    return
  }
  assignSaving.value = true
  try {
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
    await assignRoleMenusApi(currentRole.value.id, [...checkedKeys, ...halfCheckedKeys])
    ElMessage.success('权限已保存')
    assignVisible.value = false
  } finally {
    assignSaving.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  router.replace('/login')
}

function resetForm() {
  Object.assign(form, {
    roleCode: '',
    roleName: '',
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
}

function filterLeafCheckedIds(tree, checkedIds) {
  const leafIds = new Set()
  collectLeafIds(tree, leafIds)
  return checkedIds.filter((id) => leafIds.has(Number(id)))
}

function collectLeafIds(nodes, leafIds) {
  nodes.forEach((node) => {
    if (node.children?.length) {
      collectLeafIds(node.children, leafIds)
      return
    }
    leafIds.add(Number(node.id))
  })
}
</script>






