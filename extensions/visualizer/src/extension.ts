import type { Enable, LayerDisplay } from '@luft/extension-api';

import { describePage } from './page.js';
import { BANDS, DECLARATIONS, SHADER, STYLES, type Style } from './shader.js';
import { Spectrum } from './spectrum.js';

type Granted = 'wallpaper' | 'audio-levels';

const REACH = 0.3;
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

  const color = () => {
    const chosen = settings.get<string>('color');
    if (chosen === 'accent') return rgb(appearance.accent);
    if (chosen === 'wallpaper') return rgb(appearance.wallpaperAccent);
    return rgb(chosen);
  };
  let tint = color();

  const paint = (display: LayerDisplay, time: number, strength: number) => {
    const bar = display.taskbar;
    const alongBottom = !!bar && bar.width > bar.height && bar.y + bar.height >= display.height - 1;
    display.uniformArray('vis_bands', 1, spectrum.bands);
    display.uniform('vis_floor', alongBottom ? display.height - bar!.y : 0);
    display.uniform('vis_level', spectrum.level);
    display.uniform('vis_time', time);
    display.uniform('vis_height', Math.round(display.height * REACH));
    display.uniform('vis_strength', strength);
    display.uniform('vis_style', STYLES[settings.get<Style>('style')]);
    display.uniform('vis_color', ...tint);
  };

  const layer = visualizer.wallpaper.addLayer({
    declarations: DECLARATIONS,
    shader: SHADER,
    depth: 'below-windows',
    active: audioLevels.playing,
    area: ({ primary, width, height }) => settings.get('displays') === 'primary' && !primary ? null : {
      x: 0, y: Math.round(height * (1 - REACH)), width, height: Math.round(height * REACH),
    },
    frame: ({ time, elapsed, displays }) => {
      spectrum.follow(listener.read(), elapsed);
      presence = audioLevels.playing ? Math.min(1, presence + elapsed / FADE_IN_S) : presence;
      if (!audioLevels.playing && spectrum.energy < SETTLED) {
        presence = 0;
        layer.active = false;
      }
      const strength = presence * settings.get<number>('intensity');
      for (const display of displays) paint(display, time, strength);
    },
  });

  audioLevels.onPlayingChanged(() => {
    if (audioLevels.playing) layer.active = true;
  });
  appearance.onChanged(() => (tint = color()));
  settings.onChanged(key => {
    if (key === 'color') tint = color();
    if (key === 'displays') layer.reshape();
  });
  describePage(visualizer);
};

export default enable;
