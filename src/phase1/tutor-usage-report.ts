import { prisma } from '../server/prisma';

export type TutorUsageTrace = {
  householdId: string;
  sessionId: string | null;
  modelIdentifier: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  validationResult: string;
  outcome: string;
  createdAt: Date;
};

export type TutorUsageReport = {
  period: { since: string; until: string };
  totals: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    fallbackCount: number;
    errorCount: number;
  };
  byModel: Array<{
    modelIdentifier: string;
    requests: number;
    totalTokens: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    fallbackCount: number;
    errorCount: number;
  }>;
  householdUsage: Array<{
    householdId: string;
    requestsLast24Hours: number;
    dailyLimit: number;
    dailyLimitUtilization: number;
    sessionsLast24Hours: number;
  }>;
  sessionUsage: Array<{
    householdId: string;
    sessionId: string;
    requestsLast24Hours: number;
    sessionLimit: number;
    sessionLimitUtilization: number;
  }>;
};

type UsageLimits = { householdDaily: number; session: number };

function percentile95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function summarizeTraces(traces: TutorUsageTrace[]) {
  const latencies = traces.map((trace) => trace.latencyMs);
  return {
    requests: traces.length,
    inputTokens: traces.reduce((sum, trace) => sum + trace.inputTokens, 0),
    outputTokens: traces.reduce((sum, trace) => sum + trace.outputTokens, 0),
    totalTokens: traces.reduce((sum, trace) => sum + trace.totalTokens, 0),
    averageLatencyMs: round(
      latencies.length > 0
        ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length
        : 0,
    ),
    p95LatencyMs: percentile95(latencies),
    fallbackCount: traces.filter((trace) => trace.validationResult === 'FALLBACK').length,
    errorCount: traces.filter((trace) => trace.outcome === 'ERROR').length,
  };
}

export function buildTutorUsageReport(
  traces: TutorUsageTrace[],
  input: {
    since: Date;
    until: Date;
    limits: UsageLimits;
  },
): TutorUsageReport {
  if (input.limits.householdDaily <= 0 || input.limits.session <= 0) {
    throw new Error('usage limits must be positive');
  }
  const periodTraces = traces.filter(
    (trace) => trace.createdAt >= input.since && trace.createdAt <= input.until,
  );
  const dailySince = new Date(input.until.getTime() - 24 * 60 * 60 * 1000);
  const recent = periodTraces.filter((trace) => trace.createdAt >= dailySince);
  const modelGroups = new Map<string, TutorUsageTrace[]>();
  for (const trace of periodTraces) {
    const group = modelGroups.get(trace.modelIdentifier) ?? [];
    group.push(trace);
    modelGroups.set(trace.modelIdentifier, group);
  }

  const householdGroups = new Map<string, TutorUsageTrace[]>();
  for (const trace of recent) {
    const group = householdGroups.get(trace.householdId) ?? [];
    group.push(trace);
    householdGroups.set(trace.householdId, group);
  }

  const sessionGroups = new Map<string, TutorUsageTrace[]>();
  for (const trace of recent) {
    if (!trace.sessionId) continue;
    const key = `${trace.householdId}:${trace.sessionId}`;
    const group = sessionGroups.get(key) ?? [];
    group.push(trace);
    sessionGroups.set(key, group);
  }

  return {
    period: { since: input.since.toISOString(), until: input.until.toISOString() },
    totals: summarizeTraces(periodTraces),
    byModel: [...modelGroups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([modelIdentifier, group]) => ({
        modelIdentifier,
        ...summarizeTraces(group),
      })),
    householdUsage: [...householdGroups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([householdId, group]) => ({
        householdId,
        requestsLast24Hours: group.length,
        dailyLimit: input.limits.householdDaily,
        dailyLimitUtilization: round(group.length / input.limits.householdDaily),
        sessionsLast24Hours: new Set(group.map((trace) => trace.sessionId).filter(Boolean)).size,
      })),
    sessionUsage: [...sessionGroups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, group]) => ({
        householdId: group[0].householdId,
        sessionId: group[0].sessionId as string,
        requestsLast24Hours: group.length,
        sessionLimit: input.limits.session,
        sessionLimitUtilization: round(group.length / input.limits.session),
      })),
  };
}

export async function getTutorUsageReport(input: {
  days?: number;
  until?: Date;
  limits: UsageLimits;
}): Promise<TutorUsageReport> {
  const until = input.until ?? new Date();
  const days = input.days ?? 7;
  if (!Number.isInteger(days) || days < 1) throw new Error('days must be a positive integer');
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const querySince = new Date(Math.min(since.getTime(), until.getTime() - 24 * 60 * 60 * 1000));
  const traces = await prisma.tutorTrace.findMany({
    where: { createdAt: { gte: querySince, lte: until } },
    select: {
      householdId: true,
      sessionId: true,
      modelIdentifier: true,
      latencyMs: true,
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      validationResult: true,
      outcome: true,
      createdAt: true,
    },
  });
  return buildTutorUsageReport(traces, { since, until, limits: input.limits });
}
