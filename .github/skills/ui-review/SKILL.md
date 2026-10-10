---
name: ui-review
description: Independently and read-only reviews a UI increment for requirement fidelity, authority boundaries, held-out/privacy safety, WCAG 2.2 AA, states, version scoping, and evidence quality. Use after UI implementation and before human approval.
---

# UI review

**This skill is a wrapper, not the source of procedure.**

Follow `docs/ui-review-playbook.md` exactly; where this file and the playbook
differ, the playbook governs and the difference is a defect to report. Any
tool can do this work from the playbook alone.

Hard reminders: read-only and fresh context; cite only code, test output, and
screenshots you actually obtained; check the actual reviewing and implementing
models against `docs/agent-orchestration.md`; no self-approval; cross-family
review is mandatory for critical safety, privacy, scoring, or authorization
changes; never claim human approval.
