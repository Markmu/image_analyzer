/**
 * Template Detail Page
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 路由：/library/[id]
 * 功能：显示单个模版的详细信息
 */

import { TemplateLibraryDetail } from '@/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface TemplateDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">模版详情</h1>
        <p className="text-gray-600">请先登录以查看模版详情。</p>
      </div>
    );
  }

  const templateId = parseInt(params.id);

  if (isNaN(templateId)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">模版详情</h1>
        <p className="text-red-600">无效的模版 ID。</p>
      </div>
    );
  }

  return <TemplateLibraryDetail templateId={templateId} />;
}
