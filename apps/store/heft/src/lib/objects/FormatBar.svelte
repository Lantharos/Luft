<script lang="ts">
	import Bold from '@lucide/svelte/icons/bold';
	import Heading from '@lucide/svelte/icons/heading';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';

	const FORMATS = [
		{ label: () => t('format-heading'), icon: Heading, apply: () => document.execCommand('formatBlock', false, document.queryCommandValue('formatBlock') === 'h2' ? 'div' : 'h2') },
		{ label: () => t('format-bold'), icon: Bold, apply: () => document.execCommand('bold') },
		{ label: () => t('format-list'), icon: List, apply: () => document.execCommand('insertUnorderedList') },
		{ label: () => t('format-numbered'), icon: ListOrdered, apply: () => document.execCommand('insertOrderedList') }
	];
</script>

{#each FORMATS as format (format.icon)}
	<button type="button" class="icon-button" aria-label={format.label()} {@attach tooltip(format.label())} onpointerdown={(event) => event.preventDefault()} onclick={format.apply}>
		<format.icon size={17} />
	</button>
{/each}
