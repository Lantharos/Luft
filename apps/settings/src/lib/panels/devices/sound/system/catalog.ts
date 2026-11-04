export interface SoundEntry {
	name: string;
	title: string;
}

export interface SoundGroup {
	title: string;
	sounds: SoundEntry[];
}

export const SOUND_GROUPS: SoundGroup[] = [
	{
		title: 'settings-sound-kind-notifications',
		sounds: [
			{ name: 'message-new-instant', title: 'settings-sound-name-notification' },
			{ name: 'dialog-information', title: 'settings-sound-name-quiet-notification' },
			{ name: 'message-new-email', title: 'settings-sound-name-new-mail' }
		]
	},
	{
		title: 'settings-sound-kind-devices',
		sounds: [
			{ name: 'device-added', title: 'settings-sound-name-device-added' },
			{ name: 'device-removed', title: 'settings-sound-name-device-removed' },
			{ name: 'power-plug', title: 'settings-sound-name-charger' },
			{ name: 'battery-low', title: 'settings-sound-name-low-battery' }
		]
	},
	{
		title: 'settings-sound-kind-feedback',
		sounds: [
			{ name: 'audio-volume-change', title: 'settings-sound-name-volume' },
			{ name: 'screen-capture', title: 'settings-sound-name-screenshot' },
			{ name: 'desktop-login', title: 'settings-sound-name-sign-in' },
			{ name: 'message-sent-email', title: 'settings-sound-name-mail-sent' }
		]
	},
	{
		title: 'settings-sound-kind-recording',
		sounds: [
			{ name: 'recording-started', title: 'settings-sound-name-recording-started' },
			{ name: 'recording-stopped', title: 'settings-sound-name-recording-stopped' }
		]
	},
	{
		title: 'settings-sound-kind-alerts',
		sounds: [
			{ name: 'dialog-error', title: 'settings-sound-name-error' },
			{ name: 'dialog-warning', title: 'settings-sound-name-warning' },
			{ name: 'dialog-question', title: 'settings-sound-name-question' }
		]
	},
	{
		title: 'settings-sound-kind-keyboard',
		sounds: [
			{ name: 'keyboard-tap', title: 'settings-sound-name-key' },
			{ name: 'keyboard-tap-delete', title: 'settings-sound-name-delete-key' },
			{ name: 'keyboard-tap-space', title: 'settings-sound-name-space-key' }
		]
	}
];
