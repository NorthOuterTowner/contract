<template>
  <div class="add-function-container">
    <div class="header-actions">
      <button @click="goBack" class="back-btn">
        <i class="fa fa-arrow-left"></i> 返回功能管理
      </button>
    </div>

     <h2>添加功能</h2>

    <!-- 表单区域 -->
    <div class="form-section">
      <div class="input-group">
        <label class="form-label">功能 ID：</label>
        <div class="input-wrapper">
          <input v-model="functionId" type="text" readonly />
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">功能名称：</label>
        <div class="input-wrapper">
          <input
            v-model="functionName"
            type="text"
            placeholder="请输入功能名称"
            :class="{ 'is-error': !functionName && submitted }"
            required
          />
          <div v-if="!functionName && submitted" class="error-tooltip">
            功能名称不能为空
          </div>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">功能描述：</label>
        <div class="input-wrapper">
          <textarea
            v-model="functionDescription"
            placeholder="请输入功能描述"
            rows="3"
            class="textarea-input"
          ></textarea>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">父功能 ID：</label>
        <div class="input-wrapper">
          <input
            v-model="parentId"
            type="text"
            placeholder="若无可不填"
          />
        </div>
      </div>
    </div>
    <!-- 操作按钮区域 -->
    <div class="button-group">
      <button @click="handleSubmit" class="primary-btn">提交</button>
      <button @click="resetForm" class="secondary-btn">重置</button>
    </div>
    <!-- 消息提示 -->
    <div v-if="message" class="message-box">
      <span :class="{ 'success-msg': isSuccess, 'error-msg': !isSuccess }">{{
        message
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const functionId = ref("");
const functionName = ref("");
const functionDescription = ref("");
const parentId = ref("");
const submitted = ref(false);
const message = ref("");
const isSuccess = ref(false);

// 返回上一级页面
const goBack = () => {
  router.go(-1);
};

// 在组件挂载时获取下一个可用的功能 ID
const getNextFunctionId = async () => {
  try {
    const response = await axios.get("/function/getNextId");
    functionId.value = response.data.nextId;
  } catch (error) {
    message.value = "获取功能 ID 失败";
    isSuccess.value = false;
    console.error(error);
  }
};

getNextFunctionId();

const handleSubmit = async () => {
  submitted.value = true;
  if (!functionName.value) {
    message.value = "功能名称不能为空";
    isSuccess.value = false;
    return;
  }

  try {
    await axios.post("/function/add", {
      functionId: functionId.value,
      functionName: functionName.value,
      functionDescription: functionDescription.value,
      parentId: parentId.value || null,
    });
    message.value = "添加成功！";
    isSuccess.value = true;
    resetForm();
  } catch (error) {
    message.value = "添加失败！请检查输入或联系管理员";
    isSuccess.value = false;
    console.error(error);
  }
};

const resetForm = () => {
  functionName.value = "";
  functionDescription.value = "";
  parentId.value = "";
  submitted.value = false;
  getNextFunctionId();
};
</script>

<style scoped>
.add-function-container {
  max-width: 600px;
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
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.form-label {
  display: inline-block;
  width: 120px;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
}

.input-wrapper input,
.input-wrapper textarea {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

.error-tooltip {
  color: red;
  margin-left: 10px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 30px 0;
}

.primary-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.secondary-btn:hover {
  background-color: #495057;
}

.message-box {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  text-align: center;
  font-size: 16px;
}

.success-msg {
  background-color: #d4edda;
  color: #155724;
}

.error-msg {
  background-color: #f8d7da;
  color: #721c24;
}
</style>