<!-- 菜单里还没做原型的页面 -->
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-breadcrumb class="crumb" separator="/">
    <el-breadcrumb-item>{{ route.params.name }}</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card shadow="never">
    <el-empty :description="`「${route.params.name}」的原型还没做`" />
  </el-card>
</template>
