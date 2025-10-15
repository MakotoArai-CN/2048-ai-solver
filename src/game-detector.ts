import type { GameState, Grid } from './types';

/**
 * 检测页面中的 2048 游戏实例
 */
export function detectGame(): GameState | null {
  try {
    // 方法1: 检测 Vue 实例（原神活动页面）
    const elements = document.querySelectorAll('*');
    
    // 使用 Array.from 或传统 for 循环避免迭代器问题
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
    
    // 方法2: 检测经典 2048 游戏
    const tiles = document.querySelectorAll('.tile');
    if (tiles.length > 0) {
      const grid: Grid = Array(4).fill(0).map(() => Array(4).fill(0));
      
      // 使用传统 for 循环
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
    
    // 方法3: 检测其他可能的游戏容器
    const gameContainers = [
      document.querySelector('.game-container'),
      document.querySelector('#game-container'),
      document.querySelector('[class*="game"]'),
      document.querySelector('.board'),
    ];
    
    for (let i = 0; i < gameContainers.length; i++) {
      const container = gameContainers[i];
      if (container) {
        // 尝试从容器中提取网格数据
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

/**
 * 从容器元素中提取网格数据
 */
function extractGridFromContainer(container: Element): GameState | null {
  try {
    // 查找所有可能的网格单元
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
        // 简单的位置推断（可能需要根据实际情况调整）
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

/**
 * 获取当前游戏状态
 */
export function getCurrentGrid(): Grid | null {
  const state = detectGame();
  return state?.gridData ?? null;
}

/**
 * 等待游戏加载（轮询检测）
 */
export async function waitForGame(timeout = 10000): Promise<GameState | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const game = detectGame();
    if (game) {
      console.log('✅ 检测到游戏:', game);
      return game;
    }
    
    // 每 500ms 检测一次
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.warn('⚠️ 游戏检测超时');
  return null;
}

/**
 * 监听 DOM 变化，自动检测游戏
 */
export function observeGame(callback: (state: GameState) => void): () => void {
  let lastState: GameState | null = null;
  
  const check = () => {
    const state = detectGame();
    if (state && (!lastState || JSON.stringify(state.gridData) !== JSON.stringify(lastState.gridData))) {
      lastState = state;
      callback(state);
    }
  };
  
  // 初始检测
  check();
  
  // 定期检测
  const intervalId = window.setInterval(check, 1000);
  
  // 监听 DOM 变化
  const observer = new MutationObserver(check);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
  
  // 返回清理函数
  return () => {
    clearInterval(intervalId);
    observer.disconnect();
  };
}