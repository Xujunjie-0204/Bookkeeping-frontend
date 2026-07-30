<template>
  <div ref="chartRef" class="dashboard-chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const chartRef = ref()
let chart

onMounted(() => {
  chart = echarts.init(chartRef.value)
  renderChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})

watch(() => props.data, renderChart, { deep: true })

function resizeChart() {
  chart?.resize()
}

function renderChart() {
  if (!chart) return
  chart.setOption({
    color: ['#2563eb', '#f59e0b', '#f97316', '#ef4444'],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '43%'],
      data: props.data.map((item) => ({ name: item.name, value: Number(item.value || 0) }))
    }]
  })
}
</script>
