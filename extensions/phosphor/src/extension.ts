import type { AppLines, Disposable, Enable, ScreenEffectBase, WindowEffectHandle } from '@luft/extension-api';

import { ScreenFilter } from './desktop/filter.js';
import { describePage } from './page.js';
import { AppRules, type Granted } from './rules.js';
import { addSurfaceLines, tuneSurfaceLines } from './surfaces/lines.js';
import { addWindowAberration, tuneWindowAberration } from './windows/aberration.js';
import { addBorder, tuneBorder } from './windows/border.js';
import { addWindowCrt, tuneWindowCrt } from './windows/crt.js';
import { addOverlay, tuneOverlay } from './windows/overlay.js';
import { addTransition } from './windows/transitions.js';

const FILTER_KEYS = new Set(['desktop-crt', 'crt-scanlines', 'crt-curvature', 'crt-mask', 'crt-flicker', 'invert', 'grade', 'grade-strength', 'shadow-boost', 'bloom', 'chromatic-aberration', 'filters-fullscreen', 'filters-captured']);
const SURFACE_KEYS = new Set(['surface-lines', 'surface-places']);
const TUNED_KEYS = new Set(['border-color', 'border-second-color', 'overlay-strength', 'window-crt', 'window-aberration', 'surface-color']);

type Look = 'off' | 'glitch' | 'fold' | 'dissolve' | 'burn' | 'crt';

const enable: Enable<Granted> = phosphor => {
  const { settings, screenEffects, appearance } = phosphor;
  const filter = new ScreenFilter(phosphor);
  let border: WindowEffectHandle | null = null;
  let overlay: WindowEffectHandle | null = null;
  let crt: WindowEffectHandle | null = null;
  let aberration: WindowEffectHandle | null = null;
  let transitions: Disposable[] = [];
  let surfaceLines: ScreenEffectBase | null = null;
  const rules = new AppRules(phosphor, () => {
    if (rules.used('crt') === !crt || rules.used('aberration') === !aberration) updateWindows();
    else for (const effect of [border, overlay, crt, aberration]) effect?.refresh();
    phosphor.settingsPage.refresh();
  });

  function updateWindows() {
    for (const effect of [border, overlay, crt, aberration, ...transitions]) effect?.dispose();
    overlay = addOverlay(phosphor, rules);
    border = addBorder(phosphor, rules);
    crt = rules.used('crt') ? addWindowCrt(phosphor, rules) : null;
    aberration = rules.used('aberration') ? addWindowAberration(phosphor, rules) : null;
    const look = (key: string) => settings.get<Look>(key);
    const opening = look('open-effect');
    const closing = look('close-effect');
    transitions = [
      ...opening !== 'off' ? [addTransition(phosphor, rules, 'open', opening)] : [],
      ...closing !== 'off' ? [addTransition(phosphor, rules, 'close', closing)] : [],
    ];
  }

  function updateSurfaces() {
    surfaceLines?.dispose();
    surfaceLines = addSurfaceLines(phosphor);
  }

  function tune() {
    if (border) tuneBorder(phosphor, border);
    if (overlay) tuneOverlay(phosphor, overlay);
    if (crt) tuneWindowCrt(phosphor, crt);
    if (aberration) tuneWindowAberration(phosphor, aberration);
    if (surfaceLines) tuneSurfaceLines(phosphor, surfaceLines);
  }

  function changed(key: string) {
    if (key === 'app-lines') screenEffects.setAppLines(settings.get<AppLines>('app-lines'));
    else if (FILTER_KEYS.has(key)) filter.update();
    else if (SURFACE_KEYS.has(key)) updateSurfaces();
    else if (TUNED_KEYS.has(key)) tune();
    else updateWindows();
  }

  describePage(phosphor, rules);
  settings.onChanged(changed);
  appearance.onChanged(tune);
  updateWindows();
  updateSurfaces();
  filter.update();
  screenEffects.setAppLines(settings.get<AppLines>('app-lines'));
};

export default enable;
