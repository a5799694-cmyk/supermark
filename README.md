# 梦里修仙：雷劫办事大厅

竖屏手动回合制卡牌构筑浏览器小样。当前版本用于验证分身与反击两条路线，不代表已经完成抖音小游戏适配或审核。

## 启动

```powershell
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

## 测试

```powershell
npm test
```

## 存档

游戏在每个完整动作后写入浏览器 `localStorage`，键名为 `dream-cultivation-v1`。需要清理时，在浏览器开发者工具的本地存储中删除该键。

## 当前边界

- 无账号、广告、排行榜、分享、服务器和跨设备同步。
- 美术为 CSS/SVG 风格占位，正式角色与场景素材待制作。
- 后续适配抖音小游戏时保留 `cards/random/battle/run` 规则层，替换 DOM 渲染、存储和平台接入层。
