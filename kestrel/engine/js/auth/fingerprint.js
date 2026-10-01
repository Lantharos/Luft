import * as Signals from '../misc/signals.js';
import {Authentication} from './authentication.js';
import {connectAuthenticator} from './greetd.js';

const RESTARTS = 1;

export class FingerprintAuthentication extends Signals.EventEmitter {
    constructor() {
        super();
        this._authentication = new Authentication(connectAuthenticator, {mode: 'fingerprint'});
        this._userName = null;
        this._instruction = null;
        this._listening = false;
        this._restarts = 0;

        this._authentication.connectObject(
            'question', () => this._stop(null),
            'message', (_, text, isError) => this._onMessage(text, isError),
            'failed', () => this._onFailed(),
            'succeeded', () => this.emit('succeeded'),
            this);
    }

    begin(userName) {
        this._userName = userName;
        this._instruction = null;
        this._restarts = 0;
        this._start();
    }

    cancel() {
        this._listening = false;
        this._authentication.cancel();
    }

    destroy() {
        this._authentication.destroy();
    }

    _start() {
        this._listening = false;
        this._authentication.begin(this._userName);
    }

    _stop(hint) {
        this.cancel();
        this.emit('hint', hint);
    }

    _onMessage(text, isError) {
        if (isError) {
            if (this._listening)
                this.emit('hint', _('Fingerprint not recognized'));
            else
                this._stop(null);
            return;
        }

        this._listening = true;
        if (text === this._instruction)
            return;
        this._instruction = text;
        this.emit('hint', text);
    }

    _onFailed() {
        if (!this._listening) {
            this._stop(null);
        } else if (this._restarts < RESTARTS) {
            this._restarts++;
            this.emit('hint', _('Fingerprint not recognized'));
            this._start();
        } else {
            this._stop(_('Fingerprint not recognized'));
        }
    }
}
