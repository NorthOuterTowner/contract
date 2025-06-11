<template>
  <div class="query-contract-list-page">
    <h2 class="page-title">合同查询列表</h2>

    <n-card class="search-card">
      <n-form inline :model="searchForm" class="search-form" label-placement="left">
        <n-form-item label="搜索">
          <n-input-group>
            <n-select v-model:value="searchForm.searchField" :options="searchFieldOptions" style="width: 150px;"/>
            <n-input v-model:value="searchForm.keyword" :placeholder="searchPlaceholder" clearable @keyup.enter="handleSearch" style="width: 250px;"/>
          </n-input-group>
        </n-form-item>

        <n-form-item label="合同状态">
          <n-select v-model:value="searchForm.status" :options="contractStatusOptions" placeholder="请选择合同状态" clearable style="width: 150px;"/>
        </n-form-item>
        
        <n-form-item>
          <n-button type="primary" @click="handleSearch">查询</n-button>
          <n-button @click="resetSearch" style="margin-left: 8px;">重置</n-button>
          <n-button @click="toggleAdvancedSearch" style="margin-left: 8px;">
            {{ showAdvancedSearch ? '收起查询' : '高级查询' }}
          </n-button>
        </n-form-item>
      </n-form>

      <div v-if="showAdvancedSearch" class="advanced-search-area">
        <n-form inline :model="searchForm" label-placement="left">
          <n-form-item label="创建日期">
            <n-date-picker v-model:value="searchForm.creationDateRange" type="daterange" clearable value-format="yyyy-MM-dd" />
          </n-form-item>
          <n-form-item label="最后修改日期">
            <n-date-picker v-model:value="searchForm.lastModifiedDateRange" type="daterange" clearable value-format="yyyy-MM-dd" />
          </n-form-item>
          <n-form-item label="合同金额">
            <n-input-number v-model:value="searchForm.minAmount" :show-button="false" placeholder="最小金额" :min="0" style="width: 100px;" />
            <span style="margin: 0 5px;"> - </span>
            <n-input-number v-model:value="searchForm.maxAmount" :show-button="false" placeholder="最大金额" :min="0" style="width: 100px;" />
          </n-form-item>
          </n-form>
      </div>
    </n-card>

    <n-card class="contract-list-card">
      <n-data-table
        :columns="tableColumns"
        :data="contractList"
        :pagination="paginationReactive"
        :loading="loading"
        :bordered="true"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
      
      <div v-if="!contractList.length && !loading" class="no-data">
        {{ searchForm.keyword ? '没有找到匹配的合同' : '暂无合同信息' }}
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, h, onMounted, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// 引入 Naive UI 组件
import { NCard, NForm, NFormItem, NInput, NSelect, NButton, NDatePicker, NInputNumber, NDataTable, NTag, NInputGroup } from 'naive-ui';

const router = useRouter();
const message = inject('message'); // For Naive UI message
const dialog = inject('dialog'); // 注入 dialog 实例，用于确认弹窗
const axiosInstance = inject('axios'); // For axios instance from main.js

const searchForm = ref({
  searchField: 'Title',
  keyword: null,
  status: null,
  creationDateRange: null,
  lastModifiedDateRange: null,
  minAmount: null, 
  maxAmount: null, 
  // partyA: null, // 保留
  // partyB: null, // 保留
});

const contractList = ref([]);
const loading = ref(false);
const showAdvancedSearch = ref(false);

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: 0,
  prefix ({ itemCount }) {
    return `共 ${itemCount} 条`;
  }
});

// 搜索指标选项 (根据 Contract 表实际字段调整)
const searchFieldOptions = [
  { label: '合同标题', value: 'Title' },
  { label: '合同编号', value: 'ContractID' },
  { label: '合同简要描述', value: 'Description' },
  { label: '合同详细内容', value: 'Content' },
  { label: '关键词', value: 'Keyword' }, // 泛指在 Title, ContractID, Description, Content 中搜索
  { label: '创建人', value: 'CreatedBy' }, // 保留，后端需联查 contractdraft.CreatedBy
  { label: '会签人', value: 'Signer' },     // 保留，后端需联查 contractsigning.SignerID (或实际名字)
  { label: '审批人', value: 'Approver' },   // 保留，后端需联查 contractapproval.Approver (或实际名字)
];

// 根据选择的搜索指标动态改变placeholder
const searchPlaceholder = computed(() => {
  const selectedOption = searchFieldOptions.find(opt => opt.value === searchForm.value.searchField);
  return selectedOption ? `请输入${selectedOption.label}` : '请输入关键词';
});


// 表格列定义 (根据 Contract 表实际字段调整)
const tableColumns = [
  { title: '合同编号', key: 'ContractID', width: 150, sorter: 'default' },
  { title: '合同标题', key: 'Title', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'Status',
    width: 120,
    render(row) {
      const tagType = getStatusTagType(row.Status);
      const tagText = getStatusText(row.Status); 
      return h(NTag, { type: tagType, bordered: false }, { default: () => tagText });
    }
  },
  { title: '创建日期', key: 'CreationDate', width: 150, sorter: 'default' },
  { title: '最后修改', key: 'LastModifiedDate', width: 150, sorter: 'default' },
  // 【关键修改】合同金额列注释掉
  // { title: '金额', key: 'Amount', width: 120, sorter: 'default', 
  //   render(row) {
  //     // 数据库无 Amount 字段，所以这里会显示 N/A
  //     return `¥ ${row.Amount ? row.Amount.toLocaleString() : 'N/A'}`; 
  //   } 
  // }, 
  // 甲方 (现数据库无此字段，保留注释)
  // { title: '甲方', key: 'PartyA', width: 120, ellipsis: { tooltip: true } }, 
  // 乙方 (现数据库无此字段，保留注释)
  // { title: '乙方', key: 'PartyB', width: 120, ellipsis: { tooltip: true } }, 
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render(row) {
      return h('div', {}, [
        h(NButton, { text: true, type: 'primary', onClick: () => viewContractDetail(row.ContractID) }, { default: () => '查看' }),
        h(NButton, { text: true, type: 'primary', style: { marginLeft: '8px' }, disabled: !canEdit(row.Status), onClick: () => editContract(row.ContractID) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: 'primary', style: { marginLeft: '8px' }, disabled: !canSign(row.Status), onClick: () => signContract(row.ContractID) }, { default: () => '签订' }), 
        h(NButton, { text: true, type: 'primary', style: { marginLeft: '8px' }, onClick: () => downloadContract(row.ContractID) }, { default: () => '下载' })
      ]);
    }
  }
];

// Naive UI 下拉选项 (合同状态，严格匹配数据库 ENUM 类型)
const contractStatusOptions = [
  { label: '所有状态', value: null },
  { label: '待起草', value: '待起草' },
  { label: '会签处理中', value: '会签处理中' },
  { label: '待定稿', value: '待定稿' },
  { label: '待审批', value: '待审批' },
  { label: '待签订', value: '待签订' }, 
  { label: '已签订', value: '已签订' },   
  { label: '未通过', value: '未通过' }, 
  // 未来可能添加的状态，先注释保留：
  // { label: '已作废', value: '已作废' }, 
  // { label: '已过期', value: '已过期' }, 
];

onMounted(() => {
  fetchContractList();
});

async function fetchContractList() {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/query/contracts', {
      params: {
        searchField: searchForm.value.searchField,
        keyword: searchForm.value.keyword,
        status: searchForm.value.status,
        creationStartDate: searchForm.value.creationDateRange ? searchForm.value.creationDateRange[0] : null,
        creationEndDate: searchForm.value.creationDateRange ? searchForm.value.creationDateRange[1] : null,
        lastModifiedStartDate: searchForm.value.lastModifiedDateRange ? searchForm.value.lastModifiedDateRange[0] : null,
        lastModifiedEndDate: searchForm.value.lastModifiedDateRange ? searchForm.value.lastModifiedDateRange[1] : null,
        minAmount: searchForm.value.minAmount, 
        maxAmount: searchForm.value.maxAmount, 
        // partyA: searchForm.value.partyA, // 保留
        // partyB: searchForm.value.partyB, // 保留
        page: paginationReactive.page,
        pageSize: paginationReactive.pageSize,
      }
    });

    contractList.value = response.data.list;
    paginationReactive.itemCount = response.data.total;

  } catch (error) {
      console.error('获取合同列表失败:', error);
      // 后端如果返回的错误是 SQL 字段不存在，前端显示这个提示
      if (error.response && error.response.status === 500 && error.response.data && error.response.data.error.includes("Unknown column")) {
          message.error('后端数据库字段不匹配，请联系管理员！');
      } else {
          message.error('获取合同列表失败，请稍后重试！');
      }
  } finally {
    message.destroyAll(); 
    loading.value = false;
  }
}

function handleSearch() {
  paginationReactive.page = 1;
  fetchContractList();
}

function resetSearch() {
  searchForm.value = {
    searchField: 'Title',
    keyword: null,
    status: null, 
    creationDateRange: null, 
    lastModifiedDateRange: null,
    minAmount: null, 
    maxAmount: null, 
    partyA: null, // 保留
    partyB: null, // 保留
  };
  showAdvancedSearch.value = false;
  paginationReactive.page = 1;
  fetchContractList();
}

function toggleAdvancedSearch() {
  showAdvancedSearch.value = !showAdvancedSearch.value;
}

function viewContractDetail(contractID) { router.push(`/my-contract-module/query/detail/${contractID}`); }
function editContract(contractID) { message.info(`模拟：编辑合同 ID: ${contractID}`); }
function signContract(contractID) { 
  dialog.warning({
    title: '确认签订',
    content: `您确定要签订合同编号为 ${contractID} 的合同吗？此操作将更新合同状态。`,
    positiveText: '确定签订',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await axiosInstance.post('/sign/determine', { 
          contractId: contractID, 
          signerId: 'userA', 
          comment: '合同已在线签订' 
        });

        if (response.data.code === 200) { 
          message.success(response.data.msg); 
          fetchContractList(); 
        } else {
          message.error(response.data.msg || '签订失败，请重试！');
        }
      } catch (error) {
        console.error('签订合同失败:', error);
        message.error(`签订失败：${error.response ? error.response.data.msg || error.response.statusText : error.message}`);
      }
    }
  });
}

async function downloadContract(contractID) {
  try {
    message.loading(`正在准备下载合同 ${contractID} ...`, { duration: 0 }); // 显示加载提示

    // 1. 根据 ContractID 获取合同详情，以拿到 Content 字段
    const detailResponse = await axiosInstance.get(`/query/contract/${contractID}/full-detail`);
    const contractDetail = detailResponse.data;

    if (!contractDetail || !contractDetail.Content) {
      message.error('未找到合同内容或文件信息，无法下载！');
      return;
    }

    // 2. 使用 Content 字段作为 filename 调用后端下载接口
    const filenameToDownload = contractDetail.Content; 

    const downloadResponse = await axiosInstance.get("/download", {
      params: { filename: filenameToDownload }, // 正确传递查询参数
      responseType: 'blob' // 重要：指定响应类型为blob
    });

    // 3. 创建下载链接并触发下载
    const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // 尝试从响应头获取文件名，如果没有则使用默认（Content字段的值）
    const contentDisposition = downloadResponse.headers['content-disposition'];
    let finalFilename = filenameToDownload; // 默认使用 Content 作为文件名
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch && filenameMatch[1]) {
        finalFilename = filenameMatch[1]; // 如果响应头有，则优先使用
      }
    }
    
    link.setAttribute('download', finalFilename);
    document.body.appendChild(link);
    link.click();
    
    // 4. 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message.success(`合同 ${contractID} 下载成功！`);

  } catch (error) {
    console.error('下载失败:', error);
    // 根据错误类型给出更具体提示
    if (error.response && error.response.status === 404) {
      message.error('文件未找到，请联系管理员！');
    } else {
      message.error(`文件下载失败：${error.message}`);
    }
  } finally {
    message.destroyAll(); // 移除所有加载提示
  }
}

// Naive UI 的 Tag 类型 (用于表格中标签的颜色)
function getStatusTagType(status) {
  switch (status) {
    case '已签订': return 'success';
    case '待审批': return 'warning';
    case '会签处理中': return 'warning';
    case '待签订': return 'warning';
    case '待定稿': return 'info';
    case '待起草': return 'default';
    case '未通过': return 'error'; 
    // 未来可能添加的状态，先注释保留：
    // case '已作废': return 'error'; 
    // case '已过期': return 'error'; 
    default: return 'default';
  }
}

// 获取显示文本 (用于表格中标签的文字)
function getStatusText(status) {
  return status; 
}

// 根据合同状态判断操作按钮是否可用
function canEdit(status) { return ['待起草', '会签处理中', '待定稿', '待审批'].includes(status); }
function canSign(status) { return ['待签订'].includes(status); } 
</script>

<style scoped>
.query-contract-list-page {
  padding: 20px;
  background-color: #f4f6f8;
  min-height: calc(100vh - 60px); 
}

.page-title { font-size: 28px; color: #333; margin-bottom: 25px; text-align: center; }
.search-card { margin-bottom: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
.search-form { padding: 20px; }
.advanced-search-area {
  border-top: 1px solid #eee; padding: 20px; margin-top: 10px;
  background-color: #f9f9f9; border-radius: 0 0 8px 8px;
}
.contract-list-card { border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }

.no-data { text-align: center; padding: 20px; color: #666; }
</style>