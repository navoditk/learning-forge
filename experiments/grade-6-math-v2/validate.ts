import { readFile } from 'node:fs/promises';
import { ContentItemSchema } from '../../src/contracts/content';
import { SkillSchema, type Skill } from '../../src/contracts/curriculum';

const expectedStandards = new Set([
  '6.RP.A.1',
  '6.RP.A.2',
  '6.RP.A.3',
  '6.NS.A.1',
  '6.NS.B.2',
  '6.NS.B.3',
  '6.NS.B.4',
  '6.NS.C.5',
  '6.NS.C.6',
  '6.NS.C.7',
  '6.NS.C.8',
  '6.EE.A.1',
  '6.EE.A.2',
  '6.EE.A.3',
  '6.EE.A.4',
  '6.EE.B.5',
  '6.EE.B.6',
  '6.EE.B.7',
  '6.EE.B.8',
  '6.EE.C.9',
  '6.G.A.1',
  '6.G.A.2',
  '6.G.A.3',
  '6.G.A.4',
  '6.SP.A.1',
  '6.SP.A.2',
  '6.SP.A.3',
  '6.SP.B.4',
  '6.SP.B.5',
]);

// Every masteryCheckRule must state both invariants below verbatim (case
// insensitive): that an independent, unassisted delayed check is required,
// and that assisted attempts alone cannot establish secure mastery. This is
// an isolated candidate-authoring text check; it does not change the
// production SkillSchema, which only requires masteryCheckRule to be a
// non-empty string.
const REQUIRES_INDEPENDENT_DELAYED_CHECK = /independent,\s*unassisted delayed check/i;
const REQUIRES_ASSISTED_ATTEMPTS_INSUFFICIENT =
  /assisted attempts alone do not establish secure mastery/i;
const REQUIRED_RECORDS_PER_SKILL = 2;
const REQUIRED_CONTENT_FIELDS = new Set([
  ...Object.keys(ContentItemSchema.shape),
  'accessibleAlternative',
  'answerFormat',
  'misconceptionDistractors',
  'representations',
]);

function topologicalOrder(skills: readonly Skill[]): string[] {
  const byCode = new Map(skills.map((skill) => [skill.code, skill]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];
  function visit(code: string): void {
    if (visited.has(code)) return;
    if (visiting.has(code)) throw new Error(`cycle detected at ${code}`);
    const skill = byCode.get(code);
    if (!skill) throw new Error(`unknown prerequisite ${code}`);
    visiting.add(code);
    skill.prerequisiteSkillCodes.forEach(visit);
    visiting.delete(code);
    visited.add(code);
    order.push(code);
  }
  skills.forEach((skill) => visit(skill.code));
  return order;
}

/**
 * Parses the standard/skill mapping out of standards-to-skill-matrix.md's
 * table rows. Only rows with a backtick-quoted `6.X.Y.Z`-shaped standard in
 * the second column and a backtick-quoted skill-code slug in the third
 * column are treated as mapping rows (this skips the header/separator rows
 * and the prose sections). Returns a map of standard code -> skill code.
 */
function parseMatrixMapping(markdown: string): Map<string, string> {
  const mapping = new Map<string, string>();
  const standardCell = /^`(6\.[A-Z]+\.[A-Z]\.\d+)`$/;
  const skillCell = /^`([a-z0-9-]+)`$/;
  for (const line of markdown.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 3) continue;
    const standardMatch = standardCell.exec(cells[1]);
    const skillMatch = skillCell.exec(cells[2]);
    if (!standardMatch || !skillMatch) continue;
    const [, standard] = standardMatch;
    const [, skillCode] = skillMatch;
    if (mapping.has(standard)) {
      throw new Error(`standards-to-skill-matrix.md maps ${standard} more than once`);
    }
    mapping.set(standard, skillCode);
  }
  return mapping;
}

/**
 * Parses misconception-glossary.md's table rows to extract documented codes.
 * Only rows with a backtick-quoted skill code in the second column are
 * captured. Returns a set of unique misconception codes.
 */
function parseGlossaryEntries(markdown: string): Map<string, string> {
  const entries = new Map<string, string>();
  const codeCell = /^`([a-z0-9-]+)`$/;
  const placeholderDescription = /^(?:-|n\/a|na|todo|tbd|placeholder)$/i;
  for (const line of markdown.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 3) continue;
    const match = codeCell.exec(cells[1]);
    if (!match) continue;
    const [, code] = match;
    const description = cells[2].trim();
    if (!description || placeholderDescription.test(description)) {
      throw new Error(
        `misconception-glossary.md has an empty or placeholder description for ${code}`,
      );
    }
    if (entries.has(code)) {
      throw new Error(`misconception-glossary.md defines ${code} more than once`);
    }
    entries.set(code, description);
  }
  return entries;
}

async function main(): Promise<void> {
  const raw = JSON.parse(
    await readFile(new URL('./skill-records-v2.json', import.meta.url), 'utf8'),
  ) as unknown;
  if (!Array.isArray(raw)) throw new Error('skill-records-v2.json must contain a record array');
  const skills = raw.map((item) => SkillSchema.parse(item));

  const codes = new Set(skills.map((skill) => skill.code));
  const skillsByCode = new Map(skills.map((skill) => [skill.code, skill]));
  if (codes.size !== skills.length) throw new Error('skill codes must be unique');
  for (const skill of skills) {
    if (new Set(skill.misconceptionCodes).size !== skill.misconceptionCodes.length) {
      throw new Error(`${skill.code} repeats a misconceptionCode within its record`);
    }
  }

  // Exactly one candidate skill maps each approved standard: build
  // standard -> skill-code(s) and require exactly one skill per code, not
  // just full set coverage.
  const skillsByStandard = new Map<string, string[]>();
  for (const skill of skills) {
    for (const standard of skill.standards) {
      const existing = skillsByStandard.get(standard) ?? [];
      existing.push(skill.code);
      skillsByStandard.set(standard, existing);
    }
  }
  if (skillsByStandard.size !== expectedStandards.size) {
    throw new Error(
      `standards coverage count is not exactly ${expectedStandards.size} (found ${skillsByStandard.size})`,
    );
  }
  for (const code of expectedStandards) {
    const mappedSkills = skillsByStandard.get(code);
    if (!mappedSkills) throw new Error(`missing approved standard ${code}`);
    if (mappedSkills.length !== 1) {
      throw new Error(
        `standard ${code} must map to exactly one skill, found ${mappedSkills.length}: ${mappedSkills.join(', ')}`,
      );
    }
  }
  for (const code of skillsByStandard.keys()) {
    if (!expectedStandards.has(code)) throw new Error(`unexpected standard ${code}`);
  }

  for (const skill of skills) {
    for (const prerequisite of skill.prerequisiteSkillCodes) {
      if (!codes.has(prerequisite)) {
        throw new Error(`${skill.code} references unknown prerequisite ${prerequisite}`);
      }
    }
  }

  const order = topologicalOrder(skills);
  if (order.length !== skills.length) throw new Error('topological order is incomplete');

  for (const skill of skills) {
    if (!REQUIRES_INDEPENDENT_DELAYED_CHECK.test(skill.masteryCheckRule)) {
      throw new Error(
        `${skill.code}'s masteryCheckRule must require an independent, unassisted delayed check`,
      );
    }
    if (!REQUIRES_ASSISTED_ATTEMPTS_INSUFFICIENT.test(skill.masteryCheckRule)) {
      throw new Error(
        `${skill.code}'s masteryCheckRule must state that assisted attempts alone do not establish secure mastery`,
      );
    }
  }

  const matrixMarkdown = await readFile(
    new URL('./standards-to-skill-matrix.md', import.meta.url),
    'utf8',
  );
  const matrixMapping = parseMatrixMapping(matrixMarkdown);
  if (matrixMapping.size !== expectedStandards.size) {
    throw new Error(
      `standards-to-skill-matrix.md maps ${matrixMapping.size} standards, expected ${expectedStandards.size}`,
    );
  }
  for (const [standard, skillCode] of skillsByStandard) {
    const [actualSkillCode] = skillCode;
    const documentedSkillCode = matrixMapping.get(standard);
    if (!documentedSkillCode) {
      throw new Error(`standards-to-skill-matrix.md is missing a row for ${standard}`);
    }
    if (documentedSkillCode !== actualSkillCode) {
      throw new Error(
        `standards-to-skill-matrix.md maps ${standard} to ${documentedSkillCode}, but skill-records-v2.json maps it to ${actualSkillCode}`,
      );
    }
  }
  for (const standard of matrixMapping.keys()) {
    if (!skillsByStandard.has(standard)) {
      throw new Error(`standards-to-skill-matrix.md documents unknown standard ${standard}`);
    }
  }

  // Verify 6.SP.B.4 representation requirements: distribution-description
  // must require dot plot, histogram, and box plot across its evidence and rule.
  const distSkill = skills.find((s) => s.code === 'distribution-description');
  if (!distSkill) throw new Error('missing distribution-description skill');
  for (const rep of ['dot plot', 'histogram', 'box plot']) {
    if (!distSkill.observableEvidence.join(' ').toLowerCase().includes(rep)) {
      throw new Error(
        `distribution-description observableEvidence must explicitly require '${rep}'`,
      );
    }
    if (!distSkill.masteryCheckRule.toLowerCase().includes(rep)) {
      throw new Error(`distribution-description masteryCheckRule must explicitly require '${rep}'`);
    }
  }

  // Verify misconception glossary completeness: 1:1 match between skill-records-v2.json
  // and misconception-glossary.md (no missing glossary entry, no extra glossary entry).
  const glossaryMarkdown = await readFile(
    new URL('./misconception-glossary.md', import.meta.url),
    'utf8',
  );
  const glossaryEntries = parseGlossaryEntries(glossaryMarkdown);
  const glossaryCodes = new Set(glossaryEntries.keys());
  const allSkillMisconceptionCodes = new Set(skills.flatMap((s) => s.misconceptionCodes));
  for (const code of allSkillMisconceptionCodes) {
    if (!glossaryCodes.has(code)) {
      throw new Error(`misconception code ${code} is missing from misconception-glossary.md`);
    }
  }
  for (const code of glossaryCodes) {
    if (!allSkillMisconceptionCodes.has(code)) {
      throw new Error(`misconception-glossary.md documents unused code ${code}`);
    }
  }

  const rawContent = JSON.parse(
    await readFile(new URL('./content-records-v2.json', import.meta.url), 'utf8'),
  ) as unknown;
  if (!Array.isArray(rawContent)) {
    throw new Error('content-records-v2.json must contain a record array');
  }
  const contentBySkill = new Map<string, number>();
  const usedRepresentations = new Set<string>();
  for (const item of rawContent) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('content-records-v2.json contains a non-object record');
    }
    const record = item as Record<string, unknown>;
    for (const field of Object.keys(record)) {
      if (!REQUIRED_CONTENT_FIELDS.has(field)) {
        throw new Error(`content record has unexpected field ${field}`);
      }
    }
    const {
      accessibleAlternative,
      answerFormat,
      misconceptionDistractors,
      representations,
      ...contentItem
    } = record;
    const parsed = ContentItemSchema.parse(contentItem);
    if (!skillsByCode.has(parsed.skillCode)) {
      throw new Error(`content record ${parsed.id} has an out-of-scope skill ${parsed.skillCode}`);
    }
    if (parsed.review.status === 'reviewed') {
      throw new Error(`content record ${parsed.id} must not be approved or reviewed`);
    }
    if (parsed.review.status !== 'pending_review') {
      throw new Error(`content record ${parsed.id} must be pending_review`);
    }
    if (parsed.provenance.origin !== 'original' && parsed.provenance.origin !== 'llm_drafted') {
      throw new Error(`content record ${parsed.id} must be original or llm_drafted`);
    }
    if (
      !parsed.deterministicValidator.acceptedAnswers.includes(
        parsed.deterministicValidator.canonicalAnswer,
      )
    ) {
      throw new Error(
        `content record ${parsed.id} must list its canonical answer as an accepted answer`,
      );
    }
    const hintText = parsed.hintSteps.map((step) => `${step.prompt} ${step.question}`).join(' ');
    for (const forbiddenPattern of parsed.forbiddenLeakagePatterns) {
      if (hintText.toLocaleLowerCase().includes(forbiddenPattern.toLocaleLowerCase())) {
        throw new Error(
          `content record ${parsed.id} leaks forbidden answer content in its hint ladder`,
        );
      }
    }
    const owningSkill = skillsByCode.get(parsed.skillCode);
    if (!owningSkill) {
      throw new Error(
        `content record ${parsed.id} references an unknown owning skill ${parsed.skillCode}`,
      );
    }
    if (!owningSkill.difficultyBands.includes(parsed.difficulty)) {
      throw new Error(
        `content record ${parsed.id} difficulty ${parsed.difficulty} is not declared by skill ${parsed.skillCode}`,
      );
    }
    const owningSkillMisconceptionCodes = new Set(owningSkill.misconceptionCodes);
    for (const misconceptionCode of parsed.misconceptionCodes) {
      if (!glossaryCodes.has(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} misconception code ${misconceptionCode} is missing from misconception-glossary.md`,
        );
      }
      if (!owningSkillMisconceptionCodes.has(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} misconception code ${misconceptionCode} is not declared by skill ${parsed.skillCode}`,
        );
      }
    }
    if (typeof accessibleAlternative !== 'string' || !accessibleAlternative.trim()) {
      throw new Error(`content record ${parsed.id} needs a non-empty accessibleAlternative`);
    }
    if (typeof answerFormat !== 'string' || !answerFormat.trim()) {
      throw new Error(`content record ${parsed.id} needs a non-empty answerFormat`);
    }
    if (!Array.isArray(misconceptionDistractors) || misconceptionDistractors.length < 1) {
      throw new Error(`content record ${parsed.id} needs at least one misconception distractor`);
    }
    const distractorMisconceptionCodes = new Set<string>();
    for (const distractor of misconceptionDistractors) {
      if (
        !distractor ||
        typeof distractor !== 'object' ||
        typeof (distractor as Record<string, unknown>).answer !== 'string' ||
        !(distractor as Record<string, unknown>).answer.trim() ||
        typeof (distractor as Record<string, unknown>).misconceptionCode !== 'string' ||
        typeof (distractor as Record<string, unknown>).rationale !== 'string' ||
        !(distractor as Record<string, unknown>).rationale.trim()
      ) {
        throw new Error(`content record ${parsed.id} has an invalid misconception distractor`);
      }
      const misconceptionCode = (distractor as Record<string, string>).misconceptionCode;
      distractorMisconceptionCodes.add(misconceptionCode);
      const distractorFields = Object.keys(distractor as Record<string, unknown>);
      if (
        distractorFields.length !== 3 ||
        distractorFields.some(
          (field) => !['answer', 'misconceptionCode', 'rationale'].includes(field),
        )
      ) {
        throw new Error(
          `content record ${parsed.id} has an unexpected misconception distractor field`,
        );
      }
      if (!glossaryCodes.has(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} distractor misconception code ${misconceptionCode} is missing from misconception-glossary.md`,
        );
      }
      if (!owningSkillMisconceptionCodes.has(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} distractor misconception code ${misconceptionCode} is not declared by skill ${parsed.skillCode}`,
        );
      }
      if (!parsed.misconceptionCodes.includes(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} distractor misconception code ${misconceptionCode} is not listed on the content record`,
        );
      }
    }
    for (const misconceptionCode of parsed.misconceptionCodes) {
      if (!distractorMisconceptionCodes.has(misconceptionCode)) {
        throw new Error(
          `content record ${parsed.id} misconception code ${misconceptionCode} needs a matching distractor`,
        );
      }
    }
    if (representations !== undefined) {
      if (
        !Array.isArray(representations) ||
        representations.some((rep) => typeof rep !== 'string')
      ) {
        throw new Error(`content record ${parsed.id} has invalid representations`);
      }
      representations.forEach((representation) => usedRepresentations.add(representation));
    }
    contentBySkill.set(parsed.skillCode, (contentBySkill.get(parsed.skillCode) ?? 0) + 1);
  }
  if (new Set(rawContent.map((item) => (item as { id?: unknown }).id)).size !== rawContent.length) {
    throw new Error('content record IDs must be unique');
  }
  for (const skillCode of skillsByCode.keys()) {
    const count = contentBySkill.get(skillCode) ?? 0;
    if (count !== REQUIRED_RECORDS_PER_SKILL) {
      throw new Error(
        `${skillCode} must have exactly ${REQUIRED_RECORDS_PER_SKILL} content records, found ${count}`,
      );
    }
  }
  for (const representation of ['dot plot', 'histogram', 'box plot']) {
    if (!usedRepresentations.has(representation)) {
      throw new Error(`distribution-description content must span ${representation}`);
    }
  }

  console.log(
    `PASS: ${skills.length} Skill records, ${skillsByStandard.size} exact standards each mapped to exactly one skill, ${order.length} acyclic nodes, mastery-check invariant present on every record, 6.SP.B.4 evidence and mastery rule each require dot plot/histogram/box plot, ${glossaryCodes.size} misconception codes in 1:1 glossary sync with non-placeholder descriptions, standards-to-skill-matrix.md matches skill-records-v2.json, and ${rawContent.length} pending-review content records provide exactly ${REQUIRED_RECORDS_PER_SKILL} records for all ${skills.length} skills with dot plot/histogram/box plot coverage, canonical accepted answers, non-leaking hints, and glossary- and skill-resolving misconception distractors.`,
  );
}

void main();
