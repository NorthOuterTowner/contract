<template>
  <div class="add-role-container">
    <h2 class="page-title">添加角色</h2>
      <div class="input-group">
        <label class="form-label">角色 ID：</label>
        <div class="input-wrapper">
          <input v-model="roleId" type="text" readonly />
        </div>
    </div>
    <div class="form-section">
      <div class="input-group">
        <label class="form-label">角色名称：</label>
        <div class="input-wrapper">
          <input
            v-model="roleName"
            type="text"
            placeholder="请输入角色名称"
            :class="{ 'is-error': !roleName && submitted }"
            required
          />
          <div v-if="!roleName && submitted" class="error-tooltip">
            角色名称不能为空
          </div>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">角色描述：</label>
        <div class="input-wrapper">
          <textarea
            v-model="roleDescription"
            placeholder="请输入角色描述"
            rows="3"
            class="textarea-input"
          ></textarea>
        </div>
      </div>
    </div>
    <!-- 功能权限区域 -->
    <div class="permission-section">
      <h3 class="section-title">功能权限</h3>
      <div v-for="Function in topLevelFunctions" :key="Function.FunctionID" class="Function-group">
        <div class="parent-Function">
          <input
            type="checkbox"
            :checked="isFunctionChecked(Function.FunctionID)"
            @change="toggleFunction(Function.FunctionID)"
          />
          {{ Function.FunctionName }}
        </div>
        <div v-if="Function.children.length > 0" class="child-Functions">
          <div v-for="child in Function.children" :key="child.FunctionID">
            <input
              type="checkbox"
              :checked="isFunctionChecked(child.FunctionID)"
              @change="toggleFunction(child.FunctionID)"
            />
            {{ child.FunctionName }}
          </div>
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
import { ref, onMounted } from "vue";
import axios from "axios";

const roleId = ref("");
const roleName = ref("");
const roleDescription = ref("");
const submitted = ref(false);
const message = ref("");
const isSuccess = ref(false);
const allFunctions = ref([]);
const selectedFunctions = ref([]);
const topLevelFunctions = ref([]); 

// 获取所有功能数据
const getFunctions = async () => {
  try {
    const response = await axios.get('/function/all');
    allFunctions.value = response.data;
    buildFunctionTree();
  } catch (error) {
    message.value = "获取功能列表失败";
    isSuccess.value = false;
    console.error(error);
  }
};

// 构建功能树结构
const buildFunctionTree = () => {
  const functionMap = {};
  const topLevel = [];

  allFunctions.value.forEach((func) => {
    func.children = [];
    functionMap[func.FunctionID] = func;
  });

  allFunctions.value.forEach((func) => {
    if (func.ParentID === null) {
      topLevel.push(func);
    } else {
      const parent = functionMap[func.ParentID];
      if (parent) {
        parent.children.push(func);
      }
    }
  });

  topLevelFunctions.value = topLevel; 
};

// 检查功能是否被选中
const isFunctionChecked = (FunctionId) => {
  return selectedFunctions.value.includes(FunctionId);
};

// 递归取消子功能选中状态
const unselectChildren = (functionId) => {
  const functionObj = allFunctions.value.find((func) => func.FunctionID === functionId);
  if (functionObj && functionObj.children.length > 0) {
    functionObj.children.forEach((child) => {
      const index = selectedFunctions.value.indexOf(child.FunctionID);
      if (index > -1) {
        selectedFunctions.value.splice(index, 1);
      }
      unselectChildren(child.FunctionID);
    });
  }
};

// 切换功能勾选状态
const toggleFunction = (FunctionId) => {
  const index = selectedFunctions.value.indexOf(FunctionId);
  if (index > -1) {
    selectedFunctions.value.splice(index, 1);
    // 取消选中父功能时，取消所有子功能选中状态
    unselectChildren(FunctionId);
  } else {
    selectedFunctions.value.push(FunctionId);
    // 选中父功能时，选中所有子功能
    const functionObj = allFunctions.value.find((func) => func.FunctionID === FunctionId);
    if (functionObj && functionObj.children.length > 0) {
      functionObj.children.forEach((child) => {
        if (!selectedFunctions.value.includes(child.FunctionID)) {
          selectedFunctions.value.push(child.FunctionID);
        }
      });
    }
  }
};

// 在组件挂载时获取下一个可用的角色 ID
const getNextRoleId = async () => {
  try {
    const response = await axios.get("/role/getNextId");
    roleId.value = response.data.nextId;
  } catch (error) {
    message.value = "获取角色 ID 失败";
    isSuccess.value = false;
    console.error(error);
  }
};

// 提交表单
const handleSubmit = async () => {
  submitted.value = true;
  if (!roleName.value) {
    message.value = "角色名称不能为空";
    isSuccess.value = false;
    return;
  }

  try {
    await axios.post("/role/add", {
      roleId: roleId.value,
      roleName: roleName.value,
      roleDescription: roleDescription.value,
      selectedFunctions: selectedFunctions.value,
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

// 重置表单
const resetForm = () => {
  getNextRoleId();
  roleName.value = "";
  roleDescription.value = "";
  submitted.value = false;
  selectedFunctions.value = [];
};

onMounted(() => {
  getFunctions();
  getNextRoleId();
});
</script>

<style scoped>
.add-role-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
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

.permission-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.Function-group {
  margin-bottom: 10px;
}

.parent-Function {
  font-weight: bold;
  margin-bottom: 5px;
}

.child-Functions {
  margin-left: 20px;
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