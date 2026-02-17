# 开发阶段参考文档总览

**项目：** image_analyzer
**版本：** v1.1
**更新日期：** 2026-02-18

---

## 📚 文档导航

### 🚀 快速开始

**新加入的开发者请按此顺序阅读：**

1. 👉 **[development-guide.md](./development-guide.md)** - 开发实施指南（必读）
   - 了解优先级路线图
   - 查看任务分配建议
   - 熟悉质量保证流程

2. 👉 **[sprint-board.md](./sprint-board.md)** - Sprint 开发看板
   - 查看当前任务进度
   - 了解截止日期
   - 更新每日站会内容

3. 👉 **[code-templates.md](./code-templates.md)** - 代码模板库
   - 复制即用的组件模板
   - 标准 Glassmorphism 实现
   - 按钮和上传组件

---

## 📁 完整文档清单

### 开发实施文档

| 文档 | 用途 | 优先级 | 位置 |
|------|------|--------|------|
| **development-guide.md** | 开发实施指南 | 🔴 必读 | 本目录 |
| **sprint-board.md** | Sprint 开发看板 | 🔴 必读 | 本目录 |
| **code-templates.md** | 代码模板库 | 🔴 必读 | 本目录 |

### 开发工具文档

| 文档 | 用途 | 位置 |
|------|------|------|
| **developer-checklist.md** | PR 检查清单（50+ 项） | `../planning-artifacts/` |
| **quick-reference.md** | 快速参考卡片（一页纸） | `../planning-artifacts/` |

### UX 规范文档

| 文档 | 内容 | 位置 |
|------|------|------|
| **README.md** | 文档总索引 | `../planning-artifacts/ux-design/` |
| **12-core-flow-optimization.md** | 核心流程优化 | `../planning-artifacts/ux-design/` |
| **13-glassmorphism-guide.md** | Glassmorphism 指南 | `../planning-artifacts/ux-design/` |
| **14-icon-system.md** | 图标系统规范 | `../planning-artifacts/ux-design/` |
| **其他章节（01-11）** | 完整 UX 规范 | `../planning-artifacts/ux-design/` |

---

## 🎯 按角色查看

### 前端开发

**必读文档（按顺序）：**

1. 📋 [development-guide.md](./development-guide.md)
   - 了解 P0 任务和优先级
   - 查看验收标准

2. 🎨 [code-templates.md](./code-templates.md)
   - 复制组件模板
   - 快速开始开发

3. 📄 [quick-reference.md](../planning-artifacts/quick-reference.md)
   - 打印或收藏
   - 一页纸快速参考

4. ✅ [developer-checklist.md](../planning-artifacts/developer-checklist.md)
   - PR 提交前逐项检查
   - 确保符合规范

**深入阅读（可选）：**
- [13-glassmorphism-guide.md](../planning-artifacts/ux-design/13-glassmorphism-guide.md) - 详细规范
- [14-icon-system.md](../planning-artifacts/ux-design/14-icon-system.md) - 图标映射
- [12-core-flow-optimization.md](../planning-artifacts/ux-design/12-core-flow-optimization.md) - 流程细节

---

### 产品经理

**推荐阅读：**

1. 📊 [sprint-board.md](./sprint-board.md) - 查看进度和风险
2. 📋 [development-guide.md](./development-guide.md) - 了解优先级
3. 📖 [ux-design/README.md](../planning-artifacts/ux-design/README.md) - 按角色查看 UX 规范

---

### UX 设计师

**推荐阅读：**

1. 📋 [development-guide.md](./development-guide.md) - 了解实施优先级
2. 📊 [sprint-board.md](./sprint-board.md) - 跟踪开发进度
3. ✅ [developer-checklist.md](../planning-artifacts/developer-checklist.md) - 确保设计落地

---

## 🔥 P0 任务快速参考

### Task 1: Glassmorphism 视觉规范

**必读：**
- 📄 [quick-reference.md](../planning-artifacts/quick-reference.md) - 一键复制代码
- 🎨 [13-glassmorphism-guide.md](../planning-artifacts/ux-design/13-glassmorphism-guide.md) - 完整规范
- 💻 [code-templates.md](./code-templates.md) - 组件模板

**关键规范：**
- 背景透明度：60%
- 模糊：12px
- 边框：`rgba(255,255,255,0.1)`
- 圆角：12px

---

### Task 2: 图标系统迁移

**必读：**
- 🎯 [14-icon-system.md](../planning-artifacts/ux-design/14-icon-system.md) - 图标映射表
- 📄 [quick-reference.md](../planning-artifacts/quick-reference.md) - 快速映射

**关键规范：**
- 使用 `lucide-react`
- 按钮图标：`w-5 h-5` (20px)
- 必须 `aria-label`

---

### Task 3: 核心流程简化

**必读：**
- 🔄 [12-core-flow-optimization.md](../planning-artifacts/ux-design/12-core-flow-optimization.md) - 流程细节
- ✅ [developer-checklist.md](../planning-artifacts/developer-checklist.md) - 验收清单

**关键规范：**
- 拖拽即上传
- 自动开始分析
- "一键复制"首屏可见

---

## 📅 Sprint 时间线

| 日期 | 里程碑 | 关键文档 |
|------|--------|----------|
| **2026-02-18** | Sprint 启动 | development-guide.md |
| **2026-02-19-22** | P0 任务开发 | code-templates.md + quick-reference.md |
| **2026-02-22** | P0 验收 | developer-checklist.md |
| **2026-02-25** | Sprint Review | sprint-board.md |
| **2026-02-26+** | P1 任务开始 | development-guide.md |

---

## 🚨 常见问题快速查找

### Q1: Glassmorphism 怎么实现？
👉 查看：[quick-reference.md](../planning-artifacts/quick-reference.md) 或 [code-templates.md](./code-templates.md)

### Q2: 应该用什么图标？
👉 查看：[quick-reference.md](../planning-artifacts/quick-reference.md) 的图标映射表

### Q3: PR 检查清单在哪？
👉 查看：[developer-checklist.md](../planning-artifacts/developer-checklist.md)

### Q4: 当前任务进度如何？
👉 查看：[sprint-board.md](./sprint-board.md)

### Q5: 如何验证代码符合规范？
👉 使用：[developer-checklist.md](../planning-artifacts/developer-checklist.md) 逐项检查

---

## 🔗 外部资源

**依赖库：**
- [Lucide React 图标库](https://lucide.dev/)
- [MUI (Material-UI)](https://mui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

**工具：**
- Chrome DevTools - 检查样式
- Color Contrast Checker - 对比度验证
- VoiceOver/NVDA - 无障碍测试

---

## 📞 支持与反馈

**遇到问题？**

1. 先查阅相关文档
2. 查看 [developer-checklist.md](../planning-artifacts/developer-checklist.md) 常见问题
3. 联系团队：
   - **开发问题：** 前端负责人
   - **设计问题：** Sally（UX 设计师）
   - **流程问题：** 产品经理

---

## 📊 文档维护

**更新频率：**
- development-guide.md - 按需更新
- sprint-board.md - 每日站会后更新
- code-templates.md - 随项目需求更新

**维护者：**
- 开发团队 + UX 设计团队

---

**祝开发顺利！🚀**

**👉 立即开始：** [development-guide.md](./development-guide.md)
