<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import RowValue from '#lib/components/RowValue.svelte';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import ChoiceDialog from './ChoiceDialog.svelte';
	import { actionLabel, actionsFor, describe, type ActionChoices, type ButtonKey, type PenAction, type PenSettings } from './actions';

	interface Props {
		pen: SettingsGroup<PenSettings>;
		choices: ActionChoices;
	}

	let { pen, choices }: Props = $props();

	const ERASE = 'erase';
	const BUTTONS: { key: ButtonKey; title: string; description: string }[] = [
		{ key: 'secondary-button', title: 'settings-pen-upper-button', description: 'settings-pen-upper-button-description' },
		{ key: 'button', title: 'settings-pen-lower-button', description: 'settings-pen-lower-button-description' },
		{ key: 'eraser-button', title: 'settings-pen-eraser', description: 'settings-pen-eraser-description' }
	];

	let editing = $state<ButtonKey | null>(null);

	const action = (key: ButtonKey) => pen.values[`${key}-action`] ?? 'nothing';
	const keys = (key: ButtonKey) => pen.values[`${key}-keybinding`] ?? '';
	const erases = () => pen.values['eraser-button-mode'] !== 'button';

	function current(key: ButtonKey) {
		return key === 'eraser-button' && erases() ? ERASE : action(key);
	}

	function value(key: ButtonKey) {
		return current(key) === ERASE ? t('settings-pen-eraser-erases') : describe(action(key), keys(key));
	}

	function options(key: ButtonKey) {
		const actions = actionsFor(choices, key).map((choice) => ({ value: choice as string, label: actionLabel(choice) }));
		return key === 'eraser-button' ? [{ value: ERASE, label: t('settings-pen-eraser-erases') }, ...actions] : actions;
	}

	async function choose(key: ButtonKey, chosen: string, accelerator: string) {
		editing = null;
		if (key === 'eraser-button') await pen.set('eraser-button-mode', chosen === ERASE ? 'default' : 'button');
		if (chosen === ERASE) return;
		if (chosen === 'keybinding') await pen.set(`${key}-keybinding`, accelerator);
		await pen.set(`${key}-action`, chosen as PenAction);
	}
</script>

<Section title={t('settings-pen-buttons')}>
	{#each BUTTONS as button (button.key)}
		<Row title={t(button.title)} description={t(button.description)} onclick={() => (editing = button.key)}>
			<RowValue text={value(button.key)} />
		</Row>
	{/each}
</Section>

{#if editing}
	{@const key = editing}
	<ChoiceDialog
		title={t(BUTTONS.find((button) => button.key === key)!.title)}
		options={options(key)}
		current={current(key)}
		keys={keys(key)}
		onchoose={(chosen, accelerator) => choose(key, chosen, accelerator)}
		onclose={() => (editing = null)}
	/>
{/if}
