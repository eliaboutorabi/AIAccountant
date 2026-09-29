# A helpful agent. A thoughtful system.

Design a controlled exception-investigation assistant.

Fictional learning project for AI Accountant. Suggested time: 4–6 hours. Tools: Your chosen AI coding tool · TypeScript or Python.

## Outcome

A small demonstrable application, an evaluation report, and a clear architecture diagram.

## Steps

### 1. Define the contract

Use the reconciliation data and define three capabilities: read an allowed record, calculate an amount, and prepare a reviewer note. Document schemas, permissions, source references, and error behavior. Keep posting and payment tools out of the prototype.

### 2. Build the deterministic core

Implement source validation and exact calculations before adding generation. Keep secrets in a server environment, never in browser code. A local mock model is enough to test orchestration before connecting an approved service.

### 3. Add the working environment

Track task IDs, state, evidence, tool results, and a review status. Apply step and cost limits, bounded retries, and a clear escalation state. If you add write operations later, require authorization and idempotency.

### 4. Prove the boundaries

Use agent-cases.json to test missing records, unauthorized access, duplicate input, tool failure, and prompt injection. Score evidence, amounts, permissions, and escalation separately. Record what failed and show a reviewer how to reproduce it.

## Definition of done

- [ ] No unauthorized records or consequential actions are exposed
- [ ] Every monetary claim is tied to a deterministic calculation and source
- [ ] Missing evidence and failed tools lead to bounded escalation
- [ ] A repeatable evaluation covers normal and adversarial cases

## Stretch

Add versioned skills, a persistent review queue, regression evaluations, and simulated recovery after interruption. Explain the control implications of each new capability.

## Present your work

Show the business question, the data grain, your assumptions, a simple baseline, the checks you ran, one failure you found, and the limits of the result. Include a source-to-output diagram and a short README so another person can reproduce the work.

All data are fictional. These tiny fixtures support learning, not production model training or real financial decisions. No professional qualification is awarded.
