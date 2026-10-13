import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../src/cards.js';
import { ENEMIES } from '../src/enemies.js';

test('uses the approved corporate-cultivation card names', () => {
  assert.equal(CARDS.roll.name, '时椒炒鱿');
  assert.equal(CARDS['not-this'].name, '关我鬼事');
  assert.equal(CARDS.breathe.name, '扮死抖气');
  assert.equal(CARDS.groups.name, '散水分身');
  assert.equal(CARDS.possess.name, '老细上身');
  assert.equal(CARDS.autoreply.name, '收到，收皮');
  assert.equal(CARDS.signin.name, '打卡撞鬼');
  assert.equal(CARDS.overtime.name, '做到起火');
  assert.equal(CARDS.performance.name, '冚家铲掌');
});

test('uses the approved corporate-cultivation enemy names', () => {
  assert.equal(ENEMIES.dummy.name, '考勤仙吏');
  assert.equal(ENEMIES.boss.name, '画饼天尊');
});
