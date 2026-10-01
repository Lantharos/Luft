import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import { spawnCommandLine } from 'resource:///org/gnome/shell/misc/util.js';

import type { Keybindings } from '../context.js';

const MEDIA_KEYS = 'com.lantharos.kestrel.media-keys';
const CUSTOM = 'com.lantharos.kestrel.custom-keybinding';
const CUSTOM_MODES = Shell.ActionMode.ALL & ~(Shell.ActionMode.LOGIN_SCREEN | Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN);

export type Launcher = 'www' | 'email' | 'calculator' | 'media' | 'home';

const HANDLERS: Record<Exclude<Launcher, 'home' | 'calculator'>, string> = {
  www: 'x-scheme-handler/http',
  email: 'x-scheme-handler/mailto',
  media: 'audio/x-vorbis+ogg',
};
const CALCULATORS = ['org.gnome.Calculator.desktop', 'gnome-calculator.desktop'];

const shell = () => global as unknown as Shell.Global;

function activate(info: Gio.AppInfo | null): void {
  if (!info) return;
  const app = Shell.AppSystem.get_default().lookup_app(info.get_id() ?? '');
  if (app) app.activate();
  else info.launch([], shell().create_app_launch_context(0, -1));
}

export function launch(launcher: Launcher): void {
  if (launcher === 'home') {
    Gio.AppInfo.launch_default_for_uri(Gio.File.new_for_path(GLib.get_home_dir()).get_uri(), shell().create_app_launch_context(0, -1));
    return;
  }
  if (launcher === 'calculator') {
    const app = CALCULATORS.map(id => Shell.AppSystem.get_default().lookup_app(id)).find(found => found);
    app?.activate();
    return;
  }
  activate(Gio.AppInfo.get_default_for_type(HANDLERS[launcher], false));
}

interface Grab {
  settings: Gio.Settings;
  action: number;
  changedId: number;
}

export class CustomShortcuts {
  private readonly mediaKeys = new Gio.Settings({ schema_id: MEDIA_KEYS });
  private readonly listId: number;
  private readonly activatedId: number;
  private grabs: Grab[] = [];

  constructor(private readonly keybindings: Keybindings) {
    this.listId = this.mediaKeys.connect('changed::custom-keybindings', () => this.regrab());
    this.activatedId = shell().display.connect('accelerator-activated', (_display: Meta.Display, action: number) => {
      const grab = this.grabs.find(candidate => candidate.action === action);
      const command = grab?.settings.get_string('command');
      if (command) spawnCommandLine(command);
    });
    this.regrab();
  }

  private regrab(): void {
    this.release();
    for (const path of this.mediaKeys.get_strv('custom-keybindings')) {
      const settings = new Gio.Settings({ schema_id: CUSTOM, path });
      const changedId = settings.connect('changed::binding', () => this.regrab());
      const accelerator = settings.get_string('binding');
      const action = accelerator ? shell().display.grab_accelerator(accelerator, Meta.KeyBindingFlags.NONE) : Meta.KeyBindingAction.NONE;
      if (action !== Meta.KeyBindingAction.NONE) this.keybindings.allow(Meta.external_binding_name_for_action(action), CUSTOM_MODES);
      this.grabs.push({ settings, action, changedId });
    }
  }

  private release(): void {
    for (const grab of this.grabs) {
      grab.settings.disconnect(grab.changedId);
      if (grab.action !== Meta.KeyBindingAction.NONE) shell().display.ungrab_accelerator(grab.action);
    }
    this.grabs = [];
  }

  destroy(): void {
    this.release();
    this.mediaKeys.disconnect(this.listId);
    shell().display.disconnect(this.activatedId);
  }
}
