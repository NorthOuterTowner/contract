<template>
  <div>
    <h2>添加用户</h2>
    <div class="form-item">
      <label>用户 ID：</label>
      <input v-model="userId" readonly /> <!-- 显示 ID 并设置为只读 -->
    </div>
    <div class="form-item">
      <label>用户名：</label>
      <input v-model="userName" placeholder="请输入用户名" />
    </div>
    <div class="form-item">
      <label>密码：</label>
      <input v-model="password" type="password" placeholder="请输入密码" />
    </div>
    <div class="form-item">
      <label>确认密码：</label>
      <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
    </div>
    <button @click="addUser">保存</button>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const userId = ref('');
const userName = ref('');
const password = ref('');
const confirmPassword = ref('');

// 在组件挂载时获取下一个可用的 ID
const getNextUserId = async () => {
  try {
    const response = await axios.get('/user/getNextId');
    userId.value = response.data.nextId;
  } catch (error) {
    message.error('获取用户 ID 失败');
  }
};

getNextUserId();

const addUser = async () => {
  // 表单验证
  if (!userName.value.trim()) {
    return message.error('用户名不能为空');
  }
  if (!password.value.trim()) {
    return message.error('密码不能为空');
  }
  if (password.value !== confirmPassword.value) {
    return message.error('两次输入的密码不一致');
  }

  try {
    // 提交请求
    await axios.post('/user/add', {
      userId: userId.value,
      userName: userName.value,
      password: password.value
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
.form-item {
  margin-bottom: 16px;
}

label {
  display: inline-block;
  width: 80px;
}
</style>