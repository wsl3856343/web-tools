<template>
  <el-container class="main-layout">
    <el-aside width="220px">
      <a href="https://www.acteasy.cn/json-formatter" target="_blank" class="app-title-link">
        <div class="app-title">
          <div class="logo">
            <div class="logo-shape shape1"></div>
            <div class="logo-shape shape2"></div>
          </div>
          <span>Web Tools</span>
        </div>
      </a>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        router
      >
        <el-menu-item index="/json-formatter">
          <span>JSON 格式化</span>
        </el-menu-item>
        <el-menu-item index="/base64-converter">
          <span>Base64 编码/解码</span>
        </el-menu-item>
        <el-menu-item index="/uuid-generator">
          <span>UUID 生成器</span>
        </el-menu-item>
        <el-menu-item index="/url-encoder">
          <span>URL 编码/解码</span>
        </el-menu-item>
        <el-menu-item index="/code-diff">
          <span>代码比对</span>
        </el-menu-item>
        <el-menu-item index="/jwt-parser">
          <span>JWT 解析</span>
        </el-menu-item>
        <el-menu-item index="/air-share">
          <span>隔空传送</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <div class="main-content-wrapper">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app-title-link {
  text-decoration: none; /* 移除 a 标签的下划线 */
  color: inherit; /* 继承父元素的颜色 */
  display: block; /* 使 a 标签表现为块级元素 */
  transition: background-color 0.3s;
}

.app-title-link:hover {
  background-color: rgba(0, 0, 0, 0.04); /* 添加一个轻微的悬停背景效果 */
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 64px;
  padding: 0 var(--spacing-medium);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.logo {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-shape {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  transition: transform 0.3s ease-out;
}

.logo:hover .shape1 {
  transform: rotate(60deg) scale(1.1);
}
.logo:hover .shape2 {
  transform: rotate(-30deg) scale(1.1);
}

.logo-shape.shape1 {
  background-color: #a0cfff;
  transform: rotate(45deg);
}

.logo-shape.shape2 {
  background-color: var(--color-primary);
  transform: rotate(-15deg);
}

.el-aside {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-level-1);
  border-right: none;
  transition: box-shadow 0.3s ease-in-out;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  height: 48px;
  line-height: 48px;
  color: var(--color-text-secondary);
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.08);
}

.el-menu-item.is-active {
  color: var(--color-primary);
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.12);
}

.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 4px;
  background-color: var(--color-primary);
  border-radius: 0 4px 4px 0;
}

.el-main {
  padding: var(--spacing-medium);
  background-color: var(--color-background);
  overflow-y: auto; /* 确保主内容区在需要时可以滚动 */
}

.main-content-wrapper {
  width: 100%;
  max-width: 1600px; /* 为内容设定一个舒适的最大宽度 */
  margin: 0 auto;   /* 使内容在超宽屏上水平居中 */
}
</style>