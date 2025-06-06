<template>
  <div class="assign-permissions">
    <div class="header-actions">
      <button @click="goBack" class="back-btn">
        <i class="fa fa-arrow-left"></i> 返回权限分配
      </button>
    </div>
    <h2>分配权限</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div class="form-section">
        <h3 class="section-title">用户信息</h3>
        <div class="form-item">
          <label>用户名：</label>
          <span>{{ username }}</span>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">选择角色</h3>
        <div class="form-item">
          <label>角色：</label>
          <select v-model="selectedRole" @change="loadRolePermissions">
            <option v-for="role in allRoles" :key="role.RoleID" :value="role.RoleID">{{ role.RoleName }}</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">所选角色的功能权限(只读)</h3>
        <div class="permission-container">
          <div v-for="Function in topLevelFunctions" :key="Function.FunctionID" class="permission-group">
            <div class="permission-item parent-item">
              <input
                type="checkbox"
                :checked="isFunctionChecked(Function.FunctionID)"
                :disabled="true"
              />
              <span>{{ Function.FunctionName }}</span>
            </div>
            <div v-if="Function.children.length > 0" class="child-permissions">
              <div v-for="child in Function.children" :key="child.FunctionID" class="permission-item child-item">
                <input
                  type="checkbox"
                  :checked="isFunctionChecked(child.FunctionID)"
                  :disabled="true"
                />
                <span>{{ child.FunctionName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button @click="saveRole" class="save-btn">分配</button>
        <button @click="resetSelection" class="reset-btn">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const userId = ref(route.params.userId);
const loading = ref(true);
const allRoles = ref([]);
const selectedRole = ref('');
const topLevelFunctions = ref([]);
const userPermissions = ref([]);
const username = ref('');

// 返回权限分配列表
const goBack = () => {
  router.push('/permission');
};

// 获取所有角色列表
const fetchAllRoles = async () => {
  try {
    const response = await axios.get('/role/all');
    allRoles.value = response.data;
  } catch (error) {
    console.error('获取所有角色列表失败:', error);
  }
};

// 获取所有功能权限
const fetchAllFunctions = async () => {
  try {
    const response = await axios.get('/function/all');
    topLevelFunctions.value = response.data.filter(func => !func.ParentID);
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

// 获取用户信息（包括用户名和角色）
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`/user/query?query=${userId.value}`);
    if (response.data.length > 0) {
      username.value = response.data[0].user_name;
      
      // 根据后端返回的role_name匹配角色ID
      const userRole = allRoles.value.find(role => role.RoleName === response.data[0].role_name);
      if (userRole) {
        selectedRole.value = userRole.RoleID; // 设置初始选中的角色
      } else {
        console.error('未找到匹配的角色');
      }
    } else {
      console.error('未找到该用户');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 检查功能是否被选中
const isFunctionChecked = (functionId) => {
  return userPermissions.value.includes(functionId);
};

// 加载所选角色的权限
const loadRolePermissions = async () => {
  try {
    const response = await axios.get(`/role/permissions?roleId=${selectedRole.value}`);
    userPermissions.value = response.data.map(item => item.FunctionID);
  } catch (error) {
    console.error('获取角色权限失败:', error);
  }
};

// 保存角色修改
const saveRole = async () => {
  if (!selectedRole.value) {
    return alert('请选择角色');
  }

  try {
    // 调用后端接口更新角色
    const response = await axios.post(`/user/updateRole`, {
      userId: userId.value,
      roleId: selectedRole.value
    });
    
    if (response.data.message === '角色更新成功') {
      alert('角色更新成功！');
      router.push('/permission');
    } else {
      alert('角色更新失败：' + response.data.error);
    }
  } catch (error) {
    console.error('保存角色失败:', error);
    alert('角色更新失败，请稍后重试。');
  }
};

// 重置选择
const resetSelection = async () => {
  await fetchUserInfo();
  await loadRolePermissions();
};

onMounted(async () => {
  try {
    await Promise.all([
      fetchAllRoles(),
      fetchAllFunctions(),
      fetchUserPermissions(),
      fetchUserInfo()
    ]);
    // 根据获取的用户角色加载对应的权限
    await loadRolePermissions();
  } catch (error) {
    console.error('初始化数据失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.assign-permissions {
  max-width: 1000px;
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

.save-btn,
.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;
  transition: all 0.3s;
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
</style>