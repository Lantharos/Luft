import { DampedSpring, Spring, type SpringToken } from '@luft/motion';

import { motionPreference } from './preference';

const SAMPLES_PER_SECOND = 90;

type Style = Partial<Record<'translate' | 'scale' | 'rotate' | 'opacity', string>>;

interface Segment {
	spring: DampedSpring;
	target: number;
	started: number;
	duration: number;
}

export interface SpringOptions {
	spring?: SpringToken;
	velocity?: number;
	epsilon?: number;
}

const calm = (token: SpringToken): SpringToken => (motionPreference() === 'full' ? token : { ...token, bounce: Math.min(0, token.bounce) });

export class SpringValue {
	private animation: Animation | null = null;
	private segment: Segment | null = null;
	private resting: number;

	constructor(
		private readonly element: HTMLElement,
		private readonly style: (value: number) => Style,
		initial = 0,
		private readonly token: SpringToken = Spring.snappy
	) {
		this.resting = initial;
		this.apply(initial);
	}

	get value(): number {
		return this.state().value;
	}

	get velocity(): number {
		return this.state().velocity;
	}

	set(value: number): void {
		this.stop();
		this.resting = value;
		this.apply(value);
	}

	to(target: number, { spring = this.token, velocity, epsilon = 0.5 }: SpringOptions = {}): Promise<boolean> {
		const preference = motionPreference();
		if (preference === 'off' || (preference === 'reduced' && velocity === undefined)) {
			this.set(target);
			return Promise.resolve(true);
		}
		const current = this.state();
		const motion = new DampedSpring(calm(spring), { offset: current.value - target, velocity: velocity ?? current.velocity });
		const duration = motion.settleTime(epsilon);
		const steps = Math.max(1, Math.ceil(duration * SAMPLES_PER_SECOND));
		const frames = Array.from({ length: steps + 1 }, (_, step) => this.style(target + motion.at((duration * step) / steps).offset));
		frames[steps] = this.style(target);
		this.stop();
		this.resting = target;
		this.apply(target);
		const animation = this.element.animate(frames as Keyframe[], { duration: duration * 1000, easing: 'linear' });
		this.animation = animation;
		this.segment = { spring: motion, target, started: performance.now(), duration };
		return animation.finished.then(
			() => {
				if (this.animation === animation) this.segment = this.animation = null;
				return true;
			},
			() => false
		);
	}

	private state(): { value: number; velocity: number } {
		const segment = this.segment;
		if (!segment) return { value: this.resting, velocity: 0 };
		const elapsed = (performance.now() - segment.started) / 1000;
		if (elapsed >= segment.duration) return { value: segment.target, velocity: 0 };
		const { offset, velocity } = segment.spring.at(elapsed);
		return { value: segment.target + offset, velocity };
	}

	private stop(): void {
		if (this.animation) {
			const { value } = this.state();
			this.resting = value;
			this.animation.cancel();
		}
		this.animation = this.segment = null;
	}

	private apply(value: number): void {
		Object.assign(this.element.style, this.style(value));
	}
}
