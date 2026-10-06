<!-- 状态标签：颜色统一取 config/status.js（来源 07-UI规范库） -->
<script setup>
import { computed } from 'vue'
import { 状态颜色 } from '@/config/status'

const props = defineProps({ status: { type: String, required: true } })
const 样式 = computed(() => 状态颜色[props.status] || 状态颜色.草稿)
</script>

<template>
  <span class="status-tag" :style="样式">{{ props.status }}</span>
</template>

<style scoped>
.status-tag {
  display: inline-block;
  padding: 0 8px;
  line-height: 20px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
</style>
