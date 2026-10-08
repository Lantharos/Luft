<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { Row, Section, Segmented } from '@luft/ui';
	import { thumbnail } from '../../personalization/appearance/api';

	interface Props {
		wallpaper: string | null;
		version: number;
		onchoose: () => void;
		onclear: () => void;
	}

	let { wallpaper, version, onchoose, onclear }: Props = $props();

	let preview = $state<string | null>(null);

	$effect(() => {
		void version;
		if (!wallpaper) return;
		void thumbnail(wallpaper).then((path) => (preview = fileUrl(path)));
	});

	function pick(choice: string) {
		if (choice === 'shared') onchoose();
		else onclear();
	}
</script>

<Section>
	<Row
		title="Wallpaper"
		description={wallpaper ? 'Everyone sees the same picture before they sign in' : 'Everyone sees their own wallpaper when they choose their account'}
	>
		<Segmented
			label="Login screen wallpaper"
			options={[
				{ value: 'own', label: 'Their own' },
				{ value: 'shared', label: 'Same for everyone' }
			]}
			value={wallpaper ? 'shared' : 'own'}
			onchange={pick}
		/>
	</Row>
	{#if wallpaper}
		<Row title="Picture" description="Shown behind the login screen">
			<span class="preview">
				{#if preview}
					<img src={preview} alt="" decoding="async" />
				{/if}
			</span>
			<button type="button" class="button" onclick={onchoose}>Change</button>
		</Row>
	{/if}
</Section>

<style>
	.preview {
		height: 60px;
		width: 96px;
		overflow: hidden;
		border-radius: 10px;
		background: var(--control);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: appear 240ms var(--ease);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
