import { extensionTiles } from '../../../../surfaces/quickSettings/extensionTiles.js';
import { QuickMenuToggle } from '../../../../system/toggles/quickSettings.js';
import type { ApiContext } from '../context.js';
import { resolveIcon } from '../icons.js';
import type { QuickSettings, Toggle, ToggleOptions } from '../types.js';
import { fillMenu } from './menu.js';

type State = Omit<ToggleOptions, 'setting' | 'onToggled'>;

function addToggle(context: ApiContext, options: ToggleOptions, ordinal: number): Toggle {
  const { scope, values, manifest } = context;
  if (options.setting && values.describe(options.setting).type !== 'switch') throw new Error(`${options.setting} isn't a switch`);
  const actor = new QuickMenuToggle({ toggle_mode: true });
  const onToggled = options.onToggled && context.fromPerson(options.onToggled);
  let state: State = { ...options };
  let syncing = false;
  let forgetMenu = () => {};

  const apply = () => {
    syncing = true;
    actor.title = state.title;
    actor.subtitle = state.subtitle ?? null;
    actor.gicon = resolveIcon(context.path, state.icon);
    actor.checked = options.setting ? values.get(options.setting) === true : !!state.checked;
    actor.menuEnabled = !!state.menu?.length;
    syncing = false;
  };
  const header = () => actor.menu.setHeader(resolveIcon(context.path, state.icon), state.title);
  const rebuildMenu = () => {
    forgetMenu();
    actor.menu.removeAll();
    header();
    forgetMenu = state.menu?.length ? fillMenu(actor.menu, state.menu, context, options.setting) : () => {};
  };
  actor.connect('notify::checked', () => {
    if (syncing) return;
    if (options.setting) values.set(options.setting, actor.checked);
    else onToggled?.(actor.checked);
  });
  const forgetSetting = values.watch(key => {
    if (key === options.setting) apply();
  });
  apply();
  rebuildMenu();
  const unregister = extensionTiles.add({ id: `${manifest.id}/${ordinal}`, actor, settingsPanel: `extensions/${manifest.id}` });
  const disposable = scope.disposable(() => {
    forgetSetting();
    forgetMenu();
    unregister();
    actor.destroy();
  });
  return {
    update: changes => {
      state = { ...state, ...changes };
      apply();
      if ('menu' in changes) rebuildMenu();
      else if ('title' in changes || 'icon' in changes) header();
    },
    dispose: () => disposable.dispose(),
  };
}

export function quickSettingsApi(context: ApiContext): QuickSettings {
  let added = 0;
  return { addToggle: options => addToggle(context, options, added++) };
}
