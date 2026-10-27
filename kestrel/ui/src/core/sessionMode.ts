import type GObject from 'gi://GObject';

import { EventEmitter } from './runtime/signals.js';
import { UnlockDialog } from '../auth/lockScreen/unlockDialog.js';

type ModeName = 'restrictive' | 'greeter' | 'peek' | 'setup' | 'unlock-dialog' | 'user';

interface ModeProperties {
  parentMode: ModeName | null;
  stylesheetName: string;
  colorScheme: 'dark' | null;
  themeResourceName: string;
  allowSettings: boolean;
  allowScreencast: boolean;
  hasWorkspaces: boolean;
  hasWindows: boolean;
  hasNotifications: boolean;
  hasWmMenus: boolean;
  isLocked: boolean;
  isGreeter: boolean;
  isPeek: boolean;
  isSetup: boolean;
  isPrimary: boolean;
  unlockDialog: typeof UnlockDialog | null;
  components: string[];
}

interface SessionModeSignals {
  'updated': () => void;
}

const DEFAULT_MODE = 'restrictive';

const USER_SESSION_COMPONENTS = [
  'polkitAgent',
  'autorunManager', 'automountManager', 'networkAgent',
];

const modes: Record<ModeName, Partial<ModeProperties>> = {
  'restrictive': {
    parentMode: null,
    stylesheetName: 'base.css',
    colorScheme: null,
    themeResourceName: 'kestrel-theme.gresource',
    allowSettings: false,
    allowScreencast: false,
    hasWorkspaces: false,
    hasWindows: false,
    hasNotifications: false,
    hasWmMenus: false,
    isLocked: false,
    isGreeter: false,
    isPeek: false,
    isSetup: false,
    isPrimary: false,
    unlockDialog: null,
    components: [],
  },

  'greeter': {
    isGreeter: true,
    isPrimary: true,
    colorScheme: 'dark',
  },

  'peek': {
    isPeek: true,
    hasWindows: true,
  },

  'setup': {
    isSetup: true,
    isPrimary: true,
    hasWindows: true,
    components: ['networkAgent', 'polkitAgent'],
  },

  'unlock-dialog': {
    isLocked: true,
    unlockDialog: undefined,
    components: ['networkAgent', 'polkitAgent'],
  },

  'user': {
    allowSettings: true,
    allowScreencast: true,
    hasWorkspaces: true,
    hasWindows: true,
    hasWmMenus: true,
    hasNotifications: true,
    isLocked: false,
    isPrimary: true,
    unlockDialog: UnlockDialog,
    components: USER_SESSION_COMPONENTS,
  },
};

export interface SessionMode extends ModeProperties {}

export class SessionMode extends EventEmitter {
  declare connect: GObject.SignalMethods<this, SessionModeSignals>['connect'];
  declare emit: GObject.SignalMethods<this, SessionModeSignals>['emit'];

  private readonly modeStack: ModeName[];

  constructor() {
    super();

    this.modeStack = [global.session_mode as ModeName];
    this.sync();
  }

  pushMode(mode: ModeName): void {
    console.debug(`sessionMode: Pushing mode ${mode}`);
    this.modeStack.push(mode);
    this.sync();
  }

  popMode(mode: ModeName): void {
    if (this.currentMode !== mode || this.modeStack.length === 1)
      throw new Error('Invalid SessionMode.popMode');

    console.debug(`sessionMode: Popping mode ${mode}`);
    this.modeStack.pop();
    this.sync();
  }

  get currentMode(): ModeName {
    return this.modeStack[this.modeStack.length - 1];
  }

  private sync(): void {
    const current = modes[this.currentMode];
    const parent = current.parentMode
      ? { ...modes[DEFAULT_MODE], ...modes[current.parentMode] }
      : { ...modes[DEFAULT_MODE] };

    const params = { ...parent, ...current };
    const changed = Object.entries(params).filter(([, value]) => value !== undefined);
    Object.assign(this, Object.fromEntries(changed));

    this.emit('updated');
  }
}
