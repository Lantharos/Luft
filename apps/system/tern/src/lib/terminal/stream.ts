import { commands, events } from '#lib/bindings.js';

export interface Sink {
	write(data: Uint8Array, parsed: () => void): void;
	exited(code: number): void;
}

const sinks = new Map<number, Sink>();
let listening = false;

function listen() {
	listening = true;
	events.ternOutput(({ id, data }) => {
		sinks.get(id)?.write(Uint8Array.fromBase64(data), () => void commands.ptyAck({ id }));
	});
	events.ternExited(({ id, code }) => sinks.get(id)?.exited(code));
}

export function connect(id: number, sink: Sink) {
	if (!listening) listen();
	sinks.set(id, sink);
	void commands.ptyAttach({ id });
	return () => {
		sinks.delete(id);
		void commands.ptyClose({ id });
	};
}
