# CQUFICweb 优化 Todo

## 移动端核心体验

- [ ] **图片转 WebP + 响应式 srcset**
  - [ ] 将 4 张校区地图图片（共 5.2 MB）转为 WebP 格式
  - [ ] 各生成 960px / 1920px 两档分辨率
  - [ ] 用 `<picture>` + `srcset` 按屏幕宽度按需加载

- [ ] **安全区适配补全**
  - [ ] 所有页面 viewport meta 添加 `viewport-fit=cover`
  - [ ] `index.html` 固定顶部元素补充 `env(safe-area-inset-top)`
  - [ ] `admission-process.html` 同上处理

- [ ] **PWA 支持**
  - [ ] 创建 `manifest.json`（名称、图标、主题色、display: standalone）
  - [ ] 编写 Service Worker，缓存静态资源与大图片
  - [ ] `index.html` 注册 Service Worker

## 交互与渲染优化

- [ ] **地图页移动端优化**
  - [ ] 横屏模式下底部卡片区高度自适应（当前遮挡地图过多）
  - [ ] 检测 `prefers-reduced-motion`，降低 `flyTo` 动画复杂度
  - [ ] 虎溪校区密集点位添加 Mapbox 聚合（cluster）逻辑

- [ ] **Glassmorphism 性能降级**
  - [ ] `@media (prefers-reduced-motion: reduce)` 下将 backdrop-filter blur 从 48px 降至 12px
  - [ ] 同条件下移除多层 inset shadow，改用单层简化阴影

- [ ] **Font Awesome 本地化**
  - [ ] 将 FA 图标库下载到本地，移除 cdnjs CDN 依赖
  - [ ] 或改用 subset 只保留项目实际用到的图标

## 细节打磨

- [ ] **info-detail.html 窄屏优化**
  - [ ] 步骤/FAQ 内容区在窄屏下超长字段改为折叠展示
  - [ ] 确认面包屑导航横向溢出时 `-webkit-overflow-scrolling: touch` 生效

- [ ] **触摸目标一致性**
  - [ ] 全局审查所有可点击元素，统一 `min-height: 44px`

- [ ] **元信息补全**
  - [ ] 各页面添加 `<meta name="description">`
  - [ ] 各页面添加 `<meta name="theme-color">`
  - [ ] 添加 Open Graph 标签（微信/QQ 分享预览）
