import type St from 'gi://St';

import { Registry } from '../../../shared/registry.js';

export interface ElementLayout {
  vertical: boolean;
  thickness: number;
  button: number;
  icon: number;
}

export interface ElementActor {
  readonly actor: St.Widget;
  relayout(layout: ElementLayout): void;
  destroy(): void;
}

interface TaskbarElementEntry {
  readonly id: string;
  readonly label: string;
  create(layout: ElementLayout): ElementActor;
  watch(changed: () => void): () => void;
}

export const taskbarElements = new Registry<TaskbarElementEntry>();
