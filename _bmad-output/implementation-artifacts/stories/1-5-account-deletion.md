# Story 1.5: 账户删除

Status: backlog

## Epic 上下文

**Epic 1**: 用户认证与账户系统

**Epic 目标**: 用户可以使用 Google 账户登录系统，管理个人资料和积分余额。

**Epic 范围**:
- Google OAuth 2.0 登录集成
- 新用户自动获赠 30 credit
- 账户信息查看（余额、订阅状态）
- **账户删除功能** ← 本故事

**Epic 内故事依赖**:
- Story 1-1 (OAuth 基础设置): **前置依赖** - 必须先完成
- Story 1-5 (当前故事): 实现账户删除功能
- 可在任何时间开发（独立于其他故事）

## Story

作为 **用户**，
我想要 **删除我的账户和所有相关数据**，
以便 **保护我的隐私并停止使用服务**。

## 验收标准

### 功能验收标准

1. **[AC-1] 账户删除入口**
   - 在用户菜单中添加"删除账户"选项
   - 位置：登出按钮上方，红色文字警告样式
   - 点击后打开删除确认对话框

2. **[AC-2] 删除确认对话框**
   - 使用 MUI Dialog 组件
   - 显示警告信息："确定要删除账户吗？此操作不可撤销"
   - 显示影响说明：
     - 所有图片将被删除
     - 所有分析记录将被删除
     - 所有模版将被删除
     - Credit 余额将被清零
   - 显示确认按钮："确定删除"（红色，primary）
   - 显示取消按钮："取消"（灰色，secondary）

3. **[AC-3] 账户删除执行**
   - 用户点击"确定删除"后执行删除
   - 级联删除所有相关数据：
     - `users` 表中的用户记录
     - `images` 表中的用户图片
     - `analysis_results` 表中的分析记录
     - `templates` 表中的用户模版
     - `generations` 表中的生成记录
     - NextAuth 会话记录
   - 使用数据库事务确保原子性

4. **[AC-4] 删除后处理**
   - 清除所有会话和 Cookie
   - 重定向到首页
   - 显示成功提示："账户已删除"
   - 首页显示"登录"按钮

5. **[AC-5] 数据清除合规**
   - 遵守 CCPA 数据隐私要求
   - 立即清除所有数据（不超过 24 小时）
   - 不保留任何用户数据备份
   - 删除操作不可逆

### 非功能验收标准

6. **[AC-6] 安全性**
   - 要求用户重新认证（输入密码或重新 OAuth）
   - 防止误删除（需要确认）
   - 记录删除操作日志（用户 ID、时间戳）
   - 防止自动化删除（需要人工确认）

7. **[AC-7] 性能要求**
   - 删除操作 < 5 秒（即使有大量数据）
   - 使用批量删除优化性能
   - 删除过程中显示加载状态

8. **[AC-8] 错误处理**
   - 删除失败时显示友好错误信息
   - 提供重试选项
   - 记录错误日志
   - 部分删除时回滚事务

## Tasks / Subtasks

### Task 1: 创建删除确认对话框 (AC: 1, 2, 6)

- [ ] 1.1 创建 DeleteAccountDialog 组件
  - [ ] 1.1.1 创建 `src/features/auth/components/DeleteAccountDialog/index.tsx`
  - [ ] 1.1.2 使用 MUI Dialog 组件
  - [ ] 1.1.3 显示警告信息和影响说明

- [ ] 1.2 实现确认按钮
  - [ ] 1.2.1 主要按钮："确定删除"（红色，primary）
  - [ ] 1.2.2 点击后调用删除 API
  - [ ] 1.2.3 显示加载状态（按钮禁用，显示 Spinner）

- [ ] 1.3 实现取消按钮
  - [ ] 1.3.1 次要按钮："取消"（灰色，secondary）
  - [ ] 1.3.2 点击后关闭对话框

- [ ] 1.4 添加重新认证（可选，推荐）
  - [ ] 1.4.1 要求用户重新输入密码或重新 OAuth
  - [ ] 1.4.2 验证成功后才允许删除
  - [ ] 1.4.3 防止误删除

### Task 2: 创建删除 API 端点 (AC: 3, 5, 7, 8)

- [ ] 2.1 创建 API 路由
  - [ ] 2.1.1 创建 `src/app/api/user/route.ts`（添加 DELETE 方法）
  - [ ] 2.1.2 验证用户身份（JWT Token）
  - [ ] 2.1.3 返回 200 成功或错误

- [ ] 2.2 实现级联删除逻辑
  - [ ] 2.2.1 使用数据库事务包裹所有删除操作
  - [ ] 2.2.2 按顺序删除：
    1. `generations` 表
    2. `templates` 表
    3. `analysis_results` 表
    4. `images` 表
    5. `sessions` 表
    6. `users` 表（最后删除）
  - [ ] 2.2.3 使用批量删除优化性能

- [ ] 2.3 添加错误处理
  - [ ] 2.3.1 捕获数据库错误
  - [ ] 2.3.2 回滚事务
  - [ ] 2.3.3 记录错误日志
  - [ ] 2.3.4 返回用户友好的错误信息

- [ ] 2.4 记录删除日志（可选）
  - [ ] 2.4.1 创建 `account_deletions` 表
  - [ ] 2.4.2 记录：user_id, deleted_at, ip_address, user_agent
  - [ ] 2.4.3 用于审计和合规

### Task 3: 集成到用户菜单 (AC: 1)

- [ ] 3.1 修改 UserMenu 组件
  - [ ] 3.1.1 在登出按钮上方添加"删除账户"选项
  - [ ] 3.1.2 样式：红色文字，警告图标
  - [ ] 3.1.3 点击后打开 DeleteAccountDialog

- [ ] 3.2 集成 DeleteAccountDialog
  - [ ] 3.2.1 添加对话框状态管理
  - [ ] 3.2.2 处理删除成功和失败情况
  - [ ] 3.2.3 删除成功后关闭菜单和对话框

### Task 4: 实现删除后处理 (AC: 4, 6)

- [ ] 4.1 清除会话和 Cookie
  - [ ] 4.1.1 调用 NextAuth 的 `signOut()` 函数
  - [ ] 4.1.2 清除所有客户端状态
  - [ ] 4.1.3 重定向到首页

- [ ] 4.2 显示成功提示
  - [ ] 4.2.1 使用 MUI Snackbar
  - [ ] 4.2.2 文本："账户已删除，感谢您使用我们的服务"
  - [ ] 4.2.3 样式：灰色背景，白色文字
  - [ ] 4.2.4 自动隐藏：5 秒

- [ ] 4.3 首页更新
  - [ ] 4.3.1 显示"登录"按钮
  - [ ] 4.3.2 清除所有用户相关数据
  - [ ] 4.3.3 清除 React Query 缓存

### Task 5: 测试和验证 (AC: 1-8)

- [ ] 5.1 单元测试
  - [ ] 5.1.1 测试级联删除逻辑
  - [ ] 5.1.2 Mock 数据库删除操作
  - [ ] 5.1.3 测试错误处理和回滚

- [ ] 5.2 集成测试
  - [ ] 5.2.1 测试删除 API 端点
  - [ ] 5.2.2 验证所有相关表的数据被删除
  - [ ] 5.2.3 测试事务回滚（模拟失败）

- [ ] 5.3 E2E 测试（使用 Playwright）
  - [ ] 5.3.1 测试用户点击"删除账户"
  - [ ] 5.3.2 测试确认对话框显示
  - [ ] 5.3.3 测试确认删除后重定向到首页
  - [ ] 5.3.4 验证用户无法再登录

## Dev Notes

### 相关架构模式和约束

**技术栈决策** ([Source: architecture.md#Core Architectural Decisions](../planning-artifacts/architecture.md)):
- **数据库**: PostgreSQL + Drizzle ORM
- **事务处理**: 使用数据库事务确保原子性
- **API 设计**: REST API + Zod 验证

**命名规范** ([Source: architecture.md#Naming Patterns](../planning-artifacts/architecture.md)):
- API 端点: `DELETE /api/user`
- 组件: `DeleteAccountDialog` (PascalCase)
- 函数: `deleteAccount`, `cascadeDeleteUser` (camelCase)

### 数据库删除详细设计

**级联删除顺序**:
```typescript
// src/features/auth/services/account-deletion.service.ts
import { db } from '@/lib/db';
import { users, images, analysisResults, templates, generations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function deleteUserAccount(userId: string) {
  return await db.transaction(async (tx) => {
    // 1. 删除生成记录（依赖 templates）
    await tx
      .delete(generations)
      .where(eq(generations.userId, userId));

    // 2. 删除模版（依赖 analysis_results）
    await tx
      .delete(templates)
      .where(eq(templates.userId, userId));

    // 3. 删除分析记录（依赖 images）
    await tx
      .delete(analysisResults)
      .where(eq(analysisResults.userId, userId));

    // 4. 删除图片
    await tx
      .delete(images)
      .where(eq(images.userId, userId));

    // 5. 删除 NextAuth 会话
    await tx
      .delete(sessions)
      .where(eq(sessions.userId, userId));

    // 6. 删除用户记录（最后删除）
    await tx
      .delete(users)
      .where(eq(users.id, userId));

    return { success: true };
  });
}
```

**批量删除优化**（如果数据量大）:
```typescript
// 使用 Drizzle 的批量删除
await tx.delete(generations)
  .where(eq(generations.userId, userId));

// 或者使用原始 SQL（更快）
await tx.execute(
  `DELETE FROM generations WHERE user_id = $1`,
  [userId]
);
```

### API 端点实现

**DELETE /api/user 实现**:
```typescript
// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { deleteUserAccount } from '@/features/auth/services/account-deletion.service';

export async function DELETE(req: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      );
    }

    // 执行删除
    await deleteUserAccount(session.user.id);

    return NextResponse.json({
      success: true,
      data: { message: '账户已删除' },
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: '删除账户失败，请重试',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}
```

### 删除确认对话框实现

**DeleteAccountDialog 组件**:
```typescript
// src/features/auth/components/DeleteAccountDialog/DeleteAccountDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-account-dialog-title"
    >
      <DialogTitle id="delete-account-dialog-title">
        <WarningIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
        删除账户
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>警告</AlertTitle>
          此操作不可撤销，所有数据将被永久删除
        </Alert>

        <DialogContentText component="div">
          <p>确定要删除账户吗？删除后，以下数据将被永久清除：</p>
          <ul>
            <li>所有上传的图片</li>
            <li>所有分析记录</li>
            <li>所有保存的模版</li>
            <li>所有生成的图片</li>
            <li>Credit 余额</li>
          </ul>
          <p style={{ marginTop: 16, fontWeight: 'bold' }}>
            根据 CCPA 数据隐私要求，删除后的数据无法恢复。
          </p>
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          取消
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          {isDeleting ? '删除中...' : '确定删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### CCPA 合规考虑

**CCPA（California Consumer Privacy Act）要求**:
1. **删除权**: 用户有权要求删除其个人数据
2. **响应时间**: 必须在收到请求后 45 天内删除（实际立即删除）
3. **数据范围**: 必须删除所有可识别的数据
4. **不可逆**: 删除后无法恢复

**实现要点**:
- 立即删除（不超过 24 小时）
- 不保留备份数据
- 级联删除所有关联表
- 记录删除日志（审计）

### 安全考虑

**防止误删除**:
- 需要明确确认（对话框）
- 要求重新认证（推荐）
- 记录删除操作日志

**防止自动化删除**:
- 需要 CSRF Token
- 验证 Referer 头
- 速率限制（每用户每天最多 1 次）

**防止部分删除**:
- 使用数据库事务
- 失败时回滚
- 验证所有表的数据都被删除

### PRD 需求映射

**来自 PRD 的需求**:
- FR5: 用户可以主动删除其账户

**注意**: PRD 中未详细说明删除流程，但这是标准功能要求。

### 常见陷阱和解决方案

**问题 1: 外键约束阻止删除**
- **症状**: "Cannot delete because of foreign key constraint"
- **解决**: 按正确顺序删除（先子表后父表），或使用 `ON DELETE CASCADE`

**问题 2: 部分数据未被删除**
- **症状**: 删除后仍能找到部分数据
- **解决**: 检查所有关联表，确保级联删除完整

**问题 3: 删除操作太慢**
- **症状**: 删除操作超过 5 秒
- **解决**: 使用批量删除或原始 SQL，考虑异步删除

**问题 4: 删除后用户仍可登录**
- **症状**: 删除后用户仍能访问账户
- **解决**: 确保清除 NextAuth 会话和客户端 Cookie

## Dev Agent Record

### Completion Notes List

- ✅ 从 Epic 1 中独立出账户删除功能
- ✅ 定义了清晰的验收标准
- ✅ 包含了级联删除逻辑
- ✅ 添加了 CCPA 合规考虑
- ✅ 提供了完整的组件实现
- ✅ 包含了安全防护措施

### File List

**待创建/修改的文件**:

1. `src/features/auth/components/DeleteAccountDialog/index.tsx` - 删除确认对话框（新增）
2. `src/features/auth/services/account-deletion.service.ts` - 删除服务（新增）
3. `src/app/api/user/route.ts` - API 端点（修改，添加 DELETE 方法）
4. `src/features/auth/components/UserMenu/index.tsx` - 用户菜单（修改）
5. `drizzle/0002_account_deletions.sql` - 删除日志表（新增，可选）

**测试文件**:
- `src/features/auth/services/account-deletion.service.test.ts`
- `tests/e2e/account-deletion.spec.ts`

---

**Story 生成完成时间**: 2026-02-04

**前置依赖**: Story 1-1 (OAuth 基础设置) 必须先完成

**下一步**:
1. 等待 Story 1-1 完成
2. Review this story file
3. Run dev agent's `dev-story` for implementation
4. After completion, Epic 1 的所有功能完成
