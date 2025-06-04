<template>
  <div class="sidebar">
    <div class="logo">合同管理系统</div>
    <ul class="menu">
      <!-- 合同处理相关菜单 -->
      <li 
        v-for="item in processMenuItems" 
        :key="item.path"
        :class="{ active: $route.path === item.path }"
        @click="navigateTo(item.path)"
      >
        {{ item.title }}
      </li>
      <!-- 合同查询菜单及子菜单 -->
      <li class="has-submenu" @click="toggleQueryMenu">
        <span>合同查询</span>
        <i :class="isQueryMenuOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        <ul class="submenu" v-show="isQueryMenuOpen">
          <li 
            v-for="subItem in querySubMenuItems" 
            :key="subItem.path"
            :class="{ active: $route.path === subItem.path }"
            @click="navigateTo(subItem.path)"
          >
            {{ subItem.title }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 合同处理菜单数据
      processMenuItems: [
        { title: '起草合同', path: '/DraftContractList' },
        { title: '合同会签', path: '/CoSignContractList' },
        { title: '合同定稿', path: '/FinalizeContractList' },
        { title: '待审批合同', path: '/approveList' },
        { title: '已完成合同', path: '/completed' },
        { title: '合同统计', path: '/statistics' },
        { title: '分配合同', path: '/PendingContractList' }
      ],
      // 合同查询子菜单数据
      querySubMenuItems: [
        { title: '合同列表', path: '/query' },
        { title: '按名称查询', path: '/query/name' },
        { title: '按状态查询', path: '/query/status' },
        { title: '高级查询', path: '/query/advanced' }
      ],
      // 控制合同查询子菜单展开收起的标识
      isQueryMenuOpen: false 
    };
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path!== path) {
        this.$router.push(path);
      }
    },
    // 切换合同查询子菜单展开收起状态
    toggleQueryMenu() {
      this.isQueryMenuOpen =!this.isQueryMenuOpen;
    }
  }
};
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu li.active {
  background-color: rgb(85, 117, 244);
  color: white;
}

/* 子菜单样式 */
.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #34495e;
}

.submenu li {
  padding: 12px 30px; 
}

/* 箭头图标样式（可根据实际使用的图标库调整） */
.menu li i {
  font-size: 14px;
}
</style>