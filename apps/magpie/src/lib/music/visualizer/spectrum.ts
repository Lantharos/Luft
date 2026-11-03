export const BAND_COUNT = 64;

const FFT_SIZE = 2048;
const LOWEST_HZ = 30;
const HIGHEST_HZ = 15000;
const ATTACK_PER_SECOND = 22;
const RELEASE_PER_SECOND = 3.5;
const CALM = 0.12;
const AT_REST = 0.004;
const SPREAD = [1, 4, 6, 4, 1].map((weight) => weight / 16);
const SPREAD_PASSES = 2;
const RANGES = [
	[0, 10],
	[10, 36],
	[36, BAND_COUNT]
] as const;

class Spectrum {
	readonly bands = new Uint8Array(BAND_COUNT);
	readonly energy = new Float32Array(RANGES.length);

	#levels = new Float32Array(BAND_COUNT);
	#targets = new Float32Array(BAND_COUNT);
	#spread = new Float32Array(BAND_COUNT);
	#bins = new Uint8Array(FFT_SIZE / 2);
	#edges = new Uint16Array(BAND_COUNT + 1);
	#context: AudioContext | null = null;
	#bus: GainNode | null = null;
	#analyser: AnalyserNode | null = null;
	#tapped = new WeakSet<HTMLMediaElement>();
	#elements: readonly HTMLMediaElement[] = [];
	#listening = false;

	listen(elements: readonly HTMLMediaElement[]) {
		const context = this.#context ?? this.#create();
		this.#elements = elements;
		if (context.state === 'running') this.#tap();
		else this.#resumeOnGesture(context);
		if (!this.#listening) this.#bus!.connect(this.#analyser!);
		this.#listening = true;
	}

	stop() {
		if (this.#listening) this.#bus!.disconnect(this.#analyser!);
		this.#listening = false;
		this.#levels.fill(0);
		this.bands.fill(0);
		this.energy.fill(0);
	}

	update(seconds: number, live: boolean, calm: boolean) {
		if (live) this.#hear();
		else this.#targets.fill(0);
		const pace = calm ? CALM : 1;
		const rise = 1 - Math.exp(-ATTACK_PER_SECOND * pace * seconds);
		const fall = 1 - Math.exp(-RELEASE_PER_SECOND * pace * seconds);
		let moving = false;
		for (let band = 0; band < BAND_COUNT; band++) {
			const target = this.#targets[band];
			const level = this.#levels[band];
			const next = level + (target - level) * (target > level ? rise : fall);
			this.#levels[band] = next;
			this.bands[band] = Math.round(next * 255);
			moving ||= next > AT_REST;
		}
		RANGES.forEach(([from, to], index) => (this.energy[index] = this.#average(from, to)));
		return moving;
	}

	#hear() {
		this.#analyser!.getByteFrequencyData(this.#bins);
		for (let band = 0; band < BAND_COUNT; band++) this.#targets[band] = this.#loudness(band);
		for (let pass = 0; pass < SPREAD_PASSES; pass++) {
			for (let band = 0; band < BAND_COUNT; band++) {
				let sum = 0;
				SPREAD.forEach((weight, offset) => (sum += weight * this.#targets[Math.min(BAND_COUNT - 1, Math.max(0, band + offset - 2))]));
				this.#spread[band] = sum;
			}
			this.#targets.set(this.#spread);
		}
	}

	#loudness(band: number) {
		let peak = 0;
		for (let bin = this.#edges[band]; bin < this.#edges[band + 1]; bin++) peak = Math.max(peak, this.#bins[bin]);
		const tilt = 0.82 + (0.45 * band) / BAND_COUNT;
		return Math.min(1, (peak / 255) ** 1.35 * tilt);
	}

	#average(from: number, to: number) {
		let sum = 0;
		for (let band = from; band < to; band++) sum += this.#levels[band];
		return sum / (to - from);
	}

	#create() {
		const context = new AudioContext({ latencyHint: 'playback' });
		this.#bus = context.createGain();
		this.#bus.connect(context.destination);
		this.#analyser = new AnalyserNode(context, { fftSize: FFT_SIZE, smoothingTimeConstant: 0.55, minDecibels: -88, maxDecibels: -20 });
		const binHz = context.sampleRate / FFT_SIZE;
		for (let band = 0; band <= BAND_COUNT; band++) {
			const hz = LOWEST_HZ * (HIGHEST_HZ / LOWEST_HZ) ** (band / BAND_COUNT);
			this.#edges[band] = band === 0 ? Math.round(hz / binHz) : Math.max(this.#edges[band - 1] + 1, Math.round(hz / binHz));
		}
		context.addEventListener('statechange', () => context.state === 'running' && this.#tap());
		this.#context = context;
		return context;
	}

	#resumeOnGesture(context: AudioContext) {
		void context.resume();
		window.addEventListener('pointerdown', () => void context.resume(), { once: true, capture: true });
	}

	#tap() {
		for (const element of this.#elements) {
			if (this.#tapped.has(element)) continue;
			this.#context!.createMediaElementSource(element).connect(this.#bus!);
			this.#tapped.add(element);
		}
	}
}

export const spectrum = new Spectrum();
