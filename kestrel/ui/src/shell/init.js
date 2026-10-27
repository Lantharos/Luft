import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import './environment.js';
import {start} from './main.js';
import {formatError} from './runtime/errorUtils.js';

// Run the Mutter main loop after
// GJS finishes resolving this module.
imports._promiseNative.setMainLoopHook(() => {
    // Queue starting the shell
    GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
        start().catch(e => {
            const error = new GLib.Error(
                Gio.IOErrorEnum, Gio.IOErrorEnum.FAILED, formatError(e));
            global.context.terminate_with_error(error);
        });
    });

    // Run the meta context's main loop
    global.context.run_main_loop();
});
