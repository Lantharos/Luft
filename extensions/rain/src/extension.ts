import type { Enable, LayerDisplay } from '@luft/extension-api';

import { DECLARATIONS, MAX_SURFACES, SHADER } from './shader.js';
import { RainSound } from './sound.js';
import { fitSurfaces } from './surfaces.js';
import { type Intensity, LABELS, WEATHER } from './weather.js';

type Granted = 'wallpaper' | 'quick-settings' | 'helper';

const BUILD_UP_S = 1.6;
const WIND_DOWN_S = 1.2;
const DRY = 0.002;

function tint(hex: string): number[] {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
}

function paint(display: LayerDisplay, time: number, density: number, wind: number, color: number[]): void {
  const rects = fitSurfaces(display.windows);
  const values = new Array<number>(MAX_SURFACES * 4).fill(0);
  rects.forEach((rect, index) => values.splice(index * 4, 4, rect.x, rect.y, rect.width, rect.height));
  const bar = display.taskbar;
  display.uniform('rain_time', time);
  display.uniform('rain_density', density);
  display.uniform('rain_wind', wind);
  display.uniform('rain_tint', ...color);
  display.uniform('rain_count', rects.length);
  display.uniformArray('rain_rects', 4, values);
  display.uniform('rain_bar', ...bar ? [bar.x, bar.y, bar.width, bar.height] : [0, 0, 0, 0]);
}

const enable: Enable<Granted> = rain => {
  const { settings } = rain;
  const intensity = () => settings.get<Intensity>('intensity');
  const raining = () => settings.get<boolean>('rain') && settings.get<boolean>('visible');
  const color = () => {
    const chosen = settings.get<string>('color');
    return tint(chosen === 'accent' ? rain.appearance.accent : chosen);
  };
  let density = 0;

  const layer = rain.wallpaper.addLayer({
    declarations: DECLARATIONS,
    shader: SHADER,
    active: raining(),
    frame: ({ time, elapsed, displays }) => {
      const weather = WEATHER[intensity()];
      const target = raining() ? weather.density : 0;
      density += (target - density) * (1 - Math.exp(-elapsed / (target > density ? BUILD_UP_S : WIND_DOWN_S)));
      if (!raining() && density <= DRY) {
        density = 0;
        layer.active = false;
      }
      const gust = 1 + 0.35 * Math.sin(time * 0.21) + 0.15 * Math.sin(time * 0.73 + 1.3);
      const tinted = color();
      for (const display of displays) paint(display, time, density, weather.wind * gust, tinted);
    },
  });

  const toggle = rain.quickSettings.addToggle({
    title: rain.t('rain'),
    icon: 'weather-showers-symbolic',
    setting: 'rain',
    menu: [{ setting: 'intensity' }, 'separator', { setting: 'visible' }, { setting: 'sound' }, { setting: 'volume' }, 'separator', 'settings'],
  });

  const sync = () => {
    layer.active = raining() || density > DRY;
    toggle.update({ subtitle: settings.get<boolean>('rain') ? rain.t(LABELS[intensity()]) : null });
  };
  sync();
  settings.onChanged(sync);
  new RainSound(rain);
};

export default enable;
