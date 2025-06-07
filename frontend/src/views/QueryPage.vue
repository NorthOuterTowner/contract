<template>
  <div class="query-contract-detail-page">
    <n-card class="detail-card" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ contract.contractName || '合同详情' }}</span>
          <n-button text type="primary" @click="goBack">返回列表</n-button>
        </div>
      </template>

      <div class="detail-section">
        <h3>基本信息</h3>
        <n-grid x-gap="20" :cols="2">
          <n-gi>
            <div class="detail-item">
              <span class="label">合同编号:</span>
              <span class="value">{{ contract.contractNumber || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">合同名称:</span>
              <span class="value">{{ contract.contractName || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">合同类型:</span>
              <span class="value">{{ contract.contractType || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">合同状态:</span>
              <n-tag :type="getStatusTagType(contract.status)" :bordered="false">{{ getStatusText(contract.status) }}</n-tag>
            </div>
          </n-gi>
          <n-gi>
            <div class="detail-item">
              <span class="label">合同金额:</span>
              <span class="value">¥ {{ contract.amount ? contract.amount.toLocaleString() : 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">签订日期:</span>
              <span class="value">{{ contract.signDate || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">生效日期:</span>
              <span class="value">{{ contract.effectiveDate || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">截止日期:</span>
              <span class="value">{{ contract.expiryDate || 'N/A' }}</span>
            </div>
          </n-gi>
        </n-grid>
        <div class="detail-item full-width">
            <span class="label">合同描述:</span>
            <span class="value">{{ contract.description || '无' }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>合同参与方</h3>
        <n-grid x-gap="20" :cols="2">
          <n-gi>
            <div class="detail-item">
              <span class="label">甲方:</span>
              <span class="value">{{ contract.partyA || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">甲方联系人:</span>
              <span class="value">{{ contract.partyAContact || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">甲方电话:</span>
              <span class="value">{{ contract.partyAPhone || 'N/A' }}</span>
            </div>
          </n-gi>
          <n-gi>
            <div class="detail-item">
              <span class="label">乙方:</span>
              <span class="value">{{ contract.partyB || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">乙方联系人:</span>
              <span class="value">{{ contract.partyBContact || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">乙方电话:</span>
              <span class="value">{{ contract.partyBPhone || 'N/A' }}</span>
            </div>
          </n-gi>
        </n-grid>
      </div>

      <div class="detail-section">
        <h3>合同附件 <i class="icon-paperclip"></i></h3> <div v-if="contract.attachments && contract.attachments.length > 0">
          <div v-for="(file, index) in contract.attachments" :key="index" class="attachment-item">
            <i class="icon-document"></i> <span class="file-name" @click="previewAttachment(file)">{{ file.name }}</span>
            <div class="attachment-actions">
              <n-button text type="primary" size="small" @click="previewAttachment(file)">预览</n-button>
              <n-button text type="primary" size="small" style="margin-left: 8px;" @click="downloadAttachment(file)">下载</n-button>
            </div>
          </div>
        </div>
        <div v-else class="no-attachments">
          暂无合同附件。
        </div>
      </div>

      <div class="detail-section">
        <h3>操作历史 <i class="icon-history"></i></h3> <n-timeline v-if="contract.history && contract.history.length > 0">
          <n-timeline-item
            v-for="(activity, index) in contract.history"
            :key="index"
            :type="'success'"
            :title="activity.action"
            :content="activity.description"
            :time="activity.timestamp"
          />
        </n-timeline>
        <div v-else class="no-history">
          暂无操作历史。
        </div>
      </div>

      <div class="detail-actions">
        <n-button type="primary" @click="editContract" :disabled="!canEdit(contract.status)">编辑合同</n-button>
        <n-button @click="printContract" style="margin-left: 8px;">打印</n-button>
        <n-button type="error" @click="voidContract" :disabled="!canVoid(contract.status)" style="margin-left: 8px;">作废合同</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
// 引入 Naive UI 组件
import { NCard, NGrid, NGi, NButton, NTag, NTimeline, NTimelineItem } from 'naive-ui';

const route = useRoute();
const router = useRouter();
const message = inject('message'); // 注入 main.js 中挂载的 message 实例
const dialog = inject('dialog');   // 注入 main.js 中挂载的 dialog 实例

const contract = ref({});
const loading = ref(true);

watch(() => route.params.id, (newId, oldId) => {
  if (newId) { fetchContractDetail(newId); }
}, { immediate: true });

async function fetchContractDetail(id) {
  loading.value = true;
  try {
    // 你的后端API调用示例
    // const response = await axios.get(`/query/contract/${id}`);
    // contract.value = response.data;

    // 模拟数据
    const mockData = {
      id: id,
      contractNumber: `HT-${new Date().getFullYear()}${String(1000 + parseInt(id)).padStart(4, '0')}`,
      contractName: `项目${id}的合作协议`,
      contractType: ['销售合同', '采购合同', '服务合同', '租赁合同', '劳务合同'][parseInt(id) % 5],
      status: ['signed', 'approving', 'cosigning', 'pending_sign', 'archived', 'voided', 'expired'][parseInt(id) % 7],
      amount: 100000 + parseInt(id) * 5000,
      signDate: `2024-0${(parseInt(id) % 12) + 1}-15`,
      effectiveDate: `2024-0${(parseInt(id) % 12) + 1}-20`,
      expiryDate: `2025-0${(parseInt(id) % 12) + 1}-20`,
      description: `这是关于合同编号 ${`HT-${new Date().getFullYear()}${String(1000 + parseInt(id)).padStart(4, '0')}`} 的详细内容和重要条款。该合同旨在规范双方在...方面的合作，确保项目顺利进行，并明确了各自的权利和义务。`,
      partyA: `甲方公司A${parseInt(id) % 3 + 1}`,
      partyAContact: `张三${parseInt(id) % 3 + 1}`,
      partyAPhone: `1380013800${parseInt(id) % 10}`,
      partyB: `乙方公司B${parseInt(id) % 5 + 1}`,
      partyBContact: `李四${parseInt(id) % 5 + 1}`,
      partyBPhone: `1391234567${parseInt(id) % 10}`,
      attachments: [
        { id: 1, name: '合同正文.pdf', url: '/files/contract_main.pdf', type: 'pdf' },
        { id: 2, name: '附件A-价格清单.xlsx', url: '/files/price_list.xlsx', type: 'xlsx' },
      ],
      history: [
        { timestamp: '2024-05-01 10:00:00', user: '管理员', action: '创建合同', description: '合同初稿已创建。' },
        { timestamp: '2024-05-05 14:30:00', user: '张三', action: '提交审批', description: '合同已提交至部门经理审批。' },
        { timestamp: '2024-05-10 09:00:00', user: '李经理', action: '审批通过', description: '部门经理已批准该合同。' },
        { timestamp: '2024-05-12 11:00:00', user: '管理员', action: '完成签订', description: '合同已正式签订并生效。' },
      ],
    };
    contract.value = mockData;

  } catch (error) {
    console.error('获取合同详情失败:', error);
    message.error('获取合同详情失败，请稍后重试！');
  } finally {
    loading.value = false;
  }
}

function goBack() { router.push('/my-contract-module/query'); } // 【关键修改】更新路径
function editContract() { message.info(`模拟：编辑合同 ID: ${contract.value.id}`); }
function printContract() { window.print(); message.success('正在准备打印...'); }
function voidContract() {
  dialog.warning({ // 使用 Naive UI 的 dialog.warning
    title: '警告',
    content: '确定要作废这份合同吗？作废后将无法恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      // 实际项目中，调用后端API作废合同
      // await axios.post(`/api/contract/${contract.value.id}/void`);
      message.success('合同已成功作废！');
      fetchContractDetail(contract.value.id);
    },
    onNegativeClick: () => {
      message.info('已取消作废操作。');
    }
  });
}
function previewAttachment(file) { message.info(`模拟：预览文件：${file.name}`); }
async function downloadAttachment(file) {
  try { message.success(`模拟：正在下载文件：${file.name}...`); }
  catch (error) { console.error('下载失败:', error); message.error('下载附件失败，请稍后重试！'); }
}

// Naive UI 的 Tag 类型
function getStatusTagType(status) {
  switch (status) {
    case 'signed': return 'success';
    case 'approving': return 'warning';
    case 'cosigning': return 'warning';
    case 'pending_sign': return 'warning';
    case 'archived': return 'info';
    case 'expired': return 'error';
    case 'voided': return 'error';
    case 'draft': return 'default';
    default: return 'default';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'signed': return '已签订'; case 'approving': return '审批中'; case 'cosigning': return '会签中';
    case 'pending_sign': return '待签订'; case 'archived': return '已归档'; case 'expired': '已过期';
    case 'voided': return '已作废'; case 'draft': '草稿'; default: status;
  }
}

function canEdit(status) { return ['draft', 'approving', 'cosigning', 'pending_sign'].includes(status); }
function canVoid(status) { return !['voided', 'archived', 'signed', 'expired'].includes(status); }
</script>

<style scoped>
/* 保持与你 HomePage 中自定义下拉菜单类似的样式，确保你自己的模块内部风格一致 */
.query-contract-detail-page {
  padding: 20px;
  background-color: #f4f6f8; 
  min-height: calc(100vh - 60px);
}

.detail-card { max-width: 900px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title { font-size: 24px; font-weight: bold; color: #333; }

.detail-section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px dashed #eee; }
.detail-section:last-of-type { border-bottom: none; margin-bottom: 0; }
.detail-section h3 {
  font-size: 20px; color: #555; margin-bottom: 15px; padding-bottom: 5px;
  border-bottom: 2px solid #409EFF; display: inline-block;
}
/* 自定义图标样式 */
.detail-section h3 .icon-paperclip::before { content: '📎'; margin-left: 8px; }
.detail-section h3 .icon-history::before { content: '⏱️'; margin-left: 8px; }

.detail-item { margin-bottom: 10px; }
.detail-item .label {
  font-weight: bold; color: #666; width: 90px;
  display: inline-block; text-align: right; margin-right: 10px;
}
.detail-item .value { color: #333; word-break: break-all; }
.detail-item.full-width { display: flex; align-items: flex-start; }
.detail-item.full-width .label { min-width: 90px; text-align: right; margin-right: 10px; }
.detail-item.full-width .value { flex-grow: 1; }
.attachment-item {
  display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;
  justify-content: space-between; /* 使文件名称和操作按钮分开 */
}
.attachment-item:last-child { border-bottom: none; }
.attachment-item .icon-document::before { content: '📄'; margin-right: 8px; } /* 自定义文档图标 */
.attachment-item .file-name { margin-left: 8px; color: #409EFF; cursor: pointer; flex-grow: 1; }
.attachment-item .file-name:hover { text-decoration: underline; }

.no-attachments, .no-history { color: #999; font-style: italic; text-align: center; padding: 15px 0; }
.detail-actions { text-align: center; margin-top: 30px; }
</style>