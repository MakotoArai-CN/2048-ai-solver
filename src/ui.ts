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
    
    // 创建容器并附加Shadow DOM
    this.container = document.createElement('div');
    this.container.setAttribute('data-solver-ui', 'true');
    this.container.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
    
    // 使用closed模式，完全隐藏Shadow DOM
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    
    this.render();
    this.attachEventListeners();
    
    // 添加到页面
    document.documentElement.appendChild(this.container);
  }

  private render(): void {
    this.shadowRoot.innerHTML = `
      <style>
        /* 重置所有样式，确保不受外部影响 */
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

    // 开始按钮
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      status.className = 'status status-running';
      this.updateStatusText('运行中...');
      this.callbacks.onStart();
    });

    // 停止按钮
    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.resetButtons();
      status.className = 'status status-stopped';
      this.updateStatusText('已停止');
      this.callbacks.onStop();
    });

    // 关闭按钮
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.destroy();
    });

    // 最小化按钮
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('minimized');
      minimizeBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
    });

    // 拖动功能
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
      
      // 限制在视口内
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

    // 防止拖动时选中文本
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

// 导出的工厂函数
let currentUI: IsolatedUI | null = null;

export function createUI(onStart: () => void, onStop: () => void): void {
  // 严格的单例检查
  if (currentUI) {
    console.warn('⚠️ UI已存在，跳过创建');
    return;
  }
  
  // 检查DOM中是否已存在UI
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
  
  // 清理可能残留的DOM元素
  const existingUI = document.querySelector('[data-solver-ui="true"]');
  if (existingUI) {
    existingUI.remove();
  }
}