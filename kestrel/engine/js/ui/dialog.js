import {styleSurface} from './kestrelGlass.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

function _setLabel(label, value) {
    label.set({
        text: value || '',
        visible: value !== null,
    });
}

export const Dialog = GObject.registerClass(
class Dialog extends St.Widget {
    _init(parentActor, styleClass) {
        super._init({
            layout_manager: new Clutter.BinLayout(),
            reactive: true,
        });
        this.connect('destroy', this._onDestroy.bind(this));

        this._initialKeyFocus = null;
        this._pressedKey = null;
        this._buttonKeys = {};
        this._createDialog();
        styleSurface(this._dialog);
        this.add_child(this._dialog);

        if (styleClass != null)
            this._dialog.add_style_class_name(styleClass);

        this._parentActor = parentActor;
        this._parentActor.add_child(this);

        const keyController = new Clutter.KeyController();
        keyController.connectObject(
            'key-press', () => {
                const [, symbol] = keyController.get_key();
                this._pressedKey = symbol;
                return Clutter.EVENT_PROPAGATE;
            },
            'key-release', () => {
                const pressedKey = this._pressedKey;
                this._pressedKey = null;

                const [, symbol] = keyController.get_key();
                if (symbol !== pressedKey)
                    return Clutter.EVENT_PROPAGATE;

                const buttonInfo = this._buttonKeys[symbol];
                if (!buttonInfo)
                    return Clutter.EVENT_PROPAGATE;

                const {button, action} = buttonInfo;

                if (action && button.reactive) {
                    action();
                    return Clutter.EVENT_STOP;
                }
                return Clutter.EVENT_PROPAGATE;
            },
            this);
        this.add_action(keyController);
    }

    _createDialog() {
        this._dialog = new St.BoxLayout({
            style_class: 'modal-dialog',
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            orientation: Clutter.Orientation.VERTICAL,
        });

        // modal dialogs are fixed width and grow vertically; set the request
        // mode accordingly so wrapped labels are handled correctly during
        // size requests.
        this._dialog.request_mode = Clutter.RequestMode.HEIGHT_FOR_WIDTH;

        this.contentLayout = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL,
            style_class: 'modal-dialog-content-box',
            y_expand: true,
        });
        this._dialog.add_child(this.contentLayout);

        this.buttonLayout = new St.Widget({
            style_class: 'modal-dialog-button-box',
            layout_manager: new Clutter.BoxLayout({
                spacing: 12,
                homogeneous: true,
            }),
        });
        this._dialog.add_child(this.buttonLayout);
    }

    makeInactive() {
        this.buttonLayout.get_children().forEach(c => c.set_reactive(false));
    }

    _onDestroy() {
        this.makeInactive();
    }

    _setInitialKeyFocus(actor) {
        this._initialKeyFocus?.disconnectObject(this);

        this._initialKeyFocus = actor;

        actor.connectObject('destroy',
            () => (this._initialKeyFocus = null), this);
    }

    get initialKeyFocus() {
        return this._initialKeyFocus || this;
    }

    addButton(buttonInfo) {
        const {label, action, key, reactive = true} = buttonInfo;
        const isDefault = buttonInfo['default'];
        let keys;

        if (key)
            keys = [key];
        else if (isDefault)
            keys = [Clutter.KEY_Return, Clutter.KEY_KP_Enter, Clutter.KEY_ISO_Enter];
        else
            keys = [];

        const button = new St.Button({
            style_class: 'modal-dialog-button',
            button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
            reactive,
            can_focus: reactive,
            x_expand: true,
            y_expand: true,
            label,
        });
        button.connect('clicked', () => action());

        buttonInfo['button'] = button;

        if (isDefault)
            button.add_style_pseudo_class('default');

        if (this._initialKeyFocus == null || isDefault)
            this._setInitialKeyFocus(button);

        for (const i in keys)
            this._buttonKeys[keys[i]] = buttonInfo;

        this.buttonLayout.add_child(button);

        return button;
    }

    clearButtons() {
        this.buttonLayout.destroy_all_children();
        this._buttonKeys = {};
    }
});

export const MessageDialogContent = GObject.registerClass({
    Properties: {
        'title': GObject.ParamSpec.string(
            'title', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT,
            null),
        'description': GObject.ParamSpec.string(
            'description', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT,
            null),
    },
}, class MessageDialogContent extends St.BoxLayout {
    _init(params) {
        this._title = new St.Label({style_class: 'message-dialog-title'});
        this._description = new St.Label({style_class: 'message-dialog-description'});

        this._title.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        this._title.clutter_text.line_wrap = true;

        this._description.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        this._description.clutter_text.line_wrap = true;

        super._init({
            style_class: 'message-dialog-content',
            x_expand: true,
            orientation: Clutter.Orientation.VERTICAL,
            ...params,
        });

        this.add_child(this._title);
        this.add_child(this._description);
    }

    get title() {
        return this._title.text;
    }

    get description() {
        return this._description.text;
    }

    set title(title) {
        if (this._title.text === title)
            return;

        _setLabel(this._title, title);

        this.notify('title');
    }

    set description(description) {
        if (this._description.text === description)
            return;

        _setLabel(this._description, description);
        this.notify('description');
    }
});

export const ListSection = GObject.registerClass({
    Properties: {
        'title': GObject.ParamSpec.string(
            'title', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT,
            null),
    },
}, class ListSection extends St.BoxLayout {
    _init(params) {
        this._title = new St.Label({style_class: 'dialog-list-title'});
        this._title.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        this._title.clutter_text.line_wrap = true;

        this.list = new St.BoxLayout({
            style_class: 'dialog-list-box',
            orientation: Clutter.Orientation.VERTICAL,
        });

        this._listScrollView = new St.ScrollView({
            style_class: 'dialog-list-scrollview',
            child: this.list,
        });

        super._init({
            style_class: 'dialog-list',
            x_expand: true,
            orientation: Clutter.Orientation.VERTICAL,
            ...params,
        });

        this.label_actor = this._title;
        this.add_child(this._title);
        this.add_child(this._listScrollView);
    }

    get title() {
        return this._title.text;
    }

    set title(title) {
        _setLabel(this._title, title);
        this.notify('title');
    }
});

export const ListSectionItem = GObject.registerClass({
    Properties: {
        'icon-actor':  GObject.ParamSpec.object(
            'icon-actor', null, null,
            GObject.ParamFlags.READWRITE,
            Clutter.Actor.$gtype),
        'title': GObject.ParamSpec.string(
            'title', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT,
            null),
        'description': GObject.ParamSpec.string(
            'description', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT,
            null),
    },
}, class ListSectionItem extends St.BoxLayout {
    _init(params) {
        this._iconActorBin = new St.Bin();

        const textLayout = new St.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL,
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._title = new St.Label({style_class: 'dialog-list-item-title'});

        this._description = new St.Label({
            style_class: 'dialog-list-item-description',
        });

        this._description.clutter_text.line_wrap = true;
        this._description.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        textLayout.add_child(this._title);
        textLayout.add_child(this._description);

        super._init({
            style_class: 'dialog-list-item',
            ...params,
        });

        this.label_actor = this._title;
        this.add_child(this._iconActorBin);
        this.add_child(textLayout);
    }

    get iconActor() {
        return this._iconActorBin.get_child();
    }

    set iconActor(actor) {
        this._iconActorBin.set_child(actor);
        this.notify('icon-actor');
    }

    get title() {
        return this._title.text;
    }

    set title(title) {
        _setLabel(this._title, title);
        this.notify('title');
    }

    get description() {
        return this._description.text;
    }

    set description(description) {
        _setLabel(this._description, description);
        this.notify('description');
    }
});

export const EntryField = GObject.registerClass(
class EntryField extends St.BoxLayout {
    _init(entry, label, statusActor = null) {
        super._init({
            style_class: 'kestrel-entry-field',
            orientation: Clutter.Orientation.VERTICAL,
            x_expand: true,
        });
        this.label_actor = new St.Label({style_class: 'kestrel-entry-label'});
        this.label_actor.clutter_text.line_wrap = true;
        this.label_actor.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        if (statusActor) {
            const heading = new St.BoxLayout();
            this.label_actor.x_expand = true;
            statusActor.y_align = Clutter.ActorAlign.CENTER;
            heading.add_child(this.label_actor);
            heading.add_child(statusActor);
            this.add_child(heading);
        } else {
            this.add_child(this.label_actor);
        }
        entry.x_expand = true;
        entry.x_align = Clutter.ActorAlign.FILL;
        entry.label_actor = this.label_actor;
        this.add_child(entry);
        entry.bind_property('visible', this, 'visible', GObject.BindingFlags.SYNC_CREATE);
        this.label = label;
    }

    set label(text) {
        this.label_actor.text = text;
    }
});
