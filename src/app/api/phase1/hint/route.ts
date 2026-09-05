import { NextResponse } from 'next/server';
import { z } from 'zod';

import { phase1Content, recordTutorResponse } from '../../../../phase1/service';
import { FakeTutorModel, TutorHarness } from '../../../../tutor';

const HintRequestSchema = z.object({
  attemptId: z.string().uuid().optional(),
  learnerMessage: z.string().trim().min(1).max(1000),
  state: z.enum([
    'awaiting_attempt',
    'clarify_problem',
    'probe_reasoning',
    'hint_1_strategy',
    'hint_2_representation',
    'hint_3_subproblem',
    'analogous_example',
    'guided_solution',
    'explain_and_reflect',
  ]),
  priorHintCount: z.number().int().min(0).max(10),
  attemptNumber: z.number().int().min(1).max(20),
});

export async function POST(request: Request) {
  const parsed = HintRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid hint request' }, { status: 400 });

  const response = await new TutorHarness(new FakeTutorModel()).respond({
    prompt: phase1Content.prompt,
    learnerMessage: parsed.data.learnerMessage,
    redactedSkillContext: `content:${phase1Content.id}; skill:${phase1Content.skillCode}`,
    state: parsed.data.state,
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: parsed.data.priorHintCount,
    attemptNumber: parsed.data.attemptNumber,
    protectedTokens: [
      phase1Content.deterministicValidator.canonicalAnswer,
      ...phase1Content.forbiddenLeakagePatterns,
    ],
  });
  try {
    const stored = await recordTutorResponse({
      attemptId: parsed.data.attemptId,
      response,
    });
    return NextResponse.json({ response, ...stored });
  } catch {
    return NextResponse.json({ error: 'Synthetic attempt not found' }, { status: 404 });
  }
}
