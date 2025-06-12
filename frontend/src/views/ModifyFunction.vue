<template>
  <div class="modify-role-container">
    <div class="header-actions">
      <button @click="goBack" class="back-btn">
        <i class="fa fa-arrow-left"></i> 返回功能管理
      </button>
    </div>
    <h2>编辑功能</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <!-- 功能基本信息 -->
      <div class="form-section">
        <h3 class="section-title">功能详细信息</h3>
        <div class="form-item">
          <label>功能 ID：</label>
          <input v-model="functionId" type="text" readonly />
        </div>
        <div class="form-item">
          <label>功能名称：</label>
          <input
            v-model="functionName"
            type="text"
            :readonly="!isEditing"
            placeholder="请输入功能名称"
            :class="{ 'is-error': !functionName && submitted }"
            required
          />
          <div v-if="!functionName && submitted" class="error-tooltip">
            功能名称不能为空
          </div>
        </div>
        <div class="form-item">
          <label>功能描述：</label>
          <textarea
            v-model="functionDescription"
            placeholder="请输入功能描述"
            rows="3"
            class="textarea-input"
            :readonly="!isEditing"
          ></textarea>
        </div>
        <div class="form-item">
          <label>功能路由：</label>
          <div class="input-wrapper-routes">
            <div v-for="(route, index) in functionRoutes" :key="index" class="route-input-group">
              <input
                v-model="functionRoutes[index]"
                type="text"
                placeholder="请输入功能路由"
                :readonly="!isEditing"
              />
              <button v-if="isEditing && functionRoutes.length > 1" @click="removeRoute(index)">删除</button>
            </div>
            <button v-if="isEditing" @click="addRoute">添加路由</button>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button @click="editFunction" v-if="!isEditing" class="edit-btn">
          <i class="fa fa-pencil"></i> 编辑
        </button>
        <button @click="saveFunction" v-if="isEditing" class="save-btn">
          <i class="fa fa-save"></i> 保存
        </button>
        <!-- 新增重置按钮 -->
        <button @click="showResetConfirm" v-if="isEditing" class="reset-btn">
          <i class="fa fa-refresh"></i> 重置
        </button>
        <button @click="showDeleteConfirm" class="delete-btn">
          <i class="fa fa-trash"></i> 删除
        </button>
      </div>
    </div>
    <!-- 消息提示 -->
    <div v-if="message" class="message-box">
      <span :class="{ 'success-msg': isSuccess, 'error-msg': !isSuccess }">{{
        message
      }}</span>
    </div>

    <!-- 确认删除模态框 -->
    <div v-if="isDeleteConfirmVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-content">
          <p>确定要删除此功能吗？</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="action-btn secondary">取消</button>
          <button @click="confirmDelete" class="action-btn primary">确认</button>
        </div>
      </div>
    </div>

    <!-- 确认重置模态框 -->
    <div v-if="isResetConfirmVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>确认重置</h3>
        </div>
        <div class="modal-content">
          <p>确定要重置到未编辑前状态吗？</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelReset" class="action-btn secondary">取消</button>
          <button @click="confirmReset" class="action-btn primary">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const functionId = ref(route.params.functionId);
const functionName = ref("");
const functionDescription = ref("");
const functionRoutes = ref([]);
const submitted = ref(false);
const message = ref("");
const isSuccess = ref(false);
const isEditing = ref(false);
const isDeleteConfirmVisible = ref(false);
const isResetConfirmVisible = ref(false); // 确认重置模态框显示状态
const originalFunctionName = ref("");
const originalFunctionDescription = ref("");
const originalFunctionRoutes = ref([]);

// 返回上一级页面
const goBack = () => {
  router.go(-1);
};

// 在组件挂载时获取功能信息
const getFunctionInfo = async () => {
  try {
    // 修改查询功能信息的请求参数
    const [functionResponse, routesResponse] = await Promise.all([
      axios.get(`/function/query?functionId=${functionId.value}`),
      axios.get(`/function/queryRoutes/${functionId.value}`)
    ]);

    // 过滤出正确的功能信息
    const functionData = functionResponse.data.find(item => item.FunctionID === parseInt(functionId.value));
    if (functionData) {
      functionName.value = functionData.FunctionName;
      functionDescription.value = functionData.FunctionDescription;
      originalFunctionName.value = functionData.FunctionName;
      originalFunctionDescription.value = functionData.FunctionDescription;
    }

    // 获取功能路由信息
    const routesData = routesResponse.data;
    functionRoutes.value = routesData.map(route => route.Route);
    originalFunctionRoutes.value = [...functionRoutes.value];
  } catch (error) {
    message.value = "获取功能信息失败";
    isSuccess.value = false;
    console.error(error);
  }
};

getFunctionInfo();

// 添加路由输入框
const addRoute = () => {
  functionRoutes.value.push("");
};

// 删除路由输入框
const removeRoute = (index) => {
  functionRoutes.value.splice(index, 1);
};

const editFunction = () => {
  isEditing.value = true;
};

const saveFunction = async () => {
  submitted.value = true;
  if (!functionName.value) {
    message.value = "功能名称不能为空";
    isSuccess.value = false;
    return;
  }

  try {
    await axios.put("/function/update", {
      functionId: functionId.value,
      functionName: functionName.value,
      functionDescription: functionDescription.value,
      functionRoutes: functionRoutes.value,
      // 这里添加 parentId 参数，如果不需要可以去掉
      parentId: null 
    });
    message.value = "修改成功！";
    isSuccess.value = true;
    isEditing.value = false;
    originalFunctionName.value = functionName.value;
    originalFunctionDescription.value = functionDescription.value;
    originalFunctionRoutes.value = [...functionRoutes.value];
  } catch (error) {
    message.value = "修改失败！请检查输入或联系管理员";
    isSuccess.value = false;
    console.error(error);
  }
};

const showDeleteConfirm = () => {
  isDeleteConfirmVisible.value = true;
};

const cancelDelete = () => {
  isDeleteConfirmVisible.value = false;
};

const confirmDelete = async () => {
  try {
    await axios.delete(`/function/delete?functionId=${functionId.value}`);
    message.value = "删除成功！";
    isSuccess.value = true;
    router.go(-1);
  } catch (error) {
    message.value = "删除失败！请检查输入或联系管理员";
    isSuccess.value = false;
    console.error(error);
  }
  isDeleteConfirmVisible.value = false;
};

// 显示确认重置模态框
const showResetConfirm = () => {
  isResetConfirmVisible.value = true;
};

// 取消重置
const cancelReset = () => {
  isResetConfirmVisible.value = false;
};

// 确认重置
const confirmReset = () => {
  functionName.value = originalFunctionName.value;
  functionDescription.value = originalFunctionDescription.value;
  functionRoutes.value = [...originalFunctionRoutes.value];
  isEditing.value = false;
  isResetConfirmVisible.value = false;
};
</script>

<style scoped>
.modify-role-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.header-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.back-btn:hover {
  background-color: #5a6268;
}

.back-btn i {
  margin-right: 8px;
}

h2 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #555;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-item label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.form-item input,
.form-item textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 120px);
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #007bff;
}

.error-tooltip {
  color: red;
  margin-left: 10px;
  white-space: nowrap;
}

.button-group {
  text-align: center;
  margin-top: 20px;
}

.edit-btn, .save-btn, .reset-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
  transition: all 0.3s;
}

.edit-btn {
  background-color: #007bff;
  color: white;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.save-btn {
  background-color: #28a745;
  color: white;
}

.save-btn:hover {
  background-color: #218838;
}

.reset-btn {
  background-color: #ffc107;
  color: white;
}

.reset-btn:hover {
  background-color: #e0a800;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.loading {
  margin: 16px 0;
  color: #999;
  text-align: center;
}

.message-box {
  margin-top: 20px;
  text-align: center;
}

.success-msg {
  color: green;
}

.error-msg {
  color: red;
}

.action-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.action-btn:hover {
  background-color: #0056b3;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.modal-content {
  padding: 16px;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #ddd;
  text-align: right;
}

.action-btn.secondary {
  background-color: #6c757d;
}

.action-btn.secondary:hover {
  background-color: #495057;
}

.action-btn.primary:hover {
  background-color: #0056b3;
}

/* 新增路由输入框样式 */
.input-wrapper-routes {
  display: flex;
  flex-direction: column;
  width: calc(100% - 120px);
}

.route-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.route-input-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  transition: border-color 0.3s;
  margin-right: 10px;
}

.route-input-group input:focus {
  outline: none;
  border-color: #007bff;
}
</style>