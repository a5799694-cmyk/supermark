---
name: project-manager
description: Audit the supermark game repository, establish the actual development state, compare commits and documents, and prepare a concise prioritized handover or weekly review. Use when asked to check progress, GitHub synchronization, project status, remaining work, or next development tasks.
---

# Supermark project manager

## Goal
Make repository state observable and keep a reliable, concise record of progress. Never invent missing files, features, tests, or commits.

## Procedure
1. Identify repository and branch; read AGENTS.md and inspect the root, game source, configuration, docs, asset manifests, and recent commits. If local and remote are accessible, compare HEAD and working-tree changes before stating they are synchronized.
2. Extract **verified implemented features** only from source plus runnable evidence when possible. Track separately: discussed/planned, implemented but unverified, tested, and released.
3. Identify the current run/start instructions from actual package files or scripts, never assumptions. If no runnable game files exist, explicitly report `game code not found on this branch`.
4. List actionable issues: broken game loop, missing code or assets, unsynchronized files, untested functionality, and missing documentation. Avoid creating new scope without user approval.
5. Prioritize at most three smallest next tasks; each must have an observable completion condition.
6. For a handover or Monday summary, explain verified changes since the last confirmed commit or check, outstanding risks, and next week’s priorities. If comparison baseline is missing, say so.

## Output format
- Repository / inspected branch / latest observed commit
- Verified today (evidence: paths, test output, commits)
- Planned but not yet verified
- Blockers and risks
- Next 1–3 executable tasks with acceptance criteria
- Exact checks run and checks not possible

## Constraints
- Do not modify game code during a read-only audit.
- No ungrounded percentage-complete estimates or invented Git status.
- When no game source exists, prioritize recovering/synchronizing actual source rather than scaffolding imaginary game functionality.
- Weekly reports describe only information available at execution; do not imply background monitoring.
