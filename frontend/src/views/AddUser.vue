<template>
  <div class="add-user-container">
    <h2 class="page-title">添加用户</h2>
    <!-- 表单区域 -->
    <div class="form-section">
      <div class="input-group">
        <label class="form-label">用户 ID：</label>
        <div class="input-wrapper">
          <input v-model="userId" type="text" readonly />
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">用户名：</label>
        <div class="input-wrapper">
          <input
            v-model="userName"
            type="text"
            placeholder="请输入用户名"
            :class="{ 'is-error': !userName && submitted }"
            required
          />
          <div v-if="!userName && submitted" class="error-tooltip">
            用户名不能为空
          </div>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">密码：</label>
        <div class="input-wrapper">
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :class="{ 'is-error': !password && submitted }"
            required
          />
          <div v-if="!password && submitted" class="error-tooltip">
            密码不能为空
          </div>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">确认密码：</label>
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
      <div class="input-group">
        <label class="form-label">角色：</label>
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
      <button @click="addUser" class="primary-btn">保存</button>
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

onMounted(() => {
  getNextUserId();
  fetchAllRoles();
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
</script>

<style scoped>
.add-user-container {
  max-width: 600px;
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
.input-wrapper select {
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
</style>