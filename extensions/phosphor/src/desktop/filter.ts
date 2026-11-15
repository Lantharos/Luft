import type { DesktopFilter, Disposable, Extension } from '@luft/extension-api';

import { colorSetting, rgb } from '../color.js';
import type { Granted } from '../rules.js';
import { type Choices, passes, wanted } from './passes.js';
import { GRADES, ownGrade } from './pieces/color.js';
import { SHADED_PALETTES } from './pieces/stylize.js';

const MOVING_RATE = 30;
const GRAIN_RATE = 24;
const CURVE_REACH = 0.07;
const CURVE_STEPS = 6;
const BLOOM_REACH = 0.02;
const ABERRATION_REACH = 0.01;
const PIXEL_REACH = 0.0015;
const VHS_REACH = 0.012;
const GLITCH_REACH = 0.03;
const BURST_MS = 420;
const SECOND = 1000;

/** Where `curved` puts a point of the picture on the tube, found the way a fixed point is, since it has no closed form. */
function shownOnTube(curvature: number) {
  const bend = 0.07 * curvature;
  return (x: number, y: number): [number, number] => {
    const [sceneX, sceneY] = [x * 2 - 1, y * 2 - 1];
    let [shownX, shownY] = [sceneX, sceneY];
    for (let step = 0; step < CURVE_STEPS; step++) {
      const stretch = 1 + (shownX * shownX + shownY * shownY) * bend;
      [shownX, shownY] = [sceneX / stretch, sceneY / stretch];
    }
    return [shownX * 0.5 + 0.5, shownY * 0.5 + 0.5];
  };
}

/** Everything chosen for the whole screen as one filter, built again only when what's on changes. */
export class ScreenFilter {
  private filter: DesktopFilter | null = null;
  private shape = '';
  private nextBurst: Disposable | null = null;

  constructor(private readonly phosphor: Extension<Granted>) {}

  private choices(): Choices {
    const { settings, appearance } = this.phosphor;
    const still = appearance.reducedMotion;
    const crt = settings.get<boolean>('desktop-crt');
    const grain = settings.get<number>('screen-grain') > 0;
    return {
      crt,
      mask: settings.get<string>('crt-mask-type'),
      curved: crt && settings.get<number>('crt-curvature') > 0,
      flicker: crt && settings.get<boolean>('crt-flicker') && !still,
      invert: settings.get<string>('invert'),
      grade: settings.get<string>('grade'),
      shadows: settings.get<number>('shadow-boost') > 0,
      bloom: settings.get<number>('bloom') > 0,
      aberration: settings.get<number>('chromatic-aberration') > 0,
      pixelate: settings.get<number>('pixelate') > 1,
      palette: settings.get<string>('palette'),
      dither: settings.get<boolean>('palette-dither'),
      stylize: settings.get<string>('stylize'),
      vhs: settings.get<boolean>('vhs'),
      glitch: settings.get<boolean>('glitch-bursts') && !still,
      grain,
      grainMoving: grain && settings.get<boolean>('screen-grain-moving') && !still,
      vignette: settings.get<number>('screen-vignette') > 0,
    };
  }

  private reach({ curved, bloom, aberration, pixelate, stylize, vhs, glitch }: Choices): number {
    const { settings } = this.phosphor;
    return (curved ? settings.get<number>('crt-curvature') * CURVE_REACH : 0)
      + (bloom ? BLOOM_REACH * settings.get<number>('bloom-radius') : 0)
      + (aberration ? ABERRATION_REACH : 0)
      + (pixelate ? settings.get<number>('pixelate') * PIXEL_REACH : 0)
      + (stylize === 'halftone' ? settings.get<number>('halftone-size') * PIXEL_REACH : 0)
      + (vhs ? VHS_REACH : 0)
      + (glitch ? GLITCH_REACH : 0);
  }

  private rate(choices: Choices, still: boolean): number | false {
    if (choices.flicker || (choices.vhs && !still)) return MOVING_RATE;
    return choices.grainMoving ? GRAIN_RATE : false;
  }

  update(): void {
    const { settings, screenEffects, appearance, t } = this.phosphor;
    const choices = this.choices();
    const on = wanted(choices);
    const scope = settings.get<'screen' | 'desktop'>('filters-scope');
    const reach = this.reach(choices);
    const animated = this.rate(choices, appearance.reducedMotion);
    const shape = on ? `${JSON.stringify(choices)} ${settings.get<boolean>('filters-fullscreen')} ${scope} ${reach} ${animated}` : '';
    if (shape !== this.shape) {
      this.shape = shape;
      this.filter?.dispose();
      this.filter = !on ? null : screenEffects.addDesktopFilter({
        label: t('desktop-filters'),
        passes: passes(choices),
        warps: choices.curved,
        animated,
        fullscreen: settings.get<boolean>('filters-fullscreen'),
        captured: settings.get<boolean>('filters-captured'),
        scope,
        reach,
        shownAt: choices.curved ? shownOnTube(settings.get<number>('crt-curvature')) : undefined,
      });
    }
    this.apply(choices);
    this.burstLater(choices.glitch);
  }

  private burstLater(glitching: boolean): void {
    this.nextBurst?.dispose();
    this.nextBurst = null;
    if (!glitching || !this.filter) return;
    const gap = this.phosphor.settings.get<number>('glitch-gap') * SECOND;
    this.nextBurst = this.phosphor.timers.timeout(gap * (0.5 + Math.random()), () => {
      this.filter?.play(BURST_MS);
      this.burstLater(true);
    });
  }

  private apply({ grade, palette }: Choices): void {
    const { filter } = this;
    if (!filter) return;
    const { settings } = this.phosphor;
    const number = (key: string) => settings.get<number>(key);
    filter.setCaptured(settings.get<boolean>('filters-captured'));
    for (const [uniform, key] of [
      ['crt_scanlines', 'crt-scanlines'], ['crt_line_count', 'crt-line-count'], ['crt_curvature', 'crt-curvature'], ['crt_mask', 'crt-mask'],
      ['shadow_boost', 'shadow-boost'], ['bloom_amount', 'bloom'], ['bloom_threshold', 'bloom-threshold'], ['bloom_radius', 'bloom-radius'],
      ['chromatic_aberration', 'chromatic-aberration'], ['pixel_block', 'pixelate'], ['posterize_levels', 'posterize-levels'],
      ['halftone_size', 'halftone-size'], ['vhs_strength', 'vhs-strength'], ['screen_grain', 'screen-grain'], ['screen_vignette', 'screen-vignette'],
    ]) filter.set(uniform, number(key));
    filter.set('crt_line_shape', 4 ** (1 - 2 * number('crt-line-thickness')));
    filter.set('crt_flicker_amount', number('crt-flicker-strength') * 2);
    filter.set('grade_amount', number('grade-strength'));
    filter.set('duotone_dark', ...colorSetting(this.phosphor, 'duotone-dark'));
    filter.set('duotone_light', ...colorSetting(this.phosphor, 'duotone-light'));
    (SHADED_PALETTES[palette] ?? []).forEach((hex, index) => filter.set(`palette_${index}`, ...rgb(hex)));
    const graded = grade === 'custom'
      ? ownGrade(number('grade-temperature'), number('grade-tint'), number('grade-saturation'), number('grade-contrast'), number('grade-brightness'))
      : GRADES[grade];
    if (!graded) return;
    filter.set('grade_tint', ...graded.tint);
    filter.set('grade_saturation', graded.saturation);
    filter.set('grade_contrast', graded.contrast);
    filter.set('grade_shadows', ...graded.shadows);
    filter.set('grade_lights', ...graded.lights);
  }
}
