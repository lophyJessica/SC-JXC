// 通用小工具：金额、日期、单号。所有单据共用，不放业务规则
const pad = n => String(n).padStart(2, '0')

/** 四舍五入到两位小数 */
export const r2 = n => Math.round(n * 100) / 100

/** 金额显示：两位小数 + 千分位；空值显示"-" */
export const money = n =>
  n == null || n === '' ? '-' : Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 今天，格式 YYYY-MM-DD */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 现在，格式 YYYY-MM-DD HH:mm */
export function nowStr() {
  const d = new Date()
  return `${today()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 深拷贝（表单编辑时用，避免直接改到数据库里取出的对象） */
export const clone = obj => JSON.parse(JSON.stringify(obj))

/**
 * 生成单号：前缀-年月日-4位流水（见 01-全局背景信息/40-单据目录与通用状态.md）
 * @param {string} prefix 单号前缀，如 CGDD
 * @param {string[]} usedNos 已经用过的单号
 */
export function nextNo(prefix, usedNos) {
  const d = today().replace(/-/g, '')
  let n = 1
  const no = i => `${prefix}-${d}-${String(i).padStart(4, '0')}`
  while (usedNos.includes(no(n))) n++
  return no(n)
}
