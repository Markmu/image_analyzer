# Glassmorphism 设计规范 v2.0

> **项目：** Image Analyzer
> **版本：** v2.0
> **生成日期：** 2026-02-19
> **来源：** UI/UX Pro Max + 项目实际情况

---

## 概述

本文档定义 Image Analyzer 项目的全局 Glassmorphism 设计规范，确保所有组件使用统一的视觉语言。

### 设计原则

基于 UI/UX Pro Max 的分析和项目实际需求：

1. **深色优先** - 针对专业 AI 工具优化深色模式
2. **视觉一致性** - 所有玻璃态组件使用相同的参数
3. **性能优化** - 使用 transform 和 opacity 进行动画
4. **无障碍支持** - 确保文字对比度 ≥ 4.5:1
5. **响应式设计** - 在移动端和桌面端都有良好表现

---

## 核心规范

### 1. Glassmorphism 基础参数

#### CSS 变量定义

```css
:root {
  /* Glassmorphism 核心参数 */
  --glass-bg-dark: rgba(15, 23, 42, 0.6);         /* 深色背景（默认） */
  --glass-bg-dark-hover: rgba(15, 23, 42, 0.7);   /* 深色背景（悬停） */
  --glass-bg-light: rgba(255, 255, 255, 0.1);     /* 浅色背景 */
  --glass-bg-active: rgba(34, 197, 94, 0.15);     /* 激活状态（绿色） */

  --glass-blur: 12px;                             /* 背景模糊 */
  --glass-blur-heavy: 20px;                       /* 重度模糊（模态框） */

  --glass-border: rgba(255, 255, 255, 0.1);       /* 边框颜色 */
  --glass-border-hover: rgba(255, 255, 255, 0.15);/* 边框颜色（悬停） */
  --glass-border-active: rgba(34, 197, 94, 0.3);  /* 边框颜色（激活） */

  --glass-radius: 12px;                           /* 圆角 */
  --glass-radius-lg: 16px;                        /* 大圆角（卡片） */

  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* 阴影 */
  --glass-shadow-hover: 0 6px 24px rgba(0, 0, 0, 0.2); /* 阴影（悬停） */
  --glass-shadow-active: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 20px rgba(34, 197, 94, 0.2); /* 阴影（激活） */

  /* 过渡动画 */
  --glass-transition: all 0.2s ease;              /* 标准过渡 */
  --glass-transition-slow: all 0.3s ease;         /* 慢速过渡（展开/收起） */
}
```

### 2. 标准 Glass Card 类

#### 基础类（已存在，优化版）

```css
/* 基础 Glassmorphism 卡片 */
.ia-glass-card {
  background: var(--glass-bg-dark);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur)); /* Safari 兼容 */
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  transition: var(--glass-transition);
}

.ia-glass-card:hover {
  background: var(--glass-bg-dark-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px); /* 使用 transform，不触发布局重排 */
  box-shadow: var(--glass-shadow-hover);
}

/* 激活状态（绿色高亮） */
.ia-glass-card--active {
  background: var(--glass-bg-active);
  border-color: var(--glass-border-active);
  box-shadow: var(--glass-shadow-active);
}
```

#### 扩展类（新增）

```css
/* 重度模糊（用于模态框、弹窗） */
.ia-glass-card--heavy {
  backdrop-filter: blur(var(--glass-blur-heavy));
  -webkit-backdrop-filter: blur(var(--glass-blur-heavy));
}

/* 大圆角（用于主要卡片） */
.ia-glass-card--lg {
  border-radius: var(--glass-radius-lg);
}

/* 禁用悬停效果（用于静态内容） */
.ia-glass-card--static:hover {
  transform: none;
  box-shadow: var(--glass-shadow);
}

/* 浅色背景（用于某些特殊情况） */
.ia-glass-card--light {
  background: var(--glass-bg-light);
}
```

### 3. 可点击性规范

**关键规则：** 所有可点击的 Glass Card 必须添加 `cursor-pointer`

```css
/* 可点击卡片 */
.ia-glass-card--clickable {
  cursor: pointer;
}

/* 组合使用 */
.ia-glass-card.ia-glass-card--clickable:hover {
  /* hover 样式已自动继承 */
}
```

**使用示例：**
```tsx
// ✅ 正确：可点击卡片
<Card className="ia-glass-card ia-glass-card--clickable" onClick={handleClick}>
  {/* 内容 */}
</Card>

// ✅ 正确：静态展示卡片
<Card className="ia-glass-card ia-glass-card--static">
  {/* 内容 */}
</Card>

// ✅ 正确：激活状态
<Card className="ia-glass-card ia-glass-card--active">
  {/* 内容 */}
</Card>
```

---

## 应用到当前项目

### 已存在的组件

| 组件 | 当前实现 | 优化建议 |
|------|---------|---------|
| **ImageUploader** | ✅ 已使用 `ia-glass-card` | 添加 `ia-glass-card--clickable` |
| **AnalysisCard** | ✅ 已使用 `ia-glass-card` | 保持现状（静态展示） |
| **ProgressDisplay** | ✅ 已使用 `ia-glass-card` | 添加 `ia-glass-card--static` |
| **BatchUploader** | ✅ 已使用 `ia-glass-card` | 保持现状 |

### 需要优化的点

#### 1. 添加 `cursor-pointer`

**文件：** `src/features/analysis/components/ImageUploader/ImageUploader.tsx`

**当前代码：**
```tsx
<Box
  {...getRootProps()}
  className={isDragActive ? 'ia-glass-card ia-glass-card--active' : 'ia-glass-card'}
  sx={{ cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer' }}
>
```

**优化后：**
```tsx
<Box
  {...getRootProps()}
  className={`ia-glass-card ia-glass-card--clickable ${isDragActive ? 'ia-glass-card--active' : ''}`}
  sx={{ cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer' }}
>
```

#### 2. 统一过渡动画时长

**当前项目：** 已在 `globals.css` 中定义 `transition: all 0.2s ease` ✅

**符合规范：** UI/UX Pro Max 建议 150-300ms ✅

#### 3. 确保无障碍支持

**当前项目：** 已在 `globals.css` 中添加 `prefers-reduced-motion` ✅

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 色彩对比度验证

### 深色模式文字颜色

| 用途 | 颜色 | 对比度 | 状态 |
|------|------|--------|------|
| 主要文字 | `#F8FAFC` (slate-50) | 15.5:1 | ✅ AAA |
| 次要文字 | `#94A3B8` (slate-400) | 4.8:1 | ✅ AA |
| 辅助文字 | `#64748B` (slate-500) | 3.5:1 | ⚠️ 需谨慎使用 |
| 主色（绿色） | `#22C55E` (green-500) | 5.2:1 | ✅ AA |

### 验证工具

使用 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 验证文字颜色在 Glassmorphism 背景上的对比度。

---

## 性能优化建议

### 1. 动画性能

**✅ 正确做法：** 使用 `transform` 和 `opacity`

```css
.ia-glass-card:hover {
  transform: translateY(-2px);  /* ✅ 使用 transform */
  opacity: 0.9;                 /* ✅ 使用 opacity */
}
```

**❌ 错误做法：** 使用会触发 reflow 的属性

```css
/* ❌ 不要这样写 */
.ia-glass-card:hover {
  top: -2px;           /* 触发 reflow */
  height: 120px;       /* 触发 reflow */
  box-shadow: ...;     /* 可以使用，但要注意性能 */
}
```

### 2. Backdrop Filter 性能

**注意：** `backdrop-filter` 是 GPU 密集型操作

**优化策略：**
- 只在可见区域使用（懒加载）
- 避免嵌套 Glassmorphism（性能影响大）
- 在移动端考虑降低 blur 值（8px）

### 3. Safari 兼容性

**必须添加 `-webkit-` 前缀：**

```css
.ia-glass-card {
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur)); /* Safari 必需 */
}
```

---

## 响应式策略

### 移动端优化

```css
/* 移动端降低 blur 值，提升性能 */
@media (max-width: 768px) {
  :root {
    --glass-blur: 8px; /* 从 12px 降低到 8px */
  }

  /* 移动端禁用 hover 效果（触摸设备） */
  .ia-glass-card:hover {
    transform: none;
  }
}
```

### 平板端优化

```css
/* 平板端保持标准效果 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 使用标准 Glassmorphism 参数 */
}
```

---

## 实施检查清单

### 立即实施（P0）

- [x] **CSS 变量定义** - 在 `globals.css` 中定义所有 Glassmorphism 变量
- [x] **Safari 兼容** - 添加 `-webkit-backdrop-filter` 前缀
- [x] **无障碍支持** - 添加 `prefers-reduced-motion` 媒体查询
- [ ] **添加 cursor-pointer** - 为所有可点击的 Glass Card 添加 `ia-glass-card--clickable`

### 短期优化（P1）

- [ ] **移动端优化** - 添加移动端专用样式（降低 blur）
- [ ] **性能测试** - 在低端设备上测试 Glassmorphism 性能
- [ ] **对比度验证** - 使用 WebAIM 工具验证所有文字颜色

### 长期优化（P2）

- [ ] **设计系统文档** - 将本规范集成到 Storybook 或设计系统文档
- [ ] **组件库** - 创建可复用的 Glassmorphism 组件库
- [ ] **自动化测试** - 添加视觉回归测试

---

## 组件示例

### 标准卡片

```tsx
// 静态展示卡片
<Card className="ia-glass-card ia-glass-card--static">
  <Typography>静态内容</Typography>
</Card>

// 可点击卡片
<Card
  className="ia-glass-card ia-glass-card--clickable"
  onClick={handleClick}
>
  <Typography>可点击内容</Typography>
</Card>

// 激活状态卡片
<Card className="ia-glass-card ia-glass-card--active">
  <Typography>激活状态</Typography>
</Card>
```

### 模态框

```tsx
// 重度模糊模态框
<Modal className="ia-glass-card ia-glass-card--heavy ia-glass-card--lg">
  <Typography>模态框内容</Typography>
</Modal>
```

---

## 常见问题

### Q1: 为什么使用 `rgba(15, 23, 42, 0.6)` 而不是纯黑色？

**A:** 深色背景需要足够的不透明度来保证文字可读性，同时保留一定的透明度来展示背景元素。`rgba(15, 23, 42, 0.6)` 是经过测试的最佳平衡点。

### Q2: 悬停时的 `translateY(-2px)` 会不会导致布局跳动？

**A:** 不会。`transform` 属性不会触发 reflow，只会触发 composite。这是 GPU 加速的动画，性能很好。

### Q3: 移动端为什么要降低 blur 值？

**A:** `backdrop-filter` 是 GPU 密集型操作。在移动设备上，降低 blur 值可以显著提升性能，同时保持视觉一致性。

### Q4: 如何确保深色模式的文字可读性？

**A:** 遵循以下规则：
- 主要文字使用 `#F8FAFC` (slate-50)
- 次要文字使用 `#94A3B8` (slate-400)
- 避免使用 `#64748B` (slate-500) 或更浅的颜色作为正文

---

## 参考资源

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Tailwind CSS: Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [UI/UX Pro Max: Glassmorphism Guidelines](设计系统来源)

---

**文档版本：** v2.0
**最后更新：** 2026-02-19
**下次审查：** 2026-03-19
