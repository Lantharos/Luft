import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import {toggleSurface, dismissImmediately} from 'resource:///org/gnome/shell/ui/kestrelUi.js';
import {disableHelperAutoExit} from 'resource:///org/gnome/shell/ui/scripting.js';

export const METRICS = {};

const pause = milliseconds => new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
        resolve();
        return GLib.SOURCE_REMOVE;
    });
});

function find(actor, predicate) {
    if (predicate(actor)) return actor;
    for (const child of actor.get_children()) {
        const found = find(child, predicate);
        if (found) return found;
    }
    return null;
}

function buttons(root) {
    const result = new Set();
    const visit = actor => {
        if (actor.name?.startsWith('kestrel-start-item-')) result.add(actor);
        actor.get_children().forEach(visit);
    };
    visit(root);
    return result;
}

function processMetrics() {
    const [, status] = GLib.file_get_contents('/proc/self/status');
    const residentKb = Number(/VmRSS:\s+(\d+)/.exec(new TextDecoder().decode(status))[1]);
    const [, stat] = GLib.file_get_contents('/proc/self/stat');
    const fields = new TextDecoder().decode(stat).split(') ')[1].split(' ');
    const [, uptime] = GLib.file_get_contents('/proc/uptime');
    const startedSeconds = Number(fields[19]) / 100;
    const runningSeconds = Number(new TextDecoder().decode(uptime).split(' ')[0]) - startedSeconds;
    return {residentMemoryMb: Math.round(residentKb / 1024), secondsSinceLaunch: Number(runningSeconds.toFixed(2))};
}

export async function run() {
    await disableHelperAutoExit();
    console.log(`Kestrel performance: ${JSON.stringify(processMetrics())}`);
    await pause(1000);
    toggleSurface('start');
    await pause(400);
    const start = find(global.stage, actor => actor.name === 'kestrel-start');
    const entry = start.get_first_child();
    const original = buttons(start);
    const durations = [];
    for (let round = 0; round < 20; round++) {
        for (const query of ['f', 'fi', 'fil', 'files', 'file', 'fi', '']) {
            const before = GLib.get_monotonic_time();
            entry.set_text(query);
            durations.push((GLib.get_monotonic_time() - before) / 1000);
            await pause(16);
        }
    }
    const current = buttons(start);
    durations.sort((a, b) => a - b);
    console.log(`Kestrel performance: ${JSON.stringify({
        searchUpdates: durations.length,
        searchMedianMs: durations[Math.floor(durations.length / 2)],
        searchP95Ms: durations[Math.floor(durations.length * 0.95)],
        rootButtons: original.size,
        retainedRootButtons: [...original].filter(actor => current.has(actor)).length,
    })}`);
    dismissImmediately();
    const center = find(global.stage, actor => actor.name === 'kestrel-notifications');
    const list = find(center, actor => actor.has_style_class_name?.('kestrel-notification-list'));
    let added = 0;
    const signal = list.connect('child-added', () => added++);
    const sources = [];
    try {
        for (let index = 0; index < 8; index++) {
            const source = new MessageTray.Source({title: `Performance ${index}`});
            Main.messageTray.add(source);
            sources.push(source);
            for (let item = 0; item < 10; item++)
                source.addNotification(new MessageTray.Notification({source, title: `Item ${item}`, body: 'Notification workload', acknowledged: true}));
        }
        await pause(100);
        const hiddenRowsCreated = added;
        toggleSurface('notifications');
        await pause(400);
        const displayedRows = list.get_n_children() - 1;
        added = 0;
        for (const source of sources) source.notifications[0].title = 'Updated';
        await pause(100);
        const rowsCreatedForUpdates = added;
        added = 0;
        for (const source of sources) source.destroy();
        sources.length = 0;
        await pause(100);
        console.log(`Kestrel performance: ${JSON.stringify({hiddenRowsCreated, displayedRows, rowsCreatedForUpdates, rowsCreatedDuringClear: added})}`);
    } finally {
        list.disconnect(signal);
        for (const source of sources) source.destroy();
        dismissImmediately();
    }
    await pause(600);
    let frames = 0;
    const painted = global.stage.connect('after-paint', () => frames++);
    await pause(2000);
    global.stage.disconnect(painted);
    console.log(`Kestrel performance: ${JSON.stringify({idleFramesOverTwoSeconds: frames})}`);
}
