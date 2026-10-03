import { pty, type TerminalSize } from '#lib/api.js';

type Operation = { kind: 'data'; bytes: Uint8Array } | { kind: 'resize'; size: TerminalSize };

const encoder = new TextEncoder();

function concat(first: Uint8Array, second: Uint8Array) {
	const joined = new Uint8Array(first.length + second.length);
	joined.set(first);
	joined.set(second, first.length);
	return joined;
}

export class InputQueue {
	#id: number;
	#operations: Operation[] = [];
	#running = false;

	constructor(id: number) {
		this.#id = id;
	}

	text(data: string) {
		this.#data(encoder.encode(data));
	}

	binary(data: string) {
		this.#data(Uint8Array.from(data, (character) => character.charCodeAt(0)));
	}

	resize(size: TerminalSize) {
		const last = this.#operations.at(-1);
		if (last?.kind === 'resize') last.size = size;
		else this.#push({ kind: 'resize', size });
	}

	#data(bytes: Uint8Array) {
		const last = this.#operations.at(-1);
		if (last?.kind === 'data') last.bytes = concat(last.bytes, bytes);
		else this.#push({ kind: 'data', bytes });
	}

	#push(operation: Operation) {
		this.#operations.push(operation);
		if (!this.#running) void this.#run();
	}

	async #run() {
		this.#running = true;
		try {
			for (let operation = this.#operations.shift(); operation; operation = this.#operations.shift()) {
				if (operation.kind === 'data') await pty.write(this.#id, operation.bytes.toBase64());
				else await pty.resize(this.#id, operation.size);
			}
		} finally {
			this.#running = false;
		}
	}
}
