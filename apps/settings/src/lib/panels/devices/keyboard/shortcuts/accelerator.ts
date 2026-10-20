import { t } from '@luft/i18n';

type Modifier = 'super' | 'ctrl' | 'alt' | 'shift' | 'meta' | 'hyper';

const MODIFIERS: Record<string, Modifier> = {
	super: 'super',
	mod4: 'super',
	logo: 'super',
	ctrl: 'ctrl',
	control: 'ctrl',
	primary: 'ctrl',
	alt: 'alt',
	mod1: 'alt',
	shift: 'shift',
	meta: 'meta',
	hyper: 'hyper'
};
const MODIFIER_LABELS: [Modifier, string][] = [
	['super', 'settings-keys-super'],
	['ctrl', 'settings-keys-ctrl'],
	['alt', 'settings-keys-alt'],
	['shift', 'settings-keys-shift'],
	['meta', 'settings-keys-meta'],
	['hyper', 'settings-keys-hyper']
];
const KEY_LABELS: Record<string, string> = {
	Print: 'settings-keys-print-screen',
	Page_Up: 'settings-keys-page-up',
	Page_Down: 'settings-keys-page-down',
	Home: 'settings-keys-home',
	End: 'settings-keys-end',
	Insert: 'settings-keys-insert',
	Delete: 'settings-keys-delete',
	Tab: 'settings-keys-tab',
	space: 'settings-keys-space',
	Return: 'settings-keys-enter',
	KP_Enter: 'settings-keys-enter',
	BackSpace: 'settings-keys-backspace',
	Escape: 'settings-keys-escape',
	Pause: 'settings-keys-pause',
	Scroll_Lock: 'settings-keys-scroll-lock',
	Caps_Lock: 'settings-keys-caps-lock',
	Menu: 'settings-keys-menu',
	XF86AudioRaiseVolume: 'settings-keys-volume-up',
	XF86AudioLowerVolume: 'settings-keys-volume-down',
	XF86AudioMute: 'settings-keys-mute',
	XF86AudioMicMute: 'settings-keys-microphone-mute',
	XF86AudioPlay: 'settings-keys-play',
	XF86AudioPause: 'settings-keys-media-pause',
	XF86AudioStop: 'settings-keys-stop',
	XF86AudioNext: 'settings-keys-next-track',
	XF86AudioPrev: 'settings-keys-previous-track',
	XF86MonBrightnessUp: 'settings-keys-brightness-up',
	XF86MonBrightnessDown: 'settings-keys-brightness-down',
	XF86WWW: 'settings-keys-browser',
	XF86HomePage: 'settings-keys-home-page',
	XF86Search: 'settings-keys-search',
	XF86Mail: 'settings-keys-mail',
	XF86Calculator: 'settings-keys-calculator',
	XF86Explorer: 'settings-keys-files',
	XF86Eject: 'settings-keys-eject',
	XF86PowerOff: 'settings-keys-power',
	XF86ScreenSaver: 'settings-keys-lock'
};
const KEY_SYMBOLS: Record<string, string> = {
	Above_Tab: '`',
	grave: '`',
	minus: '-',
	equal: '=',
	comma: ',',
	period: '.',
	slash: '/',
	backslash: '\\',
	semicolon: ';',
	apostrophe: "'",
	bracketleft: '[',
	bracketright: ']',
	less: '<',
	Left: '←',
	Right: '→',
	Up: '↑',
	Down: '↓',
	Add: '+',
	Subtract: '−',
	Multiply: '×',
	Divide: '÷',
	Decimal: '.'
};
const CODES: Record<string, string> = {
	Space: 'space',
	Enter: 'Return',
	NumpadEnter: 'KP_Enter',
	Tab: 'Tab',
	Backspace: 'BackSpace',
	Delete: 'Delete',
	Insert: 'Insert',
	Home: 'Home',
	End: 'End',
	PageUp: 'Page_Up',
	PageDown: 'Page_Down',
	ArrowUp: 'Up',
	ArrowDown: 'Down',
	ArrowLeft: 'Left',
	ArrowRight: 'Right',
	PrintScreen: 'Print',
	Pause: 'Pause',
	ScrollLock: 'Scroll_Lock',
	ContextMenu: 'Menu',
	Escape: 'Escape',
	Minus: 'minus',
	Equal: 'equal',
	BracketLeft: 'bracketleft',
	BracketRight: 'bracketright',
	Backslash: 'backslash',
	Semicolon: 'semicolon',
	Quote: 'apostrophe',
	Comma: 'comma',
	Period: 'period',
	Slash: 'slash',
	Backquote: 'grave',
	IntlBackslash: 'less',
	NumpadAdd: 'KP_Add',
	NumpadSubtract: 'KP_Subtract',
	NumpadMultiply: 'KP_Multiply',
	NumpadDivide: 'KP_Divide',
	NumpadDecimal: 'KP_Decimal',
	AudioVolumeUp: 'XF86AudioRaiseVolume',
	AudioVolumeDown: 'XF86AudioLowerVolume',
	AudioVolumeMute: 'XF86AudioMute',
	MediaPlayPause: 'XF86AudioPlay',
	MediaStop: 'XF86AudioStop',
	MediaTrackNext: 'XF86AudioNext',
	MediaTrackPrevious: 'XF86AudioPrev',
	LaunchMail: 'XF86Mail',
	LaunchApp2: 'XF86Calculator',
	BrowserSearch: 'XF86Search',
	BrowserHome: 'XF86HomePage',
	Eject: 'XF86Eject'
};
const TEXT_KEYS = new Set(['space', 'minus', 'equal', 'comma', 'period', 'slash', 'semicolon', 'apostrophe', 'bracketleft', 'bracketright', 'backslash', 'grave', 'less']);

function parse(accelerator: string) {
	const modifiers = [...accelerator.matchAll(/<([^>]+)>/g)].map((match) => MODIFIERS[match[1].toLowerCase()] ?? (match[1].toLowerCase() as Modifier));
	return { modifiers: new Set(modifiers), key: accelerator.replace(/<[^>]+>/g, '') };
}

function keyLabel(key: string): string {
	if (KEY_LABELS[key]) return t(KEY_LABELS[key]);
	if (KEY_SYMBOLS[key]) return KEY_SYMBOLS[key];
	if (key.length === 1) return key.toUpperCase();
	if (key.startsWith('KP_')) return t('settings-keys-keypad', { key: keyLabel(key.slice(3)) });
	if (key.startsWith('XF86')) return key.slice(4).replace(/([a-z])([A-Z])/g, '$1 $2');
	return key.replace(/_/g, ' ');
}

function keyName(code: string) {
	if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
	if (/^Digit\d$/.test(code)) return code.slice(5);
	if (/^Numpad\d$/.test(code)) return `KP_${code.slice(6)}`;
	if (/^F\d{1,2}$/.test(code)) return code;
	return CODES[code] ?? null;
}

export function canonical(accelerator: string) {
	const { modifiers, key } = parse(accelerator);
	return [...[...modifiers].sort(), key.toLowerCase()].join('+');
}

export function labels(accelerator: string) {
	const { modifiers, key } = parse(accelerator);
	const held = MODIFIER_LABELS.filter(([modifier]) => modifiers.has(modifier)).map(([, label]) => t(label));
	return key ? [...held, keyLabel(key)] : held;
}

export function typesText(accelerator: string) {
	const { modifiers, key } = parse(accelerator);
	return [...modifiers].every((modifier) => modifier === 'shift') && (key.length === 1 || TEXT_KEYS.has(key));
}

export function fromEvent(event: KeyboardEvent) {
	const key = keyName(event.code);
	if (!key) return null;
	const modifiers = [
		[event.metaKey, '<Super>'],
		[event.ctrlKey, '<Control>'],
		[event.altKey, '<Alt>'],
		[event.shiftKey, '<Shift>']
	] as const;
	return modifiers.filter(([held]) => held).map(([, text]) => text).join('') + key;
}

export const sameAccelerators = (left: string[], right: string[]) =>
	left.length === right.length && left.every((accelerator, index) => canonical(accelerator) === canonical(right[index]));
