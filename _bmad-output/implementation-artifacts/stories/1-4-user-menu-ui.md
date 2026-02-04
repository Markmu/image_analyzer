# Story 1.4: 用户菜单 UI

Status: backlog

## Epic 上下文

**Epic 1**: 用户认证与账户系统

**Epic 目标**: 用户可以使用 Google 账户登录系统，管理个人资料和积分余额。

**Epic 范围**:
- Google OAuth 2.0 登录集成
- 新用户自动获赠 30 credit
- 账户信息查看（余额、订阅状态）
- 账户删除功能

**Epic 内故事依赖**:
- Story 1-1 (OAuth 基础设置): **前置依赖** - 必须先完成
- Story 1-2 (用户注册与奖励): **前置依赖** - 需要 Credit 数据可用
- Story 1-3 (会话管理): **前置依赖** - 需要登出功能
- Story 1-4 (当前故事): 实现用户菜单 UI
- Story 1-5 (账户删除): 可后续开发

## Story

作为 **登录用户**，
我想要 **查看我的账户信息（头像、名称、Credit 余额、订阅状态）**，
以便 **了解我的当前账户状态和剩余使用额度**。

## 验收标准

### 功能验收标准

1. **[AC-1] 用户头像显示**
   - 顶部导航栏右侧显示用户头像
   - 头像为圆形，48x48px
   - 点击头像展开用户菜单
   - 使用 Google OAuth 提供的头像 URL

2. **[AC-2] 用户菜单展开**
   - 点击头像后显示下拉菜单
   - 使用 MUI Menu 组件
   - 菜单位置：头像下方右对齐
   - 点击菜单外部自动关闭

3. **[AC-3] 用户信息显示**
   - 菜单顶部显示用户头像（大尺寸，64x64px）
   - 显示用户名称（粗体，Poppins 600）
   - 显示用户 Email（灰色，小号，Open Sans 400）
   - 分隔线

4. **[AC-4] Credit 余额显示**
   - 显示 Credit 余额，格式："30 credits" 或 "3 次使用剩余"
   - 位置：分隔线下方，突出显示
   - 样式：绿色（#22C55E），粗体
   - 实时从数据库读取最新余额

5. **[AC-5] 订阅状态显示**
   - 显示订阅等级（"Free 等级" / "Lite 等级" / "Standard 等级"）
   - 位置：Credit 余额下方
   - 样式：灰色标签（MUI Chip）
   - 可点击（跳转到订阅页面，后续 Epic 实现）

6. **[AC-6] 登出按钮**
   - 菜单底部显示登出按钮
   - 样式：文本按钮（outlined），左侧对齐
   - 点击后调用登出功能（来自 Story 1-3）
   - 使用 SignOutIcon 图标

7. **[AC-7] 响应式设计**
   - 桌面端（≥992px）：顶部导航栏右侧，完整菜单
   - 平板端（768-991px）：顶部导航栏右侧，完整菜单
   - 移动端（<768px）：顶部导航栏右侧，简化菜单

### 非功能验收标准

8. **[AC-8] 响应时间**
   - 用户菜单展开响应 < 100ms
   - Credit 余额加载 < 500ms
   - 头像图片加载 < 1 秒

9. **[AC-9] 用户体验**
   - 头像加载失败时显示默认头像（首字母）
   - 菜单展开动画流畅（200ms ease）
   - 悬停效果：头像轻微上浮（translateY(-2px)）

10. **[AC-10] 无障碍**
    - 所有可交互元素可键盘访问
    - 焦点状态可见（2px 蓝色边框）
    - ARIA 标签正确配置

## Tasks / Subtasks

### Task 1: 创建用户菜单组件 (AC: 1, 2, 3, 5, 6, 7, 9, 10)

- [ ] 1.1 创建 UserMenu 组件结构
  - [ ] 1.1.1 创建 `src/features/auth/components/UserMenu/index.tsx`
  - [ ] 1.1.2 创建 `UserMenu.tsx` 主组件
  - [ ] 1.1.3 使用 MUI Menu 组件实现下拉菜单

- [ ] 1.2 实现头像显示
  - [ ] 1.2.1 创建 `UserAvatar` 子组件
  - [ ] 1.2.2 显示圆形头像（48x48px）
  - [ ] 1.2.3 加载失败时显示默认头像（首字母）
  - [ ] 1.2.4 添加悬停效果（轻微上浮）

- [ ] 1.3 实现用户信息区域
  - [ ] 1.3.1 显示大尺寸头像（64x64px）
  - [ ] 1.3.2 显示用户名称（Poppins 600）
  - [ ] 1.3.3 显示用户 Email（Open Sans 400, 灰色）
  - [ ] 1.3.4 添加分隔线

- [ ] 1.4 实现 Credit 余额显示
  - [ ] 1.4.1 集成 `CreditDisplay` 组件（来自 Story 1-2）
  - [ ] 1.4.2 格式："30 credits" 或 "3 次使用剩余"
  - [ ] 1.4.3 样式：绿色（#22C55E），粗体

- [ ] 1.5 实现订阅状态显示
  - [ ] 1.5.1 使用 MUI Chip 组件
  - [ ] 1.5.2 显示文本："Free 等级" / "Lite 等级" / "Standard 等级"
  - [ ] 1.5.3 样式：灰色背景，圆角

- [ ] 1.6 实现登出按钮
  - [ ] 1.6.1 集成 `SignOutButton` 组件（来自 Story 1-3）
  - [ ] 1.6.2 样式：文本按钮（outlined），左侧对齐
  - [ ] 1.6.3 添加 SignOutIcon 图标

### Task 2: 集成到导航栏 (AC: 1, 7, 9)

- [ ] 2.1 修改 Header 组件
  - [ ] 2.1.1 找到 `src/components/shared/Header/Header.tsx`
  - [ ] 2.1.2 在右侧添加 UserMenu 组件
  - [ ] 2.1.3 未登录时显示"登录"按钮（SignInButton）

- [ ] 2.2 响应式布局
  - [ ] 2.2.1 桌面端：完整菜单
  - [ ] 2.2.2 平板端：完整菜单
  - [ ] 2.2.3 移动端：简化菜单（只保留头像和登出）

### Task 3: 实现数据获取 (AC: 4, 8)

- [ ] 3.1 创建用户信息 API
  - [ ] 3.1.1 创建 `src/app/api/user/route.ts`
  - [ ] 3.1.2 实现 `GET /api/user` - 获取当前用户信息
  - [ ] 3.1.3 返回格式：
    ```typescript
    {
      success: true,
      data: {
        id: string,
        email: string,
        name: string,
        image: string,
        creditBalance: number,
        subscriptionTier: 'free' | 'lite' | 'standard'
      }
    }
    ```

- [ ] 3.2 使用 React Query 获取数据
  - [ ] 3.2.1 创建 `src/features/auth/hooks/useUserInfo.ts`
  - [ ] 3.2.2 使用 React Query 的 `useQuery` 获取用户信息
  - [ ] 3.2.3 缓存策略：staleTime 30 秒
  - [ ] 3.2.4 自动刷新：Credit 余额变化时

### Task 4: 样式和动画优化 (AC: 9, 10)

- [ ] 4.1 添加展开动画
  - [ ] 4.1.1 使用 MUI Fade 组件
  - [ ] 4.1.2 动画时长：200ms ease
  - [ ] 4.1.3 头像悬停效果：translateY(-2px)

- [ ] 4.2 添加焦点状态
  - [ ] 4.2.1 键盘导航：Tab 键访问
  - [ ] 4.2.2 焦点显示：2px 蓝色边框
  - [ ] 4.2.3 焦点陷阱：菜单打开时焦点在菜单内

- [ ] 4.3 默认头像实现
  - [ ] 4.3.1 头像加载失败时显示用户名首字母
  - [ ] 4.3.2 圆形背景，随机柔和颜色
  - [ ] 4.3.3 字体：Poppins 600，白色

### Task 5: 测试和验证 (AC: 1-10)

- [ ] 5.1 单元测试
  - [ ] 5.1.1 测试 UserMenu 组件渲染
  - [ ] 5.1.2 测试头像加载失败时显示默认头像
  - [ ] 5.1.3 Mock API 响应

- [ ] 5.2 集成测试
  - [ ] 5.2.1 测试用户菜单展开和关闭
  - [ ] 5.2.2 测试 Credit 余额正确显示
  - [ ] 5.2.3 测试登出按钮功能

- [ ] 5.3 E2E 测试（使用 Playwright）
  - [ ] 5.3.1 测试点击头像展开菜单
  - [ ] 5.3.2 测试用户信息正确显示
  - [ ] 5.3.3 测试 Credit 余额显示
  - [ ] 5.3.4 测试订阅状态显示
  - [ ] 5.3.5 测试点击登出按钮

## Dev Notes

### 相关架构模式和约束

**技术栈决策** ([Source: architecture.md#Core Architectural Decisions](../planning-artifacts/architecture.md)):
- **UI 组件库**: MUI + Tailwind CSS
- **状态管理**: React Query (服务器状态)
- **样式**: Glassmorphism 视觉风格

**命名规范** ([Source: architecture.md#Naming Patterns](../planning-artifacts/architecture.md)):
- React 组件: `UserMenu`, `UserAvatar`, `CreditDisplay` (PascalCase)
- 文件名: `user-menu.tsx`, `user-avatar.tsx` (kebab-case)
- 函数/变量: `useUserInfo`, `creditBalance` (camelCase)

### UX 设计规范

**用户菜单设计** ([Source: UX Design Specification](../planning-artifacts/ux-design-specification.md)):

**菜单布局**:
```
┌─────────────────────────────────┐
│  [大头像 64x64px]  张三           │
│  zhangsan@example.com            │
│  ──────────────────────────────  │
│  💰 30 credits                   │  ← 绿色突出
│  🏷️ Free 等级                    │  ← 灰色标签
│  ──────────────────────────────  │
│  🚪 登出                         │  ← 文本按钮
└─────────────────────────────────┘
```

**样式规范**:
- 字体：用户名称 Poppins 600，Email Open Sans 400
- 颜色：Credit 绿色 #22C55E，订阅状态灰色 #94A3B8
- 间距：菜单内边距 16px，元素间距 8px
- 圆角：菜单 8px，头像 50%（圆形）
- 阴影：`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`

**响应式断点**:
```css
/* 移动端 */
@media (max-width: 767px) {
  .user-menu {
    position: fixed;
    top: 60px;
    right: 0;
    width: 100%;
    max-height: calc(100vh - 60px);
  }
}

/* 平板端和桌面端 */
@media (min-width: 768px) {
  .user-menu {
    min-width: 280px;
  }
}
```

### 组件实现示例

**UserMenu 组件**:
```typescript
// src/features/auth/components/UserMenu/UserMenu.tsx
import { useState } from 'react';
import {
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Chip,
  Box,
} from '@mui/material';
import { SignOut as SignOutIcon } from '@mui/icons-material';
import { useUserInfo } from '../../hooks/useUserInfo';
import { CreditDisplay } from '@/features/credits/components/CreditDisplay';
import { SignOutButton } from '../SignOutButton';

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: user, isLoading } = useUserInfo();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <>
      <Avatar
        src={user.image}
        alt={user.name}
        onClick={handleClick}
        sx={{
          width: 48,
          height: 48,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s ease',
          },
        }}
      >
        {user.name?.charAt(0).toUpperCase()}
      </Avatar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              mt: 1,
            },
          },
        }}
      >
        {/* 用户信息区域 */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar
            src={user.image}
            alt={user.name}
            sx={{ width: 64, height: 64, mb: 1 }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Divider />

        {/* Credit 余额 */}
        <MenuItem disabled>
          <CreditDisplay balance={user.creditBalance} />
        </MenuItem>

        {/* 订阅状态 */}
        <MenuItem disabled>
          <Chip
            label={`${user.subscriptionTier} 等级`}
            size="small"
            color="default"
          />
        </MenuItem>

        <Divider />

        {/* 登出按钮 */}
        <MenuItem onClick={handleClose}>
          <SignOutButton />
        </MenuItem>
      </Menu>
    </>
  );
}
```

**useUserInfo Hook**:
```typescript
// src/features/auth/hooks/useUserInfo.ts
import { useQuery } from '@tanstack/react-query';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  image: string;
  creditBalance: number;
  subscriptionTier: 'free' | 'lite' | 'standard';
}

export function useUserInfo() {
  return useQuery<UserInfo>({
    queryKey: ['user', 'info'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await res.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 秒
  });
}
```

### Glassmorphism 样式实现

**菜单样式**:
```css
.user-menu {
  background: rgba(30, 41, 59, 0.95); /* Slate 800, 95% 透明度 */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

### 无障碍考虑

**ARIA 标签**:
```typescript
<Avatar
  aria-label="用户菜单"
  aria-haspopup="true"
  aria-expanded={open}
  onClick={handleClick}
>
  {user.name?.charAt(0).toUpperCase()}
</Avatar>

<Menu
  id="user-menu"
  aria-labelledby="user-menu-button"
  anchorEl={anchorEl}
  open={open}
  onClose={handleClose}
>
```

**键盘导航**:
- Tab 键：聚焦到头像
- Enter/Space：展开菜单
- 方向键：在菜单项中导航
- Esc：关闭菜单

### PRD 需求映射

**来自 PRD 的需求**:
- FR3: 用户可以在登录后查看其当前 credit 余额和订阅状态
- FR4: 用户可以查看其基本账户信息

### 常见陷阱和解决方案

**问题 1: 用户信息不更新**
- **症状**: Credit 余额变化后菜单仍显示旧值
- **解决**: 使用 React Query 的 `invalidateQueries()` 刷新数据

**问题 2: 头像加载慢**
- **症状**: 用户等待头像加载
- **解决**: 先显示默认头像（首字母），头像加载完成后替换

**问题 3: 菜单在移动端显示异常**
- **症状**: 移动端菜单被截断
- **解决**: 使用 `position: fixed` 和 `max-height: calc(100vh - 60px)`

**问题 4: 键盘无法访问**
- **症状**: Tab 键无法聚焦到头像
- **解决**: 确保头像有 `tabIndex={0}` 和键盘事件处理器

## Dev Agent Record

### Completion Notes List

- ✅ 从原始 Story 1-1 拆分用户菜单 UI 部分
- ✅ 专注于用户信息展示和交互
- ✅ 定义了详细的 UI 规范和样式
- ✅ 包含了响应式设计和无障碍
- ✅ 提供了完整的组件实现示例
- ✅ 添加了 React Query 数据获取

### File List

**待创建/修改的文件**:

1. `src/features/auth/components/UserMenu/index.tsx` - 用户菜单组件（新增）
2. `src/features/auth/components/UserMenu/UserMenu.tsx` - 主组件（新增）
3. `src/features/auth/components/UserMenu/UserMenu.test.tsx` - 测试（新增）
4. `src/features/auth/components/UserAvatar/index.tsx` - 头像组件（新增）
5. `src/features/auth/hooks/useUserInfo.ts` - 用户信息 Hook（新增）
6. `src/app/api/user/route.ts` - 用户信息 API（新增）
7. `src/components/shared/Header/Header.tsx` - 导航栏（修改）

---

**Story 生成完成时间**: 2026-02-04

**前置依赖**:
- Story 1-1 (OAuth 基础设置) - 必须先完成
- Story 1-2 (用户注册与奖励) - 需要 Credit 数据
- Story 1-3 (会话管理) - 需要登出功能

**下一步**:
1. 等待前置 Story 完成
2. Review this story file
3. Run dev agent's `dev-story` for implementation
4. After completion, Epic 1 的 UI 部分完成
