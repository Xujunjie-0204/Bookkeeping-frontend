<template>
  <main class="login-page">
    <section class="login-visual">
      <div class="brand-block">
        <div class="brand-mark">账</div>
        <h1>经营记账管理系统</h1>
        <p>采购、库存、销售和利润，用一套后台清清楚楚地管起来。</p>
      </div>
      <div class="metric-strip">
        <div>
          <span>销售</span>
          <strong>日清月结</strong>
        </div>
        <div>
          <span>库存</span>
          <strong>批次追踪</strong>
        </div>
        <div>
          <span>利润</span>
          <strong>自动核算</strong>
        </div>
      </div>
    </section>

    <section class="login-panel" aria-label="登录表单">
      <div class="panel-inner">
        <h2>登录后台</h2>
        <p class="subtext">使用管理员账号进入经营看板</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          label-position="top"
          @submit.prevent
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="form.username" :prefix-icon="User" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              :prefix-icon="Lock"
              type="password"
              autocomplete="current-password"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button
            class="login-button"
            type="primary"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>

        <div class="hint-line">
          <span>默认账号：admin</span>
          <span>默认密码：admin123</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid || loading.value) {
    return
  }
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/dashboard')
  } finally {
    loading.value = false
  }
}
</script>
