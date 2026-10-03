declare module 'resource:///com/lantharos/kestrel/misc/systemActions.js' {
  import GObject from 'gi://GObject';
  interface Actions extends GObject.Object {
    readonly canSuspend: boolean;
    readonly canRestart: boolean;
    readonly canPowerOff: boolean;
    activateLockScreen(): void;
    activateSuspend(): void;
    activateLogout(): void;
    activateRestart(): void;
    activatePowerOff(): void;
  }

  export function getDefault(): Actions;
}

declare module 'resource:///com/lantharos/kestrel/ui/userWidget.js' {
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


declare module 'resource:///com/lantharos/kestrel/ui/status/volume.js' {
  interface MixerStream { get_application_id(): string | null }
  export function getMixerControl(): {
    get_source_outputs(): MixerStream[];
    connect(signal: string, callback: () => void): number;
    disconnect(id: number): void;
  };
  export function createInputSlider(): import('./quickSettings/quickControls.js').QuickControl;
}

declare module 'resource:///com/lantharos/kestrel/misc/wallClock.js' {
  import Gio from 'gi://Gio';
  import GLib from 'gi://GLib';
  export class WallClock {
    constructor(onTick: (now: GLib.DateTime, clock: WallClock) => void);
    readonly settings: Gio.Settings;
    readonly showSeconds: boolean;
    readonly twelveHour: boolean;
    destroy(): void;
  }
}

declare module 'resource:///com/lantharos/kestrel/misc/util.js' {
  export function spawnCommandLine(commandLine: string): void;
}

declare module 'resource:///com/lantharos/kestrel/ui/headerLayout.js' {
  import Clutter from 'gi://Clutter';
  export class HeaderLayout extends Clutter.BoxLayout {
    overhang(actor: Clutter.Actor): void;
  }
}

declare module 'resource:///com/lantharos/kestrel/ui/kestrelGlass.js' {
  export function blurSurface(actor: import('gi://St').default.Widget, corners?: number): void;
  export function freezeSelection(actor: import('gi://Clutter').default.Actor): () => void;
  export function setSolidSurfaces(enabled: boolean): void;
}

declare module 'resource:///com/lantharos/kestrel/misc/loginManager.js' {
  export function getLoginManager(): {
    connect(signal: 'prepare-for-sleep', callback: (manager: unknown, aboutToSuspend: boolean) => void): number;
    disconnect(id: number): void;
  };
}

declare module 'resource:///com/lantharos/kestrel/ui/workspaceSwitcherPopup.js' {
  export class WorkspaceSwitcherPopup extends import('gi://Clutter').default.Actor {
    connect(signal: string, callback: () => void): number;
    display(index: number): void;
  }
}

declare module 'resource:///com/lantharos/kestrel/ui/dnd.js' {
  export enum DragMotionResult { NO_DROP, COPY_DROP, MOVE_DROP, CONTINUE }
  export function makeDraggable(actor: import('gi://Clutter').default.Actor, params: object): { enabled: boolean; connect(signal: string, callback: (...args: any[]) => void): number };
  export function addDragMonitor(monitor: object): void;
  export function removeDragMonitor(monitor: object): void;
}

declare module 'resource:///com/lantharos/kestrel/misc/animationUtils.js' {
  export function ensureActorVisibleInScrollView(scroll: import('gi://St').default.ScrollView, actor: import('gi://Clutter').default.Actor): void;
  export function wiggle(actor: import('gi://Clutter').default.Actor): void;
}

declare module 'resource:///com/lantharos/kestrel/ui/mpris.js' {
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

declare module 'resource:///com/lantharos/kestrel/ui/messageTray.js' {
  import Gio from 'gi://Gio';
  export const Urgency: { LOW: number; NORMAL: number; HIGH: number; CRITICAL: number };
  export const PrivacyScope: { USER: number; SYSTEM: number };
  export class Notification {
    constructor(params: { source: Source; title: string; body: string; gicon?: Gio.Icon; urgency?: number; privacyScope?: number });
    connect(signal: 'destroy', callback: () => void): number;
    addAction(label: string, callback: () => void): void;
    destroy(): void;
  }
  export class Source {
    addNotification(notification: Notification): void;
  }
  export function getSystemSource(): Source;
}

declare module 'resource:///com/lantharos/kestrel/ui/status/location.js' {
  export function getGeoclueAgent(): {
    readonly inUse: boolean;
    connect(signal: string, callback: () => void): number;
    disconnect(id: number): void;
  };
}

declare module 'resource:///com/lantharos/kestrel/ui/modalDialog.js' {
  import St from 'gi://St';
  import Clutter from 'gi://Clutter';
  export interface ButtonInfo { label: string; action: () => void; key?: number; default?: boolean; reactive?: boolean }
  export class ModalDialog extends St.Widget {
    constructor(params?: { styleClass?: string; destroyOnClose?: boolean });
    readonly contentLayout: St.BoxLayout;
    setButtons(buttons: ButtonInfo[]): void;
    addButton(button: ButtonInfo): St.Button;
    clearButtons(): void;
    setInitialKeyFocus(actor: Clutter.Actor): void;
    open(): boolean;
    close(): void;
    connect(signal: 'closed', callback: () => void): number;
    connect(signal: 'captured-event', callback: (actor: Clutter.Actor, event: Clutter.Event) => boolean): number;
  }
}

declare module 'resource:///com/lantharos/kestrel/ui/dialog.js' {
  import St from 'gi://St';
  export class MessageDialogContent extends St.BoxLayout {
    constructor(params: { title: string; description?: string; icon_name?: string });
    title: string;
    description: string;
    iconName: string;
  }
  export class EntryField extends St.BoxLayout {
    constructor(entry: St.Entry, label: string, statusActor?: import('gi://Clutter').default.Actor | null);
    set label(text: string);
  }
}

declare module 'resource:///com/lantharos/kestrel/ui/checkBox.js' {
  import St from 'gi://St';
  export class CheckBox extends St.Button {
    constructor(label?: string);
  }
}

declare module 'resource:///com/lantharos/kestrel/ui/shellEntry.js' {
  import St from 'gi://St';
  export function addContextMenu(entry: St.Entry, params?: object): void;
  export class CapsLockWarning extends St.Label {}
}

declare module 'resource:///com/lantharos/kestrel/misc/config.js' {
  export const LIBEXECDIR: string;
}

declare module 'resource:///com/lantharos/kestrel/ui/status/keyboard.js' {
  import type IBus from 'gi://IBus';
  export interface InputSource {
    readonly type: string;
    readonly id: string;
    readonly displayName: string;
    readonly shortName: string;
    readonly properties: IBus.PropList | null;
    activate(interactive: boolean): void;
  }
  interface KeyboardManager {
    readonly currentLayout: { readonly id: string } | null;
    readonly shortName: string;
    readonly displayName: string;
    isLocked(): boolean;
    isExternal(): boolean;
  }
  interface InputSourceManager {
    readonly currentSource: InputSource | null;
    readonly inputSources: Record<number, InputSource>;
    readonly keyboardManager: KeyboardManager;
    connectObject(...args: unknown[]): void;
    disconnectObject(owner: object): void;
  }
  export function getInputSourceManager(): InputSourceManager;
}

declare module 'resource:///com/lantharos/kestrel/misc/ibusManager.js' {
  export function getIBusManager(): { activateProperty(key: string, state: number): void };
}
