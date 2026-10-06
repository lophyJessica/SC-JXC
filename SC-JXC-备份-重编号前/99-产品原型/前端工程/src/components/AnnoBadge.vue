<!-- 角标组件：橙色小圆点 + 编号，点击弹出说明。由 v-anno 指令自动挂载，页面一般不直接用 -->
<script setup>
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: { type: String, required: true }, // 角标编号，如 L1
  text: { type: String, default: '' } // 角标说明
})

const 弹出 = ref(false)
const 位置 = ref({ left: '0px', top: '0px' })

function 切换(ev) {
  ev.stopPropagation()
  ev.preventDefault()
  位置.value = { left: Math.min(ev.clientX + 10, window.innerWidth - 340) + 'px', top: ev.clientY + 10 + 'px' }
  弹出.value = !弹出.value
}
const 关闭 = () => (弹出.value = false)
document.addEventListener('click', 关闭)
onBeforeUnmount(() => document.removeEventListener('click', 关闭))
</script>

<template>
  <span class="anno-badge" @click="切换">{{ props.id }}</span>
  <Teleport to="body">
    <div v-if="弹出" class="anno-pop" :style="位置">
      <b>{{ props.id }}</b> {{ props.text }}<br />
      <span class="anno-pop-tip">详见 99-产品原型/标注/</span>
    </div>
  </Teleport>
</template>
