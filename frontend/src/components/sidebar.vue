<template>
  <div class="sidebar">
    <div class="logo">合同管理系统</div>
    <ul class="menu">
      <li 
        v-for="item in menuItems" 
        :key="item.path"
        :class="{ active: $route.path === item.path }"
        @click="navigateTo(item.path)"
      >
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [

        { title: '起草合同', path: '/DraftContractList' },
        { title: '合同会签', path: '/CoSignContractList' },
        { title: '合同定稿', path: '/FinalizeContractList' },
        { title: '待审批合同', path: '/approveList' },
        { title: '合同统计', path: '/statistics' },
        { title: '分配合同', path: '/PendingContractList' },
        { title: '签订合同', path: '/SignContractList'},
        { title: '返回主页', path: '/HomePage'}
      ]
    }
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu li.active {
  background-color: rgb(85, 117, 244);
  color: white;
}
</style>