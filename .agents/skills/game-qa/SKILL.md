---
name: game-qa
description: Test supermark turn-based card battles, browser controls, class mechanics, saves and regression behavior using the project's actual code and available test environment. Use for bug hunts, pre-commit checks, release checks, and gameplay validation.
---

# Supermark game QA

## Goal
Return reproducible evidence of gameplay quality, not vague claims that the game looks fine.

## Setup
1. Read AGENTS.md and detect real framework, scripts, test runner and playable entrypoint. Determine whether code, dependencies, browser automation and test data exist.
2. If repository lacks runnable game source, mark execution **blocked: source missing**, list checked paths and propose how to recover code. Never manufacture test results.
3. Record tested branch, commit, environment and available commands.

## Test matrix
Check applicable scenarios in this order:
- **Startup**: app loads without broken scripts/assets; desktop and narrow/mobile viewport if tools permit.
- **Turn flow**: combat start, draw, pay resource, play card, resolve effect, discard/retain, enemy turn, next turn.
- **Boundaries**: zero energy, insufficient health for self-cost, empty deck, overdraw, invalid targets, duplicate click, lethal damage during effect resolution.
- **Classes**: 剑修、雷修、分身修 mechanics if implemented. A planned class is not a failed test.
- **Statuses and combos**: stacking/duration, multi-hit, summons/clones, target switching and once-only triggers, only when present.
- **Outcomes**: win/lose, rewards, restart, no post-game illegal actions.
- **Persistence/UI**: save/reload, card text alignment, button disabling, responsiveness, input feedback if implemented.

## Execution
- Prefer existing automated test commands from package/configuration.
- Add minimal regression cases for confirmed defects when requested.
- For non-automated checks, write precise steps, input state, expected and observed result.
- Do not claim successful browser interaction unless a browser was actually used.
- Differentiate PASS, FAIL, BLOCKED and NOT APPLICABLE.

## Defect format
- ID / severity / area
- Reproduction steps and starting state
- Expected vs actual
- Evidence (test output, stack trace, screenshot path if available)
- Suspected cause (clearly marked hypothesis)
- Smallest recommended fix and regression test

## Final report
Give counts by PASS/FAIL/BLOCKED/N/A, exact commands and results, highest-risk issue first, and a clear go/no-go reason for the requested scope. Never call a build release-ready solely because unit tests passed.
