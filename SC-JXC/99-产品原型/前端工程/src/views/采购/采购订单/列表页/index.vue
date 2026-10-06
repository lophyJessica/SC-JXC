<!-- 采购订单列表页：依据《采购订单_Demo_列表页》。角标 L1～L6 -->
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QueryBar from '@/components/QueryBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useDemoStore } from '@/stores/demo'
import { 查供应商 } from '@/mock/repos/基础资料'
import { money } from '@/utils/format'
import { 角标 } from '../anno'
import { 状态列表, 能否, 合计金额, 审核层级 } from '../rules'
import * as 服务 from '../service'

const router = useRouter()
const store = useDemoStore()

const 订单 = ref([])
const 供应商 = ref([])
const 当前页签 = ref('全部')
const 页码 = ref(1)
const 每页 = 10
const 空条件 = () => ({ no: '', sid: '', from: '', to: '', level: '', creator: '' })
const 输入 = reactive(空条件()) // 查询区里正在填的
const 条件 = ref(空条件()) // 点"查询"后生效的
const 查询错误 = ref('')

async function 加载() {
  ;[订单.value, 供应商.value] = await Promise.all([服务.查全部(), 查供应商()])
}
onMounted(加载)

const 供应商名 = id => 供应商.value.find(s => s.id === id) || { name: '-', enabled: true }
const 层级 = o => 审核层级(o, store.角色表)
const 能 = (动作, o) => 能否(动作, o, store.me)
const 创建人选项 = computed(() => [...new Set(订单.value.map(o => o.creator))])

/** 按查询条件过滤（不含页签），按创建时间倒序 */
const 查询结果 = computed(() => {
  const q = 条件.value
  return 订单.value
    .filter(o =>
      (!q.no || o.no.includes(q.no.trim())) &&
      (!q.sid || o.sid === q.sid) &&
      (!q.from || o.date >= q.from) &&
      (!q.to || o.date <= q.to) &&
      (!q.level || 层级(o) === q.level) &&
      (!q.creator || o.creator === q.creator)
    )
    .sort((a, b) => b.created.localeCompare(a.created))
})
const 页签数 = 状态 => (状态 === '全部' ? 查询结果.value.length : 查询结果.value.filter(o => o.status === 状态).length)
const 表格数据 = computed(() => 查询结果.value.filter(o => 当前页签.value === '全部' || o.status === 当前页签.value))
const 本页数据 = computed(() => 表格数据.value.slice((页码.value - 1) * 每页, 页码.value * 每页))

function 查询() {
  if (输入.from && 输入.to && 输入.to < 输入.from) return (查询错误.value = '结束日期不能早于开始日期')
  查询错误.value = ''
  条件.value = { ...输入 }
  页码.value = 1
}
function 重置() {
  Object.assign(输入, 空条件())
  查询错误.value = ''
  条件.value = 空条件()
  页码.value = 1
}
function 切页签(t) {
  当前页签.value = t
  页码.value = 1
}

const 去详情 = no => router.push(`/purchase/cgdd/${no}`)
const 去编辑 = no => router.push(`/purchase/cgdd/${no}/edit`)

async function 删除(no) {
  try {
    await ElMessageBox.confirm('确定删除这张草稿吗？删除后不能恢复。', '删除草稿', {
      confirmButtonText: '删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger', type: 'warning'
    })
  } catch {
    return
  }
  try {
    await 服务.删除(no, store.me)
    ElMessage.success('已删除')
  } catch (e) {
    ElMessage.error(e.message)
  }
  await 加载()
}
</script>

<template>
  <div class="crumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>采购管理</el-breadcrumb-item>
      <el-breadcrumb-item>采购订单</el-breadcrumb-item>
    </el-breadcrumb>
    <span v-anno="角标.L6" class="pageflag">本页规则</span>
  </div>

  <!-- L1 状态页签 -->
  <el-card shadow="never">
    <div v-anno="角标.L1" class="tabs">
      <span v-for="t in ['全部', ...状态列表]" :key="t" :class="{ on: 当前页签 === t }" :data-tab="t" @click="切页签(t)">
        {{ t }}<em>{{ 页签数(t) }}</em>
      </span>
    </div>
  </el-card>

  <!-- L2 查询区 -->
  <QueryBar v-anno="角标.L2" :error="查询错误" @search="查询" @reset="重置">
    <el-form-item label="采购订单号">
      <el-input id="qNo" v-model="输入.no" placeholder="支持模糊查询" clearable style="width: 180px" />
    </el-form-item>
    <el-form-item label="供应商">
      <el-select id="qSid" v-model="输入.sid" placeholder="全部" clearable style="width: 220px">
        <el-option v-for="s in 供应商" :key="s.id" :value="s.id" :label="s.name + (s.enabled ? '' : '（已停用）')" />
      </el-select>
    </el-form-item>
    <el-form-item label="下单日期">
      <el-date-picker id="qFrom" v-model="输入.from" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" style="width: 140px" />
      <span style="margin: 0 6px">~</span>
      <el-date-picker id="qTo" v-model="输入.to" type="date" value-format="YYYY-MM-DD" placeholder="结束日期" style="width: 140px" />
    </el-form-item>
    <el-form-item label="审核层级">
      <el-select id="qLevel" v-model="输入.level" placeholder="全部" clearable style="width: 120px">
        <el-option value="采购组长" label="采购组长" />
        <el-option value="老板" label="老板" />
      </el-select>
    </el-form-item>
    <el-form-item label="创建人">
      <el-select id="qCreator" v-model="输入.creator" placeholder="全部" clearable style="width: 110px">
        <el-option v-for="c in 创建人选项" :key="c" :value="c" :label="c" />
      </el-select>
    </el-form-item>
  </QueryBar>

  <el-card shadow="never">
    <!-- L3 新建按钮：老板看不到 -->
    <div class="toolbar">
      <el-button v-if="能('create')" id="btnNew" v-anno="角标.L3" type="primary" icon="Plus" @click="router.push('/purchase/cgdd/new')">新建采购订单</el-button>
      <span v-else v-anno="角标.L3" class="placeholder"></span>
    </div>

    <!-- L4 列表表格 -->
    <div v-anno="角标.L4">
      <el-table :data="本页数据" row-key="no" empty-text="暂无采购订单">
        <el-table-column label="采购订单号" min-width="170">
          <template #default="{ row }"><el-link type="primary" underline="never" @click="去详情(row.no)">{{ row.no }}</el-link></template>
        </el-table-column>
        <el-table-column label="供应商" min-width="200">
          <template #default="{ row }">
            {{ 供应商名(row.sid).name }}<span v-if="!供应商名(row.sid).enabled" class="muted">（已停用）</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="下单日期" width="110" />
        <el-table-column label="期望到货日期" width="120">
          <template #default="{ row }">{{ row.eta || '-' }}</template>
        </el-table-column>
        <el-table-column label="订单金额合计" align="right" width="130">
          <template #default="{ row }">{{ money(合计金额(row)) }}</template>
        </el-table-column>
        <el-table-column label="审核层级" width="100">
          <template #default="{ row }">{{ 层级(row) }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="90" />
        <!-- L5 行操作 -->
        <el-table-column width="150">
          <template #header><span v-anno="角标.L5">操作</span></template>
          <template #default="{ row }">
            <span class="row-ops">
              <el-link type="primary" underline="never" @click="去详情(row.no)">查看</el-link>
              <el-link v-if="能('edit', row)" type="primary" underline="never" @click="去编辑(row.no)">编辑</el-link>
              <el-link v-if="能('delete', row)" type="danger" underline="never" @click="删除(row.no)">删除</el-link>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination v-model:current-page="页码" class="pager" :page-size="每页" :total="表格数据.length" layout="total, prev, pager, next" background />
  </el-card>
</template>

<style scoped>
.tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.tabs span { padding: 6px 14px; border-radius: 4px; cursor: pointer; color: #595959; }
.tabs span.on { background: #e6f4ff; color: #1677ff; font-weight: 600; }
.tabs em { font-style: normal; color: #8c8c8c; margin-left: 4px; font-size: 12px; }
.toolbar { margin-bottom: 12px; min-height: 32px; }
.placeholder { display: inline-block; width: 1px; height: 32px; }
.row-ops { display: inline-flex; gap: 12px; }
.pager { margin-top: 12px; justify-content: flex-end; }
</style>
