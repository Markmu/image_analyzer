import Link from 'next/link';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-14">
        {/* 主 Hero 卡片 */}
        <section className="ia-glass-card ia-glass-card--static p-8 sm:p-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
             style={{ background: 'var(--glass-bg-active)', color: 'var(--glass-text-primary)' }}>
            <Sparkles size={16} aria-hidden="true" />
            AI 风格翻译器
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl" style={{ color: 'var(--glass-text-white-heavy)' }}>
            上传参考图，快速生成可复用的风格分析结果
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg" style={{ color: 'var(--glass-text-gray-heavy)' }}>
            覆盖光影、构图、色彩与艺术风格四大维度，帮助你把"喜欢的感觉"变成可执行的创作指令。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analysis"
              className="ia-glass-card ia-glass-card--clickable ia-glass-card--active inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200"
              style={{ color: 'var(--glass-text-white-heavy)' }}
            >
              <Brain size={18} aria-hidden="true" />
              开始分析
            </Link>
            <Link
              href="/auth/signin"
              className="ia-glass-card ia-glass-card--clickable inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                borderColor: 'var(--glass-border-active)',
                color: 'var(--glass-text-primary)'
              }}
            >
              登录账户
            </Link>
          </div>
        </section>

        {/* 特性卡片 */}
        <section className="grid gap-4 sm:grid-cols-2">
          <article className="ia-glass-card ia-glass-card--static p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg p-2" style={{ background: 'var(--glass-bg-active)' }}>
                <Zap size={20} style={{ color: 'var(--glass-text-primary)' }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--glass-text-white-heavy)' }}>
                质量优先的分析流程
              </h2>
            </div>
            <p className="text-sm leading-6" style={{ color: 'var(--glass-text-gray-heavy)' }}>
              提供阶段进度、术语提示和置信度反馈，帮助你理解每一步的分析结果。
            </p>
          </article>

          <article className="ia-glass-card ia-glass-card--static p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg p-2" style={{ background: 'var(--glass-bg-active)' }}>
                <Sparkles size={20} style={{ color: 'var(--glass-text-primary)' }} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--glass-text-white-heavy)' }}>
                可复用的创作模板
              </h2>
            </div>
            <p className="text-sm leading-6" style={{ color: 'var(--glass-text-gray-heavy)' }}>
              通过结构化输出快速验证和复用风格，让同类创作更稳定、更高效。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
