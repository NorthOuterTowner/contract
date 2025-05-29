<template>
  <div class="permission-node">
    <label>
      <input 
        type="checkbox" 
        :checked="isChecked" 
        @change="togglePermission(systemFunction.FunctionID)"
      />
      {{ systemFunction.FunctionName }}
    </label>
    
    <div v-if="children.length > 0" class="child-nodes">
      <TreeNode 
        v-for="child in children" 
        :key="child.FunctionID" 
        :systemFunction="child" 
        :selectedFunctions="selectedFunctions"
        @toggle-permission="togglePermission"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  systemFunction: {
    type: Object,
    required: true
  },
  selectedFunctions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['toggle-permission']);

// 计算子节点
const children = computed(() => {
  return props.selectedFunctions.filter(
    func => func.ParentID === props.systemFunction.FunctionID
  );
});

// 计算当前节点是否选中
const isChecked = computed(() => {
  return props.selectedFunctions.includes(props.systemFunction.FunctionID);
});

// 触发权限选择事件
const togglePermission = (functionId) => {
  emit('toggle-permission', functionId);
};
</script>