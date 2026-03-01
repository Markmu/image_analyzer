# Visual Design Foundation

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## Visual Direction

视觉基线采用 **Space Tech / Aerospace** 风格：

- 深空黑底
- 科技蓝主色
- 天蓝色高亮
- 银灰辅助信息
- 深色玻璃态分层

这套语言更适合“专业分析工作台 + 结构化结果查看”的产品气质，也和仓库内已落地的 CSS 变量系统一致。

---

## Color System

### Core Palette

| 语义角色 | Hex | Token | 用途 |
|---------|-----|------|------|
| Background | `#0B0B10` | `--background` | 页面底色 |
| Foreground | `#F8FAFC` | `--foreground` | 主要文字 |
| Primary | `#3B82F6` | `--primary` | CTA、激活、链接 |
| Secondary | `#94A3B8` | `--secondary` | 次要信息 |
| Accent | `#06B6D4` | `--accent` | 高亮、强调 |
| Success | `#2563EB` | `--success` | 通过、成功完成 |
| Warning | `#F59E0B` | `--warning` | 风险提示 |
| Error | `#F43F5E` | `--error` | 错误、失败 |

### Contrast Notes

| 组合 | 对比度 | 级别 |
|------|--------|------|
| `#F8FAFC` on `#0B0B10` | 16.1:1 | AAA |
| `#94A3B8` on `#0B0B10` | 7.2:1 | AAA |
| `#3B82F6` on `#0B0B10` | 4.8:1 | AA |
| `#06B6D4` on `#0B0B10` | 5.1:1 | AA |

### Status Usage

- `pass` / 已完成：深蓝成功色
- `warn`：琥珀
- `fail`：玫瑰红
- 当前选择 / 当前聚焦：主蓝 + 青色辅助

---

## Typography

### Primary Type System

依据 `design-system/image-analyzer/MASTER.md`，统一使用 **Inter**：

| 用途 | 字号 | 权重 | 行高 |
|------|------|------|------|
| H1 | 40px | 600 | 1.2 |
| H2 | 32px | 600 | 1.25 |
| H3 | 24px | 600 | 1.3 |
| H4 | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### Tone Guidance

- 标题偏克制、理性、系统化
- 正文尽量短句，避免营销口号感
- 技术对象名可使用等宽字体或代码样式强调

---

## Spacing

### Token Scale

| Token | 值 | 用途 |
|------|----|------|
| `--space-xs` | 4px | 紧密元素 |
| `--space-sm` | 8px | 图标与标签间距 |
| `--space-md` | 16px | 常规 padding |
| `--space-lg` | 24px | 卡片区块间距 |
| `--space-xl` | 32px | 面板间距 |
| `--space-2xl` | 48px | 大章节留白 |
| `--space-3xl` | 64px | 顶部/底部大留白 |

### Layout Rhythm

- 工作台主面板优先使用 `24px` 间距
- 面板内组件垂直节奏建议 `16px`
- 说明文本与输入组件之间不要小于 `8px`

---

## Surfaces and Depth

### Standard Surface

```css
background: var(--glass-bg-dark);
border: 1px solid var(--glass-border);
backdrop-filter: blur(var(--glass-blur));
box-shadow: var(--glass-shadow);
border-radius: var(--glass-radius);
```

### Active Surface

```css
background: var(--glass-bg-active);
border-color: var(--glass-border-active);
box-shadow: var(--glass-shadow-active);
```

### Depth Rules

- 页面最多使用 3 层明显视觉深度
- 模态框使用 `--heavy` 模糊，不要在普通卡片滥用
- hover 只做轻度上浮或边框提亮，避免“漂浮过头”

---

## Layout Structure

### Desktop

- 推荐工作台宽度：`1280px - 1440px`
- 面板化布局：任务/输入、分析结果、输出操作
- 保证首屏看到任务状态、结果摘要和主操作

### Tablet

- 两列或 1.5 列折叠布局
- 允许右侧操作区下沉
- 保留相同信息层级，不删除关键事实

### Mobile

- 单列堆叠
- 任务头部固定在前
- 复制/导出操作保持高优先级
- 深层分析与回放信息默认折叠

---

## Motion

### Timing

- Hover：150ms - 200ms
- Collapse / panel switch：200ms - 300ms
- Page reveal：300ms 左右

### Principles

- 动效用于帮助理解状态变化，不用于制造“AI 魔法感”
- 阶段切换以文本变化 + 轻动效为主
- 必须支持 `prefers-reduced-motion`

---

## Accessibility

- 所有关键文案对比度符合 WCAG AA
- 链接和按钮不只依赖颜色表达状态
- 焦点样式必须明显
- 图标必须配文字或 `aria-label`
- 结果区块需要语义标题，方便屏幕阅读器快速跳转

---

## Visual Anti-Patterns

- 不再使用绿色作为全局 CTA 主色
- 不再使用与 design-system 冲突的局部配色
- 不再使用“质量指标发光卡片”作为主要信任机制
- 不再把炫技动画放在核心任务状态之上

---

## 相关文档

- [设计系统基础](./05-design-system.md)
- [组件策略](./09-component-strategy.md)
- [工作台布局设计规范](./15-workspace-layout.md)
- [返回总览](./README.md)
