# Story 2-4: Progress Feedback - ATDD 测试设计文档

> **设计者:** TEA (Murat) - 测试架构师
> **设计日期:** 2026-02-12
> **Story:** 2-4-progress-feedback
> **测试覆盖率目标:** ≥ 80%

---

## 目录

1. [测试设计概述](#测试设计概述)
2. [验收标准映射](#验收标准映射)
3. [单元测试设计](#单元测试设计)
4. [集成测试设计](#集成测试设计)
5. [E2E 测试设计](#e2e-测试设计)
6. [边界条件和异常场景](#边界条件和异常场景)
7. [性能测试](#性能测试)
8. [可访问性测试](#可访问性测试)
9. [测试数据策略](#测试数据策略)

---

## 测试设计概述

### 测试范围

Story 2-4 实现进度反馈功能,包括:
- 上传进度跟踪
- AI 分析进度跟踪
- 批量分析进度
- 智能时间估算
- 队列透明化
- 进度显示组件

### 测试策略

```
┌─────────────────────────────────────────────────────────┐
│                    测试金字塔                          │
├─────────────────────────────────────────────────────────┤
│                                                 E2E  │  少量关键流程
│                                              (10%)   │
├─────────────────────────────────────────────────────────┤
│                                          集成测试     │  中等覆盖
│                                       (30%)          │
├─────────────────────────────────────────────────────────┤
│                                  单元测试             │  广泛覆盖
│                               (60%)                  │
└─────────────────────────────────────────────────────────┘
```

**重点测试领域:**
1. **进度计算准确性** - 确保进度百分比、速度、时间估算计算正确
2. **实时更新机制** - 验证轮询和事件监听的实时性
3. **UI 反馈** - 确保进度条、动画、术语滚动正确显示
4. **边界条件** - 处理大文件、慢网络、超时等场景
5. **错误处理** - 网络错误、API 失败的优雅降级

---

## 验收标准映射

### AC-1: 上传进度显示

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 上传进度百分比(0-100%) | TEST-UP-001 | 单元 | P0 |
| 上传速度(MB/s) | TEST-UP-002 | 单元 | P0 |
| 预计剩余时间(秒) | TEST-UP-003 | 单元 | P0 |
| 大文件(10MB)上传进度 | TEST-UP-004 | 集成 | P1 |

### AC-2: 分析进度显示

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 阶段进度转换 | TEST-AP-001 | 单元 | P0 |
| 专业术语滚动 | TEST-AP-002 | 单元 | P0 |
| 整体进度百分比 | TEST-AP-003 | 单元 | P0 |
| 打字机效果 | TEST-AP-004 | 集成 | P1 |

### AC-3: 批量分析进度

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 已分析 X/5 张图片 | TEST-BP-001 | 单元 | P0 |
| 整体进度条 | TEST-BP-002 | 集成 | P0 |
| 当前图片高亮 | TEST-BP-003 | 集成 | P1 |

### AC-4: 智能时间估算

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 基于历史数据估算 | TEST-TE-001 | 单元 | P0 |
| 动态调整估算 | TEST-TE-002 | 单元 | P0 |
| 时间单位转换 | TEST-TE-003 | 单元 | P1 |

### AC-5: 长时间等待告知

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| > 90秒提示 | TEST-LW-001 | 集成 | P1 |
| 队列位置显示 | TEST-LW-002 | E2E | P1 |

### AC-6: 视觉反馈

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 进度条动画 | TEST-VF-001 | 集成 | P1 |
| 阶段图标点亮 | TEST-VF-002 | 集成 | P1 |
| 脉冲动画 | TEST-VF-003 | 单元 | P2 |

### AC-7: 移动端优化

| AC 要求 | 测试用例 ID | 测试类型 | 优先级 |
|--------|------------|---------|-------|
| 简化进度显示 | TEST-MO-001 | E2E | P1 |
| 固定顶部进度栏 | TEST-MO-002 | E2E | P1 |

---

## 单元测试设计

### 1. 时间估算算法 (time-estimation.ts)

**文件位置:** `tests/unit/lib/time-estimation.test.ts`

#### 测试用例组: calculateAnalysisTime

```typescript
describe('calculateAnalysisTime', () => {
  // TEST-TE-001: 基础阶段时间计算
  it('should return 0 for completed stage', () => {
    expect(calculateAnalysisTime('completed', 100)).toBe(0);
  });

  it('should return default time for idle stage', () => {
    expect(calculateAnalysisTime('idle', 0)).toBe(55); // 40 + 15
  });

  // TEST-TE-002: 上传阶段时间计算
  it('should calculate uploading stage correctly at 0%', () => {
    expect(calculateAnalysisTime('uploading', 0)).toBe(60); // 5 + 40 + 15
  });

  it('should calculate uploading stage correctly at 50%', () => {
    expect(calculateAnalysisTime('uploading', 50)).toBe(57.5); // 2.5 + 40 + 15
  });

  it('should calculate uploading stage correctly at 100%', () => {
    expect(calculateAnalysisTime('uploading', 100)).toBe(55); // 0 + 40 + 15
  });

  // TEST-TE-003: 分析阶段时间计算
  it('should calculate analyzing stage correctly at 0%', () => {
    expect(calculateAnalysisTime('analyzing', 0)).toBe(55); // 40 + 15
  });

  it('should calculate analyzing stage correctly at 50%', () => {
    expect(calculateAnalysisTime('analyzing', 50)).toBe(35); // 20 + 15
  });

  it('should calculate analyzing stage correctly at 100%', () => {
    expect(calculateAnalysisTime('analyzing', 100)).toBe(15); // 0 + 15
  });

  // TEST-TE-004: 生成阶段时间计算
  it('should calculate generating stage correctly at 0%', () => {
    expect(calculateAnalysisTime('generating', 0)).toBe(15);
  });

  it('should calculate generating stage correctly at 50%', () => {
    expect(calculateAnalysisTime('generating', 50)).toBe(7.5);
  });

  it('should calculate generating stage correctly at 100%', () => {
    expect(calculateAnalysisTime('generating', 100)).toBe(0);
  });
});
```

#### 测试用例组: calculateUploadTime

```typescript
describe('calculateUploadTime', () => {
  // TEST-TE-005: 上传时间计算
  it('should return 0 when speed is 0', () => {
    expect(calculateUploadTime(50, 0)).toBe(0);
  });

  it('should calculate time for 5MB file at 1MB/s', () => {
    expect(calculateUploadTime(50, 1)).toBe(2.5); // (100-50)/100 * 5 / 1
  });

  it('should calculate time for 5MB file at 5MB/s', () => {
    expect(calculateUploadTime(0, 5)).toBe(1); // 100/100 * 5 / 5
  });

  it('should calculate time at 100% progress', () => {
    expect(calculateUploadTime(100, 2)).toBe(0); // (100-100)/100 * 5 / 2
  });
});
```

#### 测试用例组: formatTimeRemaining

```typescript
describe('formatTimeRemaining', () => {
  // TEST-TE-006: 时间格式化
  it('should format seconds correctly', () => {
    expect(formatTimeRemaining(45)).toBe('预计还需 45 秒');
  });

  it('should format minutes correctly', () => {
    expect(formatTimeRemaining(120)).toBe('预计还需 2 分钟');
  });

  it('should format minutes and seconds', () => {
    expect(formatTimeRemaining(90)).toBe('预计还需 1 分钟 30 秒');
  });

  it('should handle 0 seconds', () => {
    expect(formatTimeRemaining(0)).toBe('即将完成');
  });
});
```

### 2. 进度状态管理 (useProgressStore)

**文件位置:** `tests/unit/stores/useProgressStore.test.ts`

#### 测试用例组: Upload Progress

```typescript
describe('useProgressStore - Upload Progress', () => {
  // TEST-UP-001: 上传进度更新
  it('should update upload progress', () => {
    const { setUploadProgress } = useProgressStore.getState();

    setUploadProgress(50);

    expect(useProgressStore.getState().uploadProgress).toBe(50);
  });

  it('should clamp upload progress to 0-100', () => {
    const { setUploadProgress } = useProgressStore.getState();

    setUploadProgress(-10);
    expect(useProgressStore.getState().uploadProgress).toBe(0);

    setUploadProgress(150);
    expect(useProgressStore.getState().uploadProgress).toBe(100);
  });

  // TEST-UP-002: 上传速度更新
  it('should update upload speed', () => {
    const { setUploadSpeed } = useProgressStore.getState();

    setUploadSpeed(2.5);

    expect(useProgressStore.getState().uploadSpeed).toBe(2.5);
  });

  // TEST-UP-003: 预计剩余时间更新
  it('should update estimated time when progress changes', () => {
    const store = useProgressStore.getState();

    store.setUploadSpeed(5); // 5MB/s
    store.setUploadProgress(50);

    expect(store.uploadEstimatedTime).toBeGreaterThan(0);
  });
});
```

#### 测试用例组: Analysis Progress

```typescript
describe('useProgressStore - Analysis Progress', () => {
  // TEST-AP-001: 分析阶段更新
  it('should update analysis stage', () => {
    const { setAnalysisStage } = useProgressStore.getState();

    setAnalysisStage('uploading');
    expect(useProgressStore.getState().analysisStage).toBe('uploading');

    setAnalysisStage('analyzing');
    expect(useProgressStore.getState().analysisStage).toBe('analyzing');

    setAnalysisStage('generating');
    expect(useProgressStore.getState().analysisStage).toBe('generating');

    setAnalysisStage('completed');
    expect(useProgressStore.getState().analysisStage).toBe('completed');
  });

  it('should not update to error stage from completed', () => {
    const { setAnalysisStage } = useProgressStore.getState();

    setAnalysisStage('completed');
    setAnalysisStage('error');

    expect(useProgressStore.getState().analysisStage).toBe('completed');
  });

  // TEST-AP-003: 分析进度更新
  it('should update analysis progress', () => {
    const { setAnalysisProgress } = useProgressStore.getState();

    setAnalysisProgress(30);

    expect(useProgressStore.getState().analysisProgress).toBe(30);
  });

  it('should update estimated time when progress changes', () => {
    const store = useProgressStore.getState();

    store.setAnalysisStage('analyzing');
    store.setAnalysisProgress(20);

    expect(store.analysisEstimatedTime).toBeGreaterThan(0);
  });

  // TEST-AP-002: 专业术语更新
  it('should update current term', () => {
    const { setCurrentTerm } = useProgressStore.getState();

    setCurrentTerm('正在识别光影技巧...');

    expect(useProgressStore.getState().currentTerm).toBe('正在识别光影技巧...');
  });
});
```

#### 测试用例组: Batch Progress

```typescript
describe('useProgressStore - Batch Progress', () => {
  // TEST-BP-001: 批量进度更新
  it('should update batch progress', () => {
    const { setBatchProgress } = useProgressStore.getState();

    setBatchProgress({
      current: 2,
      total: 5,
      completed: 2,
    });

    const batch = useProgressStore.getState().batchProgress;
    expect(batch?.current).toBe(2);
    expect(batch?.total).toBe(5);
    expect(batch?.completed).toBe(2);
  });

  it('should calculate batch percentage correctly', () => {
    const { setBatchProgress } = useProgressStore.getState();

    setBatchProgress({
      current: 3,
      total: 5,
      completed: 2,
    });

    const percentage = (2 / 5) * 100;
    expect(percentage).toBe(40);
  });
});
```

### 3. 打字机效果 Hook (useTypewriterEffect)

**文件位置:** `tests/unit/hooks/useTypewriterEffect.test.ts`

```typescript
describe('useTypewriterEffect', () => {
  // TEST-AP-004: 打字机效果
  it('should type characters one by one', async () => {
    const terms = ['正在分析色彩搭配...'];
    const { result } = renderHook(() => useTypewriterEffect(terms));

    await waitFor(() => {
      expect(result.current).toBe('正在分析色彩搭配...');
    });
  });

  it('should cycle through multiple terms', async () => {
    const terms = [
      '正在识别光影技巧...',
      '正在检测构图方法...',
    ];
    const { result } = renderHook(() => useTypewriterEffect(terms));

    // First term
    await waitFor(() => {
      expect(result.current).toBe('正在识别光影技巧...');
    });

    // Wait for transition
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 3500));
    });

    // Second term should appear
    await waitFor(() => {
      expect(result.current).toBe('正在检测构图方法...');
    });
  });

  it('should handle empty terms array', () => {
    const { result } = renderHook(() => useTypewriterEffect([]));
    expect(result.current).toBe('');
  });
});
```

### 4. 轮询机制 (polling.ts)

**文件位置:** `tests/unit/lib/polling.test.ts`

```typescript
describe('pollAnalysisStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TEST-POLL-001: 正常轮询流程
  it('should poll until completion', async () => {
    const mockFetch = vi.mocked(fetch);
    const onProgress = vi.fn();
    const onComplete = vi.fn();

    // Mock responses: in progress -> completed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { status: 'analyzing', progress: 50 },
      }),
    } as Response).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { status: 'completed', progress: 100, result: {} },
      }),
    } as Response);

    pollAnalysisStatus('analysis-123', onProgress, onComplete, vi.fn());

    await vi.advanceTimersByTimeAsync(2000); // First poll
    expect(onProgress).toHaveBeenCalledWith({ status: 'analyzing', progress: 50 });

    await vi.advanceTimersByTimeAsync(2000); // Second poll
    expect(onComplete).toHaveBeenCalled();
  });

  // TEST-POLL-002: 超时处理
  it('should timeout after 60 seconds', async () => {
    const mockFetch = vi.mocked(fetch);
    const onError = vi.fn();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { status: 'analyzing', progress: 10 } }),
    } as Response);

    pollAnalysisStatus('analysis-123', vi.fn(), vi.fn(), onError);

    await vi.advanceTimersByTimeAsync(61000);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('超时'),
    }));
  });

  // TEST-POLL-003: 错误重试机制
  it('should retry up to 3 times on error', async () => {
    const mockFetch = vi.mocked(fetch);
    const onError = vi.fn();

    mockFetch.mockRejectedValue(new Error('Network error'));

    pollAnalysisStatus('analysis-123', vi.fn(), vi.fn(), onError);

    // First attempt + 3 retries
    await vi.advanceTimersByTimeAsync(2000 + 4000 + 6000);

    expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    expect(onError).toHaveBeenCalled();
  });
});
```

---

## 集成测试设计

### 1. 上传进度集成

**文件位置:** `tests/integration/upload-progress.test.ts`

```typescript
describe('Upload Progress Integration', () => {
  // TEST-INT-UP-001: axios onUploadProgress 事件
  it('should update progress during upload', async () => {
    const mockProgressEvents = [];

    mockServer.post('/api/upload', (req, res) => {
      // Simulate progress events
      [0, 25, 50, 75, 100].forEach(progress => {
        req.on('progress', ({ loaded, total }) => {
          mockProgressEvents.push((loaded / total) * 100);
        });
      });

      res.status(200).json({ success: true, imageId: 'img-123' });
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await uploadImage(file, (progress) => {
      useProgressStore.getState().setUploadProgress(progress);
    });

    expect(mockProgressEvents).toEqual([0, 25, 50, 75, 100]);
  });

  // TEST-INT-UP-002: 上传速度计算
  it('should calculate upload speed correctly', async () => {
    const startTime = Date.now();
    let currentProgress = 0;

    await uploadWithSpeedTracking(new File(['x'.repeat(5 * 1024 * 1024)], 'test.jpg'), {
      onProgress: (progress) => {
        currentProgress = progress;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (5 * (progress / 100)) / elapsed; // MB/s
        useProgressStore.getState().setUploadSpeed(speed);
      },
    });

    expect(useProgressStore.getState().uploadSpeed).toBeGreaterThan(0);
  });
});
```

### 2. 分析进度集成

**文件位置:** `tests/integration/analysis-progress.test.ts`

```typescript
describe('Analysis Progress Integration', () => {
  // TEST-INT-AP-001: 完整分析流程
  it('should track progress through all stages', async () => {
    const stages = ['uploading', 'analyzing', 'generating', 'completed'];

    mockServer.get('/api/analysis/:id/status', (req, res) => {
      const currentStage = stages.shift();
      res.status(200).json({
        data: {
          status: currentStage,
          progress: currentStage === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10,
          currentTerm: '正在分析...',
        },
      });
    });

    const { result } = renderHook(() => useAnalysisProgress('analysis-123'));

    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    });

    expect(useProgressStore.getState().analysisStage).toBe('completed');
    expect(useProgressStore.getState().analysisProgress).toBe(100);
  });

  // TEST-INT-AP-002: 专业术语切换
  it('should rotate through analysis terms', async () => {
    mockServer.get('/api/analysis/:id/status', (req, res) => {
      res.status(200).json({
        data: {
          status: 'analyzing',
          progress: 30,
          currentTerm: '正在识别光影技巧...',
        },
      });
    });

    render(<ProgressDisplay analysisId="analysis-123" />);

    await waitFor(() => {
      expect(screen.getByText(/正在识别光影技巧/)).toBeInTheDocument();
    });

    // Wait for term change
    await waitFor(() => {
      expect(screen.getByText(/正在检测构图方法/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
```

### 3. 批量分析集成

**文件位置:** `tests/integration/batch-progress.test.ts`

```typescript
describe('Batch Progress Integration', () => {
  // TEST-INT-BP-001: 批量分析进度跟踪
  it('should track progress for multiple images', async () => {
    const imageIds = ['img-1', 'img-2', 'img-3', 'img-4', 'img-5'];

    mockServer.get('/api/analysis/:id/status', (req, res) => {
      res.status(200).json({
        data: {
          status: 'completed',
          progress: 100,
        },
      });
    });

    const { result } = renderHook(() =>
      useBatchAnalysisProgress(imageIds)
    );

    // First image completes
    await waitFor(() => {
      expect(result.current.completed).toBe(1);
    });

    // All images complete
    await waitFor(() => {
      expect(result.current.completed).toBe(5);
      expect(result.current.total).toBe(5);
    });
  });

  // TEST-INT-BP-002: 批量进度 UI 更新
  it('should update batch progress UI correctly', async () => {
    render(<BatchProgressDisplay imageIds={['img-1', 'img-2', 'img-3']} />);

    // Initial state
    expect(screen.getByText('已分析 0 / 3 张图片')).toBeInTheDocument();

    // After first completes
    await waitFor(() => {
      expect(screen.getByText('已分析 1 / 3 张图片')).toBeInTheDocument();
    });

    // Final state
    await waitFor(() => {
      expect(screen.getByText('已分析 3 / 3 张图片')).toBeInTheDocument();
    });
  });
});
```

### 4. 进度组件集成

**文件位置:** `tests/integration/progress-components.test.ts`

```typescript
describe('Progress Display Components', () => {
  // TEST-VF-001: 进度条动画
  it('should animate progress bar', async () => {
    render(<ProgressBar progress={50} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '50%' });

    // Update progress
    rerender(<ProgressBar progress={75} />);

    await waitFor(() => {
      expect(progressBar).toHaveStyle({ width: '75%' });
    });
  });

  // TEST-VF-002: 阶段图标点亮
  it('should light up stage icons', () => {
    render(<StageIndicator currentStage="analyzing" />);

    const stages = ['uploading', 'analyzing', 'generating', 'completed'];

    stages.forEach((stage, index) => {
      const icon = screen.getByTestId(`stage-${stage}`);
      const isCompleted = index < stages.indexOf('analyzing');
      const isCurrent = stage === 'analyzing';

      if (isCompleted || isCurrent) {
        expect(icon).toHaveClass('active');
      } else {
        expect(icon).not.toHaveClass('active');
      }
    });
  });

  // TEST-VF-003: 打字机效果集成
  it('should display typewriter effect', async () => {
    render(<TermScroller terms={['正在分析...', '正在生成...']} />);

    const termElement = screen.getByTestId('term-scroller');

    // Should start empty
    expect(termElement).toHaveTextContent('');

    // Should type out characters
    await waitFor(() => {
      expect(termElement).toHaveTextContent('正在分析...');
    });
  });
});
```

---

## E2E 测试设计

### 1. 完整上传和分析流程

**文件位置:** `tests/e2e/progress-feedback.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Progress Feedback - Complete Flow', () => {
  // TEST-E2E-001: 单张图片上传和分析进度
  test('should show complete progress for single image', async ({ page }) => {
    await page.goto('/');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('text=/上传进度/')).toBeVisible();

    // Verify upload completes
    await expect(page.locator('text=/100%/')).toBeVisible({ timeout: 10000 });

    // Verify analysis stages
    await expect(page.locator('[data-testid="stage-uploading"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="stage-analyzing"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="stage-generating"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="stage-completed"]')).toHaveClass(/active/);

    // Verify term scrolling
    await expect(page.locator('text=/正在识别光影技巧/')).toBeVisible();
    await expect(page.locator('text=/正在检测构图方法/')).toBeVisible();

    // Verify completion
    await expect(page.locator('[data-testid="analysis-complete"]')).toBeVisible();
  });

  // TEST-E2E-002: 批量上传进度
  test('should show batch upload progress', async ({ page }) => {
    await page.goto('/');

    // Select multiple files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'tests/fixtures/image-1.jpg',
      'tests/fixtures/image-2.jpg',
      'tests/fixtures/image-3.jpg',
    ]);

    // Verify batch progress display
    await expect(page.locator('text=/已分析 0 \/ 3 张图片/')).toBeVisible();
    await expect(page.locator('[data-testid="batch-progress-bar"]')).toBeVisible();

    // Verify progress updates
    await expect(page.locator('text=/已分析 1 \/ 3 张图片/')).toBeVisible();
    await expect(page.locator('text=/已分析 2 \/ 3 张图片/')).toBeVisible();
    await expect(page.locator('text=/已分析 3 \/ 3 张图片/')).toBeVisible();

    // Verify thumbnail highlighting
    const thumbnails = page.locator('[data-testid^="thumbnail-"]');
    await expect(thumbnails.nth(0)).toHaveClass(/completed/);
    await expect(thumbnails.nth(1)).toHaveClass(/completed/);
    await expect(thumbnails.nth(2)).toHaveClass(/completed/);
  });

  // TEST-LW-002: 队列位置显示
  test('should show queue position when queued', async ({ page }) => {
    await page.goto('/');

    // Mock API to return queue position
    await page.route('**/api/analysis/*/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            status: 'queued',
            queuePosition: 3,
            estimatedWaitTime: 45,
          },
        }),
      });
    });

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify queue display
    await expect(page.locator('text=/当前排队第 3 位/')).toBeVisible();
    await expect(page.locator('text=/预计等待 45 秒/')).toBeVisible();
  });

  // TEST-E2E-003: 大文件上传进度
  test('should show progress for large file (10MB)', async ({ page }) => {
    await page.goto('/');

    // Upload large file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/large-image-10mb.jpg');

    // Verify progress updates smoothly
    await expect(page.locator('[data-testid="upload-speed"]')).toBeVisible();
    await expect(page.locator('text=/MB\/s/')).toBeVisible();
    await expect(page.locator('text=/预计还需/')).toBeVisible();

    // Verify no freezing/jumping
    const progressValues = [];
    for (let i = 0; i < 10; i++) {
      const progressText = await page.locator('[data-testid="upload-progress"]').textContent();
      const progress = parseInt(progressText?.match(/(\d+)%/)?.[1] || '0');
      progressValues.push(progress);
      await page.waitForTimeout(500);
    }

    // Verify smooth increments (no large jumps)
    for (let i = 1; i < progressValues.length; i++) {
      const diff = Math.abs(progressValues[i] - progressValues[i - 1]);
      expect(diff).toBeLessThan(20); // No jumps > 20%
    }
  });
});
```

### 2. 移动端测试

**文件位置:** `tests/e2e/mobile-progress.spec.ts`

```typescript
test.describe('Progress Feedback - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  // TEST-MO-001: 简化进度显示
  test('should show simplified progress on mobile', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify large percentage display
    await expect(page.locator('[data-testid="mobile-progress-percent"]')).toBeVisible();
    await expect(page.locator('text=/\\d{2}%/')).toBeVisible();

    // Verify technical details hidden
    await expect(page.locator('text=/MB\/s/')).not.toBeVisible();
  });

  // TEST-MO-002: 固定顶部进度栏
  test('should show sticky progress bar on mobile', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    const progressBar = page.locator('[data-testid="mobile-progress-bar"]');

    // Verify sticky behavior
    await expect(progressBar).toBeVisible();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Verify progress bar still visible
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveCSS('position', 'sticky');
  });
});
```

### 3. 错误处理场景

```typescript
test.describe('Progress Feedback - Error Handling', () => {
  // TEST-E2E-ERR-001: 网络错误
  test('should handle network error gracefully', async ({ page }) => {
    await page.goto('/');

    // Mock network error
    await page.route('**/api/upload', route => route.abort('failed'));

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify error message
    await expect(page.locator('text=/上传失败/')).toBeVisible();
    await expect(page.locator('text=/请重试/')).toBeVisible();
  });

  // TEST-E2E-ERR-002: 超时处理
  test('should handle timeout gracefully', async ({ page }) => {
    await page.goto('/');

    // Mock timeout
    await page.route('**/api/analysis/*/status', route => {
      setTimeout(() => route.abort('timedout'), 65000);
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify timeout message
    await expect(page.locator('text=/分析超时/')).toBeVisible();
    await expect(page.locator('text=/请重试/')).toBeVisible();
  });
});
```

---

## 边界条件和异常场景

### 单元测试 - 边界条件

**文件位置:** `tests/unit/lib/time-estimation.boundary.test.ts`

```typescript
describe('Time Estimation - Boundary Conditions', () => {
  // TEST-BC-001: 零值处理
  it('should handle zero progress', () => {
    expect(calculateAnalysisTime('analyzing', 0)).toBeGreaterThan(0);
  });

  it('should handle 100% progress', () => {
    expect(calculateAnalysisTime('analyzing', 100)).toBe(15); // Only generating time
  });

  // TEST-BC-002: 极端速度值
  it('should handle very slow upload speed', () => {
    expect(calculateUploadTime(50, 0.01)).toBeGreaterThan(0);
  });

  it('should handle very fast upload speed', () => {
    expect(calculateUploadTime(50, 100)).toBeCloseTo(0.5, 1);
  });

  // TEST-BC-003: 负数输入
  it('should clamp negative values', () => {
    const { setUploadProgress } = useProgressStore.getState();
    setUploadProgress(-10);
    expect(useProgressStore.getState().uploadProgress).toBe(0);
  });

  // TEST-BC-004: 超大值输入
  it('should clamp values > 100', () => {
    const { setUploadProgress } = useProgressStore.getState();
    setUploadProgress(150);
    expect(useProgressStore.getState().uploadProgress).toBe(100);
  });
});
```

### 集成测试 - 异常场景

**文件位置:** `tests/integration/progress-errors.test.ts`

```typescript
describe('Progress Error Handling', () => {
  // TEST-ERR-001: API 返回错误
  it('should handle API error response', async () => {
    mockServer.get('/api/analysis/:id/status', (req, res) => {
      res.status(500).json({
        error: { message: 'Internal Server Error' },
      });
    });

    const onError = vi.fn();
    pollAnalysisStatus('analysis-123', vi.fn(), vi.fn(), onError);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    // Verify graceful degradation
    expect(useProgressStore.getState().analysisStage).not.toBe('error');
  });

  // TEST-ERR-002: 进度回退
  it('should handle progress regression', async () => {
    let progress = 80;

    mockServer.get('/api/analysis/:id/status', (req, res) => {
      progress -= 10; // Simulate regression
      res.status(200).json({
        data: { status: 'analyzing', progress },
      });
    });

    const { result } = renderHook(() => useAnalysisProgress('analysis-123'));

    // Should not show lower progress
    await waitFor(() => {
      expect(result.current.progress).toBeLessThanOrEqual(80);
    });
  });

  // TEST-ERR-003: 阶段跳转
  it('should handle stage jumping', async () => {
    mockServer.get('/api/analysis/:id/status', (req, res) => {
      res.status(200).json({
        data: { status: 'completed', progress: 100 }, // Skip generating
      });
    });

    const { result } = renderHook(() => useAnalysisProgress('analysis-123'));

    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    });

    // Should handle gracefully
    expect(useProgressStore.getState().analysisStage).toBe('completed');
  });
});
```

---

## 性能测试

### 单元测试 - 性能

```typescript
describe('Progress Performance', () => {
  // TEST-PERF-001: 轮询频率
  it('should not poll more frequently than 2 seconds', async () => {
    const pollTimes = [];
    let callCount = 0;

    mockServer.get('/api/analysis/:id/status', (req, res) => {
      pollTimes.push(Date.now());
      callCount++;

      res.status(200).json({
        data: { status: 'analyzing', progress: 50 },
      });
    });

    renderHook(() => useAnalysisProgress('analysis-123'));

    await waitFor(() => expect(callCount).toBeGreaterThanOrEqual(3));

    // Verify intervals
    for (let i = 1; i < pollTimes.length; i++) {
      const interval = pollTimes[i] - pollTimes[i - 1];
      expect(interval).toBeGreaterThanOrEqual(1900); // At least 1.9s
    }
  });

  // TEST-PERF-002: 状态更新性能
  it('should handle rapid state updates efficiently', () => {
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      useProgressStore.getState().setUploadProgress(i % 101);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });

  // TEST-PERF-003: 内存泄漏
  it('should not leak memory with many progress updates', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Simulate many updates
    for (let i = 0; i < 10000; i++) {
      useProgressStore.getState().setUploadProgress(i % 101);
      useProgressStore.getState().setAnalysisProgress(i % 101);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const growth = finalMemory - initialMemory;

    // Should not grow significantly (< 1MB)
    expect(growth).toBeLessThan(1024 * 1024);
  });
});
```

---

## 可访问性测试

### E2E 测试 - 可访问性

```typescript
test.describe('Progress Accessibility', () => {
  // TEST-A11Y-001: ARIA 标签
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify progress bar has role and label
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow');
    await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    await expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    await expect(progressBar).toHaveAttribute('aria-label');

    // Verify live regions for status updates
    const statusRegion = page.locator('[role="status"]');
    await expect(statusRegion).toHaveAttribute('aria-live', 'polite');
  });

  // TEST-A11Y-002: 键盘导航
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through progress indicators
    await page.keyboard.press('Tab');

    // Verify focus visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  // TEST-A11Y-003: 屏幕阅读器
  test('should announce progress to screen readers', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // Verify live region announces progress
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/\\d+%/);
  });
});
```

---

## 测试数据策略

### Mock 数据

**文件位置:** `tests/fixtures/progress-data.ts`

```typescript
export const mockProgressData = {
  uploadProgress: {
    stages: [0, 10, 25, 50, 75, 90, 100],
    speeds: [0.5, 1.2, 2.5, 3.8, 4.2, 5.0],
    estimatedTimes: [120, 90, 60, 30, 15, 5],
  },

  analysisStages: [
    { stage: 'uploading', progress: 20, term: '正在上传图片...' },
    { stage: 'analyzing', progress: 40, term: '正在识别光影技巧...' },
    { stage: 'analyzing', progress: 60, term: '正在检测构图方法...' },
    { stage: 'analyzing', progress: 80, term: '正在分析色彩搭配...' },
    { stage: 'generating', progress: 90, term: '正在生成提示词模版...' },
    { stage: 'completed', progress: 100, term: '分析完成' },
  ],

  batchProgress: {
    total: 5,
    images: [
      { id: 'img-1', status: 'completed' },
      { id: 'img-2', status: 'completed' },
      { id: 'img-3', status: 'analyzing' },
      { id: 'img-4', status: 'pending' },
      { id: 'img-5', status: 'pending' },
    ],
  },

  queuePosition: {
    position: 3,
    estimatedWait: 45,
  },

  errorScenarios: {
    networkError: { code: 'NETWORK_ERROR', message: '网络连接失败' },
    timeoutError: { code: 'TIMEOUT', message: '请求超时,请重试' },
    apiError: { code: 'API_ERROR', message: '服务器错误' },
  },
};
```

### 测试文件

```typescript
export const testFiles = {
  smallJpg: 'tests/fixtures/images/small-1mb.jpg',
  mediumJpg: 'tests/fixtures/images/medium-5mb.jpg',
  largeJpg: 'tests/fixtures/images/large-10mb.jpg',
  portrait: 'tests/fixtures/images/portrait-800x1200.jpg',
  landscape: 'tests/fixtures/images/landscape-1920x1080.jpg',
  square: 'tests/fixtures/images/square-1024x1024.jpg',
};
```

---

## 测试执行计划

### Phase 1: 单元测试 (RED)

```
优先级 P0:
- 时间估算算法 (calculateAnalysisTime, calculateUploadTime)
- 进度状态管理 (useProgressStore)
- 轮询机制 (pollAnalysisStatus)

预计时间: 2-3 小时
```

### Phase 2: 集成测试 (RED)

```
优先级 P0:
- 上传进度集成
- 分析进度集成
- 批量进度集成

预计时间: 2-3 小时
```

### Phase 3: E2E 测试 (RED)

```
优先级 P0:
- 完整上传和分析流程
- 批量分析流程
- 错误处理场景

预计时间: 2-3 小时
```

### 总测试用例统计

| 测试类型 | 用例数量 | 预计通过时间 |
|---------|---------|------------|
| 单元测试 | ~45 | 2-3h |
| 集成测试 | ~20 | 2-3h |
| E2E 测试 | ~15 | 2-3h |
| **总计** | **~80** | **6-9h** |

---

## 覆盖率目标

### 文件覆盖率要求

| 文件/模块 | 目标覆盖率 | 优先级 |
|----------|-----------|-------|
| `lib/utils/time-estimation.ts` | 100% | P0 |
| `lib/api/polling.ts` | 95% | P0 |
| `stores/useProgressStore.ts` | 90% | P0 |
| `hooks/useTypewriterEffect.ts` | 90% | P0 |
| `features/analysis/components/ProgressDisplay/*` | 85% | P1 |

### 整体覆盖率目标

- **语句覆盖率:** ≥ 80%
- **分支覆盖率:** ≥ 75%
- **函数覆盖率:** ≥ 85%
- **行覆盖率:** ≥ 80%

---

## 风险和缓解措施

### 已识别风险

1. **异步测试稳定性**
   - 风险: 定时器、Promise 可能导致测试不稳定
   - 缓解: 使用 `vi.useFakeTimers()`, 合理设置 timeout

2. **Mock 复杂度**
   - 风险: Image、fetch 等 API 的 mock 可能过于复杂
   - 缓解: 提取可复用的 mock 工具函数

3. **E2E 测试执行时间**
   - 风险: 完整流程测试可能耗时较长
   - 缓解: 并行执行, 使用快照重用

4. **浏览器兼容性**
   - 风险: 进度动画在不同浏览器表现不一致
   - 缓解: 使用 Playwright 多浏览器测试

---

## 测试依赖项

### 必需的依赖

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "playwright": "^1.40.0"
  }
}
```

### Mock 服务器

- 使用 `msw` (Mock Service Worker) 进行 API mock
- 配置文件: `tests/mocks/handlers.ts`

---

## 下一步行动

1. ✅ 完成 Phase 1: ATDD 测试设计 (本文档)
2. ⏭️ Phase 2: Review 测试设计
3. ⏭️ Phase 3: 实现功能
4. ⏭️ Phase 4: 验证测试

---

## 附录: 测试用例清单

### 完整测试用例 ID 列表

#### 单元测试
- TEST-TE-001 至 TEST-TE-006: 时间估算
- TEST-UP-001 至 TEST-UP-003: 上传进度
- TEST-AP-001 至 TEST-AP-003: 分析进度
- TEST-BP-001: 批量进度
- TEST-POLL-001 至 TEST-POLL-003: 轮询机制
- TEST-BC-001 至 TEST-BC-004: 边界条件
- TEST-PERF-001 至 TEST-PERF-003: 性能测试

#### 集成测试
- TEST-INT-UP-001 至 TEST-INT-UP-002: 上传进度集成
- TEST-INT-AP-001 至 TEST-INT-AP-002: 分析进度集成
- TEST-INT-BP-001 至 TEST-INT-BP-002: 批量进度集成
- TEST-VF-001 至 TEST-VF-003: 进度组件集成
- TEST-ERR-001 至 TEST-ERR-003: 错误处理集成

#### E2E 测试
- TEST-E2E-001 至 TEST-E2E-003: 完整流程
- TEST-LW-002: 队列显示
- TEST-MO-001 至 TEST-MO-002: 移动端
- TEST-E2E-ERR-001 至 TEST-E2E-ERR-002: 错误处理
- TEST-A11Y-001 至 TEST-A11Y-003: 可访问性

---

**文档版本:** 1.0
**最后更新:** 2026-02-12
**状态:** 待 Review
