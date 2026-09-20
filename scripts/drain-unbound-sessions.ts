import { z } from 'zod';

import { drainUnboundLegacySessions } from '../src/progression/legacy-session-drain';
import { prisma } from '../src/server/prisma';

const InputSchema = z.object({
  sessionIds: z.array(z.string().uuid()).min(1),
  reason: z.string().trim().min(1).max(500),
  confirm: z.literal(true),
});

function parseArgs(argv: readonly string[]) {
  const sessionIds: string[] = [];
  let reason = '';
  let confirm = false;
  for (const arg of argv) {
    if (arg.startsWith('--session-id=')) sessionIds.push(arg.slice('--session-id='.length));
    else if (arg.startsWith('--reason=')) reason = arg.slice('--reason='.length);
    else if (arg === '--confirm') confirm = true;
  }
  return InputSchema.parse({ sessionIds, reason, confirm });
}

async function main() {
  try {
    const input = parseArgs(process.argv.slice(2));
    const result = await drainUnboundLegacySessions(input.sessionIds);
    console.log(
      JSON.stringify({
        status: 'drained',
        drainedCount: result.drainedCount,
        endedAt: result.endedAt.toISOString(),
        reasonRecordedByOperator: input.reason,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
