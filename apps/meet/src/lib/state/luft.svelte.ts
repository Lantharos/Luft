import * as meet from '#lib/bridge/meet.js';
import type { Installed, Range } from '#lib/bridge/meet.js';
import { session } from './meet.svelte.js';

class LuftState {
	installed = $state<Installed | null>(null);
	range = $state<Range | null | undefined>(undefined);
	size = $state(0);

	private show(installed: Installed) {
		this.installed = installed;
		this.size = installed.size;
	}

	async open() {
		session.go('luft');
		this.installed = null;
		const found = await session.run(
			'luft',
			() => meet.luft().then((installed) => ({ installed })),
			() => this.open()
		);
		if (!found) return;
		if (found.installed) this.show(found.installed);
		else session.go('hello', -1);
	}

	async measure() {
		session.go('resize');
		this.range = undefined;
		this.size = this.installed?.size ?? 0;
		const measured = await session.run(
			'luft',
			() => meet.luftRange().then((range) => ({ range })),
			() => this.measure()
		);
		if (measured) this.range = measured.range;
	}

	async resize() {
		const size = this.size;
		const work = () => meet.resizeLuft(size);
		const installed =
			size > (this.installed?.size ?? 0)
				? await session.working('resize', 'shrinking', work, () => this.resize(), 'luft', 'resize')
				: await session.run('resize', work, () => this.resize());
		if (!installed) return;
		this.show(installed);
		if (session.step === 'resize') session.go('luft');
	}

	async cancel() {
		const installed = await session.run('cancel', () => meet.cancelResize(), () => this.cancel());
		if (installed) this.show(installed);
	}

	async giveWindows() {
		const installed = await session.run('give', () => meet.giveWindows(), () => this.giveWindows());
		if (installed) this.show(installed);
	}

	async cleanUp() {
		const installed = await session.run(
			'remove',
			() => meet.undo().then(() => meet.luft()),
			() => this.cleanUp()
		);
		if (installed) this.show(installed);
	}

	async start() {
		await session.run('restart', () => meet.startLuft(), () => this.start());
	}

	async remove() {
		await session.working('remove', 'removing', () => meet.removeLuft().then(() => true), () => this.remove(), 'removed', 'luft');
	}
}

export const luft = new LuftState();
