interface UICallbacks {
  onStart: () => void;
  onStop: () => void;
  onDestroy?: () => void;
}

type ThemeMode = 'light' | 'dark';

class IsolatedUI {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private callbacks: UICallbacks;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private themeMode: ThemeMode = 'light';
  private themeMql: MediaQueryList | null = null;

  constructor(callbacks: UICallbacks) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.setAttribute('data-solver-ui', 'true');
    this.container.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 20px; right: 20px;';
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.detectTheme();
    this.render();
    this.attachEventListeners();
    document.documentElement.appendChild(this.container);
  }

  private detectTheme(): void {
    this.themeMql = window.matchMedia('(prefers-color-scheme: dark)');
    this.themeMode = this.themeMql.matches ? 'dark' : 'light';
    this.themeMql.addEventListener('change', (e) => {
      this.themeMode = e.matches ? 'dark' : 'light';
      this.applyTheme();
    });
  }

  private applyTheme(): void {
    const panel = this.shadowRoot.getElementById('panel');
    if (panel) {
      panel.setAttribute('data-theme', this.themeMode);
    }
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
        }

        .panel {
          --bg: #ffffff;
          --bg-secondary: #f0f4f8;
          --text: #1a1a2e;
          --text-secondary: #64748b;
          --border: #e2e8f0;
          --accent: #6366f1;
          --accent-hover: #4f46e5;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --shadow: rgba(0, 0, 0, 0.08);
          --shadow-lg: rgba(0, 0, 0, 0.12);

          background: var(--bg);
          color: var(--text);
          padding: 16px;
          border-radius: 14px;
          min-width: 230px;
          box-shadow: 0 4px 24px var(--shadow-lg), 0 1px 4px var(--shadow);
          cursor: move;
          user-select: none;
          border: 1px solid var(--border);
          z-index: 9999999999;
          transition: background 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
        }

        .panel[data-theme="dark"] {
          --bg: #1e1e2e;
          --bg-secondary: #2a2a3e;
          --text: #e2e8f0;
          --text-secondary: #94a3b8;
          --border: #3a3a52;
          --accent: #818cf8;
          --accent-hover: #6366f1;
          --shadow: rgba(0, 0, 0, 0.3);
          --shadow-lg: rgba(0, 0, 0, 0.4);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .panel-title {
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text);
        }

        .title-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--accent);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
        }

        .header-actions {
          display: flex;
          gap: 6px;
        }

        .icon-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 26px;
          height: 26px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          line-height: 1;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .icon-btn.close-btn:hover {
          background: var(--danger);
          border-color: var(--danger);
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          outline: none;
          letter-spacing: 0.3px;
        }

        .btn:active {
          transform: scale(0.97);
        }

        .btn-start {
          background: var(--accent);
          color: #ffffff;
        }

        .btn-start:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .panel[data-theme="dark"] .btn-start:hover {
          box-shadow: 0 4px 12px rgba(129, 140, 248, 0.25);
        }

        .btn-stop {
          background: var(--danger);
          color: #ffffff;
        }

        .btn-stop:hover {
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .speed-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          padding: 8px 10px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .speed-label {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          font-weight: 500;
        }

        .speed-value {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          margin-left: auto;
          white-space: nowrap;
        }

        .speed-indicator {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          margin-right: 2px;
          animation: speed-blink 1.5s infinite;
        }

        @keyframes speed-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .status {
          margin-top: 10px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 12px;
          text-align: center;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .status-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-ready .status-dot {
          background: var(--success);
          animation: pulse 2s infinite;
        }

        .status-running .status-dot {
          background: var(--warning);
          animation: pulse 1s infinite;
        }

        .status-stopped .status-dot {
          background: var(--text-secondary);
        }

        .status-error .status-dot {
          background: var(--danger);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .panel.minimized .controls,
        .panel.minimized .status,
        .panel.minimized .speed-bar {
          display: none;
        }

        .panel.minimized {
          min-width: auto;
        }

        .panel.minimized .panel-header {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
      </style>
      <div class="panel" id="panel" data-theme="${this.themeMode}">
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-badge">AI</span>
            <span>2048 Solver</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="minimizeBtn" title="最小化">−</button>
            <button class="icon-btn close-btn" id="closeBtn" title="关闭">×</button>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-start" id="startBtn">开始求解</button>
          <button class="btn btn-stop" id="stopBtn" style="display: none;">停止</button>
        </div>
        <div class="speed-bar" id="speedBar">
          <span class="speed-label">⚡ 速度</span>
          <span class="speed-value" id="speedValue"><span class="speed-indicator"></span>自动</span>
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

  public updateSpeedDisplay(text: string): void {
    const speedValue = this.shadowRoot.getElementById('speedValue');
    if (speedValue) {
      const indicator = text === '自动' ? '<span class="speed-indicator"></span>' : '';
      speedValue.innerHTML = `${indicator}${text}`;
    }
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

export function updateSpeedDisplay(text: string): void {
  if (currentUI) {
    currentUI.updateSpeedDisplay(text);
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