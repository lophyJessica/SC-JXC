// 演示状态：当前演示身份、是否显示角标、员工名单。只在原型里有，不属于系统功能
import { defineStore } from 'pinia'
import { 查员工 } from '@/mock/repos/基础资料'

export const useDemoStore = defineStore('demo', {
  state: () => ({
    员工: [], // 全部员工（含不能切换的，如小孙）
    当前身份id: 'li', // 默认采购员小李
    showAnno: false // 是否显示角标
  }),
  getters: {
    /** 可切换的演示身份 */
    演示身份: s => s.员工.filter(u => u.demo),
    /** 当前登录人 { id, name, role } */
    me: s => s.员工.find(u => u.id === s.当前身份id) || { id: '', name: '', role: '' },
    /** 姓名 → 角色，例如 { 老赵: '采购组长' } */
    角色表: s => Object.fromEntries(s.员工.map(u => [u.name, u.role]))
  },
  actions: {
    async 加载员工() {
      this.员工 = await 查员工()
    }
  }
})
