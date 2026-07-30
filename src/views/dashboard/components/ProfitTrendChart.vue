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
    color: ['#16a34a'],
    grid: { left: 42, right: 16, top: 28, bottom: 36 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: props.data.map((item) => item.date), boundaryGap: false },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.12 }, data: props.data.map((item) => Number(item.amount || 0)) }]
  })
}
</script>
