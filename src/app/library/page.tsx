/**
 * Template Library Page
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 路由：/library
 * 功能：显示用户保存的所有模版
 */

import { TemplateLibrary } from '@/features/templates/components/TemplateLibrary/TemplateLibrary';
import { auth } from '@/lib/auth';

export default async function TemplateLibraryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">模版库</h1>
        <p className="text-gray-600">请先登录以查看您的模版库。</p>
      </div>
    );
  }

  return <TemplateLibrary userId={session.user.id} />;
}
