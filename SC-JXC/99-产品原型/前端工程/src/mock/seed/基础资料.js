// 基础资料演示数据：来自 03-产品设计/采购管理/采购订单/采购订单-演示数据.md
// 改演示数据时，先改那份 md，再同步这里；不另编

/** 员工：demo=true 的出现在顶部"演示身份"里 */
export const 员工 = [
  { id: 'li', name: '小李', role: '采购员', demo: true },
  { id: 'zhao', name: '老赵', role: '采购组长', demo: true },
  { id: 'wang', name: '王总', role: '老板', demo: true },
  { id: 'sun', name: '小孙', role: '采购员', demo: false } // 只作为部分订单的创建人
]

/** 供应商：enabled=false 表示已停用 */
export const 供应商 = [
  { id: 'S01', name: '杭州优果食品有限公司', enabled: true },
  { id: 'S02', name: '浙江清泉饮品有限公司', enabled: true },
  { id: 'S03', name: '宁波洁家日化有限公司', enabled: true },
  { id: 'S04', name: '上海旧友贸易有限公司', enabled: false }
]

/** 商品：ref = 参考进价；enabled=false 表示已停用 */
export const 商品 = [
  { id: 'P001', code: 'SP-1001', name: '原味薯片', spec: '70g×24袋', unit: '箱', ref: 86.4, enabled: true },
  { id: 'P002', code: 'SP-1002', name: '番茄味薯片', spec: '70g×24袋', unit: '箱', ref: 86.4, enabled: true },
  { id: 'P003', code: 'SP-1003', name: '每日坚果', spec: '25g×30包', unit: '箱', ref: 120.0, enabled: true },
  { id: 'P004', code: 'YL-2001', name: '矿泉水', spec: '550ml×24瓶', unit: '箱', ref: 18.0, enabled: true },
  { id: 'P005', code: 'YL-2002', name: '柠檬茶', spec: '500ml×15瓶', unit: '箱', ref: 45.0, enabled: true },
  { id: 'P006', code: 'RH-3001', name: '洗洁精', spec: '1.5kg×6瓶', unit: '箱', ref: 52.0, enabled: true },
  { id: 'P007', code: 'RH-3002', name: '洗衣液', spec: '2kg×4瓶', unit: '箱', ref: 68.0, enabled: true },
  { id: 'P008', code: 'SP-1009', name: '苏打饼干（老款）', spec: '400g×12盒', unit: '箱', ref: 60.0, enabled: false }
]

/** 上次进价：该供应商该商品最近一次已执行入库单上的采购单价。key = 供应商id|商品id */
export const 上次进价 = [
  { key: 'S01|P001', price: 84.0 },
  { key: 'S01|P002', price: 84.0 },
  { key: 'S01|P003', price: 118.0 },
  { key: 'S02|P004', price: 17.5 },
  { key: 'S02|P005', price: 44.0 },
  { key: 'S03|P006', price: 50.0 },
  { key: 'S03|P007', price: 66.0 }
]

/** 仓库 */
export const 仓库 = [{ name: '余杭仓' }]

/** 交给 mock/db.js 的表定义：名称 = 数据库表名，主键 = Dexie 写法（第一个是主键，后面是索引） */
export const 表们 = [
  { 名称: 'users', 主键: 'id', 数据: 员工 },
  { 名称: 'suppliers', 主键: 'id', 数据: 供应商 },
  { 名称: 'products', 主键: 'id', 数据: 商品 },
  { 名称: 'lastPrices', 主键: 'key', 数据: 上次进价 },
  { 名称: 'warehouses', 主键: 'name', 数据: 仓库 }
]
