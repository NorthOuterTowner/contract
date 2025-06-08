<template>
  <div class="edit-user-container">
    <div class="header-actions">
      <button @click="goBack" class="back-btn">
        <i class="fa fa-arrow-left"></i> 返回用户列表
      </button>
      <h2>用户详细信息</h2>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="user">
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-item">
          <label>用户 ID：</label>
          <input v-model="user.user_id" type="text" readonly />
        </div>
        <div class="form-item">
          <label>用户名：</label>
          <input v-model="user.user_name" type="text" :readonly="!isEditing" />
        </div>
        <div class="form-item">
          <label>用户密码：</label>
          <input v-model="user.password" type="password" :readonly="!isEditing" />
        </div>
        <div class="form-item">
          <label>用户角色：</label>
          <select v-model="selectedRole" :disabled="!isEditing">
            <option v-for="role in allRoles" :key="role.RoleID" :value="role.RoleID">{{ role.RoleName }}</option>
          </select>
        </div>
      </div>

      <div class="button-group">
        <button @click="editUser" v-if="!isEditing" class="edit-btn">
          <i class="fa fa-pencil"></i> 编辑
        </button>
        <div v-if="isEditing" class="editing-buttons">
          <button @click="resetUser" class="reset-btn">
            <i class="fa fa-refresh"></i> 重置
          </button>
          <button @click="saveUser" class="save-btn">
            <i class="fa fa-save"></i> 保存
          </button>
        </div>
        <!-- 让删除按钮在初始状态下也显示 -->
        <button @click="showDeleteConfirm" class="delete-btn">
          <i class="fa fa-trash"></i> 删除
        </button>
      </div>
    </div>
    <div v-else class="error-message">未找到该用户的详细信息</div>

    <!-- 确认删除模态框 -->
    <div v-if="isDeleteConfirmVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-content">
          <p v-if="userId === authStore.currentUser.id">不能删除自己！</p>
          <p>确定要删除此用户吗？</p>
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
import { useAuthStore } from '../common/auth';

const router = useRouter();
const route = useRoute();
const message = inject('message');
const authStore = useAuthStore();

const userId = route.params.userId;
const user = ref(null);
const loading = ref(false);
const isEditing = ref(false);
const allRoles = ref([]);
const selectedRole = ref('');
const isDeleteConfirmVisible = ref(false);
const originalUser = ref(null);

// 返回用户列表页面
const goBack = () => {
  router.push('/user');
};

// 获取所有角色数据
const getRoles = async () => {
  try {
    const response = await axios.get('/role/all');
    allRoles.value = response.data;
  } catch (error) {
    message.error('获取角色列表失败');
    console.error(error);
    // 抛出错误，阻止后续操作
    throw error; 
  }
};

// 获取用户信息
const getUserInfo = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/user/query?query=${userId}`);
    if (response.data.length === 0) {
      message.error('用户不存在');
      router.push('/user');
    } else {
      user.value = response.data[0];
      // 修复：根据后端返回的role_name匹配角色ID
      const userRole = allRoles.value.find(role => role.RoleName === user.value.role_name);
      if (userRole) {
        selectedRole.value = userRole.RoleID; // 设置初始选中的角色
      }
    }
  } catch (error) {
    message.error('获取用户信息失败');
    router.push('/user');
  } finally {
    loading.value = false;
  }
};

const editUser = () => {
  // 编辑前保存原始数据
  originalUser.value = JSON.parse(JSON.stringify(user.value));
  isEditing.value = true;
};

const resetUser = () => {
  if (!originalUser.value) return;
  
  if (confirm('确定要重置所有修改吗？')) {
    user.value = JSON.parse(JSON.stringify(originalUser.value));
    
    // 关键修复：根据角色名称找到对应的角色ID
    const userRole = allRoles.value.find(role => role.RoleName === originalUser.value.role_name);
    if (userRole) {
      selectedRole.value = userRole.RoleID;
    }
    
    isEditing.value = false;
  }
};

const saveUser = async () => {
  if (!user.value.user_name.trim()) {
    return message.error('用户名不能为空');
  }
  if (!user.value.password.trim()) {
    return message.error('用户密码不能为空');
  }

  try {
    const response = await axios.put('/user/update', {
      userId: user.value.user_id,
      userName: user.value.user_name,
      password: user.value.password,
      roleId: selectedRole.value
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
  if (userId === authStore.user?.id) {
    message.error('不能删除自己！');
    return;
  }
  try {
    await axios.delete(`/user/delete?userId=${userId}`);
    message.success('删除成功！');
    router.push('/user');
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  }
  isDeleteConfirmVisible.value = false;
};

onMounted(async () => {
  try {
    await getRoles();
    await getUserInfo();
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});
</script>

<style scoped>
.edit-user-container {
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
.form-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 120px);
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #007bff;
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

.reset-btn {
  background-color: #ffc107;
  color: white;
}

.reset-btn:hover {
  background-color: #e0a800;
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

/* 编辑状态下按钮排列样式 */
.editing-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>