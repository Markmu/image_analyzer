# Story 6.5: sharing-rewards

Status: ready-for-dev

## Story

As a 创作者
I want 分享生成的图片到社交媒体后获得奖励
so that 我可以更有动力分享作品,同时帮助产品传播

## Acceptance Criteria

1. **AC1:** 分享奖励支持积分系统:
   - 首次分享到指定平台获得 50 积分
   - 每日分享上限 100 积分(2次)
   - 不同平台积分独立计算
   - 积分实时显示和更新

2. **AC2:** 分享奖励支持多种奖励类型:
   - 积分奖励(主要)
   - Credit 奖励(1 积分 = 0.1 Credit)
   - 徽章奖励(分享达人、社交之星)
   - 特殊模版解锁(分享 10 次解锁)

3. **AC3:** 分享奖励提供用户友好的反馈:
   - 分享成功显示奖励通知
   - 显示获得的积分数量
   - 显示累计积分和等级
   - 显示每日剩余分享次数

3. **AC4:** 分享奖励处理防滥用:
   - 验证分享行为(检测重复分享)
   - 24 小时冷却时间
   - 同一图片只能奖励一次
   - 检测异常分享行为

4. **AC5:** 分享奖励遵循 UX 设计规范:
   - 使用 Glassmorphism 奖励对话框
   - 使用 Lucide 图标(Gift, Award, Star, Trophy)
   - 支持 300ms 平滑动画过渡
   - 响应式设计支持桌面端和移动端

## Tasks / Subtasks

- [ ] **Task 1: 创建奖励系统数据结构和类型定义** (AC: 1, 2)
  - [ ] 1.1 定义 `RewardType` 枚举(积分, Credit, 徽章, 模版)
  - [ ] 1.2 定义 `ShareReward` 接口(类型、数量、来源)
  - [ ] 1.3 定义 `UserRewards` 接口(总积分、等级、徽章)
  - [ ] 1.4 定义 `ShareTracking` 接口(分享记录、冷却时间)

- [ ] **Task 2: 实现积分系统** (AC: 1, 4)
  - [ ] 2.1 创建积分计算逻辑(首次分享、每日上限)
  - [ ] 2.2 实现积分存储(本地 + 服务端)
  - [ ] 2.3 实现积分等级系统( Bronze → Silver → Gold)
  - [ ] 2.4 实现防滥用逻辑(去重、冷却)
  - [ ] 2.5 实现 Credit 转换(积分 → Credit)

- [ ] **Task 3: 实现徽章系统** (AC: 2)
  - [ ] 3.1 定义徽章类型和条件
  - [ ] 3.2 实现徽章解锁逻辑
  - [ ] 3.3 实现徽章展示 UI

- [ ] **Task 4: 实现奖励通知系统** (AC: 3, 5)
  - [ ] 4.1 创建 `RewardNotification` 组件
  - [ ] 4.2 实现奖励动画(积分飞入效果)
  - [ ] 4.3 实现奖励历史记录
  - [ ] 4.4 应用 Glassmorphism 样式

- [ ] **Task 5: 实现奖励状态管理** (AC: 1, 3)
  - [ ] 5.1 创建 `useRewardsStore` Zustand store
  - [ ] 5.2 实现积分实时更新
  - [ ] 5.3 实现每日分享次数跟踪
  - [ ] 5.4 实现奖励历史记录

- [ ] **Task 6: 集成奖励到分享功能** (AC: 1, 2, 3)
  - [ ] 6.1 修改 `shareToSocialPlatform` 触发奖励
  - [ ] 6.2 实现分享验证逻辑
  - [ ] 6.3 实现奖励发放
  - [ ] 6.4 实现奖励反馈通知

- [ ] **Task 7: 实现奖励管理面板** (AC: 3, 5)
  - [ ] 7.1 创建 `RewardsPanel` 组件
  - [ ] 7.2 显示总积分和等级
  - [ ] 7.3 显示奖励历史
  - [ ] 7.4 显示每日剩余分享次数

- [ ] **Task 8: 单元测试**
  - [ ] 8.1 测试积分计算逻辑
  - [ ] 8.2 测试防滥用逻辑
  - [ ] 8.3 测试徽章解锁逻辑

- [ ] **Task 9: 集成测试**
  - [ ] 9.1 测试完整奖励流程(分享 → 验证 → 发放 → 通知)
  - [ ] 9.2 测试每日上限
  - [ ] 9.3 测试防滥用

- [ ] **Task 10: E2E 测试**
  - [ ] 10.1 测试完整用户流程(生成 → 分享 → 获得奖励 → 查看)
  - [ ] 10.2 视觉回归测试(奖励通知快照)

## Dev Notes

### 业务上下文

**Epic 6 目标:** AI 图片生成 - 用户可以使用模版直接生成同风格新图片,并分享到社交媒体

**Story 6.5 定位:** Epic 6 的第五个故事,专注于分享奖励机制。在实现社交分享后,本故事通过奖励机制激励用户分享,提升产品传播效果。

**用户价值:**
- 创作者:分享作品获得奖励,更有动力
- 所有用户:奖励增加产品使用乐趣

**产品价值:**
- 提升分享率,促进产品传播
- 增加用户粘性
- 收集用户行为数据

### 相关功能需求(FR)

- **FR42:** 系统可以支持分享奖励机制
- **FR43:** 系统可以支持积分系统
- **FR44:** 系统可以支持徽章系统
- **FR45:** 系统可以防滥用机制

**前置依赖:**
- **Story 6.4:** 社交分享(分享完成后触发奖励)

### 架构约束

**技术栈:**
- 前端框架:Next.js 15+ (App Router)
- 状态管理:Zustand
- UI 组件:MUI + Tailwind CSS
- 图标库:Lucide React
- 本地存储:localStorage(临时) + API(持久)
- 类型检查:TypeScript

**命名规范:**
- 组件:PascalCase(`RewardNotification`, `RewardsPanel`)
- 函数/变量:camelCase(`calculateReward`, `trackShare`)
- 类型/接口:PascalCase(`RewardType`, `ShareReward`)
- 常量:UPPER_SNAKE_CASE(`REWARD_CONFIGS`)

**项目结构:**
```
src/features/generation/
├── components/
│   ├── RewardNotification/
│   │   ├── index.tsx
│   │   └── RewardNotification.tsx  # 奖励通知
│   └── RewardsPanel/
│       ├── index.tsx
│       └── RewardsPanel.tsx  # 奖励面板
├── lib/
│   ├── reward-calculator.ts  # 奖励计算
│   ├── share-tracker.ts  # 分享跟踪
│   ├── anti-abuse.ts  # 防滥用
│   └── badge-system.ts  # 徽章系统
├── stores/
│   └── rewards.store.ts  # 奖励状态管理
└── types/
    └── rewards.ts  # 奖励类型定义
```

### 数据结构设计

**RewardType 枚举:**
```typescript
enum RewardType {
  POINTS = 'points',  // 积分
  CREDITS = 'credits',  // Credit
  BADGE = 'badge',  // 徽章
  TEMPLATE = 'template',  // 模版
}
```

**ShareReward 接口:**
```typescript
interface ShareReward {
  type: RewardType;
  amount: number;
  source: SocialPlatform;
  timestamp: Date;
  isFirstTime: boolean;
}
```

**UserRewards 接口:**
```typescript
interface UserRewards {
  totalPoints: number;
  credits: number;
  level: 'bronze' | 'silver' | 'gold';
  badges: Badge[];
  shareCount: number;
  lastShareDate?: Date;
}
```

**奖励配置:**
```typescript
const REWARD_CONFIGS = {
  FIRST_SHARE_POINTS: 50,
  DAILY_SHARE_POINTS: 25,
  DAILY_SHARE_LIMIT: 2,
  POINTS_TO_CREDITS_RATIO: 0.1,  // 1 积分 = 0.1 Credit
  LEVEL_THRESHOLDS: {
    BRONZE: 0,
    SILVER: 500,
    GOLD: 2000,
  },
};
```

### 业务逻辑设计

**奖励计算:**
```typescript
function calculateReward(
  platform: SocialPlatform,
  shareHistory: ShareRecord[]
): ShareReward {
  // 1. 检查是否首次分享
  const isFirstTime = !shareHistory.some(s => s.platform === platform);

  // 2. 检查每日上限
  const today = new Date().toDateString();
  const todayShares = shareHistory.filter(s =>
    s.platform === platform &&
    new Date(s.timestamp).toDateString() === today
  );

  if (todayShares.length >= REWARD_CONFIGS.DAILY_SHARE_LIMIT) {
    return { type: RewardType.POINTS, amount: 0, reason: 'daily_limit' };
  }

  // 3. 计算积分
  const points = isFirstTime
    ? REWARD_CONFIGS.FIRST_SHARE_POINTS
    : REWARD_CONFIGS.DAILY_SHARE_POINTS;

  return {
    type: RewardType.POINTS,
    amount: points,
    source: platform,
    isFirstTime,
  };
}
```

**防滥用逻辑:**
```typescript
function validateShare(
  imageUrl: string,
  platform: SocialPlatform,
  shareHistory: ShareRecord[]
): { valid: boolean; reason?: string } {
  // 1. 检查同一图片是否已分享到同一平台
  const duplicate = shareHistory.some(s =>
    s.imageUrl === imageUrl &&
    s.platform === platform
  );

  if (duplicate) {
    return { valid: false, reason: '同一图片只能奖励一次' };
  }

  // 2. 检查冷却时间(24小时)
  const lastShare = shareHistory.find(s =>
    s.platform === platform
  );

  if (lastShare) {
    const hoursSinceLastShare = (Date.now() - new Date(lastShare.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastShare < 24) {
      return { valid: false, reason: '分享冷却中' };
    }
  }

  return { valid: true };
}
```

### UI/UX 设计规范

**Glassmorphism 样式:**
- 奖励通知使用 `ia-glass-card` 类
- 奖励面板使用卡片布局

**图标系统:**
- 奖励图标: `<Gift size={24} className="text-yellow-500" />`
- 积分图标: `<Award size={20} className="text-purple-500" />`
- 徽章图标: `<Trophy size={20} className="text-amber-500" />`
- 星星图标: `<Star size={16} className="text-yellow-400" />`

**奖励通知样式:**
```
┌─────────────────────────────────────────────────────────┐
│  🎉 恭喜! 你获得了 50 积分!                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [积分飞入动画]                                     │  │
│  │ 累计积分: 250                                      │  │
│  │ 等级: Bronze → Silver (还需 250 积分)             │  │
│  └───────────────────────────────────────────────────┘  │
│  [查看奖励] [关闭]                                     │
└─────────────────────────────────────────────────────────┘
```

### 性能要求

- 奖励计算延迟:< 100ms
- 奖励通知显示延迟:< 200ms
- 积分更新延迟:< 500ms

### 安全考虑

- **防刷量:** 服务端验证分享行为
- **防篡改:** 积分计算在服务端进行
- **防重复:** 记录每次分享,去重
- **限流:** 每日分享上限

### 依赖关系

**前置依赖:**
- ✅ Story 6.4: 社交分享

**后置依赖:**
- 🟡 Epic 8: 订阅与支付系统(Credit 系统)

### Project Context Reference

**项目位置:** `/Users/muchao/code/image_analyzer`

**相关文档:**
- Story 6.4: 社交分享

## Dev Agent Record

### Agent Model Used

_Claude Sonnet 4.6 (claude-sonnet-4-6)_

### Debug Log References

_待开发时填写_

### Completion Notes List

_待开发时填写_

### File List

_待开发时填写_
