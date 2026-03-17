import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 从命令行参数中解析 -m 或 --mode 参数
const args = process.argv.slice(2);
let buildMode = 'online'; // 默认为 online 模式

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '-m' || args[i] === '--mode') && args[i + 1]) {
    buildMode = args[i + 1].toLowerCase();
    break;
  }
}

// 也支持环境变量
if (process.env.BUILD_MODE) {
  buildMode = process.env.BUILD_MODE.toLowerCase();
}

// 验证模式
if (!['online', 'offline'].includes(buildMode)) {
  console.warn(`⚠️  未知的构建模式: ${buildMode}，使用默认的 online 模式`);
  buildMode = 'online';
}

console.log(`\n🔧 构建模式: ${buildMode.toUpperCase()}`);

/**
 * 读取 WASM 文件并转换为 Base64
 */
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
    // 注入编译时常量
    __BUILD_MODE__: JSON.stringify(buildMode),
    __INLINE_WASM__: loadWasmAsBase64(),
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: buildMode === 'offline', // offline 模式移除 console
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
          // WASM 相关
          'wasmModule',
          'wasmMemory',
          'HEAP32',
          'Module',
          
          // 油猴 API
          'GM_xmlhttpRequest',
          'GM_setValue',
          'GM_getValue',
          'GM_deleteValue',
          'GM_registerMenuCommand',
          'GM_notification',
          'unsafeWindow',
          
          // 全局标识
          '__2048_SOLVER_INSTANCE__',
          '__2048_SOLVER_INITIALIZED__',
          
          // 编译时常量
          '__BUILD_MODE__',
          '__INLINE_WASM__',
          
          // Shadow DOM
          'shadowRoot',
          'attachShadow',
          
          // 重要的类名和方法
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
        version: '1.0.1',
        description: buildMode === 'offline' 
          ? '使用 WebAssembly 加速的 2048 AI求解器（离线版，无需联网）'
          : '使用 WebAssembly 加速的 2048 AI求解器，支持合成丘丘王',
        author: 'MakotoArai',
        match: [
          '*://*.mihoyo.com/*/event/*/index.html*',
          '*://act.hoyoverse.com/*/event/*/index.html*',
          '*://play2048.co/*',
          '*://2048game.com/*',
        ],
        include: [
          '*://*2048*/*',
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
        // online 模式才需要 connect
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