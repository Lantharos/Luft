declare module 'resource:///org/gnome/shell/misc/systemActions.js' {
  interface Actions {
    activateLockScreen(): void;
    activateSuspend(): void;
    activateLogout(): void;
    activateRestart(): void;
    activatePowerOff(): void;
  }

  export function getDefault(): Actions;
}
