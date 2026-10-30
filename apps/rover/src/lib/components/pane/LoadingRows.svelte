<div class="loading-rows" aria-hidden="true">
	{#each { length: 10 }, index (index)}
		<span style:opacity={0.5 - index * 0.04}></span>
	{/each}
</div>

<style>
	.loading-rows {
		display: grid;
		gap: 8px;
		padding: 40px 20px 0;
		animation: loading-in var(--motion-standard) var(--ease-decelerate) both;
	}

	.loading-rows span {
		height: 26px;
		border-radius: 8px;
		background: var(--surface-hover);
	}

	@keyframes loading-in {
		from {
			opacity: 0;
			scale: 0.98;
		}
	}
</style>
