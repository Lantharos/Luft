<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Row, Section, Spinner } from '@luft/ui';
	import { commands } from '#lib/bindings.js';

	const WAIT_FOR_PASSWORD = { timeoutMs: 300_000 };

	let available = $state(false);
	let asking = $state(false);
	let erasing = $state(false);
	let error = $state('');

	async function erase() {
		erasing = true;
		error = '';
		try {
			await commands.eraseEverything(WAIT_FOR_PASSWORD);
		} catch (reason) {
			error = errorText(reason);
			erasing = false;
		}
	}

	void commands.eraseAvailable().then((erasable) => (available = erasable));
</script>

{#if available}
	<Section>
		<Row title={t('settings-erase')} description={t('settings-erase-description')}>
			<button type="button" class="button danger" onclick={() => (asking = true)}>{t('settings-erase-open')}</button>
		</Row>
	</Section>
{/if}

{#if asking}
	<Dialog title={t('settings-erase-title')} description={t('settings-erase-explanation')} onclose={() => !erasing && (asking = false)}>
		{#if error}
			<p class="text-[13px] text-[var(--danger)]">{error}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button" disabled={erasing} onclick={() => (asking = false)}>{t('settings-erase-cancel')}</button>
			<button type="button" class="button danger" disabled={erasing} onclick={erase}>
				{#if erasing}<Spinner />{/if}{t('settings-erase-confirm')}
			</button>
		{/snippet}
	</Dialog>
{/if}
