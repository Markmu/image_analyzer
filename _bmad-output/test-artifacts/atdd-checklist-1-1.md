# ATDD 检查清单：Story 1-1 OAuth 基础设置

**Epic**: 1-用户认证与账户系统
**Story**: 1-1 OAuth 基础设置和 Google OAuth 集成
**生成日期**: 2026-02-04
**TDD 阶段**: 🔴 RED（失败测试已生成）

---

## TDD 红阶段状态

✅ **失败测试已生成**
- 🔴 API 测试：17 个测试（全部使用 test.skip()）
- 🔴 E2E 测试：7 个测试（全部使用 test.skip()）
- **总计**: 24 个测试，全部预期失败

**为什么失败？**
- NextAuth.js 尚未配置
- 数据库 Schema 尚未创建
- OAuth 回调端点尚未实现
- UI 组件（登录按钮）尚未实现

---

## 测试文件清单

### API 测试
📄 `tests/api/oauth-setup.spec.ts`
- AC-1: NextAuth.js 配置验证（2 个测试）
- AC-2, AC-4: 数据库 Schema 和用户数据存储（4 个测试）
- AC-3: OAuth 登录流程（3 个测试）
- AC-5: 安全性（2 个测试）
- AC-6: 数据持久性（1 个测试）
- AC-7: 性能（2 个测试）
- AC-8: 错误处理（2 个测试）
- 工厂函数：`generateOAuthUser()` 使用 faker.js 生成测试数据

### E2E 测试
📄 `tests/e2e/oauth-login.spec.ts`
- AC-3: 完整 OAuth 登录流程（2 个测试）
- AC-5: 安全性 - 会话管理（2 个测试）
- AC-7: 性能（1 个测试）
- AC-8: OAuth 错误处理（2 个测试）

---

## 验收标准覆盖率

### AC-1: NextAuth.js 配置
✅ **已覆盖**（2 个 API 测试）
- ✅ [P1] 验证 Google Provider 配置正确
- ✅ [P1] 验证环境变量已设置

**测试端点**:
- `GET /api/auth/providers` - 返回 Google OAuth provider 配置
- `GET /api/auth/config` - 验证环境变量配置

---

### AC-2: 数据库 Schema
✅ **已覆盖**（4 个 API 测试）
- ✅ [P0] 首次登录创建新用户记录
- ✅ [P0] 老用户登录更新 updated_at
- ✅ [P2] Email 唯一性约束
- ✅ [P1] 从数据库检索用户数据

**测试端点**:
- `POST /api/auth/callback/google` - OAuth 回调处理
- `GET /api/users/{id}` - 获取用户数据

**数据验证**:
- users 表字段：id, email, name, image, creditBalance, subscriptionTier, createdAt, updatedAt
- 默认值：creditBalance = 30, subscriptionTier = 'free'
- 唯一约束：email

---

### AC-3: OAuth 登录流程
✅ **已覆盖**（5 个测试：3 API + 2 E2E）
- ✅ [P0] 处理成功 OAuth 回调（API）
- ✅ [P0] 完整的 Google OAuth 登录流程（E2E）
- ✅ [P1] 处理 OAuth 授权失败（API）
- ✅ [P1] 处理无效 OAuth state（API）
- ✅ [P1] 会话在页面导航间持久化（E2E）

**测试端点**:
- `POST /api/auth/callback/google` - OAuth 回调处理

**用户流程**（E2E）:
1. 用户点击 "使用 Google 登录" 按钮
2. 重定向到 Google OAuth 授权页面
3. 用户授权应用
4. 重定向回应用
5. 用户已登录（显示用户菜单）

**选择器要求**:
- 登录按钮：`[data-testid="google-login-button"]`
- 用户菜单：`[data-testid="user-menu"]`
- 用户邮箱：`[data-testid="user-email"]`
- 错误消息：`[data-testid="oauth-error-message"]`

---

### AC-4: 用户信息获取和存储
✅ **已覆盖**（见 AC-2 的测试）
- ✅ Google OAuth 信息（id, email, name, image）正确存储
- ✅ 老用户登录更新 updated_at 字段
- ✅ Email 唯一性约束正确执行

---

### AC-5: 安全性
✅ **已覆盖**（4 个测试：2 API + 2 E2E）
- ✅ [P1] 拒绝无效会话请求（API）
- ✅ [P2] 生产环境强制 HTTPS（API）
- ✅ [P1] 使用安全 Cookie（E2E）
- ✅ [P1] 未认证用户重定向（E2E）

**安全要求**:
- Session Cookie 属性：`secure: true`, `httpOnly: true`, `sameSite: 'lax'`
- HTTPS 强制（生产环境）
- 未认证用户无法访问受保护页面

---

### AC-6: 数据持久性
✅ **已覆盖**（1 个 API 测试）
- ✅ [P1] 用户数据跨请求持久化

**验证**: 创建用户后在独立请求中检索，返回相同数据

---

### AC-7: 响应时间
✅ **已覆盖**（3 个测试：2 API + 1 E2E）
- ✅ [P2] OAuth 回调 < 10 秒（API）
- ✅ [P2] 数据库写入 < 500ms（API）
- ✅ [P2] 完整登录流程 < 10 秒（E2E）

**性能基准**:
- OAuth 回调处理：< 10 秒
- 数据库写入操作：< 500ms
- 完整 E2E 登录流程：< 10 秒

---

### AC-8: 错误处理
✅ **已覆盖**（4 个测试：2 API + 2 E2E）
- ✅ [P1] 数据库连接失败返回 503（API）
- ✅ [P2] 验证环境变量存在（API）
- ✅ [P1] 处理 OAuth 授权拒绝（E2E）
- ✅ [P2] 处理 OAuth 超时（E2E）

**错误场景**:
- 数据库不可用 → 503 Service Unavailable
- 缺少环境变量 → 500 Internal Server Error（启动时阻止）
- 用户拒绝授权 → 显示用户友好的错误消息
- OAuth 超时 → 显示超时错误消息

---

## 测试优先级分布

| 优先级 | API 测试 | E2E 测试 | 总计 | 描述 |
|--------|----------|----------|------|------|
| **P0** | 4 | 1 | 5 | 关键路径（阻断性） |
| **P1** | 8 | 4 | 12 | 高优先级（重要但非阻断） |
| **P2** | 5 | 2 | 7 | 中等优先级（质量保证） |
| **总计** | 17 | 7 | 24 | |

---

## TDD 红阶段（当前）

### ✅ 已完成
- ✅ 生成 24 个失败的测试（全部使用 test.skip()）
- ✅ 所有测试断言预期行为（非占位符）
- ✅ 测试覆盖所有 8 个验收标准
- ✅ 使用韧性选择器（getByTestId, getByRole）
- ✅ 使用 faker.js 生成测试数据
- ✅ 遵循 Playwright Utils 最佳实践

### 🔴 当前状态
- 所有测试被跳过（test.skip()）
- 功能尚未实现
- 测试文件已写入磁盘

---

## TDD 绿阶段（实施后）

### 📋 实施步骤

**1. 实现功能**
   - 按照 Story 1-1 的实施任务实现
   - 创建 NextAuth.js 配置
   - 创建数据库 Schema（users 表）
   - 实现 OAuth 回调端点
   - 实现登录按钮 UI 组件

**2. 移除 test.skip()**
   ```bash
   # 从所有测试文件中移除 test.skip()
   # 将 test.skip() 替换为 test()
   ```

**3. 运行测试**
   ```bash
   npm run test
   ```

**4. 验证测试通过**
   - ✅ 所有 24 个测试应该通过
   - 如果有测试失败：
     - 检查实现是否有 bug（功能问题）
     - 或检查测试是否有 bug（测试问题）

**5. 提交代码**
   ```bash
   git add tests/api/oauth-setup.spec.ts
   git add tests/e2e/oauth-login.spec.ts
   git add src/lib/auth/
   git add src/app/api/auth/
   git commit -m "feat: 实现 Story 1-1 OAuth 基础设置和测试"
   ```

---

## 需要实现的功能端点

### API 端点

1. **GET /api/auth/providers**
   - 返回 Google OAuth provider 配置
   - 响应格式：
     ```json
     {
       "google": {
         "id": "google",
         "name": "Google",
         "type": "oauth",
         "signinUrl": "...",
         "callbackUrl": "..."
       }
     }
     ```

2. **GET /api/auth/config**
   - 验证环境变量已配置
   - 响应格式：
     ```json
     {
       "NEXTAUTH_URL": "...",
       "NEXTAUTH_SECRET": "...",
       "GOOGLE_CLIENT_ID": "...",
       "GOOGLE_CLIENT_SECRET": "...",
       "DATABASE_URL": "..."
     }
     ```

3. **POST /api/auth/callback/google**
   - 处理 OAuth 回调
   - 创建或更新用户记录
   - 创建会话
   - 请求体：Google OAuth 用户信息
   - 响应：用户对象 + 会话信息

4. **GET /api/users/{id}**
   - 获取用户数据
   - 响应：完整用户对象

5. **GET /api/auth/session**
   - 获取当前会话信息
   - 响应：会话对象或 401

### UI 组件

1. **登录按钮**
   - 选择器：`[data-testid="google-login-button"]`
   - 文本："使用 Google 登录"
   - 点击触发 OAuth 流程

2. **用户菜单**
   - 选择器：`[data-testid="user-menu"]`
   - 仅在登录后显示

3. **用户邮箱显示**
   - 选择器：`[data-testid="user-email"]`
   - 显示当前登录用户的邮箱

4. **OAuth 错误消息**
   - 选择器：`[data-testid="oauth-error-message"]`
   - 仅在 OAuth 失败时显示

---

## 数据库 Schema 要求

### users 表

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  creditBalance INTEGER DEFAULT 30,
  subscriptionTier VARCHAR(50) DEFAULT 'free',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**字段说明**:
- `id`: Google OAuth user ID
- `email`: 用户邮箱（唯一约束）
- `name`: 用户全名
- `image`: 头像 URL
- `creditBalance`: 积分余额（默认 30）
- `subscriptionTier`: 订阅等级（默认 'free'）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

---

## 环境变量要求

```bash
# NextAuth.js 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth 凭据
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## 知识片段使用

本次 ATDD 测试生成使用了以下知识片段：

**核心片段**:
- ✅ data-factories.md - 使用 faker.js 生成测试数据
- ✅ component-tdd.md - TDD 红-绿-重构循环
- ✅ test-quality.md - 测试质量定义完成标准
- ✅ selector-resilience.md - 韧性选择器（data-testid > ARIA）
- ✅ timing-debugging.md - 确定性等待（无硬编码 sleep）

**Playwright Utils 片段**:
- ✅ overview.md - 生产就绪的实用工具
- ✅ api-request.md - 类型化 HTTP 客户端
- ✅ auth-session.md - 令牌持久化

---

## 性能报告

🚀 **并行执行性能**
- API 测试生成：~2 分钟
- E2E 测试生成：~1.5 分钟
- 总耗时：~2 分钟（并行执行）
- 顺序执行预计：~3.5 分钟
- **性能提升：约 43%** ⚡

---

## 下一步行动

1. **立即开始实施**
   - 参考本检查清单的"需要实现的功能端点"部分
   - 按照验收标准逐一实现功能

2. **移除 test.skip()**
   - 实施完成后，从所有测试中移除 `test.skip()`
   - 替换为 `test()`

3. **运行测试验证**
   ```bash
   npm run test tests/api/oauth-setup.spec.ts
   npm run test tests/e2e/oauth-login.spec.ts
   ```

4. **修复失败的测试**
   - 如果测试失败，检查：
     - 实现是否正确（功能 bug）
     - 测试是否正确（测试 bug）

5. **标记完成**
   - 所有测试通过后，更新 Story 1-1 状态
   - 在 sprint-status.yaml 中标记为完成

---

## 联系和支持

如有问题或需要帮助：
- 查看知识片段：`_bmad/tea/testarch/knowledge/`
- 查看工作流配置：`_bmad/tea/workflows/testarch/atdd/`
- 查看故事详情：`_bmad-output/implementation-artifacts/stories/1-1-oauth-setup.md`

---

**ATDD 工作流版本**: 1.0
**生成工具**: BMAD TEA TestArch ATDD Workflow
**生成时间**: 2026-02-04

🔴 **TDD 红阶段完成 - 准备进入实施阶段** 🚀
