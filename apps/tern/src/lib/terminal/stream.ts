import { events, pty } from '#lib/api.js';

export interface Sink {
	write(data: Uint8Array, parsed: () => void): void;
	exited(code: number): void;
}

const sinks = new Map<number, Sink>();
let listening = false;

function listen() {
	listening = true;
	events.output(({ id, data }) => {
		sinks.get(id)?.write(Uint8Array.fromBase64(data), () => void pty.acknowledge(id));
	});
	events.exited(({ id, code }) => sinks.get(id)?.exited(code));
}

export function connect(id: number, sink: Sink) {
	if (!listening) listen();
	sinks.set(id, sink);
	void pty.attach(id);
	return () => {
		sinks.delete(id);
		void pty.close(id);
	};
}
