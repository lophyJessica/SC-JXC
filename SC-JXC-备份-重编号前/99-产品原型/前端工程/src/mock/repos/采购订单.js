// 采购订单仓库：只负责存取，不写业务规则（业务规则在 views/采购/采购订单/rules.js）
import { 表 } from '../db'

const t = () => 表('purchaseOrders')

/** 全部采购订单 */
export const 查全部 = () => t().toArray()
/** 按单号取一张；没有返回 undefined */
export const 按单号取 = no => t().get(no)
/** 保存（新增或覆盖） */
export const 保存 = order => t().put(JSON.parse(JSON.stringify(order)))
/** 删除 */
export const 删除 = no => t().delete(no)
/** 已用过的采购订单号 */
export const 已用单号 = async () => (await t().toArray()).map(o => o.no)
/** 已用过的入库单号（入库单挂在采购订单的 receipts 里） */
export const 已用入库单号 = async () => (await t().toArray()).flatMap(o => o.receipts.map(r => r.no))
