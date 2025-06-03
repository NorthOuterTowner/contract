<template>
  <div class="modify-role-container">
    <!-- 返回按钮 -->
    <button @click="goBack" class="back-btn">
      <i class="fa fa-arrow-left"></i> 返回角色管理
    </button>
    <h2>添加角色</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <!-- 角色基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-item">
          <label>角色 ID：</label>
          <input v-model="role.RoleID" type="text" readonly />
        </div>
        <div class="form-item">
          <label>角色名称：</label>
          <input v-model="role.RoleName" type="text" :readonly="!isEditing" />
        </div>
        <div class="form-item">
          <label>角色描述：</label>
          <input v-model="role.RoleDescription" type="text" :readonly="!isEditing" />
        </div>
      </div>

      <!-- 功能权限区域 -->
      <div class="form-section">
        <h3 class="section-title">功能权限</h3>
        <div class="permission-container">
          <div v-for="Function in topLevelFunctions" :key="Function.FunctionID" class="permission-group">
            <div class="permission-item parent-item">
              <input
                type="checkbox"
                :checked="isFunctionChecked(Function.FunctionID)"
                :disabled="!isEditing"
                @change="toggleFunction(Function.FunctionID)"
              />
              <span>{{ Function.FunctionName }}</span>
            </div>
            <div v-if="Function.children.length > 0" class="child-permissions">
              <div v-for="child in Function.children" :key="child.FunctionID" class="permission-item child-item">
                <input
                  type="checkbox"
                  :checked="isFunctionChecked(child.FunctionID)"
                  :disabled="!isEditing"
                  @change="toggleFunction(child.FunctionID)"
                />
                <span>{{ child.FunctionName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button @click="editRole" v-if="!isEditing" class="edit-btn">
          <i class="fa fa-pencil"></i> 编辑
        </button>
        <button @click="saveRole" v-if="isEditing" class="save-btn">
          <i class="fa fa-save"></i> 保存
        </button>
        <!-- 重置按钮 -->
        <button @click="resetForm" v-if="isEditing" class="reset-btn">
          <i class="fa fa-refresh"></i> 重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const role = ref({
  RoleID: '',
  RoleName: '',
  RoleDescription: ''
});
const loading = ref(false);
const isEditing = ref(true); // 添加角色页面默认处于编辑状态
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
    message.error('获取功能列表失败');
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
    role.value.RoleID = response.data.nextId;
  } catch (error) {
    message.error('获取角色 ID 失败');
    console.error(error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await getNextRoleId();
    await getFunctions();
  } catch (error) {
    message.error('获取角色信息失败');
    router.push('/role');
  } finally {
    loading.value = false;
  }
});

const editRole = () => {
  isEditing.value = true;
};

const saveRole = async () => {
  if (!role.value.RoleName.trim()) {
    return message.error('角色名称不能为空');
  }

  try {
    // 检查角色名是否已存在
    const checkResponse = await axios.get(`/role/checkName?roleName=${role.value.RoleName}`);
    if (checkResponse.data.exists) {
      return message.error('该角色名称已存在，请更换');
    }

    const response = await axios.post('/role/add', {
      roleName: role.value.RoleName,
      roleDescription: role.value.RoleDescription,
      selectedFunctions: selectedFunctions.value
    });

    if (response.data.message) {
      message.success('添加成功！');
      router.push('/role');
    } else {
      message.error('添加失败！');
    }
  } catch (error) {
    message.error(error.response?.data?.error || '添加失败！');
  }
};

// 重置表单
const resetForm = async () => {
  role.value = {
    RoleID: '',
    RoleName: '',
    RoleDescription: ''
  };
  selectedFunctions.value = [];
  await getNextRoleId();
};

// 返回角色管理页面
const goBack = () => {
  router.push('/role');
};
</script>

<style scoped>
/* 复用编辑角色页面的样式 */
.modify-role-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #6c757d;
  color: white;
  margin-bottom: 20px;
}

.back-btn:hover {
  background-color: #5a6268;
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

.form-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 120px);
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #007bff;
}

.permission-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.permission-group {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s;
}

.permission-group:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.permission-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.permission-item input {
  margin-right: 10px;
}

.parent-item {
  font-weight: 600;
  color: #333;
}

.child-permissions {
  margin-left: 20px;
}

.child-item {
  color: #555;
}

.button-group {
  text-align: center;
  margin-top: 20px;
}

.edit-btn, .save-btn, .reset-btn {
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
  background-color: #dc3545;
  color: white;
}

.reset-btn:hover {
  background-color: #c82333;
}

.loading {
  margin: 16px 0;
  color: #999;
  text-align: center;
}

.error-message {
  color: red;
  text-align: center;
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
</style>