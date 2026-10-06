<!-- 采购订单新增编辑页：依据《采购订单_Demo_新增编辑页》。角标 F1～F7 -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import FooterBar from '@/components/FooterBar.vue'
import { useDemoStore } from '@/stores/demo'
import { 查供应商, 查商品, 查仓库, 查上次进价 } from '@/mock/repos/基础资料'
import { money, today, clone } from '@/utils/format'
import { 角标 } from '../anno'
import { 能否, 行金额, 合计金额, 总数量, 是否涨价, 计算审核层级, 行格式错误, 格式校验, 全量校验 } from '../rules'
import * as 服务 from '../service'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()

const 就绪 = ref(false)
const 表单 = ref(null)
const 错误 = ref({}) // 字段错误：sid/date/eta/remark/lines，以及每行 l0、l1…
const 顶部错误 = ref('') // 停用类错误，显示在页面顶部
const 有修改 = ref(false)
const 处理中 = ref(false) // 防重复点击
const 基础 = ref({ 供应商: [], 商品: [], 仓库: [], 上次进价: {} })
let 行序号 = 0

const 是编辑 = computed(() => !!route.params.no)
const 层级 = computed(() => (表单.value ? 计算审核层级(表单.value, store.角色表) : ''))
const 启用供应商 = computed(() => 基础.value.供应商.filter(s => s.enabled))
const 供应商 = id => 基础.value.供应商.find(s => s.id === id)
const 商品 = id => 基础.value.商品.find(p => p.id === id)

/** 进入页面：检查权限，准备表单 */
async function 准备() {
  const [供应商, 商品, 仓库, 上次进价] = await Promise.all([查供应商(), 查商品(), 查仓库(), 查上次进价()])
  基础.value = { 供应商, 商品, 仓库, 上次进价 }
  if (!是编辑.value) {
    if (!能否('create', null, store.me)) {
      ElMessage.error('当前身份不能新建采购订单')
      return router.replace('/purchase/cgdd')
    }
    表单.value = { no: '', status: '草稿', sid: '', date: today(), eta: '', wh: 仓库[0]?.name || '', remark: '', creator: store.me.name, lines: [], logs: [], receipts: [] }
  } else {
    const o = await 服务.按单号取(route.params.no)
    if (!o || !能否('edit', o, store.me)) {
      ElMessage.error('当前不可编辑')
      return router.replace(o ? `/purchase/cgdd/${o.no}` : '/purchase/cgdd')
    }
    表单.value = clone(o)
    表单.value.lines.forEach(l => (l.price = Number(l.price).toFixed(2))) // 单价统一显示两位小数
  }
  表单.value.lines.forEach(l => (l.key = ++行序号))
  就绪.value = true
  if (route.query.submit === '1') setTimeout(提交审核, 50) // 从详情页点"提交审核"进来
}
onMounted(准备)

// 切换演示身份后，如果当前身份不能编辑这张单，退回去
watch(() => store.当前身份id, () => {
  有修改.value = false
  就绪.value = false
  准备()
})

/* ---------- 离开确认 ---------- */
onBeforeRouteLeave(async () => {
  if (!有修改.value) return true
  try {
    await ElMessageBox.confirm('有未保存的修改，确定离开吗？', '离开页面', {
      confirmButtonText: '离开', cancelButtonText: '取消', type: 'warning',
      closeOnHashChange: false // 地址栏变化时不要自动关掉这个确认框
    })
    return true
  } catch {
    return false
  }
})
const 改了 = () => (有修改.value = true)
function 取消() {
  router.push(表单.value.no ? `/purchase/cgdd/${表单.value.no}` : '/purchase/cgdd')
}

/* ---------- 基本信息 ---------- */
async function 换供应商(v) {
  const f = 表单.value
  if (f.lines.some(l => l.pid) && f.sid) {
    try {
      await ElMessageBox.confirm('更换供应商后，各行单价将按新供应商重新带出，确定更换吗？', '更换供应商', { confirmButtonText: '确定', cancelButtonText: '取消' })
    } catch {
      return
    }
  }
  f.sid = v
  f.lines.forEach(l => l.pid && 带出单价(l))
  改了()
}
function 检查日期() {
  const f = 表单.value
  错误.value.eta = f.eta && f.date && f.eta < f.date ? '期望到货日期不能早于下单日期' : ''
  改了()
}
function 检查备注() {
  错误.value.remark = (表单.value.remark || '').length > 200 ? '备注最多 200 字' : ''
  改了()
}

/* ---------- 商品明细 ---------- */
/** 某一行可选的商品：只列启用的，且本单其他行没选过；已停用但已在单里的保留显示 */
function 可选商品(当前) {
  const 已选 = 表单.value.lines.map(l => l.pid).filter(p => p && p !== 当前)
  const 列表 = 基础.value.商品.filter(p => p.enabled && !已选.includes(p.id)).map(p => ({ id: p.id, label: p.name }))
  const 当前商品 = 商品(当前)
  if (当前商品 && !当前商品.enabled) 列表.unshift({ id: 当前商品.id, label: 当前商品.name + '（已停用）' })
  return 列表
}
/** 带出单价：有上次进价用上次进价，没有用参考进价 */
function 带出单价(l) {
  const 上次 = 表单.value.sid ? 基础.value.上次进价[`${表单.value.sid}|${l.pid}`] : undefined
  l.last = 上次 === undefined ? null : 上次
  l.price = (l.last != null ? l.last : 商品(l.pid).ref).toFixed(2)
}
function 加一行() {
  表单.value.lines.push({ pid: '', qty: '', price: '', inQty: 0, last: null, key: ++行序号 })
  delete 错误.value.lines
  改了()
}
function 删一行(i) {
  表单.value.lines.splice(i, 1)
  错误.value = {}
  改了()
}
function 选商品(l, v) {
  l.pid = v
  if (v) 带出单价(l)
  else Object.assign(l, { price: '', last: null })
  改了()
}
function 检查行(i, 字段) {
  const l = 表单.value.lines[i]
  l[字段] = String(l[字段]).trim()
  const r = 行格式错误(l)
  错误.value['l' + i] = { ...(错误.value['l' + i] || {}), [字段]: r[字段] || '' }
  改了()
}
const 行错误 = (i, 字段) => 错误.value['l' + i]?.[字段] || ''
const 行样式 = ({ row }) => (是否涨价(row) ? 'rise-row' : '')

/* ---------- 保存 / 提交 ---------- */
function 滚到第一个错误() {
  setTimeout(() => document.querySelector('.is-error, .el-alert--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30)
}
/** 去掉页面用的行序号，得到要存的数据 */
function 要保存的数据() {
  const f = clone(表单.value)
  f.lines.forEach(l => delete l.key)
  return f
}
async function 防重复(做事) {
  if (处理中.value) return
  处理中.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    await 做事()
  } finally {
    处理中.value = false
  }
}

async function 保存草稿() {
  错误.value = 格式校验(表单.value)
  顶部错误.value = ''
  if (Object.keys(错误.value).length) return 滚到第一个错误()
  await 防重复(async () => {
    const o = await 服务.保存草稿(要保存的数据())
    有修改.value = false
    ElMessage.success('已保存草稿')
    router.push(`/purchase/cgdd/${o.no}`)
  })
}

async function 提交审核() {
  const f = 表单.value
  错误.value = 全量校验(f)
  顶部错误.value = ''
  if (Object.keys(错误.value).length) return 滚到第一个错误()
  if (!供应商(f.sid)?.enabled) {
    顶部错误.value = '供应商已停用，请更换'
    return 滚到第一个错误()
  }
  const 停用商品 = f.lines.map(l => 商品(l.pid)).filter(p => !p.enabled)
  if (停用商品.length) {
    顶部错误.value = 停用商品.map(p => `商品"${p.name}"已停用，请更换`).join('；')
    return 滚到第一个错误()
  }
  const 涨价行 = f.lines.filter(是否涨价)
  if (涨价行.length) {
    const 明细 = 涨价行.map(l => `<li>${商品(l.pid).name}（上次 ¥${money(l.last)}，本次 ¥${money(l.price)}）</li>`).join('')
    try {
      await ElMessageBox.confirm(`以下商品单价比上次进价高 5% 以上：<ul>${明细}</ul>确定继续提交吗？`, '涨价提醒', {
        confirmButtonText: '继续提交', cancelButtonText: '返回修改', dangerouslyUseHTMLString: true, type: 'warning'
      })
    } catch {
      return
    }
  }
  await 防重复(async () => {
    const o = await 服务.提交审核(要保存的数据(), store.me, store.角色表)
    有修改.value = false
    ElMessage.success('已提交审核，审核层级：' + o.level)
    router.push(`/purchase/cgdd/${o.no}`)
  })
}
</script>

<template>
  <template v-if="就绪 && 表单">
    <div class="crumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>采购管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="'/purchase/cgdd'">采购订单</el-breadcrumb-item>
        <el-breadcrumb-item>{{ 是编辑 ? '编辑：' + 表单.no : '新建' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <span v-anno="角标.F7" class="pageflag">本页规则</span>
    </div>

    <el-alert v-if="顶部错误" :title="顶部错误" type="error" :closable="false" show-icon class="bar" />
    <!-- F1 驳回提示条 -->
    <div v-if="是编辑 && 表单.rejectReason" v-anno="角标.F1" class="bar">
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>上次被驳回：{{ 表单.rejectReason }}<span class="muted">（{{ 表单.auditor }}，{{ 表单.auditTime }}）</span></template>
      </el-alert>
    </div>

    <!-- F2 基本信息 -->
    <el-card v-anno="角标.F2" shadow="never">
      <h3 class="card-title">基本信息</h3>
      <el-form label-position="top" class="grid">
        <el-form-item label="供应商" required :error="错误.sid">
          <el-select id="fSid" :model-value="表单.sid" :placeholder="启用供应商.length ? '请选择供应商' : '没有可选的供应商'" @update:model-value="换供应商">
            <el-option v-if="表单.sid && !供应商(表单.sid)?.enabled" :value="表单.sid" :label="供应商(表单.sid)?.name + '（已停用）'" />
            <el-option v-for="s in 启用供应商" :key="s.id" :value="s.id" :label="s.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期" required :error="错误.date">
          <el-date-picker id="fDate" v-model="表单.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="检查日期" />
        </el-form-item>
        <el-form-item label="期望到货日期" required :error="错误.eta">
          <el-date-picker id="fEta" v-model="表单.eta" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="检查日期" />
        </el-form-item>
        <el-form-item label="仓库" required>
          <el-select id="fWh" v-model="表单.wh" @change="改了">
            <el-option v-for="w in 基础.仓库" :key="w.name" :value="w.name" :label="w.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" class="wide" :error="错误.remark">
          <el-input id="fRemark" v-model="表单.remark" type="textarea" :rows="2" placeholder="0～200 字" @change="检查备注" />
        </el-form-item>
        <el-form-item v-if="是编辑" label="采购订单号">
          <span>{{ 表单.no }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- F3 商品明细 -->
    <el-card v-anno="角标.F3" shadow="never">
      <h3 class="card-title">商品明细<el-button id="addLine" icon="Plus" style="margin-left: auto" @click="加一行">添加商品</el-button></h3>
      <div v-if="错误.lines" class="field-err" style="margin-bottom: 8px">{{ 错误.lines }}</div>
      <el-table :data="表单.lines" row-key="key" :row-class-name="行样式" empty-text="请添加商品" class="lines">
        <el-table-column label="商品名称" min-width="180">
          <template #default="{ row, $index }">
            <el-form-item :error="行错误($index, 'pid')" class="cell">
              <el-select class="lpid" :model-value="row.pid" :placeholder="可选商品(row.pid).length ? '请选择商品' : '没有可选的商品'" @update:model-value="v => 选商品(row, v)">
                <el-option v-for="p in 可选商品(row.pid)" :key="p.id" :value="p.id" :label="p.label" />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="商品编码" width="100"><template #default="{ row }">{{ 商品(row.pid)?.code || '-' }}</template></el-table-column>
        <el-table-column label="规格" width="110"><template #default="{ row }">{{ 商品(row.pid)?.spec || '-' }}</template></el-table-column>
        <el-table-column label="单位" width="60"><template #default="{ row }">{{ 商品(row.pid)?.unit || '-' }}</template></el-table-column>
        <el-table-column label="上次进价" align="right" width="100"><template #default="{ row }">{{ row.last != null ? money(row.last) : '-' }}</template></el-table-column>
        <el-table-column width="190">
          <template #header><span v-anno="角标.F4">采购单价</span></template>
          <template #default="{ row, $index }">
            <el-form-item :error="行错误($index, 'price')" class="cell">
              <div class="price-cell">
                <el-input v-model="row.price" class="lprice" style="width: 100px" @change="检查行($index, 'price')" />
                <span v-if="是否涨价(row)" class="rise">涨价</span>
              </div>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="采购数量" width="150">
          <template #default="{ row, $index }">
            <el-form-item :error="行错误($index, 'qty')" class="cell">
              <el-input v-model="row.qty" class="lqty" style="width: 90px" @change="检查行($index, 'qty')" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="金额" align="right" width="110"><template #default="{ row }">{{ money(行金额(row)) }}</template></el-table-column>
        <el-table-column label="操作" width="70">
          <template #default="{ $index }"><el-link type="danger" underline="never" class="rm" @click="删一行($index)">删除</el-link></template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- F5 金额汇总与审核层级 -->
    <el-card v-anno="角标.F5" shadow="never">
      <div class="sum">
        <span>商品种类数：<b>{{ 表单.lines.length }}</b></span>
        <span>采购总数量：<b>{{ 总数量(表单) }}</b></span>
        <span>订单金额合计：<b>¥{{ money(合计金额(表单)) }}</b></span>
        <span>审核层级：<b>{{ 层级 }}</b> <span class="hint">超过 20000 元或创建人为采购组长时由老板审核</span></span>
      </div>
    </el-card>

    <!-- F6 底部按钮 -->
    <FooterBar v-anno="角标.F6">
      <el-button id="fCancel" @click="取消">取消</el-button>
      <el-button id="fSave" :disabled="处理中" @click="保存草稿">保存草稿</el-button>
      <el-button id="fSubmit" type="primary" :disabled="处理中" :loading="处理中" @click="提交审核">提交审核</el-button>
    </FooterBar>
  </template>
</template>

<style scoped>
.bar { margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 24px; }
.grid .wide { grid-column: span 2; }
.grid :deep(.el-select) { width: 100%; }
.lines .cell { margin-bottom: 0; }
.lines :deep(.el-form-item__error) { position: static; }
.price-cell { display: flex; align-items: center; }
</style>
