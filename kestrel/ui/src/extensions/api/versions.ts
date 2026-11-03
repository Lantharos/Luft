import type { ApiContext } from './v1/context.js';
import { createApi as createV1 } from './v1/create.js';

/** Every extension API version this Kestrel runs. A new version gets its own folder next to `v1` and an entry here. */
export const API_VERSIONS: Record<number, (context: ApiContext) => object> = {
  1: createV1,
};
