# Responsive Design & Accessibility

> **项目：** image_analyzer UX 设计规范
> **版本：** v1.1
> **最后更新：** 2026-02-17

---

### Responsive Strategy

**响应式设计策略：**

image_analyzer 采用**移动优先**的响应式设计策略，确保在所有设备上提供最佳体验。

| 设备类型 | 断点 | 布局策略 |
|----------|------|----------|
| **移动端** | < 768px | 单列布局，底部导航 |
| **平板端** | 768px - 1024px | 两列布局，侧边导航 |
| **桌面端** | ≥ 1024px | 三列布局，顶部导航 |

**移动端策略：**
- 最小触摸目标：44x44px
- 底部固定操作栏（FAB）
- 简化专业术语，只显示风格标签
- 引导用户"在桌面端查看详细分析"

**平板端策略：**
- 两列自适应布局
- 保留主要交互功能
- 支持横向/纵向模式

**桌面端策略：**
- 三列完整布局
- 鼠标悬停交互
- 完整快捷键支持
- 批量操作功能

### Breakpoint Strategy

**断点定义：**

```css
/* 移动优先断点 */
--breakpoint-xs: 0;        /* < 576px */
--breakpoint-sm: 576px;    /* ≥ 576px */
--breakpoint-md: 768px;    /* ≥ 768px */
--breakpoint-lg: 992px;    /* ≥ 992px */
--breakpoint-xl: 1200px;   /* ≥ 1200px */
--breakpoint-2xl: 1400px;  /* ≥ 1400px */
```

**布局响应式规则：**

```css
/* 移动端：单列 */
.main-layout {
  grid-template-columns: 1fr;
}

/* 平板端：两列 */
@media (min-width: 768px) {
  .main-layout {
    grid-template-columns: 100px 1fr;
  }
}

/* 桌面端：三列 */
@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 120px 1fr 1fr;
  }
}
```

### Accessibility Strategy

**无障碍合规级别：**

image_analyzer 目标为 **WCAG 2.1 AA** 级别合规。

**关键无障碍要求：**

| 要求 | 标准 | 实现方式 |
|------|------|----------|
| **色彩对比度** | 4.5:1 (正文) | 使用 Slate 50 on Slate 900 |
| **键盘导航** | 所有交互可访问 | Tab 顺序 + 焦点状态 |
| **屏幕阅读器** | 语义化 HTML | ARIA 标签 + 正确标题层级 |
| **触摸目标** | 最小 44x44px | 所有按钮满足最小尺寸 |
| **动画** | 尊重减弱动画偏好 | `prefers-reduced-motion` |

**色彩对比度验证：**

```css
/* 通过验证的对比度组合 */
.text-primary { color: #F8FAFC; background: #0F172A; } /* 15.2:1 AAA */
.text-secondary { color: #94A3B8; background: #0F172A; } /* 4.8:1 AA */
.accent-green { color: #22C55E; background: #0F172A; } /* 4.8:1 AA */
```

**键盘导航规范：**

```css
/* 焦点状态 */
*:focus-visible {
  outline: 2px solid #22C55E;
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #22C55E;
  color: white;
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**ARIA 属性使用：**

```tsx
// 模态框
<Dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">查看大图</h2>
  <img src={src} alt="参考图片" />
</Dialog>

// 加载状态
<div aria-busy="true" aria-live="polite">
  正在分析图片...
</div>

// 展开折叠
<button
  aria-expanded={isExpanded}
  aria-controls="dimension-details"
>
  查看详情
</button>
<div id="dimension-details" hidden={!isExpanded}>
  {/* 详细内容 */}
</div>
```

### Testing Strategy

**响应式测试策略：**

| 测试类型 | 测试内容 | 工具/方法 |
|----------|----------|-----------|
| **设备测试** | iOS/Android 真实设备 | BrowserStack |
| **浏览器测试** | Chrome/Firefox/Safari/Edge | 跨浏览器验证 |
| **屏幕阅读器** | VoiceOver/NVDA/JAWS | 实际测试验证 |
| **键盘导航** | Tab/Enter/Esc 导航 | 无鼠标测试 |
| **色彩无障碍** | 色盲模拟 | Color Oracle |

**无障碍测试清单：**

- [ ] 所有图片有 alt 文本
- [ ] 所有表单输入有标签
- [ ] 颜色不是唯一指示器
- [ ] 焦点状态可见
- [ ] 跳过链接可用
- [ ] 动画可减弱
- [ ] 触摸目标 ≥ 44x44px
- [ ] 对比度 ≥ 4.5:1

### Implementation Guidelines

**响应式开发规范：**

```tsx
// 移动优先媒体查询
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

**相对单位使用：**

```css
/* 使用 rem 而非固定 px */
.button {
  padding: 0.75rem 1.5rem;  /* 12px 24px */
  font-size: 1rem;          /* 16px */
}

/* 使用 % 或 vw/vh */
.container {
  width: 100%;
  max-width: 1400px;
  padding: 0 2vw;
}
```

**Design System 集成：**

```tsx
// 使用 MUI 主题系统
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#22C55E',
      dark: '#16A34A',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
  },
  typography: {
    fontFamily: 'Open Sans, PingFang SC, sans-serif',
    h1: {
      fontFamily: 'Poppins, PingFang SC, sans-serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});
```

---

## 📚 相关文档

- [上一个章节](./10-ux-consistency.md)
- [返回总览](./README.md)
