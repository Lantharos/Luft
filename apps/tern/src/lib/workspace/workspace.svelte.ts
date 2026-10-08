import { appWindow, isAvailable } from '@lantharos/sabine';
import { settings } from '#lib/state/settings.svelte.js';
import type { FinishedCommand } from '#lib/terminal/integration.js';
import { pasteRisks } from '#lib/terminal/paste.js';
import { TerminalSession, type SessionEvents } from '#lib/terminal/session.svelte.js';
import type { LaunchRequest } from '#lib/types.js';
import { neighbor, type Direction } from './layout';
import { handleShortcut } from './shortcuts';
import { Tab } from './tab.svelte';

const LONG_COMMAND_MS = 10_000;

export interface PasteReview {
	session: TerminalSession;
	text: string;
	risks: string[];
}

export interface TerminalMenu {
	session: TerminalSession;
	x: number;
	y: number;
}

export interface CloseReview {
	programs: string[];
	close: () => void;
}

function describeDuration(milliseconds: number) {
	const seconds = Math.round(milliseconds / 1000);
	if (seconds < 60) return `${seconds} s`;
	const minutes = Math.floor(seconds / 60);
	return minutes < 60 ? `${minutes} min ${seconds % 60} s` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export class Workspace {
	tabs = $state<Tab[]>([]);
	active = $state<Tab | null>(null);
	searching = $state<TerminalSession | null>(null);
	pasteReview = $state<PasteReview | null>(null);
	closeReview = $state<CloseReview | null>(null);
	preferencesOpen = $state(false);
	menu = $state<TerminalMenu | null>(null);
	busy = $derived(this.tabs.some((tab) => tab.sessions.some((session) => session.busy)));

	#events: SessionEvents = {
		finished: (session, command) => this.#finished(session, command),
		exited: (session) => this.#remove(session),
		bell: (session) => {
			const tab = this.#tabOf(session);
			if (tab && tab !== this.active) tab.ringing = true;
		},
		selected: (_, text) => {
			if (settings.current.copyOnSelect) void navigator.clipboard.writeText(text);
		},
		pasted: (session, text) => this.paste(session, text),
		key: (event) => handleShortcut(event, this)
	};

	get focused() {
		return this.active?.focused ?? null;
	}

	#tabOf(session: TerminalSession) {
		return this.tabs.find((tab) => tab.sessions.includes(session));
	}

	#session(request: LaunchRequest) {
		return new TerminalSession(settings.options, request, this.#events);
	}

	#here(): LaunchRequest {
		return { directory: this.focused?.cwd ?? null, command: null };
	}

	openTab(request = this.#here()) {
		const tab = new Tab(this.#session(request));
		const index = this.active ? this.tabs.indexOf(this.active) + 1 : this.tabs.length;
		this.tabs.splice(index, 0, tab);
		this.select(tab);
	}

	select(tab: Tab) {
		this.active = tab;
		tab.ringing = false;
	}

	selectOffset(offset: number) {
		if (!this.active || this.tabs.length < 2) return;
		const index = this.tabs.indexOf(this.active);
		this.select(this.tabs[(index + offset + this.tabs.length) % this.tabs.length]);
	}

	moveTab(offset: number) {
		if (!this.active) return;
		const from = this.tabs.indexOf(this.active);
		const to = Math.min(this.tabs.length - 1, Math.max(0, from + offset));
		this.tabs.splice(to, 0, ...this.tabs.splice(from, 1));
	}

	split(direction: Direction) {
		this.active?.split(this.#session(this.#here()), direction);
	}

	focusSession(session: TerminalSession) {
		const tab = this.#tabOf(session);
		if (!tab) return;
		tab.focused = session;
		if (tab !== this.active) this.select(tab);
	}

	focusNeighbor(key: string) {
		if (!this.active || !this.focused) return false;
		const next = neighbor(this.active.sessions, this.focused, key);
		if (next) this.focusSession(next);
		return next !== null;
	}

	async closeSession(session: TerminalSession) {
		const program = await session.foreground();
		if (!program) return this.#remove(session);
		this.closeReview = { programs: [program], close: () => this.#remove(session) };
	}

	async closeTab(tab: Tab) {
		const programs = (await Promise.all(tab.sessions.map((session) => session.foreground()))).filter((name) => name !== null);
		const close = () => [...tab.sessions].forEach((session) => this.#remove(session));
		if (programs.length === 0) close();
		else this.closeReview = { programs, close };
	}

	#remove(session: TerminalSession) {
		const tab = this.#tabOf(session);
		session.dispose();
		if (this.searching === session) this.searching = null;
		if (!tab || tab.remove(session)) return;
		const index = this.tabs.indexOf(tab);
		this.tabs.splice(index, 1);
		if (this.tabs.length === 0) {
			if (isAvailable()) appWindow.close();
			return;
		}
		if (this.active === tab) this.select(this.tabs[Math.min(index, this.tabs.length - 1)]);
	}

	paste(session: TerminalSession, text: string) {
		if (!text) return;
		const risks = pasteRisks(text, session.terminal.modes.bracketedPasteMode);
		if (risks.length === 0) session.paste(text);
		else this.pasteReview = { session, text, risks };
	}

	#finished(session: TerminalSession, { command, duration, code }: FinishedCommand) {
		const tab = this.#tabOf(session);
		if (!tab || duration < LONG_COMMAND_MS || (tab === this.active && document.hasFocus())) return;
		const took = describeDuration(duration);
		const body = code === 0 ? `Finished in ${took}` : `Failed after ${took}`;
		const notification = new Notification(command || tab.title, { body, tag: tab.key });
		notification.onclick = () => {
			const target = this.tabs.find((candidate) => candidate.key === tab.key);
			if (target) this.select(target);
		};
	}

	configure() {
		for (const tab of this.tabs) {
			for (const session of tab.sessions) session.configure(settings.options);
		}
	}
}
