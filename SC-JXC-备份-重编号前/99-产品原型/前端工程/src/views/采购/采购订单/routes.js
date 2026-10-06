// 采购订单的三个页面（router/index.js 会自动收集本文件）
// 地址规则：/<模块英文>/<单号前缀小写>[/<单号>][/edit]；列表页 meta 写 入口: true，左侧菜单点"采购订单"就进这里
import 列表页 from './列表页/index.vue'
import 新增编辑页 from './新增编辑页/index.vue'
import 详情页 from './详情页/index.vue'

export default [
  { path: 'purchase/cgdd', component: 列表页, meta: { 菜单: '采购订单', 入口: true } },
  { path: 'purchase/cgdd/new', component: 新增编辑页, meta: { 菜单: '采购订单' } },
  { path: 'purchase/cgdd/:no/edit', component: 新增编辑页, meta: { 菜单: '采购订单' } },
  { path: 'purchase/cgdd/:no', component: 详情页, meta: { 菜单: '采购订单' } }
]
