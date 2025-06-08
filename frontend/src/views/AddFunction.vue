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
      <!-- 路由输入区域 -->
      <div class="input-group">
        <label class="form-label">功能路由：</label>
        <div v-for="(route, index) in functionRoutes" :key="index" class="input-wrapper route-input-wrapper">
          <input
            v-model="functionRoutes[index]"
            type="text"
            placeholder="请输入功能路由"
          />
          <button v-if="functionRoutes.length > 1" @click="removeRoute(index)">删除</button>
        </div>
        <button @click="addRoute">添加路由</button>
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
const functionRoutes = ref([""]); // 初始一个路由输入框
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

// 添加路由输入框
const addRoute = () => {
  functionRoutes.value.push("");
};

// 删除路由输入框
const removeRoute = (index) => {
  functionRoutes.value.splice(index, 1);
};

const handleSubmit = async () => {
  submitted.value = true;
  if (!functionName.value) {
    message.value = "功能名称不能为空";
    isSuccess.value = false;
    return;
  }

  try {
    // 添加功能
    const addFunctionResponse = await axios.post("/function/add", {
      functionId: functionId.value,
      functionName: functionName.value,
      functionDescription: functionDescription.value,
      parentId: parentId.value || null,
      functionRoutes: functionRoutes.value.filter(route => route) // 过滤掉空路由
    });

    message.value = "添加成功！";
    isSuccess.value = true;
    // 添加成功后返回功能管理页面
    router.push('/function');
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
  functionRoutes.value = [""];
  submitted.value = false;
  getNextFunctionId();
};
</script>

<style scoped>
.add-function-container {
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
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column; /* 修改为垂直布局 */
  align-items: flex-start;
}

.form-label {
  width: 120px;
  font-weight: 500;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.input-wrapper input,
.input-wrapper textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  transition: border-color 0.3s;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: #007bff;
}

.error-tooltip {
  color: red;
  margin-left: 10px;
  white-space: nowrap;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 30px 0;
}

.primary-btn,
.secondary-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background-color: #5a6268;
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

.route-input-wrapper {
  flex-direction: column; /* 路由输入框垂直布局 */
  align-items: flex-start;
}

.route-input-wrapper input {
  margin-bottom: 5px;
}
</style>