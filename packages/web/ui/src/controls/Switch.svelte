<script lang="ts">
	import { Stretch } from '../motion/feedback';

	interface Props {
		checked: boolean;
		label: string;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { checked, label, disabled = false, onchange }: Props = $props();

	let stretch: Stretch | undefined;
	let shown: boolean | undefined;

	$effect(() => {
		if (shown !== undefined && shown !== checked) stretch?.travel();
		shown = checked;
	});
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	class="switch"
	class:on={checked}
	onclick={() => onchange(!checked)}
>
	<span class="knob" {@attach (knob) => void (stretch = new Stretch(knob))}></span>
</button>

<style>
	.switch {
		--knob: 24px;
		--travel: 22px;
		position: relative;
		flex: none;
		height: 30px;
		width: 52px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--ink) 16%, transparent);
		transition:
			background-color var(--motion-standard) var(--ease-glide),
			opacity var(--motion-tap) var(--ease-decelerate);
	}

	.switch:hover:not(:disabled) {
		background: color-mix(in oklab, var(--ink) 21%, transparent);
	}

	.switch.on,
	.switch.on:hover:not(:disabled) {
		background: var(--accent);
	}

	.switch:disabled {
		opacity: 0.4;
	}

	.knob {
		position: absolute;
		top: 3px;
		left: 3px;
		height: var(--knob);
		width: var(--knob);
		border-radius: var(--radius-pill);
		background: #fff;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.18),
			0 2px 6px rgba(0, 0, 0, 0.16);
		transition:
			translate var(--spring-smooth-duration) var(--spring-smooth),
			scale var(--spring-snappy-duration) var(--spring-snappy),
			background-color var(--motion-standard) var(--ease-glide);
	}

	.on .knob {
		translate: var(--travel) 0;
		background: oklch(from var(--accent) clamp(0.3, calc((0.9 - l) * 14 + 0.3), 1) 0 h);
	}

	.switch:active:not(:disabled) .knob {
		scale: 1.15 1;
	}

	:global(:root[data-motion='reduced']) .switch:active:not(:disabled) .knob {
		scale: none;
	}
</style>
