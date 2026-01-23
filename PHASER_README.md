# Sky Hopper (Phaser 3 Version)

## 项目重构说明

此项目已从原生 JavaScript Canvas API 重构为使用 **Phaser 3** 游戏引擎。

### 重构完成的功能

✅ **核心架构**
- 使用 Phaser Scene 系统 (BootScene, PlayScene)
- 使用 Phaser Arcade Physics 物理引擎
- 使用 Phaser Sprite 和 Group 进行对象管理

✅ **游戏功能**
- 飞机控制（键盘和触摸）
- 云朵平台系统（白色、灰色、雷电云）
- 伪无限卷轴机制
- 生物群落系统（天空、平流层、太空）
- 收集物系统（金币、火箭）
- 火箭推进特效（粒子系统）
- 移动平台和旋转陨石

✅ **视觉效果**
- 程序化生成的纹理（无需图片资源）
- 动态背景变化
- 星空闪烁效果
- 屏幕震动效果

### 运行项目

由于使用 ES Modules，必须通过 HTTP 服务器运行：

```bash
# 使用 Node.js
npx serve .

# 使用 Python
python3 -m http.server 8080

# 使用 PHP
php -S localhost:8080
```

然后在浏览器中打开 `http://localhost:8080`

### 项目结构

```
js/
├── main.js                    # 入口文件，初始化 Phaser
├── TextureGenerator.js        # 程序化生成所有纹理
├── scenes/
│   ├── BootScene.js          # 启动场景，生成纹理
│   └── PlayScene.js          # 主游戏场景
├── sprites/
│   ├── Plane.js              # 飞机精灵
│   ├── Cloud.js              # 云朵精灵
│   └── Collectible.js        # 收集物精灵
├── managers/
│   └── CloudManager.js       # 云朵和收集物管理器
└── old_vanilla_version/       # 原始 Vanilla JS 代码备份
```

### Phaser 配置

- **画面尺寸**: 400 x 711 (9:16 竖屏)
- **物理引擎**: Arcade Physics
- **重力**: 800 (基础值，根据生物群落调整)
- **缩放模式**: FIT (自适应居中)

### 主要改进

1. **性能优化**: Phaser 的 WebGL 渲染器比 Canvas 2D 更高效
2. **对象池**: 使用 Phaser Group 自动管理对象复用
3. **物理引擎**: 内置碰撞检测和重力系统
4. **粒子系统**: 内置粒子发射器用于特效
5. **输入处理**: 统一的键盘和触摸输入系统
6. **场景管理**: 更清晰的代码组织结构

### 技术细节

#### 纹理生成
所有游戏资源都是程序化生成的，保持原有的视觉风格：
- 飞机和火箭推进状态
- 三种云朵类型（白色、灰色、雷电）
- 太空物体（陨石、卫星）
- 收集物（金币、火箭）
- 粒子纹理

#### 伪无限卷轴
保留了原有的"摄像机不动，世界下移"的逻辑：
- 当飞机超过屏幕中线且向上移动时
- 飞机锁定在中线位置
- 所有云朵和收集物向下移动
- 分数基于累计上升高度

#### 单向平台
手动实现单向平台碰撞：
- 只在飞机下落时检测碰撞
- 检查飞机是否从上方穿过云朵顶部
- 雷电云触发游戏结束
- 灰色云碰撞后消失

### 原始代码备份

原始的 Vanilla JS 版本已备份到 `js/old_vanilla_version/` 目录中。

---

**开发时间**: 2026-01-21
**Phaser 版本**: 3.70.0
**引入方式**: CDN (无构建工具)
