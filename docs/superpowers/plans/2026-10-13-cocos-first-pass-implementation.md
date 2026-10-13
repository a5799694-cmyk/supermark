# Cocos 首轮迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for inline execution, or superpowers:subagent-driven-development if the user selects delegation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在Cocos Creator 3.8.8完成选门派→第一战→战后奖励和验证完成页。
**Architecture:** 保留浏览器v0.3为对照，移植纯规则到独立core，首轮Session控制阶段，Cocos组件只渲染与派发动作。规则测试与引擎验收分别记录。
**Tech Stack:** Cocos Creator 3.8.8、TypeScript、原生Cocos UI、node:test；TypeScript编译器仅为开发测试依赖。
**Spec:** docs/superpowers/specs/2026-10-13-cocos-first-pass-design.md
**Status:** 2026-10-13用户已认可书面设计；本实施计划待审阅和执行方式选择。尚未创建工程或编写产品代码。

## Global Constraints
- Creator 3.8.8；参考竖屏360×800；交付可导入工程。
- 三门派、21牌、费用、伤害、被动和第一轮奖励算法沿用浏览器实现。
- 生命40、基础灵力3、抽4张、怒气上限12、分身上限3、战后恢复6生命。
- 首轮只含第一战及奖励；完成页不发正式通关纪念品，不进入第二战或事件。
- 使用占位美术；不扩充敌人、不改平衡、不接平台SDK。
- 内存进度，刷新重开；不读取或覆盖浏览器存档。
- 开发分支feature/dream-cultivation-prototype，main不变。
- 工程位于cocos-first-pass/；浏览器源码与已有测试保留。
- 无Creator执行证据时不得声称引擎已运行通过。

## Review Focus
1. 快速连续点击不能导致同一动作或奖励结算两次（Task 2、3）。
2. 非法目标、资源不足和支付生命不足时不扣资源（Task 1、3）。
3. 窄屏、长文字、多张手牌不能遮挡确认/取消/结束回合（Task 3）。
4. 刷新、失败重开、奖励跳过不能误入后续事件或覆盖旧存档（Task 2、4）。
5. 解压路径含中文和空格、缺失节点/脚本引用时不能给用户一个空白预览而无诊断（Task 3、4）。

## 文件地图
- cocos-first-pass/assets/scripts/core/{cards,sects,enemies,random,card-effects,battle}.ts：纯规则移植。
- cocos-first-pass/assets/scripts/core/types.ts：规则字段类型，按浏览器状态字段定义。
- cocos-first-pass/assets/scripts/core/clone-state.ts：JSON兼容纯数据复制，替代环境相关structuredClone。
- cocos-first-pass/assets/scripts/first-pass/session.ts：首轮阶段与奖励。
- cocos-first-pass/assets/scripts/first-pass/dispatch.ts：单次动作锁。
- cocos-first-pass/assets/scripts/ui/presentation.ts：纯数据界面预览与标签。
- cocos-first-pass/assets/scripts/ui/{FirstPassApp,UiFactory,SectPanel,BattlePanel,RewardPanel,ResultPanel}.ts：入口、共用节点构造和各阶段面板。
- cocos-first-pass/assets/scenes/Main.scene及对应.meta：可打开入口场景。
- cocos-first-pass/{package.json,tsconfig.json,settings/}及脚本.meta：3.8.8项目配置与资源引用。
- tests/cocos/{compile-core.js,core-parity.test.js,session.test.js,dispatch.test.js,presentation.test.js,project.test.js}：纯规则、流程、界面数据与工程结构验证。
- tests/cocos/tsconfig.json：只编译纯规则、首轮流程与界面数据模块，输出临时CommonJS用于Node测试。
- cocos-first-pass/{README.md,VALIDATION.md}：打开方法与引擎验收记录。
- package.json及package-lock.json：锁定TypeScript开发依赖，增加test:cocos脚本。
- GPT-项目交接说明.md：实际迁移状态与后续边界。

### Task 1：移植纯规则并证明与浏览器一致
**Files:** core全体文件；tests/cocos/compile-core.js、tsconfig.json、core-parity.test.js；根package.json及package-lock.json。
**Interfaces:**
- 保留CARDS、SECTS、ENEMIES、createCardInstance(cardId,uid)、createStarterDeck(sectId)、nextRandom(seed)、shuffle(items,seed)。
- createBattle(deck,hp,enemyIds,seed,sectId)、cardPreview(state,instance)、playCard(state,uid,targetId)、endTurn(state)的参数与返回字段保持浏览器版本。
- cloneState<T>(value:T):T只接受当前状态使用的JSON兼容纯数据。
- compile-core.js导出loadCore(moduleName)，编译迁移的纯模块到隔离临时目录，再用Node读取。tests以迁移模块实际输出断言，不使用cc模拟替代规则。

- [ ] 写core-parity测试：21个ID、三个6张起手及seed=1/7/42第一战初始状态分别与src模块深度一致；动作序列中的预览、出牌、结束回合和战斗终止结果逐步一致。
- [ ] 写非法动作测试：未知uid、已死/未知目标、灵力不足、clone-ultimate在hp=6时返回原状态且输入深度不变；hp=7、clones=1时可支付至1。
- [ ] 运行node --test tests/cocos/core-parity.test.js，确认缺少迁移实现而失败。
- [ ] 按现有src实现移植，去除导入查询串与DOM依赖；定义types及cloneState。开发编译器锁定实际采用版本；核心脚本不使用超出Creator编译能力的语法。
- [ ] 运行npm test和npm run test:cocos，均0失败；查看类型编译错误与双端差异，不能只检查源文件相似。
- [ ] 提交纯规则与测试。

### Task 2：首轮Session、奖励和输入锁
**Files:** first-pass/session.ts、dispatch.ts；session.test.js、dispatch.test.js。
**Interfaces:**
- Phase为sect/battle/reward/complete/lost。
- createSession(seed:number):FirstPassSession，包含phase、sectId、deck、hp、battle、seed、rewards、nextUid。
- applySessionAction(session,action):FirstPassSession；支持START(sectId)、PLAY_CARD(uid,targetId?)、END_TURN、CHOOSE_REWARD(cardId|null)、RESTART(seed)。非法动作返回原对象。
- createDispatcher({getSession,setSession,render}):dispatch；动作锁定持续到下一微任务，不含持久化或浏览器存储接口。

- [ ] 写session测试：三个门派均须选有效门派后开始；沿用第一战dummy；胜利后hp=min(40,battle.hp+6)，生成3个不同奖励，包含本门派核心及1通用牌。
- [ ] 写领取/跳过测试：领牌长度+1并进入complete；跳过长度不变并进入complete；complete再次领取不变；结果不含正式通关纪念品或随机事件字段。
- [ ] 写失败与重开测试：失败到lost；RESTART清理牌组、奖励、战斗并回sect；新Session不读取任何存档。
- [ ] 写dispatch测试：同一微任务内双次CHOOSE_REWARD只结算一次；非法动作不setSession；下一微任务后解除锁，异常时也可解除。
- [ ] 运行对应测试确认失败，再复用core和浏览器首轮buildRewards算法实现Session与锁；不复制后续冒险调度。
- [ ] 运行npm test和npm run test:cocos均0失败，提交Session。

### Task 3：可导入工程与原生竖屏交互
**Files:** 工程配置、Main.scene、脚本.meta；ui全体模块；presentation.test.js、project.test.js。
**Interfaces:**
- presentation.ts导出presentCard(session,uid):CardPresentation，字段为name、cost、description、canPlay、reason、targetMode；数值来自core.cardPreview，规则外预览使用静态准确说明。
- FirstPassApp持有Session、selectedUid和selectedSectId，派发有效动作后清理临时选择并刷新当前面板。
- 各Panel提供render(session,selection,onAction)，选择牌与取消只改变临时UI选择；确认才派发规则动作。
- UiFactory构造按钮、标签、滚动区域，所有按钮使用同一事件绑定方式，不累积重复监听。

- [ ] 写presentation测试：动态减费、怒气/分身说明、hp=6支付失败原因、单体选目标与技能确认的区别；预览不改状态。
- [ ] 写工程结构测试：Main.scene与脚本/meta引用可解析，UUID唯一、关联文件存在；启动入口组件存在；完整工程解压到带中文/空格路径仍能定位所有资源。
- [ ] 运行测试确认失败；按Creator 3.8.8原生2D工程格式准备配置与最小场景。工程结构以官方模板/实际Creator输出为依据，不靠自拟序列化格式通过文本测试。
- [ ] 实现门派、战斗、奖励、结果面板。场景入口检查关键节点/组件，缺失时输出明确组件名与修复提示，不静默空白。
- [ ] 战斗上方敌人/意图，下方玩家资源、手牌横向滚动；详情、确认/取消与结束回合独立布局。阶段切换清理旧监听；禁用原因可见。
- [ ] 运行npm test和npm run test:cocos均0失败；若可运行Creator，检查3.8.8导入与编译，并在360×800、390×844、桌面预览检查按钮可见、滚动和长文字。无引擎时标为待验证。
- [ ] 提交工程与界面。

### Task 4：首轮验收、文档与接续交付
**Files:** cocos-first-pass/README.md、VALIDATION.md；GPT-项目交接说明.md；tests/cocos/project.test.js补充交付检查。
**Interfaces:** 无新玩法接口。交付包根目录包含可导入的cocos-first-pass工程，保留浏览器对照及Git历史。

- [ ] 在project测试中检查打开说明、明确的内存进度提示和排除生成目录规则；Session代码无localStorage或dream-cultivation-v1引用。
- [ ] 编写打开步骤：完整解压→Dashboard导入cocos-first-pass文件夹→选择3.8.8→打开Main场景→预览。提示刷新会重开；无需Python启动。
- [ ] 按三个门派分别记录选门派→首战→奖励→complete，以及失败→重开；验证跳过奖励、双击、非法目标、窗口调整。自动输出和真人/Creator验收分开记录。
- [ ] 运行npm test、npm run test:cocos和git diff --check；核对所有迁移代码与浏览器规则基线。
- [ ] 若代理不能运行Creator，VALIDATION明确写“真实编辑器导入、编译和交互待用户验收”，给出待执行清单，不能写已跑通。
- [ ] 更新交接说明，列已实现、自动检查、真实引擎待验收及后续未实施项；提交到现有开发分支并回读核对。
- [ ] 打包可导入ZIP与Git bundle，排除.git、node_modules、Library、Temp、生成构建和临时截图；检查ZIP及资源关联，保存接续包并提供链接。

## 实施后的边界
即使自动检查通过，真实Creator验收未完成时，本轮仍为“首轮迁移实现待引擎验收”。后两战、随机事件、Cocos正式存档、正式美术与新敌人均不因本计划自动获批。

## 执行交接
建议在当前会话由主代理逐项实现，因为四个任务依赖同一规则接口，范围较小。若用户选择分工，则使用subagent-driven-development并安排任务与审查。书面计划审阅与执行方式选择完成前，不创建工程或写产品代码。
