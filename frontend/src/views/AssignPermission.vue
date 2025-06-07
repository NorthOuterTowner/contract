<template>
  <div class="assign-permissions">
    <h2>分配权限 - 用户ID: {{ userId }}</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <!-- 选择角色部分 -->
      <div class="form-section">
        <h3 class="section-title">选择角色</h3>
        <div class="form-item">
          <label>角色：</label>
          <select v-model="selectedRole">
            <option v-for="role in allRoles" :key="role.RoleID" :value="role.RoleID">{{ role.RoleName }}</option>
          </select>
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
                @change="toggleFunction(Function.FunctionID)"
              />
              <span>{{ Function.FunctionName }}</span>
            </div>
            <div v-if="Function.children.length > 0" class="child-permissions">
              <div v-for="child in Function.children" :key="child.FunctionID" class="permission-item child-item">
                <input
                  type="checkbox"
                  :checked="isFunctionChecked(child.FunctionID)"
                  @change="toggleFunction(child.FunctionID)"
                />
                <span>{{ child.FunctionName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button @click="savePermissions" class="save-btn">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const userId = ref(route.params.userId);
const loading = ref(true);
const allRoles = ref([]);
const selectedRole = ref('');
const topLevelFunctions = ref([]);
const userPermissions = ref([]);

// 获取所有角色列表
const fetchAllRoles = async () => {
  try {
    const response = await axios.get('/role/all');
    allRoles.value = response.data;
  } catch (error) {
    console.error('获取所有角色列表失败:', error);
  }
};

// 获取用户当前的角色
const fetchUserRole = async () => {
  try {
    const response = await axios.get(`/user/role?userId=${userId.value}`);
    selectedRole.value = response.data.roleId;
  } catch (error) {
    console.error('获取用户当前角色失败:', error);
  }
};

// 获取所有功能权限
const fetchAllFunctions = async () => {
  try {
    const response = await axios.get('/function/all');
    topLevelFunctions.value = response.data.filter(func =>!func.ParentID);
    topLevelFunctions.value.forEach(parent => {
      parent.children = response.data.filter(child => child.ParentID === parent.FunctionID);
    });
  } catch (error) {
    console.error('获取所有功能权限失败:', error);
  }
};

// 获取用户当前的权限信息
const fetchUserPermissions = async () => {
  try {
    const response = await axios.get(`/user/permissions?userId=${userId.value}`);
    userPermissions.value = response.data.map(item => item.FunctionID);
  } catch (error) {
    console.error('获取用户当前权限信息失败:', error);
  }
};

// 检查功能是否被选中
const isFunctionChecked = (functionId) => {
  return userPermissions.value.includes(functionId);
};

// 切换功能选择
const toggleFunction = (functionId) => {
  if (userPermissions.value.includes(functionId)) {
    userPermissions.value = userPermissions.value.filter(id => id!== functionId);
  } else {
    userPermissions.value.push(functionId);
  }
};

// 保存权限分配
const savePermissions = async () => {
  try {
    await axios.post(`/user/assignPermissions?userId=${userId.value}`, {
      roleId: selectedRole.value,
      permissions: userPermissions.value
    });
    alert('权限分配保存成功！');
  } catch (error) {
    console.error('保存权限分配失败:', error);
    alert('权限分配保存失败，请稍后重试。');
  }
};

onMounted(async () => {
  await Promise.all([fetchAllRoles(), fetchUserRole(), fetchAllFunctions(), fetchUserPermissions()]);
  loading.value = false;
});
</script>

<style scoped>
.assign-permissions {
  max-width: 1000px;
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

.loading {
  margin: 16px 0;
  color: #999;
  text-align: center;
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

.form-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 120px);
  transition: border-color 0.3s;
}

.form-item select:focus {
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

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #28a745;
  color: white;
  transition: all 0.3s;
}

.save-btn:hover {
  background-color: #218838;
}
</style>