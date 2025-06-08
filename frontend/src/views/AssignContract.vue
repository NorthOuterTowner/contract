<template>
  <div class="contract-allocate-management">
    <!-- 返回按钮 -->
    <div class="back-link">
      <router-link to="/PendingContractList" class="back-button">← 返回待分配合同列表</router-link>
    </div>
    <!-- 合同信息标题和分割线 -->
    <h2>合同信息</h2>
    <hr />
    <!-- 合同详细信息 -->
    <div class="contract-info">
      <div class="info-item">
        <label>合同ID:</label>
        <input type="text" v-model="contractId" readonly>
      </div>
      <div class="info-item">
        <label>合同名称:</label>
        <input type="text" v-model="contractTitle" readonly>
      </div>
      <div class="info-item">
        <label>合同状态:</label>
        <input type="text" v-model="contractStatus" readonly>
      </div>
      <div class="info-item">
        <label>起草时间:</label>
        <input type="text" v-model="formattedCreationDate" readonly>
      </div>
    </div>
    <!-- 分配合同相关人员标题 -->
    <h2>分配合同相关人员</h2>
    <hr />

    <!-- 分配会签人部分 -->
    <h3>分配会签人</h3>
    <div class="search-bar">
      <!-- 这里如果需要搜索功能可以添加输入框和按钮 -->
    </div>
    <div class="list-container">
      <div class="list">
        <p class="list-label">待分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in availableCoSigners"
            :key="person.id"
            @click="selectPerson(person, 'left', 'coSigners')"
            :class="{ 'selected-person': isPersonSelected(person, 'left', 'coSigners') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
      <div class="buttons">
        <button class="move-button" @click="moveToRight('coSigners')">>> </button>
        <button class="move-button" @click="moveToLeft('coSigners')"><< </button>
      </div>
      <div class="list">
        <p class="list-label">已分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in assignedCoSigners"
            :key="person.id"
            @click="selectPerson(person, 'right', 'coSigners')"
            :class="{ 'selected-person': isPersonSelected(person, 'right', 'coSigners') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
    </div>
    <p v-if="assignedCoSigners.length < 2" class="error-message">会签人数必须大于 2</p>

    <!-- 分配审批人部分 -->
    <h3>分配审批人</h3>
    <div class="list-container">
      <div class="list">
        <p class="list-label">待分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in availableApprovers"
            :key="person.id"
            @click="selectPerson(person, 'left', 'approvers')"
            :class="{ 'selected-person': isPersonSelected(person, 'left', 'approvers') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
      <div class="buttons">
        <button class="move-button" @click="moveToRight('approvers')">>> </button>
        <button class="move-button" @click="moveToLeft('approvers')"><< </button>
      </div>
      <div class="list">
        <p class="list-label">已分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in assignedApprovers"
            :key="person.id"
            @click="selectPerson(person, 'right', 'approvers')"
            :class="{ 'selected-person': isPersonSelected(person, 'right', 'approvers') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
    </div>
    <p v-if="assignedApprovers.length > 1" class="error-message">审批人只能为 1 人</p>

    <!-- 分配签订人部分 -->
    <h3>分配签订人</h3>
    <div class="list-container">
      <div class="list">
        <p class="list-label">待分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in availableSigners"
            :key="person.id"
            @click="selectPerson(person, 'left', 'signers')"
            :class="{ 'selected-person': isPersonSelected(person, 'left', 'signers') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
      <div class="buttons">
        <button class="move-button" @click="moveToRight('signers')">>> </button>
        <button class="move-button" @click="moveToLeft('signers')"><< </button>
      </div>
      <div class="list">
        <p class="list-label">已分配人员列表：</p>
        <ul class="person-list">
          <li
            v-for="person in assignedSigners"
            :key="person.id"
            @click="selectPerson(person, 'right', 'signers')"
            :class="{ 'selected-person': isPersonSelected(person, 'right', 'signers') }"
          >
            {{ person.name }}
          </li>
        </ul>
      </div>
    </div>
    <p v-if="assignedSigners.length > 1" class="error-message">签订人只能为 1 人</p>

    <div class="form-actions">
      <button class="submit-button" @click="submitAllocation" :disabled="!isAllocationValid">提交分配</button>
      <button class="reset-button" @click="resetAllocation">重置分配</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../common/auth'; // 引入认证状态管理

const router = useRouter();
const authStore = useAuthStore(); // 使用认证状态管理

// 合同信息
const contractId = ref('');
const contractTitle = ref('');
const contractStatus = ref('');
const contractCreationDate = ref('');
const formattedCreationDate = computed(() => {
  if (contractCreationDate.value) {
    const date = new Date(contractCreationDate.value);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }
  return '';
});

// 会签人相关数据
const availableCoSigners = ref([]);
const assignedCoSigners = ref([]);
// 审批人相关数据
const availableApprovers = ref([]);
const assignedApprovers = ref([]);
// 签订人相关数据
const availableSigners = ref([]);
const assignedSigners = ref([]);

const selectedPerson = ref(null);
const selectedList = ref(null);
const selectedType = ref(null);

// 计算分配是否有效
const isAllocationValid = computed(() => {
  return assignedCoSigners.value.length > 2 && assignedApprovers.value.length === 1 && assignedSigners.value.length === 1;
});

const fetchUsers = async () => {
  try {
    const response = await axios.get("/user/role2-users");
    const users = response.data;
    availableCoSigners.value = [...users];
    availableApprovers.value = [...users];
    availableSigners.value = [...users];
  } catch (error) {
    console.error("获取用户列表失败:", error);
  }
};

const fetchContractInfo = async () => {
  const contractIdParam = router.currentRoute.value.params.contractId;
  try {
    const response = await axios.get(`/assign/contract/${contractIdParam}`);
    const contract = response.data;
    contractId.value = contract.ContractID;
    contractTitle.value = contract.Title;
    contractStatus.value = contract.Status;
    contractCreationDate.value = contract.CreationDate;
  } catch (error) {
    console.error("获取合同信息失败:", error);
  }
};

const selectPerson = (person, list, type) => {
  selectedPerson.value = person;
  selectedList.value = list;
  selectedType.value = type;
};

const isPersonSelected = (person, list, type) => {
  return (
    selectedPerson.value === person &&
    selectedList.value === list &&
    selectedType.value === type
  );
};

const moveToRight = (type) => {
  let available, assigned;
  if (type === 'coSigners') {
    available = availableCoSigners.value;
    assigned = assignedCoSigners.value;
  } else if (type === 'approvers') {
    available = availableApprovers.value;
    assigned = assignedApprovers.value;
    // 如果审批人已经有一个，将其移回左侧
    if (assigned.length === 1) {
      const prevApprover = assigned.pop();
      available.push(prevApprover);
    }
  } else if (type === 'signers') {
    available = availableSigners.value;
    assigned = assignedSigners.value;
    // 如果签订人已经有一个，将其移回左侧
    if (assigned.length === 1) {
      const prevSigner = assigned.pop();
      available.push(prevSigner);
    }
  }

  if (selectedList.value === 'left' && selectedPerson.value) {
    const index = available.indexOf(selectedPerson.value);
    if (index > -1) {
      available.splice(index, 1);
      assigned.push(selectedPerson.value);
    }
    selectedPerson.value = null;
    selectedList.value = null;
    selectedType.value = null;
  }
};

const moveToLeft = (type) => {
  let available, assigned;
  if (type === 'coSigners') {
    available = availableCoSigners.value;
    assigned = assignedCoSigners.value;
  } else if (type === 'approvers') {
    available = availableApprovers.value;
    assigned = assignedApprovers.value;
  } else if (type === 'signers') {
    available = availableSigners.value;
    assigned = assignedSigners.value;
  }

  if (selectedList.value === 'right' && selectedPerson.value) {
    const index = assigned.indexOf(selectedPerson.value);
    if (index > -1) {
      assigned.splice(index, 1);
      available.push(selectedPerson.value);
    }
    selectedPerson.value = null;
    selectedList.value = null;
    selectedType.value = null;
  }
};

const submitAllocation = async () => {
  // if (!isAllocationValid.value) {
  //   return;
  // }
  try {
    const operatorUserId = authStore.user?.id;; // 获取操作员 ID
    if (!operatorUserId) {
      console.error('未获取到操作员 ID');
      alert('未获取到操作员 ID，请重新登录');
      return;
    }
    const response = await axios.post("/assign/contract-assignment", {
      contractId: router.currentRoute.value.params.contractId,
      signerId: assignedSigners.value[0].id,
      approverId: assignedApprovers.value[0].id,
      executorId: assignedCoSigners.value.map(person => person.id).join(','),
      operatorUserId // 添加操作员 ID 到请求体
    });
    alert(response.data.message);
    router.push('/PendingContractList');
  } catch (error) {
    console.error("提交分配失败:", error);
    alert("提交分配失败，请稍后重试");
  }
};

const resetAllocation = () => {
  const initialUsers = [...availableCoSigners.value, ...assignedCoSigners.value];
  availableCoSigners.value = initialUsers;
  assignedCoSigners.value = [];
  availableApprovers.value = initialUsers;
  assignedApprovers.value = [];
  availableSigners.value = initialUsers;
  assignedSigners.value = [];
  selectedPerson.value = null;
  selectedList.value = null;
  selectedType.value = null;
};

onMounted(() => {
  fetchUsers();
  fetchContractInfo();
});
</script>

<style scoped>
.contract-allocate-management {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Helvetica Neue", Arial, sans-serif;
}

.back-link {
    margin-bottom: 20px;
}

.back-button {
    background-color: #6c757d; /* 灰色背景 */
    color: white; /* 白色文字 */
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    display: inline-block;
}

.back-button:hover {
    background-color: #5a6268;
    text-decoration: none;
}

.contract-info {
    margin-bottom: 20px;
}

.info-item {
    margin-bottom: 10px;
}

.info-item label {
    display: inline-block;
    width: 100px;
}

.info-item input {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 200px;
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

.list-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.list {
    width: 300px;
    height: 200px;
    border: 1px solid #ddd;
    padding: 15px;
    margin: 10px;
    border-radius: 6px;
    background-color: #fff;
    overflow-y: auto;
}

.list-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #666;
}

.person-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.person-list li {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.person-list li:hover {
    background-color: #f1f1f1;
}

.person-list li.selected-person {
    background-color: #d4edda; /* 选中状态的背景颜色 */
    color: #155724; /* 选中状态的文字颜色 */
}

.buttons {
    display: flex;
    flex-direction: column;
    margin: 0 15px;
}

.move-button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin: 5px 0;
    transition: background-color 0.2s ease;
}

.move-button:hover {
    background-color: #0056b3;
}

.form-actions {
    margin-top: 20px;
    text-align: center;
}

.submit-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 16px;
    margin-right: 10px;
}

.submit-button:hover {
    background-color: #218838;
}

.reset-button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 16px;
}

.reset-button:hover {
    background-color: #c82333;
}

.error-message {
    color: red;
    margin-top: 10px;
}
</style>