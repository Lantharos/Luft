<script lang="ts">
	import * as api from '$lib/api';
	import type { Drive, Segment } from '$lib/api';
	import { bytes, filesystemName, inner, volumeName } from '$lib/format';
	import FreeActions from './FreeActions.svelte';
	import VolumeActions from './VolumeActions.svelte';

	interface Props {
		drive: Drive;
		segment: Segment;
	}

	let { drive, segment }: Props = $props();

	function format(segment: Extract<Segment, { kind: 'volume' }>) {
		const name = filesystemName(segment);
		const contents = inner(segment);
		if (!segment.encryption) return name;
		const kind = segment.encryption.kind.toUpperCase();
		return segment.encryption.cleartext ? `${filesystemName(contents)}, encrypted with ${kind}` : `Encrypted with ${kind}, locked`;
	}
</script>

{#if segment.kind === 'free'}
	<FreeActions {drive} {segment} />
{:else}
	{@const contents = inner(segment)}
	<VolumeActions {drive} volume={segment} />
	<section class="flex flex-col gap-3 px-1.5">
		<h2 class="truncate text-[15px] font-semibold">{volumeName(segment)}</h2>
		<dl class="facts">
			<dt>Format</dt>
			<dd>{format(segment)}</dd>
			<dt>Size</dt>
			<dd>
				{bytes(segment.size)}{#if contents.used !== null}<span class="muted">, {bytes(contents.used)} used</span>{/if}
			</dd>
			{#if contents.usage === 'filesystem'}
				<dt>Mounted at</dt>
				<dd>
					{#if contents.mountPoints.length}
						<button type="button" class="link" onclick={() => api.openFolder(contents.mountPoints[0])}>{contents.mountPoints.join(', ')}</button>
					{:else}
						<span class="muted">Not mounted</span>
					{/if}
				</dd>
			{/if}
			{#if contents.startup}
				<dt>At startup</dt>
				<dd>Mounts at {contents.startup.directory}</dd>
			{/if}
			<dt>Device</dt>
			<dd>{segment.device}</dd>
			{#if segment.uuid}
				<dt>UUID</dt>
				<dd class="select-text font-mono text-[12.5px]">{segment.uuid}</dd>
			{/if}
		</dl>
	</section>
{/if}

<style>
	.facts {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: 10px 28px;
		font-size: 13.5px;
	}

	.facts dt {
		color: var(--text-muted);
	}

	.facts dd {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.muted {
		color: var(--text-muted);
	}

	.link {
		max-width: 100%;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--hairline);
		text-underline-offset: 3px;
	}

	.link:hover {
		text-decoration-color: currentColor;
	}
</style>
