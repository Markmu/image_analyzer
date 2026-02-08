# Story 2.3: upload-validation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为一名 **系统管理员或产品经理**,
我希望 **系统能够智能验证用户上传的图片,检测不适合分析的场景并提供友好的改进建议**,
以便 **减少无效的 API 调用成本,提高用户体验,避免用户沮丧感**。

## Acceptance Criteria

1. **[AC-1]** 系统可以检测不适合分析的图片
   - **场景复杂度**: 识别主体数量 > 5 个
   - **分辨率过低**: < 200×200px
   - **分辨率过高**: > 8192×8192px
   - **文件损坏**: 无法读取图片元数据

2. **[AC-2]** 系统提供友好的错误信息和可操作建议
   - **格式错误**: "仅支持 JPEG、PNG、WebP 格式"
   - **文件过大**: "图片大小超过 10MB,请压缩后重试"
   - **复杂场景**: "这张图片包含多个主体,建议使用单主体图片以获得更好的分析效果"
   - **分辨率过低**: "图片分辨率过低,建议使用至少 200×200px 的图片"

3. **[AC-3]** 系统在检测到复杂图片时提供降级处理选项
   - 显示警告: "这张图片可能不适合分析"
   - 提供"继续尝试"和"更换图片"选项
   - 如果用户继续,在结果中标注置信度

4. **[AC-4]** 系统集成本地图片验证(快速)和 API 验证(深度)
   - **本地验证**: 格式、大小、分辨率(即时)
   - **API 验证**: 复杂度、置信度(调用 Replicate 视觉模型)
   - 本地验证通过后再调用 API 验证

5. **[AC-5]** 系统提供首次使用引导和教育
   - 首次上传时显示最佳实践提示
   - 推荐场景: "单主体、静态场景、清晰风格特征"
   - 不推荐场景: "多主体、动态场景、模糊图像"
   - 显示示例图片对比

6. **[AC-6]** 系统记录验证失败的数据用于产品优化
   - 记录失败原因统计
   - 记录用户重试后的成功率
   - 用于改进验证算法

7. **[AC-7]** 移动端优化
   - 简化错误提示(折叠技术细节)
   - 提供"查看详细建议"展开选项
   - 触摸友好的"重试"和"更换图片"按钮

## Tasks / Subtasks

- [ ] **Task 1: 实现本地图片验证逻辑** (AC: 1, 4)
  - [ ] Subtask 1.1: 创建图片验证工具模块
    - 位置: `src/lib/utils/image-validation.ts`
    - 函数: `validateImageFormat()`, `validateImageSize()`, `validateImageResolution()`
  - [ ] Subtask 1.2: 实现复杂度启发式检测
    - 基于文件大小和分辨率的简单规则
    - 例如: (文件大小 > 5MB 且 分辨率 > 4000px) 可能包含多主体
  - [ ] Subtask 1.3: 实现图片元数据读取
    - 使用 browser-image-compression 库
    - 读取 width, height, size, format

- [ ] **Task 2: 集成 Replicate API 进行深度验证** (AC: 1, 3, 4)
  - [ ] Subtask 2.1: 创建视觉模型 API 客户端
    - 位置: `src/lib/replicate/vision.ts`
    - 函数: `validateImageComplexity(imageUrl)`
  - [ ] Subtask 2.2: 实现复杂度分析 API 调用
    - 模型: Qwen VL 或 GPT-4V
    - 提示词: 分析图片复杂度(主体数量、场景类型)
  - [ ] Subtask 2.3: 解析 API 响应并提取置信度
    - 主体数量、复杂度评分、置信度

- [ ] **Task 3: 增强 API 端点添加验证逻辑** (AC: 1, 2, 3, 4)
  - [ ] Subtask 3.1: 在上传 API 中添加本地验证
    - 立即返回格式、大小、分辨率错误
    - 减少无效的 R2 上传
  - [ ] Subtask 3.2: 添加 API 验证端点
    - `POST /api/validate` - 接收已上传的图片 URL
    - 调用 Replicate API 进行复杂度分析
  - [ ] Subtask 3.3: 实现降级处理逻辑
    - 置信度 < 60% 时返回警告
    - 提供"继续"或"取消"选项给用户

- [ ] **Task 4: 实现 ValidationUI 前端组件** (AC: 2, 3, 5, 7)
  - [ ] Subtask 4.1: 创建验证状态显示组件
    - 位置: `src/features/analysis/components/ValidationStatus/`
    - 显示: ✓通过, ⚠️警告, ✗失败
  - [ ] Subtask 4.2: 实现错误信息展示组件
    - 友好的错误提示
    - 可操作的建议
    - "查看详细建议"展开选项(移动端)
  - [ ] Subtask 4.3: 实现首次使用引导组件
    - 最佳实践提示
    - 示例图片对比
    - "知道了"按钮关闭引导

- [ ] **Task 5: 实现用户教育和帮助系统** (AC: 5)
  - [ ] Subtask 5.1: 创建帮助内容
    - 位置: `docs/upload-guide.md`
    - 内容: 最佳实践、推荐场景、常见问题
  - [ ] Subtask 5.2: 实现上下文帮助提示
    - 悬停提示框
    - 链接到帮助文档
  - [ ] Subtask 5.3: 实现示例图片画廊
    - 好的示例 vs 坏的示例
    - 对比说明

- [ ] **Task 6: 实现验证数据收集和分析** (AC: 6)
  - [ ] Subtask 6.1: 创建验证日志表(可选)
    - `validation_logs` 表
    - 字段: user_id, image_id, failure_reason, timestamp
  - [ ] Subtask 6.2: 记录验证失败事件
    - 在 API 中记录失败原因
    - 不记录敏感信息(图片内容)
  - [ ] Subtask 6.3: 创建管理员仪表板(可选)
    - 显示验证失败统计
    - 按失败原因分组

- [ ] **Task 7: 编写单元测试和 E2E 测试**
  - [ ] Subtask 7.1: 测试各种验证场景
  - [ ] Subtask 7.2: 测试错误提示准确性
  - [ ] Subtask 7.3: 测试降级处理流程

## Dev Notes

### Epic Context

**当前进度**: Epic 2 的第三个故事
- **前置故事**: 2-1-image-upload, 2-2-batch-upload
- **后续故事**: 2-4-progress-feedback

**业务价值**: 智能验证可以:
- 减少 Replicate API 调用成本(避免无效分析)
- 提高用户体验(友好提示而非技术错误)
- 建立用户信任(专业建议)

### Architecture Requirements

**图片验证流程:**
```
用户上传图片 → 本地验证(即时) → R2 上传 → API 验证(深度) → 分析/警告
                 ↓                    ↓
              格式/大小错误      复杂度/置信度警告
                 ↓                    ↓
            友好错误提示        降级处理选项
```

**本地验证工具:**
```typescript
// src/lib/utils/image-validation.ts

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string; // INVALID_FORMAT, FILE_TOO_LARGE, RESOLUTION_TOO_LOW
  message: string; // 用户友好的错误信息
  details?: Record<string, unknown>;
}

export interface ValidationWarning {
  code: string; // COMPLEX_SCENE, LOW_CONFIDENCE
  message: string; // 警告信息
  suggestion: string; // 改进建议
  confidence?: number; // 置信度评分
}

// 格式验证
export const validateImageFormat = (file: File): ValidationResult => {
  const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validFormats.includes(file.type)) {
    return {
      valid: false,
      errors: [{
        code: 'INVALID_FORMAT',
        message: '仅支持 JPEG、PNG、WebP 格式',
        details: { receivedFormat: file.type },
      }],
      warnings: [],
    };
  }
  return { valid: true, errors: [], warnings: [] };
};

// 大小验证
export const validateImageSize = (file: File): ValidationResult => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      errors: [{
        code: 'FILE_TOO_LARGE',
        message: '图片大小超过 10MB,请压缩后重试',
        details: {
          fileSize: file.size,
          maxSize: maxSize,
        },
      }],
      warnings: [],
    };
  }
  return { valid: true, errors: [], warnings: [] };
};

// 分辨率验证
export const validateImageResolution = async (
  file: File
): Promise<ValidationResult> => {
  const image = await loadImage(file);
  const { width, height } = image;

  if (width < 200 || height < 200) {
    return {
      valid: false,
      errors: [{
        code: 'RESOLUTION_TOO_LOW',
        message: '图片分辨率过低,建议使用至少 200×200px 的图片',
        details: { width, height },
      }],
      warnings: [],
    };
  }

  if (width > 8192 || height > 8192) {
    return {
      valid: false,
      errors: [{
        code: 'RESOLUTION_TOO_HIGH',
        message: '图片分辨率过高,请使用小于 8192×8192px 的图片',
        details: { width, height },
      }],
      warnings: [],
    };
  }

  return { valid: true, errors: [], warnings: [] };
};

// 复杂度启发式检测(本地)
export const detectImageComplexity = (
  file: File,
  width: number,
  height: number
): ValidationResult => {
  // 启发式规则: 文件大小与分辨率的比值
  const pixelCount = width * height;
  const bytesPerPixel = file.size / pixelCount;

  // 高质量图片通常 bytesPerPixel 在 0.5-3 之间
  // 过高可能包含多个主体或复杂场景
  if (bytesPerPixel > 5) {
    return {
      valid: true,
      errors: [],
      warnings: [{
        code: 'COMPLEX_SCENE',
        message: '这张图片可能包含多个主体或复杂场景',
        suggestion: '建议使用单主体、风格明显的图片以获得更好的分析效果',
        confidence: 0.6, // 启发式估计
      }],
    };
  }

  return { valid: true, errors: [], warnings: [] };
};
```

**API 验证(深度分析):**
```typescript
// src/lib/replicate/vision.ts

export interface ComplexityAnalysis {
  subjectCount: number; // 主体数量
  complexity: 'low' | 'medium' | 'high'; // 复杂度
  confidence: number; // 置信度 0-1
  reason: string; // 分析原因
}

export const validateImageComplexity = async (
  imageUrl: string
): Promise<ComplexityAnalysis> => {
  const response = await replicate.run('qwen-vl', {
    input: {
      image: imageUrl,
      prompt: `Analyze this image and estimate:
1. How many main subjects/objects are in the image?
2. Is the scene simple (single subject) or complex (multiple subjects, dynamic action)?
3. Rate your confidence in this analysis (0-1).

Return JSON format:
{
  "subjectCount": number,
  "complexity": "low" | "medium" | "high",
  "confidence": number,
  "reason": "explanation"
}`,
    },
  });

  return JSON.parse(response.output);
};
```

**API 端点设计:**
```typescript
// POST /api/validate
// Request:
{
  imageUrl: string
}

// Success Response (200):
{
  success: true,
  data: {
    valid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    analysis: {
      subjectCount: number,
      complexity: string,
      confidence: number,
    }
  }
}

// 降级处理响应 (200 with warning):
{
  success: true,
  data: {
    valid: true,
    errors: [],
    warnings: [{
      code: 'LOW_CONFIDENCE',
      message: '这张图片可能不适合分析',
      suggestion: '建议使用单主体图片,或继续尝试',
      confidence: 0.45,
    }],
    analysis: { /* ... */ },
  }
}
```

### UX Requirements

**首次使用引导:**
```tsx
// FirstTimeGuide 组件
<Paper
  sx={{
    p: 3,
    mb: 3,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid #22C55E',
    borderRadius: 2,
  }}
>
  <Typography variant="h6" gutterBottom>
    ✨ 最佳实践提示
  </Typography>
  <Typography variant="body2" paragraph>
    为了获得最好的分析效果,建议使用:
  </Typography>
  <ul>
    <li>✓ 单个主体(人物、物体或产品)</li>
    <li>✓ 静态场景(非动作照片)</li>
    <li>✓ 清晰的风格特征(明显的光影、色彩、构图)</li>
  </ul>
  <Typography variant="body2" paragraph>
    避免使用:
  </Typography>
  <ul>
    <li>✗ 多个主体(>5个)</li>
    <li>✗ 动态场景(运动照片)</li>
    <li>✗ 模糊或低分辨率图片</li>
  </ul>
  <Button onClick={dismissGuide}>知道了</Button>
</Paper>
```

**错误信息展示:**
```tsx
// ValidationAlert 组件
<Alert
  severity={errors.length > 0 ? 'error' : 'warning'}
  sx={{ mb: 2 }}
>
  <AlertTitle>
    {errors.length > 0 ? '图片验证失败' : '图片可能不适合分析'}
  </AlertTitle>
  <List>
    {errors.map((error, index) => (
      <ListItem key={index}>
        <ListItemText
          primary={error.message}
          secondary={error.details && (
            <Button
              size="small"
              onClick={() => showDetails(error)}
            >
              查看详细建议
            </Button>
          )}
        />
      </ListItem>
    ))}
    {warnings.map((warning, index) => (
      <ListItem key={index}>
        <ListItemText
          primary={warning.message}
          secondary={warning.suggestion}
        />
      </ListItem>
    ))}
  </List>
  {warnings.length > 0 && (
    <DialogActions>
      <Button onClick={cancelUpload}>更换图片</Button>
      <Button onClick={continueUpload} variant="contained">
        继续尝试
      </Button>
    </DialogActions>
  )}
</Alert>
```

**移动端优化:**
```tsx
// 移动端简化错误提示
<Alert severity="error" sx={{ mb: 2 }}>
  <AlertTitle>图片格式不支持</AlertTitle>
  <Typography variant="body2">
    仅支持 JPEG、PNG、WebP 格式
  </Typography>
  <Button
    size="small"
    onClick={() => setExpanded(true)}
  >
    查看详细建议
  </Button>
  <Collapse in={expanded}>
    <Alert severity="info">
      <Typography variant="caption">
        • JPEG: 适合照片<br />
        • PNG: 适合图形和透明图<br />
        • WebP: 现代格式,文件更小
      </Typography>
    </Alert>
  </Collapse>
</Alert>
```

### Implementation Patterns

**验证流程模式:**
```typescript
// 组合验证函数
export const validateImageUpload = async (
  file: File
): Promise<ValidationResult> => {
  // 1. 本地验证(即时)
  const formatResult = validateImageFormat(file);
  if (!formatResult.valid) return formatResult;

  const sizeResult = validateImageSize(file);
  if (!sizeResult.valid) return sizeResult;

  const resolutionResult = await validateImageResolution(file);
  if (!resolutionResult.valid) return resolutionResult;

  // 2. 启发式检测(快速)
  const image = await loadImage(file);
  const complexityResult = detectImageComplexity(
    file,
    image.width,
    image.height
  );

  return complexityResult;
};

// React Hook
export const useImageValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validate = async (file: File) => {
    setIsValidating(true);
    try {
      const validationResult = await validateImageUpload(file);
      setResult(validationResult);
      return validationResult;
    } finally {
      setIsValidating(false);
    }
  };

  return { isValidating, result, validate };
};
```

**API 调用模式:**
```typescript
// React Query hook for API validation
const useApiValidation = () => {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('验证失败');
      }

      return response.json();
    },
  });
};
```

### Testing Requirements

**单元测试:**
- 各种格式验证测试
- 大小限制测试
- 分辨率限制测试
- 复杂度检测测试(启发式规则)

**E2E 测试:**
- 上传不支持的格式 → 显示错误
- 上传超大文件 → 显示错误
- 上传低分辨率图片 → 显示错误
- 上传复杂图片 → 显示警告 + 降级选项
- 首次使用 → 显示引导

**测试数据:**
- 准备各种格式的测试图片
- 准备不同大小的测试图片
- 准备不同分辨率的测试图片
- 准备复杂场景的测试图片

### Previous Story Intelligence

**从 2-1, 2-2 学到的经验:**
- 图片验证应该尽早进行(本地验证)以节省成本
- 错误信息必须友好且可操作
- 移动端需要简化显示(折叠详细信息)

**新增考虑:**
- API 验证(Replicate 调用)有成本,应该只对本地验证通过的图片进行
- 降级处理让用户有选择权,而非强制拒绝
- 首次使用引导可以减少验证失败率

### Dependencies

**依赖的 Stories:**
- 2-1-image-upload: 基础上传功能
- 2-2-batch-upload: 批量上传(需要批量验证)

**依赖的组件:**
- `src/lib/utils/image-validation.ts`: 验证工具(新建)
- `src/lib/replicate/vision.ts`: 视觉模型 API(新建)

**后续 Stories:**
- 2-4-progress-feedback: 将使用验证结果进行智能进度估算

### References

- [Source: prd.md#Journey-3] (错误恢复场景)
- [Source: prd.md#Functional-Requirements] (FR8-12)
- [Source: architecture.md#Error-Handling] (错误处理模式)
- [Source: ux-design-specification.md#Empty-States-and-Loading-States] (错误状态设计)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

(开发代理将在实施过程中填写)

### Completion Notes List

(开发代理将在完成时填写)

### File List

(开发代理将在完成时列出所有创建/修改的文件)
