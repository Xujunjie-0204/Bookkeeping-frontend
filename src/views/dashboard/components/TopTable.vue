<template>
  <div class="top-rank">
    <div class="top-rank-toolbar">
      <span>一次查询前 {{ rows.length }} 个，窗口显示 10 个</span>
      <span v-if="rows.length > 10" class="top-rank-auto">自动滚动</span>
    </div>

    <div v-if="rows.length" class="top-rank-head">
      <span>排名</span>
      <span>商品</span>
      <span>{{ primaryLabel }}</span>
      <span>{{ secondaryLabel }}</span>
      <span>占比</span>
    </div>

    <div v-if="rows.length" class="top-rank-viewport">
      <div
        class="top-rank-list"
        :class="{ 'is-scrolling': rows.length > 10 }"
        :style="{ '--scroll-duration': `${Math.max(rows.length * 1.6, 18)}s` }"
      >
        <article
          v-for="(row, index) in displayRows"
          :key="`${mode}-${index}-${row.rankNo}-${row.productName}`"
          class="top-rank-row"
          :class="{ 'is-medal': row.rankNo <= 3 }"
        >
          <span class="top-rank-no">{{ row.rankNo }}</span>
          <strong class="top-rank-name" :title="row.productName">{{ row.productName || '-' }}</strong>
          <span class="top-rank-primary">{{ primaryValue(row) }}</span>
          <span class="top-rank-secondary">{{ secondaryValue(row) }}</span>
          <span class="top-rank-bar"><i :style="{ width: `${progressWidth(row)}%` }" /></span>
        </article>
      </div>
    </div>

    <el-empty v-if="!rows.length" description="暂无排行数据" :image-size="80" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  mode: { type: String, default: 'sales' }
})

const rows = computed(() => props.data.slice(0, 30))
const displayRows = computed(() => (rows.value.length > 10 ? [...rows.value, ...rows.value] : rows.value))
const isSalesMode = computed(() => props.mode === 'sales')
const primaryLabel = computed(() => (isSalesMode.value ? '销量' : '利润'))
const secondaryLabel = computed(() => (isSalesMode.value ? '销售额' : '利润率'))
const maxValue = computed(() => {
  const values = rows.value.map((row) => Math.abs(Number(isSalesMode.value ? row.quantity : row.profitAmount) || 0))
  return Math.max(...values, 1)
})

function primaryValue(row) {
  if (isSalesMode.value) {
    return `${Number(row.quantity || 0)} 件`
  }
  return `￥${formatMoney(row.profitAmount)}`
}

function secondaryValue(row) {
  if (isSalesMode.value) {
    return `￥${formatMoney(row.saleAmount)}`
  }
  return formatRate(row.profitRate)
}

function progressWidth(row) {
  const value = Math.abs(Number(isSalesMode.value ? row.quantity : row.profitAmount) || 0)
  return Math.max(6, Math.round((value / maxValue.value) * 100))
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function formatRate(value) {
  return `${Number(value || 0).toFixed(2)}%`
}
</script>
