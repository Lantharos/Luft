import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {logErrorUnlessCancelled} from './errorUtils.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

const PROGRAM = 'ddcutil';
const BRIGHTNESS = '10';
const DETECT_DELAY_MS = 1500;
const DETECT_RETRY_SECONDS = [10, 60, 300];
const SETTLE_MS = 150;
const QUICK_RETRY_SECONDS = 1;
const ALLOWED_FAILURES = 3;
const FIRST_BACKOFF_SECONDS = 10;
const LONGEST_BACKOFF_SECONDS = 300;

async function run(args, cancellable = null) {
    const process = Gio.Subprocess.new([PROGRAM, ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
    const [stdout, stderr] = await process.communicate_utf8_async(null, cancellable);
    if (!process.get_successful())
        throw new Error(stderr.trim() || `${PROGRAM} ${args.join(' ')} failed`);
    return stdout;
}

function parseDetect(output) {
    const found = [];
    let current = null;
    for (const line of output.split('\n')) {
        if (!/^\s/.test(line)) {
            const heading = line.trim();
            current = heading.startsWith('Display ') || heading === 'Invalid display'
                ? {bus: -1, connector: null, monitor: null, usable: heading !== 'Invalid display'}
                : null;
            if (current)
                found.push(current);
            continue;
        }
        const separator = line.indexOf(':');
        if (!current || separator < 0)
            continue;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();
        if (key === 'I2C bus')
            current.bus = Number(value.split('-').pop());
        else if (key === 'DRM connector' || key === 'DRM_connector')
            current.connector = value.replace(/^card\d+-/, '');
        else if (key === 'Monitor')
            current.monitor = value;
    }
    return found.filter(display => display.bus >= 0);
}

async function readBrightness(bus, cancellable) {
    const output = await run(['--bus', `${bus}`, 'getvcp', BRIGHTNESS, '--terse'], cancellable);
    const [, current, max] = output.match(/^VCP 10 C (\d+) (\d+)/m) ?? [];
    if (!(Number(max) > 0))
        throw new Error(`Unexpected brightness report: ${output.trim()}`);
    return {level: Number(current) / Number(max), max: Number(max)};
}

class DdcDisplay {
    constructor(bus, {level, max}) {
        this.bus = bus;
        this.level = level;
        this._max = max;
        this._written = Math.round(level * max);
        this._target = null;
        this._timerId = 0;
        this._writing = false;
        this._failures = 0;
        this._retryAt = 0;
    }

    set(level) {
        this._target = Math.round(Math.clamp(level, 0, 1) * this._max);
        if (this._target === this._written && !this._writing)
            this._target = null;
        if (this._target === null || this._timerId || this._writing)
            return;
        const wait = Math.max(SETTLE_MS, Math.ceil((this._retryAt - GLib.get_monotonic_time()) / 1000));
        this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, wait, () => {
            this._timerId = 0;
            this._write().catch(logError);
            return GLib.SOURCE_REMOVE;
        });
    }

    async _write() {
        const value = this._target;
        this._target = null;
        if (value === null || value === this._written)
            return;
        this._writing = true;
        try {
            await run(['--bus', `${this.bus}`, '--noverify', 'setvcp', BRIGHTNESS, `${value}`]);
            this._written = value;
            this.level = value / this._max;
            this._failures = 0;
            this._retryAt = 0;
        } catch (e) {
            if (this._failed(e))
                this._target ??= value;
        }
        this._writing = false;
        if (this._target !== null)
            this.set(this._target / this._max);
    }

    _failed(error) {
        this._failures++;
        const retrying = this._failures < ALLOWED_FAILURES;
        const seconds = retrying
            ? QUICK_RETRY_SECONDS
            : Math.min(FIRST_BACKOFF_SECONDS * 2 ** (this._failures - ALLOWED_FAILURES), LONGEST_BACKOFF_SECONDS);
        this._retryAt = GLib.get_monotonic_time() + seconds * GLib.USEC_PER_SEC;
        if (!retrying)
            console.warn(`The display on I2C bus ${this.bus} is not answering brightness changes, waiting ${seconds}s: ${error.message}`);
        return retrying;
    }

    destroy() {
        if (this._timerId)
            GLib.source_remove(this._timerId);
        this._timerId = 0;
        this._target = null;
    }
}

function identify(monitor) {
    return `${monitor.get_vendor()}:${monitor.get_product()}:${monitor.get_serial()}`;
}

export class DdcDisplays {
    constructor(changed) {
        this._changed = changed;
        this._displays = new Map();
        this._delayId = 0;
        this._retry = 0;
        this._cancellable = null;
    }

    displaysFor(logicalMonitor) {
        return logicalMonitor.get_monitors()
            .filter(monitor => monitor.is_active())
            .map(monitor => this._displays.get(monitor.get_connector()))
            .filter(display => display);
    }

    detect(monitors) {
        this._cancel();
        this._retry = 0;
        if (!monitors.length || !GLib.find_program_in_path(PROGRAM)) {
            this._replace(new Map());
            return;
        }
        this._schedule(monitors, DETECT_DELAY_MS);
    }

    _schedule(monitors, delay) {
        this._delayId = GLib.timeout_add(GLib.PRIORITY_LOW, delay, () => {
            this._delayId = 0;
            this._cancellable = new Gio.Cancellable();
            this._detect(monitors, this._cancellable).catch(logErrorUnlessCancelled);
            return GLib.SOURCE_REMOVE;
        });
    }

    async _detect(monitors, cancellable) {
        const found = parseDetect(await run(['detect', '--terse'], cancellable));
        const displays = new Map();
        let unanswered = false;
        for (const monitor of monitors) {
            const connector = monitor.get_connector();
            const match = found.find(display => display.usable && display.connector === connector) ??
                found.find(display => display.usable && display.monitor === identify(monitor));
            if (!match)
                continue;
            const known = this._displays.get(connector);
            if (known?.bus === match.bus) {
                displays.set(connector, known);
                continue;
            }
            try {
                displays.set(connector, new DdcDisplay(match.bus, await readBrightness(match.bus, cancellable)));
            } catch (e) {
                if (cancellable.is_cancelled())
                    throw e;
                unanswered = true;
            }
        }
        this._cancellable = null;
        this._replace(displays);
        if (unanswered && this._retry < DETECT_RETRY_SECONDS.length)
            this._schedule(monitors, DETECT_RETRY_SECONDS[this._retry++] * 1000);
    }

    _replace(displays) {
        const same = displays.size === this._displays.size &&
            [...displays].every(([connector, display]) => this._displays.get(connector) === display);
        for (const [connector, display] of this._displays) {
            if (displays.get(connector) !== display)
                display.destroy();
        }
        this._displays = displays;
        if (!same)
            this._changed();
    }

    _cancel() {
        if (this._delayId)
            GLib.source_remove(this._delayId);
        this._delayId = 0;
        this._cancellable?.cancel();
        this._cancellable = null;
    }
}
