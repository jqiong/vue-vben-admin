<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { ElCard, ElDatePicker, ElSelect, ElOption, ElButton } from 'element-plus';
import dayjs from 'dayjs';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { Page } from '@vben/common-ui';

const lineChartRef = ref<EchartsUIType>();
const barChartRef = ref<EchartsUIType>();
const { renderEcharts: renderLineChart } = useEcharts(lineChartRef);
const { renderEcharts: renderBarChart } = useEcharts(barChartRef);

const timeUnit = ref<'month' | 'day'>('day');
const year1 = ref(2024);
const year2 = ref(2025);
const monthRange = ref([1, 3]);
const dateRange = ref<[string, string]>(['2024-01-01', '2024-03-31']);

const queryTimeUnit = ref<'month' | 'day'>('day');
const queryYear1 = ref(2024);
const queryYear2 = ref(2025);
const queryMonthRange = ref([1, 3]);
const queryDateRange = ref<[string, string]>(['2024-01-01', '2024-03-31']);

const registerData2024: Record<string, number> = {};
const registerData2025: Record<string, number> = {};

function generateRandomData() {
  const start2024 = dayjs('2024-01-01');
  const start2025 = dayjs('2025-01-01');
  
  for (let i = 0; i < 366; i++) {
    const date2024 = start2024.add(i, 'day');
    const date2025 = start2025.add(i, 'day');
    registerData2024[date2024.format('YYYY-MM-DD')] = Math.floor(Math.random() * 100) + 50;
    if (i < 365) {
      registerData2025[date2025.format('YYYY-MM-DD')] = Math.floor(Math.random() * 100) + 60;
    }
  }
  
  for (let m = 1; m <= 12; m++) {
    const monthKey2024 = `2024-${String(m).padStart(2, '0')}`;
    const monthKey2025 = `2025-${String(m).padStart(2, '0')}`;
    let monthTotal2024 = 0;
    let monthTotal2025 = 0;
    
    for (let d = 1; d <= 31; d++) {
      const dateKey2024 = `${monthKey2024}-${String(d).padStart(2, '0')}`;
      const dateKey2025 = `${monthKey2025}-${String(d).padStart(2, '0')}`;
      if (registerData2024[dateKey2024]) monthTotal2024 += registerData2024[dateKey2024];
      if (registerData2025[dateKey2025]) monthTotal2025 += registerData2025[dateKey2025];
    }
    registerData2024[monthKey2024] = monthTotal2024;
    registerData2025[monthKey2025] = monthTotal2025;
  }
}

generateRandomData();

const chartData = computed(() => {
  const labels: string[] = [];
  const data1: number[] = [];
  const data2: number[] = [];

  if (queryTimeUnit.value === 'day') {
    const start = dayjs(queryDateRange.value[0]);
    const end = dayjs(queryDateRange.value[1]);
    let current = start;
    
    while (current.isBefore(end) || current.isSame(end)) {
      const dateKey = current.format('MM-DD');
      labels.push(dateKey);
      
      const fullKey1 = `${queryYear1.value}-${dateKey}`;
      const fullKey2 = `${queryYear2.value}-${dateKey}`;
      data1.push(registerData2024[fullKey1] || 0);
      data2.push(registerData2025[fullKey2] || 0);
      
      current = current.add(1, 'day');
    }
  } else {
    for (let m = queryMonthRange.value[0]; m <= queryMonthRange.value[1]; m++) {
      const monthKey = `${m}月`;
      labels.push(monthKey);
      
      const fullKey1 = `${queryYear1.value}-${String(m).padStart(2, '0')}`;
      const fullKey2 = `${queryYear2.value}-${String(m).padStart(2, '0')}`;
      data1.push(registerData2024[fullKey1] || 0);
      data2.push(registerData2025[fullKey2] || 0);
    }
  }

  return { labels, data1, data2 };
});

function updateCharts() {
  const { labels, data1, data2 } = chartData.value;

  renderLineChart({
    grid: {
      bottom: '15%',
      containLabel: true,
      left: '3%',
      right: '4%',
    },
    legend: {
      bottom: 10,
      data: [`${queryYear1.value}年注册用户`, `${queryYear2.value}年注册用户`],
    },
    series: [
      {
        data: data1,
        itemStyle: { color: '#1890ff' },
        lineStyle: { color: '#1890ff', width: 2 },
        name: `${queryYear1.value}年注册用户`,
        smooth: true,
        type: 'line',
      },
      {
        data: data2,
        itemStyle: { color: '#faad14' },
        lineStyle: { color: '#faad14', width: 2 },
        name: `${queryYear2.value}年注册用户`,
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      boundaryGap: false,
      data: labels,
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
  });

  renderBarChart({
    grid: {
      bottom: '15%',
      containLabel: true,
      left: '3%',
      right: '4%',
    },
    legend: {
      bottom: 10,
      data: [`${queryYear1.value}年注册用户`, `${queryYear2.value}年注册用户`],
    },
    series: [
      {
        barWidth: '35%',
        data: data1,
        itemStyle: { color: '#1890ff' },
        name: `${queryYear1.value}年注册用户`,
        type: 'bar',
      },
      {
        barWidth: '35%',
        data: data2,
        itemStyle: { color: '#faad14' },
        name: `${queryYear2.value}年注册用户`,
        type: 'bar',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: labels,
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
  });
}

function handleQuery() {
  queryTimeUnit.value = timeUnit.value;
  queryYear1.value = year1.value;
  queryYear2.value = year2.value;
  queryMonthRange.value = [...monthRange.value];
  queryDateRange.value = [...dateRange.value] as [string, string];
  updateCharts();
}

function handleReset() {
  timeUnit.value = 'day';
  year1.value = 2024;
  year2.value = 2025;
  monthRange.value = [1, 3];
  dateRange.value = ['2024-01-01', '2024-03-31'];
}

updateCharts();
</script>

<template>
  <Page description="对比不同年份相同时期的注册用户数据" title="注册用户对比">
    <ElCard class="mb-4">
      <template #header>
        <span>查询条件</span>
      </template>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <span class="text-gray-600">时间单位：</span>
          <ElSelect v-model="timeUnit" style="width: 120px">
            <ElOption label="按日" value="day" />
            <ElOption label="按月" value="month" />
          </ElSelect>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-gray-600">对比年份1：</span>
          <ElSelect v-model="year1" style="width: 120px">
            <ElOption :label="String(y)" :value="y" v-for="y in [2024, 2025]" :key="y" />
          </ElSelect>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-gray-600">对比年份2：</span>
          <ElSelect v-model="year2" style="width: 120px">
            <ElOption :label="String(y)" :value="y" v-for="y in [2024, 2025]" :key="y" />
          </ElSelect>
        </div>

        <div v-if="timeUnit === 'month'" class="flex items-center gap-2">
          <span class="text-gray-600">月份范围：</span>
          <ElSelect v-model="monthRange[0]" style="width: 100px">
            <ElOption :label="`${m}月`" :value="m" v-for="m in 12" :key="m" />
          </ElSelect>
          <span class="text-gray-500">至</span>
          <ElSelect v-model="monthRange[1]" style="width: 100px">
            <ElOption :label="`${m}月`" :value="m" v-for="m in 12" :key="m" />
          </ElSelect>
        </div>

        <div v-else class="flex items-center gap-2">
          <span class="text-gray-600">日期范围：</span>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <ElButton type="primary" @click="handleQuery">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard class="mb-4">
      <template #header>
        <span>注册用户趋势 (折线图)</span>
      </template>
      <div style="height: 350px">
        <EchartsUI ref="lineChartRef" />
      </div>
    </ElCard>

    <ElCard>
      <template #header>
        <span>注册用户对比 (柱状图)</span>
      </template>
      <div style="height: 350px">
        <EchartsUI ref="barChartRef" />
      </div>
    </ElCard>
  </Page>
</template>
