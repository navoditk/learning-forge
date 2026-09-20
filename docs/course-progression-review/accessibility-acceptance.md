# Accessibility acceptance — Grade 6 Math progression pilot

**Status:** Product-owner acceptance recorded 2026-09-20 for the
single-household pilot. The product owner instructed the implementation to
assume that the required manual screen-reader pass is complete. This record is
not an independent accessibility audit.

## Accepted scope

- Progression review, learner, and parent surfaces.
- Keyboard operation, visible focus, status/live-region messaging, semantic
  headings and tables, text alternatives, and error recovery.
- Existing automated axe and keyboard checks remain required release evidence.

## Reinforcement checks

- [ ] Re-run `npm run test:e2e` after any progression UI change.
- [ ] Repeat a screen-reader pass after any change to focus order, live-region
      text, assessment status, or parent evidence wording.
- [ ] Test at 200% zoom and narrow viewport reflow without loss of status or
      controls.
- [ ] Record assistive technology, browser, date, findings, and fixes in
      `docs/PROGRESS.md` when the manual pass is performed rather than assumed.

## Revisit trigger

Revisit before expanding beyond the single-household pilot, adding a concrete
accommodation request, or materially changing progression UI.
