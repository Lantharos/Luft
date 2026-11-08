import { t } from '@luft/i18n';
import { labels } from '../input/shortcuts/keys/accelerator';

export const PEN_SCHEMA = 'com.lantharos.kestrel.pen';

export type PenAction = 'right' | 'middle' | 'eraser' | 'screenshot' | 'notes' | 'start' | 'back' | 'forward' | 'switch-monitor' | 'keybinding' | 'nothing';

export type ButtonKey = 'button' | 'secondary-button' | 'eraser-button';

export type PenSettings = {
	hand: string;
	'pressure-curve': number[];
	'eraser-pressure-curve': number[];
	'button-action': PenAction;
	'button-keybinding': string;
	'secondary-button-action': PenAction;
	'secondary-button-keybinding': string;
	'eraser-button-mode': string;
	'eraser-button-action': PenAction;
	'eraser-button-keybinding': string;
};

export const PEN_KEYS: (keyof PenSettings)[] = [
	'hand',
	'pressure-curve',
	'eraser-pressure-curve',
	'button-action',
	'button-keybinding',
	'secondary-button-action',
	'secondary-button-keybinding',
	'eraser-button-mode',
	'eraser-button-action',
	'eraser-button-keybinding'
];

export interface ActionChoices {
	notes: boolean;
	tablet: boolean;
}

const LABELS: Record<PenAction, string> = {
	right: 'settings-pen-action-right',
	middle: 'settings-pen-action-middle',
	eraser: 'settings-pen-action-eraser',
	screenshot: 'settings-pen-action-screenshot',
	notes: 'settings-pen-action-notes',
	start: 'settings-pen-action-start',
	back: 'settings-pen-action-back',
	forward: 'settings-pen-action-forward',
	'switch-monitor': 'settings-pen-action-switch-monitor',
	keybinding: 'settings-pen-action-keys',
	nothing: 'settings-pen-action-nothing'
};

export function actionsFor({ notes, tablet }: ActionChoices, button: ButtonKey): PenAction[] {
	const all: PenAction[] = ['right', 'middle', 'eraser', 'screenshot', 'notes', 'start', 'back', 'forward', 'switch-monitor', 'keybinding', 'nothing'];
	return all.filter(
		(action) => (action !== 'notes' || notes) && (action !== 'switch-monitor' || tablet) && (action !== 'eraser' || button !== 'eraser-button')
	);
}

export const actionLabel = (action: PenAction) => t(LABELS[action]);

export function describe(action: PenAction, keys: string) {
	if (action !== 'keybinding') return actionLabel(action);
	return keys ? labels(keys).join(' + ') : t('settings-pen-action-keys-unset');
}

export const FEELS = [
	[0, 75, 25, 100],
	[0, 50, 50, 100],
	[0, 25, 75, 100],
	[0, 0, 100, 100],
	[25, 0, 100, 75],
	[50, 0, 100, 50],
	[75, 0, 100, 25]
];

export function feelOf(curve: number[] | undefined) {
	const index = FEELS.findIndex((preset) => preset.every((point, position) => point === curve?.[position]));
	return index < 0 ? 3 : index;
}
