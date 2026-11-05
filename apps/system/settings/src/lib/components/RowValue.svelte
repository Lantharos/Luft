<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
</script>

<span class="value">{text}</span>

<style>
	.value {
		overflow: hidden;
		max-width: 260px;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13.5px;
		color: var(--text-muted);
	}
</style>
