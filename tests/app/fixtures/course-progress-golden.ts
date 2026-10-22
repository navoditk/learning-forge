import type { CourseProgress } from '../../../src/app/course-progress-view';

/**
 * Golden markup captured ONCE from the pre-change inline sections of
 * src/app/page.tsx (learner) and src/app/parent/page.tsx (parent), rendered
 * with renderToStaticMarkup inside a <main> wrapper, with
 * Date.prototype.toLocaleDateString stubbed to "10/10/2026" so the parent
 * date text is locale independent. Change these strings only with a reviewed
 * UI diff (scope R-9). The inputs are synthetic.
 */
const skill = (code: string) => [{ code, version: '1.0.0' }];

export const GOLDEN_STUBBED_DATE = '10/10/2026';

export const GOLDEN_SINGLE_VERSION_PROGRESS: CourseProgress = {
  units: [
    {
      code: 'ratios-and-proportional-reasoning',
      version: '1.0.0',
      title: 'Ratios and proportional reasoning',
      status: 'IN_PROGRESS',
      lessons: [
        {
          code: 'ratio-language-lesson',
          version: '1.0.0',
          title: 'Ratio language',
          completionStatus: 'COMPLETE',
          remediationStatus: 'NONE',
          latestAssessment: {
            outcome: 'PASS',
            resultId: 'result-synthetic-1',
            scoredAt: '2026-10-10T12:00:00.000Z',
          },
          skillRefs: skill('ratio-language'),
        },
        {
          code: 'unit-rates-lesson',
          version: '1.0.0',
          title: 'Unit rates',
          completionStatus: 'IN_PROGRESS',
          remediationStatus: 'ACTIVE',
          skillRefs: skill('unit-rates'),
        },
        {
          code: 'ratio-tables-lesson',
          version: '1.0.0',
          title: 'Ratio tables',
          completionStatus: 'IN_PROGRESS',
          remediationStatus: 'NEEDS_HELP',
          latestAssessment: {
            outcome: 'FAIL',
            resultId: 'result-synthetic-2',
            scoredAt: '2026-10-11T12:00:00.000Z',
          },
          skillRefs: skill('ratio-tables'),
        },
      ],
    },
  ],
  history: [],
};

export const GOLDEN_OVERRIDE_MESSAGE = 'Ratio tables is no longer marked as needing help.';

export const GOLDEN_LEARNER_MARKUP =
  '<main><section aria-labelledby="course-progress-heading" class="pilot-progress-panel"><h3 id="course-progress-heading">Course progress</h3><p><small>Completion and mastery are tracked separately. Assessment results appear here only after they are recorded.</small></p><article aria-labelledby="ratios-and-proportional-reasoning-heading"><h4 id="ratios-and-proportional-reasoning-heading">Ratios and proportional reasoning</h4><p>Unit status: in progress</p><ol><li><strong>Ratio language</strong> — complete<span> Latest assessment: pass.</span></li><li><strong>Unit rates</strong> — in progress<span> (active)</span></li><li><strong>Ratio tables</strong> — in progress<span> (needs help)</span><span> Latest assessment: fail.</span></li></ol></article></section></main>';

export const GOLDEN_PARENT_MARKUP =
  '<main><section aria-labelledby="course-progress-heading"><h2 id="course-progress-heading">Course progression</h2><p>Completion history and current remediation are shown separately from mastery evidence.</p><article aria-labelledby="ratios-and-proportional-reasoning-heading"><h3 id="ratios-and-proportional-reasoning-heading">Ratios and proportional reasoning</h3><p>Unit status: in progress</p><ul><li><strong>Ratio language</strong>: complete; remediation none.<span> Assessment: pass on 10/10/2026.</span></li><li><strong>Unit rates</strong>: in progress; remediation active.</li><li><strong>Ratio tables</strong>: in progress; remediation needs help.<span> Assessment: fail on 10/10/2026.</span><div class="needs-help-override"><button type="button">Clear “needs help” for Ratio tables</button></div></li></ul></article></section></main>';

export const GOLDEN_PARENT_MESSAGE_MARKUP =
  '<main><section aria-labelledby="course-progress-heading"><h2 id="course-progress-heading">Course progression</h2><p>Completion history and current remediation are shown separately from mastery evidence.</p><article aria-labelledby="ratios-and-proportional-reasoning-heading"><h3 id="ratios-and-proportional-reasoning-heading">Ratios and proportional reasoning</h3><p>Unit status: in progress</p><ul><li><strong>Ratio language</strong>: complete; remediation none.<span> Assessment: pass on 10/10/2026.</span></li><li><strong>Unit rates</strong>: in progress; remediation active.</li><li><strong>Ratio tables</strong>: in progress; remediation needs help.<span> Assessment: fail on 10/10/2026.</span><div class="needs-help-override"><button type="button">Clear “needs help” for Ratio tables</button></div></li></ul></article><p role="status">Ratio tables is no longer marked as needing help.</p></section></main>';
