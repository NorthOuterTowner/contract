<template>
  <div class="query-contract-detail-page">
    <n-card class="detail-card" :loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ contract.Title || '合同详情' }}</span>
          <n-button text type="primary" @click="goBack">返回列表</n-button>
        </div>
      </template>

      <div class="detail-section">
        <h3>基本信息</h3>
        <n-grid x-gap="20" :cols="2">
          <n-gi>
            <div class="detail-item">
              <span class="label">合同编号:</span>
              <span class="value">{{ contract.ContractID || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">合同标题:</span>
              <span class="value">{{ contract.Title || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">合同状态:</span>
              <n-tag :type="getStatusTagType(contract.Status)" :bordered="false">{{ getStatusText(contract.Status) }}</n-tag>
            </div>
          </n-gi>
          <n-gi>
            <div class="detail-item">
              <span class="label">创建日期:</span>
              <span class="value">{{ contract.CreationDate || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后修改:</span>
              <span class="value">{{ contract.LastModifiedDate || 'N/A' }}</span>
            </div>
            </n-gi>
        </n-grid>
        <div class="detail-item full-width">
            <span class="label">合同简要描述:</span>
            <span class="value">{{ contract.Description || '无' }}</span>
        </div>
        <div class="detail-item full-width">
            <span class="label">合同详细内容:</span>
            <n-collapse :default-expanded-names="[]">
                <n-collapse-item title="点击展开/收起合同详细内容" name="content">
                    <n-scrollbar style="max-height: 200px;">
                        <pre class="contract-content-pre">{{ contract.Content || '无详细内容' }}</pre>
                    </n-scrollbar>
                </n-collapse-item>
            </n-collapse>
        </div>
      </div>

      <div class="detail-section">
        <h3>草稿信息</h3>
        <n-timeline v-if="contract.drafts && contract.drafts.length > 0">
          <n-timeline-item
            v-for="(draft, index) in contract.drafts"
            :key="index"
            :type="'info'"
            :title="draft.DraftTitle"
            :content="`由 ${draft.CreatedBy} 于 ${draft.CreationDate} 创建`"
            :time="draft.CreationDate"
          />
        </n-timeline>
        <div v-else class="no-data">
          暂无草稿信息。
        </div>
      </div>

      <div class="detail-section">
        <h3>会签信息</h3>
        <n-timeline v-if="contract.signings && contract.signings.length > 0">
          <n-timeline-item
            v-for="(signing, index) in contract.signings"
            :key="index"
            :type="'success'"
            :title="signing.SignerID" :content="signing.ModificationSuggestions || '无修改建议'"
            :time="signing.SignDate" />
        </n-timeline>
        <div v-else class="no-data">
          暂无会签信息。
        </div>
      </div>

      <div class="detail-section">
        <h3>定稿信息</h3>
        <n-timeline v-if="contract.finalizations && contract.finalizations.length > 0">
          <n-timeline-item
            v-for="(finalization, index) in contract.finalizations"
            :key="index"
            :type="'success'"
            :title="`定稿人：${finalization.ApprovedBy}`"
            :content="`于 ${finalization.ApprovalDate} 定稿`"
            :time="finalization.ApprovalDate"
          >
             <n-button text type="primary" size="small" @click="downloadFinalVersion(finalization.FinalizationID)">下载最终版本</n-button>
          </n-timeline-item>
        </n-timeline>
        <div v-else class="no-data">
          暂无定稿信息。
        </div>
      </div>

      <div class="detail-section">
        <h3>审批信息</h3>
        <n-timeline v-if="contract.approvals && contract.approvals.length > 0">
          <n-timeline-item
            v-for="(approval, index) in contract.approvals"
            :key="index"
            :type="approval.ApprovalDecision === '审批通过' ? 'success' : 'error'"
            :title="`审批人：${approval.ApproverID} (${approval.ApprovalDecision})`" :content="approval.ApprovalComments || '无审批意见'"
            :time="approval.ApprovalDate"
          />
        </n-timeline>
        <div v-else class="no-data">
          暂无审批信息。
        </div>
      </div>

      <div class="detail-actions">
        <n-button type="primary" @click="editContract" :disabled="!canEdit(contract.Status)">编辑合同</n-button>
        <n-button @click="submitForCosign" style="margin-left: 8px;" :disabled="!canSubmitForCosign(contract.Status)">提交会签</n-button>
        <n-button @click="submitForApproval" style="margin-left: 8px;" :disabled="!canSubmitForApproval(contract.Status)">提交审批</n-button>
        <n-button type="success" @click="finalizeContract" style="margin-left: 8px;" :disabled="!canFinalize(contract.Status)">定稿合同</n-button>
        <n-button type="success" @click="signContract" style="margin-left: 8px;" :disabled="!canSign(contract.Status)">签订合同</n-button> <n-button @click="printContract" style="margin-left: 8px;">打印</n-button>
        <n-button type="error" @click="voidContract" :disabled="!canVoid(contract.Status)" style="margin-left: 8px;">作废合同</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
// 引入 Naive UI 组件
import { NCard, NGrid, NGi, NButton, NTag, NTimeline, NTimelineItem, NCollapse, NCollapseItem, NScrollbar } from 'naive-ui';

const route = useRoute();
const router = useRouter();
const message = inject('message');
const dialog = inject('dialog');
const axiosInstance = inject('axios'); // 注入 axios 实例

const contract = ref({});
const loading = ref(true);

watch(() => route.params.id, (newId, oldId) => {
  if (newId) { fetchContractDetail(newId); }
}, { immediate: true });

async function fetchContractDetail(contractID) {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/query/contract/${contractID}/full-detail`); 
    contract.value = response.data;

  } catch (error) {
    console.error('获取合同详情失败:', error);
    message.error('获取合同详情失败，请稍后重试！');
  } finally {
    loading.value = false;
  }
}

function goBack() { router.push('/my-contract-module/query'); }
function editContract() { message.info(`模拟：编辑合同 ID: ${contract.value.ContractID}`); }
function submitForCosign() { message.info(`模拟：提交合同 ID: ${contract.value.ContractID} 会签`); }
function submitForApproval() { message.info(`模拟：提交合同 ID: ${contract.value.ContractID} 审批`); }
function finalizeContract() { message.info(`模拟：定稿合同 ID: ${contract.value.ContractID}`); }
// 【修正点】提示信息改为“签订”
function signContract() { message.info(`模拟：签订合同 ID: ${contract.value.ContractID}`); }
function printContract() { window.print(); message.success('正在准备打印...'); }
function voidContract() {
  dialog.warning({
    title: '警告',
    content: '确定要作废这份合同吗？作废后将无法恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await axiosInstance.post(`/query/contract/${contract.value.ContractID}/void`);
        message.success('合同已成功作废！');
        fetchContractDetail(contract.value.ContractID);
      } catch (error) {
        console.error('作废合同失败:', error);
        message.error('作废合同失败，请稍后重试！');
      }
    },
    onNegativeClick: () => {
      message.info('已取消作废操作。');
    }
  });
}
function viewDraftContent(content) {
    dialog.info({
        title: '草稿内容',
        content: () => h('pre', { style: 'max-height: 400px; overflow-y: auto; white-space: pre-wrap;' }, content),
        positiveText: '关闭',
        style: 'width: 80%; max-width: 800px;'
    });
}
function downloadFinalVersion(finalizationID) {
    message.success(`模拟：下载定稿版本 ID: ${finalizationID}`);
}
function previewAttachment(file) { message.info(`模拟：预览文件：${file.name}`); }
async function downloadAttachment(file) {
  try { message.success(`模拟：正在下载文件：${file.name}...`); }
  catch (error) { console.error('下载失败:', error); message.error('下载附件失败，请稍后重试！'); }
}

// Naive UI 的 Tag 类型 (用于详情页状态标签的颜色)
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

// 获取显示文本 (用于详情页状态标签的文字)
function getStatusText(status) {
  return status; // 直接返回数据库中的状态文本
}

// 根据合同状态判断操作按钮是否可用 (根据数据库 ENUM 实际值判断)
function canEdit(status) { return ['待起草', '会签处理中', '待定稿', '待审批'].includes(status); }
function canSubmitForCosign(status) { return ['待起草'].includes(status); }
function canSubmitForApproval(status) { return ['待起草'].includes(status); }
function canFinalize(status) { return ['会签处理中', '待审批'].includes(status); }
function canSign(status) { return ['待签订'].includes(status); }
function canVoid(status) { return !['已作废', '已签订', '未通过'].includes(status); } // 这里的 '已作废' 也要和数据库保持一致
</script>

<style scoped>
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
/* 注意：这里使用的图标类 icon-paperclip, icon-history, icon-document 需要你自行实现其 CSS 样式 */
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
.contract-content-pre {
    white-space: pre-wrap; /* 保持换行和空格，同时自动换行 */
    word-break: break-word; /* 避免长单词溢出 */
    font-family: monospace; /* 等宽字体更适合代码或文本内容 */
    background-color: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #eee;
}

.attachment-item {
  display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;
  justify-content: space-between; /* 使文件名称和操作按钮分开 */
}
.attachment-item:last-child { border-bottom: none; }
.attachment-item .icon-document::before { content: '📄'; margin-right: 8px; } /* 自定义文档图标 */
.attachment-item .file-name { margin-left: 8px; color: #409EFF; cursor: pointer; flex-grow: 1; }
.attachment-item .file-name:hover { text-decoration: underline; }

.no-data { color: #999; font-style: italic; text-align: center; padding: 15px 0; }
.detail-actions { text-align: center; margin-top: 30px; }
</style>