<template>
  <div class="role-management">
    <h2>角色管理</h2>
    <button @click="goToAddRole" class="add-role-btn">添加角色</button>
    <div class="search-bar">
      <input v-model="query" placeholder="输入角色ID或角色名查询" />
      <button @click="searchRoles">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-if="currentPageRoles.length > 0" class="role-table">
      <thead>
        <tr>
          <th>角色ID</th>
          <th>角色名</th>
          <th>角色描述</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in currentPageRoles" :key="role.RoleID">
          <td>{{ role.RoleID }}</td>
          <td>{{ role.RoleName }}</td>
          <td>{{ role.RoleDescription || '无' }}</td>
          <td>
            <!-- 修改查看按钮的点击事件 -->
            <button @click="viewRole(role.RoleID)" class="action-btn">查看</button>
            <button @click="deleteRole(role.RoleID)" class="action-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && query" class="no-data">未找到匹配的角色</div>
    <!-- 分页组件 -->
    <div v-if="roles.length > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const message = inject('message');

const query = ref('');
const roles = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalPages = ref(Math.ceil(roles.value.length / itemsPerPage.value));

// 计算当前页的角色数据
const currentPageRoles = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return roles.value.slice(startIndex, endIndex);
});

const goToAddRole = () => {
  router.push('/role/add');
};

const searchRoles = async () => {
  if (!query.value.trim()) {
    return message.warning('请输入查询内容');
  }
  
  loading.value = true;
  try {
    const response = await axios.get(`/role/query?query=${query.value}`);
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
  totalPages.value = Math.ceil(roles.value.length / itemsPerPage.value);
  currentPage.value = 1; // 查询后重置到第一页
};

const viewRole = (roleId) => {
  // 跳转到编辑角色页面，并传递角色 ID
  router.push(`/role/modify/${roleId}`);
};

const deleteRole = async (roleId) => {
  const confirm = await inject('dialog').confirm({
    title: '确认删除',
    content: '确定要删除此角色吗？',
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

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 在组件挂载时获取所有角色
const getAllRoles = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/role/all');
    roles.value = response.data;
    message.success('获取角色列表成功！');
  } catch (error) {
    message.error('获取角色列表失败！');
    console.error(error);
  } finally {
    loading.value = false;
  }
  totalPages.value = Math.ceil(roles.value.length / itemsPerPage.value);
};

getAllRoles();
</script>

<style scoped>
.role-management {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.add-role-btn {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-role-btn:hover {
  background-color: #0056b3;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.search-bar button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #45a049;
}

.loading {
  margin: 16px 0;
  color: #999;
}

.role-table {
  width: 100%;
  border-collapse: collapse;
}

.role-table th,
.role-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.role-table th {
  background-color: #f2f2f2;
}

.role-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.role-table tr:hover {
  background-color: #f1f1f1;
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

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>