import GObject from 'gi://GObject';
import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js';

export interface SessionAction {
  icon: string;
  label: string;
  availability: string;
  run(): void;
}

const actions = () => SystemActions.getDefault();

export const LOCK: SessionAction = {
  icon: 'system-lock-screen-symbolic', label: 'Lock', availability: 'can-lock-screen', run: () => actions().activateLockScreen(),
};

export const POWER_ACTIONS: SessionAction[] = [
  { icon: 'weather-clear-night-symbolic', label: 'Suspend', availability: 'can-suspend', run: () => actions().activateSuspend() },
  { icon: 'system-log-out-symbolic', label: 'Log out', availability: 'can-logout', run: () => actions().activateLogout() },
  { icon: 'system-reboot-symbolic', label: 'Restart', availability: 'can-restart', run: () => actions().activateRestart() },
  { icon: 'system-shutdown-symbolic', label: 'Power off', availability: 'can-power-off', run: () => actions().activatePowerOff() },
];

export function bindAvailability(action: SessionAction, target: GObject.Object): void {
  actions().bind_property(action.availability, target, 'visible', GObject.BindingFlags.SYNC_CREATE);
}
