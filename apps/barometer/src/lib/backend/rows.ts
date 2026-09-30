import type { ProcessEntry } from './types';

export interface Usage {
	cpu: number;
	memory: number;
	read: number;
	write: number;
	gpu: number;
	vram: number;
	encoder: number;
	decoder: number;
	nice: number;
	state: string;
	threads: number;
	userTime: number;
	systemTime: number;
	readTotal: number;
	writeTotal: number;
}

export interface Process extends ProcessEntry, Usage {}

export const FIELDS = 16;

export function decode(rows: Float32Array, index: number): Usage {
	const base = index * FIELDS;
	return {
		cpu: rows[base + 1],
		memory: rows[base + 2],
		read: rows[base + 3],
		write: rows[base + 4],
		gpu: rows[base + 5],
		vram: rows[base + 6],
		encoder: rows[base + 7],
		decoder: rows[base + 8],
		nice: rows[base + 9],
		state: String.fromCharCode(rows[base + 10]),
		threads: rows[base + 11],
		userTime: rows[base + 12],
		systemTime: rows[base + 13],
		readTotal: rows[base + 14],
		writeTotal: rows[base + 15]
	};
}

export function encode(processes: (Usage & { pid: number })[]) {
	const rows = new Float32Array(processes.length * FIELDS);
	processes.forEach((process, index) => {
		rows.set(
			[
				process.pid,
				process.cpu,
				process.memory,
				process.read,
				process.write,
				process.gpu,
				process.vram,
				process.encoder,
				process.decoder,
				process.nice,
				process.state.charCodeAt(0),
				process.threads,
				process.userTime,
				process.systemTime,
				process.readTotal,
				process.writeTotal
			],
			index * FIELDS
		);
	});
	return rows;
}
