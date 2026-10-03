import AccountsService from 'gi://AccountsService';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../kestrelUi.js';
import * as Layout from '../layout.js';
import * as Main from '../main.js';
import {Authentication} from '../../auth/authentication.js';
import {AuthPrompt} from '../../auth/authPrompt.js';
import {FingerprintAuthentication} from '../../auth/fingerprint.js';
import {connectAuthenticator} from '../../auth/greetd.js';
import {LockBackdrop} from './backdrop.js';
import {Clock} from './clock.js';
import {NotificationsBox} from './notifications.js';
import {LockPages} from './pages.js';

const IDLE_TIMEOUT = 2 * 60;
const FIXED_PROMPT_HEIGHT = 550;

const UnlockDialogLayout = GObject.registerClass(
class UnlockDialogLayout extends Clutter.LayoutManager {
    _init(stack, notifications, controls) {
        super._init();
        this._stack = stack;
        this._notifications = notifications;
        this._controls = controls;
    }

    vfunc_get_preferred_width(container, forHeight) {
        return this._stack.get_preferred_width(forHeight);
    }

    vfunc_get_preferred_height(container, forWidth) {
        return this._stack.get_preferred_height(forWidth);
    }

    vfunc_allocate(container, box) {
        const [width, height] = box.get_size();
        const [, , stackWidth, stackHeight] = this._stack.get_preferred_size();
        const [, , notificationsWidth, notificationsHeight] = this._notifications.get_preferred_size();
        const columnWidth = Math.max(stackWidth, notificationsWidth);
        const columnX = Math.floor((width - columnWidth) / 2);
        const notificationsVisibleHeight = Math.min(notificationsHeight, height - height / 10 - stackHeight);
        const actorBox = new Clutter.ActorBox();

        actorBox.x1 = columnX;
        actorBox.y1 = height - notificationsVisibleHeight;
        actorBox.x2 = columnX + columnWidth;
        actorBox.y2 = actorBox.y1 + notificationsVisibleHeight;
        this._notifications.allocate(actorBox);

        const stackY = Math.min(
            Math.floor(height / 2 - FIXED_PROMPT_HEIGHT / 2),
            height - stackHeight - notificationsVisibleHeight);
        actorBox.y1 = stackY;
        actorBox.y2 = stackY + stackHeight;
        this._stack.allocate(actorBox);

        const [, , controlsWidth, controlsHeight] = this._controls.get_preferred_size();
        actorBox.x1 = width - controlsWidth;
        actorBox.y1 = height - controlsHeight;
        actorBox.x2 = width;
        actorBox.y2 = height;
        this._controls.allocate(actorBox);
    }
});

export const UnlockDialog = GObject.registerClass({
    Signals: {
        'failed': {},
        'unlocked': {},
        'wake-up-screen': {},
    },
}, class UnlockDialog extends St.Widget {
    _init(parentActor) {
        super._init({
            accessible_role: Atk.Role.WINDOW,
            style_class: 'unlock-dialog',
            visible: false,
            reactive: true,
        });

        parentActor.add_child(this);

        this.add_child(new LockBackdrop().actor);

        this._userName = GLib.get_user_name();
        this._user = AccountsService.UserManager.get_default().get_user(this._userName);
        this._authentication = new Authentication(connectAuthenticator);
        this._fingerprint = new FingerprintAuthentication();
        this._fingerprint.connect('hint', (_, hint) => this._authPrompt?.setHint(hint));
        this._fingerprint.connect('succeeded', () => {
            this._authentication.cancel();
            this._authPrompt?.succeed();
        });
        this._authPrompt = null;

        this._stack = new Shell.Stack();
        this._promptBox = new St.BoxLayout({orientation: Clutter.Orientation.VERTICAL});
        this._stack.add_child(this._promptBox);
        this._clock = new Clock();
        this._stack.add_child(this._clock);
        this._controls = KestrelUi.lockControls();

        this._pages = new LockPages({
            actor: this,
            clock: this._clock,
            prompt: this._promptBox,
            companions: [this._controls.actor],
            actionMode: Shell.ActionMode.UNLOCK_SCREEN,
            preparePrompt: () => this._ensureAuthPrompt(),
            clockShown: () => this._destroyAuthPrompt(),
            focusPrompt: () => this._authPrompt.focus(),
        });

        this.allowCancel = false;

        Main.ctrlAltTabManager.addGroup(this, _('Unlock Window'), 'dialog-password-symbolic');

        this._notificationsBox = new NotificationsBox();
        this._notificationsBox.connect('wake-up-screen', () => this.emit('wake-up-screen'));

        const mainBox = new St.Widget();
        mainBox.add_constraint(new Layout.MonitorConstraint({primary: true}));
        mainBox.add_child(this._stack);
        mainBox.add_child(this._notificationsBox);
        mainBox.add_child(this._controls.actor);
        mainBox.layout_manager = new UnlockDialogLayout(this._stack, this._notificationsBox, this._controls.actor);
        this.add_child(mainBox);

        this._idleMonitor = global.backend.get_core_idle_monitor();
        this._idleWatchId = this._idleMonitor.add_idle_watch(IDLE_TIMEOUT * 1000, () => {
            if (this._authPrompt && this.allowCancel)
                this._authPrompt.cancel();
        });

        this.connect('destroy', this._onDestroy.bind(this));
    }

    _ensureAuthPrompt() {
        if (this._authPrompt)
            return;

        this._authPrompt = new AuthPrompt(this._authentication);
        this._authPrompt.connect('cancelled', () => this._fail());
        this._authPrompt.connect('succeeded', () => {
            this._fingerprint.cancel();
            this.emit('unlocked');
        });
        this._authPrompt.setUser(this._user);
        this._promptBox.add_child(this._authPrompt);
        this._authPrompt.begin(this._userName);
        this._fingerprint.begin(this._userName);
    }

    _destroyAuthPrompt() {
        if (!this._authPrompt)
            return;

        const focus = global.stage.key_focus;
        if (focus === null || this._authPrompt.contains(focus))
            this.grab_key_focus();

        this._authentication.cancel();
        this._fingerprint.cancel();
        this._authPrompt.destroy();
        this._authPrompt = null;
    }

    _fail() {
        this._pages.showClock();
        this.emit('failed');
    }

    _onDestroy() {
        this.popModal();
        this._controls.destroy();
        this._idleMonitor.remove_watch(this._idleWatchId);
        this._authentication.destroy();
        this._fingerprint.destroy();
    }

    cancel() {
        this._authPrompt?.cancel();
    }

    finish(onComplete) {
        onComplete();
    }

    open() {
        this.show();

        if (this._isModal)
            return true;

        this._grab = Main.pushModal(Main.uiGroup, {actionMode: Shell.ActionMode.UNLOCK_SCREEN});
        this._isModal = true;
        return true;
    }

    activate() {
        this._pages.showPrompt();
    }

    popModal() {
        if (!this._isModal)
            return;
        Main.popModal(this._grab);
        this._grab = null;
        this._isModal = false;
    }
});
