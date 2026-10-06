<!-- 后台整体布局：顶部（系统名、演示身份、显示角标、重置演示数据）+ 左侧菜单 + 内容区 -->
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useDemoStore } from '@/stores/demo'
import { 菜单 } from '@/config/menu'
import { 重置演示数据, 存储方式 } from '@/mock/db'

const store = useDemoStore()
const route = useRoute()
const router = useRouter()

// 当前高亮的菜单：页面路由 meta.菜单，或"未制作"页的名称
const 当前菜单 = computed(() => route.meta.菜单 || route.params.name || '')

// 已经做好的菜单项：有页面路由 meta 写了 { 菜单: 名称, 入口: true }
const 入口 = computed(() => Object.fromEntries(router.getRoutes().filter(r => r.meta?.入口).map(r => [r.meta.菜单, r.path])))

function 打开(名称) {
  router.push(入口.value[名称] || `/todo/${名称}`)
}

async function 重置() {
  try {
    await ElMessageBox.confirm('将清空所有演示操作，恢复成初始的演示数据，确定重置吗？', '重置演示数据', {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  await 重置演示数据()
  ElMessage.success('演示数据已重置')
  // 整页刷新，所有页面重新读数
  location.reload()
}
</script>

<template>
  <el-container class="layout">
    <el-header class="topbar">
      <span class="logo" style="cursor: pointer" @click="router.push('/home')">顺诚进销存</span>
      <span class="sub">SC-JXC 原型</span>
      <div class="demo">
        <span class="demo-tip">演示身份（仅原型演示用，不属于系统功能）</span>
        <el-select id="userSel" v-model="store.当前身份id" size="small" style="width: 150px">
          <el-option v-for="u in store.演示身份" :key="u.id" :value="u.id" :label="`${u.role} ${u.name}`" />
        </el-select>
        <el-switch id="annoSw" v-model="store.showAnno" active-text="显示角标" size="small" />
        <el-button id="btnReset" size="small" @click="重置">重置演示数据</el-button>
        <el-tooltip v-if="存储方式 === '内存'" content="当前浏览器不支持本地数据库，刷新页面会恢复初始数据" placement="bottom">
          <el-tag size="small" type="warning">内存模式</el-tag>
        </el-tooltip>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="side">
        <el-menu :default-openeds="菜单.map(g => g.分组)" :default-active="当前菜单" background-color="#001529" text-color="#bfbfbf" active-text-color="#ffffff">
          <el-sub-menu v-for="g in 菜单" :key="g.分组" :index="g.分组">
            <template #title>
              <el-icon><component :is="g.图标" /></el-icon>
              <span>{{ g.分组 }}</span>
            </template>
            <el-menu-item v-for="名称 in g.项目" :key="名称" :index="名称" :class="{ 'not-ready': !入口[名称] }" @click="打开(名称)">
              {{ 名称 }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view :key="route.fullPath" />
      </el-main>
    </el-container>
  </el-container>
</template>
