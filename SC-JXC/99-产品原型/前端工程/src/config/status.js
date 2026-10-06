// 状态标签颜色：来自 07-UI规范库/页面风格约定.md
// 草稿-灰，待审核-橙，已审核-蓝，部分完成-青，已完成-绿，已关闭-紫，已作废-红
// 新单据如果用到新状态，先在 07-UI规范库 写明颜色，再加到这里
const 灰 = { color: '#595959', background: '#fafafa', borderColor: '#d9d9d9' }
const 橙 = { color: '#d46b08', background: '#fff7e6', borderColor: '#ffd591' }
const 蓝 = { color: '#0958d9', background: '#e6f4ff', borderColor: '#91caff' }
const 青 = { color: '#08979c', background: '#e6fffb', borderColor: '#87e8de' }
const 绿 = { color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' }
const 紫 = { color: '#531dab', background: '#f9f0ff', borderColor: '#d3adf7' }
const 红 = { color: '#cf1322', background: '#fff1f0', borderColor: '#ffa39e' }
const 浅灰 = { color: '#8c8c8c', background: '#fafafa', borderColor: '#d9d9d9' }

export const 状态颜色 = {
  // 订单类通用状态
  草稿: 灰,
  待审核: 橙,
  已审核: 蓝,
  部分完成: 青,
  已完成: 绿,
  已关闭: 紫,
  已作废: 红,
  // 入库单 / 出库单（在采购订单详情的"关联入库单"里展示）
  待执行: 橙,
  已执行: 绿,
  已取消: 浅灰
}
