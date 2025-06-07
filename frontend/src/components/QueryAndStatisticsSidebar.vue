<template>
  <div class="sidebar">
    <div class="logo">信息查询与统计</div>
    <ul class="menu">
      <li 
        :class="{ active: activePath.startsWith('/my-contract-module/query') }"
        @click="navigateTo('/my-contract-module/query')"
      >
        合同查询 
      </li>
      <li 
        :class="{ active: activePath === '/my-contract-module/statistics' }"
        @click="navigateTo('/my-contract-module/statistics')"
      >
        合同统计 
      </li>
      <li 
        :class="{ active: activePath === '/HomePage' || activePath === '/' }"
        @click="navigateTo('/HomePage')"
      >
        返回主页 
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    activePath: {
      type: String,
      required: true,
      default: ''
    }
  },
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    }
  }
};
</script>

<style scoped>
/* 保持与你 HomePage 中自定义下拉菜单类似的样式，确保你自己的模块内部风格一致 */
.sidebar {
  width: 100%; /* 占据父容器的全部宽度 */
  height: 100%; /* 占据父容器的全部高度 */
  background-color: #2c3e50; /* 深色背景 */
  color: white;
  padding-top: 20px; /* 给 logo 留空间 */
  box-sizing: border-box; /* 确保 padding 不会增加宽度 */
}

.logo {
  padding: 0 20px 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 15px;
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
  display: flex; /* Keep flex if you want to align text vertically */
  align-items: center; /* Vertical alignment */
}

/* 移除了图标的特定样式，因为菜单项旁不再显示图标 */
/* .menu li i { 
  margin-right: 10px;
  font-size: 16px;
  color: white;
} */


.menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu li.active {
  background-color: rgb(85, 117, 244); /* 蓝色高亮 */
  color: white;
  font-weight: bold;
}
</style>