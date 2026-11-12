import type {
  Clipboard, DoNotDisturb, HeldNotifications, Location, Network, NotificationHold, Response, Shortcuts, Weather,
} from '../../api/v1/types.js';
import { type HostContext, Listeners, made, watching } from './basics.js';

export function doNotDisturbApi(context: HostContext): DoNotDisturb {
  const { link, scope } = context;
  return {
    hold: () => {
      let held: readonly HeldNotifications[] = [];
      let holding = true;
      const changed = new Listeners(scope);
      const ref = link.make('doNotDisturb.hold', [], state => {
        held = state.held as HeldNotifications[];
        changed.emit();
      });
      const end = (name: 'dispose' | 'release') => {
        if (holding) link.end(ref, name);
        holding = false;
      };
      const handle = scope.disposable(() => end('dispose'));
      const hold: NotificationHold = {
        get held() {
          return held;
        },
        onHeld: listener => changed.add(listener),
        release: () => {
          end('release');
          handle.dispose();
          return held;
        },
        dispose: () => handle.dispose(),
      };
      return hold;
    },
    get holding() {
      return link.mirror<{ holding: boolean }>('doNotDisturb').holding;
    },
    onChanged: watching(context, 'doNotDisturb'),
  };
}

export const weatherApi = (context: HostContext): Weather => ({
  current: () => context.link.ask('weather.current'),
  onChanged: changed => made(context, 'weather.onChanged', [changed]),
});

export const locationApi = (context: HostContext): Location => ({
  current: () => context.link.ask('location.current'),
  onChanged: changed => made(context, 'location.onChanged', [changed]),
});

export const networkApi = ({ link }: HostContext): Network => ({
  fetch: async (url, options) => {
    const { status, ok, headers, text } = await link.ask<Omit<Response, 'json'>>('network.fetch', [url, options]);
    return { status, ok, headers, text, json: <Value>() => JSON.parse(text) as Value };
  },
});

export const clipboardApi = ({ link }: HostContext): Clipboard => ({
  setText: text => link.call('clipboard.setText', [text]),
  setImage: path => link.ask('clipboard.setImage', [path]),
  setFiles: paths => link.call('clipboard.setFiles', [paths]),
});

export function shortcutsApi(context: HostContext): Shortcuts {
  const known = (key: string) => {
    if (!context.manifest.shortcuts?.some(shortcut => shortcut.key === key)) throw new Error(`${key} isn't a shortcut in extension.toml`);
  };
  return {
    onActivated: (key, activated) => {
      known(key);
      return made(context, 'shortcuts.onActivated', [key, activated]);
    },
    label: key => {
      known(key);
      return context.link.mirror<Record<string, string | null>>('shortcuts')[key] ?? null;
    },
  };
}
