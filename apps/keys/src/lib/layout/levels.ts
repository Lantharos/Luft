import type { Symbol } from '#lib/bindings.js';

export type Levels = [Symbol, Symbol, Symbol, Symbol];

export const EMPTY: Symbol = { keysym: '', text: '', kind: 'empty' };
