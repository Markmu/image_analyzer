import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { analysisTasks, analysisStageSnapshots } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isValidUuid } from '@/lib/mock/store';

/**
 * GET /api/analysis/[id]
 *
 * 返回分析任务的完整结果（包括 objective_description）
 *
 * Story 1.3: 在结果接口中返回 objective_description
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 验证 ID 格式
  if (!isValidUuid(id)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid analysis id format',
        },
      },
      { status: 422 }
    );
  }

  try {
    const db = getDb();

    // 查询任务主记录
    const tasks = await db
      .select()
      .from(analysisTasks)
      .where(eq(analysisTasks.publicId, id))
      .limit(1);

    if (tasks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Analysis task not found',
          },
        },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 如果任务未完成，返回当前状态而不是完整结果
    if (task.status !== 'completed' && task.status !== 'partial') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TASK_NOT_COMPLETED',
            message: `Task is not completed yet. Current status: ${task.status}`,
            details: {
              status: task.status,
              currentStage: task.currentStage,
            },
          },
        },
        { status: 400 }
      );
    }

    // 查询 objective_description 阶段快照
    const snapshots = await db
      .select()
      .from(analysisStageSnapshots)
      .where(
        and(
          eq(analysisStageSnapshots.taskId, task.id),
          eq(analysisStageSnapshots.stageName, 'forensic_describer'),
          eq(analysisStageSnapshots.stageStatus, 'completed')
        )
      )
      .orderBy(desc(analysisStageSnapshots.createdAt))
      .limit(1);

    if (snapshots.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STAGE_SNAPSHOT_NOT_FOUND',
            message: 'Objective description stage snapshot not found',
          },
        },
        { status: 404 }
      );
    }

    const snapshot = snapshots[0];

    // 解析 objective_description 数据
    let objectiveDescription;
    try {
      objectiveDescription = JSON.parse(snapshot.outputPayload || '{}');
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SNAPSHOT_DATA',
            message: 'Failed to parse objective description data',
          },
        },
        { status: 500 }
      );
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        task_id: task.publicId,
        status: task.status,
        schema_version: task.schemaVersion,
        prompt_version: task.promptVersion,
        current_stage: task.currentStage,
        created_at: task.createdAt,
        started_at: task.startedAt,
        completed_at: task.completedAt,
        // Story 1.3: 返回 objective_description
        objective_description: objectiveDescription,
        // 元数据
        metadata: {
          provider: snapshot.provider,
          model_id: snapshot.modelId,
          attempt_no: snapshot.attemptNo,
          duration_ms: snapshot.metricsPayload
            ? JSON.parse(snapshot.metricsPayload).duration_ms
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analysis result:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid analysis id format' } },
      { status: 422 },
    );
  }

  const ok = deleteAnalysis(id);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'ANALYSIS_NOT_FOUND', message: 'Analysis not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
