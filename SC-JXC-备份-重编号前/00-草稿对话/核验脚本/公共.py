# 验收脚本公用的小工具：打开打包后的原型（dist/index.html，和双击打开一样），操作 Element Plus 控件
# 运行环境：/tmp/pwenv 里的 playwright；浏览器 /usr/bin/google-chrome
import os
ROOT = '/workspace/shared/SC-JXC-课件/SC-JXC/'
DIST = ROOT + '99-产品原型/前端工程/dist/index.html'
URL = 'file://' + DIST
CHROME = '/usr/bin/google-chrome'
W = 350  # 每步等待毫秒数（数据存在浏览器本地数据库里，读写是异步的）

class 页面:
    def __init__(self, pg):
        self.pg = pg
    def 去(self, 路径):
        self.pg.goto(URL + '#' + 路径); self.pg.wait_for_timeout(W)
    def 等(self, ms=W):
        self.pg.wait_for_timeout(ms)
    def 下拉选项(self, 选择器):
        """打开下拉框，返回可见选项文字，再关上"""
        self.pg.locator(选择器).click(); self.等(200)
        t = self.pg.locator('.el-select-dropdown__item:visible').all_inner_texts()
        self.pg.keyboard.press('Escape'); self.等(150)
        return [x.strip() for x in t]
    def 选(self, 选择器, 文字):
        self.pg.locator(选择器).click(); self.等(200)
        self.pg.locator('.el-select-dropdown__item:visible', has_text=文字).first.click(); self.等(250)
    def 填(self, 选择器, 值):
        el = self.pg.locator(选择器)
        el.fill(值); el.dispatch_event('change'); self.等(150)
    def 填日期(self, 选择器, 值):
        el = self.pg.locator(选择器)
        el.click(); el.fill(值); el.press('Enter'); self.等(150)
        self.pg.locator('.crumb').click(); self.等(150)
    def 身份(self, 文字):
        self.选('.el-select:has(#userSel)', 文字); self.等()
    def 确认框文字(self):
        return self.pg.locator('.el-message-box').inner_text() if self.pg.locator('.el-message-box:visible').count() else ''
    def 确认(self):
        self.pg.locator('.el-message-box:visible .el-message-box__btns button').last.click(); self.等(500)
    def 有确认框(self):
        return self.pg.locator('.el-message-box:visible').count() > 0
    def 按钮(self):
        return [x.strip() for x in self.pg.locator('.ops button').all_inner_texts()]
    def 点按钮(self, 文字):
        self.pg.locator('.ops button', has_text=文字).first.click(); self.等(300)
    def 文字(self, 选择器='.main'):
        return self.pg.locator(选择器).first.inner_text()
    def 重置演示数据(self):
        self.去('/purchase/cgdd')
        self.pg.click('#btnReset'); self.等(300); self.确认()
        self.pg.wait_for_load_state(); self.等(800)
