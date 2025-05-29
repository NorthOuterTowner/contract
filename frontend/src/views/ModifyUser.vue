<template>
  <div>
    <h2>修改用户信息</h2>
    <div class="form-item">
      <label>用户名：</label>
      <input v-model="userName" placeholder="请输入用户名" />
    </div>
    <div class="form-item">
      <label>新密码：</label>
      <input v-model="password" type="password" placeholder="留空则不修改密码" />
    </div>
    <button @click="updateUser">保存</button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const message = inject('message');

const userId = route.params.userId;
const userName = ref('');
const password = ref('');
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/user/query?query=${userId}`);
    if (response.data.length === 0) {
      message.error('用户不存在');
      router.push('/user');
    } else {
      userName.value = response.data[0].user_name;
    }
  } catch (error) {
    message.error('获取用户信息失败');
    router.push('/user');
  } finally {
    loading.value = false;
  }
});

const updateUser = async () => {
  if (!userName.value.trim()) {
    return message.error('用户名不能为空');
  }
  
  try {
    await axios.put('/user/update', {
      userId,
      userName: userName.value,
      password: password.value || undefined // 留空则不修改密码
    });
    
    message.success('修改成功！');
    router.push('/user');
  } catch (error) {
    message.error(error.response.data.error || '修改失败！');
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