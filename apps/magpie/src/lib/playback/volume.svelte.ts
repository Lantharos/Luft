const KEY = 'magpie.volume';

function stored() {
	const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
	return { volume: Number(saved?.volume ?? 1), muted: Boolean(saved?.muted) };
}

class Volume {
	level = $state(1);
	muted = $state(false);

	start() {
		const saved = stored();
		this.level = Math.min(1, Math.max(0, saved.volume));
		this.muted = saved.muted;
	}

	save() {
		localStorage.setItem(KEY, JSON.stringify({ volume: this.level, muted: this.muted }));
	}
}

export const volume = new Volume();
