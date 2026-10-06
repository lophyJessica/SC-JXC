// 采购订单演示数据：来自 03-产品设计/采购管理/采购订单/采购订单-演示数据.md（12 张）
//
// 代码字段 ↔ 字段清单详细稿里的"字段名称"：
//   no 采购订单号 | status 订单状态 | sid 供应商 | date 下单日期 | eta 期望到货日期 | wh 仓库 | remark 备注
//   creator 创建人 | created 创建时间 | updated 最后修改时间 | level 审核层级 | auditor 审核人 | auditTime 审核时间
//   rejectReason 驳回原因 | voidReason 作废原因 | closeReason 关闭原因 | receipts 关联入库单
//   lines 商品明细：pid 商品 | qty 采购数量 | price 采购单价 | inQty 已入库数量 | last 上次进价
//   logs 操作记录（详情页展示用）
const L = (pid, qty, price, inQty = 0, last = null) => ({ pid, qty, price, inQty, last })
const 提交 = (by, time) => ({ op: '提交审核', by, time, reason: '' })
const 通过 = (by, time) => ({ op: '审核通过', by, time, reason: '' })

export const 采购订单 = [
  { no: 'CGDD-20261012-0001', status: '草稿', sid: 'S01', date: '2026-10-12', eta: '2026-10-16', wh: '余杭仓', remark: '', creator: '小李', created: '2026-10-12 09:10', updated: '2026-10-12 09:10',
    lines: [L('P001', 50, 84, 0, 84), L('P002', 30, 84, 0, 84)], logs: [], receipts: [] },
  { no: 'CGDD-20261011-0001', status: '草稿', sid: 'S03', date: '2026-10-11', eta: '2026-10-15', wh: '余杭仓', remark: '月度日化补货', creator: '小李', created: '2026-10-11 10:02', updated: '2026-10-11 16:40',
    lines: [L('P007', 120, 66, 0, 66)], auditor: '老赵', auditTime: '2026-10-11 16:40', rejectReason: '洗衣液数量太多，库房放不下，减到 60 箱',
    logs: [{ op: '驳回', by: '老赵', time: '2026-10-11 16:40', reason: '洗衣液数量太多，库房放不下，减到 60 箱' }, 提交('小李', '2026-10-11 10:05')], receipts: [] },
  { no: 'CGDD-20261013-0003', status: '草稿', sid: 'S02', date: '2026-10-13', eta: '2026-10-17', wh: '余杭仓', remark: '', creator: '小孙', created: '2026-10-13 11:20', updated: '2026-10-13 11:20',
    lines: [L('P004', 100, 17.5, 0, 17.5)], logs: [], receipts: [] },
  { no: 'CGDD-20261012-0002', status: '待审核', level: '采购组长', sid: 'S02', date: '2026-10-12', eta: '2026-10-15', wh: '余杭仓', remark: '国庆后饮料补货', creator: '小李', created: '2026-10-12 14:00', updated: '2026-10-12 14:05',
    lines: [L('P004', 400, 17.5, 0, 17.5), L('P005', 100, 44, 0, 44)], logs: [提交('小李', '2026-10-12 14:05')], receipts: [] },
  { no: 'CGDD-20261013-0001', status: '待审核', level: '老板', sid: 'S01', date: '2026-10-13', eta: '2026-10-18', wh: '余杭仓', remark: '双十一备货', creator: '小李', created: '2026-10-13 09:30', updated: '2026-10-13 09:42',
    lines: [L('P001', 150, 84, 0, 84), L('P003', 80, 125, 0, 118)], logs: [提交('小李', '2026-10-13 09:42')], receipts: [] },
  { no: 'CGDD-20261013-0002', status: '待审核', level: '老板', sid: 'S03', date: '2026-10-13', eta: '2026-10-16', wh: '余杭仓', remark: '', creator: '老赵', created: '2026-10-13 10:15', updated: '2026-10-13 10:16',
    lines: [L('P006', 60, 50, 0, 50)], logs: [提交('老赵', '2026-10-13 10:16')], receipts: [] },
  { no: 'CGDD-20261010-0001', status: '已审核', level: '采购组长', sid: 'S02', date: '2026-10-10', eta: '2026-10-14', wh: '余杭仓', remark: '', creator: '小孙', created: '2026-10-10 09:00', updated: '2026-10-10 15:20',
    lines: [L('P004', 300, 17.5, 0, 17.5)], auditor: '老赵', auditTime: '2026-10-10 15:20',
    logs: [通过('老赵', '2026-10-10 15:20'), 提交('小孙', '2026-10-10 09:05')],
    receipts: [{ no: 'CGRK-20261010-0001', status: '待执行', time: '' }] },
  { no: 'CGDD-20261008-0001', status: '部分完成', level: '采购组长', sid: 'S01', date: '2026-10-08', eta: '2026-10-12', wh: '余杭仓', remark: '', creator: '小李', created: '2026-10-08 08:50', updated: '2026-10-09 17:30',
    lines: [L('P001', 100, 84, 60, 84), L('P002', 50, 84, 50, 84)], auditor: '老赵', auditTime: '2026-10-08 11:00',
    logs: [通过('老赵', '2026-10-08 11:00'), 提交('小李', '2026-10-08 09:00')],
    receipts: [{ no: 'CGRK-20261008-0001', status: '已执行', time: '2026-10-09 17:30' }, { no: 'CGRK-20261009-0001', status: '待执行', time: '' }] },
  { no: 'CGDD-20261005-0001', status: '已完成', level: '采购组长', sid: 'S03', date: '2026-10-05', eta: '2026-10-08', wh: '余杭仓', remark: '', creator: '小孙', created: '2026-10-05 10:00', updated: '2026-10-07 14:00',
    lines: [L('P007', 80, 66, 80, 66)], auditor: '老赵', auditTime: '2026-10-05 13:00',
    logs: [通过('老赵', '2026-10-05 13:00'), 提交('小孙', '2026-10-05 10:05')],
    receipts: [{ no: 'CGRK-20261005-0001', status: '已执行', time: '2026-10-07 14:00' }] },
  { no: 'CGDD-20261003-0001', status: '已关闭', level: '采购组长', sid: 'S02', date: '2026-10-03', eta: '2026-10-06', wh: '余杭仓', remark: '', creator: '小李', created: '2026-10-03 09:00', updated: '2026-10-08 10:00',
    lines: [L('P005', 120, 44, 70, 44)], auditor: '老赵', auditTime: '2026-10-03 11:00', closeReason: '供应商柠檬茶断货，剩余 50 箱不再送',
    logs: [{ op: '关闭', by: '小李', time: '2026-10-08 10:00', reason: '供应商柠檬茶断货，剩余 50 箱不再送' }, 通过('老赵', '2026-10-03 11:00'), 提交('小李', '2026-10-03 09:10')],
    receipts: [{ no: 'CGRK-20261003-0001', status: '已执行', time: '2026-10-06 15:00' }, { no: 'CGRK-20261006-0001', status: '已取消', time: '' }] },
  { no: 'CGDD-20261002-0001', status: '已作废', level: '采购组长', sid: 'S01', date: '2026-10-02', eta: '2026-10-05', wh: '余杭仓', remark: '', creator: '小孙', created: '2026-10-02 09:00', updated: '2026-10-02 16:00',
    lines: [L('P003', 40, 118, 0, 118)], auditor: '老赵', auditTime: '2026-10-02 10:00', voidReason: '门店活动取消，不再需要',
    logs: [{ op: '作废', by: '小孙', time: '2026-10-02 16:00', reason: '门店活动取消，不再需要' }, 通过('老赵', '2026-10-02 10:00'), 提交('小孙', '2026-10-02 09:05')],
    receipts: [{ no: 'CGRK-20261002-0001', status: '已取消', time: '' }] },
  { no: 'CGDD-20260925-0001', status: '已完成', level: '采购组长', sid: 'S04', date: '2026-09-25', eta: '2026-09-28', wh: '余杭仓', remark: '停用前的最后一单', creator: '小李', created: '2026-09-25 09:00', updated: '2026-09-28 10:00',
    lines: [L('P008', 50, 60, 50, null)], auditor: '老赵', auditTime: '2026-09-25 10:00',
    logs: [通过('老赵', '2026-09-25 10:00'), 提交('小李', '2026-09-25 09:05')],
    receipts: [{ no: 'CGRK-20260925-0001', status: '已执行', time: '2026-09-28 10:00' }] }
]

/** 交给 mock/db.js 的表定义 */
export const 表们 = [{ 名称: 'purchaseOrders', 主键: 'no, status, sid, creator', 数据: 采购订单 }]
