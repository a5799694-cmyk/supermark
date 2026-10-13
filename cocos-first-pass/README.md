# 梦里修仙 · Cocos首轮迁移

使用 **Cocos Creator 3.8.8**。这是原生Cocos工程，首轮包含三个门派、第一战与奖励；用文字和几何图形占位。

## 打开并试玩
1. 将整个接续ZIP解压到普通文件夹，不要在压缩包里直接打开。
2. 打开Cocos Dashboard，进入「项目」，选择导入/添加已有项目。
3. 选择包里的 **cocos-first-pass** 文件夹。该层同时包含package.json和assets；不要选assets或外层接续包文件夹。
4. 选择已经安装的Creator **3.8.8** 打开。首次导入会自动生成Library和temp，请等待资源导入和脚本编译完成。
5. 在资源管理器双击 **assets/scenes/Main.scene**，让Main成为当前场景。
6. 点击顶部预览按钮。浏览器预览和编辑器预览均由Creator启动，**不需要Python或启动游戏.bat**。
7. 选择门派→开始→打完第一战→选一张奖励或跳过→看到「首轮迁移验证完成」。

**首轮迁移验证，刷新会重开。** 当前只使用内存进度，不读写原浏览器存档。

## 操作
- 点击门派卡，再点击拜入按钮。
- 点击手牌查看费用、效果与不足原因。单体攻击点敌人；技能/群攻点「确认打出」。可取消选牌。
- 手牌区域可以左右拖动；每回合结束请点「结束回合」。
- 第一战获胜恢复6生命，然后获得第一轮奖励；奖励只能选一张，也能跳过。
- 完成页与失败页可重新选择门派。完成页只是首轮移植验证终点，不是正式游戏通关。

## 首次打开出现问题
- 场景没有门派：确认打开的是Main.scene，检查Console第一条红色报错。
- 脚本/组件丢失：完整重新解压工程，保留所有.meta文件。不要自行删除或改名FirstPassApp.ts.meta。
- 版本升级提示：确认打开版本为3.8.8。
- 首次有资源导入提示：等待导入结束再预览。

此包已经通过规则一致性、流程、工程引用和官方类型检查。**本环境未运行Creator编辑器，实际导入、编译及交互仍待用户验收。** 记录见VALIDATION.md。

## 开发接续
完整包的浏览器版保留为规则对照。根目录运行npm ci、npm test；npm run test:cocos只检查迁移部分。用户仅在Creator打开工程时无需安装Node开发测试依赖。

core与浏览器src一一对应，移植差别为TypeScript类型、无查询串导入和JSON纯状态复制。后续改规则应同步双端测试，不能只改一边。

后两战、随机事件、正式存档、肥猫美术、新敌人、音效和平台SDK尚未迁移。

## 工程格式依据
场景Canvas/相机/全局信息及settings结构参考Cocos官方cocos-test-projects的v3.8.8分支，提交ec79fbb4e2af1befe84e29eb8ec7fd20cdb9ab41，源场景assets/cases/ui/02.label/label-align.scene。只保留结构并重建UUID，未带入示例纹理、字体或关卡内容。

官方参考：https://github.com/cocos/cocos-test-projects/tree/v3.8.8
官方3.8文档：https://docs.cocos.com/creator/3.8/manual/zh/
