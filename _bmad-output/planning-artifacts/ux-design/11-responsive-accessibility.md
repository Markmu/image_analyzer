# Responsive Design & Accessibility

> **项目：** image_analyzer UX 设计规范  
> **版本：** v2.0  
> **最后更新：** 2026-03-01

---

## Responsive Strategy

新版响应式策略围绕**同一任务事实在不同屏幕下的不同排布**，而不是“移动端看简化版，桌面端看完整版”。

### 核心原则

- 各端看到的是同一任务结果
- 小屏折叠的是层级，不是真相
- 主操作在任何尺寸都应靠前
- 任务状态永远优先于装饰性内容

---

## Breakpoints

| 断点 | 宽度 | 布局策略 |
|------|------|----------|
| Mobile | `< 768px` | 单列堆叠 |
| Tablet | `768px - 1023px` | 上下双层或 2 列折叠 |
| Desktop | `>= 1024px` | 三面板工作台 |

### 默认顺序

无论什么设备，内容顺序都应保持：

1. 任务头部
2. 阶段进度
3. 当前 Prompt 与主操作
4. QA verdict
5. 风格概览
6. 变量与锁定常量
7. 深层结构与回放

---

## Mobile Rules

- 首屏优先显示复制、导出、保存
- Prompt 区不应被折叠到用户找不到
- 回放与公开投影预览默认折叠
- 不再使用“请到桌面端查看详细分析”作为默认设计策略

---

## Tablet Rules

- 左侧输入和任务区可放到顶部
- 结果区与输出区上下堆叠
- 保持切换器和主操作靠近 Prompt 面板

---

## Desktop Rules

- 三面板结构稳定
- 右侧输出区宽度要足够阅读长 Prompt
- 中部优先展示风格理解和 QA，而不是 JSON 明细

---

## Accessibility Target

目标标准：**WCAG 2.1 AA**

### 必需项

- 正文对比度 >= 4.5:1
- 大文本/粗体 >= 3:1
- 所有交互元素可键盘访问
- 焦点样式可见
- 触摸目标 >= 44x44px
- 动效尊重 `prefers-reduced-motion`

---

## Color and Contrast

推荐使用已验证配色：

```css
.text-primary {
  color: #F8FAFC;
  background: #0B0B10;
}

.text-secondary {
  color: #94A3B8;
  background: #0B0B10;
}

.text-action {
  color: #3B82F6;
  background: #0B0B10;
}

.text-accent {
  color: #06B6D4;
  background: #0B0B10;
}
```

禁止继续把绿色作为全局主色对比度示例。

---

## Keyboard and Focus

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: var(--foreground);
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

规则：

- 纯图标按钮必须有 `aria-label`
- 面板折叠必须有 `aria-expanded`
- 当前阶段和 verdict 建议使用 `aria-live`

---

## Screen Reader Semantics

### 推荐语义层级

- 页面标题：任务标识 / 结果标题
- 二级标题：阶段进度、当前输出、QA、风格概览
- 三级标题：锁定常量、变量、issues、fixes

### 推荐模式

```tsx
<section aria-labelledby="qa-heading">
  <h2 id="qa-heading">质量校验</h2>
  <div aria-live="polite">当前状态：warn</div>
</section>
```

---

## Motion Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

长任务页面尤其不能依赖动画来传达状态变化。

---

## Accessibility Checklist

- [ ] 任务状态可被屏幕阅读器读取
- [ ] QA verdict 可被屏幕阅读器读取
- [ ] 所有 IconButton 都有 `aria-label`
- [ ] 所有可展开区块正确暴露展开状态
- [ ] 所有主操作在移动端也满足 44x44px
- [ ] 焦点不会被玻璃态样式吞掉
- [ ] 对比度遵循 `design-system/COLOR_SCHEME.md`

---

## 相关文档

- [视觉设计基础](./07-visual-foundation.md)
- [UX 一致性模式](./10-ux-consistency.md)
- [工作台布局设计规范](./15-workspace-layout.md)
- [返回总览](./README.md)
