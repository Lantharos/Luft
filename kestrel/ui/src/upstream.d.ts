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

declare module 'resource:///org/gnome/shell/ui/slider.js' {
  import St from 'gi://St';
  export class Slider extends St.DrawingArea {
    constructor(value: number);
    value: number;
  }
}
