import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { label } from '../../../../portal/shortcuts/accelerators.js';
import type { ApiContext } from '../context.js';
import type { ScreenEffects } from '../types.js';
import { DesktopFilter } from './desktopFilter.js';
import { DesktopLayerFilter } from './desktopLayers.js';
import { compileError, filterSnippet, outlineSnippet, windowSnippet } from './shaders.js';
import { SurfaceOverlay } from './surfaceOverlay.js';
import { WindowTransition } from './windows/transition.js';
import { WindowOverlay } from './windows/overlay.js';
import { WindowShader } from './windows/pixels.js';

const OFF_SHORTCUT = 'screen-effects-off';

export function screenEffectsApi(context: ApiContext): ScreenEffects {
  const stage = context.screenEffects;
  const { scope } = context;
  scope.onDisable(() => stage.setAppLines('none'));
  return {
    get off() {
      return stage.off;
    },
    get shortcut() {
      const [first] = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' }).get_strv(OFF_SHORTCUT);
      return first ? label(first) : null;
    },
    onOffChanged: changed => scope.disposable(stage.watchOff(scope.guard(changed))),
    turnBackOn: () => {
      if (context.gestures.recent) stage.turnBackOn();
    },
    apps: () => Shell.AppSystem.get_default().get_installed().filter(app => app.should_show()).flatMap(app => {
      const id = app.get_id();
      return id ? [{ id, name: app.get_name() }] : [];
    }).sort((a, b) => a.name.localeCompare(b.name)),
    check: ({ kind, declarations = '', shader }) => {
      const build = { window: windowSnippet, overlay: outlineSnippet, filter: filterSnippet }[kind];
      return compileError(build(declarations, shader));
    },
    addWindowShader: options => new WindowShader(stage, context, options),
    addWindowOverlay: options => new WindowOverlay(stage, context, options),
    addWindowTransition: options => new WindowTransition(stage, context, options),
    addDesktopFilter: options => options.scope === 'desktop' ? new DesktopLayerFilter(stage, context, options) : new DesktopFilter(stage, context, options),
    addSurfaceOverlay: options => new SurfaceOverlay(stage, context, options),
    setAppLines: style => stage.setAppLines(style),
  };
}
