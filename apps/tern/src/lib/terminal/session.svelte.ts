import { ClipboardAddon, type IClipboardProvider } from '@xterm/addon-clipboard';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { UnicodeGraphemesAddon } from '@xterm/addon-unicode-graphemes';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal, type ITheme } from '@xterm/xterm';
import { openLink, pty } from '#lib/api.js';
import { settings } from '#lib/state/settings.svelte.js';
import type { CursorStyle, LaunchRequest } from '#lib/types.js';
import { InputQueue } from './input';
import { ShellIntegration, type FinishedCommand } from './integration';
import { acquireRenderer, releaseRenderer } from './renderers';
import { connect } from './stream';

export interface TerminalOptions {
	fontFamily: string;
	fontSize: number;
	scrollback: number;
	cursorStyle: CursorStyle;
	cursorBlink: boolean;
	theme: ITheme;
	transparent: boolean;
	minimumContrastRatio: number;
}

export interface SessionEvents {
	finished(session: TerminalSession, command: FinishedCommand): void;
	exited(session: TerminalSession): void;
	bell(session: TerminalSession): void;
	selected(session: TerminalSession, text: string): void;
	pasted(session: TerminalSession, text: string): void;
	key(event: KeyboardEvent): boolean;
}

const clipboard: IClipboardProvider = {
	readText: () => (settings.current.clipboardReads ? navigator.clipboard.readText() : ''),
	writeText: (_, text) => navigator.clipboard.writeText(text)
};

function followLink(event: MouseEvent, uri: string) {
	if (event.ctrlKey) void openLink(uri);
}

let nextKey = 0;

export class TerminalSession {
	readonly key = ++nextKey;
	readonly host = document.createElement('div');
	readonly terminal: Terminal;
	readonly search = new SearchAddon({ highlightLimit: 2000 });
	title = $state('');
	cwd = $state<string | null>(null);
	bells = $state(0);
	#fit = new FitAddon();
	#integration: ShellIntegration;
	#events: SessionEvents;
	#request: LaunchRequest;
	#id: number | null = null;
	#input: InputQueue | null = null;
	#disconnect: (() => void) | null = null;
	#opened = false;
	#visible = false;
	#disposed = false;

	constructor(options: TerminalOptions, request: LaunchRequest, events: SessionEvents) {
		this.#events = events;
		this.#request = request;
		this.cwd = request.directory;
		this.host.className = 'terminal-host';
		this.terminal = new Terminal({
			...this.#terminalOptions(options),
			allowProposedApi: true,
			rescaleOverlappingGlyphs: true,
			linkHandler: { activate: followLink, allowNonHttpProtocols: true }
		});
		for (const addon of [this.#fit, this.search, new UnicodeGraphemesAddon(), new WebLinksAddon(followLink), new ClipboardAddon(undefined, clipboard)]) {
			this.terminal.loadAddon(addon);
		}
		this.#integration = new ShellIntegration(this.terminal, {
			cwd: (path) => (this.cwd = path),
			finished: (command) => events.finished(this, command)
		});
		this.terminal.onTitleChange((title) => (this.title = title));
		this.terminal.onBell(() => {
			this.bells++;
			events.bell(this);
		});
		this.terminal.onData((data) => this.#input?.text(data));
		this.terminal.onBinary((data) => this.#input?.binary(data));
		this.terminal.onResize(({ cols, rows }) => this.#input?.resize({ cols, rows }));
		this.terminal.attachCustomKeyEventHandler((event) => events.key(event));
		this.host.addEventListener(
			'paste',
			(event) => {
				event.preventDefault();
				event.stopPropagation();
				events.pasted(this, event.clipboardData?.getData('text/plain') ?? '');
			},
			{ capture: true }
		);
		this.terminal.onSelectionChange(() => {
			if (this.terminal.hasSelection()) events.selected(this, this.terminal.getSelection());
		});
	}

	#terminalOptions(options: TerminalOptions) {
		return {
			fontFamily: options.fontFamily,
			fontSize: options.fontSize,
			fontWeightBold: 'bold' as const,
			scrollback: options.scrollback,
			cursorStyle: options.cursorStyle,
			cursorBlink: options.cursorBlink,
			cursorInactiveStyle: 'outline' as const,
			theme: options.theme,
			allowTransparency: options.transparent,
			minimumContrastRatio: options.minimumContrastRatio
		};
	}

	configure(options: TerminalOptions) {
		const next = this.#terminalOptions(options);
		const current = this.terminal.options;
		for (const [key, value] of Object.entries(next) as [keyof typeof next, never][]) {
			if (current[key] !== value) current[key] = value;
		}
		if (this.#visible) this.fit();
	}

	attach(container: HTMLElement) {
		container.append(this.host);
		if (this.#opened) return;
		this.#opened = true;
		this.terminal.open(this.host);
		this.#fit.fit();
		void this.#start();
	}

	async #start() {
		const { cols, rows } = this.terminal;
		let id: number;
		try {
			id = await pty.spawn({ cols, rows }, this.#request);
		} catch (error) {
			this.terminal.write(`\x1b[2m${error}\x1b[0m\r\n`);
			return;
		}
		if (this.#disposed) return void pty.close(id);
		this.#id = id;
		this.#input = new InputQueue(id);
		this.#disconnect = connect(id, {
			write: (data, parsed) => this.terminal.write(data, parsed),
			exited: () => this.#events.exited(this)
		});
		const size = { cols: this.terminal.cols, rows: this.terminal.rows };
		if (size.cols !== cols || size.rows !== rows) this.#input.resize(size);
	}

	setVisible(visible: boolean) {
		this.#visible = visible;
		if (!visible || !this.#opened) return;
		acquireRenderer(this.terminal);
		this.fit();
	}

	fit() {
		if (this.host.clientWidth > 0 && this.host.clientHeight > 0) this.#fit.fit();
	}

	focus() {
		this.terminal.focus();
	}

	paste(text: string) {
		this.terminal.paste(text.replaceAll('\x1b[201~', ''));
		this.focus();
	}

	copySelection() {
		const text = this.terminal.getSelection();
		if (text) void navigator.clipboard.writeText(text);
	}

	scrollToPrompt(direction: -1 | 1) {
		this.#integration.scrollToPrompt(direction);
	}

	foreground() {
		return this.#id === null ? Promise.resolve(null) : pty.foreground(this.#id);
	}

	dispose() {
		this.#disposed = true;
		this.#disconnect?.();
		this.#integration.dispose();
		releaseRenderer(this.terminal);
		this.terminal.dispose();
		this.host.remove();
	}
}
