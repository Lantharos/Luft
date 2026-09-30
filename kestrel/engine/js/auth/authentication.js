import * as Signals from '../misc/signals.js';

export class Authentication extends Signals.EventEmitter {
    constructor(openChannel) {
        super();
        this._openChannel = openChannel;
        this._channel = null;
        this._queue = Promise.resolve();
        this._generation = 0;
        this._configuring = false;
        this._busy = false;
    }

    begin(userName) {
        this._run(++this._generation, async channel => {
            await this._closeSession(channel);
            this._configuring = true;
            return channel.request({type: 'create_session', username: userName});
        });
    }

    answer(response) {
        this._run(this._generation, channel => channel.request({type: 'post_auth_message_response', response}));
    }

    cancel() {
        const generation = ++this._generation;
        if (this._busy && this._channel?.abort) {
            this._dropChannel(this._channel);
            return;
        }
        this._run(generation, async channel => {
            await this._closeSession(channel);
            return null;
        });
    }

    startSession(command, environment) {
        return new Promise(resolve => this._run(this._generation, async channel => {
            const reply = await channel.request({type: 'start_session', cmd: command, env: environment});
            resolve(reply.type === 'success');
            return null;
        }));
    }

    destroy() {
        this._generation++;
        if (this._channel)
            this._dropChannel(this._channel);
    }

    async _closeSession(channel) {
        if (!this._configuring)
            return;
        this._configuring = false;
        await channel.request({type: 'cancel_session'});
    }

    _dropChannel(channel) {
        if (channel.abort)
            channel.abort();
        else
            channel.close();
        if (this._channel === channel) {
            this._channel = null;
            this._configuring = false;
        }
    }

    _run(generation, step) {
        this._queue = this._queue.then(async () => {
            if (generation !== this._generation)
                return;
            this._busy = true;
            let reply;
            let channel = this._channel;
            try {
                channel ??= this._channel = await this._openChannel();
                reply = await step(channel);
            } catch (error) {
                if (channel)
                    this._dropChannel(channel);
                reply = {type: 'error', error_type: 'error', description: error.message};
            } finally {
                this._busy = false;
            }
            if (reply && generation === this._generation)
                this._handle(reply, generation);
        });
    }

    _handle(reply, generation) {
        if (reply.type === 'success') {
            this.emit('succeeded');
            return;
        }

        if (reply.type === 'error') {
            this.emit('failed', reply.error_type === 'auth_error', reply.description);
            return;
        }

        const {auth_message_type: kind, auth_message: text} = reply;
        if (kind === 'secret' || kind === 'visible') {
            this.emit('question', text, kind === 'secret');
            return;
        }

        this.emit('message', text, kind === 'error');
        this._run(generation, channel => channel.request({type: 'post_auth_message_response'}));
    }
}
