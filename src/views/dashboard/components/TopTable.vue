<template>
  <el-table :data="data" size="small" border>
    <el-table-column prop="rankNo" label="排名" width="64" />
    <el-table-column prop="productName" label="商品" min-width="140" show-overflow-tooltip />
    <el-table-column v-if="mode === 'sales'" prop="quantity" label="销量" width="72" />
    <el-table-column v-if="mode === 'sales'" label="销售额" width="110">
      <template #default="{ row }">￥{{ formatMoney(row.saleAmount) }}</template>
    </el-table-column>
    <el-table-column v-if="mode === 'profit'" label="利润" width="110">
      <template #default="{ row }">￥{{ formatMoney(row.profitAmount) }}</template>
    </el-table-column>
    <el-table-column v-if="mode === 'profit'" label="利润率" width="86">
      <template #default="{ row }">{{ formatRate(row.profitRate) }}</template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  mode: { type: String, default: 'sales' }
})

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function formatRate(value) {
  return `${Number(value || 0).toFixed(2)}%`
}
</script>
