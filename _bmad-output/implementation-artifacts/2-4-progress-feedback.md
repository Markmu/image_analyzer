# Story 2.4: progress-feedback

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为一名 **普通用户或 AI 创作者**,
我希望 **在上传和分析过程中能够清晰地看到实时进度和预计剩余时间**,
以便 **了解系统正在工作,建立信任,并知道还需要等待多久**。

## Acceptance Criteria

1. **[AC-1]** 系统可以显示图片上传的实时进度
   - 上传进度百分比(0-100%)
   - 上传速度(MB/s)
   - 预计剩余时间(秒)
   - 支持大文件(10MB)上传进度显示

2. **[AC-2]** 系统可以显示 AI 分析的实时进度
   - 阶段进度(上传中 → 分析中 → 生成模版 → 完成)
   - 当前阶段的专业术语滚动显示
     - "正在上传图片..."
     - "正在识别光影技巧..."
     - "正在检测构图方法..."
     - "正在生成模版..."
   - 整体进度百分比(基于历史数据估算)

3. **[AC-3]** 系统可以显示批量分析的进度
   - "已分析 X/5 张图片"
   - 整体进度条(每张图片 20%)
   - 当前正在分析的图片缩略图高亮

4. **[AC-4]** 系统可以智能估算预计剩余时间
   - 基于历史数据的平均处理时间
   - 动态调整估算(根据实际进度更新)
   - 显示 "预计还需 X 秒" 或 "预计还需 X 分钟"

5. **[AC-5]** 系统在需要更长时间时主动告知用户
   - 如果分析需要 > 90 秒,显示"正在确保分析准确性..."
   - 如果队列中有任务,显示"当前排队第 X 位"
   - 透明化等待时间

6. **[AC-6]** 系统提供进度状态的视觉反馈
   - 进度条动画
   - 阶段图标点亮效果
   - 专业术语打字机效果
   - 脉冲动画表示系统正在工作

7. **[AC-7]** 移动端优化
   - 简化进度显示(移除速度等技术细节)
   - 大号进度百分比
   - 固定顶部进度栏(滚动时可见)

## Tasks / Subtasks

- [ ] **Task 1: 实现上传进度跟踪** (AC: 1, 6)
  - [ ] Subtask 1.1: 使用 axios onUploadProgress 事件
    - 监听 uploadProgress 事件
    - 计算上传速度和剩余时间
  - [ ] Subtask 1.2: 创建进度状态管理
    - Zustand store: uploadProgress, uploadSpeed, estimatedTime
  - [ ] Subtask 1.3: 实现进度条组件
    - MUI LinearProgress with animation
    - 显示百分比和预计时间

- [ ] **Task 2: 实现分析进度跟踪** (AC: 2, 4, 6)
  - [ ] Subtask 2.1: 创建分析阶段定义
    - 枚举: UPLOADING, ANALYZING, GENERATING, COMPLETED
    - 每个阶段的预计时间(基于历史数据)
  - [ ] Subtask 2.2: 实现智能轮询机制
    - 1-2 秒轮询间隔
    - 60 秒超时保护
    - 错误重试机制(最多 3 次)
  - [ ] Subtask 2.3: 实现专业术语滚动显示
    - 术语列表: ["识别光影技巧", "检测构图方法", "分析色彩搭配", "识别艺术风格"]
    - 打字机效果或渐变动画
  - [ ] Subtask 2.4: 实现预计剩余时间估算
    - 基于历史平均时间(初始: 60 秒)
    - 动态调整(根据实际进度更新)

- [ ] **Task 3: 实现批量分析进度跟踪** (AC: 3, 5)
  - [ ] Subtask 3.1: 扩展进度状态支持批量
    - 当前图片索引
    - 总图片数量
    - 每张图片的独立进度
  - [ ] Subtask 3.2: 实现队列透明化
    - 显示 "当前排队第 X 位"(如果有队列)
    - 显示 "预计等待 X 秒"
  - [ ] Subtask 3.3: 实现批量进度显示组件
    - 整体进度条
    - 单张图片进度列表
    - 当前处理图片高亮

- [ ] **Task 4: 实现 ProgressDisplay 前端组件** (AC: 1, 2, 3, 6, 7)
  - [ ] Subtask 4.1: 创建组件结构
    - 位置: `src/features/analysis/components/ProgressDisplay/`
    - 组件: ProgressBar, StageIndicator, TermScroller
  - [ ] Subtask 4.2: 实现阶段指示器
    - 四个阶段图标,当前阶段高亮
    - 连接线动画
    - 阶段名称和说明
  - [ ] Subtask 4.3: 实现专业术语滚动器
    - 打字机效果
    - 淡入淡出动画
  - [ ] Subtask 4.4: 实现移动端进度栏
    - 固定顶部(使用 position: sticky)
    - 大号百分比显示
    - 简化信息(移除速度等技术细节)

- [ ] **Task 5: 集成智能时间估算算法** (AC: 2, 4, 5)
  - [ ] Subtask 5.1: 创建时间估算模块
    - 位置: `src/lib/utils/time-estimation.ts`
    - 函数: `estimateTimeRemaining(stage, progress)`
  - [ ] Subtask 5.2: 实现历史数据收集(可选)
    - 记录每个阶段的实际耗时
    - 计算移动平均值
  - [ ] Subtask 5.3: 实现动态调整算法
    - 根据实际进度与估算的偏差调整
    - 如果进度停滞,增加预计时间

- [ ] **Task 6: 实现队列透明化功能** (AC: 5)
  - [ ] Subtask 6.1: 在 API 中返回队列信息(如果有)
    - 队列位置
    - 预计等待时间
  - [ ] Subtask 6.2: 实现队列状态显示
    - "当前排队第 X 位"
    - "预计等待 X 秒"
    - 透明化等待时间

- [ ] **Task 7: 编写单元测试和 E2E 测试**
  - [ ] Subtask 7.1: 测试时间估算算法
  - [ ] Subtask 7.2: 测试进度显示准确性
  - [ ] Subtask 7.3: E2E 测试完整进度流程

## Dev Notes

### Epic Context

**当前进度**: Epic 2 的第四个故事(最后一个)
- **前置故事**: 2-1-image-upload, 2-2-batch-upload, 2-3-upload-validation
- **后续 Epic**: Epic 3 (AI 风格分析)

**业务价值**: 实时进度反馈可以:
- 减少用户焦虑感("系统卡住了吗?")
- 建立信任("系统在工作,我看到了进度")
- 专业预期("这个工具很专业,使用专业术语")
- 透明化("我知道还需要等多久")

### Architecture Requirements

**进度状态管理:**
```typescript
// src/stores/useProgressStore.ts
interface ProgressState {
  // 上传进度
  uploadProgress: number; // 0-100
  uploadSpeed: number; // MB/s
  uploadEstimatedTime: number; // 秒

  // 分析进度
  analysisStage: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'completed' | 'error';
  analysisProgress: number; // 0-100
  analysisEstimatedTime: number; // 秒
  currentTerm: string; // 当前显示的专业术语
  queuePosition: number | null; // 队列位置

  // 批量分析
  batchProgress: {
    current: number; // 当前图片索引
    total: number; // 总图片数
    completed: number; // 已完成数量
  } | null;

  // Actions
  setUploadProgress: (progress: number) => void;
  setAnalysisStage: (stage: AnalysisStage) => void;
  setAnalysisProgress: (progress: number) => void;
  setCurrentTerm: (term: string) => void;
  estimateTimeRemaining: (stage: AnalysisStage, progress: number) => void;
}

const useProgressStore = create<ProgressState>((set) => ({
  uploadProgress: 0,
  uploadSpeed: 0,
  uploadEstimatedTime: 0,
  analysisStage: 'idle',
  analysisProgress: 0,
  analysisEstimatedTime: 60, // 默认 60 秒
  currentTerm: '',
  queuePosition: null,
  batchProgress: null,

  setUploadProgress: (progress) =>
    set((state) => ({
      uploadProgress: progress,
      uploadEstimatedTime: calculateUploadTime(progress, state.uploadSpeed),
    })),

  setAnalysisStage: (stage) => set({ analysisStage: stage }),

  setAnalysisProgress: (progress) =>
    set((state) => ({
      analysisProgress: progress,
      analysisEstimatedTime: calculateAnalysisTime(
        state.analysisStage,
        progress
      ),
    })),

  setCurrentTerm: (term) => set({ currentTerm: term }),

  estimateTimeRemaining: (stage, progress) =>
    set((state) => ({
      analysisEstimatedTime: calculateAnalysisTime(stage, progress),
    })),
}));
```

**时间估算算法:**
```typescript
// src/lib/utils/time-estimation.ts

// 分析阶段的时间分布(基于历史数据)
const STAGE_DURATION = {
  uploading: 5, // 5 秒(上传阶段)
  analyzing: 40, // 40 秒(分析阶段)
  generating: 15, // 15 秒(生成模版阶段)
};

export const calculateAnalysisTime = (
  stage: AnalysisStage,
  progress: number
): number => {
  if (stage === 'completed') return 0;
  if (stage === 'idle') return STAGE_DURATION.analyzing + STAGE_DURATION.generating;

  const stageDuration = STAGE_DURATION[stage] || 30;
  const remaining = stageDuration * (1 - progress / 100);

  // 加上后续阶段的时间
  if (stage === 'uploading') {
    return remaining + STAGE_DURATION.analyzing + STAGE_DURATION.generating;
  } else if (stage === 'analyzing') {
    return remaining + STAGE_DURATION.generating;
  } else {
    return remaining;
  }
};

export const calculateUploadTime = (
  progress: number,
  speed: number // MB/s
): number => {
  if (speed === 0) return 0;
  const remaining = (100 - progress) / 100;
  // 假设平均文件大小 5MB
  return (5 * remaining) / speed;
};
```

**专业术语列表:**
```typescript
// src/features/analysis/constants/analysis-terms.ts

export const ANALYSIS_TERMS = [
  // 光影术语
  { text: '正在识别光影技巧...', stage: 'analyzing' },
  { text: '检测主光源方向...', stage: 'analyzing' },
  { text: '分析阴影细节...', stage: 'analyzing' },

  // 构图术语
  { text: '正在检测构图方法...', stage: 'analyzing' },
  { text: '识别视觉平衡点...', stage: 'analyzing' },
  { text: '分析画面视角...', stage: 'analyzing' },

  // 色彩术语
  { text: '正在分析色彩搭配...', stage: 'analyzing' },
  { text: '提取主色调...', stage: 'analyzing' },
  { text: '识别色彩对比度...', stage: 'analyzing' },

  // 艺术风格术语
  { text: '正在识别艺术风格...', stage: 'analyzing' },
  { text: '分析风格流派...', stage: 'analyzing' },
  { text: '匹配艺术时期...', stage: 'analyzing' },

  // 生成模版
  { text: '正在生成提示词模版...', stage: 'generating' },
  { text: '优化模版结构...', stage: 'generating' },
];
```

**智能轮询机制:**
```typescript
// src/lib/api/polling.ts

export const pollAnalysisStatus = async (
  analysisId: string,
  onProgress: (progress: AnalysisProgress) => void,
  onComplete: (result: AnalysisResult) => void,
  onError: (error: Error) => void
) => {
  const POLL_INTERVAL = 2000; // 2 秒
  const TIMEOUT = 60000; // 60 秒超时
  const MAX_RETRIES = 3; // 最多重试 3 次

  let retries = 0;
  const startTime = Date.now();

  const poll = async () => {
    try {
      // 检查超时
      if (Date.now() - startTime > TIMEOUT) {
        throw new Error('分析超时,请重试');
      }

      // 调用 API 获取进度
      const response = await fetch(`/api/analysis/${analysisId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      // 更新进度
      onProgress(data.data);

      // 检查是否完成
      if (data.data.status === 'completed') {
        onComplete(data.data);
        return;
      }

      // 继续轮询
      setTimeout(poll, POLL_INTERVAL);
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES) {
        onError(error);
      } else {
        // 延迟重试
        setTimeout(poll, POLL_INTERVAL * retries);
      }
    }
  };

  // 开始轮询
  poll();
};
```

### UX Requirements

**阶段指示器设计:**
```tsx
// StageIndicator 组件
<Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
  {STAGES.map((stage, index) => (
    <React.Fragment key={stage.id}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: currentStageIndex >= index ? 1 : 0.5,
        }}
      >
        <StageIcon
          stage={stage.id}
          active={currentStageIndex === index}
          completed={currentStageIndex > index}
        />
        <Typography variant="caption" sx={{ mt: 1 }}>
          {stage.label}
        </Typography>
      </Box>
      {index < STAGES.length - 1 && (
        <StageConnector completed={currentStageIndex > index} />
      )}
    </React.Fragment>
  ))}
</Box>
```

**专业术语滚动器:**
```tsx
// TermScroller 组件(打字机效果)
<Typography
  variant="body1"
  sx={{
    fontFamily: 'JetBrains Mono',
    color: 'text.secondary',
    minHeight: 24,
  }}
>
  {currentTerm}
  <CursorBlink /> {/* 闪烁的光标 */}
</Typography>

// 打字机效果 Hook
const useTypewriterEffect = (terms: string[]) => {
  const [currentTerm, setCurrentTerm] = useState('');
  const [termIndex, setTermIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const term = terms[termIndex];
    if (charIndex < term.length) {
      // 打字
      const timeout = setTimeout(() => {
        setCurrentTerm(term.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50); // 50ms 打字速度
      return () => clearTimeout(timeout);
    } else {
      // 停顿后切换到下一个术语
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setTermIndex((termIndex + 1) % terms.length);
      }, 3000); // 3 秒后切换
      return () => clearTimeout(timeout);
    }
  }, [termIndex, charIndex, terms]);

  return currentTerm;
};
```

**进度条设计:**
```tsx
// 整体进度条
<Box sx={{ mb: 2 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {stageLabel}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {progress}%
    </Typography>
  </Box>
  <LinearProgress
    variant="determinate"
    value={progress}
    sx={{
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '& .MuiLinearProgress-bar': {
        backgroundColor: '#22C55E',
        transition: 'width 0.3s ease',
      },
    }}
  />
  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
    预计还需 {estimatedTime} 秒
  </Typography>
</Box>
```

**批量分析进度:**
```tsx
// BatchProgress 组件
<Box sx={{ mb: 2 }}>
  <Typography variant="body2" color="text.secondary">
    已分析 {completed} / {total} 张图片
  </Typography>
  <LinearProgress
    variant="determinate"
    value={(completed / total) * 100}
    sx={{ mt: 1 }}
  />
  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
    {thumbnails.map((thumb, index) => (
      <ThumbnailCard
        key={thumb.id}
        image={thumb}
        status={index < completed ? 'completed' : index === completed ? 'analyzing' : 'pending'}
      />
    ))}
  </Box>
</Box>
```

**移动端固定顶部进度栏:**
```tsx
// MobileProgressBar 组件
<AppBar
  position="sticky"
  sx={{
    top: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  }}
>
  <Toolbar variant="dense">
    <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1.5rem' }}>
      {progress}%
    </Typography>
    <CircularProgress
      variant="determinate"
      value={progress}
      size={24}
      sx={{ color: '#22C55E' }}
    />
  </Toolbar>
</AppBar>
```

### Implementation Patterns

**进度轮询模式:**
```typescript
// React Query + 轮询
const useAnalysisProgress = (analysisId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const response = await fetch(`/api/analysis/${analysisId}/status`);
      return response.json();
    },
    refetchInterval: (data) => {
      // 完成后停止轮询
      return data?.status === 'completed' ? false : 2000;
    },
    onSuccess: (data) => {
      // 更新进度状态
      useProgressStore.getState().setAnalysisProgress(data.progress);
      useProgressStore.getState().setCurrentTerm(data.currentTerm);
    },
  });
};
```

**批量进度模式:**
```typescript
// 批量分析进度跟踪
const useBatchAnalysisProgress = (imageIds: string[]) => {
  const [completed, setCompleted] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // 并发轮询所有图片的分析状态
    const unsubscribers = imageIds.map((imageId, index) => {
      return pollAnalysisStatus(
        imageId,
        (progress) => {
          if (index === current) {
            useProgressStore.getState().setAnalysisProgress(progress);
          }
        },
        (result) => {
          setCompleted((c) => c + 1);
          if (index < imageIds.length - 1) {
            setCurrent(index + 1);
          }
        },
        (error) => {
          console.error(`Image ${imageId} failed:`, error);
          setCompleted((c) => c + 1); // 即使失败也计入完成
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [imageIds]);

  return { completed, current, total: imageIds.length };
};
```

### Testing Requirements

**单元测试:**
- 时间估算算法测试
- 打字机效果测试
- 进度条动画测试

**E2E 测试:**
- 完整上传和分析进度流程
- 批量分析进度流程
- 超时和错误处理流程

**性能测试:**
- 轮询性能(确保不影响 UI)
- 内存使用情况(长时间运行)
- 动画流畅度(60fps)

### Previous Story Intelligence

**从 2-1, 2-2, 2-3 学到的经验:**
- 进度反馈必须准确且及时(每 1-2 秒更新)
- 预计时间需要动态调整(基于实际进度)
- 专业术语滚动可以建立"专业"预期
- 移动端需要简化信息显示

**新增考虑:**
- 批量分析需要两层进度(整体 + 单张)
- 队列透明化可以减少用户焦虑
- 打字机效果增加趣味性和专业感

### Dependencies

**依赖的 Stories:**
- 2-1-image-upload: 基础上传进度
- 2-2-batch-upload: 批量上传进度
- 2-3-upload-validation: 验证失败后的重试进度

**依赖的组件:**
- `src/features/analysis/components/ProgressDisplay/`: 进度显示组件(新建)
- `src/lib/utils/time-estimation.ts`: 时间估算工具(新建)

**后续 Epic:**
- Epic 3: AI 风格分析(将使用分析进度反馈)

### References

- [Source: prd.md#NFR-PERF-2] (实时进度反馈要求)
- [Source: ux-design-specification.md#Feedback-Patterns] (反馈模式)
- [Source: ux-design-specification.md#Progress-Term] (专业术语进度条)
- [Source: epics.md#Epic-2] (Epic 2 完整需求)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(开发代理将在实施过程中填写)

### Completion Notes List

(开发代理将在完成时填写)

### File List

(开发代理将在完成时列出所有创建/修改的文件)
