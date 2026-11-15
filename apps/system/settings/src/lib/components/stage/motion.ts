import { createContext } from 'svelte';
import type { PageMotion } from '@luft/ui';

export const [pageMotion, providePageMotion] = createContext<PageMotion>();
