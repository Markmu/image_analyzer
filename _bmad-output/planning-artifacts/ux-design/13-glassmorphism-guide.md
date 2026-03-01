# Glassmorphism 实施指南

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## Source of Truth

本指南从属于以下 design-system 文档：

- `design-system/image-analyzer/MASTER.md`
- `design-system/COLOR_SCHEME.md`
- `design-system/glassmorphism-guidelines.md`
- `design-system/IMPLEMENTATION_GUIDE.md`

如果本文件与以上文档冲突，以 `design-system` 为准。

---

## 设计目标

Glassmorphism 在本项目中的作用不是“炫”，而是：

- 形成稳定的深色工作台层次
- 让不同层级的任务信息清晰分组
- 让选中态、当前态、可操作态更易感知

---

## Standard Card

### 标准实现

```css
.ia-glass-card {
  background: var(--glass-bg-dark);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  transition: var(--glass-transition);
}

.ia-glass-card:hover {
  background: var(--glass-bg-dark-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover);
}
```

### 激活态

```css
.ia-glass-card--active {
  background: var(--glass-bg-active);
  border-color: var(--glass-border-active);
  box-shadow: var(--glass-shadow-active);
}
```

注意：激活态使用蓝色体系，不使用旧版绿色高亮。

---

## Required Variants

### `.ia-glass-card--clickable`

- 适用于上传区、可点击结果卡片、可选面板
- 必须带 `cursor: pointer`

### `.ia-glass-card--static`

- 适用于只读说明块、摘要块
- 禁用 hover 上浮

### `.ia-glass-card--heavy`

- 适用于模态框、重点浮层
- 使用 `--glass-blur-heavy`

### `.ia-glass-card--lg`

- 适用于主结果卡、工作台核心区域

---

## Upload Zone Pattern

```css
.upload-zone {
  background: var(--glass-bg-dark-light);
  border: 2px dashed var(--glass-border);
  border-radius: var(--glass-radius-lg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition: var(--glass-transition);
}

.upload-zone.dragover {
  border-color: var(--glass-border-active);
  background: var(--glass-bg-active);
  box-shadow: var(--glass-shadow-active);
}
```

规则：

- 拖拽激活用蓝色边框和蓝色光晕
- 不再使用绿色虚线或绿色背景强调

---

## Prompt Panel Pattern

Prompt 面板是当前产品最重要的 Glass 容器之一：

- 应默认是静态可读的
- 切换 Adapter / intensity 时保持稳定
- 当前选中输出可用蓝色边界或顶部指示，而不是整块过度发光

---

## Modal Pattern

```css
.glass-modal {
  background: var(--glass-bg-dark-heavy);
  backdrop-filter: blur(var(--glass-blur-heavy));
  -webkit-backdrop-filter: blur(var(--glass-blur-heavy));
  border: 1px solid var(--glass-border-white-medium);
  border-radius: var(--glass-radius-lg);
  box-shadow: var(--glass-shadow-hover);
}
```

要求：

- 模态框优先用于回放详情、公开投影详情、导出预览
- 避免在普通结果流里堆叠多个 heavy blur 容器

---

## Performance Rules

- 移动端使用较低 blur 值
- 避免 Glassmorphism 容器嵌套过深
- 动画只使用 `transform` / `opacity`
- 不使用会触发明显重排的 hover 效果

---

## Common Mistakes

- 用硬编码 `rgba(...)` 替代已有 token
- 用绿色作为激活色
- 没有 `-webkit-backdrop-filter`
- 所有卡片都加 hover 上浮
- 在文本密集区域使用过重 blur 导致可读性下降

---

## Review Checklist

- [ ] 所有 Glass 卡片使用统一 token
- [ ] 激活态为蓝色体系
- [ ] 上传区 dragover 为蓝色高亮
- [ ] 可点击卡片具备 `cursor-pointer`
- [ ] 模态框使用 heavy blur，普通卡片不用
- [ ] iOS / Safari 下模糊效果可用

---

## 相关文档

- [设计系统基础](./05-design-system.md)
- [视觉设计基础](./07-visual-foundation.md)
- [图标系统规范](./14-icon-system.md)
- [返回总览](./README.md)
