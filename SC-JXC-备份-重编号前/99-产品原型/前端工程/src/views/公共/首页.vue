<!-- 首页：说明怎么看原型，列出已经做好的页面 -->
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const 已做页面 = computed(() => router.getRoutes().filter(r => r.meta?.入口))
</script>

<template>
  <el-card shadow="never">
    <h3 class="card-title">顺诚进销存（SC-JXC）产品原型</h3>
    <p class="muted">这是给业务方看的可点击原型，数据都是演示数据，存在你自己的浏览器里，不连任何真实系统。</p>
    <ul class="tips">
      <li>右上角「演示身份」：切换采购员、采购组长、老板，看不同身份能做什么</li>
      <li>右上角「显示角标」：打开后页面上出现 L1、F1、D1 这样的橙色角标，点一下看说明</li>
      <li>右上角「重置演示数据」：把所有演示操作清掉，恢复成初始数据</li>
    </ul>
    <h3 class="card-title">已经做好的页面</h3>
    <div v-if="已做页面.length" class="links">
      <el-button v-for="r in 已做页面" :key="r.path" type="primary" plain @click="router.push(r.path)">{{ r.meta.菜单 }}</el-button>
    </div>
    <el-empty v-else description="还没有做好的页面，按 07-UI规范库/前端技术约定.md 第五节新增" />
  </el-card>
</template>

<style scoped>
.tips { line-height: 2; color: #595959; }
.links { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
