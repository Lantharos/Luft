declare module 'resource:///org/gnome/shell/misc/systemActions.js' {
  import GObject from 'gi://GObject';
  interface Actions extends GObject.Object {
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

declare module 'resource:///org/gnome/shell/ui/kestrelGlass.js' {
  export function blurSurface(actor: import('gi://St').default.Widget, corners?: number): void;
  export function freezeSelection(actor: import('gi://Clutter').default.Actor): () => void;
}

declare module 'resource:///org/gnome/shell/ui/workspaceSwitcherPopup.js' {
  export class WorkspaceSwitcherPopup extends import('gi://Clutter').default.Actor {
    connect(signal: string, callback: () => void): number;
    display(index: number): void;
  }
}

declare module 'resource:///org/gnome/shell/ui/dnd.js' {
  export enum DragMotionResult { NO_DROP, COPY_DROP, MOVE_DROP, CONTINUE }
  export function makeDraggable(actor: import('gi://Clutter').default.Actor, params: object): { enabled: boolean; connect(signal: string, callback: (...args: any[]) => void): number };
  export function addDragMonitor(monitor: object): void;
  export function removeDragMonitor(monitor: object): void;
}

declare module 'resource:///org/gnome/shell/misc/animationUtils.js' {
  export function ensureActorVisibleInScrollView(scroll: import('gi://St').default.ScrollView, actor: import('gi://Clutter').default.Actor): void;
}

declare module 'resource:///org/gnome/shell/ui/mpris.js' {
  import GObject from 'gi://GObject';
  import Shell from 'gi://Shell';
  export class MprisPlayer extends GObject.Object {
    readonly status: string;
    readonly trackTitle: string;
    readonly trackArtists: string[];
    readonly trackCoverUrl: string;
    readonly canGoNext: boolean;
    readonly canGoPrevious: boolean;
    readonly app: Shell.App | null;
    playPause(): void;
    next(): void;
    previous(): void;
    raise(): void;
    connectObject(...args: unknown[]): void;
    disconnectObject(owner: object): void;
  }
  export class MprisSource extends GObject.Object {
    readonly players: MprisPlayer[];
    connectObject(...args: unknown[]): void;
  }
}
