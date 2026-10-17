---
name: feature-builder
description: Implement a small, well-scoped feature or bug fix in the existing supermark cultivation card game. Use for new card behaviors, class mechanics, combat rules, UI updates, or save-system changes when the actual game code is available.
---

# Supermark feature builder

## Goal
Deliver one reviewable feature or fix without breaking existing gameplay.

## Procedure
1. Read AGENTS.md, inspect the repository, relevant code, game data and existing tests. Confirm the runtime/framework from configuration.
2. Write a short mini-spec: current behavior, desired behavior, affected files, explicit acceptance criteria, and edge cases. Note assumptions.
3. If there is no implementation/code in this branch, **do not pretend to implement**. Report the missing source and the minimum files needed to proceed.
4. Choose the smallest coherent implementation; prefer existing game data/schema and helpers instead of parallel systems.
5. For card changes, check: class restrictions, resource cost and payment order, targeting, damage/heal/status, turn reset, draw/discard, death and battle end, UI text, and serialization if applicable.
6. Add or update focused automated tests where the project supports them; otherwise provide reproducible manual steps with exact expected outcomes.
7. Run available tests, lints and build commands only after reading the actual project scripts. Note pass, fail, and not-run separately.
8. Review the diff for unrelated edits, accidental assets, hard-coded sensitive values and regressions.
9. Summarize changed paths, final behavior, test evidence, known gaps, and rollback considerations; commit only when requested or permitted in the development workflow.

## Acceptance gates
- Existing gameplay unchanged outside defined scope.
- Cards resolve effects exactly once, with correct resource and health costs.
- Invalid targets/actions are handled clearly without corrupting game state.
- A failed test is reported; never label a failing build as complete.
- No added dependencies unless needed and justified.

## Handoff
If suitable, call the game-qa workflow for regression checks. For status reports, call project-manager rather than inferring overall completion from one change.
