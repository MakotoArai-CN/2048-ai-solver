export type Direction = 0 | 1 | 2 | 3;

export type Grid = number[][];

export type Row = number;

export type SpeedMode = 'auto' | 30 | 90 | 180 | 360 | 500;

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