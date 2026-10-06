// 采购订单业务规则：全部来自《采购订单-主PRD》（状态、状态—动作矩阵、业务规则）
// 原型不能比主PRD 多规则；主PRD 改了，先改这里
import { r2 } from '@/utils/format'

/** 7 个状态，顺序与字段清单详细稿"订单状态"一致 */
export const 状态列表 = ['草稿', '待审核', '已审核', '部分完成', '已完成', '已关闭', '已作废']

/** 审核金额线：超过 20000 元由老板审核（拍板记录） */
export const 老板审核金额线 = 20000
/** 涨价提醒线：比上次进价高 5% 以上（拍板记录） */
export const 涨价比例 = 1.05

/** 行金额 = 采购数量 × 采购单价 */
export const 行金额 = l => r2((Number(l.qty) || 0) * (Number(l.price) || 0))
/** 订单金额合计 */
export const 合计金额 = o => r2(o.lines.reduce((a, l) => a + 行金额(l), 0))
/** 采购总数量 */
export const 总数量 = o => o.lines.reduce((a, l) => a + (Number(l.qty) || 0), 0)
/** 是否涨价：有上次进价，且本次单价 > 上次进价 × 1.05 */
export const 是否涨价 = l => l.last != null && l.price !== '' && Number(l.price) > r2(l.last * 涨价比例)

/**
 * 计算审核层级：订单金额合计超过 20000 元，或创建人是采购组长 → 老板；否则 → 采购组长
 * @param {object} o 订单
 * @param {object} 角色表 姓名 → 角色
 */
export const 计算审核层级 = (o, 角色表) =>
  合计金额(o) > 老板审核金额线 || 角色表[o.creator] === '采购组长' ? '老板' : '采购组长'

/** 展示用审核层级：提交后用订单上记下的层级；草稿按当前内容实时计算 */
export const 审核层级 = (o, 角色表) => (o.status !== '草稿' && o.level ? o.level : 计算审核层级(o, 角色表))

/** 是否已有执行过的入库单 */
export const 有已执行入库 = o => o.receipts.some(r => r.status === '已执行')

/**
 * 权限判断：与主PRD 状态—动作矩阵一致
 * @param {string} 动作 create/edit/delete/submit/withdraw/approve/reject/void/close
 * @param {object|null} o 订单（create 时不传）
 * @param {object} me 当前身份 { name, role }
 */
export function 能否(动作, o, me) {
  const 是创建人 = !!o && o.creator === me.name
  switch (动作) {
    case 'create':
      return me.role === '采购员' || me.role === '采购组长'
    case 'edit':
    case 'delete':
    case 'submit':
      return o.status === '草稿' && 是创建人
    case 'withdraw':
      return o.status === '待审核' && 是创建人
    case 'approve':
    case 'reject':
      return o.status === '待审核' && me.role === o.level && !是创建人
    case 'void':
      return o.status === '已审核' && !有已执行入库(o) && (是创建人 || me.role === '采购组长')
    case 'close':
      return o.status === '部分完成' && (是创建人 || me.role === '采购组长')
  }
  return false
}

/* ---------- 校验（提示文案来自 Demo PRD 新增编辑页） ---------- */

/** 单行格式校验 */
export function 行格式错误(l) {
  const r = {}
  if (l.qty !== '' && !/^[1-9]\d*$/.test(String(l.qty))) r.qty = '请输入大于 0 的整数'
  if (l.price !== '' && !/^\d+(\.\d{1,2})?$/.test(String(l.price))) r.price = '请输入大于等于 0 的金额，最多两位小数'
  return r
}

/** 保存草稿：只校验格式 */
export function 格式校验(f) {
  const e = {}
  if (f.eta && f.date && f.eta < f.date) e.eta = '期望到货日期不能早于下单日期'
  if ((f.remark || '').length > 200) e.remark = '备注最多 200 字'
  f.lines.forEach((l, i) => {
    const r = 行格式错误(l)
    if (Object.keys(r).length) e['l' + i] = r
  })
  return e
}

/** 提交审核：全量校验（必填 + 格式） */
export function 全量校验(f) {
  const e = 格式校验(f)
  if (!f.sid) e.sid = '请选择供应商'
  if (!f.date) e.date = '请选择下单日期'
  if (!f.eta) e.eta = '请选择期望到货日期'
  if (!f.lines.length) e.lines = '请至少添加 1 个商品'
  f.lines.forEach((l, i) => {
    const r = { ...(e['l' + i] || {}) }
    if (!l.pid) r.pid = '请选择商品'
    if (l.qty === '') r.qty = '请输入大于 0 的整数'
    if (l.price === '') r.price = '请输入大于等于 0 的金额，最多两位小数'
    if (Object.keys(r).length) e['l' + i] = r
  })
  return e
}
