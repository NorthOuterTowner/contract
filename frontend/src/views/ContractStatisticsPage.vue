<template>
  <div class="contract-statistics-page">
    <h2 class="page-title">合同统计概览</h2>

    <n-grid x-gap="20" :cols="3" class="overview-cards">
      <n-gi>
        <n-card class="box-card">
          <div class="card-item">
            <div class="label">合同总数</div>
            <div class="value">{{ totalContracts }}</div>
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="box-card">
          <div class="card-item">
            <div class="label">待处理合同</div>
            <div class="value">{{ pendingContracts }}</div>
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="box-card">
          <div class="card-item">
            <div class="label">即将到期合同</div>
            <div class="value">{{ expiringContracts }}</div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card class="filter-card">
      <n-form inline label-placement="left">
        <n-form-item label="统计年份">
          <n-select v-model:value="statsFilter.year" :options="yearOptions" placeholder="选择年份" clearable style="width: 120px;" />
        </n-form-item>
        <n-form-item label="时间范围">
          <n-date-picker v-model:value="statsFilter.dateRange" type="daterange" clearable value-format="yyyy-MM-dd" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="fetchStatisticsData">刷新统计</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-grid x-gap="20" :cols="2" class="chart-row">
      <n-gi>
        <n-card class="box-card chart-card">
          <template #header>
            <span>合同状态分布</span>
          </template>
          <div id="contractTypeChart" style="width: 100%; height: 300px;"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="box-card chart-card">
          <template #header>
            <span>合同状态分布 (备用/细分)</span>
          </template>
          <div id="contractStatusChart" style="width: 100%; height: 300px;"></div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid x-gap="20" :cols="1" class="chart-row">
      <n-gi>
        <n-card class="box-card chart-card">
          <template #header>
            <span>月度合同签订数量趋势</span>
          </template>
          <div id="monthlySignCountTrendChart" style="width: 100%; height: 350px;"></div>
        </n-card>
      </n-gi>
      </n-grid>

    <n-card class="box-card data-table-card">
      <template #header>
        <span>合同数据明细（示例）</span>
      </template>
      <n-data-table :columns="summaryTableColumns" :data="statusDistributionResult" :bordered="true" />
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, h, inject } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts'; 
import { NCard, NGrid, NGi, NDataTable, NForm, NFormItem, NSelect, NDatePicker, NButton } from 'naive-ui';

const axiosInstance = inject('axios'); // 注入 axios 实例

const totalContracts = ref(0);
const totalAmount = ref(0); // 现数据库无 Amount 字段，保留 0
const pendingContracts = ref(0);
const expiringContracts = ref(0); // 现数据库无 ExpiryDate 字段，保留 0

const statusDistributionResult = ref([]); 
const monthlySignCountData = ref([]); 
const monthlySignAmountData = ref([]); // 现数据库无 Amount 字段，保留 0

const statsFilter = ref({
    year: new Date().getFullYear(),
    dateRange: null 
});

const currentYear = new Date().getFullYear();
const yearOptions = [
    { label: '所有年份', value: null },
    ...Array.from({ length: 5 }, (_, i) => ({ label: String(currentYear - i), value: currentYear - i }))
];

// 统计表格列定义 (移除金额，因为 contract 表没有 Amount 字段)
const summaryTableColumns = [
  { title: '合同状态', key: 'status', width: 180 }, 
  { title: '数量', key: 'count' },
];

onMounted(async () => {
  await fetchStatisticsData();
});

async function fetchStatisticsData() {
  try {
    const response = await axiosInstance.get('/query/contract/statistics', {
      params: {
        year: statsFilter.value.year,
        startDate: statsFilter.value.dateRange ? statsFilter.value.dateRange[0] : null,
        endDate: statsFilter.value.dateRange ? statsFilter.value.dateRange[1] : null,
      }
    });

    totalContracts.value = response.data.totalContracts;
    totalAmount.value = response.data.totalAmount; 
    pendingContracts.value = response.data.pendingContracts;
    expiringContracts.value = response.data.expiringContracts; 
    statusDistributionResult.value = response.data.statusDistribution; 
    monthlySignCountData.value = response.data.monthlySignCount;
    monthlySignAmountData.value = response.data.monthlySignAmount; 

    initCharts(); // 数据更新后重新渲染图表

  } catch (error) {
    console.error('获取合同统计数据失败:', error);
  }
}

function initCharts() {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 合同状态分布饼图 (原合同类型分布)
  const typeChartDom = document.getElementById('contractTypeChart');
  let typeChart = echarts.getInstanceByDom(typeChartDom);
  if (!typeChart) { typeChart = echarts.init(typeChartDom); }
  typeChart.setOption({
    title: { text: '合同状态分布', subtext: '按当前状态统计', left: 'center' }, // 添加标题
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '合同状态',
        type: 'pie',
        radius: '50%',
        data: statusDistributionResult.value.map(item => ({ value: item.count, name: item.status })), // 从 statusDistributionResult 映射数据
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }
    ]
  });
  window.addEventListener('resize', () => typeChart.resize());

  // 另一个合同状态分布饼图 (可选，可根据需求移除)
  const statusChartDom = document.getElementById('contractStatusChart');
  let statusChart = echarts.getInstanceByDom(statusChartDom);
  if (!statusChart) { statusChart = echarts.init(statusChartDom); }
  statusChart.setOption({
    title: { text: '合同状态分布 (所有可能状态)', subtext: '基于前端定义', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '合同状态',
        type: 'pie',
        radius: '50%',
        data: contractStatusOptions.map(opt => { 
          const countItem = statusDistributionResult.value.find(s => s.status === opt.value);
          return { value: countItem ? countItem.count : 0, name: opt.label };
        }).filter(item => item.value !== null), // 过滤掉 null 值
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }
    ]
  });
  window.addEventListener('resize', () => statusChart.resize());

  // 月度合同签署数量趋势折线图
  const monthlySignCountTrendChartDom = document.getElementById('monthlySignCountTrendChart');
  let monthlySignCountTrendChart = echarts.getInstanceByDom(monthlySignCountTrendChartDom);
  if (!monthlySignCountTrendChart) { monthlySignCountTrendChart = echarts.init(monthlySignCountTrendChartDom); }
  monthlySignCountTrendChart.setOption({
    title: { text: '月度合同签订数量趋势', subtext: '按月份统计', left: 'center' }, // 标题从“签署”改为“签订”
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', name: '合同数量' },
    series: [
      { name: '签订数量', type: 'line', data: monthlySignCountData.value, smooth: true, itemStyle: { color: '#409EFF' } } // 图例改为“签订”
    ]
  });
  window.addEventListener('resize', () => monthlySignCountTrendChart.resize());

  // 【关键修改】彻底移除“月度合同金额趋势”图表初始化代码块（脚本部分），不再注释
  // 因为模板中已经移除了对应的 HTML 元素，这里的初始化代码就没有必要了，否则会报错。
}

// 合同状态选项 (与 QueryContractList.vue 保持一致)
const contractStatusOptions = [
  { label: '待起草', value: '待起草' },
  { label: '会签处理中', 'value': '会签处理中' },
  { label: '待定稿', value: '待定稿' },
  { label: '待审批', value: '待审批' },
  { label: '待签订', value: '待签订' },
  { label: '已签订', value: '已签订' },
  { label: '未通过', value: '未通过' }, 
];
</script>

<style scoped>
.contract-statistics-page {
  padding: 20px;
  background-color: #f4f6f8;
  min-height: calc(100vh - 60px); 
}

.page-title { font-size: 28px; color: #333; margin-bottom: 25px; text-align: center; }
.overview-cards { margin-bottom: 30px; }
.filter-card { margin-bottom: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }

.box-card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.box-card .card-item {
  text-align: center;
  padding: 15px 0;
}

.box-card .label {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.box-card .value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
}

.chart-row { margin-bottom: 30px; }
.chart-card { min-height: 380px; }

.n-card > .n-card__header {
  padding: 18px 20px;
}
</style>