<template>
  <SystemManagementSidebar />
  <div class="permission-management">
    <h2>权限配置</h2>
    <hr />
    <h3>用户权限列表</h3>
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="输入用户名或角色名查询" />
      <button @click="searchUsers">查询</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-if="currentPageUsers.length > 0" class="user-table">
      <thead>
        <tr>
          <th>用户名</th>
          <th>角色名</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in currentPageUsers" :key="user.user_id">
          <td>{{ user.user_name }}</td> 
          <td>{{ user.role_name }}</td> 
          <td>
            <button @click="goToAssignPermissions(user.user_id)" class="action-btn">授权</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && currentPageUsers.length === 0" class="no-data">未找到匹配的用户信息</div>
    <!-- 分页组件 -->
    <div v-if="users.length > 0" class="pagination">
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
import SystemManagementSidebar from '../components/SystemManagementSidebar.vue';

const router = useRouter();
const message = inject('message');

const users = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref('');

// 计算总页数
const totalPages = computed(() => Math.ceil(users.value.length / itemsPerPage.value));

// 计算当前页的用户数据
const currentPageUsers = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return users.value.slice(startIndex, endIndex);
});

const fetchUsers = async () => {
    loading.value = true;
    try {
        // 修改为调用 /user/all 接口
        const response = await axios.get('/user/all'); 
        console.log('Response data:', response.data); // 打印响应数据，用于调试
        if (response.status === 200) {
            if (Array.isArray(response.data)) {
                users.value = response.data;
            } else {
                message.error('后端返回的数据格式不正确，应为数组。');
                console.error('Invalid data format:', response.data);
            }
        } else {
            message.error(`获取用户信息失败，状态码：${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            // 请求已发送，但服务器响应的状态码不在 2xx 范围内
            message.error(`获取用户信息失败，状态码：${error.response.status}`);
            console.error('Error response data:', error.response.data);
        } else if (error.request) {
            // 请求已发送，但没有收到响应
            message.error('获取用户信息失败，没有收到服务器响应');
        } else {
            // 在设置请求时发生错误
            message.error(`获取用户信息失败，请求设置错误：${error.message}`);
        }
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};

const goToAssignPermissions = (userId) => {
    router.push(`/permission/assign/${userId}`);
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

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    return message.warning('请输入查询内容');
  }
  
  loading.value = true;
  try {
    const response = await axios.get(`/user/queryByUsernameOrRole?query=${searchQuery.value}`);
    users.value = response.data;
    
    if (response.data.length === 0) {
      message.info('未找到匹配的用户');
    } else {
      message.success('查询成功！');
    }
  } catch (error) {
    message.error('查询失败！');
    console.error(error);
  } finally {
    loading.value = false;
    currentPage.value = 1; // 查询后重置到第一页
  }
};

fetchUsers();
</script>

<style scoped>
.permission-management {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Helvetica Neue", Arial, sans-serif;
}

h2 {
    font-size: 24px;
    margin-bottom: 20px;
}

h3 {
    font-size: 20px;
    margin-bottom: 10px;
}

.search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.search-bar input {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1;
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
    text-align: center;
}

.user-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.user-table th,
.user-table td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
}

.user-table th {
    background-color: #f2f2f2;
    font-weight: 500;
}

.user-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.user-table tr:hover {
    background-color: #f1f1f1;
}

.action-btn {
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
    font-size: 14px;
    transition: background-color 0.3s;
}

.action-btn {
    background-color: #007bff;
}

.action-btn:hover {
    opacity: 0.9;
}

.no-data {
    text-align: center;
    padding: 20px;
    color: #666;
}

.pagination {
    margin-top: 20px;
    text-align: center;
    color: #333;
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