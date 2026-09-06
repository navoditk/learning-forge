import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getTutorContext, phase1Content, recordTutorResponse } from '../../../../phase1/service';
import { FakeTutorModel, TutorHarness } from '../../../../tutor';
import { TutorState } from '../../../../tutor/policy';

const HintRequestSchema = z.object({
  attemptId: z.string().uuid().optional(),
  learnerMessage: z.string().trim().min(1).max(1000),
});

type TutorContext = {
  state: TutorState;
  priorHintCount: number;
  attemptNumber: number;
  content: {
    id: string;
    prompt: string;
    skillCode: string;
    canonicalAnswer: string;
    forbiddenLeakagePatterns: string[];
  };
};

const defaultContext: TutorContext = {
  state: 'awaiting_attempt',
  priorHintCount: 0,
  attemptNumber: 1,
  content: {
    id: phase1Content.id,
    prompt: phase1Content.prompt,
    skillCode: phase1Content.skillCode,
    canonicalAnswer: phase1Content.deterministicValidator.canonicalAnswer,
    forbiddenLeakagePatterns: phase1Content.forbiddenLeakagePatterns,
  },
};

export async function POST(request: Request) {
  const parsed = HintRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid hint request' }, { status: 400 });
  let context: TutorContext = defaultContext;
  try {
    if (parsed.data.attemptId) context = await getTutorContext(parsed.data.attemptId);
  } catch {
    return NextResponse.json({ error: 'Synthetic attempt not found' }, { status: 404 });
  }

  const response = await new TutorHarness(new FakeTutorModel()).respond({
    prompt: context.content.prompt,
    learnerMessage: parsed.data.learnerMessage,
    redactedSkillContext: `content:${context.content.id}; skill:${context.content.skillCode}`,
    state: context.state,
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: context.priorHintCount,
    attemptNumber: context.attemptNumber,
    protectedTokens: [context.content.canonicalAnswer, ...context.content.forbiddenLeakagePatterns],
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
