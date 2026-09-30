import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../main.js';
import * as MessageTray from '../messageTray.js';
import {styleSurface} from '../kestrelGlass.js';
import {fixMarkup} from '../../misc/util.js';
import {MprisSource} from '../mpris.js';
import {MediaMessage} from '../messageList.js';

const LOCK_SCREEN_PREVIEWS = 3;

export const NotificationsBox = GObject.registerClass({
    Signals: {'wake-up-screen': {}},
}, class NotificationsBox extends St.BoxLayout {
    _init() {
        super._init({
            orientation: Clutter.Orientation.VERTICAL,
            name: 'unlockDialogNotifications',
        });

        this._notificationBox = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL,
            style_class: 'unlock-dialog-notifications-container',
        });

        this._scrollView = new St.ScrollView({
            child: this._notificationBox,
        });
        this.add_child(this._scrollView);

        this._players = new Map();
        this._mediaSource = new MprisSource();
        this._mediaSource.connectObject(
            'player-added', (o, player) => this._addPlayer(player),
            'player-removed', (o, player) => this._removePlayer(player),
            this);
        this._mediaSource.players.forEach(player => {
            this._addPlayer(player);
        });

        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.notifications',
        });
        this._shellSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
        this._shellSettings.connectObject('changed::lock-screen-content', () => {
            for (const [source, obj] of this._sources)
                this._detailedChanged(source, obj);
        }, this);

        this._sources = new Map();
        Main.messageTray.getSources().forEach(source => {
            this._sourceAdded(Main.messageTray, source, true);
        });
        this._updateVisibility();

        Main.messageTray.connectObject('source-added',
            this._sourceAdded.bind(this), this);

        this.connect('destroy', this._onDestroy.bind(this));
    }

    _onDestroy() {
        const items = this._sources.entries();
        for (const [source, obj] of items)
            this._removeSource(source, obj);

        for (const player of this._players.keys())
            this._removePlayer(player);
    }

    _updateVisibility() {
        this._notificationBox.visible =
            this._notificationBox.get_children().some(a => a.visible);

        this.visible = this._notificationBox.visible;
    }

    _makeNotificationSource(source, box) {
        const iconActor = new St.Icon({
            style_class: 'unlock-dialog-notification-icon',
            fallback_icon_name: 'application-x-executable',
        });
        source.bind_property('icon', iconActor, 'gicon', GObject.BindingFlags.SYNC_CREATE);
        box.add_child(iconActor);

        const textBox = new St.BoxLayout({
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(textBox);

        const title = new St.Label({
            style_class: 'unlock-dialog-notification-label',
            x_expand: true,
            x_align: Clutter.ActorAlign.START,
        });
        source.bind_property('title',
            title, 'text',
            GObject.BindingFlags.SYNC_CREATE);
        textBox.add_child(title);

        const count = source.unseenCount;
        const countLabel = new St.Label({
            text: `${count}`,
            visible: count > 1,
            style_class: 'unlock-dialog-notification-count-text',
        });
        textBox.add_child(countLabel);

        box.visible = count !== 0;
        return [title, countLabel];
    }

    _makeNotificationDetailedSource(source, box) {
        const iconActor = new St.Icon({
            style_class: 'unlock-dialog-notification-icon',
            fallback_icon_name: 'application-x-executable',
            y_align: Clutter.ActorAlign.START,
        });
        source.bind_property('icon', iconActor, 'gicon', GObject.BindingFlags.SYNC_CREATE);
        box.add_child(iconActor);

        const textBox = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL,
        });
        box.add_child(textBox);

        const title = new St.Label({
            style_class: 'unlock-dialog-notification-label',
        });
        source.bind_property_full('title',
            title, 'text',
            GObject.BindingFlags.SYNC_CREATE,
            (bind, sourceVal) => [true, sourceVal?.replace(/\n/g, ' ') ?? ''],
            null);
        textBox.add_child(title);

        const unseen = source.notifications
            .filter(notification => !notification.acknowledged)
            .sort((a, b) => b.datetime.compare(a.datetime));
        for (const notification of unseen.slice(0, LOCK_SCREEN_PREVIEWS)) {
            const preview = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                style_class: 'unlock-dialog-notification-preview',
            });
            const title = new St.Label({
                style_class: 'unlock-dialog-notification-preview-title',
                text: notification.title.replace(/\n/g, ' '),
            });
            preview.add_child(title);
            if (notification.body) {
                const body = new St.Label({style_class: 'unlock-dialog-notification-preview-body'});
                body.clutter_text.set_markup(fixMarkup(notification.body.replace(/\n/g, ' '), notification.useBodyMarkup));
                preview.add_child(body);
            }
            textBox.add_child(preview);
        }
        const visible = unseen.length > 0;

        box.visible = visible;
        return [title, null];
    }

    _shouldShowDetails(source) {
        return (this._shellSettings.get_boolean('lock-screen-content') && source.policy.showInLockScreen) ||
               source.policy.detailsInLockScreen ||
               source.narrowestPrivacyScope === MessageTray.PrivacyScope.SYSTEM;
    }

    _updateSourceBoxStyle(source, obj, box) {
        const hasCriticalNotification =
            source.notifications.some(n => n.urgency === MessageTray.Urgency.CRITICAL);

        if (hasCriticalNotification !== obj.hasCriticalNotification) {
            obj.hasCriticalNotification = hasCriticalNotification;

            if (hasCriticalNotification)
                box.add_style_class_name('critical');
            else
                box.remove_style_class_name('critical');
        }
    }

    _showSource(source, obj, box) {
        if (obj.detailed)
            [obj.titleLabel, obj.countLabel] = this._makeNotificationDetailedSource(source, box);
        else
            [obj.titleLabel, obj.countLabel] = this._makeNotificationSource(source, box);

        box.visible = obj.visible && (source.unseenCount > 0);

        this._updateSourceBoxStyle(source, obj, box);
    }

    _wakeUpScreenForSource(source) {
        if (!this._settings.get_boolean('show-banners'))
            return;
        const obj = this._sources.get(source);
        if (obj?.sourceBox.visible)
            this.emit('wake-up-screen');
    }

    _addPlayer(player) {
        const message = new MediaMessage(player);
        this._players.set(player, message);
        this._notificationBox.insert_child_at_index(message, 0);
        this._updateVisibility();
    }

    _removePlayer(player) {
        const message = this._players.get(player);
        this._players.delete(player);
        message.destroy();
        this._updateVisibility();
    }

    _sourceAdded(tray, source, initial) {
        const obj = {
            visible: source.policy.showInLockScreen,
            detailed: this._shouldShowDetails(source),
            sourceBox: null,
            titleLabel: null,
            countLabel: null,
            hasCriticalNotification: false,
        };

        obj.sourceBox = new St.BoxLayout({
            style_class: 'unlock-dialog-notification-source',
            x_expand: true,
        });
        styleSurface(obj.sourceBox, 20);
        this._showSource(source, obj, obj.sourceBox);
        this._notificationBox.insert_child_at_index(obj.sourceBox, this._players.size);

        source.connectObject(
            'notify::count', () => this._countChanged(source, obj),
            'notify::title', () => this._titleChanged(source, obj),
            'destroy', () => {
                this._removeSource(source, obj);
                this._updateVisibility();
            }, this);
        obj.policyChangedId = source.policy.connect('notify', (policy, pspec) => {
            if (pspec.name === 'show-in-lock-screen')
                this._visibleChanged(source, obj);
            else
                this._detailedChanged(source, obj);
        });

        this._sources.set(source, obj);

        if (!initial) {
            const boxHeight = this._notificationBox.height;
            if (this._scrollView.height >= boxHeight)
                this._scrollView.vscrollbar_policy = St.PolicyType.NEVER;

            const widget = obj.sourceBox;
            const [, natHeight] = widget.get_preferred_height(-1);
            widget.height = 0;
            widget.ease({
                height: natHeight,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD,
                duration: 250,
                onComplete: () => {
                    this._scrollView.vscrollbar_policy = St.PolicyType.AUTOMATIC;
                    widget.set_height(-1);
                },
            });

            this._updateVisibility();
            this._wakeUpScreenForSource(source);
        }
    }

    _titleChanged(source, obj) {
        obj.titleLabel.text = source.title;
    }

    _countChanged(source, obj) {
        const newDetailed = this._shouldShowDetails(source);
        const oldDetailed = obj.detailed;

        obj.detailed = newDetailed;

        if (obj.detailed || oldDetailed !== newDetailed) {
            obj.sourceBox.destroy_all_children();
            obj.titleLabel = obj.countLabel = null;
            this._showSource(source, obj, obj.sourceBox);
        } else {
            const count = source.unseenCount;
            obj.countLabel.text = `${count}`;
            obj.countLabel.visible = count > 1;
        }

        obj.sourceBox.visible = obj.visible && (source.unseenCount > 0);

        this._updateVisibility();
        this._wakeUpScreenForSource(source);
    }

    _visibleChanged(source, obj) {
        if (obj.visible === source.policy.showInLockScreen)
            return;

        obj.visible = source.policy.showInLockScreen;
        obj.sourceBox.visible = obj.visible && source.unseenCount > 0;

        this._updateVisibility();
        this._wakeUpScreenForSource(source);
    }

    _detailedChanged(source, obj) {
        const newDetailed = this._shouldShowDetails(source);
        if (obj.detailed === newDetailed)
            return;

        obj.detailed = newDetailed;

        obj.sourceBox.destroy_all_children();
        obj.titleLabel = obj.countLabel = null;
        this._showSource(source, obj, obj.sourceBox);
    }

    _removeSource(source, obj) {
        obj.sourceBox.destroy();
        obj.sourceBox = obj.titleLabel = obj.countLabel = null;

        source.policy.disconnect(obj.policyChangedId);

        this._sources.delete(source);
    }
});
