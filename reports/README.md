# Evaluation reports

LF-0.8 defines a deterministic synthetic baseline runner using the fake tutor.
The runner reports case IDs, dimensions, severities, observed move/status,
policy version, model identifier, and failures. It deliberately omits random
trace IDs so repeated baseline runs are comparable.

The baseline is evidence for regression review, not a calibrated release gate.
It does not establish numerical thresholds or real-model quality. Human
adjudication must approve severity labels, corpus scope, and future gates.

Run the baseline with:

```bash
npm run eval:run
```
