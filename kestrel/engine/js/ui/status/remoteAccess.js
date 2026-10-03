import GObject from 'gi://GObject';

import * as Main from '../main.js';
import {SystemIndicator} from '../quickSettings.js';

export const RemoteAccessApplet = GObject.registerClass(
class RemoteAccessApplet extends SystemIndicator {
    _init() {
        super._init();

        const controller = global.backend.get_remote_access_controller();

        if (!controller)
            return;

        this._handles = new Set();

        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'media-record-symbolic';
        this._indicator.add_style_class_name('privacy-indicator');

        controller.connect('new-handle', (o, handle) => {
            this._onNewHandle(handle);
        });
        this._sync();
    }

    _isRecording() {
        // Screenshot UI screencasts have their own panel, so don't show this
        // indicator if there's only a screenshot UI screencast.
        if (Main.screenshotUI.screencast_in_progress)
            return this._handles.size > 1;

        return this._handles.size > 0;
    }

    _sync() {
        this._indicator.visible = this._isRecording();
    }

    _onStopped(handle) {
        this._handles.delete(handle);
        this._sync();
    }

    _onNewHandle(handle) {
        if (!handle.is_recording)
            return;

        this._handles.add(handle);
        handle.connect('stopped', this._onStopped.bind(this));

        this._sync();
    }
});
