import type { Enable } from '@luft/extension-api';

import { custom, showPictures } from './custom/effect.js';
import { ImpactSound } from './custom/impact.js';
import { Presets } from './custom/presets.js';
import { fireflies } from './effects/fireflies.js';
import { fog } from './effects/fog.js';
import { leaves } from './effects/leaves.js';
import { rain } from './effects/rain.js';
import { snow } from './effects/snow.js';
import { OutsideWatch } from './scene/outside.js';
import { type Choice, type EffectName, type Intensity, resolve, type Scene } from './scene/scene.js';
import { describePage } from './page.js';
import { Sky } from './sky.js';
import { RainSound } from './sound.js';

type Granted = 'wallpaper' | 'quick-settings' | 'weather' | 'sounds' | 'calls';

const ICONS: Record<EffectName, string> = {
  rain: 'weather-showers-symbolic',
  snow: 'weather-snow-symbolic',
  leaves: 'icons/leaves-symbolic.svg',
  fireflies: 'icons/fireflies-symbolic.svg',
  fog: 'weather-fog-symbolic',
  custom: 'icons/custom-symbolic.svg',
};

const RAIN_LABELS: Record<Intensity, string> = { light: 'drizzle', steady: 'rain', heavy: 'storm' };

function tint(hex: string): number[] {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
}

const enable: Enable<Granted> = seasons => {
  const { settings, appearance, desktop, power } = seasons;
  const on = () => settings.get<boolean>('on');
  const choice = () => settings.get<Choice>('effect');
  const following = () => choice() === 'weather' || choice() === 'season';
  const rainColor = () => {
    const chosen = settings.get<string>('color');
    return tint(chosen === 'accent' ? appearance.accent : chosen);
  };
  const fogColor = () => appearance.dark ? [0.62, 0.65, 0.7] : [0.9, 0.91, 0.93];

  const presets = new Presets(seasons);
  const sky = new Sky(seasons.wallpaper, {
    rain: rain(rainColor), snow: snow(), leaves: leaves(), fireflies: fireflies(), fog: fog(fogColor), custom: custom(() => presets.chosen),
  });
  const impact = new ImpactSound(seasons);
  let pictures = 0;
  let scene: Scene | null = null;
  const outside = new OutsideWatch(seasons, () => update());
  const sound = new RainSound(seasons, () => scene?.effect === 'rain' && !seasons.calls.active ? scene.density : null);
  const toggle = seasons.quickSettings.addToggle({
    title: seasons.t('seasons'),
    icon: ICONS.rain,
    setting: 'on',
    menu: [{ setting: 'effect' }, 'separator', { setting: 'visible' }, { setting: 'sound' }, { setting: 'volume' }, 'separator', 'settings'],
  });

  const icon = () => {
    if (scene) return ICONS[scene.effect];
    return following() ? 'weather-clear-symbolic' : ICONS[choice() as EffectName];
  };

  const subtitle = () => {
    if (!on()) return null;
    if (!scene) return seasons.t(choice() === 'custom' ? 'custom-empty' : 'calm');
    if (scene.effect === 'custom') return presets.chosen!.name;
    if (scene.effect === 'rain' && !following()) return seasons.t(RAIN_LABELS[settings.get<Intensity>('intensity')]);
    return seasons.t(scene.effect);
  };

  const sceneNow = (): Scene | null => {
    if (!on()) return null;
    if (choice() !== 'custom') return resolve(choice(), settings.get<Intensity>('intensity'), outside.current);
    const preset = presets.chosen;
    return preset && pictures ? { effect: 'custom', density: preset.amount, wind: preset.wind } : null;
  };

  const update = () => {
    outside.follow(on() && following());
    scene = sceneNow();
    const visible = settings.get<boolean>('visible');
    sky.show(visible ? scene : null, settings.get<boolean>('part') && desktop.wallpaperVisible && !appearance.reducedMotion && !power.saving);
    sound.sync();
    impact.sync(visible && scene?.effect === 'custom' && desktop.wallpaperVisible && !seasons.calls.active ? presets.chosen : null);
    toggle.update({ subtitle: subtitle(), icon: icon() });
  };
  const picturesChanged = () => {
    pictures = showPictures(sky.layer('custom'), presets.chosen);
    update();
  };
  picturesChanged();
  settings.onChanged(update);
  for (const source of [desktop, appearance, power]) source.onChanged(update);
  seasons.calls.onChanged(update);
  presets.watch(picturesChanged);
  describePage(seasons, presets, () => {
    settings.set('effect', 'custom');
    settings.set('visible', true);
    settings.set('on', true);
  });
};

export default enable;
