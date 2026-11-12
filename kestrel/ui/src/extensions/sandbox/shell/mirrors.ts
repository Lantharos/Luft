import { answeredRequests } from '../../api/v1/core/peers.js';
import type { ApiContext } from '../../api/v1/core/context.js';
import type { Capability, Disposable, MediaPlayer } from '../../api/v1/types.js';
import type { Api } from './served.js';

interface Mirror {
  area: string;
  needs?: Capability;
  read(api: Api, context: ApiContext): unknown;
  watch(api: Api, context: ApiContext, changed: () => void): Disposable[];
}

function player({ id, app, appName, title, artist, album, artwork, playing, length, canGoNext, canGoPrevious, canSeek }: MediaPlayer) {
  return { id, app, appName, title, artist, album, artwork, playing, length, canGoNext, canGoPrevious, canSeek };
}

const MIRRORS: Mirror[] = [
  { area: 'session', read: api => ({ active: api.session.active }), watch: (api, _, changed) => [api.session.onChanged(changed)] },
  { area: 'desktop', read: api => ({ wallpaperVisible: api.desktop.wallpaperVisible }), watch: (api, _, changed) => [api.desktop.onChanged(changed)] },
  { area: 'power', read: ({ power }) => ({ onBattery: power.onBattery, saving: power.saving }), watch: (api, _, changed) => [api.power.onChanged(changed)] },
  {
    area: 'appearance',
    read: ({ appearance: { accent, wallpaperAccent, dark, colors, font, textScale, squareCorners, reducedMotion } }) =>
      ({ accent, wallpaperAccent, dark, colors, font, textScale, squareCorners, reducedMotion }),
    watch: (api, _, changed) => [api.appearance.onChanged(changed)],
  },
  { area: 'peers', read: () => answeredRequests(), watch: (api, _, changed) => [api.peers.onChanged(changed)] },
  {
    area: 'notifications', needs: 'notifications',
    read: api => ({ heldBack: api.notifications.heldBack }), watch: (api, _, changed) => [api.notifications.onHeldBackChanged(changed)],
  },
  {
    area: 'doNotDisturb', needs: 'do-not-disturb',
    read: api => ({ holding: api.doNotDisturb.holding }), watch: (api, _, changed) => [api.doNotDisturb.onChanged(changed)],
  },
  {
    area: 'calls', needs: 'calls',
    read: ({ calls: { active, microphone, camera } }) => ({ active, microphone, camera }), watch: (api, _, changed) => [api.calls.onChanged(changed)],
  },
  {
    area: 'media', needs: 'media',
    read: ({ media }) => ({
      player: media.player?.id ?? null,
      players: media.players.map(player),
      output: { volume: media.output.volume, muted: media.output.muted, devices: media.output.devices },
    }),
    watch: (api, _, changed) => [api.media.onChanged(changed), api.media.output.onChanged(changed)],
  },
  {
    area: 'shortcuts', needs: 'shortcuts',
    read: (api, { manifest }) => Object.fromEntries((manifest.shortcuts ?? []).map(({ key }) => [key, api.shortcuts.label(key)])),
    watch: (_, { scope, store }, changed) => [scope.disposable(store.watchShortcuts(changed))],
  },
];

export class Mirrors {
  private readonly known = new Map<string, string>();

  constructor(private readonly api: Api, private readonly context: ApiContext, private readonly granted: ReadonlySet<Capability>) {}

  snapshot(): Record<string, unknown> {
    return Object.fromEntries(this.mirrors().map(mirror => {
      const value = mirror.read(this.api, this.context);
      this.known.set(mirror.area, JSON.stringify(value));
      return [mirror.area, value];
    }));
  }

  follow(changed: (area: string, value: unknown) => void): void {
    for (const mirror of this.mirrors()) {
      mirror.watch(this.api, this.context, () => {
        const value = mirror.read(this.api, this.context);
        const encoded = JSON.stringify(value);
        if (this.known.get(mirror.area) === encoded) return;
        this.known.set(mirror.area, encoded);
        changed(mirror.area, value);
      });
    }
  }

  private mirrors(): Mirror[] {
    return MIRRORS.filter(mirror => !mirror.needs || this.granted.has(mirror.needs));
  }
}
