import { commands } from '#lib/bindings.js';
import type { Task } from '#lib/bindings.js';
import { fetchBytes } from '#lib/files/pixels.js';

const CHUNK = 24 << 20;

async function send(id: number, data: Uint8Array, mask: boolean) {
	for (let at = 0; at < data.length; at += CHUNK) await commands.aiChunk({ id, mask }, { body: data.subarray(at, at + CHUNK) });
}

export async function runModel(task: Task, pixels: Uint8Array, width: number, height: number, mask: Uint8Array | null = null) {
	const id = await commands.aiBegin({ task, width, height });
	await send(id, pixels, false);
	if (mask) await send(id, mask, true);
	const output = await commands.aiCommit({ id }, { timeoutMs: 60 * 60 * 1000 });
	const data = await fetchBytes(output.file);
	await commands.releaseFiles({ paths: [output.file] });
	return { ...output, data };
}
