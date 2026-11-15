import { describe, expect, it } from 'vitest';

import { buildBody } from '../../scripts/generate-curriculum-site';
import { contentCatalog } from '../../src/content/catalog';
import {
  publishableContentProjection,
  publishableSkillProjection,
} from '../../src/content/publication';
import { PROGRAM_CODES } from '../../src/contracts/program-codes';
import { SkillSchema, type Skill } from '../../src/contracts/curriculum';
import { skillCatalog } from '../../src/curriculum/catalog';
import { PROGRAM_ROSTER } from '../../src/curriculum/program-roster';
import { PROGRAM_REGISTRY, programsByCode } from '../../src/curriculum/program-registry';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { PY_SKILL, pythonPracticeItem } from '../phase1/python-paths-support';

const CODE = 'python-intro-grade-6';

describe('python-intro-grade-6 identity (C1, D-322)', () => {
  it('is registered once, unavailable, with its prefix, mode and policy refs', () => {
    expect(PROGRAM_CODES).toContain(CODE);
    const entries = PROGRAM_REGISTRY.filter((program) => program.code === CODE);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      code: CODE,
      version: '1.0.0',
      label: 'Python Intro (Grade 6)',
      available: false,
      subjectKind: 'enrichment-non-graded',
      skillCodePrefix: 'py6-',
      progressionMode: 'skill-graph-only',
      unitRefs: [],
      accessPolicyRef: { code: 'python-intro-grade-6-access', version: '1.0.0' },
      legacyCompatibilityPolicyRef: null,
      defaultPolicyProfileRef: { code: 'python-intro-grade-6-default', version: '1.0.0' },
    });
    expect(programsByCode.get(CODE)?.available).toBe(false);
  });

  it('keeps the registry and the program-code vocabulary in one source', () => {
    expect(new Set(PROGRAM_REGISTRY.map(({ code }) => code))).toEqual(new Set(PROGRAM_CODES));
  });

  it('resolves its policy refs to files under policy/ and grants no assessment kinds', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    const program = PROGRAM_REGISTRY.find((entry) => entry.code === CODE)!;
    const access = accessPolicies.find(
      (policy) =>
        policy.code === program.accessPolicyRef.code &&
        policy.version === program.accessPolicyRef.version,
    );
    expect(access).toBeDefined();
    expect(access?.deniesActivityKinds).toEqual(
      expect.arrayContaining(['LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK']),
    );
    expect(
      profiles.some(
        (profile) =>
          profile.code === program.defaultPolicyProfileRef.code &&
          profile.version === program.defaultPolicyProfileRef.version,
      ),
    ).toBe(true);
  });

  it('holds only the one approved, pending Python skill and is not served', () => {
    expect(
      skillCatalog.filter((skill) => skill.program === CODE).map((skill) => skill.code),
    ).toEqual(['py6-print-output-reading']);
    expect(
      contentCatalog
        .filter((record) => record.skillRef.code.startsWith('py6-'))
        .map((record) => record.review.status),
    ).toEqual(['pending_review']);
    expect(PROGRAM_ROSTER.find((entry) => entry.code === CODE)).toMatchObject({
      code: CODE,
      available: false,
    });
  });
});

describe('unavailable-program publication protection (C3)', () => {
  // A synthetic Python skill and records that never enter the live catalog.
  const skill = SkillSchema.parse({
    code: PY_SKILL,
    version: '1.0.0',
    title: 'Synthetic Python print reading',
    program: CODE,
    domain: 'py6-programming-fundamentals',
    standards: ['PY6-SYNTHETIC-STD'],
    prerequisiteSkillCodes: [],
    observableEvidence: ['Synthetic observable evidence for python.'],
    misconceptionCodes: [],
    difficultyBands: ['foundational'],
    masteryCheckRule: 'Synthetic mastery rule for python.',
  }) as Skill;
  const reviewed = pythonPracticeItem('synthetic-python-reviewed') as never as Parameters<
    typeof publishableContentProjection
  >[0][number];
  const base = reviewed as unknown as { review: Record<string, unknown> };
  const reviewedItem = {
    ...reviewed,
    title: 'Synthetic reviewed python item',
    review: { ...base.review, status: 'reviewed', reviewedAt: '2026-01-01' },
  } as never;
  const pendingItem = {
    ...reviewed,
    id: 'synthetic-python-pending',
    title: 'Synthetic pending python item',
    review: { ...base.review, status: 'pending_review' },
  } as never;
  const roster = [...PROGRAM_ROSTER];

  it('rosters the program as unavailable', () => {
    expect(roster.find((entry) => entry.code === CODE)?.available).toBe(false);
  });

  it('never projects an unavailable program skill, even with a reviewed record', () => {
    expect(publishableSkillProjection([skill], [reviewedItem], roster)).toEqual([]);
  });

  it('excludes pending, assessment and review records from the content projection', () => {
    const asRole = (role: string) => ({ ...(reviewedItem as object), role }) as never;
    expect(publishableContentProjection([pendingItem])).toEqual([]);
    expect(publishableContentProjection([asRole('assessment'), asRole('review')])).toEqual([]);
  });

  it('shows only the existing placeholder: no skill metadata, standards, listing or counts', () => {
    const rendered = buildBody(
      [...contentCatalog, reviewedItem, pendingItem],
      [...skillCatalog, skill],
      roster,
    );
    const placeholder = rendered.body.match(
      new RegExp(
        `<section class="program-section program-section-empty" id="program-${CODE}">[\\s\\S]*?</section>`,
      ),
    );
    expect(placeholder?.[0]).toContain('Coming soon');
    expect(placeholder?.[0]).toContain('This program is not available yet.');
    for (const leak of [
      PY_SKILL,
      'Synthetic Python print reading',
      'PY6-SYNTHETIC-STD',
      'Synthetic observable evidence for python.',
      'Synthetic mastery rule for python.',
      'Synthetic reviewed python item',
      'Synthetic pending python item',
      'py6-programming-fundamentals',
      'Programming Fundamentals',
      'print("Hi")',
      'Hi\n3',
    ]) {
      expect(rendered.body, leak).not.toContain(leak);
    }
    // Counts are identical to the live catalog's: the synthetic skill adds nothing.
    const live = buildBody(contentCatalog, skillCatalog, roster);
    expect(rendered.stats).toBe(live.stats);
  });

  it('a skill in an available program with only a pending record is also withheld', () => {
    const available = roster.map((entry) =>
      entry.code === CODE ? { ...entry, available: true } : entry,
    );
    expect(publishableSkillProjection([skill], [pendingItem], available)).toEqual([]);
  });
});
