<!--
  原因弹窗：驳回、作废、关闭等"必须填原因"的操作共用（07-UI规范库：需要填写原因的操作用弹窗，原因必填）
  用法：<ReasonDialog ref="原因弹窗" :anno="角标.D7" />，然后 const 原因 = await 原因弹窗.value.打开({ 标题, 说明, 危险 })
  用户点取消时返回 null
-->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  anno: { type: Object, default: null } // 角标对象，可不传
})

const 显示 = ref(false)
const 配置 = ref({ 标题: '', 说明: '', 危险: false })
const 原因 = ref('')
const 错误 = ref('')
let 结果回调 = null

/** 打开弹窗，返回 Promise：确定时得到原因文字，取消时得到 null */
function 打开(选项) {
  配置.value = { 危险: false, 说明: '', ...选项 }
  原因.value = ''
  错误.value = ''
  显示.value = true
  return new Promise(resolve => (结果回调 = resolve))
}

function 确定() {
  const v = 原因.value.trim()
  if (!v) return (错误.value = '请填写原因')
  if (v.length > 200) return (错误.value = '原因最多 200 字') // 1～200 字，全局校验规范
  显示.value = false
  结果回调?.(v)
}
function 取消() {
  显示.value = false
  结果回调?.(null)
}

defineExpose({ 打开 })
</script>

<template>
  <el-dialog v-model="显示" :title="配置.标题" width="460px" :close-on-click-modal="false" class="reason-dialog" @close="取消">
    <div v-if="显示" v-anno="props.anno" class="reason-body">
      <p class="muted" style="margin-top: 0">{{ 配置.说明 }}</p>
      <div class="req" style="margin-bottom: 6px">原因</div>
      <el-input id="reason" v-model="原因" type="textarea" :rows="4" placeholder="请填写原因，1～200 字" :class="{ 'is-error': 错误 }" />
      <div class="field-err">{{ 错误 }}</div>
    </div>
    <template #footer>
      <el-button id="mCancel" @click="取消">取消</el-button>
      <el-button id="mOk" :type="配置.危险 ? 'danger' : 'primary'" @click="确定">确定</el-button>
    </template>
  </el-dialog>
</template>
