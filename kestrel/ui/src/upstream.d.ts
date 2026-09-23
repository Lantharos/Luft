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

declare module 'resource:///org/gnome/shell/ui/userWidget.js' {
  import St from 'gi://St';
  import AccountsService from 'gi://AccountsService';
  export class Avatar extends St.Bin {
    constructor(user: AccountsService.User, params: { styleClass: string; iconSize: number });
    update(): void;
  }
}

declare module '*.svg' {
  const source: string;
  export default source;
}


declare module 'resource:///org/gnome/shell/ui/status/volume.js' {
  export function createInputSlider(): import('./quickControls.js').QuickControl;
}
