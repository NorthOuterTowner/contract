<template>
  <div class="edit-role">
    <div v-if="messageRef" class="message-box">
        <span :class="{ 'success-msg': isSuccess, 'error-msg': !isSuccess }">{{
        messageRef
        }}</span>
    </div>
    <h2>编辑角色</h2>
    <div class="form-section">
      <div class="input-group">
        <label class="form-label">角色 ID：</label>
        <div class="input-wrapper">
          <input v-model="roleId" type="text" readonly />
        </div>
      </div>
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
          <div v-if="!roleName && submitted" class="error-tooltip">
            角色名称不能为空
          </div>
          <div v-if="roleNameExists && submitted" class="error-tooltip">
            角色名称已存在
          </div>
        </div>
      </div>
      <div class="input-group">
        <label class="form-label">角色描述：</label>
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
    <!-- 操作按钮区域 -->
    <div class="button-group">
      <button @click="handleSubmit" class="primary-btn">提交</button>
      <button @click="resetForm" class="secondary-btn">重置</button>
    </div>
    <!-- 消息提示 -->
    <div v-if="message" class="message-box">
      <span :class="{ 'success-msg': isSuccess, 'error-msg': !isSuccess }">{{
        message
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const message = inject('message');

const roleId = ref('');
const roleName = ref('');
const roleDescription = ref('');
const submitted = ref(false);
const messageRef = ref('');
const isSuccess = ref(false);
const roleNameExists = ref(false);

onMounted(async () => {
  const id = route.params.roleId;
  roleId.value = id;
  try {
    const response = await axios.get(`/role/query?roleId=${id}`);
    if (response.data.length > 0) {
      const role = response.data[0];
      roleName.value = role.RoleName;
      roleDescription.value = role.RoleDescription || '';
    } else {
      message.error('未找到该角色');
      router.push('/system/role');
    }
  } catch (error) {
    message.error('获取角色信息失败');
    console.error(error);
    router.push('/system/role');
  }
});

const checkRoleNameExists = async () => {
  try {
    const response = await axios.get(`/role/checkName?roleName=${roleName.value}&roleId=${roleId.value}`);
    roleNameExists.value = response.data.exists;
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async () => {
  submitted.value = true;
  if (!roleName.value) {
    messageRef.value = '角色名称不能为空';
    isSuccess.value = false;
    return;
  }
  await checkRoleNameExists();
  if (roleNameExists.value) {
    messageRef.value = '角色名称已存在';
    isSuccess.value = false;
    return;
  }
  try {
    await axios.put('/role/update', {
      roleId: roleId.value,
      roleName: roleName.value,
      roleDescription: roleDescription.value
    });
    messageRef.value = '修改成功！';
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/system/role');
    }, 1500);
  } catch (error) {
    messageRef.value = error.response.data.error || '修改失败！';
    isSuccess.value = false;
  }
};

const resetForm = () => {
  roleName.value = '';
  roleDescription.value = '';
  submitted.value = false;
  messageRef.value = '';
  isSuccess.value = false;
  roleNameExists.value = false;
};
</script>

<style scoped>
.edit-role {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.is-error {
  border-color: red !important;
}

.error-tooltip {
  color: red;
  font-size: 12px;
  position: absolute;
  bottom: -15px;
  left: 0;
}

.button-group {
  display: flex;
  gap: 10px;
}

.primary-btn {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #ccc;
  color: #333;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.secondary-btn:hover {
  background-color: #bbb;
}

.message-box {
  margin-top: 15px;
}

.success-msg {
  color: green;
}

.error-msg {
  color: red;
}
</style>