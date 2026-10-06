// 基础资料仓库：员工、供应商、商品、上次进价、仓库。页面只通过这里取数
import { 表 } from '../db'

export const 查员工 = () => 表('users').toArray()
export const 查供应商 = () => 表('suppliers').toArray()
export const 查商品 = () => 表('products').toArray()
export const 查仓库 = () => 表('warehouses').toArray()

/** 上次进价表，返回 { '供应商id|商品id': 单价 } */
export async function 查上次进价() {
  const 行 = await 表('lastPrices').toArray()
  return Object.fromEntries(行.map(x => [x.key, x.price]))
}
