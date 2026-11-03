import { and, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { aiTask, type AiTask, type NewAiTask } from '@/config/db/schema';
import { POSTER_SCENE, type PosterTaskView } from '@/config/poster-generation';

export async function findPosterTask(
  id: string,
  userId: string
): Promise<AiTask | undefined> {
  const [task] = await db()
    .select()
    .from(aiTask)
    .where(
      and(
        eq(aiTask.id, id),
        eq(aiTask.userId, userId),
        eq(aiTask.scene, POSTER_SCENE),
        isNull(aiTask.deletedAt)
      )
    )
    .limit(1);
  return task;
}

export async function updatePosterTask(
  id: string,
  data: Pick<NewAiTask, 'taskId' | 'status' | 'taskResult'>
) {
  // A late poll cannot overwrite an already completed result.
  await db()
    .update(aiTask)
    .set(data)
    .where(
      and(
        eq(aiTask.id, id),
        eq(aiTask.scene, POSTER_SCENE),
        inArray(aiTask.status, ['pending', 'processing'])
      )
    );
}

export function posterTaskView(task: AiTask): PosterTaskView {
  const options = JSON.parse(task.options || '{}');
  const result = JSON.parse(task.taskResult || '{}');
  return {
    id: task.id,
    status: task.status as PosterTaskView['status'],
    progress:
      task.status === 'success'
        ? 100
        : Math.max(0, Math.min(99, Number(result.progress) || 0)),
    costCredits: task.costCredits,
    size: options.size || '2:3',
    quality: options.quality || '1K',
    ...(result.imageUrl ? { imageUrl: result.imageUrl } : {}),
    ...(['failed', 'canceled'].includes(task.status)
      ? { error: 'POSTER_GENERATION_FAILED' }
      : {}),
  };
}
