import csv,re,sys,glob,os
sys.path.insert(0,'/tmp')
R='/workspace/shared/SC-JXC-课件/SC-JXC/'
D=R+'03-产品设计/采购管理/采购订单/'
rows=list(csv.DictReader(open(D+'采购订单-字段清单-详细稿.tsv'),delimiter='\t'))
F={r['字段名称'] for r in rows}
draft={l.split('\t')[1] for l in open(D+'采购订单-字段清单-初稿.tsv').read().strip().split('\n')[1:]}
issues=[]
def chk(name,cond,detail=''):
    print(('OK  ' if cond else 'FAIL'),name,detail if not cond else '')
    if not cond: issues.append((name,detail))
chk('初稿与详细稿字段一致',draft==F,str(draft^F))
prd=open(D+'采购订单-主PRD.md').read()
pf=set(re.findall(r'《([^》]+)》',prd))-{'采购订单-字段清单-详细稿'}
chk('主PRD 引用字段 ⊆ 详细稿',pf<=F,str(pf-F))
demos={k:open(D+f'采购订单_Demo_{k}.md').read() for k in ['列表页','新增编辑页','详情页']}
for k,t in demos.items():
    df=set(re.findall(r'《([^》]+)》',t))
    chk(f'Demo {k} 引用字段 ⊆ 详细稿',df<=F,str(df-F))
# 状态
st_tsv=[x.strip() for x in [r for r in rows if r['字段名称']=='订单状态'][0]['取值说明'].split('；')[0].split('/')]
# 原型源码：Vue 工程里采购订单相关文件 + 公共组件
SRC=R+'99-产品原型/前端工程/src/'
VIEW=SRC+'views/采购/采购订单/'
src_files=[f for f in glob.glob(SRC+'**/*',recursive=True) if f.endswith(('.vue','.js'))]
html='\n'.join(open(f).read() for f in src_files)
rules=open(VIEW+'rules.js').read()
st_html=[x.strip().strip("'") for x in re.search(r"export const 状态列表 = \[(.*?)\]",rules).group(1).split(',')]
chk('状态：详细稿 = 原型',st_tsv==st_html,f'{st_tsv} vs {st_html}')
chk('状态：主PRD 状态矩阵列 = 详细稿', '| 动作 \\ 状态 | '+' | '.join(st_tsv)+' |' in prd)
# 角标
anc_demo=set()
for t in demos.values(): anc_demo|=set(re.findall(r'\| \d+ \| ([LFD]\d) \|',t))
anno_js=open(VIEW+'anno.js').read()
anc_def=set(re.findall(r"^  ([LFD]\d): '",anno_js,re.M))
pages=''.join(open(f).read() for f in glob.glob(VIEW+'*/index.vue'))
anc_html=set(re.findall(r'角标\.([LFD]\d)',pages))
chk('角标：anno.js 定义 = 页面实际使用',anc_def==anc_html,str(anc_def^anc_html))
anc_anno=set()
import glob
for f in glob.glob(R+'99-产品原型/标注/*.md'): anc_anno|=set(re.findall(r'## 角标 ([LFD]\d)',open(f).read()))
rev=open(D+'采购订单-评审PRD.md').read()
func=re.findall(r'^\| (\d+) \| 采购订单列表-|^\| (\d+) \| 新建/编辑采购订单-|^\| (\d+) \| 采购订单详情-',rev,re.M)
chk('角标：Demo PRD = 原型',anc_demo==anc_html,str(anc_demo^anc_html))
chk('角标：原型 = 标注',anc_html==anc_anno,str(anc_html^anc_anno))
chk('评审PRD 功能条数 = 角标数',len(func)==len(anc_anno)==20,f'{len(func)} / {len(anc_anno)}')
imgs=re.findall(r'\(\./images/([^)]+)\)',rev)
import os
chk('评审PRD 截图都存在',all(os.path.exists(D+'images/'+i) for i in imgs) and len(imgs)==20,str(len(imgs)))
# 评审PRD 字段
rf=set(re.findall(r'^\| ([^|]+?) \| (?:文本|长文本|整数|金额|日期|日期时间|单选|关联选择|标记|文本列表) \|',rev,re.M))
chk('评审PRD 字段 ⊆ 详细稿',rf<=F,str(rf-F))
chk('评审PRD 无英文/内部词',not re.search(r'TSV|主PRD|详细稿|权威|Demo',rev.split('-->',1)[1]))
# 原型可见字段标签
from playwright.sync_api import sync_playwright
URL='file://'+R+'99-产品原型/前端工程/dist/index.html'
labels=set()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox']);pg=b.new_page()
    pg.goto(URL);pg.wait_for_timeout(1200)
    for h in ['#/purchase/cgdd','#/purchase/cgdd/CGDD-20261011-0001/edit','#/purchase/cgdd/CGDD-20261008-0001']:
        pg.goto(URL+h);pg.wait_for_timeout(500)
        labels|=set(x.strip() for x in pg.locator('.main .el-table__header th, .main .el-form-item__label, .main .el-descriptions__label').all_inner_texts())
        labels|=set(x.split('：')[0] for x in pg.locator('.sum > span').all_inner_texts())
    b.close()
labels={l for l in labels if l and '：' not in l and not l.startswith('超过 20000')}
allowed={'操作','入库单号','入库单状态','执行时间','操作人','时间','原因',''}
extra=labels-F-allowed
chk('原型字段标签 ⊆ 详细稿（关联入库单、操作记录的子项除外）',not extra,str(extra))
lst={r['字段名称'] for r in rows if r['列表展示']=='是'}
chk('列表列 = 详细稿"列表展示=是"',lst<=labels,str(lst-labels))
flt={r['字段名称'] for r in rows if r['可筛选']=='是'}-{'订单状态'}
chk('查询区 = 详细稿"可筛选=是"（状态用页签）',flt=={'采购订单号','供应商','下单日期','审核层级','创建人'},str(flt))
# 文案：逐条核对 Demo PRD 中写明的提示文案
MSGS=['结束日期不能早于开始日期','暂无采购订单','确定删除这张草稿吗？删除后不能恢复。','已删除','请选择供应商','请选择期望到货日期','期望到货日期不能早于下单日期','请至少添加 1 个商品','请选择商品','请输入大于 0 的整数','请输入大于等于 0 的金额，最多两位小数','备注最多 200 字','供应商已停用，请更换','已停用，请更换','以下商品单价比上次进价高 5% 以上','确定继续提交吗？','返回修改','继续提交','更换供应商后，各行单价将按新供应商重新带出，确定更换吗？','有未保存的修改，确定离开吗？','已保存草稿','已提交审核，审核层级：','没有可选的供应商','没有可选的商品','当前不可编辑','请添加商品','本单由【','审核通过后自动生成','暂无操作记录','驳回采购订单','作废采购订单','关闭采购订单','作废后，待执行的入库单将自动取消。','关闭后，剩余未入库数量不再收货，待执行的入库单将自动取消。','确定撤回吗？撤回后回到草稿。','已撤回为草稿','确定审核通过吗？','审核通过，已生成采购入库单 ','已驳回','已作废','已关闭','请填写原因','原因最多 200 字','单据状态已变化，请刷新后重试','采购订单不存在或已删除','已有入库记录，不能作废；如剩余不再到货，请使用关闭','超过 20000 元或创建人为采购组长时由老板审核']
alltext=''.join(demos.values())+prd
notdoc=[m for m in MSGS if m.rstrip('：【 ') not in alltext]
miss=[m for m in MSGS if m not in html]
chk('文案清单都出自 Demo PRD / 主PRD',not notdoc,str(notdoc))
chk('文案都在原型中出现',not miss,str(miss))
# 工程约定
bad=[f for f in glob.glob(SRC+'views/**/*',recursive=True) if f.endswith(('.vue','.js')) and re.search(r"from ['\"](dexie|@/mock/db|.*mock/db)['\"]",open(f).read())]
chk('工程约定：页面不直接碰 Dexie / mock/db',not bad,str(bad))
ui=open(R+'07-UI规范库/页面风格约定.md').read()
cmap={'灰':'595959','橙':'d46b08','蓝':'0958d9','青':'08979c','绿':'389e0d','紫':'531dab','红':'cf1322'}
st=open(SRC+'config/status.js').read()
pairs=re.findall(r'(草稿|待审核|已审核|部分完成|已完成|已关闭|已作废)-(.)',ui)
colors=dict(re.findall(r"const (.) = \{ color: '#(\w+)'",st))
mapped=dict(re.findall(r"^  (草稿|待审核|已审核|部分完成|已完成|已关闭|已作废): (.),",st,re.M))
chk('状态颜色 = 07-UI规范库',len(pairs)==7 and all(mapped.get(k)==v and colors.get(v)==cmap[v] for k,v in pairs),str(pairs))
print('ISSUES',len(issues))
