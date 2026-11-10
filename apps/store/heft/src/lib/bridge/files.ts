import { invoke } from '@lantharos/sabine';

export const readFile = (path: string) => invoke<Uint8Array>('file_read', { path });

export const readOutside = (path: string) => invoke<Uint8Array>('file_read_outside', { path });

export const appendFile = (path: string, body: Uint8Array) => invoke<null>('file_append', { path }, { body });

export const replaceFile = (path: string, body: Uint8Array) => invoke<null>('file_replace', { path }, { body });

export const exportFile = (path: string, body: Uint8Array) => invoke<null>('file_export', { path }, { body });

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const writeJson = (path: string, value: unknown) => replaceFile(path, encoder.encode(JSON.stringify(value, null, '\t')));

export async function readJson<T>(path: string): Promise<T | null> {
	const bytes = await readFile(path);
	return bytes.length ? (JSON.parse(decoder.decode(bytes)) as T) : null;
}

export class WriteQueue {
	private tail: Promise<unknown> = Promise.resolve();

	run<T>(write: () => Promise<T>): Promise<T> {
		const next = this.tail.then(write, write);
		this.tail = next.catch((error) => console.error('Heft could not save', error));
		return next;
	}

	get settled() {
		return this.tail;
	}
}
