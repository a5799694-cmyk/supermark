# supermark — Codex project instructions

## Project identity
supermark is a lightweight, turn-based cultivation-themed card game with a satirical office-worker tone. The current target design has three classes: 剑修, 雷修, 分身修. Writing should favor concise, witty Chinese dialogue with Cantonese-flavored phrasing where appropriate; do not sacrifice readability for rhyme. Visual inspiration may include dark illustrated card-game atmosphere, but do not copy copyrighted characters, art, code, or text.

## Ground truth
- Inspect actual repository files and recent commits before stating implementation status. An agreed feature is not automatically an implemented feature.
- Do not infer the framework, runtime, commands, gameplay schema, asset path, or deployment target until code/configuration confirms them.
- If only scaffolding exists, clearly say so. Do not invent build or test success.
- Preserve existing work and user-made edits. Avoid sweeping rewrites, unrelated refactors, and forced overwrites.

## Work pattern
1. Inspect repository structure, status, and relevant files.
2. Summarize observed facts, assumptions, and a small acceptance checklist.
3. Implement the smallest change consistent with the current architecture.
4. Run available targeted tests and build/lint checks when available; disclose anything not executable.
5. Report changed files, verified checks, known risks, and next steps.
6. Make commits only with an accurate scope and message; do not claim a push or deployment that did not happen.

## Gameplay guardrails
- Treat 剑修 / 雷修 / 分身修 as planned archetypes; confirm their mechanics from the actual source of truth before implementation.
- Consider card resource cost, status effects, turn boundaries, targeting, health payment, draw/discard, enemy behavior, and encounter completion when changing combat.
- Keep playable combat loops and clear user feedback higher priority than expanding card counts or visual polish.
- Numeric balance claims need reproducible evidence; avoid presenting a design guess as simulated data.

## Art and UX
- Maintain stylistic consistency within the project. Keep subject silhouette, proportions, palette and animation references stable once approved.
- Record image asset dimensions, filename conventions, transparency, provenance/license, and actual runtime use.
- Prioritize desktop/mobile usability and readable card text when browser UI exists.

## Skills
Use repository-local instructions when relevant:
- `.agents/skills/project-manager/SKILL.md` — status audits, synchronization, handover notes
- `.agents/skills/feature-builder/SKILL.md` — scoped feature implementation
- `.agents/skills/game-qa/SKILL.md` — systematic game tests and bug reports

When multiple skills apply: project-manager establishes facts; feature-builder makes a scoped change; game-qa validates and reports results. Never confuse a proposed plan with completed implementation.
