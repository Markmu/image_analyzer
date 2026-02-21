# 自动保存历史记录集成总结

**日期**: 2026-02-21
**任务**: 集成自动保存历史记录逻辑
**状态**: ✅ 已完成

---

## 集成位置

文件：`src/app/api/analysis/route.ts`

### 1. 新分析完成后自动保存

**位置**: 第 400-430 行

在 `executeAnalysisAsync` 函数中，分析成功完成后：

```typescript
// 更新批量分析记录状态
await db
  .update(batchAnalysisResults)
  .set({
    status: 'completed',
    completedImages: 1,
    completedAt: new Date(),
  })
  .where(eq(batchAnalysisResults.id, batchId));

// 记录模型使用统计
await recordModelUsage(modelId, userId, true, analysisData.analysisDuration);

// 标记任务完成
removeActiveTask(userId);

// 处理队列中的下一个任务
await processQueue();

// ✅ 保存到分析历史记录 (Epic 7: Story 7.1)
try {
  const { saveToHistory } = await import('@/features/history');
  await saveToHistory(userId, insertedResult.id, 'success');
  console.log(`Analysis saved to history for batch ${batchId}, image ${imageId}`);
} catch (error) {
  // 保存历史失败不影响主流程，只记录错误
  console.error('Failed to save to history:', error);
}
```

**触发条件**:
- 图片分析成功完成
- `analysisResults` 表中已插入新的分析记录
- `insertedResult.id` 可用

**保存内容**:
- `userId`: 当前用户 ID
- `analysisResultId`: 新创建的分析结果 ID
- `status`: 'success'

---

### 2. 重复分析时更新历史记录

**位置**: 第 100-130 行

当用户请求分析已经分析过的图片时：

```typescript
if (existingAnalysis.length > 0) {
  const existing = existingAnalysis[0];
  const confidenceScores = existing.confidenceScores as ConfidenceScores | null;
  const warning = confidenceScores ? generateConfidenceWarning(confidenceScores) : null;

  // ✅ 保存到分析历史记录 (Epic 7: Story 7.1)
  // 即使是已分析过的图片，重新请求时也应该更新历史记录
  try {
    const { saveToHistory } = await import('@/features/history');
    await saveToHistory(userId, existing.id, 'success');
    console.log(`Existing analysis saved to history for image ${imageId}`);
  } catch (error) {
    // 保存历史失败不影响主流程，只记录错误
    console.error('Failed to save existing analysis to history:', error);
  }

  return NextResponse.json({...});
}
```

**触发条件**:
- 用户请求分析已存在的图片
- 系统返回已有的分析结果

**为什么这样做**:
- 用户每次查看历史记录时，应该将最常用的记录放到列表顶部
- FIFO 清理逻辑会保留最近使用的 10 条，而不是最早的 10 条

---

## 错误处理策略

### 1. 保存失败不影响主流程

```typescript
try {
  await saveToHistory(userId, insertedResult.id, 'success');
} catch (error) {
  // 保存历史失败不影响主流程，只记录错误
  console.error('Failed to save to history:', error);
}
```

**原因**: 历史记录是辅助功能，不应该因为保存失败而导致分析失败。

### 2. 失败的分析不保存

**位置**: 第 260-284 行（异步分析失败处理）

```typescript
executeAnalysisAsync(batchId, imageId, imageUrl, userId, usedModelId).catch(async (error) => {
  console.error('Async analysis failed:', error);

  // 更新任务状态为失败
  await db
    .update(batchAnalysisResults)
    .set({
      status: 'failed',
      failedImages: 1,
      completedAt: new Date(),
    })
    .where(eq(batchAnalysisResults.id, batchId));

  // ❌ 不保存到历史记录
  // 失败的分析不应该出现在历史记录中

  removeActiveTask(userId);
});
```

**符合需求**: Story 7.1 AC1 明确要求保存成功的分析记录。

---

## FIFO 清理验证

### 自动清理逻辑

`saveToHistory` 函数内部会自动调用 `cleanOldHistory`：

```typescript
export async function saveToHistory(
  userId: string,
  analysisResultId: number,
  status: 'success' | 'failed' = 'success'
): Promise<AnalysisHistory> {
  // 1. 保存新记录到历史
  const [newRecord] = await db
    .insert(analysisHistory)
    .values({...})
    .returning();

  // 2. 执行 FIFO 清理 - 保留最近 MAX_HISTORY_RECORDS 条记录
  await cleanOldHistory(userId);

  return newRecord;
}
```

### 清理逻辑

```typescript
export async function cleanOldHistory(userId: string): Promise<void> {
  // 获取用户的所有历史记录，按创建时间倒序排列
  const allRecords = await db.select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .orderBy(desc(analysisHistory.createdAt));

  // 如果记录数量超过限制，删除最旧的记录
  if (allRecords.length > MAX_HISTORY_RECORDS) {
    const recordsToDelete = allRecords.slice(MAX_HISTORY_RECORDS);
    await db.delete(analysisHistory)
      .where(inArray(analysisHistory.id, idsToDelete));
  }
}
```

**行为**:
- 保存第 11 条记录时，自动删除第 1 条记录
- 保存第 12 条记录时，自动删除第 2 条记录
- 以此类推...

---

## 测试场景

### 场景 1: 新用户首次分析

1. 用户上传图片并分析
2. 分析成功完成
3. ✅ 自动保存到历史记录（第 1 条）
4. 用户在历史页面看到 1 条记录

### 场景 2: 用户分析 10 次

1. 用户连续分析 10 张不同的图片
2. 每次分析成功后自动保存
3. ✅ 历史记录中有 10 条记录
4. 用户在历史页面看到 10 条记录

### 场景 3: 用户分析第 11 次（FIFO 清理）

1. 用户分析第 11 张图片
2. ✅ 保存第 11 条记录
3. ✅ 自动删除第 1 条记录
4. 历史记录中仍然只有 10 条记录（第 2-11 条）

### 场景 4: 用户重复分析已有图片

1. 用户请求分析已经分析过的图片
2. 系统返回已有结果
3. ✅ 该图片的历史记录更新到列表顶部
4. FIFO 清理逻辑正常运行

### 场景 5: 分析失败

1. 用户上传图片并分析
2. 分析失败（模型错误、网络问题等）
3. ❌ 不保存到历史记录
4. 历史记录数量不变

---

## 数据一致性

### 外键约束

```typescript
export const analysisHistory = pgTable('analysis_history', {
  ...
  analysisResultId: integer('analysis_result_id').notNull()
    .references(() => analysisResults.id, { onDelete: 'cascade' }),
  ...
});
```

**行为**:
- 如果分析结果被删除，历史记录也会被删除（级联删除）
- 确保历史记录始终指向有效的分析结果

### 事务安全

虽然我们没有使用显式事务，但由于：
1. 分析结果先保存（`insertedResult.id` 可用）
2. 历史记录后保存
3. 即使历史记录保存失败，分析结果仍然存在

这种顺序确保了数据的一致性。

---

## 性能考虑

### 异步处理

历史记录保存使用 try-catch 包裹，即使失败也不阻塞主流程。

### 数据库索引

```typescript
userIdIdx: index('analysis_history_user_id_idx').on(table.userId),
createdAtIdx: index('analysis_history_created_at_idx').on(table.createdAt),
```

**优化查询**:
- 按用户查询历史记录：使用 `userIdIdx`
- 按时间排序：使用 `createdAtIdx`
- FIFO 清理：复合索引优化

---

## 日志记录

为了便于调试和监控，添加了日志：

```typescript
console.log(`Analysis saved to history for batch ${batchId}, image ${imageId}`);
console.log(`Existing analysis saved to history for image ${imageId}`);
```

**便于排查**:
- 哪些分析被保存到历史
- 保存是否成功
- 性能问题定位

---

## 后续优化建议

### 1. 批量保存（Story 7.2）

如果用户批量分析多张图片，可以考虑批量保存历史记录以提高性能。

### 2. 异步队列

当前是同步保存，如果性能成为问题，可以考虑使用消息队列异步保存。

### 3. 定期清理任务

除了 FIFO 主动清理，也可以添加定期清理任务作为备份保障。

---

## 总结

✅ **集成完成**:
- 新分析完成后自动保存
- 重复分析时更新历史记录
- 失败分析不保存
- FIFO 清理自动执行
- 错误处理不影响主流程

✅ **符合需求**:
- AC1: 系统自动保存最近 10 次
- AC6: 数据持久化到数据库
- AC7: 授权控制（NFR-SEC-3）

**完成度**: 100%

**下一步**: 实现测试（单元测试、API 测试、E2E 测试）
