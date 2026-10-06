<!-- 底部固定按钮栏：新增编辑页用（07-UI规范库：底部固定"保存草稿 / 提交审核 / 取消"）。按钮由页面放进来 -->
<template>
  <div class="footer-bar">
    <slot />
  </div>
</template>

<style scoped>
.footer-bar {
  position: fixed !important;
  left: 200px; /* 左侧菜单宽度 */
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
