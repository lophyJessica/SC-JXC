// 程序入口：先打开演示数据库，再挂载页面
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { Plus, Files, ShoppingCart, Sell, Box } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './styles/global.css'

import App from './App.vue'
import router from './router'
import anno from './directives/anno'
import { 初始化数据库 } from './mock/db'
import { useDemoStore } from './stores/demo'

async function 启动() {
  await 初始化数据库()
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus, { locale: zhCn }) // 中文：分页、日期选择、空数据等文字都是中文
  // 只注册用到的图标（菜单分组图标、加号）；要用新图标在这里加
  for (const [名, 组件] of Object.entries({ Plus, Files, ShoppingCart, Sell, Box })) app.component(名, 组件)
  app.directive('anno', anno)
  await useDemoStore().加载员工()
  app.mount('#app')
}
启动()
