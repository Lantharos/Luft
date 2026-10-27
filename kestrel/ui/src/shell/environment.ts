import { setConsoleLogDomain } from 'console';

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Polkit from 'gi://Polkit';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as SignalTracker from './runtime/signalTracker.js';
import { installEasing } from './runtime/easing.js';

const GRID_STYLE = { row_spacing: 'spacing-rows', column_spacing: 'spacing-columns' } as const;

setConsoleLogDomain('Kestrel');

Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');
Gio._promisify(Gio.DBusConnection.prototype, 'call');
Gio._promisify(Gio.DBusProxy, 'new');
Gio._promisify(Gio.DBusProxy.prototype, 'init_async');
Gio._promisify(Gio.DBusProxy.prototype, 'call_with_unix_fd_list');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.File.prototype, 'read_async');
Gio._promisify(Polkit.Permission, 'new');
Gio._promisify(Shell.App.prototype, 'activate_action');
Gio._promisify(Meta.Backend.prototype, 'set_keymap_async');

Object.assign(globalThis, { global: Shell.Global.get() });

GObject.gtypeNameBasedOnJSPath = true;

GObject.Object.prototype.connectObject = function (...args: unknown[]) {
  SignalTracker.connectObject(this, ...args);
};
GObject.Object.prototype.disconnectObject = function (owner: object) {
  SignalTracker.disconnectObject(this, owner);
};

SignalTracker.registerDestroyableType(Clutter.Actor);

installEasing();

Clutter.GridLayout.prototype.hookup_style = function (container: St.Widget) {
  container.connect('style-changed', () => {
    const node = container.get_theme_node();
    for (const [property, style] of Object.entries(GRID_STYLE)) {
      const [found, length] = node.lookup_length(style, false);
      if (found) this[property as keyof typeof GRID_STYLE] = length;
    }
  });
};

Clutter.Actor.prototype[Symbol.iterator] = function* () {
  for (let child = this.get_first_child(); child; child = child.get_next_sibling()) yield child;
};

Clutter.Actor.prototype.toString = function () {
  return St.describe_actor(this);
};

const slowdownFactor = parseFloat(GLib.getenv('KESTREL_SLOWDOWN_FACTOR') ?? '');
if (slowdownFactor > 0) St.Settings.get().slow_down_factor = slowdownFactor;
