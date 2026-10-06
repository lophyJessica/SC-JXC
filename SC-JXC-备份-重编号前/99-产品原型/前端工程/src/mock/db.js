// 演示数据库：浏览器本地数据库 IndexedDB（用 Dexie.js 操作）。没有后端、没有服务器
//
// 规矩：
//   - 页面（views）不直接 import 本文件，也不直接用 Dexie；一律通过 mock/repos/ 下的"仓库"函数读写
//   - 第一次打开时自动写入演示数据（种子数据），之后刷新页面数据还在
//   - 顶部"重置演示数据"会清空并重新写入种子数据
//   - 浏览器不允许用 IndexedDB 时（个别浏览器双击打开文件的情况），自动改用内存存储，刷新就恢复初始数据
//
// 新增一张单据的数据表：在 mock/seed/ 下新建 <单据>.js，导出"表们"即可，本文件会自动收集（文件名以 _ 开头的不收集）
// 表结构或种子数据有变化，浏览器里的旧数据会被自动清空并重新写入，不用手动处理
import Dexie from 'dexie'

// 双击打开时（file://），同一台电脑上所有本地网页共用一个存储空间。
// 为了让"参考答案"和几份并跑副本的数据互不干扰，库名后面加上文件所在位置的编号
const 数据库名 =
  location.protocol === 'file:' ? 'sc-jxc-demo-' + 简单哈希(decodeURIComponent(location.pathname)) : 'sc-jxc-demo'

/* ---------- 自动收集 mock/seed/ 下的种子文件 ---------- */
const 种子文件 = import.meta.glob('./seed/*.js', { eager: true })
const 全部表 = Object.entries(种子文件)
  .filter(([路径]) => !路径.split('/').pop().startsWith('_'))
  .flatMap(([, 模块]) => 模块.表们 || [])

/** 表名: 主键（Dexie 写法）。meta 表放"种子签名" */
const 表结构 = { meta: 'key', ...Object.fromEntries(全部表.map(t => [t.名称, t.主键])) }
/** 种子签名：表结构或种子数据一变，签名就变，旧数据自动作废 */
const 种子签名 = 简单哈希(JSON.stringify({ 表结构, 数据: 全部表.map(t => t.数据) }))

function 简单哈希(文本) {
  let h = 0
  for (let i = 0; i < 文本.length; i++) h = (h * 31 + 文本.charCodeAt(i)) | 0
  return String(h)
}

/* ---------- 内存存储（IndexedDB 不可用时的备用），接口和 Dexie 表保持一致 ---------- */
class 内存表 {
  constructor(主键) {
    this.主键 = 主键
    this.行 = new Map()
  }
  async toArray() { return [...this.行.values()].map(x => structuredClone(x)) }
  async get(k) { const x = this.行.get(k); return x ? structuredClone(x) : undefined }
  async put(x) { this.行.set(x[this.主键], structuredClone(x)); return x[this.主键] }
  async bulkPut(list) { list.forEach(x => this.行.set(x[this.主键], structuredClone(x))) }
  async delete(k) { this.行.delete(k) }
  async clear() { this.行.clear() }
}

let 表们 = null
/** 当前存储方式：'IndexedDB' 或 '内存' */
export let 存储方式 = 'IndexedDB'

async function 写入种子() {
  for (const t of 全部表) {
    await 表们[t.名称].clear()
    await 表们[t.名称].bulkPut(structuredClone(t.数据))
  }
  await 表们.meta.put({ key: 'seed', 签名: 种子签名 })
}

/** 打开数据库；第一次打开或种子签名变化时写入种子数据。只在 main.js 启动时调用一次 */
export async function 初始化数据库() {
  try {
    // 表结构变了（比如新加了一张单据），直接删掉旧库重建：演示数据随时可以重来
    const 签名键 = 数据库名 + ':结构'
    const 结构签名 = JSON.stringify(表结构)
    if (localStorage.getItem(签名键) !== 结构签名) {
      await Dexie.delete(数据库名)
      localStorage.setItem(签名键, 结构签名)
    }
    const dexie = new Dexie(数据库名)
    dexie.version(1).stores(表结构)
    await dexie.open()
    表们 = Object.fromEntries(Object.keys(表结构).map(n => [n, dexie.table(n)]))
    存储方式 = 'IndexedDB'
  } catch (e) {
    console.warn('IndexedDB 不可用，改用内存存储：', e?.message)
    表们 = Object.fromEntries(Object.entries(表结构).map(([n, s]) => [n, new 内存表(s.split(',')[0].trim())]))
    存储方式 = '内存'
  }
  const 标记 = await 表们.meta.get('seed')
  if (!标记 || 标记.签名 !== 种子签名) await 写入种子()
}

/** 清空全部演示数据并重新写入种子数据（顶部"重置演示数据"按钮用） */
export async function 重置演示数据() {
  await 写入种子()
}

/** 取一张表。只给 mock/repos/ 用 */
export function 表(表名) {
  if (!表们) throw new Error('数据库还没初始化')
  if (!表们[表名]) throw new Error('没有这张表：' + 表名 + '（检查 mock/seed/ 里有没有定义）')
  return 表们[表名]
}
