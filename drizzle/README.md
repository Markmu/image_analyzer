# Drizzle ORM 迁移管理

## 迁移命令

```bash
# 生成迁移文件（根据 schema.ts 的变化）
npm run db:generate

# 运行所有待执行的迁移
npm run db:migrate

# 推送 schema 更改到数据库（开发环境，快速同步）
npm run db:push

# 打开 Drizzle Studio（可视化界面）
npm run db:studio

# 回滚所有迁移（删除所有表）
npm run db:rollback
```

## 迁移文件位置

迁移文件保存在 `drizzle/` 目录下，格式为：
- `meta/` - 迁移元数据
- `<timestamp>_migration_name/` - 各次迁移的具体 SQL

## 开发流程

1. 修改 `src/lib/db/schema.ts` 中的表定义
2. 运行 `npm run db:generate` 生成迁移文件
3. 运行 `npm run db:migrate` 执行迁移
4. （可选）运行 `npm run db:studio` 验证数据库结构

## 注意事项

- 迁移文件自动生成，不要手动修改
- 迁移文件需要提交到版本控制
- 生产环境必须使用 `db:migrate` 而不是 `db:push`

## Docker 本地开发

```bash
# 启动 PostgreSQL
docker-compose up -d

# 停止 PostgreSQL
docker-compose down

# 停止并删除数据卷（慎用！会删除所有数据）
docker-compose down -v
```
