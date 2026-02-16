/**
 * Replicate Webhook 回调端点
 *
 * 处理 Replicate 异步预测的回调通知
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyReplicateSignature, handleWebhookCallback, getWebhookSecret } from '@/lib/replicate/webhook';

/**
 * Webhook 回调请求体类型
 */
interface ReplicateWebhookPayload {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output?: unknown;
  error?: string;
  input?: Record<string, unknown>;
  model?: string;
  version?: string;
  logs?: string;
  metrics?: Record<string, unknown>;
}

/**
 * POST 处理 Webhook 回调
 *
 * 错误处理策略：
 * - 返回 200 场景：成功处理、幂等重复回调（状态已是 completed）、预测不存在
 * - 返回 401 场景：签名验证失败
 * - 返回 500 场景：数据库保存失败、积分操作失败（让 Replicate 重试）
 */
export async function POST(request: NextRequest) {
  try {
    // 获取签名
    const signature = request.headers.get('Replicate-Signature') || request.headers.get('x-replicate-signature');

    if (!signature) {
      console.error('Webhook request missing signature header');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // 获取原始请求体
    const rawBody = await request.text();

    // 验证签名
    let secret: string;
    try {
      secret = getWebhookSecret();
    } catch (error) {
      console.error('Webhook secret not configured:', error);
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyReplicateSignature(rawBody, signature, secret);

    if (!isValid) {
      console.error('Webhook signature verification failed', {
        signature,
        bodyLength: rawBody.length,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 解析请求体
    let payload: ReplicateWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 记录接收到的回调
    console.log('Received webhook callback:', {
      predictionId: payload.id,
      status: payload.status,
    });

    // 处理回调
    const result = await handleWebhookCallback(
      payload.id,
      payload.status,
      payload.output,
      payload.error
    );

    // 根据处理结果返回响应
    if (!result.success) {
      // 处理失败，返回 500 让 Replicate 重试
      console.error('Webhook callback handling failed:', result.message);
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // 成功处理
    return NextResponse.json({
      success: true,
      message: result.message,
      predictionId: result.predictionId,
      status: result.newStatus,
    });
  } catch (error) {
    console.error('Unhandled error in webhook handler:', error);
    // 返回 500 让 Replicate 重试
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET 用于健康检查
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Replicate webhook endpoint is running',
  });
}
