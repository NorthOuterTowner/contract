<template>
  <div class="add-role-container">
    <h2 class="page-title">添加角色</h2>

    <!-- 新增：显示角色 ID 的输入框 -->
    <div class="input-group">
      <label class="form-label">角色 ID：</label>
      <div class="input-wrapper">
        <input 
          v-model="roleId" 
          type="text" 
          readonly
        />
      </div>
    </div>

    <!-- 表单区域 -->
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
          <div v-if="!roleName && submitted" class="error-tooltip">角色名称不能为空</div>
        </div>
      </div>

      <div class="input-group">
        <label class="form-label">描 述：</label>
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

    <!-- 权限配置区域 -->
    <div class="permission-section">
      <h3 class="section-title">权限配置：</h3>
      <div class="permission-grid">
        <!-- 合同管理 -->
        <div class="permission-category">
          <h4 class="category-title">合同管理</h4>
          <div class="permission-group">
            <PermissionItem label="起草合同" value="draft" :checked="permissions.includes('draft')" @toggle="togglePermission('draft')" />
            <PermissionItem label="定稿合同" value="finalize" :checked="permissions.includes('finalize')" @toggle="togglePermission('finalize')" />
            <PermissionItem label="查询合同" value="query_contract" :checked="permissions.includes('query_contract')" @toggle="togglePermission('query_contract')" />
            <PermissionItem label="删除合同" value="delete_contract" :checked="permissions.includes('delete_contract')" @toggle="togglePermission('delete_contract')" />
          </div>
        </div>

        <!-- 流程管理 -->
        <div class="permission-category">
          <h4 class="category-title">流程管理</h4>
          <div class="permission-group">
            <PermissionItem label="会签合同" value="countersign" :checked="permissions.includes('countersign')" @toggle="togglePermission('countersign')" />
            <PermissionItem label="审批合同" value="approve" :checked="permissions.includes('approve')" @toggle="togglePermission('approve')" />
            <PermissionItem label="签订合同" value="sign" :checked="permissions.includes('sign')" @toggle="togglePermission('sign')" />
            <PermissionItem label="分配会签" value="assign_countersign" :checked="permissions.includes('assign_countersign')" @toggle="togglePermission('assign_countersign')" />
            <PermissionItem label="分配审批" value="assign_approve" :checked="permissions.includes('assign_approve')" @toggle="togglePermission('assign_approve')" />
            <PermissionItem label="分配签订" value="assign_sign" :checked="permissions.includes('assign_sign')" @toggle="togglePermission('assign_sign')" />
            <PermissionItem label="流程查询" value="process_query" :checked="permissions.includes('process_query')" @toggle="togglePermission('process_query')" />
          </div>
        </div>

        <!-- 用户管理 -->
        <div class="permission-category">
          <h4 class="category-title">用户管理</h4>
          <div class="permission-group">
            <PermissionItem label="新增用户" value="add_user" :checked="permissions.includes('add_user')" @toggle="togglePermission('add_user')" />
            <PermissionItem label="编辑用户" value="edit_user" :checked="permissions.includes('edit_user')" @toggle="togglePermission('edit_user')" />
            <PermissionItem label="查询用户" value="query_user" :checked="permissions.includes('query_user')" @toggle="togglePermission('query_user')" />
            <PermissionItem label="删除用户" value="delete_user" :checked="permissions.includes('delete_user')" @toggle="togglePermission('delete_user')" />
          </div>
        </div>

        <!-- 角色管理 -->
        <div class="permission-category">
          <h4 class="category-title">角色管理</h4>
          <div class="permission-group">
            <PermissionItem label="新增角色" value="add_role" :checked="permissions.includes('add_role')" @toggle="togglePermission('add_role')" />
            <PermissionItem label="编辑角色" value="edit_role" :checked="permissions.includes('edit_role')" @toggle="togglePermission('edit_role')" />
            <PermissionItem label="查询角色" value="query_role" :checked="permissions.includes('query_role')" @toggle="togglePermission('query_role')" />
            <PermissionItem label="删除角色" value="delete_role" :checked="permissions.includes('delete_role')" @toggle="togglePermission('delete_role')" />
          </div>
        </div>

        <!-- 功能操作 -->
        <div class="permission-category">
          <h4 class="category-title">功能操作</h4>
          <div class="permission-group">
            <PermissionItem label="新增功能" value="add_function" :checked="permissions.includes('add_function')" @toggle="togglePermission('add_function')" />
            <PermissionItem label="编辑功能" value="edit_function" :checked="permissions.includes('edit_function')" @toggle="togglePermission('edit_function')" />
            <PermissionItem label="查询功能" value="query_function" :checked="permissions.includes('query_function')" @toggle="togglePermission('query_function')" />
            <PermissionItem label="删除功能" value="delete_function" :checked="permissions.includes('delete_function')" @toggle="togglePermission('delete_function')" />
          </div>
        </div>

        <!-- 权限管理 -->
        <div class="permission-category">
          <h4 class="category-title">权限管理</h4>
          <div class="permission-group">
            <PermissionItem label="配置权限" value="assign_permission" :checked="permissions.includes('assign_permission')" @toggle="togglePermission('assign_permission')" />
          </div>
        </div>

        <!-- 客户管理 -->
        <div class="permission-category">
          <h4 class="category-title">客户管理</h4>
          <div class="permission-group">
            <PermissionItem label="新增客户" value="add_customer" :checked="permissions.includes('add_customer')" @toggle="togglePermission('add_customer')" />
            <PermissionItem label="编辑客户" value="edit_customer" :checked="permissions.includes('edit_customer')" @toggle="togglePermission('edit_customer')" />
            <PermissionItem label="查询客户" value="query_customer" :checked="permissions.includes('query_customer')" @toggle="togglePermission('query_customer')" />
            <PermissionItem label="删除客户" value="delete_customer" :checked="permissions.includes('delete_customer')" @toggle="togglePermission('delete_customer')" />
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
      <span :class="{ 'success-msg': isSuccess, 'error-msg': !isSuccess }">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import PermissionItem from '../components/PermissionItem.vue'; // 引入权限项组件

const roleId = ref('');
const roleName = ref('');
const roleDescription = ref('');
const permissions = ref([]);
const submitted = ref(false);
const message = ref('');
const isSuccess = ref(false);

// 在组件挂载时获取下一个可用的角色 ID
onMounted(async () => {
  try {
    const response = await axios.get('/role/getNextId');
    roleId.value = response.data.nextId;
  } catch (error) {
    console.error('获取角色 ID 失败', error);
  }
});

// 权限切换方法
const togglePermission = (value) => {
  if (permissions.value.includes(value)) {
    permissions.value = permissions.value.filter(item => item !== value);
  } else {
    permissions.value.push(value);
  }
};

const handleSubmit = async () => {
  submitted.value = true;
  if (!roleName.value) {
    message.value = '角色名称不能为空';
    isSuccess.value = false;
    return;
  }

  try {
    await axios.post('/api/role/add', {
      roleId: roleId.value,
      roleName: roleName.value,
      roleDescription: roleDescription.value,
      permissions: permissions.value
    });
    message.value = '添加成功！';
    isSuccess.value = true;
    resetForm();
  } catch (error) {
    message.value = '添加失败！请检查输入或联系管理员';
    isSuccess.value = false;
    console.error(error);
  }
};

const resetForm = () => {
  roleId.value = '';
  roleName.value = '';
  roleDescription.value = '';
  permissions.value = [];
  submitted.value = false;
  message.value = '';
};
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.add-role-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 20px;
  border-bottom: 2px solid #e0f2ff;
  padding-bottom: 10px;
}

.form-section {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.textarea-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.input-wrapper input:focus,
.textarea-input:focus {
  border-color: #007bff;
  outline: none;
}

.input-wrapper .is-error {
  border-color: #ff4444;
}

.error-tooltip {
  color: #ff4444;
  font-size: 14px;
  margin-top: 6px;
  height: 20px;
  line-height: 20px;
}

.textarea-input {
  resize: vertical;
  min-height: 80px;
}

.section-title {
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.permission-category {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
}

.category-title {
  color: #666;
  font-size: 18px;
  margin-bottom: 15px;
}

.permission-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

/* 权限项组件样式 */
.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.permission-item:hover {
  background-color: #e0f2ff;
}

.permission-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #007bff;
  border: 2px solid #e0e0e0;
}

.permission-item label {
  font-size: 16px;
  color: #333;
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
  border: 1px solid #c3e6cb;
}

.error-msg {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>