<template>
  <div class="suggestion-list">
    <div v-for="item in data" :key="item.sortNo" class="suggestion-item">
      <span>{{ item.sortNo }}</span>
      <p>{{ item.content }}</p>
      <el-tag size="small" :type="tagType(item.riskLevel)">经营参考</el-tag>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] }
})

function tagType(level) {
  if (level === 'high') return 'danger'
  if (level === 'medium') return 'warning'
  return 'success'
}
</script>
