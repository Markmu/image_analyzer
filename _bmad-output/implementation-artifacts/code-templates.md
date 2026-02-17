# UX 代码模板库

**版本：** v1.1
**用途：** 提供可直接使用的代码模板，加速开发

---

## 📋 使用说明

1. 复制需要的模板代码
2. 根据项目结构调整导入路径
3. 根据实际需求定制
4. 确保通过检查清单验证

---

## 🎨 Glassmorphism 组件模板

### 1. 标准 Glassmorphism 卡片

```tsx
import { Card, CardProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

/**
 * 标准 Glassmorphism 卡片组件
 * 用于分析结果、详情展示等场景
 */
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)', // Safari 支持
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

export default GlassCard;
```

**使用示例：**
```tsx
<GlassCard>
  <CardContent>
    <Typography variant="h6">分析结果</Typography>
    {/* 内容 */}
  </CardContent>
</GlassCard>
```

---

### 2. 激活状态的 Glassmorphism 卡片

```tsx
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * 带激活状态的 Glassmorphism 卡片
 * 用于可选择的选项、四维度分析卡片等
 */
const ActiveGlassCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  background: active
    ? 'rgba(34, 197, 94, 0.15)'
    : 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${active
    ? 'rgba(34, 197, 94, 0.3)'
    : 'rgba(255, 255, 255, 0.1)'}`,
  borderRadius: '12px',
  boxShadow: active
    ? '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 20px rgba(34, 197, 94, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    background: active
      ? 'rgba(34, 197, 94, 0.2)'
      : 'rgba(15, 23, 42, 0.7)',
    transform: 'translateY(-2px)',
  },
}));

export default ActiveGlassCard;
```

**使用示例：**
```tsx
const [selected, setSelected] = useState(false);

<ActiveGlassCard
  active={selected}
  onClick={() => setSelected(!selected)}
>
  <CardContent>
    <Sun className="w-6 h-6 text-yellow-500" />
    <Typography>光影分析</Typography>
  </CardContent>
</ActiveGlassCard>
```

---

### 3. Tailwind CSS 版本

```tsx
/**
 * 使用 Tailwind CSS 的 Glassmorphism 卡片
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  active = false,
  onClick
}: GlassCardProps) {
  return (
    <div
      className={`
        ${active
          ? 'bg-green-500/15 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
          : 'bg-slate-900/60 border-white/10'
        }
        backdrop-blur-xl
        border
        rounded-xl
        shadow-lg
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-xl
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

---

## 🎯 按钮模板

### 1. 主要按钮（绿色 CTA）

```tsx
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

/**
 * 主要按钮 - 绿色 Glassmorphism
 * 用于复制、保存等主要操作
 */
const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(34, 197, 94, 0.9)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  borderRadius: '8px',
  color: 'white',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(34, 197, 94, 1)',
    boxShadow: '0 6px 16px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: 'rgba(34, 197, 94, 0.5)',
    cursor: 'not-allowed',
  },
}));

export default PrimaryButton;
```

**使用示例：**
```tsx
import { Copy } from 'lucide-react';

<PrimaryButton
  startIcon={<Copy className="w-5 h-5" />}
  onClick={handleCopy}
>
  复制到剪贴板
</PrimaryButton>
```

---

### 2. 次要按钮（边框样式）

```tsx
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * 次要按钮 - 边框 Glassmorphism
 * 用于保存、查看详情等次要操作
 */
const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.3)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(34, 197, 94, 0.5)',
  borderRadius: '8px',
  color: '#22C55E',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.7)',
  },
}));

export default SecondaryButton;
```

---

### 3. 图标按钮

```tsx
import { IconButton, IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

interface GlassIconButtonProps extends IconButtonProps {
  'aria-label': string; // 强制要求 aria-label
}

/**
 * 图标按钮 - Glassmorphism
 * 用于设置、关闭等图标操作
 */
const GlassIconButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(15, 23, 42, 0.6)',
  },
  '& .MuiSvgIcon-root': {
    color: '#94A3B8', // text-slate-400
  },
}));

export default GlassIconButton;
```

**使用示例：**
```tsx
import { Settings } from 'lucide-react';

<GlassIconButton aria-label="设置">
  <Settings className="w-5 h-5" />
</GlassIconButton>
```

---

## 📤 上传区域模板

```tsx
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';

const UploadZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dragover',
})<{ dragover?: boolean }>(({ dragover }) => ({
  border: `2px dashed ${dragover
    ? 'rgba(34, 197, 94, 0.6)'
    : 'rgba(255, 255, 255, 0.2)'}`,
  borderRadius: '12px',
  background: dragover
    ? 'rgba(34, 197, 94, 0.1)'
    : 'rgba(15, 23, 42, 0.3)',
  backdropFilter: 'blur(8px)',
  padding: '48px 24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: dragover
    ? 'inset 0 0 40px rgba(34, 197, 94, 0.1), 0 0 20px rgba(34, 197, 94, 0.2)'
    : 'none',
}));

export function UploadArea() {
  const [dragover, setDragover] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(true);
  };

  const handleDragLeave = () => {
    setDragover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    // 处理文件上传
    const files = e.dataTransfer.files;
    console.log('Dropped files:', files);
  };

  return (
    <UploadZone
      dragover={dragover}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ImagePlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <Typography variant="h6" className="text-slate-50">
        拖拽图片到这里
      </Typography>
      <Typography variant="body2" className="text-slate-400 mt-2">
        或点击选择文件
      </Typography>
    </UploadZone>
  );
}
```

---

## 📊 分析进度模板

```tsx
import { Box, LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { X } from 'lucide-react';

const ProgressContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '24px',
}));

const StyledProgress = styled(LinearProgress)(({ theme }) => ({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#22C55E',
    borderRadius: '4px',
  },
}));

interface AnalysisProgressProps {
  progress: number; // 0-100
  stage: string;
  timeRemaining: string;
  onCancel: () => void;
}

export function AnalysisProgress({
  progress,
  stage,
  timeRemaining,
  onCancel,
}: AnalysisProgressProps) {
  return (
    <ProgressContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" className="text-slate-50">
          {stage}
        </Typography>
        <GlassIconButton aria-label="取消" onClick={onCancel}>
          <X className="w-5 h-5" />
        </GlassIconButton>
      </Box>

      <StyledProgress variant="determinate" value={progress} />

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Typography variant="body2" className="text-slate-400">
          {progress}% 完成
        </Typography>
        <Typography variant="body2" className="text-slate-400">
          预计 {timeRemaining}
        </Typography>
      </Box>

      <Typography variant="body2" className="text-green-500 mt-2">
        正在确保分析准确性...
      </Typography>
    </ProgressContainer>
  );
}
```

---

## 🎯 四维度分析卡片模板

```tsx
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Sun, Grid3X3, Palette, Sparkles, LucideIcon } from 'lucide-react';

const DimensionCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(15, 23, 42, 0.7)',
    transform: 'translateY(-2px)',
  },
}));

const iconMap = {
  lighting: Sun,
  composition: Grid3X3,
  color: Palette,
  artStyle: Sparkles,
};

const colorMap = {
  lighting: 'text-yellow-500',
  composition: 'text-blue-500',
  color: 'text-purple-500',
  artStyle: 'text-pink-500',
};

interface DimensionCardProps {
  type: 'lighting' | 'composition' | 'color' | 'artStyle';
  term: string;
  description: string;
  confidence: number;
}

export function DimensionAnalysisCard({
  type,
  term,
  description,
  confidence,
}: DimensionCardProps) {
  const Icon = iconMap[type];
  const iconColor = colorMap[type];

  return (
    <DimensionCard role="region" aria-labelledby={`dimension-${type}`}>
      <CardContent>
        <Icon className={`w-6 h-6 ${iconColor} mb-2`} />
        <Typography
          id={`dimension-${type}`}
          variant="h6"
          className="text-slate-50 mb-1"
        >
          {term}
        </Typography>
        <Typography variant="body2" className="text-slate-400">
          {description}
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body2" className="text-slate-400">
            置信度：{(confidence * 100).toFixed(0)}%
          </Typography>
        </Box>
      </CardContent>
    </DimensionCard>
  );
}
```

---

## ✅ 使用检查清单

使用这些模板时，确保：

- [ ] 复制了完整的代码
- [ ] 安装了必要的依赖（`@mui/material`, `lucide-react`）
- [ ] 验证 Glassmorphism 样式（背景透明度、模糊、边框）
- [ ] 添加了无障碍属性（`aria-label`）
- [ ] 在 Chrome 和 Safari 测试
- [ ] 通过 developer-checklist.md 验证

---

**维护者：** 前端开发团队
**更新：** 随项目需求更新模板
