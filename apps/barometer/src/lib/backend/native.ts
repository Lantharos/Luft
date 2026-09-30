import { invoke, listen } from '@lantharos/sabine';
import type { AppState, AppUsage, Backend, Catalog, Details, Devices, Snapshot, Tick } from './types';

const AUTHENTICATION = { timeoutMs: 10 * 60 * 1000 };

const pending: (() => void)[] = [];

function flush() {
	for (const apply of pending.splice(0)) apply();
}

function batched<T>(name: string, callback: (payload: T) => void) {
	listen<T>(name, (payload) => {
		if (pending.push(() => callback(payload)) === 1) requestAnimationFrame(flush);
	});
}

function floats(bytes: Uint8Array) {
	const aligned = bytes.byteOffset % Float32Array.BYTES_PER_ELEMENT === 0 ? bytes : bytes.slice();
	return new Float32Array(aligned.buffer, aligned.byteOffset, aligned.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

export const native: Backend = {
	appState: () => invoke<AppState>('app_state'),
	saveSettings: (settings) => invoke('settings_write', settings),
	view: (view) => invoke('monitor_view', { ...view }),
	configure: (interval, history) => invoke('monitor_configure', { interval, history }),
	snapshot: (after) => invoke<Snapshot>('monitor_snapshot', { after }),
	details: (pid) => invoke<Details>('process_details', { pid }),
	signal: (pids, signal) => invoke('process_signal', { pids, signal }, AUTHENTICATION),
	signalApp: (key, signal) => invoke('app_signal', { key, signal }, AUTHENTICATION),
	priority: (pid, nice) => invoke('process_priority', { pid, nice }, AUTHENTICATION),
	onTick: (callback) => batched<Tick>('barometer.tick', callback),
	onDevices: (callback) => batched<Devices>('barometer.devices', callback),
	onApps: (callback) => batched<AppUsage[]>('barometer.apps', callback),
	onCatalog: (callback) => batched<Catalog>('barometer.catalog', callback),
	onProcesses: (callback) => batched<Uint8Array>('barometer.processes', (bytes) => callback(floats(bytes)))
};
