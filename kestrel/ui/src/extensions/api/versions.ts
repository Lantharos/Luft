import type { ApiContext } from './v1/core/context.js';
import { createApi as createV1 } from './v1/core/create.js';

export const API_VERSIONS: Record<number, (context: ApiContext) => object> = {
  1: createV1,
};
