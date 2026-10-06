# 评审PRD 截图：从打包后的原型（dist/index.html）截 20 张整页图，每张用红色虚线框出一个角标区域
# 先执行 npm run build，再运行：/tmp/pwenv/bin/python 评审PRD截图.py
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from playwright.sync_api import sync_playwright
from 公共 import 页面, URL, CHROME, ROOT

OUT = ROOT + '03-产品设计/采购管理/采购订单/images/'
BOX = """(id)=>{document.querySelectorAll('.capbox').forEach(e=>e.remove());const el=document.querySelector('[data-anno="'+id+'"]');const r=el.getBoundingClientRect();const d=document.createElement('div');d.className='capbox';
d.style.cssText='position:absolute;z-index:99999;pointer-events:none;border:3px dashed #ff0000;left:'+(r.left+scrollX-6)+'px;top:'+(r.top+scrollY-6)+'px;width:'+(r.width+12)+'px;height:'+(r.height+12)+'px';document.body.appendChild(d);}"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    P = 页面(pg)
    pg.goto(URL); P.等(1200)
    P.重置演示数据()  # 从初始演示数据开始截图

    def shot(name, ids, full=True):
        pg.evaluate('document.querySelectorAll("*").forEach(e => e.scrollTop = 0); window.scrollTo(0, 0)'); P.等(150)  # 先回到页面顶部
        for i in ids:
            pg.evaluate(BOX, i); P.等(80)
            pg.screenshot(path=OUT + name + '-' + i + '.png', full_page=full)
        pg.evaluate("document.querySelectorAll('.capbox').forEach(e=>e.remove())")

    P.去('/purchase/cgdd'); P.等(300)
    shot('列表页', ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'])
    P.去('/purchase/cgdd/new')
    P.选('.el-select:has(#fSid)', '杭州优果'); pg.click('#addLine'); P.等(150)
    P.选('.lpid >> nth=0', '原味薯片'); P.填('.lqty input >> nth=0', '100')
    pg.click('#addLine'); P.等(150)
    P.选('.lpid >> nth=1', '每日坚果'); P.填('.lprice input >> nth=1', '125'); P.填('.lqty input >> nth=1', '80')
    pg.mouse.move(0, 0); P.等(200)
    shot('新增编辑页', ['F2', 'F3', 'F4', 'F5', 'F6', 'F7'], full=False)
    P.去('/purchase/cgdd')
    if P.有确认框(): P.确认()
    P.去('/purchase/cgdd/CGDD-20261011-0001/edit')
    shot('新增编辑页', ['F1'], full=False)
    P.去('/purchase/cgdd/CGDD-20261008-0001')
    shot('详情页', ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'])
    P.点按钮('关闭'); P.等(400)
    shot('详情页', ['D7'], full=False)
    b.close()
print('截图完成')
