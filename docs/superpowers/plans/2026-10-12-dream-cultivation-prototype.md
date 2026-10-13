# 梦里修仙竖屏卡牌小样 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 制作一款可暂停恢复、可完整游玩分身与反击两条路线、目标单局 3–5 分钟的竖屏浏览器卡牌小样，并保持规则层可迁移到抖音小游戏。

**Architecture:** 使用原生 JavaScript ES modules，将卡牌配置、确定性随机、纯函数战斗规则、单局流程、存档校验和 DOM 界面分离。所有结算由动作驱动并在完整动作后保存，动画只展示结果；后续迁移抖音小游戏时替换渲染与平台适配层，不改核心规则。

**Tech Stack:** HTML、CSS、原生 JavaScript ES modules、Node.js 内置 `node:test`；无运行时第三方依赖。

**Spec:** `docs/superpowers/specs/2026-10-12-dream-cultivation-design.md`

## Global Constraints

- 竖屏、单手操作；以 360×800 为首要验证尺寸。
- 主角生命 40，初始牌组 6 张，每回合灵力 3、抽 4 张。
- 怒气上限 12，分身上限 3；战斗结束恢复 6 生命并清除战斗临时状态。
- 流程固定为出租屋、两场普通战斗、两次选牌、一次奇遇、一个首领和结算。
- 单局目标 3–5 分钟，最终以真人试玩记录为准。
- 暗青灰、原创手绘丧萌风格；不得复制商业游戏资产或界面。
- 画面不用二维码和手机；“扫码签到”仅保留为卡牌吐槽文案。
- 原型不加入付费、广告、账号、服务器、平台 SDK 或跨设备同步。
- 规则层不得读取 DOM，也不得由动画回调驱动结算。
- 当前目录若仍非 Git 仓库，执行前先 `git init` 并提交已确认的设计与计划基线。

## Review Focus

1. 快速连续点击：不能重复出牌、结束回合、选择奖励或触发结算；由 Task 5 的界面锁测试覆盖。
2. 存储被禁用或存档损坏：仍可开始游戏，并显示错误与主动重开入口；由 Task 4 覆盖。
3. 小屏和超长牌名：费用、效果、目标和结束回合按钮始终可见；由 Task 5 的 360×800 人工检查覆盖。
4. 末张牌击杀、复制伤害和追击：死亡目标停止结算，胜负不会同时发生；由 Task 2 覆盖。
5. 动画中刷新或退出：恢复已完成的规则状态，不重放奖励或伤害；由 Task 4 和 Task 5 覆盖。

---

## 文件结构

- `package.json`：ES module 与测试命令。
- `index.html`：应用入口与无脚本提示。
- `src/cards.js`：卡牌配置、起始牌组和卡牌实例创建。
- `src/enemies.js`：敌人配置和意图循环。
- `src/random.js`：种子随机与洗牌。
- `src/battle.js`：纯函数战斗状态与结算。
- `src/run.js`：房间流程、奖励、奇遇和结局。
- `src/save.js`：版本化存档与结构校验。
- `src/view.js`：DOM 渲染与交互状态。
- `src/main.js`：动作派发、保存、界面刷新和输入锁。
- `src/style.css`：竖屏布局、占位美术和响应式样式。
- `tests/*.test.js`：规则、流程和存档自动测试。
- `docs/playtest.md`：人工试玩记录模板及真实结果。
- `README.md`：启动、测试、存档清理、限制与后续迁移说明。

### Task 1: 项目基线、卡牌配置与确定性随机

**Files:**
- Create: `package.json`
- Create: `src/cards.js`
- Create: `src/random.js`
- Create: `tests/cards.test.js`
- Create: `tests/random.test.js`

**Interfaces:**
- Produces: `CARDS: Readonly<Record<string, CardDefinition>>`
- Produces: `STARTER_IDS: readonly string[]`
- Produces: `createCardInstance(cardId: string, uid: string): CardInstance`
- Produces: `nextRandom(seed: number): {seed: number, value: number}`
- Produces: `shuffle(items: readonly T[], seed: number): {items: T[], seed: number}`

- [ ] **Step 1: 建立版本控制与 Node 测试基线**

若目录没有 `.git`，运行 `git init`。创建 `package.json`，设置 `type: "module"`、版本 `0.1.0` 和脚本 `"test": "node --test"`。

- [ ] **Step 2: 写卡牌配置失败测试**

在 `tests/cards.test.js` 断言：12 个唯一 `cardId`；基础牌实例为 3 张“滚”、2 张“少来这套”、1 张“我缓缓”；所有费用为 0–2；未知 `cardId` 创建实例时抛出错误；实例 UID 保持调用者传入值。

- [ ] **Step 3: 写随机函数失败测试**

在 `tests/random.test.js` 断言：相同 seed 得到相同序列；不同 seed 至少在前 5 个值内产生差异；`shuffle` 不改变输入数组；洗牌前后元素多重集合一致；空数组可安全洗牌。

- [ ] **Step 4: 运行测试并确认失败**

运行：`node --test tests/cards.test.js tests/random.test.js`  
预期：FAIL，提示模块或导出不存在。

- [ ] **Step 5: 实现配置与随机函数**

在 `src/cards.js` 写入设计稿的 3 种基础牌、6 种奖励牌及强化数据；卡牌定义不可在战斗中修改。在 `src/random.js` 实现 32 位确定性 PRNG 和 Fisher–Yates 洗牌，始终返回新数组。

- [ ] **Step 6: 运行测试并确认通过**

运行：`node --test tests/cards.test.js tests/random.test.js`  
预期：全部 PASS。

- [ ] **Step 7: 提交**

运行：`git add package.json src/cards.js src/random.js tests/cards.test.js tests/random.test.js docs/superpowers && git commit -m "feat: add card data and seeded shuffle"`

### Task 2: 敌人与纯函数战斗规则

**Files:**
- Create: `src/enemies.js`
- Create: `src/battle.js`
- Create: `tests/battle.test.js`

**Interfaces:**
- Consumes: `CARDS`, `shuffle`
- Produces: `ENEMIES: Readonly<Record<string, EnemyDefinition>>`
- Produces: `createBattle(deck: CardInstance[], hp: number, enemyIds: string[], seed: number): BattleState`
- Produces: `playCard(state: BattleState, uid: string, targetId?: string): BattleState`
- Produces: `endTurn(state: BattleState): BattleState`
- Produces: `BattleState = {hp,maxHp,energy,shield,rage,clones,hand,draw,discard,exile,enemies,turn,seed,status,effects,log}`，其中 `status` 为 `playing | won | lost`

- [ ] **Step 1: 写基础回合与不可变性失败测试**

在 `tests/battle.test.js` 断言：初始为 40 生命、3 灵力、4 手牌；不足费用、未知 UID、缺少必需目标、选择死亡目标时返回原状态对象；合法出牌返回新状态且不改变输入；攻击 6 遇护盾 4 只扣 2 生命；下一玩家回合清除旧护盾；牌堆耗尽后洗入弃牌堆且卡牌实例数量守恒。

- [ ] **Step 2: 写分身与反击组合失败测试**

断言：2 分身时“正在夺舍领导”使下一张手动攻击追加 6 伤害并清除增幅；“自动回复”的击杀追击不递归；怒气 10 时“绩效谁定的”造成 25 伤害并把怒气清零；怒气不超过 12，分身不超过 3；扫码签到护盾池被多段攻击耗尽时只获得一次 3 怒气，未耗尽时不触发。

- [ ] **Step 3: 写胜负和死亡目标边界失败测试**

断言：最后一名敌人死亡后立即进入 `won`，后续复制或追击停止；主角生命降至 0 时进入 `lost`；胜负不会同时成立；已结束战斗上的 `playCard` 与 `endTurn` 返回原状态；日志最多保留最近 30 条。

- [ ] **Step 4: 运行测试并确认失败**

运行：`node --test tests/battle.test.js`  
预期：FAIL，提示战斗模块不存在。

- [ ] **Step 5: 实现敌人配置与战斗状态机**

在 `src/enemies.js` 定义签到傀儡和天劫审批官的生命与循环意图。在 `src/battle.js` 以复制后更新的方式实现所有结算；自动追加伤害使用标记禁止再次触发卡牌效果；每个伤害步骤后检查死亡和胜负。

- [ ] **Step 6: 运行全部测试并确认通过**

运行：`node --test`  
预期：Task 1 与 Task 2 测试全部 PASS。

- [ ] **Step 7: 提交**

运行：`git add src/enemies.js src/battle.js tests/battle.test.js && git commit -m "feat: implement card combat rules"`

### Task 3: 单局流程、奖励、奇遇与结局

**Files:**
- Create: `src/run.js`
- Create: `tests/run.test.js`

**Interfaces:**
- Consumes: `createBattle`, `playCard`, `endTurn`, `CARDS`, `nextRandom`
- Produces: `createRun(seed: number): RunState`
- Produces: `applyAction(run: RunState, action: RunAction): RunState`
- Produces: `RunState = {version,stage,deck,hp,battle,seed,rewards,route,history,souvenir,result}`
- Produces: `stage = intro | battle | reward | event | boss | result`
- Produces actions: `START`, `PLAY_CARD(uid,targetId)`, `END_TURN`, `CHOOSE_REWARD(cardId|null)`, `CHOOSE_EVENT(kind,uid)`, `CONTINUE`, `RESTART(seed)`

- [ ] **Step 1: 写固定流程失败测试**

在 `tests/run.test.js` 断言：开场后第一战为 1 只 16 生命傀儡；第二战为 2 只且行动起点错位；首领为 46 生命；胜利恢复 6 生命但不超过 40，并清除怒气、分身、护盾和临时效果；通关获得“盖错章的飞升申请表”；失败与通关只能进入一次结算。

- [ ] **Step 2: 写奖励路线失败测试**

断言：奖励一包含两条路线起手牌和一个基础牌副本；选分身后奖励二包含另外两张分身牌，选反击后同理；跳过奖励一时奖励二是 3 张不同奖励牌；奖励牌不会重复加入；连续派发同一奖励动作只增加一张牌。

- [ ] **Step 3: 写奇遇与非法动作失败测试**

断言：删牌后至少 5 张且至少有 1 张攻击牌；基础牌只能强化一次；奖励牌不能强化；取消选择不改变单局状态；任何不符合当前阶段的动作返回原状态对象；重开后不保留上局战斗状态或牌组。

- [ ] **Step 4: 运行测试并确认失败**

运行：`node --test tests/run.test.js`  
预期：FAIL，提示流程模块不存在。

- [ ] **Step 5: 实现动作驱动的单局状态机**

在 `src/run.js` 固定首版房间顺序，并让所有阶段转换只通过 `applyAction` 完成。奖励随机沿用 `run.seed`，战斗结束时将战斗 seed 回写到 run，保证暂停恢复后顺序一致。

- [ ] **Step 6: 运行全部测试并确认通过**

运行：`node --test`  
预期：Task 1–3 全部 PASS。

- [ ] **Step 7: 提交**

运行：`git add src/run.js tests/run.test.js && git commit -m "feat: add dream run progression"`

### Task 4: 版本化保存与安全恢复

**Files:**
- Create: `src/save.js`
- Create: `tests/save.test.js`

**Interfaces:**
- Consumes: `RunState`, `CARDS`, `ENEMIES`
- Produces: `SAVE_KEY = "dream-cultivation-v1"`
- Produces: `saveRun(storage: StorageLike, run: RunState): boolean`
- Produces: `loadRun(storage: StorageLike): {run: RunState|null, error: string|null}`
- Produces: `clearRun(storage: StorageLike): boolean`

- [ ] **Step 1: 写往返恢复失败测试**

在 `tests/save.test.js` 断言：出牌后保存、加载再结束回合与不中断结果一致；奖励后恢复不能再次领取；牌堆、UID、敌人意图索引和随机 seed 完整保留；动画等纯表现字段不进入存档。

- [ ] **Step 2: 写坏存档失败测试**

断言：坏 JSON、未知版本、未知卡牌 ID、未知敌人 ID、错误阶段、重复 UID、负生命、超上限怒气或分身均返回 `{run:null,error}`；存储读取、写入或删除抛错时函数不向外抛异常；保存失败不删除原存档。

- [ ] **Step 3: 运行测试并确认失败**

运行：`node --test tests/save.test.js`  
预期：FAIL，提示保存模块不存在。

- [ ] **Step 4: 实现序列化与显式结构校验**

在 `src/save.js` 只接受版本 1，并验证所有数组、数值范围、枚举、配置引用和 UID 唯一性。不得自动修复或覆盖无法识别的存档；由 UI 提供玩家主动重开入口。

- [ ] **Step 5: 运行全部测试并确认通过**

运行：`node --test`  
预期：Task 1–4 全部 PASS。

- [ ] **Step 6: 提交**

运行：`git add src/save.js tests/save.test.js && git commit -m "feat: add safe local resume"`

### Task 5: 竖屏可玩界面、输入锁与完整验证

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/view.js`
- Create: `src/style.css`
- Create: `tests/input-lock.test.js`
- Create: `docs/playtest.md`
- Create: `README.md`

**Interfaces:**
- Consumes: `createRun`, `applyAction`, `saveRun`, `loadRun`, `clearRun`
- Produces: `render(root: HTMLElement, run: RunState, ui: UiState, dispatch: (action: RunAction) => void): void`
- Produces: `createDispatcher({getRun,setRun,render,save}): (action: RunAction) => void`
- Produces: 可从本地 HTTP 服务完整游玩的浏览器原型

- [ ] **Step 1: 写输入锁失败测试**

在 `tests/input-lock.test.js` 用假状态和假 `save/render` 断言：一次同步派发只调用一次 `applyAction`；派发期间的第二次动作被忽略；状态未变化时不保存；合法动作完成后先保存再解锁；保存失败仍重新渲染并显示存储警告。

- [ ] **Step 2: 运行测试并确认失败**

运行：`node --test tests/input-lock.test.js`  
预期：FAIL，提示 dispatcher 不存在。

- [ ] **Step 3: 实现入口与动作派发器**

`src/main.js` 加载存档或创建新局，建立单一派发入口；每个完整动作同步应用、保存并重绘。输入锁在动作开始前设置，在保存和渲染完成后的 `finally` 中释放；动画只读取动作后的日志。

- [ ] **Step 4: 实现各阶段界面**

`src/view.js` 分别渲染出租屋、战斗、奖励、奇遇和结算。点卡牌先展示完整效果；攻击牌进入目标选择，确认目标后才派发动作；取消不耗费资源。所有按钮根据阶段和输入锁设置禁用状态，并显示灵力不足、非法目标和存档错误原因。

- [ ] **Step 5: 实现竖屏视觉与占位美术**

`src/style.css` 使用 CSS 与内联 SVG 形成暗青灰、丧萌、天庭办事大厅氛围；剑光和雷光作局部高亮，卡牌正文保持高对比。不得发起外部字体或图片请求；不得出现二维码或手机图形。

- [ ] **Step 6: 运行自动测试**

运行：`node --test`  
预期：全部 PASS，且无未处理异步错误。

- [ ] **Step 7: 启动本地预览并完成功能检查**

运行：`python -m http.server 8000`，打开 `http://localhost:8000`。验证开始、出牌、选择目标、结束回合、奖励、奇遇、首领、失败、通关、重开和刷新恢复。刷新发生在动画显示期间时，恢复后的生命、牌堆、敌人和奖励必须与刷新前已结算状态一致。

- [ ] **Step 8: 完成 360×800 与桌面布局检查**

在 360×800 检查四张手牌、超长牌名、费用、完整效果、所有敌人意图、目标按钮和结束回合按钮均可见且不重叠；在桌面宽度检查游戏区域保持竖屏最大宽度，不横向拉伸。

- [ ] **Step 9: 完成两条路线真人试玩并记录**

在 `docs/playtest.md` 记录分身与反击路线各一局的 seed、每战回合数、剩余生命、组合是否触发和总耗时；再用 seed 1、7、42 检查开局可操作性。若超出 3–5 分钟或路线不可通关，只调整现有卡牌／敌人数值并重跑相关测试，不新增系统。

- [ ] **Step 10: 编写交付说明**

`README.md` 写明本地启动、测试命令、清理存档的方法、浏览器原型限制、尚未接入的抖音平台能力，以及后续迁移时规则层不变、替换渲染与平台适配层的边界。

- [ ] **Step 11: 最终验证与提交**

运行：`node --test`  
预期：全部 PASS。确认 `docs/playtest.md` 只记录真实试玩，不虚构结果。然后运行：`git add index.html src tests docs README.md package.json && git commit -m "feat: deliver playable dream cultivation prototype" && git tag v0.1.0`。

## 交付边界

`v0.1.0` 表示浏览器小样通过自动测试与人工试玩，不表示已经适配或通过抖音小游戏审核。平台 SDK、账号体系、广告、分享、排行榜、资源分包和发布流程应在玩法验证后另开规格与实施计划，并依据届时的抖音开放平台官方要求执行。
