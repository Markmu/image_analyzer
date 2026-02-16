/**
 * 数据导出 API
 *
 * Story 4-3: 隐私合规功能
 * Epic 4: 内容安全与合规
 *
 * POST: 导出用户数据
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { exportUserDataAsJson, estimateExportSize } from '@/lib/privacy/data-export';

/**
 * POST /api/user/export-data
 *
 * 导出用户所有数据
 *
 * 请求体: 无需请求体（从 session 获取用户）
 *
 * 响应:
 * - 成功: 返回 JSON 数据
 * - 失败: 返回错误信息
 */
export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[API] Exporting user data:', userId);

    // 估算导出大小
    const sizeKB = await estimateExportSize(userId);
    console.log('[API] Export size:', sizeKB, 'KB');

    // 导出数据
    const jsonData = await exportUserDataAsJson(userId);

    // 返回 JSON 数据
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
        'Content-Length': jsonData.length.toString(),
      },
    });
  } catch (error) {
    console.error('[API] Export data error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: '导出数据失败，请稍后重试',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/export-data
 *
 * 获取导出状态（可选，用于大文件导出时检查进度）
 */
export async function GET() {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 返回导出准备就绪
    return NextResponse.json({
      success: true,
      data: {
        ready: true,
        message: '数据导出就绪，请使用 POST 方法下载',
      },
    });
  } catch (error) {
    console.error('[API] Export status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取导出状态失败',
        },
      },
      { status: 500 }
    );
  }
}
