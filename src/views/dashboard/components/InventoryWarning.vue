<template>
  <div class="warning-list">
    <div v-for="item in data" :key="item.productName" class="warning-item">
      <div>
        <strong>{{ item.productName }}</strong>
        <span>库存 {{ item.inventoryQuantity }} / 预警 {{ item.warningValue }}</span>
      </div>
      <el-tag :type="item.inventoryQuantity === 0 ? 'danger' : 'warning'">{{ item.status }}</el-tag>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] }
})
</script>
