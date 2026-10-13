import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../src/cards.js';
import { ENEMIES } from '../src/enemies.js';

test('uses the approved corporate-cultivation card names', () => {
  assert.equal(CARDS.roll.name, '这个需求今天必须飞升');
  assert.equal(CARDS['not-this'].name, '这锅不在本座OKR里');
  assert.equal(CARDS.breathe.name, '带薪吐纳，领导勿扰');
  assert.equal(CARDS.groups.name, '三魂在开会，七魄在回收到');
  assert.equal(CARDS.possess.name, '向上管理，物理夺舍');
  assert.equal(CARDS.autoreply.name, '人已飞升，消息自动已读');
  assert.equal(CARDS.signin.name, '渡劫先打卡，迟到扣功德');
  assert.equal(CARDS.overtime.name, '九九六雷劫，零零七飞升');
  assert.equal(CARDS.performance.name, '命可以不要，绩效必须校准');
});

test('uses the approved corporate-cultivation enemy names', () => {
  assert.equal(ENEMIES.dummy.name, '考勤司已读不回仙吏');
  assert.equal(ENEMIES.boss.name, '飞升委员会首席画饼天尊');
});
