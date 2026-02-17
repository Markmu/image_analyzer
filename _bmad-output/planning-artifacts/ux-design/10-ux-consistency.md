# UX Consistency Patterns

> **项目：** image_analyzer UX 设计规范
> **版本：** v1.1
> **最后更新：** 2026-02-17

---

### Button Hierarchy

**按钮层级设计原则：**

image_analyzer 采用三级按钮层级体系，确保用户在任何页面都能快速识别主要操作。

| 层级 | 样式 | 用途 | 示例 |
|------|------|------|------|
| **Primary** | 绿色实心按钮，#22C55E | 主要操作：开始分析、复制模版、生成图片 | 核心流程入口 |
| **Secondary** | 绿色边框按钮，1px solid #22C55E | 次要操作：保存到模版库、查看详情 | 辅助功能 |
| **Tertiary** | 文本按钮，无背景 | 次次要操作：取消、返回、查看更多 | 导航链接 |

**Primary Button 样式规范：**

```css
.btn-primary {
  background: #22C55E;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #16A34A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
```

**按钮放置规则：**
- 主要操作按钮始终右对齐（在 LTR 语言中）
- 多个按钮时，主要操作在右，次要操作在左
- 危险操作使用红色变体（#EF4444）
- 禁用状态使用 50% 透明度和 `cursor: not-allowed`

### Feedback Patterns

**反馈模式类型：**

| 类型 | 视觉 | 持续时间 | 用途 |
|------|------|----------|------|
| **Success** | 绿色 Toast + 勾选图标 | 3秒 | 复制成功、保存成功 |
| **Error** | 红色 Toast + X 图标 | 5秒 | 上传失败、分析失败 |
| **Warning** | 黄色 Toast + 警告图标 | 4秒 | 格式警告、credit 不足 |
| **Info** | 蓝色 Toast + 信息图标 | 3秒 | 进度提示、状态更新 |
| **Loading** | 骨架屏/Spinner | 动态 | 数据加载、分析中 |

**Toast 通知规范：**

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #22C55E;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  z-index: 1000;
  transition: all 0.3s ease;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
```

**分析进度反馈：**

```tsx
// 进度阶段显示
const analysisStages = [
  { id: 'upload', label: '上传图片中', progress: 0.25 },
  { id: 'analyzing', label: '正在识别光影技巧...', progress: 0.50 },
  { id: 'generating', label: '正在生成模版...', progress: 0.75 },
  { id: 'complete', label: '分析完成！', progress: 1.0 }
];
```

### Form Patterns

**表单设计规范：**

**图片上传区域：**

```css
.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
}
```

**模版编辑输入框：**

```css
.template-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  width: 100%;
}

.template-input:focus {
  outline: none;
  border-color: #22C55E;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}
```

**占位符高亮规则：**
- 可替换部分使用方括号：`[例如：一只猫]`
- 占位符使用蓝色高亮：`[例如：一只猫]`
- 点击占位符时显示输入建议

### Navigation Patterns

**导航设计规范：**

| 导航类型 | 桌面端 | 移动端 |
|----------|--------|--------|
| **主导航** | 顶部固定导航栏 | 底部标签栏 |
| **面包屑** | 显示完整路径 | 只显示上一级 |
| **返回导航** | 左上角返回按钮 | 顶部返回按钮 |

**页面结构：**

```
┌─────────────────────────────────────────┐
│  Logo    分析    模版库    我的账户      │  ← 顶部导航
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 参考图片 │  │ 分析结果 │  │ 模版编辑 │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│                                         │
├─────────────────────────────────────────┤
│  使用此模版生成的图片                    │
└─────────────────────────────────────────┘
```

### Modal and Overlay Patterns

**模态框设计规范：**

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1E293B;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}
```

**查看大图模态框：**
- 全屏显示高清图片
- 支持左右切换（键盘箭头）
- 显示图片元数据
- 支持下载原图

### Empty States and Loading States

**空状态设计：**

```css
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}
```

**分析中骨架屏：**

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Search and Filtering Patterns

**模版库搜索规范：**

| 交互元素 | 桌面端 | 移动端 |
|----------|--------|--------|
| **搜索框** | 顶部固定，256px 宽度 | 展开式搜索 |
| **筛选器** | 侧边栏或下拉菜单 | 底部抽屉 |
| **排序** | 下拉选择 | 底部动作表 |

**搜索实时反馈：**
- 输入时实时过滤（防抖 300ms）
- 无结果时显示友好提示
- 支持标签筛选（可多选）
- 保存搜索历史

---

## 📚 相关文档

- [上一个章节](./09-component-strategy.md)
- [下一个章节](./11-responsive-accessibility.md)
- [返回总览](./README.md)
