import type { Grid, Direction, Row } from './types';
import { loadWasm } from './wasm-loader';

/**
 * 将网格转换为 4 个 row_t (uint16)
 */
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

/**
 * 创建内联 Worker（避免跨域问题）
 */
function createInlineWorker(wasmBuffer: ArrayBuffer): Worker {
  const workerCode = `
    // WASM 配置常量
    const WASM_PAGE_SIZE = 65536;
    const INITIAL_MEMORY = 134217728; // 128MB
    
    let wasmModule = null;
    let wasmMemory = null;
    let HEAP32 = null;
    
    // Emscripten 运行时函数
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
      // 在 Worker 中不执行脚本
      console.log('[Worker] emscripten_run_script called');
    }
    
    // 更新堆视图
    function updateGlobalBufferViews(buf) {
      HEAP32 = new Int32Array(buf);
    }
    
    // 消息处理
    onmessage = async (e) => {
      if (e.data.type === 'init') {
        try {
          // 1. 创建 WebAssembly.Memory
          wasmMemory = new WebAssembly.Memory({
            initial: INITIAL_MEMORY / WASM_PAGE_SIZE,
            maximum: INITIAL_MEMORY / WASM_PAGE_SIZE
          });
          
          updateGlobalBufferViews(wasmMemory.buffer);
          
          // 2. 构建导入对象 - 关键：必须匹配 Emscripten 的命名空间结构
          //    Import namespace "a" 包含：
          //    - Import #0 "a" "b" -> _abort
          //    - Import #1 "a" "c" -> _clock_gettime  
          //    - Import #2 "a" "d" -> _emscripten_run_script
          //    - Import #3 "a" "a" -> wasmMemory (Memory 对象)
          const importObject = {
            a: {
              b: _abort,
              c: _clock_gettime,
              d: _emscripten_run_script,
              a: wasmMemory  // 直接传入 Memory 对象，而不是包装对象
            }
          };
          
          // 3. 实例化 WASM
          const wasmBytes = new Uint8Array(e.data.wasmBuffer);
          const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
          
          wasmModule = instance.exports;
          
          // 4. 调用初始化函数
          // f -> ___wasm_call_ctors (ATINIT 构造函数)
          if (wasmModule.f) {
            wasmModule.f();
          }
          
          // h -> main (设置内部状态)
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
          // g -> _jsWork(row1, row2, row3, row4, dir)
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
    
    // 错误处理
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
  
  // 发送 WASM 数据
  worker.postMessage({ type: 'init', wasmBuffer });
  
  return worker;
}

/**
 * 2048 求解器（使用 WASM）
 */
export class Solver {
  private workers: Worker[] = [];
  private wasmReady = false;
  private pendingInit: Promise<void> | null = null;

  /**
   * 初始化求解器
   */
  async init(): Promise<void> {
    if (this.wasmReady) return;
    if (this.pendingInit) return this.pendingInit;
    
    this.pendingInit = (async () => {
      console.log('🔧 初始化求解器...');
      
      try {
        // 加载 WASM
        const wasmBuffer = await loadWasm();
        console.log(`📦 WASM 已加载: ${(wasmBuffer.byteLength / 1024).toFixed(1)} KB`);
        
        // 创建 4 个 Worker
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

  /**
   * 获取最佳移动
   */
  async getBestMove(grid: Grid): Promise<'up' | 'right' | 'down' | 'left'> {
    if (!this.wasmReady) {
      await this.init();
    }
    
    const board = gridToRows(grid);
    const directions: Direction[] = [0, 1, 2, 3];
    const dirNames = ['up', 'right', 'down', 'left'] as const;
    
    // 并行评估 4 个方向
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
            resolve(0); // 返回 0 分，避免影响其他方向
          }
        };
        
        worker.addEventListener('message', messageHandler);
        worker.postMessage({ type: 'work', board, dir });
        
        // 超时保护
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
    
    // 选择得分最高的方向
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

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.workers.forEach(w => {
      try {
        w.terminate();
      } catch (e) {
        // ignore
      }
    });
    this.workers = [];
    this.wasmReady = false;
    this.pendingInit = null;
  }

  /**
   * 销毁求解器
   */
  destroy(): void {
    console.log('🗑️ 销毁求解器');
    this.cleanup();
  }
}