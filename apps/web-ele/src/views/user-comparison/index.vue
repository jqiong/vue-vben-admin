<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElOption,
  ElSelect,
} from 'element-plus';

type TimeUnit = 'month' | 'day';

const timeUnit = ref<TimeUnit>('month');
const year1 = ref(2024);
const year2 = ref(2025);
const monthStart = ref(1);
const monthEnd = ref(12);
const dayStart = ref('');
const dayEnd = ref('');

const lineChartRef = ref<EchartsUIType>();
const barChartRef = ref<EchartsUIType>();
const { renderEcharts: renderLineChart } = useEcharts(lineChartRef);
const { renderEcharts: renderBarChart } = useEcharts(barChartRef);

const mockData2024: Record<string, number> = {};
const mockData2025: Record<string, number> = {};

function initMockData() {
  for (let year = 2024; year <= 2025; year++) {
    const data = year === 2024 ? mockData2024 : mockData2025;
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const baseValue = Math.floor(Math.random() * 100) + 50;
        const weekendFactor = (new Date(year, month - 1, day).getDay() === 0 || 
          new Date(year, month - 1, day).getDay() === 6) ? 0.7 : 1;
        const monthFactor = month >= 6 ? 1.2 : 1;
        data[dateStr] = Math.floor(baseValue * weekendFactor * monthFactor);
      }
    }
  }
}

initMockData();

function getMonthData(year: number, startMonth: number, endMonth: number) {
  const data: number[] = [];
  const labels: string[] = [];
  
  for (let month = startMonth; month <= endMonth; month++) {
    let total = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dataSource = year === 2024 ? mockData2024 : mockData2025;
      total += dataSource[dateStr] || 0;
    }
    
    data.push(total);
    labels.push(`${month}月`);
  }
  
  return { data, labels };
}

function getDayData(year: number, startDate: string, endDate: string) {
  const data: number[] = [];
  const labels: string[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dataSource = year === 2024 ? mockData2024 : mockData2025;
    
    data.push(dataSource[dateStr] || 0);
    labels.push(`${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`);
  }
  
  return { data, labels };
}

function renderCharts() {
  let data1: number[], data2: number[], labels: string[];
  
  if (timeUnit.value === 'month') {
    const result1 = getMonthData(year1.value, monthStart.value, monthEnd.value);
    const result2 = getMonthData(year2.value, monthStart.value, monthEnd.value);
    data1 = result1.data;
    data2 = result2.data;
    labels = result1.labels;
  } else {
    if (!dayStart.value || !dayEnd.value) {
      return;
    }
    const result1 = getDayData(year1.value, dayStart.value, dayEnd.value);
    const result2 = getDayData(year2.value, dayStart.value, dayEnd.value);
    data1 = result1.data;
    data2 = result2.data;
    labels = result1.labels;
  }
  
  const maxValue = Math.max(...data1, ...data2, 1);
  const yAxisMax = Math.ceil(maxValue * 1.2 / 10) * 10;
  
  renderLineChart({
    legend: {
      bottom: 0,
      data: [`${year1.value}年`, `${year2.value}年`],
    },
    grid: {
      bottom: 60,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '5%',
    },
    series: [
      {
        name: `${year1.value}年`,
        data: data1,
        itemStyle: { color: '#3b82f6' },
        smooth: true,
        type: 'line',
      },
      {
        name: `${year2.value}年`,
        data: data2,
        itemStyle: { color: '#f97316' },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: { lineStyle: { width: 1 } },
      trigger: 'axis',
    },
    xAxis: {
      data: labels,
      type: 'category',
      axisTick: { show: false },
    },
    yAxis: {
      max: yAxisMax,
      splitNumber: 4,
      type: 'value',
    },
  });
  
  renderBarChart({
    legend: {
      bottom: 0,
      data: [`${year1.value}年`, `${year2.value}年`],
    },
    grid: {
      bottom: 60,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '5%',
    },
    series: [
      {
        name: `${year1.value}年`,
        data: data1,
        type: 'bar',
        barMaxWidth: 60,
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: `${year2.value}年`,
        data: data2,
        type: 'bar',
        barMaxWidth: 60,
        itemStyle: { color: '#f97316' },
      },
    ],
    tooltip: {
      axisPointer: { type: 'shadow' },
      trigger: 'axis',
    },
    xAxis: {
      data: labels,
      type: 'category',
      axisTick: { show: false },
    },
    yAxis: {
      max: yAxisMax,
      splitNumber: 4,
      type: 'value',
    },
  });
}

function handleQuery() {
  renderCharts();
}

function handleReset() {
  timeUnit.value = 'month';
  year1.value = 2024;
  year2.value = 2025;
  monthStart.value = 1;
  monthEnd.value = 12;
  dayStart.value = '';
  dayEnd.value = '';
  renderCharts();
}

onMounted(() => {
  renderCharts();
});

const months = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }));
const years = [2023, 2024, 2025, 2026].map(y => ({ label: `${y}年`, value: y }));
</script>

<template>
  <Page title="注册用户对比">
    <ElCard class="mb-5">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">时间单位</span>
          <ElSelect v-model="timeUnit" style="width: 120px">
            <ElOption label="按月" value="month" />
            <ElOption label="按日" value="day" />
          </ElSelect>
        </div>
        
        <div class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">对比年份1</span>
          <ElSelect v-model="year1" style="width: 120px">
            <ElOption
              v-for="y in years"
              :key="y.value"
              :label="y.label"
              :value="y.value"
            />
          </ElSelect>
        </div>
        
        <div class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">对比年份2</span>
          <ElSelect v-model="year2" style="width: 120px">
            <ElOption
              v-for="y in years"
              :key="y.value"
              :label="y.label"
              :value="y.value"
            />
          </ElSelect>
        </div>
        
        <template v-if="timeUnit === 'month'">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-500">月份范围</span>
            <div class="flex items-center gap-1">
              <ElSelect v-model="monthStart" style="width: 100px">
                <ElOption
                  v-for="m in months"
                  :key="m.value"
                  :label="m.label"
                  :value="m.value"
                />
              </ElSelect>
              <span class="text-gray-400">至</span>
              <ElSelect v-model="monthEnd" style="width: 100px">
                <ElOption
                  v-for="m in months"
                  :key="m.value"
                  :label="m.label"
                  :value="m.value"
                />
              </ElSelect>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-500">日期范围</span>
            <div class="flex items-center gap-1">
              <ElDatePicker
                v-model="dayStart"
                type="date"
                placeholder="开始日期"
                format="MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 140px"
              />
              <span class="text-gray-400">至</span>
              <ElDatePicker
                v-model="dayEnd"
                type="date"
                placeholder="结束日期"
                format="MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 140px"
              />
            </div>
          </div>
        </template>
        
        <div class="flex gap-2">
          <ElButton type="primary" @click="handleQuery">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </div>
      </div>
    </ElCard>
    
    <div class="grid gap-5 lg:grid-cols-2">
      <ElCard>
        <template #header>
          <span class="font-semibold">注册用户趋势对比（折线图）</span>
        </template>
        <EchartsUI ref="lineChartRef" height="400px" />
      </ElCard>
      
      <ElCard>
        <template #header>
          <span class="font-semibold">注册用户数量对比（柱状图）</span>
        </template>
        <EchartsUI ref="barChartRef" height="400px" />
      </ElCard>
    </div>
  </Page>
</template>
