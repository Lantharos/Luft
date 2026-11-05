import type { Enable, LayerDisplay } from '@luft/extension-api';

import { type Edge, edgeAreas, type Placement, strip } from './edges.js';
import { describePage } from './page.js';
import { BANDS, DECLARATIONS, SHADER, STYLES, type Style } from './shader.js';
import { Spectrum } from './spectrum.js';

type Granted = 'wallpaper' | 'audio-levels';

const SETTLED = 0.004;
const FADE_IN_S = 0.8;

function rgb(hex: string): number[] {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
}

const enable: Enable<Granted> = visualizer => {
  const { settings, appearance, audioLevels } = visualizer;
  const spectrum = new Spectrum();
  const listener = audioLevels.listen(BANDS);
  let presence = 0;
  const placed = (): Placement => ({ edges: settings.get<readonly Edge[]>('edges'), reach: settings.get<number>('reach') });
  let placement = placed();

  const color = () => {
    const chosen = settings.get<string>('color');
    if (chosen === 'accent') return rgb(appearance.accent);
    if (chosen === 'wallpaper') return rgb(appearance.wallpaperAccent);
    return rgb(chosen);
  };
  let tint = color();

  const paint = (display: LayerDisplay, moment: readonly number[]) => {
    display.uniformArray('vis_bands', 1, spectrum.bands);
    display.uniformArray('vis_strip', 4, strip(placement, placement.edges[display.part], display));
    display.uniform('vis_moment', ...moment);
    display.uniform('vis_color', ...tint);
  };

  const layer = visualizer.wallpaper.addLayer({
    declarations: DECLARATIONS,
    shader: SHADER,
    depth: 'below-windows',
    active: audioLevels.playing,
    area: display => settings.get('displays') === 'primary' && !display.primary ? null : edgeAreas(placement, display),
    frame: ({ time, elapsed, displays }) => {
      spectrum.follow(listener.read(), elapsed);
      presence = audioLevels.playing ? Math.min(1, presence + elapsed / FADE_IN_S) : presence;
      if (!audioLevels.playing && spectrum.energy < SETTLED) {
        presence = 0;
        layer.active = false;
      }
      const moment = [spectrum.level, time, presence * settings.get<number>('intensity'), STYLES[settings.get<Style>('style')]];
      for (const display of displays) paint(display, moment);
    },
  });

  audioLevels.onPlayingChanged(() => {
    if (audioLevels.playing) layer.active = true;
  });
  appearance.onChanged(() => (tint = color()));
  settings.onChanged(key => {
    if (key === 'color') tint = color();
    if (key === 'edges' || key === 'reach') placement = placed();
    if (key === 'edges' || key === 'reach' || key === 'displays') layer.reshape();
  });
  describePage(visualizer);
};

export default enable;
