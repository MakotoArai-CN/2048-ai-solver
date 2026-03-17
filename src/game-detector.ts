import type { GameState, Grid } from './types';

export function detectGame(): GameState | null {
  try {
    const win = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window) as any;

    if (win.canvasGame && Array.isArray(win.canvasGame.board) && win.canvasGame.board.length === 4) {
      const board = win.canvasGame.board;
      const grid: Grid = board.map((row: number[]) => [...row]);
      return {
        gridData: grid,
        score: win.canvasGame.score ?? 0,
        maxTile: Math.max(...grid.flat()),
        isPlaying: !win.canvasGame.gameOver && !win.canvasGame.victory
      };
    }

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