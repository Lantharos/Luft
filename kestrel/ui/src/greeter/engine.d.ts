declare module 'resource:///org/gnome/shell/auth/greetd.js' {
  export class GreetdChannel {
    request(message: object): Promise<object>;
    close(): void;
  }
  export function connectGreetd(): Promise<GreetdChannel>;
}

declare module 'resource:///org/gnome/shell/auth/authentication.js' {
  import type { GreetdChannel } from 'resource:///org/gnome/shell/auth/greetd.js';
  export class Authentication {
    constructor(openChannel: () => Promise<GreetdChannel>);
    cancel(): void;
    startSession(command: string[], environment: string[]): Promise<boolean>;
    destroy(): void;
  }
}

declare module 'resource:///org/gnome/shell/auth/authPrompt.js' {
  import type AccountsService from 'gi://AccountsService';
  import type St from 'gi://St';
  import type { Authentication } from 'resource:///org/gnome/shell/auth/authentication.js';
  export class AuthPrompt extends St.BoxLayout {
    constructor(authentication: Authentication);
    readonly userName: string | null;
    allowGoingBack(allowed: boolean): void;
    setUser(user: AccountsService.User | null): void;
    askForUserName(): void;
    begin(userName: string): void;
    cancel(): void;
    focus(): void;
    startPreemptiveInput(unichar: string): void;
    connect(signal: 'cancelled' | 'succeeded', callback: () => void): number;
    connect(signal: 'user-name', callback: (prompt: AuthPrompt, name: string) => void): number;
    connect(signal: 'loading', callback: (prompt: AuthPrompt, busy: boolean) => void): number;
    connect(signal: string, callback: (...args: any[]) => void): number;
  }
}

declare module 'resource:///org/gnome/shell/ui/lockScreen/backdrop.js' {
  import type Clutter from 'gi://Clutter';
  export class LockBackdrop {
    readonly actor: Clutter.Actor;
  }
}

declare module 'resource:///org/gnome/shell/ui/lockScreen/clock.js' {
  import type St from 'gi://St';
  export class Clock extends St.BoxLayout {}
}

declare module 'resource:///org/gnome/shell/ui/lockScreen/pages.js' {
  import type Clutter from 'gi://Clutter';
  import type Shell from 'gi://Shell';
  export class LockPages {
    constructor(params: {
      actor: Clutter.Actor;
      clock: Clutter.Actor;
      prompt: Clutter.Actor;
      companions: Clutter.Actor[];
      actionMode: Shell.ActionMode;
      preparePrompt(): void;
      clockShown(): void;
      startTyping(unichar: string): void;
    });
    readonly promptShown: boolean;
    showClock(): void;
    showPrompt(): void;
  }
}

declare module 'resource:///org/gnome/shell/ui/layout.js' {
  import type Clutter from 'gi://Clutter';
  export class MonitorConstraint extends Clutter.Constraint {
    constructor(params: { primary: boolean });
  }
}
