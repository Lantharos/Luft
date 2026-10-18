import type Clutter from 'gi://Clutter';

import type { Box } from '../placement.js';

export interface TextInput {
  readonly caret: Box | null;
  readonly currentFocus: Clutter.InputFocus | null;
  commit(text: string): void;
  showPreedit(text: string | null): void;
  interceptKeys(interceptor: ((event: Clutter.Event) => boolean) | null): void;
}
