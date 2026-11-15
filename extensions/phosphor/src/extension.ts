import type { AppLines, Disposable, Enable, ScreenEffectBase, WindowEffectHandle } from '@luft/extension-api';

import { ScreenFilter } from './desktop/filter.js';
import { Looks } from './looks/looks.js';
import { describePage } from './page/page.js';
import { AppRules, type Granted } from './rules.js';
import { addSurfaceLines, tuneSurfaceLines } from './surfaces/lines.js';
import { addWindowAberration, tuneWindowAberration } from './windows/aberration.js';
import { addBorder, tuneBorder } from './windows/border.js';
import { addWindowCrt, tuneWindowCrt } from './windows/crt.js';
import { addOverlay, tuneOverlay } from './windows/overlay.js';
import { addShadow, tuneShadow } from './windows/shadow.js';
import { addTransition, type Look } from './windows/transitions.js';
import { addUnfocused, tuneUnfocused } from './windows/unfocused.js';

const FILTER_KEYS = new Set([
  'desktop-crt', 'crt-scanlines', 'crt-line-count', 'crt-line-thickness', 'crt-curvature', 'crt-mask', 'crt-mask-type', 'crt-flicker', 'crt-flicker-strength',
  'invert', 'grade', 'grade-strength', 'grade-temperature', 'grade-tint', 'grade-saturation', 'grade-contrast', 'grade-brightness', 'duotone-dark', 'duotone-light',
  'palette', 'palette-dither', 'pixelate', 'stylize', 'posterize-levels', 'halftone-size', 'shadow-boost', 'bloom', 'bloom-radius', 'bloom-threshold',
  'chromatic-aberration', 'screen-vignette', 'screen-grain', 'screen-grain-moving', 'vhs', 'vhs-strength', 'glitch-bursts', 'glitch-gap',
  'filters-scope', 'filters-fullscreen', 'filters-captured',
]);
const SURFACE_KEYS = new Set(['surface-lines', 'surface-places']);
const TUNED_KEYS = new Set([
  'border-color', 'border-second-color', 'border-app-color', 'overlay-strength', 'overlay-tint-color', 'overlay-line-spacing', 'overlay-grain-size',
  'overlay-vignette-size', 'window-crt', 'window-aberration', 'unfocused-strength', 'shadow-color', 'surface-color',
]);
const OWN_KEYS = new Set(['look', 'app-lines']);

const enable: Enable<Granted> = phosphor => {
  const { settings, screenEffects, appearance, timers } = phosphor;
  const filter = new ScreenFilter(phosphor);
  const looks = new Looks(phosphor);
  let windowEffects: (WindowEffectHandle | null)[] = [];
  let crt: WindowEffectHandle | null = null;
  let aberration: WindowEffectHandle | null = null;
  let transitions: Disposable[] = [];
  let surfaceLines: ScreenEffectBase | null = null;
  let pending = new Set<string>();
  let flushing: Disposable | null = null;
  const rules = new AppRules(phosphor, () => {
    if (rules.used('crt') === !crt || rules.used('aberration') === !aberration) updateWindows();
    else for (const effect of [...windowEffects, crt, aberration]) effect?.refresh();
    phosphor.settingsPage.refresh();
  });

  function updateWindows() {
    for (const effect of [...windowEffects, crt, aberration, ...transitions]) effect?.dispose();
    windowEffects = [addShadow(phosphor), addUnfocused(phosphor), addOverlay(phosphor, rules), addBorder(phosphor, rules)];
    crt = rules.used('crt') ? addWindowCrt(phosphor, rules) : null;
    aberration = rules.used('aberration') ? addWindowAberration(phosphor, rules) : null;
    transitions = (['open', 'close'] as const).flatMap(kind => {
      const look = settings.get<Look | 'off'>(`${kind}-effect`);
      return look === 'off' ? [] : [addTransition(phosphor, rules, kind, look)];
    });
  }

  function updateSurfaces() {
    surfaceLines?.dispose();
    surfaceLines = addSurfaceLines(phosphor);
  }

  function tune() {
    const [shadow, unfocused, overlay, border] = windowEffects;
    if (shadow) tuneShadow(phosphor, shadow);
    if (unfocused) tuneUnfocused(phosphor, unfocused);
    if (overlay) tuneOverlay(phosphor, overlay);
    if (border) tuneBorder(phosphor, border);
    if (crt) tuneWindowCrt(phosphor, crt);
    if (aberration) tuneWindowAberration(phosphor, aberration);
    if (surfaceLines) tuneSurfaceLines(phosphor, surfaceLines);
  }

  function flush() {
    const keys = pending;
    pending = new Set();
    flushing = null;
    looks.changed(keys);
    const has = (group: Set<string>) => [...keys].some(key => group.has(key));
    if (keys.has('app-lines')) screenEffects.setAppLines(settings.get<AppLines>('app-lines'));
    if (has(FILTER_KEYS)) filter.update();
    if (has(SURFACE_KEYS)) updateSurfaces();
    if ([...keys].some(key => !FILTER_KEYS.has(key) && !SURFACE_KEYS.has(key) && !TUNED_KEYS.has(key) && !OWN_KEYS.has(key))) updateWindows();
    else if (has(TUNED_KEYS)) tune();
  }

  describePage(phosphor, rules, looks);
  settings.onChanged(key => {
    pending.add(key);
    flushing ??= timers.timeout(0, flush);
  });
  appearance.onChanged(() => {
    tune();
    filter.update();
  });
  looks.settle();
  updateWindows();
  updateSurfaces();
  filter.update();
  screenEffects.setAppLines(settings.get<AppLines>('app-lines'));
};

export default enable;
