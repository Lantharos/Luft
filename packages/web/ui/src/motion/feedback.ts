import { Feedback, Role, type RoleToken } from '@luft/motion';
import { motionPreference } from './preference';

const PRESSABLE = 'button, a[href], summary, [role="button"], [role="link"], [role="tab"], [role="option"], [role^="menuitem"]';
const UNPRESSABLE = ':disabled, [aria-disabled="true"], [role="switch"], [role="slider"], [role="checkbox"], [data-no-press]';
const WIDEST_PRESS = 960;
const FAST_TRAVEL = 2;
const SPEED_SMOOTHING = 0.4;

const scales = new WeakMap<HTMLElement, Animation>();

function pressable(target: EventTarget | null) {
	const element = target instanceof Element ? target.closest<HTMLElement>(PRESSABLE) : null;
	return element && !element.matches(UNPRESSABLE) ? element : null;
}

function pressedScale(element: HTMLElement) {
	const { width, height } = element.getBoundingClientRect();
	const size = Math.max(width, height);
	if (!size || size > WIDEST_PRESS) return 1;
	return Math.max(Feedback.deepestPress, 1 - (2 * Feedback.pressDepth) / size);
}

function scaleTo(element: HTMLElement, scale: number, role: RoleToken, fill: FillMode) {
	const from = getComputedStyle(element).scale;
	scales.get(element)?.cancel();
	const animation = element.animate({ scale: [from === 'none' ? '1' : from, String(scale)] }, { duration: role.duration, easing: role.easing, fill });
	scales.set(element, animation);
	animation.onfinish = () => {
		if (fill === 'none' && scales.get(element) === animation) scales.delete(element);
	};
}

export function pressFeedback(): () => void {
	const pressed = new Map<number, HTMLElement>();

	const press = (event: PointerEvent) => {
		if (event.button !== 0 || motionPreference() !== 'full') return;
		const element = pressable(event.target);
		const scale = element ? pressedScale(element) : 1;
		if (!element || scale === 1) return;
		pressed.set(event.pointerId, element);
		scaleTo(element, scale, Role.press, 'forwards');
	};

	const release = (event: PointerEvent) => {
		const element = pressed.get(event.pointerId);
		if (!element) return;
		pressed.delete(event.pointerId);
		scaleTo(element, 1, Role.release, 'none');
	};

	const options = { capture: true, passive: true };
	window.addEventListener('pointerdown', press, options);
	window.addEventListener('pointerup', release, options);
	window.addEventListener('pointercancel', release, options);
	return () => {
		window.removeEventListener('pointerdown', press, options);
		window.removeEventListener('pointerup', release, options);
		window.removeEventListener('pointercancel', release, options);
	};
}

export class Stretch {
	#animation: Animation | null = null;
	#speed = 0;
	#moved = 0;

	constructor(private readonly element: HTMLElement) {}

	travel(): void {
		this.#play([{ transform: 'none' }, { transform: `scaleX(${Feedback.stretch})`, offset: 0.3 }, { transform: 'none' }]);
	}

	follow(distance: number, time: number): void {
		const speed = Math.abs(distance) / Math.max(1, time - this.#moved);
		this.#moved = time;
		this.#speed += (speed - this.#speed) * SPEED_SMOOTHING;
		const amount = 1 + (Feedback.stretch - 1) * Math.min(1, this.#speed / FAST_TRAVEL);
		this.#play([{ transform: `scaleX(${amount})` }, { transform: 'none' }]);
	}

	#play(keyframes: Keyframe[]) {
		this.#animation?.cancel();
		this.#animation = motionPreference() === 'full' ? this.element.animate(keyframes, { duration: Role.move.duration, easing: Role.move.easing }) : null;
	}
}
