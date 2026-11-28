<script lang="ts">
	import { t } from '@luft/i18n';
	import { flow } from '#lib/state/flow.svelte.js';
</script>

<section class="flex h-full flex-col items-center justify-center gap-9 px-14 pb-6 text-center">
	<svg class="mark" viewBox="0 0 187 197" fill="currentColor" aria-hidden="true">
		<path
			class="lower"
			d="M119.718 130.99C159.986 113.061 161.602 43.9304 179.53 84.1989C197.459 124.467 179.349 171.645 139.081 189.574C98.8128 207.503 51.6341 189.393 33.7053 149.125C15.7766 108.856 79.4495 148.919 119.718 130.99Z"
		/>
		<path
			class="upper"
			d="M78.4133 63.6013C118.682 45.6726 131.515 -28.4531 149.444 11.8151C167.372 52.0837 149.262 99.2624 108.993 117.191C68.7249 135.12 21.5471 117.009 3.61838 76.7409C-14.3103 36.4724 38.1448 81.5298 78.4133 63.6013Z"
		/>
	</svg>
	<header class="words flex flex-col gap-2.5">
		<h1 class="text-[34px] leading-tight font-semibold">{t('setup-welcome-title')}</h1>
		<p class="text-[15px] text-[var(--text-soft)]">{t('setup-welcome-line')}</p>
	</header>
	<button type="button" class="start button primary large px-7" onclick={() => flow.next()}>{t('setup-welcome-start')}</button>
</section>

<style>
	.mark {
		height: 92px;
		overflow: visible;
		color: var(--text);
	}

	.lower {
		opacity: 0.5;
		transform-box: fill-box;
		transform-origin: center;
		animation:
			settle-lower 900ms var(--ease-decelerate) backwards,
			drift 7s ease-in-out 900ms infinite alternate;
	}

	.upper {
		transform-box: fill-box;
		transform-origin: center;
		animation: settle-upper 900ms var(--ease-decelerate) backwards;
	}

	.words {
		animation: rise 700ms var(--ease-decelerate) 250ms backwards;
	}

	.start {
		animation: rise 700ms var(--ease-decelerate) 450ms backwards;
	}

	@keyframes settle-lower {
		from {
			opacity: 0;
			transform: translate(14px, 22px);
		}
	}

	@keyframes settle-upper {
		from {
			opacity: 0;
			transform: translate(-14px, -22px);
		}
	}

	@keyframes drift {
		to {
			transform: translate(3px, 5px);
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	:global(:root[data-motion='reduced']) :is(.lower, .upper, .words, .start) {
		animation: none;
	}
</style>
