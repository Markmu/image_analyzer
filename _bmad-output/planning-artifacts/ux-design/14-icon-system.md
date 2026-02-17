# 图标系统规范

> **项目：** image_analyzer UX 设计规范
> **版本：** v1.1
> **最后更新：** 2026-02-17

---

## 图标系统规范

为保持视觉一致性，统一使用 Lucide 图标库，并遵循以下使用规范。

### 图标库选择

**选定图标库：Lucide**

**选择理由：**
- ✅ 开源免费（MIT 许可证）
- ✅ 与 Glassmorphism 风格高度匹配（线条简洁、现代）
- ✅ 完整的图标集（1000+ 图标）
- ✅ React 组件支持（tree-shakable）
- ✅ 可定制性强（大小、颜色、粗细）
- ✅ 一致的设计语言

**安装方式：**
```bash
npm install lucide-react
# 或
yarn add lucide-react
```

### 图标使用规范

#### 基础用法

```tsx
import { Upload, Copy, Check, X } from 'lucide-react';

// 标准用法
<Upload className="w-5 h-5" />

// 带颜色
<Copy className="w-5 h-5 text-green-500" />

// 按钮内使用
<button>
  <Upload className="w-5 h-5 mr-2" />
  上传图片
</button>
```

#### 标准尺寸规范

| 用途 | 尺寸 | Tailwind 类 | 图标粗细 |
|------|------|------------|---------|
| **页面标题图标** | 32px | `w-8 h-8` | `stroke-width: 1.5` |
| **按钮图标（大）** | 24px | `w-6 h-6` | `stroke-width: 2` |
| **按钮图标（默认）** | 20px | `w-5 h-5` | `stroke-width: 2` |
| **内联图标** | 16px | `w-4 h-4` | `stroke-width: 2` |
| **小图标（标签）** | 14px | `w-3.5 h-3.5` | `stroke-width: 2` |

#### 颜色规范

```tsx
// 主要操作图标 - 绿色
<Upload className="w-5 h-5 text-green-500" />

// 次要图标 - 灰色
<Settings className="w-5 h-5 text-slate-400" />

// 成功状态 - 绿色
<Check className="w-5 h-5 text-green-500" />

// 错误状态 - 红色
<X className="w-5 h-5 text-red-500" />

// 信息图标 - 蓝色
<Info className="w-5 h-5 text-blue-500" />
```

### 组件图标映射

#### 上传相关

```tsx
import { Upload, ImagePlus, X } from 'lucide-react';

// 上传按钮
<Button>
  <Upload className="w-5 h-5 mr-2" />
  上传图片
</Button>

// 拖拽上传区域
<div className="upload-zone">
  <ImagePlus className="w-12 h-12 text-slate-400 mb-4" />
  <p>拖拽图片到这里</p>
</div>

// 取消上传
<IconButton>
  <X className="w-4 h-4" />
</IconButton>
```

#### 分析结果相关

```tsx
import {
  Sun,        // 光影
  Grid3X3,    // 构图
  Palette,    // 色彩
  Sparkles,   // 艺术风格
  Check,
  TrendingUp
} from 'lucide-react';

// 四维度分析卡片
<DimensionCard>
  <Sun className="w-6 h-6 text-yellow-500" />
  <h3>光影</h3>
  <p>伦勃朗光</p>
</DimensionCard>

<DimensionCard>
  <Grid3X3 className="w-6 h-6 text-blue-500" />
  <h3>构图</h3>
  <p>三分法</p>
</DimensionCard>

<DimensionCard>
  <Palette className="w-6 h-6 text-purple-500" />
  <h3>色彩</h3>
  <p>互补色对比</p>
</DimensionCard>

<DimensionCard>
  <Sparkles className="w-6 h-6 text-pink-500" />
  <h3>艺术风格</h3>
  <p>赛博朋克</p>
</DimensionCard>

// 质量指标
<QualityBadge>
  <Check className="w-4 h-4 text-green-500" />
  <span>参数完整</span>
  <TrendingUp className="w-4 h-4 text-green-500" />
  <span>成功率 94%</span>
</QualityBadge>
```

#### 模版操作相关

```tsx
import {
  Copy,
  Check,
  Download,
  Save,
  Edit3,
  RotateCcw
} from 'lucide-react';

// 复制按钮（主要操作）
<Button variant="primary">
  <Copy className="w-5 h-5 mr-2" />
  复制到剪贴板
</Button>

// 复制成功状态
<Button variant="primary" disabled>
  <Check className="w-5 h-5 mr-2" />
  已复制
</Button>

// 保存到模版库
<Button variant="secondary">
  <Save className="w-5 h-5 mr-2" />
  保存到我的模版库
</Button>

// 编辑模版
<IconButton>
  <Edit3 className="w-4 h-4" />
</IconButton>

// 重置编辑
<IconButton>
  <RotateCcw className="w-4 h-4" />
</IconButton>
```

#### 导航和通用操作

```tsx
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Settings,
  HelpCircle
} from 'lucide-react';

// 导航菜单
<IconButton>
  <Menu className="w-6 h-6" />
</IconButton>

// 关闭按钮
<IconButton>
  <X className="w-5 h-5" />
</IconButton>

// 返回按钮
<Button>
  <ChevronLeft className="w-5 h-5 mr-1" />
  返回
</Button>

// 展开/收起
<Button>
  展开详情
  <ChevronDown className="w-4 h-4 ml-1" />
</Button>

// 外部链接
<a href={url}>
  查看文档
  <ExternalLink className="w-4 h-4 ml-1" />
</a>
```

### 图标与 Glassmorphism 结合

#### 玻璃态按钮中的图标

```tsx
// 主要按钮（绿色 Glassmorphism）
<button className="
  bg-green-500/90
  backdrop-blur-md
  border
  border-green-500/30
  rounded-lg
  px-6 py-3
  text-white
  flex items-center gap-2
">
  <Copy className="w-5 h-5" />
  复制到剪贴板
</button>

// 次要按钮（边框 Glassmorphism）
<button className="
  bg-slate-900/30
  backdrop-blur-md
  border
  border-green-500/50
  rounded-lg
  px-6 py-3
  text-green-500
  flex items-center gap-2
">
  <Save className="w-5 h-5" />
  保存
</button>
```

#### 图标按钮（IconButton）

```tsx
// 标准 IconButton
<button className="
  p-2
  bg-slate-900/40
  backdrop-blur-md
  border
  border-white/10
  rounded-lg
  hover:bg-slate-900/60
  transition-all
">
  <Settings className="w-5 h-5 text-slate-400" />
</button>
```

### 禁止使用的图标来源

**❌ 禁止混用以下图标库：**
- Material Icons（与 Glassmorphism 风格不符）
- Font Awesome（过时，不够现代）
- 自定义 SVG 图标（除非 Lucide 没有对应图标）
- Emoji 表情符号（不专业）

**✅ 如果 Lucide 缺少某个图标：**
1. 在 Lucide GitHub 提交图标请求
2. 临时使用最接近的 Lucide 图标
3. 如果必须自定义，遵循 Lucide 的设计规范（24x24 网格，2px stroke）

### 开发检查清单

**每个使用图标的组件必须验证：**

- [ ] 图标来自 `lucide-react` 包
- [ ] 图标尺寸符合标准规范（16/20/24/32px）
- [ ] 图标颜色使用主题色（green-500/slate-400/等）
- [ ] 按钮内图标与文字间距为 `mr-2` 或 `gap-2`
- [ ] 图标粗细统一（`stroke-width: 2`）
- [ ] 无障碍：图标按钮有 `aria-label`
- [ ] 图标语义与功能匹配（如复制用 `Copy`，而非 `Download`）

**图标语义映射表：**

| 功能 | 图标 | 说明 |
|------|------|------|
| 上传 | `Upload` | 主要上传操作 |
| 拖拽上传 | `ImagePlus` | 上传区域 |
| 复制 | `Copy` | 复制到剪贴板 |
| 复制成功 | `Check` | 成功状态 |
| 保存 | `Save` | 保存到库 |
| 编辑 | `Edit3` | 编辑模版 |
| 删除 | `Trash2` | 删除操作 |
| 关闭 | `X` | 关闭/取消 |
| 设置 | `Settings` | 设置选项 |
| 帮助 | `HelpCircle` | 帮助提示 |
| 展开 | `ChevronDown` | 展开详情 |
| 收起 | `ChevronUp` | 收起详情 |
| 光影 | `Sun` | 四维度-光影 |
| 构图 | `Grid3X3` | 四维度-构图 |
| 色彩 | `Palette` | 四维度-色彩 |
| 风格 | `Sparkles` | 四维度-艺术风格 |

### 无障碍要求

```tsx
// 纯图标按钮必须有 aria-label
<button aria-label="复制到剪贴板">
  <Copy className="w-5 h-5" />
</button>

// 图标 + 文字的按钮，图标是装饰性的
<button aria-label="上传图片">
  <Upload className="w-5 h-5" aria-hidden="true" />
  <span>上传图片</span>
</button>
```

---

## 📚 相关文档

- [Glassmorphism 实施指南](./13-glassmorphism-guide.md) - 了解图标如何与玻璃态设计结合
- [核心流程优化方案](./12-core-flow-optimization.md) - 查看图标在核心流程中的应用
- [返回总览](./README.md)
