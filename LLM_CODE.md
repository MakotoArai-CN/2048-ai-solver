# 2048-ai-solver

## 阅读须知

本文档包含项目源码，请遵循以下原则：

**代码处理**
- 保持原有结构和风格
- 仅做必要修改，避免过度重构
- 返回完整代码，禁止省略

**禁止行为**
- 禁止 "// ... 保持不变" 等省略写法
- 禁止 "// 其他代码省略" 等简化表达
- 禁止缩减算法实现

**输出要求**
- 代码过长时分批返回
- 每批代码保持可运行状态


## 项目概况

- **项目**: 2048-ai-solver
- **时间**: 2026-03-17 21:28:45
- **文件**: 11 (代码: 8, 配置: 3)
- **行数**: 1,904
- **字符**: 54,178
- **压缩**: 标准

## 目录结构

```
2048-ai-solver/
├── public/
│   └── ai.wasm
├── src/
│   ├── game-detector.ts
│   ├── main.ts
│   ├── solver.ts
│   ├── types.ts
│   ├── ui.ts
│   └── wasm-loader.ts
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 源码清单

### 1. LICENSE (行 1-17)

```text
MIT License
Copyright (c) 2025 MakotoArai
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 2. README.md

```markdown
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
```

### 3. package.json

```json
{
  "name": "2048-ai",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/tampermonkey": "^5.0.3",
    "terser": "^5.44.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "vite-plugin-monkey": "^7.1.4"
  },
  "dependencies": {
    "@types/node": "^24.7.2"
  }
}
```

### 4. src/game-detector.ts (行 1-134)

```typescript
import type { GameState, Grid } from './types';
export function detectGame(): GameState | null {
try {
const elements = document.querySelectorAll('*');
for (let i = 0; i < elements.length; i++) {
const el = elements[i] as any;
if (el.__vue__?.$data?.gridData) {
const data = el.__vue__.$data;
if (Array.isArray(data.gridData) && data.gridData.length === 4) {
return {
gridData: JSON.parse(JSON.stringify(data.gridData)),
score: data.score ?? 0,
maxTile: Math.max(...data.gridData.flat()),
isPlaying: data.isGamePlaying ?? true
};
}
}
}
const tiles = document.querySelectorAll('.tile');
if (tiles.length > 0) {
const grid: Grid = Array(4).fill(0).map(() => Array(4).fill(0));
for (let i = 0; i < tiles.length; i++) {
const tile = tiles[i];
const classes = tile.className.split(' ');
const posClass = classes.find(c => c.startsWith('tile-position-'));
const valClass = classes.find(c => c.startsWith('tile-') && !c.includes('position'));
if (posClass && valClass) {
const match = posClass.match(/tile-position-(\d)-(\d)/);
if (match) {
const x = match[1];
const y = match[2];
const value = parseInt(valClass.replace('tile-', ''));
if (x && y && value) {
grid[parseInt(y) - 1][parseInt(x) - 1] = value;
}
}
}
}
return {
gridData: grid,
score: 0,
maxTile: Math.max(...grid.flat()),
isPlaying: true
};
}
const gameContainers = [
document.querySelector('.game-container'),
document.querySelector('#game-container'),
document.querySelector('[class*="game"]'),
document.querySelector('.board'),
];
for (let i = 0; i < gameContainers.length; i++) {
const container = gameContainers[i];
if (container) {
const extracted = extractGridFromContainer(container);
if (extracted) return extracted;
}
}
return null;
} catch (error) {
console.error('游戏检测失败:', error);
return null;
}
}
function extractGridFromContainer(container: Element): GameState | null {
try {
const cells = container.querySelectorAll('[class*="cell"], [class*="tile"]');
if (cells.length === 0) return null;
const grid: Grid = Array(4).fill(0).map(() => Array(4).fill(0));
let hasData = false;
for (let i = 0; i < cells.length; i++) {
const cell = cells[i];
const text = cell.textContent?.trim();
const value = text ? parseInt(text) : 0;
if (value > 0) {
hasData = true;
const row = Math.floor(i / 4);
const col = i % 4;
if (row < 4 && col < 4) {
grid[row][col] = value;
}
}
}
if (!hasData) return null;
return {
gridData: grid,
score: 0,
maxTile: Math.max(...grid.flat()),
isPlaying: true
};
} catch (error) {
return null;
}
}
export function getCurrentGrid(): Grid | null {
const state = detectGame();
return state?.gridData ?? null;
}
export async function waitForGame(timeout = 10000): Promise<GameState | null> {
const startTime = Date.now();
while (Date.now() - startTime < timeout) {
const game = detectGame();
if (game) {
console.log('✅ 检测到游戏:', game);
return game;
}
await new Promise(resolve => setTimeout(resolve, 500));
}
console.warn('⚠️ 游戏检测超时');
return null;
}
export function observeGame(callback: (state: GameState) => void): () => void {
let lastState: GameState | null = null;
const check = () => {
const state = detectGame();
if (state && (!lastState || JSON.stringify(state.gridData) !== JSON.stringify(lastState.gridData))) {
lastState = state;
callback(state);
}
};
check();
const intervalId = window.setInterval(check, 1000);
const observer = new MutationObserver(check);
observer.observe(document.body, {
childList: true,
subtree: true,
attributes: true,
attributeFilter: ['class']
});
return () => {
clearInterval(intervalId);
observer.disconnect();
};
}
```

### 5. src/main.ts (行 1-278)

```typescript
import { Solver } from './solver';
import { getCurrentGrid, detectGame } from './game-detector';
import { createUI, updateStatus, setStatus, destroyUI } from './ui';
import { clearWasmCache } from './wasm-loader';
class AutoSolver {
private solver: Solver;
private isRunning = false;
private intervalId: number | null = null;
private lastGrid: string | null = null;
private lastChangeTime: number | null = null;
private totalMoves = 0;
private initialized = false;
private startTime: number | null = null;
private readonly NO_CHANGE_TIMEOUT = 5000;
private readonly MIHOYO_DELAY = 80;
private readonly DEFAULT_DELAY = 30;
private readonly isMihoyoSite: boolean;
constructor() {
this.solver = new Solver();
this.isMihoyoSite = this.detectMihoyoSite();
console.log(`🌐 网站类型: ${this.isMihoyoSite ? '米哈游 (80ms)' : '其他 (30ms)'}`);
}
private detectMihoyoSite(): boolean {
const hostname = window.location.hostname.toLowerCase();
const mihoyoDomains = [
'mihoyo.com',
'hoyoverse.com',
'miyoushe.com',
'yuanshen.com',
'starrail.com',
'honkaiimpact3.com'
];
return mihoyoDomains.some(domain => hostname.includes(domain));
}
private getMoveDelay(): number {
return this.isMihoyoSite ? this.MIHOYO_DELAY : this.DEFAULT_DELAY;
}
async init(): Promise<void> {
if (this.initialized) {
console.warn('⚠️ 求解器已初始化，跳过重复初始化');
return;
}
this.initialized = true;
console.log('🎮 2048 AI求解器启动');
const game = detectGame();
if (!game) {
console.warn('⚠️ 未检测到游戏，将在后台等待...');
} else {
console.log('✅ 检测到游戏:', game);
}
this.solver.init().then(() => {
setStatus('ready', '求解器已就绪');
}).catch(err => {
console.error('❌ 求解器初始化失败:', err);
setStatus('error', '初始化失败');
});
createUI(
() => this.start(),
() => this.stop()
);
GM_registerMenuCommand('🚀 开始求解', () => this.start());
GM_registerMenuCommand('⏹ 停止求解', () => this.stop());
GM_registerMenuCommand(`⚡ 当前速度: ${this.getMoveDelay()}ms`, () => {
alert(`当前网站: ${this.isMihoyoSite ? '米哈游' : '其他'}\n移动延迟: ${this.getMoveDelay()}ms`);
});
GM_registerMenuCommand('🔄 重置UI', () => {
destroyUI();
setTimeout(() => {
createUI(
() => this.start(),
() => this.stop()
);
}, 100);
});
GM_registerMenuCommand('🗑️ 清除缓存', async () => {
await clearWasmCache();
alert('缓存已清除，请刷新页面');
});
GM_registerMenuCommand('❌ 销毁UI', () => {
this.stop();
destroyUI();
});
}
async start(): Promise<void> {
if (this.isRunning) {
console.warn('⚠️ 已在运行中');
return;
}
this.isRunning = true;
this.lastGrid = null;
this.lastChangeTime = Date.now();
this.totalMoves = 0;
this.startTime = Date.now();
console.log('🚀 开始自动求解');
console.log(`⚡ 移动速度: ${this.getMoveDelay()}ms`);
setStatus('running', '初始化中...');
try {
await this.solver.init();
this.runLoop();
} catch (error) {
console.error('❌ 启动失败:', error);
setStatus('error', '启动失败');
this.isRunning = false;
}
}
stop(reason?: string): void {
this.isRunning = false;
if (this.intervalId !== null) {
clearTimeout(this.intervalId);
this.intervalId = null;
}
const statusText = reason || '已停止';
console.log('⏹ 停止求解:', statusText);
if (this.totalMoves > 0 && this.startTime) {
const elapsed = (Date.now() - this.startTime) / 1000;
const avgSpeed = this.totalMoves / elapsed;
console.log(`📊 本次求解统计:`);
console.log(` - 总移动: ${this.totalMoves} 次`);
console.log(` - 耗时: ${elapsed.toFixed(1)} 秒`);
console.log(` - 平均速度: ${avgSpeed.toFixed(2)} 步/秒`);
}
setStatus('stopped', statusText);
this.lastGrid = null;
this.lastChangeTime = null;
this.totalMoves = 0;
this.startTime = null;
}
private gridToString(grid: number[][]): string {
return grid.map(row => row.join(',')).join('|');
}
private gridsEqual(grid1: string, grid2: string): boolean {
return grid1 === grid2;
}
private async runLoop(): Promise<void> {
if (!this.isRunning) return;
try {
const grid = getCurrentGrid();
if (!grid) {
updateStatus('等待游戏...');
this.intervalId = window.setTimeout(() => this.runLoop(), 300);
return;
}
const currentGridStr = this.gridToString(grid);
const currentTime = Date.now();
if (this.lastGrid === null) {
this.lastGrid = currentGridStr;
this.lastChangeTime = currentTime;
} else {
if (this.gridsEqual(currentGridStr, this.lastGrid)) {
const noChangeTime = currentTime - this.lastChangeTime!;
const remainingSeconds = Math.ceil((this.NO_CHANGE_TIMEOUT - noChangeTime) / 1000);
if (noChangeTime >= this.NO_CHANGE_TIMEOUT) {
console.error(`❌ ${this.NO_CHANGE_TIMEOUT / 1000}秒内棋盘无变化，停止求解`);
this.stop(`${this.NO_CHANGE_TIMEOUT / 1000}秒内无变化`);
this.showNotification(
'求解已停止',
`检测到 ${this.NO_CHANGE_TIMEOUT / 1000} 秒内棋盘无变化，可能游戏已结束或出现异常。`,
'warning'
);
return;
} else {
console.warn(`⚠️ 棋盘未变化 (${remainingSeconds}秒后停止)`);
}
} else {
console.log('✅ 棋盘已更新');
this.lastGrid = currentGridStr;
this.lastChangeTime = currentTime;
this.totalMoves++;
}
}
if (this.isGameOver(grid)) {
console.log('🏁 游戏结束');
this.stop('游戏已结束');
const maxTile = Math.max(...grid.flat());
this.showNotification(
'游戏结束',
`最大方块: ${maxTile}, 总移动: ${this.totalMoves} 次`,
'info'
);
return;
}
const maxTile = Math.max(...grid.flat());
const noChangeTime = currentTime - this.lastChangeTime!;
const remainingSeconds = Math.ceil((this.NO_CHANGE_TIMEOUT - noChangeTime) / 1000);
if (noChangeTime > 2000) {
updateStatus(`计算中... (${this.totalMoves}步) [${remainingSeconds}s]`);
} else {
updateStatus(`计算中... (${this.totalMoves}步)`);
}
const move = await this.solver.getBestMove(grid);
this.makeMove(move);
updateStatus(`${move} (步数:${this.totalMoves} 最大:${maxTile})`);
const delay = this.getMoveDelay();
this.intervalId = window.setTimeout(() => this.runLoop(), delay);
} catch (error) {
console.error('❌ 求解出错:', error);
setStatus('error', '出错: ' + error);
const currentTime = Date.now();
if (this.lastChangeTime && currentTime - this.lastChangeTime >= this.NO_CHANGE_TIMEOUT) {
this.stop('错误且超时，已停止');
return;
}
this.intervalId = window.setTimeout(() => this.runLoop(), 500);
}
}
private isGameOver(grid: number[][]): boolean {
for (let i = 0; i < 4; i++) {
for (let j = 0; j < 4; j++) {
if (grid[i][j] === 0) return false;
}
}
for (let i = 0; i < 4; i++) {
for (let j = 0; j < 4; j++) {
const current = grid[i][j];
if (j < 3 && grid[i][j + 1] === current) return false;
if (i < 3 && grid[i + 1][j] === current) return false;
}
}
return true;
}
private showNotification(title: string, message: string, type: 'info' | 'warning' | 'error'): void {
console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
if (typeof GM_notification !== 'undefined') {
GM_notification({
title: `${title}`,
text: message,
timeout: 5000
});
}
}
private makeMove(direction: 'up' | 'right' | 'down' | 'left'): void {
const keyMap = {
up: 'ArrowUp',
right: 'ArrowRight',
down: 'ArrowDown',
left: 'ArrowLeft'
};
const key = keyMap[direction];
const keyCode = { ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, ArrowLeft: 37 }[key];
const keydownEvent = new KeyboardEvent('keydown', {
key,
code: key,
keyCode,
which: keyCode,
bubbles: true
});
const keyupEvent = new KeyboardEvent('keyup', {
key,
code: key,
keyCode,
which: keyCode,
bubbles: true
});
document.dispatchEvent(keydownEvent);
setTimeout(() => document.dispatchEvent(keyupEvent), 10);
}
}
declare global {
interface Window {
__2048_SOLVER_INSTANCE__?: AutoSolver;
__2048_SOLVER_INITIALIZED__?: boolean;
}
}
if (window.__2048_SOLVER_INITIALIZED__) {
console.warn('⚠️ 2048求解器已存在，跳过重复初始化');
} else {
window.__2048_SOLVER_INITIALIZED__ = true;
const solver = new AutoSolver();
window.__2048_SOLVER_INSTANCE__ = solver;
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
setTimeout(() => solver.init(), 100);
});
} else {
setTimeout(() => solver.init(), 100);
}
console.log('✅ 2048求解器脚本已加载');
}
```

### 6. src/solver.ts (行 1-233)

```typescript
import type { Grid, Direction, Row } from './types';
import { loadWasm } from './wasm-loader';
function gridToRows(grid: Grid): Row[] {
const rows: Row[] = [];
for (let i = 0; i < 4; i++) {
let row = 0;
for (let j = 0; j < 4; j++) {
const value = grid[i][j];
const rank = value === 0 ? 0 : Math.log2(value);
row |= (rank & 0xf) << (12 - 4 * j);
}
rows.push(row);
}
return rows;
}
function createInlineWorker(wasmBuffer: ArrayBuffer): Worker {
const workerCode = `
const WASM_PAGE_SIZE = 65536;
const INITIAL_MEMORY = 134217728;
let wasmModule = null;
let wasmMemory = null;
let HEAP32 = null;
function _abort() {
throw new Error('abort() called');
}
function _clock_gettime(clk_id, tp) {
let now;
if (clk_id === 0) {
now = Date.now();
} else if (clk_id === 1 || clk_id === 4) {
now = performance.now();
} else {
return -1;
}
if (HEAP32 && tp) {
HEAP32[tp >> 2] = (now / 1000) | 0;
HEAP32[(tp + 4) >> 2] = ((now % 1000) * 1000000) | 0;
}
return 0;
}
function _emscripten_run_script(ptr) {
console.log('[Worker] emscripten_run_script called');
}
function updateGlobalBufferViews(buf) {
HEAP32 = new Int32Array(buf);
}
onmessage = async (e) => {
if (e.data.type === 'init') {
try {
wasmMemory = new WebAssembly.Memory({
initial: INITIAL_MEMORY / WASM_PAGE_SIZE,
maximum: INITIAL_MEMORY / WASM_PAGE_SIZE
});
updateGlobalBufferViews(wasmMemory.buffer);
const importObject = {
a: {
b: _abort,
c: _clock_gettime,
d: _emscripten_run_script,
a: wasmMemory
}
};
const wasmBytes = new Uint8Array(e.data.wasmBuffer);
const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
wasmModule = instance.exports;
if (wasmModule.f) {
wasmModule.f();
}
if (wasmModule.h) {
wasmModule.h();
}
console.log('[Worker] WASM initialized successfully');
postMessage({ type: 'ready' });
} catch (error) {
console.error('[Worker] Init error:', error);
postMessage({
type: 'error',
error: error.message || String(error),
stack: error.stack
});
}
} else if (e.data.type === 'work') {
try {
const { board, dir } = e.data;
if (!wasmModule || !wasmModule.g) {
throw new Error('WASM module not initialized');
}
const result = wasmModule.g(
board[0],
board[1],
board[2],
board[3],
dir
);
postMessage({ type: 'result', result });
} catch (error) {
console.error('[Worker] Work error:', error);
postMessage({
type: 'error',
error: error.message || String(error)
});
}
}
};
onerror = (error) => {
console.error('[Worker] Uncaught error:', error);
postMessage({
type: 'error',
error: error.message || String(error)
});
};
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
worker.postMessage({ type: 'init', wasmBuffer });
return worker;
}
export class Solver {
private workers: Worker[] = [];
private wasmReady = false;
private pendingInit: Promise<void> | null = null;
async init(): Promise<void> {
if (this.wasmReady) return;
if (this.pendingInit) return this.pendingInit;
this.pendingInit = (async () => {
console.log('🔧 初始化求解器...');
try {
const wasmBuffer = await loadWasm();
console.log(`📦 WASM 已加载: ${(wasmBuffer.byteLength / 1024).toFixed(1)} KB`);
const initPromises: Promise<void>[] = [];
for (let i = 0; i < 4; i++) {
const worker = createInlineWorker(wasmBuffer);
this.workers.push(worker);
initPromises.push(new Promise((resolve, reject) => {
const timeout = setTimeout(() => {
reject(new Error(`Worker ${i + 1} 初始化超时`));
}, 10000);
worker.onmessage = (e) => {
if (e.data.type === 'ready') {
clearTimeout(timeout);
console.log(`✅ Worker ${i + 1}/4 已就绪`);
resolve();
} else if (e.data.type === 'error') {
clearTimeout(timeout);
console.error(`❌ Worker ${i + 1} 初始化失败:`, e.data.error);
if (e.data.stack) {
console.error('Stack:', e.data.stack);
}
reject(new Error(e.data.error));
}
};
worker.onerror = (error) => {
clearTimeout(timeout);
console.error(`❌ Worker ${i + 1} 错误:`, error);
reject(error);
};
}));
}
await Promise.all(initPromises);
this.wasmReady = true;
console.log('✅ 求解器已就绪 (4 Workers)');
} catch (error) {
console.error('❌ 求解器初始化失败:', error);
this.cleanup();
throw error;
}
})();
return this.pendingInit;
}
async getBestMove(grid: Grid): Promise<'up' | 'right' | 'down' | 'left'> {
if (!this.wasmReady) {
await this.init();
}
const board = gridToRows(grid);
const directions: Direction[] = [0, 1, 2, 3];
const dirNames = ['up', 'right', 'down', 'left'] as const;
const promises = directions.map((dir, idx) => {
return new Promise<number>((resolve, reject) => {
const worker = this.workers[idx];
let resolved = false;
const messageHandler = (e: MessageEvent) => {
if (resolved) return;
if (e.data.type === 'result') {
resolved = true;
worker.removeEventListener('message', messageHandler);
resolve(e.data.result);
} else if (e.data.type === 'error') {
resolved = true;
worker.removeEventListener('message', messageHandler);
console.error(`Worker ${idx} 计算错误:`, e.data.error);
resolve(0);
}
};
worker.addEventListener('message', messageHandler);
worker.postMessage({ type: 'work', board, dir });
setTimeout(() => {
if (!resolved) {
resolved = true;
worker.removeEventListener('message', messageHandler);
console.warn(`Worker ${idx} 超时`);
resolve(0);
}
}, 5000);
});
});
const results = await Promise.all(promises);
let bestDir = 0;
let bestScore = results[0];
for (let i = 1; i < 4; i++) {
if (results[i] > bestScore) {
bestScore = results[i];
bestDir = i;
}
}
console.log(`🎯 方向得分: ↑${results[0].toFixed(1)} →${results[1].toFixed(1)} ↓${results[2].toFixed(1)} ←${results[3].toFixed(1)} | 选择: ${dirNames[bestDir]}`);
return dirNames[bestDir];
}
private cleanup(): void {
this.workers.forEach(w => {
try {
w.terminate();
} catch (e) {
}
});
this.workers = [];
this.wasmReady = false;
this.pendingInit = null;
}
destroy(): void {
console.log('🗑️ 销毁求解器');
this.cleanup();
}
}
```

### 7. src/types.ts (行 1-26)

```typescript
export type Direction = 0 | 1 | 2 | 3;
export type Grid = number[][];
export type Row = number;
export interface GameState {
gridData: Grid;
score?: number;
maxTile?: number;
isPlaying?: boolean;
}
export interface WasmModule {
_jsWork(row1: Row, row2: Row, row3: Row, row4: Row, dir: Direction): number;
}
export interface WorkerMessage {
board: Row[];
dir: Direction;
}
export interface CachedWasm {
data: ArrayBuffer;
timestamp: number;
version: string;
}
declare global {
const __BUILD_MODE__: 'online' | 'offline';
const __INLINE_WASM__: string | null;
}
export {};
```

### 8. src/ui.ts (行 1-334)

```typescript
interface UICallbacks {
onStart: () => void;
onStop: () => void;
onDestroy?: () => void;
}
class IsolatedUI {
private container: HTMLDivElement;
private shadowRoot: ShadowRoot;
private callbacks: UICallbacks;
private isDragging = false;
private dragOffset = { x: 0, y: 0 };
constructor(callbacks: UICallbacks) {
this.callbacks = callbacks;
this.container = document.createElement('div');
this.container.setAttribute('data-solver-ui', 'true');
this.container.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
this.render();
this.attachEventListeners();
document.documentElement.appendChild(this.container);
}
private render(): void {
this.shadowRoot.innerHTML = `
<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
:host {
all: initial;
display: block;
position: fixed;
top: 20px;
right: 20px;
z-index: 2147483647;
}
.panel {
background: linear-gradient(135deg, #0094f7ff 0%, #ff019eff 100%);
color: #ffffff;
padding: 16px;
border-radius: 12px;
min-width: 220px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
cursor: move;
user-select: none;
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.18);
z-index: 9999999999;
}
.panel-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 12px;
padding-bottom: 12px;
border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.panel-title {
font-size: 16px;
font-weight: 600;
display: flex;
align-items: center;
gap: 6px;
}
.close-btn {
background: rgba(255, 255, 255, 0.2);
border: none;
color: white;
width: 24px;
height: 24px;
border-radius: 50%;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
font-size: 18px;
line-height: 1;
transition: all 0.2s;
}
.close-btn:hover {
background: rgba(255, 255, 255, 0.3);
box-shadow: 0 0 10px rgba(240, 61, 61, 1);
}
.controls {
display: flex;
flex-direction: column;
gap: 8px;
}
.btn {
padding: 10px 16px;
border: none;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
cursor: pointer;
transition: all 0.3s;
text-align: center;
outline: none;
}
.btn:active {
transform: scale(0.98);
}
.btn-start {
background: rgba(255, 255, 255, 0.9);
color: #667eea;
}
.btn-start:hover {
background: rgba(255, 255, 255, 1);
box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}
.btn-stop {
background: rgba(239, 68, 68, 0.9);
color: white;
}
.btn-stop:hover {
background: rgba(239, 68, 68, 1);
box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.status {
margin-top: 12px;
padding: 10px;
background: rgba(0, 0, 0, 0.2);
border-radius: 6px;
font-size: 13px;
text-align: center;
border: 1px solid rgba(255, 255, 255, 0.1);
}
.status-dot {
display: inline-block;
width: 8px;
height: 8px;
border-radius: 50%;
margin-right: 6px;
animation: pulse 2s infinite;
}
.status-ready .status-dot {
background: #10b981;
}
.status-running .status-dot {
background: #f59e0b;
}
.status-stopped .status-dot {
background: #6b7280;
}
.status-error .status-dot {
background: #ef4444;
}
@keyframes pulse {
0%, 100% {
opacity: 1;
}
50% {
opacity: 0.5;
}
}
.minimize-btn {
background: rgba(255, 255, 255, 0.2);
border: none;
color: white;
width: 24px;
height: 24px;
border-radius: 50%;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
font-size: 14px;
margin-right: 4px;
transition: all 0.2s;
}
.minimize-btn:hover {
background: rgba(255, 255, 255, 0.3);
}
.panel.minimized .controls,
.panel.minimized .status {
display: none;
}
.panel.minimized {
min-width: auto;
}
</style>
<div class="panel" id="panel">
<div class="panel-header">
<div class="panel-title">
<span>2048 AI</span>
</div>
<div style="display: flex; gap: 4px;">
<button class="minimize-btn" id="minimizeBtn" title="最小化">➖</button>
<button class="close-btn" id="closeBtn" title="关闭">❌</button>
</div>
</div>
<div class="controls">
<button class="btn btn-start" id="startBtn">开始求解</button>
<button class="btn btn-stop" id="stopBtn" style="display: none;">停止</button>
</div>
<div class="status status-ready" id="status">
<span class="status-dot"></span>
<span id="statusText">就绪</span>
</div>
</div>
`;
}
private attachEventListeners(): void {
const panel = this.shadowRoot.getElementById('panel')!;
const startBtn = this.shadowRoot.getElementById('startBtn')!;
const stopBtn = this.shadowRoot.getElementById('stopBtn')!;
const closeBtn = this.shadowRoot.getElementById('closeBtn')!;
const minimizeBtn = this.shadowRoot.getElementById('minimizeBtn')!;
const status = this.shadowRoot.getElementById('status')!;
startBtn.addEventListener('click', (e) => {
e.stopPropagation();
startBtn.style.display = 'none';
stopBtn.style.display = 'block';
status.className = 'status status-running';
this.updateStatusText('运行中...');
this.callbacks.onStart();
});
stopBtn.addEventListener('click', (e) => {
e.stopPropagation();
this.resetButtons();
status.className = 'status status-stopped';
this.updateStatusText('已停止');
this.callbacks.onStop();
});
closeBtn.addEventListener('click', (e) => {
e.stopPropagation();
this.destroy();
});
minimizeBtn.addEventListener('click', (e) => {
e.stopPropagation();
panel.classList.toggle('minimized');
minimizeBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
});
panel.addEventListener('mousedown', (e) => {
if ((e.target as HTMLElement).tagName === 'BUTTON') return;
this.isDragging = true;
const rect = this.container.getBoundingClientRect();
this.dragOffset.x = e.clientX - rect.left;
this.dragOffset.y = e.clientY - rect.top;
panel.style.cursor = 'grabbing';
});
document.addEventListener('mousemove', (e) => {
if (!this.isDragging) return;
const x = e.clientX - this.dragOffset.x;
const y = e.clientY - this.dragOffset.y;
const maxX = window.innerWidth - this.container.offsetWidth;
const maxY = window.innerHeight - this.container.offsetHeight;
this.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
this.container.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
this.container.style.right = 'auto';
});
document.addEventListener('mouseup', () => {
if (this.isDragging) {
this.isDragging = false;
panel.style.cursor = 'move';
}
});
panel.addEventListener('selectstart', (e) => e.preventDefault());
}
public updateStatusText(text: string): void {
const statusText = this.shadowRoot.getElementById('statusText');
if (statusText) {
statusText.textContent = text;
}
}
public setStatus(state: 'ready' | 'running' | 'stopped' | 'error', text?: string): void {
const status = this.shadowRoot.getElementById('status');
if (status) {
status.className = `status status-${state}`;
}
if (text) {
this.updateStatusText(text);
}
}
public resetButtons(): void {
const startBtn = this.shadowRoot.getElementById('startBtn');
const stopBtn = this.shadowRoot.getElementById('stopBtn');
if (startBtn && stopBtn) {
startBtn.style.display = 'block';
stopBtn.style.display = 'none';
}
}
public destroy(): void {
if (this.callbacks.onDestroy) {
this.callbacks.onDestroy();
}
this.container.remove();
}
}
let currentUI: IsolatedUI | null = null;
export function createUI(onStart: () => void, onStop: () => void): void {
if (currentUI) {
console.warn('⚠️ UI已存在，跳过创建');
return;
}
const existingUI = document.querySelector('[data-solver-ui="true"]');
if (existingUI) {
console.warn('⚠️ 检测到已存在的UI元素，移除后重新创建');
existingUI.remove();
}
currentUI = new IsolatedUI({
onStart,
onStop,
onDestroy: () => {
currentUI = null;
}
});
console.log('✅ 隔离UI已创建');
}
export function updateStatus(text: string): void {
if (currentUI) {
currentUI.updateStatusText(text);
}
}
export function setStatus(state: 'ready' | 'running' | 'stopped' | 'error', text?: string): void {
if (currentUI) {
currentUI.setStatus(state, text);
if (state === 'stopped' || state === 'ready' || state === 'error') {
currentUI.resetButtons();
}
}
}
export function destroyUI(): void {
if (currentUI) {
currentUI.destroy();
currentUI = null;
}
const existingUI = document.querySelector('[data-solver-ui="true"]');
if (existingUI) {
existingUI.remove();
}
}
```

### 9. src/wasm-loader.ts (行 1-179)

```typescript
import type { CachedWasm } from './types';
declare const __BUILD_MODE__: 'online' | 'offline';
declare const __INLINE_WASM__: string | null;
const WASM_SOURCES = [
'https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://raw.kkgithub.com/ziap/2048-ai/master/ai.wasm',
'https://wget.la/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://hk.gh-proxy.com/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://hub.glowp.xyz/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://ghfast.top/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://ghproxy.net/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://gh.catmak.name/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://fastly.jsdelivr.net/gh/ziap/2048-ai@master/ai.wasm',
'https://g.blfrp.cn/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm',
'https://github.3x25.com/https://raw.githubusercontent.com/ziap/2048-ai/master/ai.wasm'
];
const CACHE_KEY = '2048_wasm_cache';
const WASM_VERSION = '1.0.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
function base64ToArrayBuffer(base64: string): ArrayBuffer {
const binaryString = atob(base64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
bytes[i] = binaryString.charCodeAt(i);
}
return bytes.buffer;
}
class WasmCache {
private dbName = '2048SolverDB';
private storeName = 'wasmStore';
private db: IDBDatabase | null = null;
async init(): Promise<void> {
return new Promise((resolve, reject) => {
const request = indexedDB.open(this.dbName, 1);
request.onerror = () => reject(request.error);
request.onsuccess = () => {
this.db = request.result;
resolve();
};
request.onupgradeneeded = (event) => {
const db = (event.target as IDBOpenDBRequest).result;
if (!db.objectStoreNames.contains(this.storeName)) {
db.createObjectStore(this.storeName);
}
};
});
}
async get(): Promise<CachedWasm | null> {
if (!this.db) await this.init();
return new Promise((resolve, reject) => {
const transaction = this.db!.transaction([this.storeName], 'readonly');
const store = transaction.objectStore(this.storeName);
const request = store.get(CACHE_KEY);
request.onerror = () => reject(request.error);
request.onsuccess = () => {
const cached = request.result as CachedWasm | undefined;
if (!cached) {
resolve(null);
return;
}
if (Date.now() - cached.timestamp > CACHE_DURATION) {
console.log('🗑️ WASM 缓存已过期，需要重新下载');
this.delete();
resolve(null);
return;
}
if (cached.version !== WASM_VERSION) {
console.log('🔄 WASM 版本更新，需要重新下载');
this.delete();
resolve(null);
return;
}
resolve(cached);
};
});
}
async set(data: ArrayBuffer): Promise<void> {
if (!this.db) await this.init();
const cached: CachedWasm = {
data,
timestamp: Date.now(),
version: WASM_VERSION
};
return new Promise((resolve, reject) => {
const transaction = this.db!.transaction([this.storeName], 'readwrite');
const store = transaction.objectStore(this.storeName);
const request = store.put(cached, CACHE_KEY);
request.onerror = () => reject(request.error);
request.onsuccess = () => resolve();
});
}
async delete(): Promise<void> {
if (!this.db) await this.init();
return new Promise((resolve, reject) => {
const transaction = this.db!.transaction([this.storeName], 'readwrite');
const store = transaction.objectStore(this.storeName);
const request = store.delete(CACHE_KEY);
request.onerror = () => reject(request.error);
request.onsuccess = () => resolve();
});
}
}
function downloadWasm(url: string): Promise<ArrayBuffer> {
return new Promise((resolve, reject) => {
GM_xmlhttpRequest({
method: 'GET',
url,
responseType: 'arraybuffer',
timeout: 10000,
onload: (response) => {
if (response.status === 200) {
resolve(response.response as ArrayBuffer);
} else {
reject(new Error(`HTTP ${response.status}`));
}
},
onerror: (error) => reject(error),
ontimeout: () => reject(new Error('Timeout'))
});
});
}
async function loadWasmOnline(): Promise<ArrayBuffer> {
console.log('🔍 检查 WASM 缓存...');
const cache = new WasmCache();
const cached = await cache.get();
if (cached) {
console.log('✅ 使用缓存的 WASM');
return cached.data;
}
console.log('📥 下载 WASM 文件...');
for (let i = 0; i < WASM_SOURCES.length; i++) {
const url = WASM_SOURCES[i];
try {
console.log(`🌐 尝试源 [${i + 1}/${WASM_SOURCES.length}]: ${url.split('/').slice(0, 3).join('/')}`);
const data = await downloadWasm(url);
console.log(`✅ 下载成功 (${(data.byteLength / 1024).toFixed(1)} KB)`);
await cache.set(data);
console.log('💾 已缓存 WASM');
return data;
} catch (error) {
console.warn(`❌ 源 ${i + 1} 失败:`, error);
if (i === WASM_SOURCES.length - 1) {
throw new Error('所有 WASM 源均下载失败');
}
}
}
throw new Error('无法下载 WASM');
}
function loadWasmOffline(): ArrayBuffer {
console.log('📦 使用内联的 WASM 模块（离线版）');
if (!__INLINE_WASM__) {
throw new Error('离线模式下未找到内联的 WASM 数据！请检查构建配置。');
}
try {
const arrayBuffer = base64ToArrayBuffer(__INLINE_WASM__);
console.log(`✅ WASM 已加载: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`);
return arrayBuffer;
} catch (error) {
console.error('❌ Base64 解码失败:', error);
throw new Error('无法解码内联的 WASM 数据');
}
}
export async function loadWasm(): Promise<ArrayBuffer> {
console.log(`🎯 加载模式: ${__BUILD_MODE__.toUpperCase()}`);
if (__BUILD_MODE__ === 'offline') {
return loadWasmOffline();
} else {
return loadWasmOnline();
}
}
export async function clearWasmCache(): Promise<void> {
if (__BUILD_MODE__ === 'offline') {
console.warn('⚠️ 离线模式不使用缓存，无需清除');
return;
}
const cache = new WasmCache();
await cache.delete();
console.log('🗑️ WASM 缓存已清除');
}
```

### 10. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "noEmit": true,
    "types": ["tampermonkey"],
    "downlevelIteration": true
  },
  "include": ["src/**/*"]
}
```

### 11. vite.config.ts (行 1-147)

```typescript
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const args = process.argv.slice(2);
let buildMode = 'online';
for (let i = 0; i < args.length; i++) {
if ((args[i] === '-m' || args[i] === '--mode') && args[i + 1]) {
buildMode = args[i + 1].toLowerCase();
break;
}
}
if (process.env.BUILD_MODE) {
buildMode = process.env.BUILD_MODE.toLowerCase();
}
if (!['online', 'offline'].includes(buildMode)) {
console.warn(`⚠️ 未知的构建模式: ${buildMode}，使用默认的 online 模式`);
buildMode = 'online';
}
console.log(`\n🔧 构建模式: ${buildMode.toUpperCase()}`);
function loadWasmAsBase64(): string {
if (buildMode !== 'offline') {
return 'null';
}
try {
const wasmPath = resolve(__dirname, 'public/ai.wasm');
const wasmBuffer = readFileSync(wasmPath);
const base64 = wasmBuffer.toString('base64');
const sizeKB = (wasmBuffer.length / 1024).toFixed(2);
const base64SizeKB = (base64.length / 1024).toFixed(2);
console.log(`✅ WASM 文件已加载: ${sizeKB} KB (Base64: ${base64SizeKB} KB)`);
return JSON.stringify(base64);
} catch (error) {
console.error('❌ 无法读取 WASM 文件:', error);
throw new Error(`请确保 public/ai.wasm 文件存在！\n${error}`);
}
}
export default defineConfig({
define: {
__BUILD_MODE__: JSON.stringify(buildMode),
__INLINE_WASM__: loadWasmAsBase64(),
},
build: {
minify: 'terser',
terserOptions: {
compress: {
drop_console: buildMode === 'offline',
drop_debugger: true,
dead_code: true,
conditionals: true,
booleans: true,
unused: true,
if_return: true,
join_vars: true,
reduce_vars: true,
inline: 1,
loops: true,
toplevel: false,
evaluate: true,
passes: 2,
keep_fargs: false,
keep_fnames: false,
keep_classnames: false,
pure_getters: false,
},
mangle: {
toplevel: false,
properties: false,
reserved: [
'wasmModule',
'wasmMemory',
'HEAP32',
'Module',
'GM_xmlhttpRequest',
'GM_setValue',
'GM_getValue',
'GM_deleteValue',
'GM_registerMenuCommand',
'GM_notification',
'unsafeWindow',
'__2048_SOLVER_INSTANCE__',
'__2048_SOLVER_INITIALIZED__',
'__BUILD_MODE__',
'__INLINE_WASM__',
'shadowRoot',
'attachShadow',
'AutoSolver',
'Solver',
'IsolatedUI',
],
},
format: {
comments: false,
beautify: false,
quote_style: 1,
},
},
},
plugins: [
monkey({
entry: 'src/main.ts',
userscript: {
name: `2048 AI Solver ${buildMode === 'offline' ? '(Offline)' : ''}`,
namespace: 'https://github.com/MakotoArai-CN/2048-ai-solver',
version: '1.0.0',
description: buildMode === 'offline'
? '使用 WebAssembly 加速的 2048 AI求解器（离线版，无需联网）'
: '使用 WebAssembly 加速的 2048 AI求解器，支持合成丘丘王',
author: 'MakotoArai',
match: [
'*:/eventevent*',
],
icon: 'https://play2048.co/faviconSimple.svg',
grant: [
'GM_xmlhttpRequest',
'GM_setValue',
'GM_getValue',
'GM_deleteValue',
'GM_registerMenuCommand',
'GM_notification',
'unsafeWindow'
],
...(buildMode === 'online' ? {
connect: [
'raw.githubusercontent.com',
'raw.kkgithub.com',
'wget.la',
'hk.gh-proxy.com',
'hub.glowp.xyz',
'ghfast.top',
'ghproxy.net',
'gh.catmak.name',
'fastly.jsdelivr.net',
'g.blfrp.cn',
'github.3x25.com'
]
} : {})
},
build: {
fileName: buildMode === 'offline'
? '2048-ai-offline.user.js'
: '2048-ai.user.js',
metaFileName: true,
}
})
]
});
```


---

## 统计信息

✅ **全部内容已展示**

| 指标 | 数值 |
|------|------|
| 文件总数 | 11 |
| 代码文件 | 8 |
| 配置文件 | 3 |
| 总行数 | 1,904 |
| 总字符 | 54,178 |

需要适配canvas，代码如下：
```javascript
class CanvasGame {
    constructor(canvasId, websocket) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ws = websocket;

        // Game state
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.victory = false;
        this.gameOver = false;

        // Canvas settings
        this.setupCanvas();

        // Modern flat design colors
        this.colors = {
            background: '#faf8ef',
            empty: 'rgba(238, 228, 218, 0.35)',
            text: '#776e65',
            textLight: '#f9f6f2',
            tiles: {
                2: '#eee4da',
                4: '#ede0c8',
                8: '#f2b179',
                16: '#f59563',
                32: '#f67c5f',
                64: '#f65e3b',
                128: '#edcf72',
                256: '#edcc61',
                512: '#edc850',
                1024: '#edc53f',
                2048: '#edc22e',
                4096: '#ee5a24',
                8192: '#2c3e50',
                16384: '#9b59b6'
            }
        };

        // Animation
        this.animationFrame = null;
        this.animations = [];
        this.mergeAnimations = [];
        this.newTileAnimations = [];
        this.moveAnimations = [];
        this.particles = [];
        this.isAnimating = false;
        this.lastMoveDirection = null;

        // Input handling
        this.setupInputHandlers();

        // Initial render
        this.render();

        // Check for cached game state when WebSocket is connected
        if (this.ws) {
            this.checkCachedGameState();
        }
    }

    // Check if there's a cached game state and apply it
    checkCachedGameState() {
        if (window.gameWS && window.gameWS.cachedGameState) {
            console.log('Applying cached game state');
            this.updateGameState(window.gameWS.cachedGameState);
            window.gameWS.cachedGameState = null; // Clear cache
        }
    }

    // Set WebSocket connection (called when connection is established)
    setWebSocket(websocket) {
        this.ws = websocket;
        this.checkCachedGameState();
    }
    
    setupCanvas() {
        // Calculate optimal size for different screen sizes
        const isMobile = window.innerWidth <= 600;
        const maxSize = isMobile ? Math.min(window.innerWidth - 16, window.innerHeight * 0.5) : 500;
        const size = Math.min(window.innerWidth - (isMobile ? 16 : 40), maxSize);

        // Calculate dimensions properly
        this.padding = isMobile ? 8 : 12;
        this.gap = isMobile ? 6 : 8;
        this.tileSize = (size - 2 * this.padding - 3 * this.gap) / 4; // 3 gaps between 4 tiles

        // High DPI support
        const dpr = window.devicePixelRatio || 1;

        // Set actual canvas size (for drawing)
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;

        // Set display size (CSS)
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';

        // Scale context for high DPI
        this.ctx.scale(dpr, dpr);

        // Store the logical size for drawing calculations
        this.canvasSize = size;
    }
    
    setupInputHandlers() {
        // Touch handling
        let startX, startY;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    this.handleMove(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    this.handleMove(deltaY > 0 ? 'down' : 'up');
                }
            }
            
            startX = startY = null;
        });
        
        // Keyboard handling
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.victory) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.handleMove('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.handleMove('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.handleMove('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.handleMove('right');
                    break;
            }
        });
    }
    
    handleMove(direction) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.lastMoveDirection = direction;
            this.ws.send(JSON.stringify({
                type: 'move',
                data: {
                    direction: direction
                }
            }));
        }
    }
    
    updateGameState(gameState) {
        const oldBoard = this.board.map(row => [...row]); // Deep copy
        const newBoard = gameState.board;

        // Detect merges and new tiles
        this.detectAnimations(oldBoard, newBoard);

        this.board = newBoard;
        this.score = gameState.score;
        this.victory = gameState.victory;
        this.gameOver = gameState.game_over;

        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toLocaleString();
        }

        // Start animations if any
        if (this.mergeAnimations.length > 0 || this.newTileAnimations.length > 0 || this.moveAnimations.length > 0) {
            this.startAnimations();
        } else {
            this.render();
        }

        // Show game over/victory overlay
        if (this.victory || this.gameOver) {
            this.showGameOverlay();
        }
    }

    detectAnimations(oldBoard, newBoard) {
        this.mergeAnimations = [];
        this.newTileAnimations = [];
        this.moveAnimations = [];

        // Simple approach: only detect merges and new tiles
        // Don't animate moves to avoid confusion

        // Count total tiles to detect if merges occurred
        const oldTileCount = oldBoard.flat().filter(v => v > 0).length;
        const newTileCount = newBoard.flat().filter(v => v > 0).length;
        const mergesOccurred = oldTileCount > newTileCount;

        // Find all positions that changed
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const oldValue = oldBoard[row][col];
                const newValue = newBoard[row][col];

                // Skip if this position has no change
                if (oldValue === newValue) {
                    continue;
                }

                // Case 1: Tile value doubled at same position (definite merge)
                if (oldValue > 0 && newValue === oldValue * 2) {
                    this.mergeAnimations.push({
                        row: row,
                        col: col,
                        value: newValue,
                        startTime: Date.now(),
                        duration: 200
                    });
                    this.createMergeParticles(row, col);
                }
                // Case 2: New tile appeared in previously empty space
                else if (oldValue === 0 && newValue > 0) {
                    // Only treat as new tile if no merges occurred, or if it's a small value (2 or 4)
                    if (!mergesOccurred || newValue <= 4) {
                        this.newTileAnimations.push({
                            row: row,
                            col: col,
                            value: newValue,
                            startTime: Date.now(),
                            duration: 150
                        });
                    }
                    // If merges occurred and it's a larger value, it's likely a merge result
                    else {
                        // Only show merge animation if we can confirm it's actually a merge
                        if (this.isLikelyMergeResult(oldBoard, newBoard, row, col, newValue)) {
                            this.mergeAnimations.push({
                                row: row,
                                col: col,
                                value: newValue,
                                startTime: Date.now(),
                                duration: 200
                            });
                            this.createMergeParticles(row, col);
                        }
                    }
                }
            }
        }
    }

    isLikelyMergeResult(oldBoard, newBoard, row, col, value) {
        const halfValue = value / 2;

        // Count how many tiles of halfValue existed before and after
        const oldHalfCount = oldBoard.flat().filter(v => v === halfValue).length;
        const newHalfCount = newBoard.flat().filter(v => v === halfValue).length;

        // If we lost at least 2 tiles of halfValue, this is likely a merge
        return oldHalfCount - newHalfCount >= 2;
    }




    
    render() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

        // Draw clean background
        this.ctx.fillStyle = this.colors.background;
        const borderRadius = Math.min(this.canvasSize * 0.02, 8);
        this.drawRoundedRect(0, 0, this.canvasSize, this.canvasSize, borderRadius);
        this.ctx.fill();

        // Draw empty tiles
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                this.drawEmptyTile(row, col);
            }
        }

        // Draw tiles with values (skip animated tiles)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = this.board[row][col];
                if (value > 0 && !this.isAnimatingTile(row, col)) {
                    this.drawTile(row, col, value);
                }
            }
        }
    }

    isAnimatingTile(row, col) {
        return this.mergeAnimations.some(anim => anim.row === row && anim.col === col) ||
               this.newTileAnimations.some(anim => anim.row === row && anim.col === col);
    }

    createMergeParticles(row, col) {
        const centerX = this.padding + col * (this.tileSize + this.gap) + this.tileSize / 2;
        const centerY = this.padding + row * (this.tileSize + this.gap) + this.tileSize / 2;

        // Subtle particle colors
        const colors = ['#f39c12', '#e67e22', '#d35400'];

        // Create fewer, more elegant particles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02,
                size: 2 + Math.random() * 2,
                color: color
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vx *= 0.95; // Friction
            particle.vy *= 0.95;

            return particle.life > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // Helper method to draw rounded rectangles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    drawEmptyTile(row, col) {
        const x = this.padding + col * (this.tileSize + this.gap);
        const y = this.padding + row * (this.tileSize + this.gap);

        this.ctx.fillStyle = this.colors.empty;
        const borderRadius = Math.min(this.tileSize * 0.1, 6);
        this.drawRoundedRect(x, y, this.tileSize, this.tileSize, borderRadius);
        this.ctx.fill();
    }

    drawTile(row, col, value, scale = 1, opacity = 1, offsetX = 0, offsetY = 0) {
        const x = this.padding + col * (this.tileSize + this.gap) + offsetX;
        const y = this.padding + row * (this.tileSize + this.gap) + offsetY;

        // Save context for transformations
        this.ctx.save();

        // Apply opacity
        this.ctx.globalAlpha = opacity;

        // Apply scale transformation
        if (scale !== 1) {
            const centerX = x + this.tileSize / 2;
            const centerY = y + this.tileSize / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-centerX, -centerY);
        }

        // Draw tile with clean flat design
        const tileColor = this.colors.tiles[value];
        this.ctx.fillStyle = tileColor || '#3c3a32';

        // Calculate border radius based on tile size
        const borderRadius = Math.min(this.tileSize * 0.1, 6);
        this.drawRoundedRect(x, y, this.tileSize, this.tileSize, borderRadius);
        this.ctx.fill();

        // Add subtle inner border for depth (only for higher values)
        if (value >= 8) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.drawRoundedRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1, borderRadius);
            this.ctx.stroke();
        }

        // Tile text
        const fontSize = this.getTileTextSize(value);
        this.ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;

        // Text color
        this.ctx.fillStyle = value <= 4 ? this.colors.text : this.colors.textLight;
        this.ctx.fillText(value.toString(), centerX, centerY);

        // Restore context
        this.ctx.restore();
    }
    
    getTileTextSize(value) {
        const isMobile = window.innerWidth <= 600;
        const baseSize = this.tileSize * (isMobile ? 0.4 : 0.35);

        if (value < 100) return Math.max(baseSize, isMobile ? 12 : 14);
        if (value < 1000) return Math.max(baseSize * 0.85, isMobile ? 11 : 12);
        if (value < 10000) return Math.max(baseSize * 0.7, isMobile ? 10 : 11);
        return Math.max(baseSize * 0.6, isMobile ? 9 : 10);
    }
    
    showGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        const message = document.getElementById('overlay-message');
        
        if (overlay && message) {
            if (this.victory) {
                message.textContent = '🎉 You Win! You merged two 8192 tiles!';
                overlay.className = 'game-overlay victory';
            } else {
                message.textContent = '😔 Game Over! No more moves available.';
                overlay.className = 'game-overlay game-over';
            }
            overlay.style.display = 'flex';
        }
    }
    
    hideGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    newGame() {
        this.hideGameOverlay();
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'new_game',
                data: {}
            }));
        }
    }
    
    startAnimations() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.animateFrame();
    }

    animateFrame() {
        const now = Date.now();
        let hasActiveAnimations = false;

        // Update particles
        this.updateParticles();

        // Clear and draw base state
        this.render();



        // Draw merge animations
        this.mergeAnimations = this.mergeAnimations.filter(anim => {
            const elapsed = now - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);

            if (progress < 1) {
                hasActiveAnimations = true;

                // Bounce effect for merges
                const scale = 1 + 0.3 * Math.sin(progress * Math.PI);
                this.drawTile(anim.row, anim.col, anim.value, scale);

                return true;
            }
            return false;
        });

        // Draw new tile animations
        this.newTileAnimations = this.newTileAnimations.filter(anim => {
            const elapsed = now - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);

            if (progress < 1) {
                hasActiveAnimations = true;

                // Scale up effect for new tiles with bounce
                const scale = this.easeOutBack(progress);
                this.drawTile(anim.row, anim.col, anim.value, scale);

                return true;
            }
            return false;
        });

        // Draw particles
        this.drawParticles();

        // Continue animation if there are active animations or particles
        if (hasActiveAnimations || this.particles.length > 0) {
            requestAnimationFrame(() => this.animateFrame());
        } else {
            this.isAnimating = false;
            this.render(); // Final render
        }
    }

    // Easing functions for smooth animations
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    // Handle window resize
    resize() {
        this.setupCanvas();
        this.render();
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.canvasGame) {
        window.canvasGame.resize();
    }
});



```
改动最小的情况下兼容这个网站，只是传输棋盘信号给我们的项目，达到获取到棋盘的布局，不是修改网页或者拦截数据，获取到棋盘布局，然后使用原项目的算法进行模拟人类按下键盘的上下左右

## 注意

- 请不要在代码中混杂你的修改描述，只修复代码，改了哪里你直接告诉我就可以了
- 代码/注释中不要有AI语义/结构化输出
- 修复完毕以后给我项目中修复/优化后的代码文件的完整代码（改动不大的告诉我改哪里就可以了，我去改就行，例如改动的只有两三个方法/函数）
- 使用最优的算法，避免冗余/重复代码
- 所有的代码/算法都要是完整的代码/算法，禁止出现简化或者简写
- 代码风格要完全一致，代码逻辑要足够严谨，功能设计要足够完善
- 能用三方库的功能全部使用三方库编写，减少代码量（重点！）
- 如果缺少文件（我漏发文件代码）请告诉我，我补发给你
- 严格按照上面的任务逐条排查修复/优化/修复
- 已经做了的，已经存在的功能代码就不需要管了，不完整，或者直接没有的代码必须补全
- 修改尽量不要改动原有代码，样式，布局，除非必须改动，否则请尽量避免改动（重点）
