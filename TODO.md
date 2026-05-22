# CQUFICweb 优化 Todo

## 移动端核心体验

- [x] **图片转 WebP + 响应式 srcset**
  - [x] 将 4 张校区地图图片（共 5.2 MB）转为 WebP 格式
  - [x] 各生成 960px / 1920px 两档分辨率
  - [x] 用 `<picture>` + `srcset` 按屏幕宽度按需加载

- [x] **安全区适配补全**
  - [x] 所有页面 viewport meta 添加 `viewport-fit=cover`
  - [x] `index.html` 固定顶部元素补充 `env(safe-area-inset-top)`
  - [x] `admission-process.html` 同上处理

- [x] **PWA 支持**
  - [x] 创建 `manifest.json`（名称、图标、主题色、display: standalone）
  - [x] 编写 Service Worker，缓存静态资源与大图片
  - [x] `index.html` 注册 Service Worker

## 交互与渲染优化

- [x] **地图页移动端优化**
  - [x] 横屏模式下底部卡片区高度自适应（当前遮挡地图过多）
  - [x] 检测 `prefers-reduced-motion`，降低 `flyTo` 动画复杂度
  - [x] 虎溪校区密集点位添加 Mapbox 聚合（cluster）逻辑

- [x] **Glassmorphism 性能降级**
  - [x] `@media (prefers-reduced-motion: reduce)` 下将 backdrop-filter blur 从 48px 降至 12px
  - [x] 同条件下移除多层 inset shadow，改用单层简化阴影

- [x] **Font Awesome 本地化**
  - [x] 将 FA 图标库下载到本地，移除 cdnjs CDN 依赖
  - [x] 或改用 subset 只保留项目实际用到的图标

## 细节打磨

- [x] **info-detail.html 窄屏优化**
  - [x] 步骤/FAQ 内容区在窄屏下超长字段改为折叠展示
  - [x] 确认面包屑导航横向溢出时 `-webkit-overflow-scrolling: touch` 生效

- [x] **触摸目标一致性**
  - [x] 全局审查所有可点击元素，统一 `min-height: 44px`

- [x] **元信息补全**
  - [x] 各页面添加 `<meta name="description">`
  - [x] 各页面添加 `<meta name="theme-color">`
  - [x] 添加 Open Graph 标签（微信/QQ 分享预览）
