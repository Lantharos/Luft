import type Clutter from 'gi://Clutter';

import type { Box } from '../layout/placement.js';

export interface TextInput {
  readonly caret: Box | null;
  readonly currentFocus: Clutter.InputFocus | null;
  readonly hidesTyping: boolean;
  commit(text: string): void;
  showPreedit(text: string | null): void;
  getSurroundingText(): [string | null, number, number];
  request_surrounding(): void;
  delete_surrounding(offset: number, length: number): void;
  interceptKeys(interceptor: ((event: Clutter.Event) => boolean) | null): void;
  connect(signal: 'focus-changed' | 'surrounding-text-set', callback: () => void): number;
  disconnect(id: number): void;
}
