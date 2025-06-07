<template>
  <div class="sidebar">
    <div class="logo">合同管理系统</div>
    <ul class="menu">
      <li 
        v-for="item in processMenuItems" 
        :key="item.path"
        :class="{ active: $route.path === item.path }"
        @click="navigateTo(item.path)"
      >
        {{ item.title }}
      </li>
      
      <li 
        :class="{ active: $route.path.startsWith('/user') || $route.path.startsWith('/role') || $route.path.startsWith('/function') || $route.path.startsWith('/permission') || $route.path.startsWith('/PendingContractList') }"
        @click="toggleSystemManagementMenu"
      >
        <span>系统管理</span>
        <i :class="isSystemManagementMenuOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        <ul class="submenu" v-show="isSystemManagementMenuOpen">
          <li :class="{ active: $route.path === '/PendingContractList' }" @click.stop="navigateTo('/PendingContractList')">分配合同</li>
          <li :class="{ active: $route.path.startsWith('/user') }" @click.stop="navigateTo('/user')">用户管理</li>
          <li :class="{ active: $route.path.startsWith('/role') }" @click.stop="navigateTo('/role')">角色管理</li>
          <li :class="{ active: $route.path.startsWith('/function') }" @click.stop="navigateTo('/function')">功能管理</li>
          <li :class="{ active: $route.path.startsWith('/permission') }" @click.stop="navigateTo('/permission')">权限配置</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      processMenuItems: [
        { title: '起草合同', path: '/DraftContractList' },
        { title: '合同会签', path: '/CoSignContractList' },
        { title: '合同定稿', path: '/FinalizeContractList' },
        { title: '待审批合同', path: '/approveList' },
        { title: '签订合同', path: '/SignContractList'},
        { title: '返回主页', path: '/HomePage'} 
      ],
      // 【关键修改：移除 querySubMenuItems 数据】
      // querySubMenuItems: [
      //   { title: '合同列表', path: '/my-contract-module/query' },
      //   { title: '按名称查询', path: '/my-contract-module/query/name' },
      //   { title: '按状态查询', path: '/my-contract-module/query/status' },
      //   { title: '高级查询', path: '/my-contract-module/query/advanced' }
      // ],
      // isQueryMenuOpen: false, // 移除对 isQueryMenuOpen 的管理
      isSystemManagementMenuOpen: false 
    };
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    },
    // 【关键修改：移除 toggleQueryMenu 方法】
    // toggleQueryMenu() {
    //   this.isQueryMenuOpen = !this.isQueryMenuOpen;
    //   if (this.isQueryMenuOpen) {
    //     this.isSystemManagementMenuOpen = false;
    //   }
    // },
    toggleSystemManagementMenu() {
      this.isSystemManagementMenuOpen = !this.isSystemManagementMenuOpen;
      // 确保点击主菜单时，如果有其他子菜单是开着的，就关掉
      if (this.isSystemManagementMenuOpen) {
        // 如果这里有其他折叠菜单，也要在这里关闭它们
      }
    },
    // 自动打开对应子菜单
    checkAndOpenSubmenus() {
      // 【关键修改：移除处理合同查询模块的逻辑】
      if (this.$route.path.startsWith('/user') || this.$route.path.startsWith('/role') || 
                 this.$route.path.startsWith('/function') || this.$route.path.startsWith('/permission') ||
                 this.$route.path.startsWith('/PendingContractList')) {
        this.isSystemManagementMenuOpen = true;
      } else {
        // 如果不在任何一个已知子菜单路径下，则关闭所有子菜单
        this.isSystemManagementMenuOpen = false;
      }
    }
  },
  watch: {
    '$route.path': {
      handler: 'checkAndOpenSubmenus',
      immediate: true 
    }
  }
};
</script>

<style scoped>
/* 你的现有样式，保持不变 */
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  position: fixed; /* 继续使用 fixed 确保侧边栏位置固定 */
  left: 0;
  top: 0;
  overflow-y: auto; /* 允许侧边栏内容滚动 */
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

/* 高亮逻辑：使用 startsWith 来匹配父路由下的所有子路由 */
/* 这里的高亮需要根据当前路由是否属于该菜单项来判断，如果 $route.path 属于 processMenuItems 里的路径，则高亮 */
/* 对于你原有的 active 样式，保持不变 */
.menu li.active {
  background-color: rgb(85, 117, 244); /* 蓝色高亮 */
  color: white;
}
/* 对于子菜单项的活跃状态，也应该这样判断 */
.submenu li.active {
    background-color: rgba(85, 117, 244, 0.8); /* 子菜单活跃状态可以稍微浅一点 */
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
  padding: 12px 30px; /* 子菜单项内边距 */
  /* 子菜单项的 hover 效果 */
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* 箭头图标样式（确保你有 Element UI 的图标库） */
/* 如果你的项目没有 Element UI 图标库，这些图标可能不显示，但不会报错 */
.menu li i {
  font-size: 14px;
  color: #fff; /* 确保图标是白色 */
}
</style>