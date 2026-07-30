<template>
  <el-card class="dashboard-stat-card" shadow="never">
    <div class="stat-card-head">
      <span>{{ title }}</span>
      <el-icon :class="['stat-card-icon', tone]"><component :is="icon" /></el-icon>
    </div>
    <el-statistic :value="value" :formatter="formatter" />
    <div class="stat-card-compare">同比数据预留</div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  type: { type: String, default: 'amount' },
  icon: { type: Object, required: true },
  tone: { type: String, default: 'sale' }
})

function formatter(value) {
  const numberValue = Number(value || 0)
  if (props.type === 'quantity') {
    return String(Math.round(numberValue))
  }
  return `￥${numberValue.toFixed(2)}`
}
</script>
