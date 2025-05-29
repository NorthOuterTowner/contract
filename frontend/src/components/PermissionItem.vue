<template>
  <div class="permission-item" @click="toggleCheckbox">
    <div class="checkbox-wrapper">
      <input 
        type="checkbox" 
        :id="`permission-${value}`" 
        :checked="checked" 
        @change="handleChange"
        class="custom-checkbox"
      />
      <label :for="`permission-${value}`"></label>
    </div>
    <span>{{ label }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  checked: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle']);

// 处理复选框切换
const handleChange = () => {
  emit('toggle', props.value);
};

// 点击整个项时切换复选框状态
const toggleCheckbox = () => {
  handleChange();
};
</script>

<style scoped>
.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.permission-item:hover {
  background-color: #e8f4ff;
}

.checkbox-wrapper {
  position: relative;
  width: 20px;
  height: 20px;
}

.custom-checkbox {
  opacity: 0;
  position: absolute;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 1;
}

.checkbox-wrapper label {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.custom-checkbox:checked + label {
  background-color: #007bff;
  border-color: #007bff;
}

.custom-checkbox:checked + label::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.permission-item span {
  font-size: 15px;
  color: #333;
  user-select: none;
}
</style>