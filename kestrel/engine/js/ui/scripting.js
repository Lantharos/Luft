import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from './main.js';

function _collect(scriptModule, outputFile) {
    const eventHandlers = {};

    for (const f in scriptModule) {
        const m = /([A-Za-z]+)_([A-Za-z]+)/.exec(f);
        if (m)
            eventHandlers[`${m[1]}.${m[2]}`] = scriptModule[f];
    }

    Shell.PerfLog.get_default().replay(
        (time, eventName, signature, arg) => {
            if (eventName in eventHandlers)
                eventHandlers[eventName](time, arg);
        });

    if ('finish' in scriptModule)
        scriptModule.finish();

    if (outputFile) {
        const f = Gio.file_new_for_path(outputFile);
        const raw = f.replace(null,
            false,
            Gio.FileCreateFlags.NONE,
            null);
        const out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, '{\n');

        Shell.write_string_to_stream(out, '"events":\n');
        Shell.PerfLog.get_default().dump_events(out);

        const monitors = Main.layoutManager.monitors;
        const primary = Main.layoutManager.primaryIndex;
        Shell.write_string_to_stream(out, ',\n"monitors":\n[');
        for (let i = 0; i < monitors.length; i++) {
            const monitor = monitors[i];
            if (i !== 0)
                Shell.write_string_to_stream(out, ', ');
            const prefix = i === primary ? '*' : '';
            Shell.write_string_to_stream(out,
                `"${prefix}${monitor.width}x${monitor.height}+${monitor.x}+${monitor.y}"`);
        }
        Shell.write_string_to_stream(out, ' ]');

        Shell.write_string_to_stream(out, ',\n"metrics":\n[ ');
        let first = true;
        for (const name in scriptModule.METRICS) {
            const metric = scriptModule.METRICS[name];
            // Extra checks here because JSON.stringify generates
            // invalid JSON for undefined values
            if (metric.description == null) {
                log(`Error: No description found for metric ${name}`);
                continue;
            }
            if (metric.units == null) {
                log(`Error: No units found for metric ${name}`);
                continue;
            }
            if (metric.value == null) {
                log(`Error: No value found for metric ${name}`);
                continue;
            }

            if (!first)
                Shell.write_string_to_stream(out, ',\n  ');
            first = false;

            Shell.write_string_to_stream(out,
                `{ "name": ${JSON.stringify(name)},\n` +
                `    "description": ${JSON.stringify(metric.description)},\n` +
                `    "units": ${JSON.stringify(metric.units)},\n` +
                `    "value": ${JSON.stringify(metric.value)} }`);
        }
        Shell.write_string_to_stream(out, ' ]');

        Shell.write_string_to_stream(out, ',\n"log":\n');
        Shell.PerfLog.get_default().dump_log(out);

        Shell.write_string_to_stream(out, '\n}\n');
        out.close(null);
    } else {
        const metrics = [];
        for (const metric in scriptModule.METRICS)
            metrics.push(metric);

        metrics.sort();

        print('------------------------------------------------------------');
        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            print(`# ${scriptModule.METRICS[metric].description}`);
            print(`${metric}: ${scriptModule.METRICS[metric].value}${scriptModule.METRICS[metric].units}`);
        }
        print('------------------------------------------------------------');
    }
}

async function _runPerfScript(scriptModule, outputFile) {
    try {
        await scriptModule.run();
    } catch (err) {
        logError(err, 'Script failed');
        Meta.exit(Meta.ExitCode.ERROR);
    }

    try {
        _collect(scriptModule, outputFile);
    } catch (err) {
        logError(err, 'Script failed');
        Meta.exit(Meta.ExitCode.ERROR);
    }

    global.context.terminate();
}

/**
 * runPerfScript
 *
 * Runs a script for automated collection of performance data. The
 * script is defined as a Javascript module with specified contents.
 *
 * First the run() function within the module will be called as a
 * generator to automate a series of actions. These actions will
 * trigger performance events and the script can also record its
 * own performance events.
 *
 * Then the recorded event log is replayed using handler functions
 * within the module. The handler for the event 'foo.bar' is called
 * foo_bar().
 *
 * Finally if the module has a function called finish(), that will
 * be called.
 *
 * The event handler and finish functions are expected to fill in
 * metrics to an object within the module called METRICS. Each
 * property of this object represents an individual metric. The
 * name of the property is the name of the metric, the value
 * of the property is an object with the following properties:
 *
 *  description: human readable description of the metric
 *  units: a string representing the units of the metric. It has
 *   the form '<unit> <unit> ... / <unit> / <unit> ...'. Certain
 *   unit values are recognized: s, ms, us, B, KiB, MiB. Other
 *   values can appear but are uninterpreted. Examples 's',
 *   '/ s', 'frames', 'frames / s', 'MiB / s / frame'
 *  value: computed value of the metric
 *
 * The resulting metrics will be written to `outputFile` as JSON, or,
 * if `outputFile` is not provided, logged.
 *
 * After running the script and collecting statistics from the
 * event log, GNOME Shell will exit.
 *
 * @param {object} scriptModule module object with run and finish
 *   functions and event handlers
 * @param {string} outputFile path to write output to
 */
export function runPerfScript(scriptModule, outputFile) {
    Shell.PerfLog.get_default().set_enabled(true);
    _runPerfScript(scriptModule, outputFile);
}
