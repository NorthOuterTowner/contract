<template>
  <div class="flex">
    <Sidebar />
    <div class="contract-allocate">
      <div class="back-link">
        <router-link to="/PendingContractList">← 返回待分配合同列表</router-link>
      </div>

      <!-- 分配会签人部分 -->
      <div class="allocate-section">
        <h2 class="section-title">分配会签人</h2>
        <div class="list-container">
          <div class="list">
            <p class="list-label">待分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in availableCoSigners" :key="person.id" @click="selectPerson(person, 'left', 'coSigners')">{{ person.name }}</li>
            </ul>
          </div>
          <div class="buttons">
            <button class="move-button" @click="moveToRight('coSigners')">>> </button>
            <button class="move-button" @click="moveToLeft('coSigners')"><< </button>
          </div>
          <div class="list">
            <p class="list-label">已分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in assignedCoSigners" :key="person.id" @click="selectPerson(person, 'right', 'coSigners')">{{ person.name }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 分配审批人部分 -->
      <div class="allocate-section">
        <h2 class="section-title">分配审批人</h2>
        <div class="list-container">
          <div class="list">
            <p class="list-label">待分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in availableApprovers" :key="person.id" @click="selectPerson(person, 'left', 'approvers')">{{ person.name }}</li>
            </ul>
          </div>
          <div class="buttons">
            <button class="move-button" @click="moveToRight('approvers')">>> </button>
            <button class="move-button" @click="moveToLeft('approvers')"><< </button>
          </div>
          <div class="list">
            <p class="list-label">已分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in assignedApprovers" :key="person.id" @click="selectPerson(person, 'right', 'approvers')">{{ person.name }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 分配签订人部分 -->
      <div class="allocate-section">
        <h2 class="section-title">分配签订人</h2>
        <div class="list-container">
          <div class="list">
            <p class="list-label">待分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in availableSigners" :key="person.id" @click="selectPerson(person, 'left', 'signers')">{{ person.name }}</li>
            </ul>
          </div>
          <div class="buttons">
            <button class="move-button" @click="moveToRight('signers')">>> </button>
            <button class="move-button" @click="moveToLeft('signers')"><< </button>
          </div>
          <div class="list">
            <p class="list-label">已分配人员列表：</p>
            <ul class="person-list">
              <li v-for="person in assignedSigners" :key="person.id" @click="selectPerson(person, 'right', 'signers')">{{ person.name }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="submit-button" @click="submitAllocation">提交分配</button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/sidebar.vue';

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      // 会签人相关数据
      availableCoSigners: [
        { id: 1, name: '会签人1' },
        { id: 2, name: '会签人2' },
        { id: 3, name: '会签人3' },
        { id: 4, name: '会签人4' },
        { id: 5, name: '会签人5' }
      ],
      assignedCoSigners: [],
      // 审批人相关数据
      availableApprovers: [
        { id: 6, name: '审批人1' },
        { id: 7, name: '审批人2' },
        { id: 8, name: '审批人3' },
        { id: 9, name: '审批人4' },
        { id: 10, name: '审批人5' }
      ],
      assignedApprovers: [],
      // 签订人相关数据
      availableSigners: [
        { id: 11, name: '签订人1' },
        { id: 12, name: '签订人2' },
        { id: 13, name: '签订人3' },
        { id: 14, name: '签订人4' },
        { id: 15, name: '签订人5' }
      ],
      assignedSigners: [],
      selectedPerson: null,
      selectedList: null,
      selectedType: null
    };
  },
  methods: {
    selectPerson(person, list, type) {
      this.selectedPerson = person;
      this.selectedList = list;
      this.selectedType = type;
    },
    moveToRight(type) {
      let availableList, assignedList;
      if (type === 'coSigners') {
        availableList = this.availableCoSigners;
        assignedList = this.assignedCoSigners;
      } else if (type === 'approvers') {
        availableList = this.availableApprovers;
        assignedList = this.assignedApprovers;
      } else if (type === 'signers') {
        availableList = this.availableSigners;
        assignedList = this.assignedSigners;
      }

      if (this.selectedList === 'left' && this.selectedPerson) {
        const index = availableList.indexOf(this.selectedPerson);
        if (index > -1) {
          availableList.splice(index, 1);
          assignedList.push(this.selectedPerson);
        }
        this.selectedPerson = null;
        this.selectedList = null;
        this.selectedType = null;
      }
    },
    moveToLeft(type) {
      let availableList, assignedList;
      if (type === 'coSigners') {
        availableList = this.availableCoSigners;
        assignedList = this.assignedCoSigners;
      } else if (type === 'approvers') {
        availableList = this.availableApprovers;
        assignedList = this.assignedApprovers;
      } else if (type === 'signers') {
        availableList = this.availableSigners;
        assignedList = this.assignedSigners;
      }

      if (this.selectedList === 'right' && this.selectedPerson) {
        const index = assignedList.indexOf(this.selectedPerson);
        if (index > -1) {
          assignedList.splice(index, 1);
          availableList.push(this.selectedPerson);
        }
        this.selectedPerson = null;
        this.selectedList = null;
        this.selectedType = null;
      }
    },
    submitAllocation() {
      // 这里应该是API调用，提交分配结果
      console.log('提交分配:', {
        contractId: this.$route.params.contractId,
        assignedCoSigners: this.assignedCoSigners.map(person => person.id),
        assignedApprovers: this.assignedApprovers.map(person => person.id),
        assignedSigners: this.assignedSigners.map(person => person.id)
      });
      alert('分配提交成功');
      this.$router.push('/admin');
    }
  }
};
</script>

<style scoped>
.flex {
  display: flex;
}

.contract-allocate {
  margin-top: 20px;
  margin-left: 200px; /* 给 sidebar 腾出空间 */
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.back-link {
  margin-bottom: 20px;
}

.back-link a {
  color: #007BFF;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}

.allocate-section {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.list-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.list {
  width: 300px; /* 增加宽度 */
  height: 200px; /* 降低高度 */
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px;
  border-radius: 6px;
  background-color: #fff;
  overflow-y: auto; /* 增加垂直滚动条 */
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
}

.submit-button:hover {
  background-color: #218838;
}
</style>