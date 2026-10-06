// v-anno 指令：给区域打上角标
// 用法：<div v-anno="角标.L1">…</div>，角标对象来自各单据目录下的 anno.js
// 作用：1）给元素加 data-anno="L1"（验收脚本和截图脚本靠它找区域）
//      2）顶部"显示角标"打开时，在区域左上角显示橙色角标
import { h, render, watch } from 'vue'
import AnnoBadge from '@/components/AnnoBadge.vue'
import { useDemoStore } from '@/stores/demo'

export default {
  mounted(el, binding) {
    const 角标 = binding.value
    if (!角标) return // 没传角标就什么都不做
    el.dataset.anno = 角标.id
    el.classList.add('anno-host')
    const 容器 = document.createElement('span')
    容器.className = 'anno-slot'
    el.appendChild(容器)
    el._anno = { 容器, 角标 }
    const store = useDemoStore()
    el._anno.停止 = watch(
      () => store.showAnno,
      显示 => render(显示 ? h(AnnoBadge, { id: el._anno.角标.id, text: el._anno.角标.text }) : null, 容器),
      { immediate: true }
    )
  },
  updated(el, binding) {
    if (!el._anno || !binding.value) return
    el.dataset.anno = binding.value.id
    el._anno.角标 = binding.value
    // 指令所在元素重新渲染后，确保角标容器还挂在元素里
    if (!el.contains(el._anno.容器)) el.appendChild(el._anno.容器)
  },
  unmounted(el) {
    el._anno?.停止?.()
    if (el._anno) render(null, el._anno.容器)
  }
}
