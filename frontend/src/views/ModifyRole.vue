<template>
  <div class="modify-role-container">
    <h2>角色详细信息</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="role">
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
        <button @click="showDeleteConfirm" class="delete-btn">
          <i class="fa fa-trash"></i> 删除
        </button>
      </div>
    </div>
    <div v-else class="error-message">未找到该角色的详细信息</div>

    <!-- 确认删除模态框 -->
    <div v-if="isDeleteConfirmVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-content">
          <p>确定要删除此角色吗？</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="action-btn secondary">取消</button>
          <button @click="confirmDelete" class="action-btn primary">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const message = inject('message');

const roleId = route.params.roleId;
const role = ref(null);
const loading = ref(false);
const isEditing = ref(false);
const allFunctions = ref([]);
const selectedFunctions = ref([]);
const topLevelFunctions = ref([]); 
const isDeleteConfirmVisible = ref(false);

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

// 获取角色已授权的功能
const getRolePermissions = async () => {
  try {
    const response = await axios.get(`/role/permissions?roleId=${roleId}`);
    selectedFunctions.value = response.data.map(item => item.FunctionID);
  } catch (error) {
    message.error('获取角色权限信息失败');
    console.error(error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/role/query?roleID=${roleId}`);
    if (response.data.length === 0) {
      message.error('角色不存在');
      router.push('/system/role');
    } else {
      role.value = response.data[0];
      await getFunctions();
      await getRolePermissions();
    }
  } catch (error) {
    message.error('获取角色信息失败');
    router.push('/system/role');
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
    // 检查角色名是否已存在（排除当前角色）
    const checkResponse = await axios.get(`/role/checkName?roleName=${role.value.RoleName}&roleID=${role.value.RoleID}`);
    if (checkResponse.data.exists) {
      return message.error('该角色名称已存在，请更换');
    }

    const response = await axios.put('/role/update', {
      roleID: role.value.RoleID,
      roleName: role.value.RoleName,
      roleDescription: role.value.RoleDescription,
      selectedFunctions: selectedFunctions.value
    });

    if (response.data.message) {
      message.success('修改成功！');
      isEditing.value = false;
    } else {
      message.error('修改失败！');
    }
  } catch (error) {
    message.error(error.response?.data?.error || '修改失败！');
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
    await axios.delete(`/role/delete?roleId=${roleId}`);
    message.success('删除成功！');
    router.push('/role');
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  }
  isDeleteConfirmVisible.value = false;
};
</script>

<style scoped>
.modify-role-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
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

.edit-btn, .save-btn, .delete-btn {
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
</style>