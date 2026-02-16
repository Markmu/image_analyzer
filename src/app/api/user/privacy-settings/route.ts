/**
 * 隐私设置 API
 *
 * Story 4-3: 隐私合规功能
 * Epic 4: 内容安全与合规
 *
 * GET: 获取隐私设置
 * PUT: 更新隐私设置
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrivacySettings, getDataCollection清单, type PrivacySettings } from '@/lib/privacy/privacy-settings';

/**
 * GET /api/user/privacy-settings
 *
 * 获取用户隐私设置
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

    // 获取隐私设置
    const settings = await getPrivacySettings(userId);

    // 如果没有设置，创建默认设置
    const defaultSettings: PrivacySettings = {
      dataSharingEnabled: true,
      doNotSellEnabled: false,
      privacySettingsUpdatedAt: null,
    };

    // 获取数据收集清单
    const dataCollection = getDataCollection清单();

    return NextResponse.json({
      success: true,
      data: {
        settings: settings || defaultSettings,
        dataCollection,
      },
    });
  } catch (error) {
    console.error('[API] Get privacy settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取隐私设置失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/privacy-settings
 *
 * 更新用户隐私设置
 */
export async function PUT(request: Request) {
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

    // 解析请求体
    const body = await request.json();
    const { dataSharingEnabled, doNotSellEnabled } = body;

    // 验证参数
    if (dataSharingEnabled !== undefined && typeof dataSharingEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PARAM', message: 'dataSharingEnabled 必须是布尔值' } },
        { status: 400 }
      );
    }

    if (doNotSellEnabled !== undefined && typeof doNotSellEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PARAM', message: 'doNotSellEnabled 必须是布尔值' } },
        { status: 400 }
      );
    }

    // 更新隐私设置
    const { updatePrivacySettings } = await import('@/lib/privacy/privacy-settings');
    const updatedSettings = await updatePrivacySettings(userId, {
      dataSharingEnabled,
      doNotSellEnabled,
    });

    console.log('[API] Privacy settings updated:', userId, { dataSharingEnabled, doNotSellEnabled });

    return NextResponse.json({
      success: true,
      data: {
        settings: updatedSettings,
        message: '隐私设置已更新',
      },
    });
  } catch (error) {
    console.error('[API] Update privacy settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: '更新隐私设置失败',
        },
      },
      { status: 500 }
    );
  }
}
