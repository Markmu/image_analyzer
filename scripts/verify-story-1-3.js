#!/usr/bin/env node

/**
 * Story 1-3 验证脚本
 *
 * 验证会话管理和登出功能的核心实现
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Story 1-3: 会话管理与登出\n');

let passed = 0;
let failed = 0;

// 验证函数
function verify(name, condition, details) {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// 1. 验证 authOptions 配置
console.log('📋 Task 1: 会话管理配置\n');

const authOptionsPath = path.join(__dirname, '../src/lib/auth/options.ts');
verify(
  '1.1 authOptions 文件存在',
  fs.existsSync(authOptionsPath),
  authOptionsPath
);

const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf-8');

verify(
  '1.2 JWT 策略配置',
  authOptionsContent.includes('strategy: \'jwt\''),
  'session.strategy 设置为 jwt'
);

verify(
  '1.3 会话有效期 7 天',
  authOptionsContent.includes('maxAge: 7 * 24 * 60 * 60'),
  'maxAge 配置为 604800 秒 (7天)'
);

verify(
  '1.4 会话刷新机制',
  authOptionsContent.includes('updateAge: 24 * 60 * 60'),
  'updateAge 配置为 86400 秒 (1天)'
);

verify(
  '1.5 Cookie HTTP-only',
  authOptionsContent.includes('httpOnly: true'),
  '防止 XSS 攻击'
);

verify(
  '1.6 Cookie SameSite',
  authOptionsContent.includes('sameSite: \'lax\''),
  '防止 CSRF 攻击'
);

verify(
  '1.7 Cookie Secure',
  authOptionsContent.includes('secure: process.env.NODE_ENV === \'production\''),
  '生产环境使用 HTTPS'
);

verify(
  '1.8 session 回调包含 expires',
  authOptionsContent.includes('session.expires = new Date(token.exp * 1000)'),
  '返回会话过期时间'
);

// 2. 验证 useAuth Hook
console.log('\n📋 Task 2: 登出功能\n');

const useAuthPath = path.join(__dirname, '../src/features/auth/hooks/useAuth.ts');
verify(
  '2.1 useAuth Hook 存在',
  fs.existsSync(useAuthPath),
  useAuthPath
);

const useAuthContent = fs.readFileSync(useAuthPath, 'utf-8');

verify(
  '2.2 导入 signOut',
  useAuthContent.includes('signOut as nextAuthSignOut'),
  '从 next-auth/react 导入'
);

verify(
  '2.3 signOut 函数',
  useAuthContent.includes('const signOut = useCallback'),
  '使用 useCallback 包装'
);

verify(
  '2.4 加载状态',
  useAuthContent.includes('isSigningOut') && useAuthContent.includes('useState'),
  'isSigningOut 状态管理'
);

verify(
  '2.5 错误处理',
  useAuthContent.includes('signOutError') && useAuthContent.includes('try {'),
  '包含错误处理逻辑'
);

verify(
  '2.6 重定向到首页',
  useAuthContent.includes('router.push(\'/\')'),
  '登出后重定向'
);

// 3. 验证 SignOutButton 组件
console.log('\n📋 Task 2.2: SignOutButton 组件\n');

const signOutButtonPath = path.join(__dirname, '../src/features/auth/components/SignOutButton/index.tsx');
verify(
  '3.1 SignOutButton 组件存在',
  fs.existsSync(signOutButtonPath),
  signOutButtonPath
);

const signOutButtonContent = fs.readFileSync(signOutButtonPath, 'utf-8');

verify(
  '3.2 使用 useAuth Hook',
  signOutButtonContent.includes('useAuth()'),
  '调用认证 Hook'
);

verify(
  '3.3 显示加载状态',
  signOutButtonContent.includes('isSigningOut ? \'登出中...\''),
  '加载中显示文本'
);

verify(
  '3.4 禁用按钮',
  signOutButtonContent.includes('disabled={isSigningOut}'),
  '登出中禁用按钮'
);

// 4. 验证 useRequireAuth Hook
console.log('\n📋 Task 3.1: useRequireAuth Hook\n');

const useRequireAuthPath = path.join(__dirname, '../src/features/auth/hooks/useRequireAuth.ts');
verify(
  '4.1 useRequireAuth Hook 存在',
  fs.existsSync(useRequireAuthPath),
  useRequireAuthPath
);

const useRequireAuthContent = fs.readFileSync(useRequireAuthPath, 'utf-8');

verify(
  '4.2 检查认证状态',
  useRequireAuthContent.includes('useSession()'),
  '使用 useSession 检查状态'
);

verify(
  '4.3 重定向逻辑',
  useRequireAuthContent.includes('router.push(\'/api/auth/signin\')'),
  '未登录时重定向'
);

// 5. 验证中间件
console.log('\n📋 Task 3.2: 路由保护中间件\n');

const middlewarePath = path.join(__dirname, '../src/middleware.ts');
verify(
  '5.1 中间件文件存在',
  fs.existsSync(middlewarePath),
  middlewarePath
);

const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');

verify(
  '5.2 使用 withAuth',
  middlewareContent.includes('withAuth'),
  'NextAuth middleware 保护'
);

verify(
  '5.3 保护的路由',
  middlewareContent.includes('/dashboard') ||
  middlewareContent.includes('/analysis') ||
  middlewareContent.includes('/templates'),
  '包含受保护路由'
);

// 6. 验证测试文件
console.log('\n📋 Task 4: 测试文件\n');

const apiTestPath = path.join(__dirname, '../tests/api/session-management.spec.ts');
const e2eTestPath = path.join(__dirname, '../tests/e2e/session-management.spec.ts');

verify(
  '6.1 API 测试存在',
  fs.existsSync(apiTestPath),
  apiTestPath
);

verify(
  '6.2 E2E 测试存在',
  fs.existsSync(e2eTestPath),
  e2eTestPath
);

const apiTestContent = fs.readFileSync(apiTestPath, 'utf-8');
const e2eTestContent = fs.readFileSync(e2eTestPath, 'utf-8');

verify(
  '6.3 测试未被跳过',
  !apiTestContent.includes('test.skip(') && !e2eTestContent.includes('test.skip('),
  '所有 test.skip() 已移除'
);

// 总结
console.log('\n' + '='.repeat(50));
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📊 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 Story 1-3 所有核心实现已验证通过！');
  process.exit(0);
} else {
  console.log('\n⚠️  部分验证未通过，请检查实现。');
  process.exit(1);
}
