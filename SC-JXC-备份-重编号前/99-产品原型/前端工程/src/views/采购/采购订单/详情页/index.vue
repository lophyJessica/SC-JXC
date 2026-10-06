<!-- 采购订单详情页：依据《采购订单_Demo_详情页》。角标 D1～D7 -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '@/components/StatusTag.vue'
import ReasonDialog from '@/components/ReasonDialog.vue'
import { useDemoStore } from '@/stores/demo'
import { 查供应商, 查商品 } from '@/mock/repos/基础资料'
import { money } from '@/utils/format'
import { 角标 } from '../anno'
import { 能否, 行金额, 合计金额, 总数量, 是否涨价, 审核层级 } from '../rules'
import * as 服务 from '../service'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()
const no = route.params.no

const 已加载 = ref(false)
const 订单 = ref(null)
const 供应商表 = ref([])
const 商品表 = ref([])
const 原因弹窗 = ref(null)

async function 加载() {
  ;[订单.value, 供应商表.value, 商品表.value] = await Promise.all([服务.按单号取(no), 查供应商(), 查商品()])
  已加载.value = true
}
onMounted(加载)

const 供应商 = computed(() => 供应商表.value.find(s => s.id === 订单.value?.sid) || { name: '-', enabled: true })
const 商品 = id => 商品表.value.find(p => p.id === id) || { name: '-', code: '-', spec: '-', unit: '-', enabled: true }
const 层级 = computed(() => 审核层级(订单.value, store.角色表))
const 能 = 动作 => 能否(动作, 订单.value, store.me)
const 未入库 = l => l.qty - l.inQty
const 行样式 = ({ row }) => (是否涨价(row) ? 'rise-row' : '')

/** 右上角按钮：按状态和角色显示（主PRD 状态—动作矩阵） */
const 按钮 = computed(() => {
  if (!订单.value) return []
  const 全部 = [
    { 动作: 'edit', 文字: '编辑' },
    { 动作: 'delete', 文字: '删除', 类型: 'danger' },
    { 动作: 'submit', 文字: '提交审核', 类型: 'primary' },
    { 动作: 'withdraw', 文字: '撤回' },
    { 动作: 'approve', 文字: '审核通过', 类型: 'primary' },
    { 动作: 'reject', 文字: '驳回', 类型: 'danger' },
    { 动作: 'void', 文字: '作废', 类型: 'danger' },
    { 动作: 'close', 文字: '关闭', 类型: 'danger' }
  ]
  return [...全部.filter(b => 能(b.动作)), { 动作: 'back', 文字: '返回列表' }]
})

/** 执行一个动作，出错时提示，最后刷新数据 */
async function 执行(做事, 成功提示) {
  try {
    const 结果 = await 做事()
    ElMessage.success(typeof 成功提示 === 'function' ? 成功提示(结果) : 成功提示)
  } catch (e) {
    ElMessage.error(e.message)
  }
  await 加载()
}
async function 确认(内容, 标题, 选项 = {}) {
  try {
    await ElMessageBox.confirm(内容, 标题, { confirmButtonText: '确定', cancelButtonText: '取消', ...选项 })
    return true
  } catch {
    return false
  }
}

async function 点按钮(动作) {
  const me = store.me
  if (动作 === 'back') return router.push('/purchase/cgdd')
  if (动作 === 'edit') return router.push(`/purchase/cgdd/${no}/edit`)
  if (动作 === 'submit') return router.push({ path: `/purchase/cgdd/${no}/edit`, query: { submit: '1' } })
  if (动作 === 'delete') {
    if (!(await 确认('确定删除这张草稿吗？删除后不能恢复。', '删除草稿', { confirmButtonText: '删除', confirmButtonClass: 'el-button--danger', type: 'warning' }))) return
    try {
      await 服务.删除(no, me)
      ElMessage.success('已删除')
      return router.push('/purchase/cgdd')
    } catch (e) {
      ElMessage.error(e.message)
      return 加载()
    }
  }
  if (动作 === 'withdraw') {
    if (await 确认('确定撤回吗？撤回后回到草稿。', '撤回')) await 执行(() => 服务.撤回(no, me), '已撤回为草稿')
    return
  }
  if (动作 === 'approve') {
    if (await 确认('确定审核通过吗？通过后系统将自动生成采购入库单。', '审核通过'))
      await 执行(() => 服务.审核通过(no, me), 入库单号 => '审核通过，已生成采购入库单 ' + 入库单号)
    return
  }
  // 需要填原因的三个动作
  const 原因配置 = {
    reject: { 标题: '驳回采购订单', 说明: '驳回后订单回到草稿，创建人可修改后再次提交。', 危险: false, 做: 服务.驳回, 提示: '已驳回' },
    void: { 标题: '作废采购订单', 说明: '作废后，待执行的入库单将自动取消。', 危险: true, 做: 服务.作废, 提示: '已作废' },
    close: { 标题: '关闭采购订单', 说明: '关闭后，剩余未入库数量不再收货，待执行的入库单将自动取消。', 危险: true, 做: 服务.关闭, 提示: '已关闭' }
  }[动作]
  const 原因 = await 原因弹窗.value.打开(原因配置)
  if (原因) await 执行(() => 原因配置.做(no, me, 原因), 原因配置.提示)
}
</script>

<template>
  <el-card v-if="已加载 && !订单" shadow="never">
    <el-empty description="采购订单不存在或已删除">
      <el-button @click="router.push('/purchase/cgdd')">返回列表</el-button>
    </el-empty>
  </el-card>

  <template v-if="订单">
    <div class="crumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>采购管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="'/purchase/cgdd'">采购订单</el-breadcrumb-item>
        <el-breadcrumb-item>{{ 订单.no }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标题行 + D5 操作按钮 -->
    <el-card shadow="never">
      <div class="head">
        <h2>{{ 订单.no }}</h2>
        <StatusTag :status="订单.status" />
        <div v-anno="角标.D5" class="ops">
          <el-button v-for="b in 按钮" :key="b.动作" :type="b.类型" @click="点按钮(b.动作)">{{ b.文字 }}</el-button>
        </div>
      </div>
    </el-card>

    <!-- D1 基本信息 -->
    <el-card v-anno="角标.D1" shadow="never">
      <h3 class="card-title">基本信息</h3>
      <el-descriptions :column="4" direction="vertical" class="info">
        <el-descriptions-item label="供应商">{{ 供应商.name }}{{ 供应商.enabled ? '' : '（已停用）' }}</el-descriptions-item>
        <el-descriptions-item label="下单日期">{{ 订单.date }}</el-descriptions-item>
        <el-descriptions-item label="期望到货日期">{{ 订单.eta || '-' }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ 订单.wh }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ 订单.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ 订单.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ 订单.created }}</el-descriptions-item>
        <el-descriptions-item label="最后修改时间">{{ 订单.updated }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- D2 审核信息 -->
    <el-card v-anno="角标.D2" shadow="never">
      <h3 class="card-title">审核信息</h3>
      <el-descriptions :column="4" direction="vertical" class="info">
        <el-descriptions-item label="审核层级">{{ 层级 }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ 订单.auditor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ 订单.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因">{{ 订单.rejectReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作废原因">{{ 订单.voidReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关闭原因">{{ 订单.closeReason || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="订单.status === '待审核' && !能('approve')" :title="`本单由【${层级}】审核`" type="info" :closable="false" class="pending" />
    </el-card>

    <!-- D3 商品明细与入库进度 -->
    <el-card v-anno="角标.D3" shadow="never">
      <h3 class="card-title">商品明细</h3>
      <el-table :data="订单.lines" :row-class-name="行样式">
        <el-table-column label="商品名称" min-width="140"><template #default="{ row }">{{ 商品(row.pid).name }}{{ 商品(row.pid).enabled ? '' : '（已停用）' }}</template></el-table-column>
        <el-table-column label="商品编码" width="100"><template #default="{ row }">{{ 商品(row.pid).code }}</template></el-table-column>
        <el-table-column label="规格" width="110"><template #default="{ row }">{{ 商品(row.pid).spec }}</template></el-table-column>
        <el-table-column label="单位" width="60"><template #default="{ row }">{{ 商品(row.pid).unit }}</template></el-table-column>
        <el-table-column label="上次进价" align="right" width="100"><template #default="{ row }">{{ row.last != null ? money(row.last) : '-' }}</template></el-table-column>
        <el-table-column label="采购单价" align="right" width="140">
          <template #default="{ row }">{{ money(row.price) }}<span v-if="是否涨价(row)" class="rise">涨价</span></template>
        </el-table-column>
        <el-table-column prop="qty" label="采购数量" align="right" width="90" />
        <el-table-column label="金额" align="right" width="110"><template #default="{ row }">{{ money(行金额(row)) }}</template></el-table-column>
        <el-table-column prop="inQty" label="已入库数量" align="right" width="100" />
        <el-table-column label="未入库数量" align="right" width="100">
          <template #default="{ row }"><span :class="{ orange: 未入库(row) > 0 }">{{ 未入库(row) }}</span></template>
        </el-table-column>
      </el-table>
      <div class="sum" style="margin-top: 12px">
        <span>商品种类数：<b>{{ 订单.lines.length }}</b></span>
        <span>采购总数量：<b>{{ 总数量(订单) }}</b></span>
        <span>订单金额合计：<b>¥{{ money(合计金额(订单)) }}</b></span>
      </div>
    </el-card>

    <!-- D4 关联入库单 -->
    <el-card v-anno="角标.D4" shadow="never">
      <h3 class="card-title">关联入库单</h3>
      <el-table v-if="订单.receipts.length" :data="订单.receipts">
        <el-table-column prop="no" label="入库单号" />
        <el-table-column label="入库单状态"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
        <el-table-column label="执行时间"><template #default="{ row }">{{ row.time || '-' }}</template></el-table-column>
      </el-table>
      <div v-else class="muted">审核通过后自动生成</div>
    </el-card>

    <!-- D6 操作记录 -->
    <el-card v-anno="角标.D6" shadow="never">
      <h3 class="card-title">操作记录</h3>
      <el-table v-if="订单.logs.length" :data="订单.logs">
        <el-table-column prop="op" label="操作" width="120" />
        <el-table-column prop="by" label="操作人" width="120" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="原因"><template #default="{ row }">{{ row.reason || '-' }}</template></el-table-column>
      </el-table>
      <div v-else class="muted">暂无操作记录</div>
    </el-card>

    <!-- D7 原因弹窗（驳回、作废、关闭） -->
    <ReasonDialog ref="原因弹窗" :anno="角标.D7" />
  </template>
</template>

<style scoped>
.head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.head h2 { margin: 0; font-size: 18px; }
.head .ops { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.head .ops .el-button + .el-button { margin-left: 0; }
.info :deep(.el-descriptions__label) { color: #8c8c8c; }
.info :deep(table) { table-layout: fixed; }
.pending { margin-top: 10px; }
</style>
