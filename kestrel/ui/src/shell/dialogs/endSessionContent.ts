import * as KestrelUi from '../../kestrelUi.js';

export type ConfirmSignal = 'ConfirmedLogout' | 'ConfirmedShutdown' | 'ConfirmedReboot';

export interface EndSessionContent {
  subject(): string;
  subjectWithUser?(userName: string): string;
  subjectWithUpdates?(): string;
  description(seconds: number): string;
  descriptionWithUser?(userName: string, seconds: number): string;
  checkBoxText?(): string;
  showBatteryWarning: boolean;
  confirmSignal: ConfirmSignal;
  confirmLabel(): string;
  iconName: string;
  showOtherSessions: boolean;
}

export const DialogType = {
  LOGOUT: 0,
  SHUTDOWN: 1,
  RESTART: 2,
  UPDATE_RESTART: 3,
} as const;

const logout: EndSessionContent = {
  subjectWithUser: userName => KestrelUi.t('end-session-log-out-user', { userName }),
  subject: () => KestrelUi.t('end-session-log-out-title'),
  iconName: 'system-log-out-symbolic',
  descriptionWithUser: (userName, seconds) => KestrelUi.t('end-session-log-out-user-countdown', { userName, seconds }),
  description: seconds => KestrelUi.t('end-session-log-out-countdown', { seconds }),
  showBatteryWarning: false,
  confirmSignal: 'ConfirmedLogout',
  confirmLabel: () => KestrelUi.t('end-session-log-out-button'),
  showOtherSessions: false,
};

const shutdown: EndSessionContent = {
  subject: () => KestrelUi.t('end-session-power-off-title'),
  subjectWithUpdates: () => KestrelUi.t('end-session-power-off-updates-title'),
  description: seconds => KestrelUi.t('end-session-power-off-countdown', { seconds }),
  checkBoxText: () => KestrelUi.t('end-session-install-updates'),
  showBatteryWarning: true,
  confirmSignal: 'ConfirmedShutdown',
  confirmLabel: () => KestrelUi.t('end-session-power-off-button'),
  iconName: 'system-shutdown-symbolic',
  showOtherSessions: true,
};

const restart: EndSessionContent = {
  subject: () => KestrelUi.t('end-session-restart-title'),
  subjectWithUpdates: () => KestrelUi.t('end-session-restart-updates-title'),
  description: seconds => KestrelUi.t('end-session-restart-countdown', { seconds }),
  checkBoxText: () => KestrelUi.t('end-session-install-updates'),
  showBatteryWarning: true,
  confirmSignal: 'ConfirmedReboot',
  confirmLabel: () => KestrelUi.t('end-session-restart-button'),
  iconName: 'system-reboot-symbolic',
  showOtherSessions: true,
};

const updateRestart: EndSessionContent = {
  subject: () => KestrelUi.t('end-session-update-restart-title'),
  description: seconds => KestrelUi.t('end-session-update-restart-countdown', { seconds }),
  showBatteryWarning: true,
  confirmSignal: 'ConfirmedReboot',
  confirmLabel: () => KestrelUi.t('end-session-update-restart-button'),
  iconName: 'system-reboot-symbolic',
  showOtherSessions: true,
};

export const DIALOG_CONTENT: Record<number, EndSessionContent> = {
  [DialogType.LOGOUT]: logout,
  [DialogType.SHUTDOWN]: shutdown,
  [DialogType.RESTART]: restart,
  [DialogType.UPDATE_RESTART]: updateRestart,
};

export function roundSecondsToInterval(totalSeconds: number, secondsLeft: number, interval: number): number {
  let time = Math.ceil(secondsLeft);
  if (time <= interval) return time;

  time += interval - 1;
  if (time > totalSeconds) time = Math.ceil(totalSeconds);
  else time -= time % interval;

  return time;
}
