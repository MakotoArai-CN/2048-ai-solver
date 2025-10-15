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
      console.log(`   - 总移动: ${this.totalMoves} 次`);
      console.log(`   - 耗时: ${elapsed.toFixed(1)} 秒`);
      console.log(`   - 平均速度: ${avgSpeed.toFixed(2)} 步/秒`);
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
          // 棋盘未变化，检查超时
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
            // 显示倒计时
            console.warn(`⚠️ 棋盘未变化 (${remainingSeconds}秒后停止)`);
          }
        } else {
          console.log('✅ 棋盘已更新');
          this.lastGrid = currentGridStr;
          this.lastChangeTime = currentTime;
          this.totalMoves++;
        }
      }
      
      // 检查游戏是否结束
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
      
      // 计算最佳移动
      const maxTile = Math.max(...grid.flat());
      const noChangeTime = currentTime - this.lastChangeTime!;
      const remainingSeconds = Math.ceil((this.NO_CHANGE_TIMEOUT - noChangeTime) / 1000);
      
      if (noChangeTime > 2000) {  // 超过2秒开始显示倒计时
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
      
      // ⚠️ 出错也检查超时
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