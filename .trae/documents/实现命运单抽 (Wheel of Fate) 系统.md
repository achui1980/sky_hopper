我将为您实现“命运单抽 (Wheel of Fate)”系统。

### 系统设计与实现方案

1.  **卡牌道具 (The Question Card)**
    *   **外观**：一张悬浮的卡牌，背面有一个大问号。
    *   **生成**：在 `CloudManager` 中添加新类型 `FATE_CARD`，生成概率为 10% (0.1)。
    *   **触发**：玩家触碰后，游戏暂停，弹出“命运抽卡”界面。

2.  **命运抽卡界面 (UI)**
    *   **布局**：屏幕中央显示一张背面向外的神秘卡牌。
    *   **交互**：点击卡牌翻转。
    *   **视觉反馈**：
        *   **厄运 (Curse)**：红色边框，骷髅图标，屏幕震动特效。
        *   **赐福 (Blessing)**：白/蓝/紫/金边框，对应属性图标。

3.  **核心逻辑 (The Math & Effects)**
    *   **概率判定**：
        *   10% 厄运 (Curse)
        *   90% 赐福 (Blessing)
    *   **效果实现**：
        *   **重力变化 (Gravity)**：修改 `Plane.js` 中的 `baseGravityY` 或 `gravityMultiplier`。需要引入持久化的 `gravityModifier`。
        *   **速度变化 (Speed)**：修改 `Plane.js` 中的 `moveSpeed`。需要引入持久化的 `speedModifier`。
        *   **得分倍率 (Score)**：在 `PlayScene.js` 中添加 `scoreMultiplier`，影响得分计算。
    *   **数值随机**：实现 Roll 点机制 (0-100) 决定稀有度和数值强度。

### 实施步骤

1.  **素材与 UI (`TextureGenerator.js`, `index.html`, `style.css`)**
    *   生成 `fate-card` 纹理（问号卡牌）。
    *   在 HTML 中添加 `#fate-screen` 容器，包含卡牌元素和结果文本。
    *   编写 CSS 样式，定义卡牌翻转动画和不同稀有度的边框特效。

2.  **道具生成与触发 (`CloudManager.js`, `Collectible.js`, `PlayScene.js`)**
    *   `Collectible.js`: 注册 `FATE_CARD` 类型。
    *   `CloudManager.js`: 设置 10% 生成概率。
    *   `PlayScene.js`: 处理碰撞，暂停游戏，显示 UI。

3.  **抽卡逻辑与效果 (`PlayScene.js`, `Plane.js`)**
    *   `Plane.js`: 添加 `gravityModifier` 和 `speedModifier` 属性，并在 `update` 中应用。
    *   `PlayScene.js`: 实现 `triggerFateCard()` 方法：
        *   执行概率判定 (Curse vs Blessing)。
        *   执行属性随机和数值 Roll 点。
        *   应用效果（修改 Plane 属性或 Scene 分数倍率）。
        *   更新 UI 显示结果。
        *   点击确认后恢复游戏。

4.  **音效 (`AudioSynth.js`)**
    *   添加 `playCardFlip` (翻牌)。
    *   添加 `playCurse` (厄运警报)。
    *   添加 `playBlessing` (赐福音效，随稀有度变化)。

您是否同意这个计划？我将从素材和 UI 开始，逐步完成逻辑实现。