import { afterModifiersAreReleased } from '../../../../shared/input/modifiers.js';
import { typingActivity } from '../../../../system/capture/privacy/typing.js';
import type { ApiContext } from '../core/context.js';
import type { Typing } from '../types.js';

export function typingApi(context: ApiContext): Typing {
  const { host, gestures, manifest, scope } = context;
  return {
    type: text => {
      if (!text || !gestures.recent) return false;
      context.popups.closePanels();
      afterModifiersAreReleased(() => {
        if (!scope.open) return;
        host.type(text);
        typingActivity.typed(manifest.id, context.name, () => context.openSettings());
      });
      return true;
    },
  };
}
