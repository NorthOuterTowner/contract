<template>
  <div class="add-user-container">
    <div class="header-actions">
      <button @click="goBack" class="back-btn">
        <i class="fa fa-arrow-left"></i> 返回用户管理
      </button>
    </div>
    <h2>添加用户</h2>
    <!-- 表单区域 -->
    <div class="form-section">
      <h3 class="section-title">基本信息</h3>
      <div class="form-item">
        <label>用户 ID：</label>
        <input v-model="userId" type="text" readonly />
      </div>
      <div class="form-item">
        <label>用户名：</label>
        <div class="input-wrapper">
          <input
            v-model="userName"
            type="text"
            placeholder="请输入用户名"
            :class="{ 'is-error':!userName && submitted }"
            required
          />
          <div v-if="!userName && submitted" class="error-tooltip">
            用户名不能为空
          </div>
        </div>
      </div>
      <div class="form-item">
        <label>密码：</label>
        <div class="input-wrapper">
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :class="{ 'is-error':!password && submitted }"
            required
          />
          <div v-if="!password && submitted" class="error-tooltip">
            密码不能为空
          </div>
          <div v-if="password && password.length < 6 && submitted" class="error-tooltip">
            密码长度至少6位
          </div>
        </div>
      </div>
      <div class="form-item">
        <label>确认密码：</label>
        <div class="input-wrapper">
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :class="{ 'is-error': confirmPassword!== password && submitted }"
            required
          />
          <div v-if="confirmPassword!== password && submitted" class="error-tooltip">
            两次输入的密码不一致
          </div>
        </div>
      </div>
      <div class="form-item">
        <label>角色：</label>
        <div class="input-wrapper">
          <select v-model="selectedRole">
            <option v-for="role in roles" :key="role.RoleID" :value="role.RoleID">{{ role.RoleName }}</option>
          </select>
          <div v-if="!selectedRole && submitted" class="error-tooltip">
            请选择用户角色
          </div>
        </div>
      </div>
    </div>
    <div class="button-group">
      <button @click="addUser" class="save-btn">
        <i class="fa fa-save"></i> 保存
      </button>
      <button @click="resetForm" class="reset-btn">
        <i class="fa fa-refresh"></i> 重置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const userId = ref('');
const userName = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref('');
const roles = ref([]);
const submitted = ref(false);
const originalForm = ref(null);

// 返回用户管理页面
const goBack = () => {
  router.push('/user');
};

// 在组件挂载时获取下一个可用的 ID
const getNextUserId = async () => {
  try {
    const response = await axios.get('/user/getNextId');
    userId.value = response.data.nextId;
  } catch (error) {
    message.error('获取用户 ID 失败');
  }
};

// 在组件挂载时获取所有角色
const fetchAllRoles = async () => {
  try {
    const response = await axios.get('/role/all');
    roles.value = response.data;
  } catch (error) {
    message.error('获取角色列表失败');
    console.error(error);
  }
};

onMounted(async () => {
  try {
    await getNextUserId();
    await fetchAllRoles();
    // 保存原始表单状态
    originalForm.value = {
      userName: '',
      password: '',
      confirmPassword: '',
      selectedRole: ''
    };
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});

const addUser = async () => {
  submitted.value = true;
  // 表单验证
  if (!userName.value.trim()) {
    return message.error('用户名不能为空');
  }
  if (!password.value.trim()) {
    return message.error('密码不能为空');
  }
  if (password.value.length < 6) {
    return message.error('密码长度至少6位');
  }
  if (password.value!== confirmPassword.value) {
    return message.error('两次输入的密码不一致');
  }
  if (!selectedRole.value) {
    return message.error('请选择用户角色');
  }

  try {
    // 提交请求
    await axios.post('/user/add', {
      userId: userId.value,
      userName: userName.value,
      password: password.value,
      roleId: selectedRole.value
    });

    // 添加成功
    message.success('添加成功！');
    router.push('/user'); // 返回用户列表
  } catch (error) {
    // 处理错误
    if (error.response) {
      message.error(error.response.data.error || '添加失败！');
    } else {
      // 系统异常，跳转到错误页面
      router.push({
        name: 'ErrorPage',
        query: { message: '系统异常，请稍后重试' }
      });
    }
  }
};

// 重置表单
const resetForm = () => {
  if (!originalForm.value) return;
  
  userName.value = originalForm.value.userName;
  password.value = originalForm.value.password;
  confirmPassword.value = originalForm.value.confirmPassword;
  selectedRole.value = originalForm.value.selectedRole;
  submitted.value = false;
    
    // 重新获取用户ID
    getNextUserId();
};
</script>

<style scoped>
.add-user-container {
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
  width: 120px;
  font-weight: 500;
  color: #666;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.input-wrapper input,
.input-wrapper select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  transition: border-color 0.3s;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
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

.save-btn, .reset-btn {
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

.save-btn i, .reset-btn i {
  margin-right: 8px;
}
</style>