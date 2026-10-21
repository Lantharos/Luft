<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Checkbox, Dialog } from '@luft/ui';
	import type { Place } from '#lib/bridge/meet.js';
	import { volumeDetail, volumeName } from './describe.js';

	interface Props {
		place: Place;
		onconfirm: () => void;
		onclose: () => void;
	}

	let { place, onconfirm, onclose }: Props = $props();

	let understood = $state(false);
	let locked = $derived(place.contents.some((contents) => contents.bitlocker));
</script>

<Dialog
	title={t('room-erase-title', { drive: place.drive.name })}
	description={place.contents.length > 0
		? t('room-erase-description', { size: bytes(place.drive.size) })
		: t('room-erase-empty', { size: bytes(place.drive.size) })}
	wide
	{onclose}
>
	{#if place.contents.length > 0}
		<ul class="flex flex-col gap-2.5">
			{#each place.contents as contents, index (index)}
				<li class="flex flex-col">
					<span class="text-[14px] font-medium">{volumeName(contents)}</span>
					<span class="text-[12.5px] text-[var(--text-muted)]">{volumeDetail(contents)}</span>
					{#if contents.bitlocker}
						<span class="text-[12.5px] text-[var(--danger)]">{t('room-erase-bitlocker')}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if locked}
		<div class="mt-4">
			<Checkbox label={t('room-erase-understood')} checked={understood} onchange={(next) => (understood = next)}>
				<span class="text-[13px] leading-snug">{t('room-erase-understood')}</span>
			</Checkbox>
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('meet-cancel')}</button>
		<button type="button" class="button danger" disabled={locked && !understood} onclick={onconfirm}>{t('room-erase-confirm')}</button>
	{/snippet}
</Dialog>
