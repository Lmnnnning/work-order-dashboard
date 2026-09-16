<template>
  <div ref="chartRef" class="bar-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let instance = null

const buildOption = (list) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => {
      const p = params[0]
      return `<b>${p.name}</b><br/>Total Hours: <b>${p.value}h</b>`
    }
  },
  grid: { top: 30, left: 40, right: 24, bottom: 70 },
  xAxis: {
    type: 'category',
    data: list.map((d) => d.project),
    axisLabel: {
      interval: 0,
      rotate: 25,
      color: '#595959'
    }
  },
  yAxis: {
    type: 'value',
    name: 'Hours',
    nameTextStyle: { color: '#8c8c8c' }
  },
  series: [
    {
      name: 'Hours',
      type: 'bar',
      data: list.map((d) => d.hours),
      barWidth: '45%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#40a9ff' },
          { offset: 1, color: '#1890ff' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: '#262626',
        formatter: '{c}h'
      }
    }
  ]
})

const render = () => {
  if (!instance || !chartRef.value) return
  instance.setOption(buildOption(props.data), true)
}

const resizeHandler = () => instance?.resize()

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    instance = echarts.init(chartRef.value)
    render()
    window.addEventListener('resize', resizeHandler)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  instance?.dispose()
  instance = null
})

watch(
  () => props.data,
  () => render(),
  { deep: true }
)
</script>

<style lang="less" scoped>
.bar-chart {
  width: 100%;
  height: 360px;
}
</style>
