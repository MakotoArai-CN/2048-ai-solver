import type { CachedWasm } from './types';

// ==================== 编译时常量声明 ====================
declare const __BUILD_MODE__: 'online' | 'offline';
declare const __INLINE_WASM__: string | null;

// ==================== 在线模式配置 ====================
const WASM_SOURCES = [
  'https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://wget.la/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://hk.gh-proxy.com/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://hub.glowp.xyz/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://ghfast.top/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://ghproxy.net/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://gh.catmak.name/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://g.blfrp.cn/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm',
  'https://github.3x25.com/https://github.com/MakotoArai-CN/2048-ai-solver/blob/a25a346e55ec5298080bfc445214c1a239b39b8e/public/ai.wasm'
];

const CACHE_KEY = '2048_wasm_cache';
const WASM_VERSION = '1.0.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

// ==================== Base64 解码工具 ====================
/**
 * 将 Base64 字符串转换为 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

// ==================== IndexedDB 缓存（仅在线模式使用） ====================
/**
 * 使用 IndexedDB 缓存 WASM
 */
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
        
        // 检查缓存是否过期
        if (Date.now() - cached.timestamp > CACHE_DURATION) {
          console.log('🗑️ WASM 缓存已过期，需要重新下载');
          this.delete();
          resolve(null);
          return;
        }
        
        // 检查版本
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

// ==================== 在线模式下载函数 ====================
/**
 * 使用 GM_xmlhttpRequest 下载 WASM（避免跨域）
 */
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

/**
 * 在线模式：从远程源下载 WASM
 */
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
      
      // 保存到缓存
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

/**
 * 离线模式：使用内联的 WASM
 */
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

// ==================== 主加载函数 ====================
/**
 * 加载 WASM 模块（自动根据编译模式选择策略）
 */
export async function loadWasm(): Promise<ArrayBuffer> {
  console.log(`🎯 加载模式: ${__BUILD_MODE__.toUpperCase()}`);
  
  if (__BUILD_MODE__ === 'offline') {
    // 离线模式：同步返回内联的 WASM
    return loadWasmOffline();
  } else {
    // 在线模式：从远程下载或使用缓存
    return loadWasmOnline();
  }
}

/**
 * 清除 WASM 缓存（仅在线模式有效）
 */
export async function clearWasmCache(): Promise<void> {
  if (__BUILD_MODE__ === 'offline') {
    console.warn('⚠️ 离线模式不使用缓存，无需清除');
    return;
  }
  
  const cache = new WasmCache();
  await cache.delete();
  console.log('🗑️ WASM 缓存已清除');
}