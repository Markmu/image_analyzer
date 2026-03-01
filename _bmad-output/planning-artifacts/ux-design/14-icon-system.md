# 图标系统规范

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## 图标库

统一使用 `lucide-react`。

原因：

- 线性风格稳定，适合深色 Glassmorphism 界面
- React 生态成熟
- 语义覆盖足够完整
- 与当前产品的工作台式信息密度匹配

禁止混用：

- Material Icons
- Font Awesome
- Emoji
- 无设计约束的自定义 SVG

---

## 尺寸规范

| 场景 | 尺寸 | 建议类名 |
|------|------|----------|
| 页面标题图标 | 24-32px | `w-6 h-6` / `w-8 h-8` |
| 主按钮图标 | 20px | `w-5 h-5` |
| 次按钮 / 内联图标 | 16px | `w-4 h-4` |
| 标签 / 状态图标 | 14px | `w-3.5 h-3.5` |

---

## 颜色规范

| 用途 | 颜色语义 |
|------|----------|
| 主操作 | `--primary` |
| 强调 / 高亮 | `--accent` |
| 次要信息 | `--secondary` |
| 成功完成 | `--success` |
| 警告 | `--warning` |
| 错误 | `--error` |

禁止继续以绿色作为“复制、上传、主按钮”的默认图标色。

---

## 语义映射

### 任务与流程

| 功能 | 建议图标 |
|------|----------|
| 上传 | `Upload` |
| 图片输入 | `ImagePlus` |
| 任务状态 | `LoaderCircle` / `Clock3` / `CircleCheck` / `CircleAlert` |
| 阶段进度 | `ListTree` / `Workflow` |
| 重试 | `RotateCcw` |

### 输出与操作

| 功能 | 建议图标 |
|------|----------|
| 复制 | `Copy` |
| 导出 | `Download` |
| 保存模板 | `Save` |
| 编辑变量 | `PencilLine` |
| 外链 / 跳转 | `ExternalLink` |

### 结果与质量

| 功能 | 建议图标 |
|------|----------|
| 风格概览 | `Sparkles` |
| 相机语言 | `Camera` |
| 光线 | `SunMedium` |
| 色彩 | `Palette` |
| 纹理 | `Layers3` |
| 构图 | `Scan` |
| QA pass | `BadgeCheck` |
| QA warn | `TriangleAlert` |
| QA fail | `OctagonAlert` |

### 结构与展开

| 功能 | 建议图标 |
|------|----------|
| 展开 | `ChevronDown` |
| 收起 | `ChevronUp` |
| 下一层级 | `ChevronRight` |
| 关闭 | `X` |
| 设置 | `Settings` |
| 帮助 | `CircleHelp` |

---

## 使用规则

### 图标 + 文本按钮

优先使用图标加文字，而不是纯图标按钮：

```tsx
<button>
  <Copy className="w-5 h-5" aria-hidden="true" />
  <span>复制当前 Prompt</span>
</button>
```

### 纯图标按钮

只有在空间受限且语义清楚时使用，并且必须提供 `aria-label`：

```tsx
<button aria-label="重新分析任务">
  <RotateCcw className="w-4 h-4" />
</button>
```

### 状态图标

状态图标不能脱离文字独立承担语义：

```tsx
<div>
  <TriangleAlert className="w-4 h-4 text-[var(--warning)]" aria-hidden="true" />
  <span>存在可修复问题</span>
</div>
```

---

## Product-Specific Guidance

### 不再推荐的旧映射

以下旧映射不再作为主规范：

- 四维度分析固定使用 `Sun / Grid3X3 / Palette / Sparkles`
- 质量徽章使用 `Check + TrendingUp`
- 所有主操作图标统一绿色

原因：

- 当前产品已从“四维度展示”转向“结构化风格结果 + QA + 变量控制”
- 旧图标映射会把界面误导回旧产品模型

### 推荐的任务中心映射

优先让图标反映“任务、输出、质量、回放、公开投影”这些真实能力域。

---

## Accessibility

- 纯图标按钮必须有 `aria-label`
- 装饰性图标使用 `aria-hidden="true"`
- 图标不可作为唯一状态表达
- 图标与文字对齐要稳定，避免在密集面板里造成跳动

---

## Checklist

- [ ] 所有图标来自 `lucide-react`
- [ ] 主操作图标使用蓝色体系
- [ ] QA 状态图标与文案同时存在
- [ ] 纯图标按钮有 `aria-label`
- [ ] 没有保留旧的四维度/质量徽章式图标主叙事

---

## 相关文档

- [Glassmorphism 实施指南](./13-glassmorphism-guide.md)
- [组件策略](./09-component-strategy.md)
- [返回总览](./README.md)
