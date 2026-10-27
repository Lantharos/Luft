import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import './environment.js';
import { start } from './main.js';
import { formatError } from './runtime/errorUtils.js';

imports._promiseNative.setMainLoopHook(() => {
  GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
    start().catch((error: unknown) => {
      global.context.terminate_with_error(GLib.Error.new_literal(Gio.IOErrorEnum, Gio.IOErrorEnum.FAILED, formatError(error)));
    });
  });

  global.context.run_main_loop();
});
