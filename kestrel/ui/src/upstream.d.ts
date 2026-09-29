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
  interface MixerStream { get_application_id(): string | null }
  export function getMixerControl(): {
    get_source_outputs(): MixerStream[];
    connect(signal: string, callback: () => void): number;
    disconnect(id: number): void;
  };
  export function createInputSlider(): import('./quickSettings/quickControls.js').QuickControl;
}

declare module 'resource:///org/gnome/shell/ui/headerLayout.js' {
  import Clutter from 'gi://Clutter';
  export class HeaderLayout extends Clutter.BoxLayout {
    overhang(actor: Clutter.Actor): void;
  }
}

declare module 'resource:///org/gnome/shell/ui/kestrelGlass.js' {
  export function blurSurface(actor: import('gi://St').default.Widget, corners?: number): void;
  export function freezeSelection(actor: import('gi://Clutter').default.Actor): () => void;
  export function setSolidSurfaces(enabled: boolean): void;
}

declare module 'resource:///org/gnome/shell/misc/loginManager.js' {
  export function getLoginManager(): {
    connect(signal: 'prepare-for-sleep', callback: (manager: unknown, aboutToSuspend: boolean) => void): number;
    disconnect(id: number): void;
  };
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

declare module 'resource:///org/gnome/shell/ui/messageTray.js' {
  import Gio from 'gi://Gio';
  export const Urgency: { LOW: number; NORMAL: number; HIGH: number; CRITICAL: number };
  export const PrivacyScope: { USER: number; SYSTEM: number };
  export class Notification {
    constructor(params: { source: Source; title: string; body: string; gicon?: Gio.Icon; urgency?: number; privacyScope?: number });
    connect(signal: 'destroy', callback: () => void): number;
    destroy(): void;
  }
  export class Source {
    addNotification(notification: Notification): void;
  }
  export function getSystemSource(): Source;
}

declare module 'resource:///org/gnome/shell/ui/status/location.js' {
  export function getGeoclueAgent(): {
    readonly inUse: boolean;
    connect(signal: string, callback: () => void): number;
    disconnect(id: number): void;
  };
}

declare module 'resource:///org/gnome/shell/ui/modalDialog.js' {
  import St from 'gi://St';
  import Clutter from 'gi://Clutter';
  export class ModalDialog extends St.Widget {
    constructor(params?: { styleClass?: string; destroyOnClose?: boolean });
    readonly contentLayout: St.BoxLayout;
    setButtons(buttons: { label: string; action: () => void; key?: number; isDefault?: boolean }[]): void;
    open(): boolean;
    close(): void;
    connect(signal: 'closed', callback: () => void): number;
    connect(signal: 'captured-event', callback: (actor: Clutter.Actor, event: Clutter.Event) => boolean): number;
  }
}

declare module 'resource:///org/gnome/shell/ui/dialog.js' {
  import St from 'gi://St';
  export class MessageDialogContent extends St.BoxLayout {
    constructor(params: { title: string; description?: string; icon_name?: string });
  }
}

declare module 'resource:///org/gnome/shell/misc/config.js' {
  export const LIBEXECDIR: string;
}
