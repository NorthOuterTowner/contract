<template>
  <div class="modify-role-container">
    <h2>角色详细信息</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="role">
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
      <div class="button-group">
        <button @click="editRole" v-if="!isEditing" class="action-btn">编辑</button>
        <button @click="saveRole" v-if="isEditing" class="action-btn">保存</button>
        <button @click="deleteRole" class="action-btn">删除</button>
      </div>
    </div>
    <div v-else class="error-message">未找到该角色的详细信息</div>
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

onMounted(async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/role/query?roleID=${roleId}`);
    if (response.data.length === 0) {
      message.error('角色不存在');
      router.push('/system/role');
    } else {
      role.value = response.data[0];
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
      roleDescription: role.value.RoleDescription
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

const deleteRole = async () => {
  const confirm = await inject('dialog').confirm({
    title: '确认删除',
    content: '确定要删除此角色吗？',
    positiveText: '确认',
    negativeText: '取消'
  });

  if (!confirm) return;

  try {
    await axios.delete(`/role/delete?roleID=${roleId}`);
    message.success('删除成功！');
    router.push('/system/role');
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  }
};
</script>

<style scoped>
.modify-role-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.form-item {
  margin-bottom: 16px;
}

label {
  display: inline-block;
  width: 80px;
}

input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: calc(100% - 100px);
}

.button-group {
  text-align: center;
  margin-top: 20px;
}

.action-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
}

.action-btn:hover {
  background-color: #0056b3;
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
</style>