# ATDD Checklist - Epic 1, Story 1-5: 账户删除

**Date:** 2026-02-07
**Author:** Muchao
**Primary Test Level:** API

---

## Story Summary

该故事实现用户主动删除账户与全量关联数据，重点覆盖删除确认、事务级联删除、会话清理与失败回滚。由于该功能涉及隐私合规与高风险数据变更，测试策略以 API 为主、E2E 验证关键用户路径。

**As a** 用户  
**I want** 删除我的账户和所有相关数据  
**So that** 保护我的隐私并停止使用服务

---

## Acceptance Criteria

1. [AC-1] 在用户菜单中提供“删除账户”入口
2. [AC-2] 提供不可逆删除确认对话框与影响说明
3. [AC-3] 点击确认后执行事务级联删除
4. [AC-4] 删除后清理会话并跳转首页
5. [AC-5] 满足 CCPA 数据删除合规要求
6. [AC-6] 要求重新认证并防止误删
7. [AC-7] 删除操作性能 < 5 秒
8. [AC-8] 删除失败时显示友好错误并支持重试

---

## Failing Tests Created (RED Phase)

### E2E Tests (6 tests)

**File:** `tests/e2e/account-deletion.spec.ts` (90 lines)

- ✅ **Test:** [P0][AC-1] should show delete account option in user menu
  - **Status:** RED - UI 尚未实现删除入口
  - **Verifies:** 菜单中存在删除账户入口
- ✅ **Test:** [P0][AC-2] should open confirmation dialog with irreversible warning
  - **Status:** RED - 对话框组件未实现
  - **Verifies:** 警告文案与影响说明完整展示
- ✅ **Test:** [P1][AC-2] should close dialog when clicking cancel
  - **Status:** RED - 对话框状态管理未实现
  - **Verifies:** 取消动作可关闭对话框
- ✅ **Test:** [P0][AC-3][AC-4] should delete account then redirect to home and show login
  - **Status:** RED - 删除流程/重定向未实现
  - **Verifies:** 删除成功后的跳转与登录入口状态
- ✅ **Test:** [P1][AC-8] should show error and retry action when deletion fails
  - **Status:** RED - 失败态提示与重试机制未实现
  - **Verifies:** 错误提示与重试 UI
- ✅ **Test:** [P2][AC-7] should finish visual deletion flow within 5s
  - **Status:** RED - 前端性能门槛尚未实现
  - **Verifies:** 前端交互链路性能门槛

### API Tests (6 tests)

**File:** `tests/api/account-deletion.spec.ts` (83 lines)

- ✅ **Test:** [P0][AC-3] should delete account and all related data via DELETE /api/user
  - **Status:** RED - DELETE /api/user 尚未实现
  - **Verifies:** 事务级联删除和成功响应
- ✅ **Test:** [P0][AC-6] should require re-auth token before deletion
  - **Status:** RED - 重新认证校验尚未实现
  - **Verifies:** 高风险操作前的强制再认证
- ✅ **Test:** [P1][AC-8] should rollback transaction when partial delete fails
  - **Status:** RED - 回滚逻辑尚未实现
  - **Verifies:** 部分失败时事务一致性
- ✅ **Test:** [P1][AC-4] should clear session after successful deletion
  - **Status:** RED - 会话清理与登出联动未实现
  - **Verifies:** 删除后 session 归零
- ✅ **Test:** [P0][AC-3] should return 401 for unauthenticated deletion request
  - **Status:** RED - 认证拦截尚未实现
  - **Verifies:** 未认证请求拦截
- ✅ **Test:** [P2][AC-7] should complete deletion within 5 seconds
  - **Status:** RED - 删除性能优化尚未实现
  - **Verifies:** 后端删除时延限制

### Component Tests (0 tests)

**File:** `N/A`

本轮 ATDD 未新增组件级独立测试，组件行为通过 E2E 流程覆盖。

---

## Data Factories Created

### Delete Account Test Data

**File:** `tests/fixtures/test-data.ts`

**Exports:**

- `deleteAccountTestData` - 删除确认与再认证测试数据

**Example Usage:**

```typescript
import { deleteAccountTestData } from '../fixtures/test-data';
```

---

## Fixtures Created

### Story 1-5 Fixture Needs (待 GREEN 阶段实现)

- `authenticatedUserFixture` - 预置已登录用户与会话
- `deletionTestDataFactory` - 删除前关联数据构造
- `authenticatedMenuFixture` - UI 菜单态登录夹具
- `deleteAccountApiMockFixture` - 失败场景 API mock

---

## Mock Requirements

### Account Deletion API Mock

**Endpoint:** `DELETE /api/user`

**Success Response:**

```json
{
  "success": true,
  "data": {
    "message": "账户已删除"
  }
}
```

**Failure Response:**

```json
{
  "success": false,
  "error": {
    "code": "DELETE_FAILED",
    "message": "删除账户失败，请重试"
  }
}
```

---

## Required data-testid Attributes

- `user-menu-avatar`
- `user-menu-delete-account`
- `delete-account-dialog`
- `delete-account-confirm-button`
- `delete-account-cancel-button`
- `delete-account-error-message`
- `delete-account-retry-button`
- `google-login-button`

---

## Implementation Checklist

### Test: [P0][AC-3] should delete account and all related data via DELETE /api/user

**File:** `tests/api/account-deletion.spec.ts`

**Tasks to make this test pass:**

- [ ] 在 `src/app/api/user/route.ts` 新增 `DELETE` handler
- [ ] 在 `src/features/auth/services/account-deletion.service.ts` 实现事务级联删除
- [ ] 返回成功 payload：`{ success: true, data: { message: '账户已删除' } }`
- [ ] 处理 session 清理和 signOut
- [ ] Run test: `npx playwright test tests/api/account-deletion.spec.ts --project=api`
- [ ] ✅ Test passes (green phase)

### Test: [P0][AC-2] should open confirmation dialog with irreversible warning

**File:** `tests/e2e/account-deletion.spec.ts`

**Tasks to make this test pass:**

- [ ] 新增 `DeleteAccountDialog` 组件并接入 MUI Dialog
- [ ] 补全不可逆删除文案与影响列表
- [ ] 在 `UserMenu` 中增加删除入口并绑定弹窗
- [ ] 添加 required data-testid attributes
- [ ] Run test: `npx playwright test tests/e2e/account-deletion.spec.ts --project=chromium`
- [ ] ✅ Test passes (green phase)

---

## Running Tests

```bash
npx playwright test tests/api/account-deletion.spec.ts tests/e2e/account-deletion.spec.ts
npx playwright test tests/api/account-deletion.spec.ts --project=api
npx playwright test tests/e2e/account-deletion.spec.ts --project=chromium --headed
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

- ✅ 已生成 API + E2E 红阶段测试
- ✅ 全部使用 `test.skip()` 标记为 RED 阶段预期失败
- ✅ 已输出实现清单、mock 要求、data-testid 要求

### GREEN Phase

1. 先实现 `DELETE /api/user` 与事务级联删除
2. 实现 `DeleteAccountDialog` 与菜单入口
3. 删除对应测试中的 `test.skip()` 并逐条跑通

### REFACTOR Phase

1. 收敛重复删除逻辑
2. 优化错误与日志结构
3. 确保重构后测试持续通过

---

## Test Execution Evidence

**Command:** `npx playwright test tests/api/account-deletion.spec.ts tests/e2e/account-deletion.spec.ts`

**Status:** 本次未执行。当前 RED 策略按流程使用 `test.skip()`，GREEN 阶段移除后执行真实失败/通过验证。

---

**Generated by BMad TEA Agent** - 2026-02-07
