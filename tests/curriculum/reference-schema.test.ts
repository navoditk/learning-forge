import { describe, expect, it } from 'vitest';

import {
  AssessmentBankSchema,
  AssessmentContentItemSchema,
  LessonSchema,
  ProgramSchema,
  RefSchema,
  ItemRefSchema,
  ReviewContentItemSchema,
  TeachingContentItemSchema,
  UnitSchema,
  VersionedSkillSchema,
} from '../../src/contracts/progression';
import { ProgressionPolicyProfileSchema } from '../../src/contracts/policy';

type SchemaLike = { def?: { type?: string; innerType?: SchemaLike; element?: SchemaLike } };

function unwrap(schema: SchemaLike): SchemaLike {
  let current = schema;
  while (current.def?.type === 'optional' || current.def?.type === 'nullable') {
    current = current.def.innerType!;
  }
  if (current.def?.type === 'array') return current.def.element!;
  return current;
}

describe('reference schema exhaustiveness', () => {
  it('uses Ref or ItemRef for every versioned record reference field', () => {
    const schemas = [
      ProgramSchema,
      UnitSchema,
      LessonSchema,
      AssessmentBankSchema,
      TeachingContentItemSchema,
      AssessmentContentItemSchema,
      ReviewContentItemSchema,
      VersionedSkillSchema,
      ProgressionPolicyProfileSchema,
    ] as const;

    for (const schema of schemas) {
      const shape = (schema as unknown as { def: { shape: Record<string, SchemaLike> } }).def.shape;
      for (const [field, fieldSchema] of Object.entries(shape)) {
        if (!/(?:Ref|Refs)$/u.test(field)) continue;
        expect([RefSchema, ItemRefSchema]).toContain(unwrap(fieldSchema));
      }
    }
  });
});
