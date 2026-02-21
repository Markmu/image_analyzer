/**
 * Template Detail Page
 *
 * Epic 7 - Story 7.2: Template Library
 *
 * 路由：/library/[id]
 * 功能：显示单个模版的详细信息
 */

'use client';

import { TemplateLibraryDetail } from '@/features/templates/components/TemplateLibraryDetail/TemplateLibraryDetail';

interface TemplateDetailPageProps {
  params: {
    id: string;
  };
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  return <TemplateLibraryDetail />;
}
