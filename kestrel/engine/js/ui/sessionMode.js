import * as Signals from '../misc/signals.js';

import {UnlockDialog} from './lockScreen/unlockDialog.js';

const DEFAULT_MODE = 'restrictive';

const USER_SESSION_COMPONENTS = [
    'polkitAgent',
    'autorunManager', 'automountManager', 'networkAgent',
];

const _modes = {
    'restrictive': {
        parentMode: null,
        stylesheetName: 'base.css',
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
        isPrimary: false,
        unlockDialog: null,
        components: [],
    },

    'greeter': {
        isGreeter: true,
        isPrimary: true,
    },

    'peek': {
        isPeek: true,
        hasWindows: true,
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

export class SessionMode extends Signals.EventEmitter {
    constructor() {
        super();

        this._modeStack = [global.session_mode];
        this._sync();
    }

    pushMode(mode) {
        console.debug(`sessionMode: Pushing mode ${mode}`);
        this._modeStack.push(mode);
        this._sync();
    }

    popMode(mode) {
        if (this.currentMode !== mode || this._modeStack.length === 1)
            throw new Error('Invalid SessionMode.popMode');

        console.debug(`sessionMode: Popping mode ${mode}`);
        this._modeStack.pop();
        this._sync();
    }

    switchMode(to) {
        if (this.currentMode === to)
            return;
        this._modeStack[this._modeStack.length - 1] = to;
        this._sync();
    }

    get currentMode() {
        return this._modeStack[this._modeStack.length - 1];
    }

    _sync() {
        const current = _modes[this.currentMode];
        const parent = current.parentMode
            ? {..._modes[DEFAULT_MODE], ..._modes[current.parentMode]}
            : {..._modes[DEFAULT_MODE]};

        const params = {...parent, ...current};

        // A simplified version of Lang.copyProperties, handles
        // undefined as a special case for "no change / inherit from previous mode"
        for (const prop in params) {
            if (params[prop] !== undefined)
                this[prop] = params[prop];
        }

        this.emit('updated');
    }
}
