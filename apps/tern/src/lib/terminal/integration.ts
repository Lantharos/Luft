import type { IDisposable, IMarker, Terminal } from '@xterm/xterm';

const CWD = 7;
const PROMPT = 133;

export interface FinishedCommand {
	command: string;
	duration: number;
	code: number;
}

interface Handlers {
	cwd(path: string): void;
	finished(command: FinishedCommand): void;
}

interface Position {
	line: number;
	column: number;
}

function pathFromUri(uri: string) {
	if (!uri.startsWith('file://')) return null;
	const path = uri.slice(uri.indexOf('/', 'file://'.length));
	try {
		return decodeURIComponent(path);
	} catch {
		return path;
	}
}

export class ShellIntegration {
	#terminal: Terminal;
	#handlers: Handlers;
	#prompts: IMarker[] = [];
	#input: Position | null = null;
	#command: { text: string; started: number } | null = null;
	#disposables: IDisposable[];

	constructor(terminal: Terminal, handlers: Handlers) {
		this.#terminal = terminal;
		this.#handlers = handlers;
		this.#disposables = [
			terminal.parser.registerOscHandler(CWD, (data) => {
				const path = pathFromUri(data);
				if (path) handlers.cwd(path);
				return true;
			}),
			terminal.parser.registerOscHandler(PROMPT, (data) => {
				this.#mark(data);
				return true;
			})
		];
	}

	#cursor(): Position {
		const buffer = this.#terminal.buffer.active;
		return { line: buffer.baseY + buffer.cursorY, column: buffer.cursorX };
	}

	#mark(data: string) {
		const [kind, ...parameters] = data.split(';');
		if (kind === 'A') this.#promptStarted();
		else if (kind === 'B') this.#input = this.#cursor();
		else if (kind === 'C') this.#command = { text: this.#typedCommand(), started: performance.now() };
		else if (kind === 'D') this.#commandFinished(Number(parameters[0] ?? 0));
	}

	#promptStarted() {
		this.#prompts = this.#prompts.filter((marker) => !marker.isDisposed);
		const line = this.#cursor().line;
		if (this.#prompts.at(-1)?.line === line) return;
		const marker = this.#terminal.registerMarker(0);
		if (marker) this.#prompts.push(marker);
	}

	#typedCommand() {
		if (!this.#input) return '';
		const buffer = this.#terminal.buffer.active;
		const end = this.#cursor().line;
		let text = '';
		for (let line = this.#input.line; line < Math.max(end, this.#input.line + 1); line++) {
			const row = buffer.getLine(line);
			if (!row) break;
			text += row.translateToString(true, line === this.#input.line ? this.#input.column : 0);
		}
		this.#input = null;
		return text.trim();
	}

	#commandFinished(code: number) {
		if (!this.#command) return;
		const { text, started } = this.#command;
		this.#command = null;
		this.#handlers.finished({ command: text, duration: performance.now() - started, code });
	}

	scrollToPrompt(direction: -1 | 1) {
		const top = this.#terminal.buffer.active.viewportY;
		const lines = this.#prompts.filter((marker) => !marker.isDisposed).map((marker) => marker.line);
		const target = direction < 0 ? lines.findLast((line) => line < top) : lines.find((line) => line > top);
		if (target !== undefined) this.#terminal.scrollToLine(target);
		else if (direction > 0) this.#terminal.scrollToBottom();
	}

	dispose() {
		for (const disposable of this.#disposables) disposable.dispose();
		for (const marker of this.#prompts) marker.dispose();
	}
}
