// 路由：用 hash 模式（地址里带 #），这样 dist/index.html 双击打开也能跳转
// 每个单据在自己的 views 目录里写 routes.js，这里会自动收集，不用手动登记
import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '@/layout/AdminLayout.vue'
import 首页 from '@/views/公共/首页.vue'
import 未制作 from '@/views/公共/未制作.vue'

const 路由文件 = import.meta.glob('../views/**/routes.js', { eager: true })
const 单据路由 = Object.values(路由文件).flatMap(m => m.default || [])

const routes = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/home',
    children: [
      { path: 'home', component: 首页 },
      ...单据路由,
      // 菜单里还没做的页面，统一显示"原型还没做"
      { path: 'todo/:name', component: 未制作 },
      { path: ':pathMatch(.*)*', redirect: '/home' }
    ]
  }
]

export default createRouter({ history: createWebHashHistory(), routes })
