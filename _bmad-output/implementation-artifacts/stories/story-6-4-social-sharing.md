# Story 6.4: social-sharing

Status: ready-for-dev

## Story

As a 创作者
I want 将生成的图片直接分享到社交媒体平台
so that 我可以快速展示我的作品,提升影响力并获得用户反馈

## Acceptance Criteria

1. **AC1:** 社交分享支持多个主流平台:
   - 支持分享到 Twitter/X
   - 支持分享到微信(生成二维码)
   - 支持分享到微博
   - 支持分享到小红书
   - 支持"复制链接"功能

2. **AC2:** 社交分享提供便捷的分享流程:
   - 一键分享到目标平台(自动打开分享页面)
   - 自动生成分享文案(包含模版名称、生成参数)
   - 自动附加图片预览
   - 支持自定义分享文案

3. **AC3:** 社交分享支持移动端:
   - 移动端调用原生分享 API(如果可用)
   - 移动端显示平台选择菜单
   - 移动端优化分享流程(减少步骤)

4. **AC4:** 社交分享提供用户友好的反馈:
   - 分享成功显示 Toast 通知
   - 分享失败显示错误提示和重试选项
   - 分享进度显示(如果需要上传)

5. **AC5:** 社交分享遵循 UX 设计规范:
   - 使用 Glassmorphism 分享对话框
   - 使用 Lucide 图标(Share2, Twitter, Link, Copy, QrCode)
   - 支持 300ms 平滑动画过渡
   - 响应式设计支持桌面端和移动端

## Tasks / Subtasks

- [ ] **Task 1: 创建社交分享数据结构和类型定义** (AC: 1, 2)
  - [ ] 1.1 定义 `SocialPlatform` 枚举(Twitter, WeChat, Weibo, Xiaohongshu)
  - [ ] 1.2 定义 `ShareOptions` 接口(平台、文案、图片)
  - [ ] 1.3 定义 `ShareResult` 接口(成功、失败、URL)
  - [ ] 1.4 定义平台特定配置(分享 URL、API 端点)

- [ ] **Task 2: 实现各平台分享功能** (AC: 1, 2, 4)
  - [ ] 2.1 实现 Twitter 分享(使用 Web Intent API)
  - [ ] 2.2 实现微信分享(生成二维码)
  - [ ] 2.3 实现微博分享(使用分享 API)
  - [ ] 2.4 实现小红书分享(复制链接 + 引导)
  - [ ] 2.5 实现复制链接功能

- [ ] **Task 3: 实现分享文案生成** (AC: 2)
  - [ ] 3.1 创建 `generateShareText` 函数(默认文案)
  - [ ] 3.2 实现文案模板系统(支持变量替换)
  - [ ] 3.3 实现自定义文案编辑
  - [ ] 3.4 实现多语言文案支持

- [ ] **Task 4: 实现分享对话框组件** (AC: 2, 5)
  - [ ] 4.1 创建 `ShareDialog` 组件
  - [ ] 4.2 实现平台选择 UI(网格布局)
  - [ ] 4.3 实现分享文案编辑器
  - [ ] 4.4 实现图片预览
  - [ ] 4.5 应用 Glassmorphism 样式

- [ ] **Task 5: 实现微信分享二维码** (AC: 1, 5)
  - [ ] 5.1 创建 `WeChatQRCode` 组件
  - [ ] 5.2 实现二维码生成逻辑(qrcode.js)
  - [ ] 5.3 实现扫码引导文案
  - [ ] 5.4 实现下载二维码功能

- [ ] **Task 6: 实现移动端原生分享** (AC: 3)
  - [ ] 6.1 检测 Web Share API 支持
  - [ ] 6.2 实现原生分享调用
  - [ ] 6.3 实现降级方案(不支持时使用对话框)
  - [ ] 6.4 优化移动端分享流程

- [ ] **Task 7: 集成分享功能到生成预览** (AC: 1, 2)
  - [ ] 7.1 修改 `GenerationPreviewDialog` 添加分享按钮
  - [ ] 7.2 实现分享快捷操作(单个图片)
  - [ ] 7.3 实现批量分享(多张图片)

- [ ] **Task 8: 实现分享错误处理和重试** (AC: 4)
  - [ ] 8.1 实现分享失败错误检测
  - [ ] 8.2 实现友好错误提示
  - [ ] 8.3 实现重试按钮

- [ ] **Task 9: 单元测试**
  - [ ] 9.1 测试分享文案生成
  - [ ] 9.2 测试各平台分享 URL 生成
  - [ ] 9.3 测试二维码生成

- [ ] **Task 10: 集成测试**
  - [ ] 10.1 测试完整分享流程(选择平台 → 生成文案 → 分享)
  - [ ] 10.2 测试各平台分享
  - [ ] 10.3 测试移动端分享

- [ ] **Task 11: E2E 测试**
  - [ ] 11.1 测试完整用户流程(生成 → 预览 → 分享 → 成功通知)
  - [ ] 11.2 视觉回归测试(分享对话框快照)

## Dev Notes

### 业务上下文

**Epic 6 目标:** AI 图片生成 - 用户可以使用模版直接生成同风格新图片,并分享到社交媒体

**Story 6.4 定位:** Epic 6 的第四个故事,专注于社交分享功能。在完成图片生成和保存后,本故事解决用户分享作品到社交平台的需求。

**用户价值:**
- 创作者:快速分享作品,提升影响力
- 营销人员:一键发布到多个平台,提高效率
- 所有用户:展示创意,获得反馈

**为什么这个功能重要:**
- 社交分享是产品传播的重要渠道
- 降低分享门槛可以提升用户分享意愿
- 多平台支持满足不同用户需求
- 移动端优化提升移动用户体验

### 相关功能需求(FR)

- **FR38:** 系统可以支持将生成的图片分享到社交媒体
- **FR39:** 系统可以支持一键分享到多个平台
- **FR40:** 系统可以自动生成分享文案
- **FR41:** 系统可以支持自定义分享文案

**前置依赖:**
- **Story 6.1:** 图片生成(生成结果需要分享)
- **Story 6.3:** 图片保存(分享前可先保存)

### 架构约束

**技术栈:**
- 前端框架:Next.js 15+ (App Router)
- 状态管理:Zustand
- UI 组件:MUI + Tailwind CSS
- 图标库:Lucide React
- 二维码生成:qrcode.js
- 类型检查:TypeScript

**命名规范:**
- 组件:PascalCase(`ShareDialog`, `WeChatQRCode`)
- 函数/变量:camelCase(`shareToTwitter`, `generateShareText`)
- 类型/接口:PascalCase(`SocialPlatform`, `ShareOptions`)
- 常量:UPPER_SNAKE_CASE(`SOCIAL_PLATFORMS`)

**项目结构:**
```
src/features/generation/
├── components/
│   ├── ShareDialog/
│   │   ├── index.tsx
│   │   ├── ShareDialog.tsx  # 分享对话框
│   │   ├── PlatformSelector.tsx  # 平台选择器
│   │   ├── ShareTextEditor.tsx  # 文案编辑器
│   │   └── ImagePreview.tsx  # 图片预览
│   └── WeChatQRCode/
│       ├── index.tsx
│       └── WeChatQRCode.tsx  # 微信二维码
├── lib/
│   ├── social-share.ts  # 社交分享逻辑
│   ├── share-text-generator.ts  # 分享文案生成
│   └── platform-configs.ts  # 平台配置
└── stores/
    └── social-share.store.ts  # 分享状态管理
```

### 数据结构设计

**SocialPlatform 枚举:**
```typescript
enum SocialPlatform {
  TWITTER = 'twitter',
  WECHAT = 'wechat',
  WEIBO = 'weibo',
  XIAOHONGSHU = 'xiaohongshu',
  LINK = 'link',  // 复制链接
}
```

**ShareOptions 接口:**
```typescript
interface ShareOptions {
  platform: SocialPlatform;
  imageUrl: string;
  title?: string;
  text?: string;
  hashtags?: string[];
  via?: string;  // 归属账号
}
```

**ShareResult 接口:**
```typescript
interface ShareResult {
  success: boolean;
  url?: string;  // 分享链接(如适用)
  error?: string;
}
```

### API 集成设计

**Twitter 分享:**
```typescript
function shareToTwitter(options: ShareOptions): ShareResult {
  const text = encodeURIComponent(options.text || '');
  const url = encodeURIComponent(options.imageUrl);
  const hashtags = options.hashtags?.join(',') || '';
  const via = options.via || 'imageanalyzer';

  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`;

  window.open(twitterUrl, '_blank', 'width=600,height=400');

  return { success: true };
}
```

**微博分享:**
```typescript
function shareToWeibo(options: ShareOptions): ShareResult {
  const title = encodeURIComponent(options.text || '');
  const url = encodeURIComponent(options.imageUrl);
  const pic = encodeURIComponent(options.imageUrl);

  const weiboUrl = `https://service.weibo.com/share/share.php?title=${title}&url=${url}&pic=${pic}`;

  window.open(weiboUrl, '_blank', 'width=600,height=400');

  return { success: true };
}
```

**微信分享(二维码):**
```typescript
async function shareToWeChat(options: ShareOptions): Promise<ShareResult> {
  // 生成分享链接
  const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(options.imageUrl)}`;

  // 生成二维码
  const qrCode = await generateQRCode(shareUrl);

  return { success: true, url: shareUrl };
}
```

### UI/UX 设计规范

**Glassmorphism 样式:**
- 分享对话框使用 `ia-glass-card` 类
- 平台选择器使用网格布局

**图标系统:**
- 分享图标: `<Share2 size={20} className="text-blue-500" />`
- Twitter 图标: `<Twitter size={24} className="text-blue-400" />`
- 微信图标: `<MessageCircle size={24} className="text-green-500" />`
- 微博图标: `<Radio size={24} className="text-red-500" />`
- 复制链接: `<Link size={24} className="text-gray-500" />`

**分享对话框样式:**
```
┌─────────────────────────────────────────────────────────┐
│  分享到社交媒体                              [X]         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Twitter] [微信] [微博] [小红书] [复制链接]       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 分享文案:                                         │  │
│  │ [我用 AI 生成了这张图片,太酷了! #AI #图片生成]    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [图片预览]                                        │  │
│  └───────────────────────────────────────────────────┘  │
│  [取消] [分享]                                        │
└─────────────────────────────────────────────────────────┘
```

### 性能要求

- 分享对话框打开延迟:< 100ms
- 二维码生成延迟:< 500ms
- 分享 URL 生成延迟:< 50ms

### 安全考虑

- **URL 安全:** 对分享 URL 进行编码
- **内容安全:** 验证分享内容,防止恶意链接
- **用户隐私:** 不暴露用户敏感信息

### 依赖关系

**前置依赖:**
- ✅ Story 6.1: 图片生成
- ✅ Story 6.3: 图片保存

**后置依赖:**
- 🟡 Story 6.5: 分享奖励

### Project Context Reference

**项目位置:** `/Users/muchao/code/image_analyzer`

**相关文档:**
- Story 6.1: 图片生成
- Story 6.3: 图片保存

**下一步工作:**
- Story 6.5: 分享奖励

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

_待开发时填写_
