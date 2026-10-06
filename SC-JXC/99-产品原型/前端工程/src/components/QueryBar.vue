<!-- 查询区：放在列表页表格上方。字段由页面通过插槽放进来，本组件负责排版、查询/重置按钮和错误提示 -->
<script setup>
defineProps({
  error: { type: String, default: '' } // 查询条件错误，如"结束日期不能早于开始日期"
})
const emit = defineEmits(['search', 'reset'])
</script>

<template>
  <el-card shadow="never" class="query-bar">
    <el-form inline label-width="auto" @submit.prevent="emit('search')">
      <slot />
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
    <div v-if="error" class="field-err">{{ error }}</div>
  </el-card>
</template>

<style scoped>
.query-bar :deep(.el-form-item) {
  margin-bottom: 8px;
  margin-right: 20px;
}
</style>
