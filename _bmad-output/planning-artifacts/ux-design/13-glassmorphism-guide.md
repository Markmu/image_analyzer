# Glassmorphism 实施指南

> **项目：** image_analyzer UX 设计规范
> **版本：** v1.1
> **最后更新：** 2026-02-17

---

## Glassmorphism 实施指南

为确保开发严格遵循 Glassmorphism 视觉风格，提供详细的实施规范和代码示例。

### Glassmorphism 核心原则

**Glassmorphism（玻璃态）设计的四大要素：**

1. **透明度（Transparency）** - 背景半透明
2. **模糊（Blur）** - 背景内容模糊
3. **边界（Border）** - 微妙的边框
4. **层次（Depth）** - 多层叠加的深度感

### 标准 Glassmorphism 卡片样式

#### 基础卡片（必须严格遵循）

```css
/* ✅ 正确的 Glassmorphism 卡片 */
.glass-card {
  /* 1. 半透明背景 - 必须 */
  background: rgba(15, 23, 42, 0.6);

  /* 2. 背景模糊 - 必须 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari 支持 */

  /* 3. 微妙边框 - 必须 */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* 4. 圆角 - 必须 */
  border-radius: 12px;

  /* 5. 阴影 - 必须 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  /* 6. 过渡动画 - 推荐 */
  transition: all 0.2s ease;
}

/* 悬停效果 */
.glass-card:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}
```

#### 常见错误示例（开发必须避免）

```css
/* ❌ 错误 1: 背景完全不透明 */
.wrong-card-1 {
  background: #1E293B; /* 缺少透明度 */
  backdrop-filter: blur(12px);
}

/* ❌ 错误 2: 没有模糊效果 */
.wrong-card-2 {
  background: rgba(15, 23, 42, 0.6);
  /* 缺少 backdrop-filter */
}

/* ❌ 错误 3: 边框太明显 */
.wrong-card-3 {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 2px solid #22C55E; /* 颜色太强，破坏玻璃感 */
}

/* ❌ 错误 4: 模糊程度不足 */
.wrong-card-4 {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px); /* 模糊太少 */
}
```

### 不同组件的 Glassmorphism 应用

#### 1. 分析结果卡片

```css
.dimension-card {
  /* 标准 Glassmorphism */
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 高亮状态（选中/激活） */
.dimension-card.active {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(34, 197, 94, 0.2); /* 绿色光晕 */
}
```

#### 2. 模态框/对话框

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px); /* 轻微模糊背景 */
}

.modal-content {
  /* 更强的 Glassmorphism */
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1); /* 内部高光 */
}
```

#### 3. 按钮样式

```css
/* 主要按钮 - 绿色 CTA */
.btn-primary {
  background: rgba(34, 197, 94, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: rgba(34, 197, 94, 1);
  box-shadow:
    0 6px 16px rgba(34, 197, 94, 0.3),
    0 0 20px rgba(34, 197, 94, 0.3); /* 发光效果 */
}

/* 次要按钮 - 边框样式 */
.btn-secondary {
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(34, 197, 94, 0.5);
  border-radius: 8px;
  color: #22C55E;
  padding: 12px 24px;
}
```

#### 4. 上传区域

```css
.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  padding: 48px 24px;
  transition: all 0.2s ease;
}

/* 拖拽悬停状态 */
.upload-zone.dragover {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.1);
  box-shadow:
    inset 0 0 40px rgba(34, 197, 94, 0.1),
    0 0 20px rgba(34, 197, 94, 0.2);
}
```

### MUI + Tailwind 实现示例

#### 使用 MUI styled API

```tsx
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(15, 23, 42, 0.7)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
  },
}));
```

#### 使用 Tailwind CSS

```tsx
<div className="
  bg-slate-900/60
  backdrop-blur-xl
  border
  border-white/10
  rounded-xl
  shadow-lg
  transition-all
  duration-200
  hover:bg-slate-900/70
  hover:-translate-y-0.5
  hover:shadow-xl
">
  {/* 卡片内容 */}
</div>
```

**Tailwind 类名解释：**
- `bg-slate-900/60` → `rgba(15, 23, 42, 0.6)` 背景透明度 60%
- `backdrop-blur-xl` → `backdrop-filter: blur(24px)` 强模糊
- `border-white/10` → `border-color: rgba(255, 255, 255, 0.1)` 微妙边框

### 开发检查清单

**每个 Glassmorphism 组件必须验证：**

- [ ] 背景使用半透明颜色（`rgba` 或 `/60` 透明度）
- [ ] 添加 `backdrop-filter: blur(12px)` 和 `-webkit-backdrop-filter`
- [ ] 边框颜色使用 `rgba(255, 255, 255, 0.1)` 或 `border-white/10`
- [ ] 圆角统一使用 `12px` 或 `rounded-xl`
- [ ] 阴影使用 `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15)`
- [ ] 悬停状态有平滑过渡（`transition: all 0.2s ease`）
- [ ] 在深色背景上测试可见性
- [ ] Safari 浏览器测试（需要 `-webkit-backdrop-filter`）

**视觉审查要点：**

| 检查项 | 标准值 | 验证方法 |
|--------|--------|----------|
| 背景透明度 | 60% (0.6) | Chrome DevTools |
| 模糊程度 | 12-20px | CSS 检查 |
| 边框不透明度 | 10% | 取色器验证 |
| 圆角大小 | 12px | 测量工具 |
| 阴影深度 | 4px/20px | 视觉检查 |

### 常见问题 FAQ

**Q1: 为什么我的 Glassmorphism 看起来像纯色背景？**
A: 检查背景透明度是否设置为 0.6，并确保有背景内容可见。

**Q2: 在 Safari 上模糊效果不生效？**
A: 必须添加 `-webkit-backdrop-filter: blur(12px)` 前缀。

**Q3: 边框太明显破坏玻璃感？**
A: 使用 `rgba(255, 255, 255, 0.1)` 而非实际颜色，边框应该非常微妙。

**Q4: 多层 Glassmorphism 叠加怎么做？**
A: 每层使用不同的透明度，外层 0.6，内层 0.4，模拟景深效果。

---

## 📚 相关文档

- [核心流程优化方案](./12-core-flow-optimization.md) - 查看 Glassmorphism 在上传流程中的应用
- [图标系统规范](./14-icon-system.md) - 了解如何与图标系统结合使用
- [返回总览](./README.md)
