<template>
  <div>
    <h2>角色管理</h2>
    <button @click="goToAddRole">添加角色</button>
    
    <div class="search-bar">
      <input v-model="roleName" placeholder="输入角色名称查询" />
      <button @click="searchRoles">查询</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <table v-if="roles.length > 0">
      <thead>
        <tr>
          <th>角色ID</th>
          <th>角色名称</th>
          <th>角色描述</th>
          <th>权限数量</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in roles" :key="role.RoleID">
          <td>{{ role.RoleID }}</td>
          <td>{{ role.RoleName }}</td>
          <td>{{ role.RoleDescription || '-' }}</td>
          <td>{{ role.permissions?.length || 0 }}</td>
          <td>
            <button @click="goToUpdateRole(role.RoleID)">修改</button>
            <button @click="deleteRole(role.RoleID)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading && roleName">
      未找到匹配的角色
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');
const dialog = inject('dialog');

const roleName = ref('');
const roles = ref([]);
const loading = ref(false);

const goToAddRole = () => {
  router.push('/system/role/add');
};

const searchRoles = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/role/query?roleName=${roleName.value}`);
    roles.value = response.data;
    
    if (response.data.length === 0) {
      message.info('未找到匹配的角色');
    } else {
      message.success('查询成功！');
    }
  } catch (error) {
    message.error('查询失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const goToUpdateRole = (roleId) => {
  router.push(`/role/update/${roleId}`);
};

const deleteRole = async (roleId) => {
  const confirm = await dialog.confirm({
    title: '确认删除',
    content: '确定要删除此角色吗？该操作将一并删除与该角色与所有权限的关联！',
    positiveText: '确认',
    negativeText: '取消'
  });
  
  if (!confirm) return;
  
  try {
    await axios.delete(`/role/delete?roleId=${roleId}`);
    message.success('删除成功！');
    searchRoles(); // 刷新列表
  } catch (error) {
    message.error('删除失败！');
    console.error(error);
  }
};
</script>