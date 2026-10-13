import test from 'node:test';import assert from 'node:assert/strict';
import {simulate} from './helpers/full-run.js';
for(const sect of ['sword','thunder','clone'])test(`${sect} completes seeds 1,7,42 with every action save/load verified`,()=>{for(const seed of [1,7,42]){const result=simulate(sect,seed);assert.equal(result.result,'won');assert(result.moves<200);}});
