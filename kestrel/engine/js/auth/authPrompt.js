import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Animation from '../ui/animation.js';
import * as ShellEntry from '../ui/shellEntry.js';
import * as UserWidget from '../ui/userWidget.js';
import {wiggle} from '../misc/animationUtils.js';

const BUTTON_ICON_SIZE = 16;
const FADE_TIME = 300;
const PASSWORD_QUESTIONS = ['Password:', 'Password: '];

function questionHint(question) {
    if (PASSWORD_QUESTIONS.includes(question))
        return _('Password');
    return question.replace(/[:：] *$/, '').trim();
}

export const AuthPrompt = GObject.registerClass({
    Signals: {
        'cancelled': {},
        'succeeded': {},
        'user-name': {param_types: [GObject.TYPE_STRING]},
        'loading': {param_types: [GObject.TYPE_BOOLEAN]},
    },
}, class AuthPrompt extends St.BoxLayout {
    _init(authentication) {
        super._init({
            style_class: 'login-dialog-prompt-layout',
            orientation: Clutter.Orientation.VERTICAL,
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
            reactive: true,
        });

        this._authentication = authentication;
        this._canGoBack = false;
        this._userName = null;
        this._askingUserName = false;
        this._question = null;
        this._preemptiveAnswer = null;
        this._answered = false;
        this._stalled = false;
        this._retrying = false;

        this._authentication.connectObject(
            'question', (_, text, secret) => this._onQuestion(text, secret),
            'message', (_, text, isError) => this._onMessage(text, isError),
            'failed', (_, authError, description) => this._onFailed(authError, description),
            'succeeded', () => this._onSucceeded(),
            this);

        this._userWell = new St.Bin({x_expand: true});
        this.add_child(this._userWell);

        const inputWell = new St.BoxLayout({
            style_class: 'login-dialog-input-well',
            orientation: Clutter.Orientation.VERTICAL,
        });
        this.add_child(inputWell);

        const row = new St.BoxLayout({style_class: 'login-dialog-button-box'});
        inputWell.add_child(row);

        this._backButton = new St.Button({
            style_class: 'login-dialog-button cancel-button',
            accessible_name: _('Back'),
            can_focus: true,
            y_align: Clutter.ActorAlign.CENTER,
            icon_name: 'go-previous-symbolic',
        });
        this._backButton.connect('clicked', () => this.cancel());
        row.add_child(this._backButton);

        this._entryArea = new St.Widget({
            style_class: 'login-dialog-prompt-entry-area',
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
        });
        row.add_child(this._entryArea);

        row.add_child(new Clutter.Actor({
            constraints: new Clutter.BindConstraint({
                source: this._backButton,
                coordinate: Clutter.BindCoordinate.WIDTH,
            }),
        }));

        const entryParams = {style_class: 'login-dialog-prompt-entry', can_focus: true, x_expand: true};
        this._textEntry = new St.Entry(entryParams);
        this._passwordEntry = new St.PasswordEntry(entryParams);
        for (const entry of [this._textEntry, this._passwordEntry]) {
            ShellEntry.addContextMenu(entry, {actionMode: Shell.ActionMode.NONE});
            entry.clutter_text.connect('text-changed', () => this._fadeOutMessage());
            entry.clutter_text.connect('activate', () => this._activate());
        }
        this._entry = this._passwordEntry;
        this._entryArea.add_child(this._entry);

        const buttonWell = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            style_class: 'login-dialog-default-button-well',
            x_expand: true,
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._entryArea.add_child(buttonWell);

        this._nextButton = new St.Button({
            style_class: 'login-dialog-button next-button',
            accessible_name: _('Submit'),
            can_focus: false,
            icon_name: 'go-next-symbolic',
        });
        this._nextButton.connect('clicked', () => this._activate());
        this._nextButton.add_style_pseudo_class('default');
        buttonWell.add_child(this._nextButton);

        this._spinner = new Animation.Spinner(BUTTON_ICON_SIZE);
        buttonWell.add_child(this._spinner);

        this._capsLockWarning = new ShellEntry.CapsLockWarning({
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
        });
        inputWell.add_child(this._capsLockWarning);

        this._message = new St.Label({
            style_class: 'login-dialog-message',
            opacity: 0,
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._message.clutter_text.line_wrap = true;
        this._message.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        inputWell.add_child(this._message);

        this._setBusy(false);
        this._updateBackButton();
        this.connect('destroy', () => this._clearEntries());
    }

    on_key_press_event(event) {
        if (event.get_key_symbol() === Clutter.KEY_Escape) {
            this.cancel();
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }

    get userName() {
        return this._userName;
    }

    allowGoingBack(allowed) {
        this._canGoBack = allowed;
        this._updateBackButton();
    }

    setUser(user) {
        this._userWell.child?.destroy();
        this._userWell.child = new UserWidget.UserWidget(user, Clutter.Orientation.VERTICAL);
    }

    askForUserName() {
        this._authentication.cancel();
        this._userName = null;
        this._askingUserName = true;
        this._question = null;
        this._preemptiveAnswer = null;
        this._useEntry(false, _('Username'));
        this._updateBackButton();
        this._setBusy(false);
        this._setMessage(null);
    }

    begin(userName) {
        this._userName = userName;
        this._askingUserName = false;
        this._question = null;
        this._answered = false;
        this._stalled = false;
        this._retrying = false;
        this._clearEntries();
        this._useEntry(true, '');
        this._updateBackButton();
        this._authentication.begin(userName);
    }

    cancel() {
        this._authentication.cancel();
        this._question = null;
        this._preemptiveAnswer = null;
        this._clearEntries();
        this._setBusy(false);
        this._setMessage(null);
        this.emit('cancelled');
    }

    startPreemptiveInput(unichar) {
        this._entry.grab_key_focus();
        if (unichar)
            this._entry.clutter_text.insert_unichar(unichar);
    }

    focus() {
        this._entry.grab_key_focus();
    }

    _updateBackButton() {
        const visible = this._canGoBack || this._question?.step > 1;
        this._backButton.opacity = visible ? 255 : 0;
        this._backButton.reactive = visible;
        this._backButton.can_focus = visible;
    }

    _useEntry(secret, hint) {
        const entry = secret ? this._passwordEntry : this._textEntry;
        if (entry !== this._entry) {
            const {text, cursorPosition, selectionBound} = this._entry.clutter_text;
            this._entryArea.replace_child(this._entry, entry);
            this._entry.text = '';
            this._entry = entry;
            this._entry.clutter_text.set({text, cursorPosition, selectionBound});
        }
        this._entry.hint_text = hint;
        this._capsLockWarning.visible = secret;
    }

    _activate() {
        if (!this._entry.reactive)
            return;

        const text = this._entry.text;
        if (this._askingUserName) {
            if (text.trim())
                this.emit('user-name', text.trim());
            return;
        }

        this._setBusy(true);
        this._answered = true;
        if (this._question) {
            this._authentication.answer(text);
        } else {
            this._preemptiveAnswer = text;
            if (this._stalled)
                this._restart();
        }
        this._clearEntries();
    }

    _onMessage(text, isError) {
        if (!this._retrying)
            this._setMessage(text, isError);
    }

    _onQuestion(text, secret) {
        this._retrying = false;
        this._question = {text, secret, step: (this._question?.step ?? 0) + 1};
        this._updateBackButton();

        if (this._preemptiveAnswer !== null && secret) {
            const answer = this._preemptiveAnswer;
            this._preemptiveAnswer = null;
            this._authentication.answer(answer);
            return;
        }

        this._useEntry(secret, questionHint(text));
        this._setBusy(false);
    }

    _onFailed(authError, description) {
        if (!authError)
            console.warn(`Authentication did not complete: ${description}`);
        const password = this._question?.secret && PASSWORD_QUESTIONS.includes(this._question.text);
        this._setMessage(password ? _('That password didn’t work') : _('That didn’t work. Try again.'), true);
        wiggle(this._entryArea);
        this._question = null;
        this._preemptiveAnswer = null;
        this._setBusy(false);
        if (this._answered)
            this._restart();
        else
            this._stalled = true;
    }

    _restart() {
        this._answered = false;
        this._stalled = false;
        this._retrying = true;
        this._authentication.begin(this._userName);
    }

    _onSucceeded() {
        this._question = null;
        this._stopSpinner();
        this.reactive = false;
        this._entryArea.ease({opacity: 0, duration: FADE_TIME, mode: Clutter.AnimationMode.EASE_OUT_QUAD});
        this.emit('succeeded');
    }

    _setBusy(busy) {
        this._entry.reactive = !busy;
        this._nextButton.reactive = !busy;
        if (busy) {
            this._passwordEntry.password_visible = false;
            this._spinner.play();
        } else {
            this._stopSpinner();
            this._entry.grab_key_focus();
        }
        this._nextButton.opacity = busy ? 0 : 255;
        this._spinner.opacity = busy ? 255 : 0;
        this.emit('loading', busy);
    }

    _stopSpinner() {
        this._spinner.stop();
        this._spinner.opacity = 0;
    }

    _clearEntries() {
        this._textEntry.text = '';
        this._passwordEntry.text = '';
    }

    _fadeOutMessage() {
        if (this._message.opacity === 0 || this._entry.text === '')
            return;
        this._message.ease({opacity: 0, duration: FADE_TIME, mode: Clutter.AnimationMode.EASE_OUT_QUAD});
    }

    _setMessage(message, isError = false) {
        this._message.remove_all_transitions();
        if (!message) {
            this._message.opacity = 0;
            return;
        }
        if (isError)
            this._message.add_style_class_name('login-dialog-message-warning');
        else
            this._message.remove_style_class_name('login-dialog-message-warning');
        this._message.text = message;
        this._message.opacity = 255;
        this.get_accessible().emit('notification', message, Atk.Live.ASSERTIVE);
    }
});
