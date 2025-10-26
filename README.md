# 2048 AI求解器

使用 WebAssembly 加速的 2048 AI求解器，大部分2048游戏都可以使用，少部分变体可能无法正常运行，支持合成丘丘王游戏活动。

## 特性

- ✨ 使用 [2048-ai](https://github.com/ziap/2048-ai) 的 C++ WASM 算法
- 🚀 4 个 Web Worker 并行计算，速度极快
- 💾 智能缓存 WASM 文件，避免重复下载
- 🌐 支持多个 GitHub 镜像站，国内可用
- 📦 支持离线模式，无需联网
- 🎮 自动检测游戏状态
- 🖱️ 可拖动的控制面板

## 开发

### 安装依赖

```bash
git clone https://github.com/MakotoArai-CN/2048-ai-solver.git
bun install
```

### 开发模式

```bash
bun run dev
# 监听文件变化，自动重新构建
```

### 构建

#### 在线版本（默认）

```bash
bun run build
# 或
bun run build:online
# 或
vite build -m online
```

生成 `dist/2048-ai.user.js`，从 GitHub 动态下载 WASM，支持算法自动更新。

#### 离线版本

```bash
bun run build:offline
# 或
vite build -m offline
```

生成 `dist/2048-ai-offline.user.js`，WASM 内联到脚本中，无需联网。

**注意**：离线版本需要 `public/ai.wasm` 文件（6.88 KB）。

### 版本对比

| 特性 | Online 版本 | Offline 版本 |
|------|------------|--------------|
| 文件大小 | ~20 KB | ~30 KB |
| 网络需求 | 首次需联网 | 完全离线 |
| 算法更新 | 自动更新 | 需更新脚本 |
| 适用场景 | 网络良好 | 网络受限/隐私优先 |

### 安装脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 或 [Scriptcat](https://www.scriptcafe.org/) 等用户脚本管理器
2. 找到 `dist/2048-ai.user.js` (在线版) 或 `dist/2048-ai-offline.user.js` (离线版)，拖到浏览器，点击安装
3. 或者在脚本猫市场安装：[2048 AI Solver](https://scriptcat.org/zh-CN/script-show-page/4418)

## 使用

1. 访问支持的游戏页面（合成丘丘王活动、大部分2048游戏）
2. 点击右上角的控制面板
3. 点击"开始求解"
4. 享受自动游戏！

## 技术栈

- **Bun** - 快速的 JavaScript 运行时
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **WebAssembly** - 高性能计算
- **Web Workers** - 多线程并行

## 算法

使用 Expectimax 搜索算法：
- 搜索深度：自适应（3-7层）
- 评估函数：单调性、平滑度、空格数、合并机会等
- 优化：置换表、Alpha-Beta 剪枝、概率剪枝

## 许可

MIT License

## 致谢

- [2048-ai](https://github.com/ziap/2048-ai) - 2048 AI 算法来源
- [2048 Game](https://github.com/gabrielecirulli/2048) - 2048 原版游戏

## 反馈

欢迎提交 [issues](https://github.com/MakotoArai-CN/2048-ai-solver/issues) 或 [PR](https://github.com/MakotoArai-CN/2048-ai-solver/pulls)