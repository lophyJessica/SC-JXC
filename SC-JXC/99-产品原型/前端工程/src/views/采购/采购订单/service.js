// 采购订单的各个动作：读数据 → 按 rules.js 判断 → 写回。页面只调这里，不直接碰数据库
// 每个动作执行前都重新取一次最新数据，防止"别人已经改过了"（主PRD 异常处理）
import * as 仓库 from '@/mock/repos/采购订单'
import { nextNo, nowStr } from '@/utils/format'
import { 能否, 计算审核层级, 有已执行入库 } from './rules'

export const 查全部 = 仓库.查全部
export const 按单号取 = 仓库.按单号取

/** 取最新数据并检查还能不能做；不能就抛出提示文案 */
async function 取并检查(no, 动作, me) {
  const o = await 仓库.按单号取(no)
  if (!o || !能否(动作, o, me)) {
    if (动作 === 'void' && o && 有已执行入库(o)) throw new Error('已有入库记录，不能作废；如剩余不再到货，请使用关闭')
    throw new Error('单据状态已变化，请刷新后重试')
  }
  return o
}

/** 保存草稿（新单自动生成单号），返回保存后的订单 */
export async function 保存草稿(form) {
  const t = nowStr()
  const o = { ...form, updated: t }
  if (!o.no) {
    o.no = nextNo('CGDD', await 仓库.已用单号())
    o.created = t
  }
  await 仓库.保存(o)
  return o
}

/** 提交审核：记下审核层级，状态变待审核 */
export async function 提交审核(form, me, 角色表) {
  const o = { ...form, level: 计算审核层级(form, 角色表), status: '待审核' }
  o.logs = [{ op: '提交审核', by: me.name, time: nowStr(), reason: '' }, ...(o.logs || [])]
  return 保存草稿(o)
}

export async function 删除(no, me) {
  await 取并检查(no, 'delete', me)
  await 仓库.删除(no)
}

export async function 撤回(no, me) {
  const o = await 取并检查(no, 'withdraw', me)
  const t = nowStr()
  Object.assign(o, { status: '草稿', level: undefined, updated: t })
  o.logs.unshift({ op: '撤回', by: me.name, time: t, reason: '' })
  await 仓库.保存(o)
}

/** 审核通过：生成一张待执行的采购入库单，返回入库单号 */
export async function 审核通过(no, me) {
  const o = await 取并检查(no, 'approve', me)
  const t = nowStr()
  const 入库单号 = nextNo('CGRK', await 仓库.已用入库单号())
  Object.assign(o, { status: '已审核', auditor: me.name, auditTime: t, updated: t })
  o.receipts.push({ no: 入库单号, status: '待执行', time: '' })
  o.logs.unshift({ op: '审核通过', by: me.name, time: t, reason: '' })
  await 仓库.保存(o)
  return 入库单号
}

export async function 驳回(no, me, 原因) {
  const o = await 取并检查(no, 'reject', me)
  const t = nowStr()
  Object.assign(o, { status: '草稿', level: undefined, rejectReason: 原因, auditor: me.name, auditTime: t, updated: t })
  o.logs.unshift({ op: '驳回', by: me.name, time: t, reason: 原因 })
  await 仓库.保存(o)
}

/** 作废 / 关闭：待执行的入库单自动取消 */
async function 结束(no, me, 原因, 动作) {
  const o = await 取并检查(no, 动作, me)
  const t = nowStr()
  const 作废 = 动作 === 'void'
  Object.assign(o, { status: 作废 ? '已作废' : '已关闭', updated: t, [作废 ? 'voidReason' : 'closeReason']: 原因 })
  o.receipts.forEach(r => { if (r.status === '待执行') r.status = '已取消' })
  o.logs.unshift({ op: 作废 ? '作废' : '关闭', by: me.name, time: t, reason: 原因 })
  await 仓库.保存(o)
}
export const 作废 = (no, me, 原因) => 结束(no, me, 原因, 'void')
export const 关闭 = (no, me, 原因) => 结束(no, me, 原因, 'close')
