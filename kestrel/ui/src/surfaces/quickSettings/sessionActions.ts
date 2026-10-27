import GObject from 'gi://GObject';
import * as SystemActions from '../../shell/system/systemActions.js';

export interface SessionAction {
  icon: string;
  message: string;
  availability: string;
  run(): void;
}

const actions = () => SystemActions.getDefault();

export const LOCK: SessionAction = {
  icon: 'system-lock-screen-symbolic', message: 'quick-settings-lock', availability: 'can-lock-screen', run: () => actions().activateLockScreen(),
};

export const POWER_ACTIONS: SessionAction[] = [
  { icon: 'weather-clear-night-symbolic', message: 'quick-settings-suspend', availability: 'can-suspend', run: () => actions().activateSuspend() },
  { icon: 'system-log-out-symbolic', message: 'quick-settings-log-out', availability: 'can-logout', run: () => actions().activateLogout() },
  { icon: 'system-reboot-symbolic', message: 'quick-settings-restart', availability: 'can-restart', run: () => actions().activateRestart() },
  { icon: 'system-shutdown-symbolic', message: 'quick-settings-power-off', availability: 'can-power-off', run: () => actions().activatePowerOff() },
];

export function isAvailable(action: SessionAction): boolean {
  const availability = actions() as unknown as Record<string, boolean>;
  return availability[action.availability.replaceAll('-', '_')];
}

export function bindAvailability(action: SessionAction, target: GObject.Object): void {
  actions().bind_property(action.availability, target, 'visible', GObject.BindingFlags.SYNC_CREATE);
}
