import type Clutter from 'gi://Clutter';

import type { Box } from './placement.js';

export interface TextInput {
  readonly caret: Box | null;
  readonly currentFocus: Clutter.InputFocus | null;
  commit(text: string): void;
  interceptKeys(interceptor: ((event: Clutter.Event) => boolean) | null): void;
}
