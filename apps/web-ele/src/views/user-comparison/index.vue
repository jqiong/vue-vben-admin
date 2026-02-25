<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { $t } from '#/locales';
import { ElButton, ElCard, ElCol, ElDatePicker, ElForm, ElFormItem, ElOption, ElRadioButton, ElRadioGroup, ElRow, ElSelect } from 'element-plus';

// 查询条件表单
interface QueryForm {
  timeUnit: 'month' | 'day';
  year1: number;
  year2: number;
  monthRange: [number, number];
  dayRange: [string, string]; // 格式: MM-DD
}

const queryForm = ref<QueryForm>(({
  timeUnit: 'month',
  year1: 2024,
  year2: 2025,
  monthRange: [1, 12],
  dayRange: ['01-01', '03-15'], // 默认1月1日到3月15日
}));

// 图表引用
const lineChartRef = ref<EchartsUIType>();
const barChartRef = ref<EchartsUIType>();
const { renderEcharts: renderLineChart } = useEcharts(lineChartRef);
const { renderEcharts: renderBarChart } = useEcharts(barChartRef);

// 生成模拟数据 - 2024年和2025年的每日注册用户数据
const dailyData2024 = generateDailyData(2024);
const dailyData2025 = generateDailyData(2025);

// 生成某年每日的模拟数据
function generateDailyData(year: number): Record<string, number> {
  const data: Record<string, number> = {};
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // 生成随机注册用户数，范围 50-300，带有一些波动
      const baseValue = 100 + Math.sin((month - 1) * Math.PI / 6) * 50;
      const randomFactor = Math.random() * 100 - 30;
      data[dateStr] = Math.max(10, Math.floor(baseValue + randomFactor));
    }
  }
  return data;
}

// 将每日数据汇总为月度数据
function aggregateToMonthly(dailyData: Record<string, number>): number[] {
  const monthlyData: number[] = new Array(12).fill(0);

  Object.entries(dailyData).forEach(([date, count]) => {
    const month = parseInt(date.split('-')[1], 10) - 1;
    monthlyData[month] += count;
  });

  return monthlyData;
}

// 获取指定月日范围内的数据（跨年份对比）
// dayRange格式: ['MM-DD', 'MM-DD']
function getDayRangeData(
  year: number,
  dayRange: [string, string],
): { labels: string[]; values: number[] } {
  const data = year === 2024 ? dailyData2024 : dailyData2025;
  const labels: string[] = [];
  const values: number[] = [];

  const [startMonthDay, endMonthDay] = dayRange;
  const [startMonth, startDay] = startMonthDay.split('-').map(Number);
  const [endMonth, endDay] = endMonthDay.split('-').map(Number);

  // 处理跨年情况（如 12-01 到 02-15）
  let currentMonth = startMonth;
  let currentDay = startDay;

  while (true) {
    const monthStr = String(currentMonth).padStart(2, '0');
    const dayStr = String(currentDay).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const displayLabel = `${currentMonth}/${currentDay}`;

    labels.push(displayLabel);
    values.push(data[dateKey] || 0);

    // 检查是否到达结束日期
    if (currentMonth === endMonth && currentDay === endDay) {
      break;
    }

    // 移动到下一天
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    currentDay++;
    if (currentDay > daysInMonth[currentMonth - 1]) {
      currentDay = 1;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
      }
    }

    // 防止无限循环
    if (labels.length > 366) {
      break;
    }
  }

  return { labels, values };
}

// 获取指定月份范围内的月度数据
function getMonthlyDataInRange(
  year: number,
  startMonth: number,
  endMonth: number,
): { labels: string[]; values: number[] } {
  const monthlyData = aggregateToMonthly(year === 2024 ? dailyData2024 : dailyData2025);
  const labels: string[] = [];
  const values: number[] = [];

  for (let m = startMonth; m <= endMonth; m++) {
    labels.push(`${m}月`);
    values.push(monthlyData[m - 1]);
  }

  return { labels, values };
}

// 计算当前查询条件下的数据
const chartData = computed(() => {
  const { timeUnit, year1, year2, monthRange, dayRange } = queryForm.value;

  let data1, data2;

  if (timeUnit === 'month') {
    data1 = getMonthlyDataInRange(year1, monthRange[0], monthRange[1]);
    data2 = getMonthlyDataInRange(year2, monthRange[0], monthRange[1]);
  } else {
    // 按日查询时，对比两个年份在相同月日范围内的数据
    data1 = getDayRangeData(year1, dayRange);
    data2 = getDayRangeData(year2, dayRange);
  }

  return {
    labels: data1.labels,
    values1: data1.values,
    values2: data2.values,
  };
});

// 渲染折线图
function renderLineChartData() {
  const { labels, values1, values2 } = chartData.value;
  const { year1, year2 } = queryForm.value;

  renderLineChart({
    grid: {
      bottom: 60,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '15%',
    },
    legend: {
      data: [`${year1}年`, `${year2}年`],
      top: 10,
    },
    series: [
      {
        data: values1,
        itemStyle: { color: '#5ab1ef' },
        lineStyle: { width: 3 },
        name: `${year1}年`,
        smooth: true,
        type: 'line',
      },
      {
        data: values2,
        itemStyle: { color: '#d87a80' },
        lineStyle: { width: 3 },
        name: `${year2}年`,
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: { type: 'cross' },
      trigger: 'axis',
    },
    xAxis: {
      axisLabel: { interval: 'auto', rotate: labels.length > 20 ? 45 : 0 },
      axisTick: { show: false },
      boundaryGap: false,
      data: labels,
      type: 'category',
    },
    yAxis: [
      {
        axisTick: { show: false },
        name: '注册用户数',
        splitLine: { lineStyle: { type: 'dashed' } },
        type: 'value',
      },
    ],
  });
}

// 渲染柱状图
function renderBarChartData() {
  const { labels, values1, values2 } = chartData.value;
  const { year1, year2 } = queryForm.value;

  renderBarChart({
    grid: {
      bottom: 60,
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '15%',
    },
    legend: {
      data: [`${year1}年`, `${year2}年`],
      top: 10,
    },
    series: [
      {
        barGap: 0,
        data: values1,
        itemStyle: { color: '#5ab1ef' },
        name: `${year1}年`,
        type: 'bar',
      },
      {
        data: values2,
        itemStyle: { color: '#d87a80' },
        name: `${year2}年`,
        type: 'bar',
      },
    ],
    tooltip: {
      axisPointer: { type: 'shadow' },
      trigger: 'axis',
    },
    xAxis: {
      axisLabel: { interval: 'auto', rotate: labels.length > 20 ? 45 : 0 },
      axisTick: { show: false },
      data: labels,
      type: 'category',
    },
    yAxis: [
      {
        axisTick: { show: false },
        name: '注册用户数',
        splitLine: { lineStyle: { type: 'dashed' } },
        type: 'value',
      },
    ],
  });
}

// 查询按钮处理
function handleQuery() {
  renderLineChartData();
  renderBarChartData();
}

// 重置按钮处理
function handleReset() {
  queryForm.value = {
    timeUnit: 'month',
    year1: 2024,
    year2: 2025,
    monthRange: [1, 12],
    dayRange: ['01-01', '03-15'],
  };
  renderLineChartData();
  renderBarChartData();
}

// 当时间单位变化时，重置范围
watch(() => queryForm.value.timeUnit, (newVal) => {
  if (newVal === 'month') {
    queryForm.value.monthRange = [1, 12];
  } else {
    queryForm.value.dayRange = ['01-01', '03-15'];
  }
});

onMounted(() => {
  renderLineChartData();
  renderBarChartData();
});

// 月份选项
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}月`,
  value: i + 1,
}));

// 年份选项
const yearOptions = [
  { label: '2023年', value: 2023 },
  { label: '2024年', value: 2024 },
  { label: '2025年', value: 2025 },
  { label: '2026年', value: 2026 },
];
</script>

<template>
  <Page :title="$t('page.userComparison.title')">
    <div class="p-4">
      <!-- 查询区域 -->
      <ElCard class="mb-4" shadow="hover">
        <template #header>
          <div class="font-semibold">{{ $t('page.userComparison.queryTitle') }}</div>
        </template>
        <ElForm :model="queryForm" inline label-position="left" label-width="100px">
          <ElRow :gutter="20">
            <!-- 时间单位选择 -->
            <ElCol :lg="6" :md="12" :sm="24" :xl="5" :xs="24">
              <ElFormItem label="时间单位：">
                <ElRadioGroup v-model="queryForm.timeUnit">
                  <ElRadioButton label="month">按月</ElRadioButton>
                  <ElRadioButton label="day">按日</ElRadioButton>
                </ElRadioGroup>
              </ElFormItem>
            </ElCol>

            <!-- 对比年份1 -->
            <ElCol :lg="6" :md="12" :sm="24" :xl="5" :xs="24">
              <ElFormItem label="对比年份1：">
                <ElSelect v-model="queryForm.year1" class="w-full" style="width: 160px">
                  <ElOption
                    v-for="opt in yearOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>

            <!-- 对比年份2 -->
            <ElCol :lg="6" :md="12" :sm="24" :xl="5" :xs="24">
              <ElFormItem label="对比年份2：">
                <ElSelect v-model="queryForm.year2" class="w-full" style="width: 160px">
                  <ElOption
                    v-for="opt in yearOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>

            <!-- 月份范围选择 -->
            <ElCol v-if="queryForm.timeUnit === 'month'" :lg="10" :md="12" :sm="24" :xl="9" :xs="24">
              <ElFormItem label="月份范围：">
                <div class="flex items-center gap-2">
                  <ElSelect v-model="queryForm.monthRange[0]" style="width: 120px">
                    <ElOption
                      v-for="opt in monthOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </ElSelect>
                  <span>至</span>
                  <ElSelect v-model="queryForm.monthRange[1]" style="width: 120px">
                    <ElOption
                      v-for="opt in monthOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </ElSelect>
                </div>
              </ElFormItem>
            </ElCol>

            <!-- 日期范围选择（月-日格式，无年份） -->
            <ElCol v-if="queryForm.timeUnit === 'day'" :lg="12" :md="12" :sm="24" :xl="10" :xs="24">
              <ElFormItem label="日期范围：">
                <div class="flex items-center gap-2">
                  <ElDatePicker
                    v-model="queryForm.dayRange[0]"
                    format="MM-DD"
                    placeholder="开始月日"
                    style="width: 140px"
                    type="date"
                    value-format="MM-DD"
                  />
                  <span>至</span>
                  <ElDatePicker
                    v-model="queryForm.dayRange[1]"
                    format="MM-DD"
                    placeholder="结束月日"
                    style="width: 140px"
                    type="date"
                    value-format="MM-DD"
                  />
                </div>
              </ElFormItem>
            </ElCol>

            <!-- 按钮区域 -->
            <ElCol :lg="8" :md="12" :sm="24" :xl="8" :xs="24">
              <ElFormItem>
                <div class="flex gap-2">
                  <ElButton type="primary" @click="handleQuery">
                    <span class="i-lucide:search mr-1"></span>
                    查询
                  </ElButton>
                  <ElButton @click="handleReset">
                    <span class="i-lucide:rotate-ccw mr-1"></span>
                    重置
                  </ElButton>
                </div>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCard>

      <!-- 图表区域 -->
      <ElRow :gutter="20">
        <!-- 折线图 -->
        <ElCol :lg="12" :md="24" :sm="24" :xs="24">
          <ElCard class="mb-4" shadow="hover">
            <template #header>
              <div class="font-semibold">{{ $t('page.userComparison.lineChartTitle') }}</div>
            </template>
            <EchartsUI ref="lineChartRef" style="height: 400px" />
          </ElCard>
        </ElCol>

        <!-- 柱状图 -->
        <ElCol :lg="12" :md="24" :sm="24" :xs="24">
          <ElCard class="mb-4" shadow="hover">
            <template #header>
              <div class="font-semibold">{{ $t('page.userComparison.barChartTitle') }}</div>
            </template>
            <EchartsUI ref="barChartRef" style="height: 400px" />
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
  </Page>
</template>
