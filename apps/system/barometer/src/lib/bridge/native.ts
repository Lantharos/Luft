import { commands, events } from '#lib/bindings.js';
import type { Backend } from './types';

const AUTHENTICATION = { timeoutMs: 10 * 60 * 1000 };

const pending: (() => void)[] = [];

function flush() {
	for (const apply of pending.splice(0)) apply();
}

function batched<T>(listen: (callback: (payload: T) => void) => unknown, callback: (payload: T) => void) {
	listen((payload) => {
		if (pending.push(() => callback(payload)) === 1) requestAnimationFrame(flush);
	});
}

function floats(bytes: Uint8Array) {
	const aligned = bytes.byteOffset % Float32Array.BYTES_PER_ELEMENT === 0 ? bytes : bytes.slice();
	return new Float32Array(aligned.buffer, aligned.byteOffset, aligned.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

export const native: Backend = {
	appState: () => commands.appState(),
	saveSettings: (settings) => commands.settingsWrite(settings),
	view: (view) => commands.monitorView(view),
	configure: (interval, history) => commands.monitorConfigure({ interval, history }),
	snapshot: (after) => commands.monitorSnapshot({ after }),
	details: (pid) => commands.processDetails({ pid }),
	signal: (pids, signal) => commands.processSignal({ pids, signal }, AUTHENTICATION),
	signalApp: (key, signal) => commands.appSignal({ key, signal }, AUTHENTICATION),
	openApp: (key, token) => commands.appOpen({ key, token }),
	stopApp: (key) => commands.appStop({ key }),
	priority: (pid, nice) => commands.processPriority({ pid, nice }, AUTHENTICATION),
	onTick: (callback) => batched(events.barometerTick, callback),
	onDevices: (callback) => batched(events.barometerDevices, callback),
	onApps: (callback) => batched(events.barometerApps, callback),
	onCatalog: (callback) => batched(events.barometerCatalog, callback),
	onProcesses: (callback) => batched(events.barometerProcesses, (bytes) => callback(floats(bytes)))
};
