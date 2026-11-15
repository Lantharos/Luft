import { resolved, t } from '@luft/i18n';

export type KeyName =
	| 'ctrl'
	| 'super'
	| 'alt'
	| 'altGr'
	| 'menu'
	| 'back'
	| 'backspace'
	| 'tab'
	| 'enter'
	| 'capsLock'
	| 'shift'
	| 'space'
	| 'escape'
	| 'compose'
	| 'leftAlt'
	| 'rightAlt'
	| 'rightCtrl'
	| 'rightSuper'
	| 'scrollLock'
	| 'printScreen'
	| 'shiftLock'
	| 'muhenkan'
	| 'henkan'
	| 'kana';

export const keyNames = resolved(
	(): Record<KeyName, string> => ({
		ctrl: t('keys-key-ctrl'),
		super: t('keys-key-super'),
		alt: t('keys-key-alt'),
		altGr: t('keys-key-altgr'),
		menu: t('keys-key-menu'),
		back: t('keys-key-back'),
		backspace: t('keys-key-backspace'),
		tab: t('keys-key-tab'),
		enter: t('keys-key-enter'),
		capsLock: t('keys-key-caps-lock'),
		shift: t('keys-key-shift'),
		space: t('keys-key-space'),
		escape: t('keys-key-escape'),
		compose: t('keys-key-compose'),
		leftAlt: t('keys-key-left-alt'),
		rightAlt: t('keys-key-right-alt'),
		rightCtrl: t('keys-key-right-ctrl'),
		rightSuper: t('keys-key-right-super'),
		scrollLock: t('keys-key-scroll-lock'),
		printScreen: t('keys-key-print-screen'),
		shiftLock: t('keys-key-shift-lock'),
		muhenkan: '無変換',
		henkan: '変換',
		kana: 'かな'
	})
);

export const levelNames = resolved(() => [t('keys-level-alone'), t('keys-level-shift'), t('keys-level-altgr'), t('keys-level-shift-altgr')]);

export const levelShortNames = resolved(() => [t('keys-level-short-alone'), t('keys-level-short-shift'), t('keys-level-short-altgr'), t('keys-level-short-shift-altgr')]);
