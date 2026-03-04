# 测试数据库配置指南

## 概述

集成测试直接使用**现有的开发数据库**，无需额外配置测试数据库。

## 环境要求

确保开发数据库已启动并可访问：
- PostgreSQL 数据库正在运行
- DATABASE_URL 环境变量已正确配置

## 运行测试

### 快速开始

```bash
# 直接运行集成测试（使用开发数据库）
npm run test:integration
```

### 环境变量

测试会自动使用现有的 `DATABASE_URL` 配置（来自 `.env.local` 或环境变量）。

## 测试数据管理

### 数据隔离机制

为确保测试不影响开发数据，测试采用以下隔离机制：

1. **唯一用户 ID**: 每个测试会话使用唯一的 `userId`
   ```typescript
   const mockUserId = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
   ```

2. **唯一任务 ID**: 每个测试使用随机生成的 `taskId`
   ```typescript
   const taskId = parseInt(`${Date.now()}${Math.floor(Math.random() * 1000000)}`.slice(-10));
   ```

3. **自动清理**: 每个测试结束后自动删除测试创建的数据
   ```typescript
   afterEach(async () => {
     await db.delete(batchAnalysisResults).where(
       eq(batchAnalysisResults.userId, mockUserId)
     );
   });
   ```

### 数据清理

**自动清理**（默认）:
- 每个测试执行后自动清理
- 只删除该测试创建的数据
- 不影响其他数据和开发数据

**手动清理**（如需要）:
```bash
# 清理所有测试用户的数据（以 test-user- 开头的用户）
# 可以通过 Drizzle Studio 或 psql 手动执行
```

## 本地开发测试

### 1. 确保开发数据库运行

```bash
# 检查数据库连接
npm run db:studio
```

### 2. 运行集成测试

```bash
# 运行所有集成测试
npm run test:integration

# 运行特定测试文件
npm test -- tests/integration/analysis-status-api.test.ts

# 监视模式（开发时）
npm test -- tests/integration --watch
```

## CI/CD 集成

测试会使用 CI 环境中配置的 `DATABASE_URL`，确保 CI 环境的数据库连接正常。

## 故障排除

### 问题: 数据库连接失败

**错误**: `password authentication failed` 或 `connection refused`

**解决方案**:
1. 确保开发数据库已启动
2. 检查 `.env.local` 中的 `DATABASE_URL` 配置
3. 测试连接: `npm run db:studio`

### 问题: 测试数据未清理

**症状**: 测试失败，因为数据已存在

**解决方案**:
1. 正常情况下自动清理会生效
2. 如果仍有问题，手动删除测试用户的数据
3. 或使用 Drizzle Studio 查看并删除数据

### 问题: 并发测试冲突

**症状**: 多个测试同时运行时冲突

**解决方案**:
- 已通过唯一的 `userId` 和 `taskId` 解决
- 如果仍有问题，可以禁用并行模式

## 最佳实践

1. **不要删除开发数据**: 测试只清理自己创建的数据
2. **使用唯一标识**: 测试数据使用明显的测试前缀
3. **及时运行测试**: 开发过程中频繁运行测试，及时发现问题
4. **查看测试数据**: 使用 Drizzle Studio 查看测试创建的数据

## 参考文档

- [Drizzle Studio](https://orm.drizzle.team/studio-journal/2023/09/21/drizzle-studio-one-year-later)
- [Vitest 集成测试](https://vitest.dev/guide/testing-database.html)
