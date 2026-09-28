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
	['super', 'Super'],
	['ctrl', 'Ctrl'],
	['alt', 'Alt'],
	['shift', 'Shift'],
	['meta', 'Meta'],
	['hyper', 'Hyper']
];
const KEY_LABELS: Record<string, string> = {
	Print: 'Print Screen',
	Page_Up: 'Page Up',
	Page_Down: 'Page Down',
	space: 'Space',
	Return: 'Enter',
	KP_Enter: 'Enter',
	BackSpace: 'Backspace',
	Escape: 'Esc',
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
	XF86AudioRaiseVolume: 'Volume Up',
	XF86AudioLowerVolume: 'Volume Down',
	XF86AudioMute: 'Mute',
	XF86AudioMicMute: 'Microphone Mute',
	XF86AudioPlay: 'Play',
	XF86AudioPause: 'Pause',
	XF86AudioStop: 'Stop',
	XF86AudioNext: 'Next Track',
	XF86AudioPrev: 'Previous Track',
	XF86MonBrightnessUp: 'Brightness Up',
	XF86MonBrightnessDown: 'Brightness Down',
	XF86WWW: 'Browser',
	XF86Explorer: 'Files',
	XF86PowerOff: 'Power',
	XF86ScreenSaver: 'Lock'
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
	if (KEY_LABELS[key]) return KEY_LABELS[key];
	if (key.length === 1) return key.toUpperCase();
	if (key.startsWith('KP_')) return `Keypad ${keyLabel(key.slice(3))}`;
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
	return [...MODIFIER_LABELS.filter(([modifier]) => modifiers.has(modifier)).map(([, label]) => label), keyLabel(key)];
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
