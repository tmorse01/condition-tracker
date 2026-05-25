---
name: debug
description: Diagnose and fix bugs in the current workspace by reproducing issues, inspecting logs and traces, narrowing root cause, and making the smallest safe code change. Use when the user asks to debug, investigate a failure, reproduce a problem, inspect errors, trace behavior, or fix an unexpected result.
---

# Debug

## Workflow

1. Reproduce the issue with the smallest reliable test case.
2. Inspect the relevant code path, logs, stack traces, and recent changes.
3. Form a focused hypothesis about the root cause.
4. Make the smallest fix that addresses the cause, not just the symptom.
5. Verify with targeted tests or a repeat reproduction.

## Guidance

- Prefer local evidence over assumptions.
- Narrow the search before editing code.
- Check adjacent code for invariants, edge cases, and error handling.
- Keep changes minimal and avoid unrelated refactors.
- If the root cause is unclear, add temporary diagnostics only when they directly help confirm the hypothesis, then remove them.

## When to use tools

- Use search and file inspection to find the failing path.
- Run targeted tests or repro commands after each meaningful change.
- Prefer the smallest validation that proves the fix.

## Output

- State the root cause clearly.
- Summarize the fix and the verification performed.
- Call out any remaining risks if the issue is only partially verified.
