我将修复 `TextureGenerator.js` 中的报错。

**错误原因**：
根据用户提供的错误日志 `Uncaught TypeError: graphics.quadraticCurveTo is not a function`，以及 Phaser 3 的文档，`quadraticCurveTo` 并不是 `Phaser.GameObjects.Graphics` 对象的直接方法。虽然我在搜索结果中看到了它，但在某些 Phaser 版本（特别是 3.70.0）中，它可能需要通过 `commandBuffer` 调用，或者实际上应该使用 `slice` 或其他路径方法。

然而，更标准和稳健的做法是使用 `Phaser.Curves.QuadraticBezier` 或直接使用 `path` 对象，或者使用 `graphics.slice` 等。

**但在 Graphics API 中，正确的路径绘制流程是**：
`beginPath()` -> `moveTo()` -> **`quadraticCurveTo` 其实在 Canvas API 中存在，但在 Phaser Graphics 中，对应的方法名可能是 `quadraticBezierTo`**？

**纠正**：
查阅最新的 Phaser 3 源码或文档，`Phaser.GameObjects.Graphics` 类实际上**没有** `quadraticCurveTo` 方法。它只有 `lineTo`、`moveTo`、`arc` 等。
要绘制二次贝塞尔曲线，应该使用：
1.  **Canvas 风格**：Phaser 的 Graphics 内部使用的是 WebGL/Canvas，但暴露的 API 不同。
2.  **正确 API**：应该使用 `graphics.slice` (用于圆饼图) 或者更底层的命令。
3.  **实际上**：Phaser 3 Graphics 确实没有直接的 `quadraticCurveTo`。如果我想画曲线，最好的办法是使用 `Phaser.Curves.QuadraticBezier` 创建曲线，然后用 `curve.draw(graphics)`。

**或者，更简单的方法**：
在 `graphics` 对象上，虽然没有 `quadraticCurveTo`，但我们可以通过 `graphics.path` (如果使用 `Path` 对象) 或手动用多段 `lineTo` 模拟，或者使用 `arc` 来画圆弧。

**修正计划**：
为了快速修复且不引入复杂的 Curve 对象，我将用 `lineTo` 近似替代，或者使用 `arc` 来画圆弧部分。但考虑到我要画的是流线型机身，最好的办法是**不使用** `quadraticCurveTo`，而是改用标准且安全的 API。

**替代方案**：
我将把所有的 `quadraticCurveTo(cpX, cpY, x, y)` 替换为简单的直线 `lineTo(x, y)`，或者如果需要圆滑，使用 `arc`。
或者，我知道 Phaser Graphics 支持 `slice`，但不支持贝塞尔。

**等等，Phaser Graphics 确实支持 `bezierCurveTo` 吗？**
也不支持。Phaser 3 的 Graphics 是一个轻量级的 WebGL 批处理器。

**最终修复方案**：
我将修改 `TextureGenerator.js`，移除所有 `quadraticCurveTo` 调用，改用 `lineTo` 来绘制多边形近似曲线，或者使用 `arc` 绘制圆角。
例如：
- 机头：用 `arc` 或多段 `lineTo`。
- 机身：用 `fillRoundedRect` (如果有) 或 `arc`。

为了保持流线型外观，我可以用**椭圆 (`fillEllipse`)** 来组合出机身形状，而不是画路径。这是最安全且性能最好的方法。

**具体修改**：
1.  **Plane**: 用 `fillEllipse` 画机身主体，再叠加尾部。
2.  **Rocket**: 用 `fillEllipse` 和 `triangle` 组合。

我将重写 `generatePlaneTexture` 和 `generateCollectibleTextures` 中的路径绘制代码，完全避开 `quadraticCurveTo`。