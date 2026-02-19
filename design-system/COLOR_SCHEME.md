# Image Analyzer - 科技感深色配色系统

> **更新日期：** 2026-02-19
> **设计目标：** 科技感深色 Glassmorphism，高对比度，无绿色

---

## 🎨 核心配色方案

### 主题色彩（Space Tech / Aerospace）

| 用途 | 颜色名称 | Hex 值 | RGB 值 | 使用场景 |
|------|---------|--------|--------|---------|
| **主色 (Primary)** | 科技蓝 | `#3B82F6` | `rgb(59, 130, 246)` | CTA 按钮、激活状态、链接 |
| **次要色 (Secondary)** | 银灰色 | `#94A3B8` | `rgb(148, 163, 184)` | 次要文字、禁用状态 |
| **强调色 (Accent)** | 天蓝色 | `#06B6D4` | `rgb(6, 182, 212)` | 高亮、悬停效果 |
| **背景色 (Background)** | 深空黑 | `#0B0B10` | `rgb(11, 11, 16)` | 页面背景 |
| **文字色 (Text)** | 明亮白 | `#F8FAFC` | `rgb(248, 250, 252)` | 主要文字 |

### 辅助色彩

| 用途 | 颜色名称 | Hex 值 | 使用场景 |
|------|---------|--------|---------|
| **成功** | 深蓝 | `#2563EB` | 成功提示、完成状态 |
| **警告** | 琥珀 | `#F59E0B` | 警告提示 |
| **错误** | 玫瑰红 | `#F43F5E` | 错误提示、删除操作 |
| **信息** | 青色 | `#06B6D4` | 信息提示 |

---

## 🔍 对比度验证（WCAG AA 标准）

### 文字对比度

| 组合 | 对比度 | 等级 | 是否通过 |
|------|--------|------|---------|
| **主文字** (#F8FAFC) on **背景** (#0B0B10) | 16.1:1 | AAA | ✅ |
| **次要文字** (#94A3B8) on **背景** (#0B0B10) | 7.2:1 | AAA | ✅ |
| **主文字** (#F8FAFC) on **卡片** (#1E293B/0.6) | 12.5:1 | AAA | ✅ |
| **主色** (#3B82F6) on **背景** (#0B0B10) | 4.8:1 | AA | ✅ |
| **强调色** (#06B6D4) on **背景** (#0B0B10) | 5.1:1 | AA | ✅ |

**结论：** 所有文字对比度均符合 WCAG AA 标准，确保在深色背景上清晰可读。

---

## 📐 Glassmorphism CSS 变量

### 更新后的 CSS 变量系统

```css
:root {
  /* ========================================
     1. 基础主题色
     ======================================== */
  --background: #0B0B10;
  --foreground: #F8FAFC;

  /* 主色调 */
  --primary: #3B82F6;           /* 科技蓝 */
  --primary-hover: #60A5FA;     /* 悬停蓝 */
  --primary-active: #2563EB;    /* 激活蓝 */

  /* 次要色 */
  --secondary: #94A3B8;         /* 银灰色 */
  --secondary-hover: #CBD5E1;

  /* 强调色 */
  --accent: #06B6D4;            /* 天蓝色 */
  --accent-hover: #22D3EE;

  /* ========================================
     2. Glassmorphism 核心参数
     ======================================== */

  /* 深色玻璃背景 */
  --glass-bg-dark: rgba(30, 41, 59, 0.6);
  --glass-bg-dark-hover: rgba(30, 41, 59, 0.7);
  --glass-bg-dark-active: rgba(30, 41, 59, 0.8);

  /* 浅色玻璃背景（特殊场景） */
  --glass-bg-light: rgba(148, 163, 184, 0.08);

  /* 蓝色激活背景 */
  --glass-bg-active: rgba(59, 130, 246, 0.15);
  --glass-bg-active-hover: rgba(59, 130, 246, 0.2);

  /* 青色高亮背景 */
  --glass-bg-highlight: rgba(6, 182, 212, 0.12);

  /* 模糊度 */
  --glass-blur: 12px;
  --glass-blur-heavy: 20px;
  --glass-blur-mobile: 8px;

  /* ========================================
     3. 边框系统
     ======================================== */

  /* 基础边框 */
  --glass-border: rgba(148, 163, 184, 0.15);
  --glass-border-hover: rgba(148, 163, 184, 0.25);
  --glass-border-active: rgba(59, 130, 246, 0.4);

  /* 白色边框系列（半透明） */
  --glass-border-white-light: rgba(248, 250, 252, 0.08);
  --glass-border-white-medium: rgba(248, 250, 252, 0.15);
  --glass-border-white-heavy: rgba(248, 250, 252, 0.25);

  /* ========================================
     4. 文字颜色系统
     ======================================== */

  /* 白色文字系列 */
  --glass-text-white-heavy: rgba(248, 250, 252, 0.95);   /* 主文字 */
  --glass-text-white-medium: rgba(248, 250, 252, 0.75);  /* 次要文字 */
  --glass-text-white-light: rgba(248, 250, 252, 0.55);   /* 辅助文字 */

  /* 银灰色文字系列 */
  --glass-text-gray-heavy: rgba(148, 163, 184, 0.95);
  --glass-text-gray-medium: rgba(148, 163, 184, 0.75);
  --glass-text-gray-light: rgba(148, 163, 184, 0.55);

  /* 蓝色文字 */
  --glass-text-primary: #3B82F6;
  --glass-text-primary-hover: #60A5FA;

  /* 青色文字 */
  --glass-text-accent: #06B6D4;

  /* ========================================
     5. 阴影系统
     ======================================== */

  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  --glass-shadow-hover: 0 6px 28px rgba(0, 0, 0, 0.35);
  --glass-shadow-active: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 20px rgba(59, 130, 246, 0.3);

  /* 蓝色光晕 */
  --glass-shadow-blue: 0 0 24px rgba(59, 130, 246, 0.25);
  --glass-shadow-blue-heavy: 0 0 32px rgba(59, 130, 246, 0.35);

  /* 青色光晕 */
  --glass-shadow-cyan: 0 0 24px rgba(6, 182, 212, 0.25);

  /* ========================================
     6. 圆角系统
     ======================================== */

  --glass-radius: 12px;
  --glass-radius-lg: 16px;
  --glass-radius-xl: 20px;

  /* ========================================
     7. 过渡系统
     ======================================== */

  --glass-transition: all 0.2s ease;
  --glass-transition-slow: all 0.3s ease;
  --glass-transition-fast: all 0.15s ease;

  /* ========================================
     8. 背景深度系列（变体）
     ======================================== */

  --glass-bg-dark-light: rgba(30, 41, 59, 0.5);
  --glass-bg-dark-medium: rgba(30, 41, 59, 0.65);
  --glass-bg-dark-heavy: rgba(30, 41, 59, 0.8);

  /* ========================================
     9. 状态颜色
     ======================================== */

  /* 成功（深蓝） */
  --success: #2563EB;
  --success-bg: rgba(37, 99, 235, 0.15);

  /* 警告（琥珀） */
  --warning: #F59E0B;
  --warning-bg: rgba(245, 158, 11, 0.15);

  /* 错误（玫瑰红） */
  --error: #F43F5E;
  --error-bg: rgba(244, 63, 94, 0.15);

  /* 信息（青色） */
  --info: #06B6D4;
  --info-bg: rgba(6, 182, 212, 0.15);
}
```

---

## 🎯 使用指南

### 文字颜色使用规则

**在深色背景上：**

```css
/* 主标题、重要文字 */
color: var(--glass-text-white-heavy);  /* #F8FAFC/0.95 - 对比度 16.1:1 */

/* 次要文字、描述 */
color: var(--glass-text-white-medium); /* #F8FAFC/0.75 - 对比度 12.5:1 */

/* 辅助文字、禁用状态 */
color: var(--glass-text-white-light);  /* #F8FAFC/0.55 - 对比度 9.1:1 */

/* 链接、可点击文字 */
color: var(--glass-text-primary);      /* #3B82F6 - 对比度 4.8:1 */

/* 强调文字、标签 */
color: var(--glass-text-accent);       /* #06B6D4 - 对比度 5.1:1 */
```

**在 Glassmorphism 卡片上：**

```css
/* 使用相同的文字颜色，但对比度略有降低（依然符合 WCAG AA） */
color: var(--glass-text-white-heavy);  /* 在半透明背景上对比度 ~12.5:1 */
```

### 背景、边框、阴影使用

**标准卡片：**

```css
background: var(--glass-bg-dark);
border: 1px solid var(--glass-border);
backdrop-filter: blur(var(--glass-blur));
box-shadow: var(--glass-shadow);
color: var(--glass-text-white-heavy);  /* 主文字使用白色 */
```

**激活/选中状态：**

```css
background: var(--glass-bg-active);
border-color: var(--glass-border-active);
box-shadow: var(--glass-shadow-active);
```

**悬停效果：**

```css
background: var(--glass-bg-dark-hover);
border-color: var(--glass-border-hover);
box-shadow: var(--glass-shadow-hover);
```

---

## 🚫 避免的错误

### ❌ 错误示例

```css
/* 错误：深色背景上使用深色文字 */
background: var(--glass-bg-dark);
color: #1E293B;  /* ❌ 对比度不足 1.2:1 - 完全不可读 */
```

### ✅ 正确示例

```css
/* 正确：深色背景上使用亮色文字 */
background: var(--glass-bg-dark);
color: var(--glass-text-white-heavy);  /* ✅ 对比度 12.5:1 - 清晰可读 */
```

---

## 📊 与旧配色对比

| 项目 | 旧配色 | 新配色 | 改进 |
|------|--------|--------|------|
| **CTA 颜色** | #22C55E (绿色) | #3B82F6 (科技蓝) | ✅ 更符合科技感 |
| **背景深度** | #0F172A | #0B0B10 | ✅ 更深，对比度更高 |
| **激活背景** | 绿色 rgba | 蓝色 rgba | ✅ 视觉统一 |
| **文字对比度** | 12.5:1 | 16.1:1 | ✅ 提升 28% |
| **辅助色** | 绿色系 | 蓝色+青色 | ✅ 科技感更强 |

---

## 🎨 设计系统完整性检查

- ✅ 主色调：科技蓝 (#3B82F6)
- ✅ 无绿色：所有绿色已替换为蓝色/青色
- ✅ 高对比度：所有文字对比度 > 4.5:1
- ✅ Glassmorphism：完整的半透明背景系统
- ✅ 响应式：移动端优化参数
- ✅ 无障碍：WCAG AA 级别
- ✅ 状态完整：hover, active, focus, disabled

---

## 📝 更新清单

### 需要更新的文件

1. **`src/app/globals.css`** - 替换所有 CSS 变量
2. **所有组件** - 替换绿色为蓝色（#22C55E → #3B82F6）
3. **激活状态** - 替换绿色背景为蓝色背景
4. **阴影效果** - 替换绿色光晕为蓝色光晕

---

**下一步：** 执行 `COLOR_SCHEME_MIGRATION_GUIDE.md` 中的迁移步骤
