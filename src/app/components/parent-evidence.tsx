import * as React from 'react';

import {
  hasScienceEvidence,
  hasSpellingEvidence,
  SCIENCE_EVIDENCE_NOTE,
  SPELLING_EVIDENCE_NOTE,
} from '../parent-claims';
import { qualifiedIndependentCheckLabel } from '../../curriculum/evidence-labels';

export type ParentEvidenceData = {
  learnerName: string;
  attempts: Array<{
    id: string;
    contentKey: string;
    correctness: string;
    highestAssistance: string;
  }>;
  mastery: Array<{
    skillCode: string;
    estimate: number;
    confidenceBand: string;
    independentDelayedCheck: boolean;
  }>;
};

export function ParentEvidence({ evidence }: { evidence: ParentEvidenceData }) {
  return (
    <section aria-labelledby="evidence-heading">
      <h2 id="evidence-heading">{evidence.learnerName}</h2>
      <h3>Mastery by skill</h3>
      {evidence.mastery.length === 0 ? (
        <p>No mastery evidence yet.</p>
      ) : (
        <ul>
          {evidence.mastery.map((row) => (
            <li key={row.skillCode}>
              Skill: {row.skillCode} — estimate {row.estimate}, confidence{' '}
              {row.confidenceBand.toLocaleLowerCase()}.{' '}
              {/* D-65: today's same-sitting check is independent PRACTICE, not a genuine time-separated
                  delayed check (re-review F6), so the wording does not overclaim either case. */}
              {row.independentDelayedCheck
                ? (qualifiedIndependentCheckLabel(row.skillCode) ?? 'Independently confirmed.')
                : 'Independent confirmation still needed.'}
            </li>
          ))}
        </ul>
      )}
      {hasScienceEvidence(evidence.mastery) && <p>{SCIENCE_EVIDENCE_NOTE}</p>}
      {hasSpellingEvidence(evidence.mastery) && <p>{SPELLING_EVIDENCE_NOTE}</p>}
      <h3>Recent attempts</h3>
      {evidence.attempts.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        <ul>
          {evidence.attempts.map((attempt) => (
            <li key={attempt.id}>
              {attempt.contentKey}: {attempt.correctness.toLocaleLowerCase()} with{' '}
              {attempt.highestAssistance.toLocaleLowerCase().replaceAll('_', ' ')} assistance
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
