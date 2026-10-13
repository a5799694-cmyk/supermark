# 三门派 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 实现三门派选择、21种卡、资源与大招、奖励保底和动态牌面，并交付可试玩接续包。
**Architecture:** 保留原生模块及纯函数规则层。门派配置独立，卡牌预览与结算共享计算，旧存档保留legacy路径。
**Tech Stack:** 原生JavaScript ES modules、HTML/CSS、node:test、localStorage，无新增产品依赖。
**Spec:** docs/superpowers/specs/2026-10-13-three-sects-design.md

## Global Constraints
- 生命40，每回合基础灵力3，抽4张，怒气上限12，分身上限3，战后恢复6生命。
- 回灵允许超过3，下回合重置为3；生命支付要求生命大于6。
- 三场战斗流程不变，专属牌不强化，原存档不静默覆盖。
- 中文短牌名、押韵门派台词；优先360×800；不接抖音SDK。
- Git目标：a5799694-cmyk/supermark的feature/dream-cultivation-prototype；交付ZIP含源码、测试、文档和Git bundle。

## Review Focus
- 减费0费牌不得产生负费用，技能牌不消耗攻击减费。
- 多段攻击增幅只吃一次，追击不得增加手动攻击计数。
- 回灵后的合法存档不能因灵力超过3而被拒绝。
- 旧存档途中的原奖励必须可继续领取，结局重开进入新选择。
- 最后敌人死亡停止伤害链，但本次费用与生命支付只结算一次。

### Task 1: 门派和卡牌配置
**Files:** 新增src/sects.js；修改src/cards.js、tests/cards.test.js、tests/copy.test.js；新增tests/sects.test.js。
**Interfaces:** SECTS按sword/thunder/clone索引；createStarterDeck(sectId)返回带稳定uid的6张实例；CARDS保留旧ID，新增12个ID，总数21。
- [x] 写测试：`Object.keys(CARDS).length===21`；每门派牌组长度6、uid唯一、攻击至少1；断言三门派名称及台词与spec完全一致；unknown门派拒绝。
- [x] 运行`node --test tests/cards.test.js tests/sects.test.js tests/copy.test.js`确认失败。
- [x] 按spec定义全部费用、效果字段、门派归属和ultimate标记，保留三通用牌强化。
- [x] 运行上述命令及`npm test`确认通过，提交配置。

### Task 2: 战斗结算与动态预览
**Files:** 修改src/battle.js；新增src/card-effects.js、tests/sects-battle.test.js。
**Interfaces:** createBattle(deck,hp,enemyIds,seed,sectId='legacy')；cardPreview(state,instance)返回{cost,canPlay,reason,damage,hits,shield,hpCost,draw,energyGain,targetMode}，targetMode为single/all/none；playCard继续接收uid,targetId。
- [x] 写测试：剑修第3张追加3且triple只计一次；discount后3费大招扣2、下一技能不消耗减费；群攻5+怒气对各目标一致；回血代价hp=6时状态对象不变、hp=7时剩1；支付生命不触发雷修被动；分身=3时大招3×6且增幅仅首段；敌人死亡停止该目标段数。
- [x] 写测试：energy=3时回灵成为4且endTurn重置3；不足怒气/分身返回原对象；雷修多段受击被动仅一次并在新回合重置；旧autoreply单敌时获得3盾、双敌击杀触发正确追击；所有预览数字与实际扣费/伤害一致。
- [x] 运行`node --test tests/sects-battle.test.js`确认失败。
- [x] 让预览和结算共用card-effects.js公式；补充战斗sectId、attacksPlayed、effects.nextAttackDiscount、nextAttackBonus、thunderTriggered字段；所有非法动作在复制与扣资源前拒绝。
- [x] 运行相关测试及`npm test`确认通过，提交规则。

### Task 3: 门派流程、奖励保底与存档
**Files:** 修改src/run.js、src/save.js、tests/run.test.js、tests/save.test.js；新增tests/sect-run.test.js。
**Interfaces:** START新局须携带sectId；createRun返回version=2且sectId=null；buildRewards(run)按spec保底；存档loadRun返回迁移后的v2/legacy或明确error。
- [x] 写测试：未知sectId不启动；每门派首轮包含discount/overtime/groups，第二轮包含门派大招；每轮2专属1通用不重复；相同seed选择一致；跳过首轮仍有次轮保底；奖励不能领取两次。
- [x] 写测试：合法v1战斗迁移legacy、原牌与顺序不变、原奖励能领、重开回选择；v2灵力4能往返；缺少计数、非法门派、负资源、重复uid和非法阶段拒绝；坏存档原始字符串不覆盖。
- [x] 运行`node --test tests/sect-run.test.js tests/save.test.js`确认失败。
- [x] 将sectId传入战斗；rewardSeen记录已展示牌；legacy沿用原奖励算法；新状态和迁移状态严格校验，每次完整动作保存。
- [x] 运行`npm test`通过后提交流程与存档。

### Task 4: 门派选择和动态牌面
**Files:** 修改src/view.js、src/style.css、src/main.js、index.html；新增tests/sect-view.test.js。
**Interfaces:** render沿用已有签名；选择门派写入ui.selectedSectId并确认START；牌面、禁用状态和详情调用cardPreview；群攻确认一次，无需点单目标。
- [x] 写渲染测试：三门派名称与台词出现；未选择不能开始；减费后费用显示2；资源不足展示原因；支付6生命、大招标签、当前分身段数可见；群攻显示全体目标且使用确认按钮；旧存档敌人名来自配置。
- [x] 运行`node --test tests/sect-view.test.js`确认失败。
- [x] 实现选择页、门派被动提示、动态费用与伤害、显式生命支付；升级CSS和所有模块缓存版本，页脚标识三门派版。
- [ ] 运行`npm test`；在360×800及桌面检查选牌详情、目标、确认和结束回合按钮无重叠；完整走通三门派，记录这是自动界面验证而非真人时长结论。
- [x] 提交界面。

### Task 5: 验证和接续交付
**Files:** 修改README.md、GPT-项目交接说明.md、docs/playtest.md、package.json。
- [x] 在README明确新版本启动、旧进度继续、新门派须结局重开；交接说明区分已实现和后续事项，删除过时待确认说明。
- [x] 运行`npm test`确认0失败；检查所有模块导入路径存在、缓存版本一致；检查完整三职业流程及存档恢复。
- [x] 提交文档与版本；将最终文件同步至已授权开发分支并读取分支头确认；不更新main。
- [x] `git bundle create ../dream-cultivation-history.bundle --all`并验证bundle；打包源码、tests、docs、README、交接说明、bundle，排除.git和临时截图。
- [x] 检查ZIP完整性并持久保存；最终交付开发分支URL、提交SHA、ZIP链接、测试结果和真人体验未验证的限制。

## 实施结果

规则、模板渲染与存档自动测试52项通过；三门派×种子1/7/42可通关。实际浏览器布局验证未完成：本环境缺少浏览器，下载失败。该验证项保持待办，不宣称已通过。Windows启动入口为打包便利功能，无额外依赖。
