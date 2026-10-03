import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as PopupMenu from './popupMenu.js';
import {Slider} from './slider.js';

const POPUP_ANIMATION_TIME = 240;

export const QuickSettingsItem = GObject.registerClass({
    Properties: {
        'has-menu': GObject.ParamSpec.boolean(
            'has-menu', null, null,
            GObject.ParamFlags.READWRITE |
            GObject.ParamFlags.CONSTRUCT_ONLY,
            false),
    },
}, class QuickSettingsItem extends St.Button {
    _init(params) {
        super._init(params);

        if (this.hasMenu) {
            this.menu = new QuickToggleMenu(this);
            this.menu.actor.hide();

            this._menuManager = new PopupMenu.PopupMenuManager(this);
            this._menuManager.addMenu(this.menu);
        }
    }
});

export const QuickToggle = GObject.registerClass({
    Properties: {
        'title': GObject.ParamSpec.string('title', null, null,
            GObject.ParamFlags.READWRITE,
            null),
        'subtitle': GObject.ParamSpec.string('subtitle', null, null,
            GObject.ParamFlags.READWRITE,
            null),
        'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
        'gicon': GObject.ParamSpec.object('gicon', null, null,
            GObject.ParamFlags.READWRITE,
            Gio.Icon),
    },
}, class QuickToggle extends QuickSettingsItem {
    _init(params) {
        super._init({
            style_class: 'quick-toggle button',
            accessible_role: Atk.Role.TOGGLE_BUTTON,
            can_focus: true,
            ...params,
        });

        this._box = new St.BoxLayout({x_expand: true});
        this.set_child(this._box);

        const iconProps = {};
        if (this.gicon)
            iconProps['gicon'] = this.gicon;
        if (this.iconName)
            iconProps['icon-name'] = this.iconName;

        this._icon = new St.Icon({
            style_class: 'quick-toggle-icon',
            x_expand: false,
            ...iconProps,
        });
        this._box.add_child(this._icon);

        // bindings are in the "wrong" direction, so we
        // pick up StIcon's linking of the two properties
        this._icon.bind_property('icon-name',
            this, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);
        this._icon.bind_property('gicon',
            this, 'gicon',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);

        this._title = new St.Label({
            style_class: 'quick-toggle-title',
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.START,
            x_expand: true,
        });
        this.label_actor = this._title;

        this._subtitle = new St.Label({
            style_class: 'quick-toggle-subtitle',
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.START,
            x_expand: true,
        });
        this.get_accessible().add_relationship(Atk.RelationType.DESCRIBED_BY, this._subtitle.get_accessible());

        const titleBox = new St.BoxLayout({
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.START,
            x_expand: true,
            orientation: Clutter.Orientation.VERTICAL,
        });
        titleBox.add_child(this._title);
        titleBox.add_child(this._subtitle);
        this._box.add_child(titleBox);

        this._title.clutter_text.ellipsize = Pango.EllipsizeMode.END;

        this.bind_property('title',
            this._title, 'text',
            GObject.BindingFlags.SYNC_CREATE);

        this.bind_property('subtitle',
            this._subtitle, 'text',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property_full('subtitle',
            this._subtitle, 'visible',
            GObject.BindingFlags.SYNC_CREATE,
            (bind, source) => [true, source !== null],
            null);
    }

    get label() {
        console.warn('Trying to get label from QuickToggle. Use title instead.');
        return this.title;
    }

    set label(label) {
        console.warn('Trying to set label on QuickToggle. Use title instead.');
        this.title = label;
    }
});

export const QuickMenuToggle = GObject.registerClass({
    Properties: {
        'title': GObject.ParamSpec.string('title', null, null,
            GObject.ParamFlags.READWRITE,
            null),
        'subtitle': GObject.ParamSpec.string('subtitle', null, null,
            GObject.ParamFlags.READWRITE,
            null),
        'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
        'gicon': GObject.ParamSpec.object('gicon', null, null,
            GObject.ParamFlags.READWRITE,
            Gio.Icon),
        'menu-enabled': GObject.ParamSpec.boolean(
            'menu-enabled', null, null,
            GObject.ParamFlags.READWRITE,
            true),
        'menu-button-accessible-name': GObject.ParamSpec.string(
            'menu-button-accessible-name', null, null,
            GObject.ParamFlags.READWRITE,
            _('Open menu')),
    },
}, class QuickMenuToggle extends QuickSettingsItem {
    _init(params) {
        super._init({
            ...params,
            hasMenu: true,
        });

        this.add_style_class_name('quick-toggle-has-menu');

        this._box = new St.BoxLayout({x_expand: true});
        this.set_child(this._box);

        const contents = new QuickToggle({
            x_expand: true,
        });
        this._box.add_child(contents);

        const separator = new St.Widget({style_class: 'quick-toggle-separator'});
        this._box.add_child(separator);

        this._menuButton = new St.Button({
            style_class: 'quick-toggle-menu-button icon-button',
            child: new St.Icon({icon_name: 'go-next-symbolic'}),
            can_focus: true,
            x_expand: false,
            y_expand: true,
        });
        this._box.add_child(this._menuButton);

        this._menuButton.bind_property('visible',
            separator, 'visible',
            GObject.BindingFlags.SYNC_CREATE);

        this.bind_property('toggle-mode',
            contents, 'toggle-mode',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('checked',
            contents, 'checked',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);
        this.bind_property('title',
            contents, 'title',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('subtitle',
            contents, 'subtitle',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('gicon',
            contents, 'gicon',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('icon-name',
            contents, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE);

        this.bind_property('menu-enabled',
            this._menuButton, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('menu-button-accessible-name',
            this._menuButton, 'accessible-name',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('reactive',
            this._menuButton, 'reactive',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('checked',
            this._menuButton, 'checked',
            GObject.BindingFlags.SYNC_CREATE);
        contents.connect('clicked', (o, button) => this.emit('clicked', button));
        this._menuButton.connect('clicked', () => this.menu.toggle());
        this._menuButton.connect('popup-menu', () => this.emit('popup-menu'));
        contents.connect('popup-menu', () => this.emit('popup-menu'));
        this.connect('popup-menu', () => {
            if (this.menuEnabled)
                this.menu.open();
        });
    }
});

export const QuickSlider = GObject.registerClass({
    Properties: {
        'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
        'gicon': GObject.ParamSpec.object('gicon', null, null,
            GObject.ParamFlags.READWRITE,
            Gio.Icon),
        'icon-reactive': GObject.ParamSpec.boolean(
            'icon-reactive', null, null,
            GObject.ParamFlags.READWRITE,
            false),
        'icon-label': GObject.ParamSpec.string(
            'icon-label', null, null,
            GObject.ParamFlags.READWRITE,
            ''),
        'menu-enabled': GObject.ParamSpec.boolean(
            'menu-enabled', null, null,
            GObject.ParamFlags.READWRITE,
            false),
        'menu-button-accessible-name': GObject.ParamSpec.string(
            'menu-button-accessible-name', null, null,
            GObject.ParamFlags.READWRITE,
            _('Open menu')),
    },
    Signals: {
        'icon-clicked': {},
    },
}, class QuickSlider extends QuickSettingsItem {
    _init(params) {
        super._init({
            style_class: 'quick-slider',
            ...params,
            can_focus: false,
            reactive: false,
            hasMenu: true,
        });

        const box = new St.BoxLayout({x_expand: true});
        this.set_child(box);

        const iconProps = {};
        if (this.gicon)
            iconProps['gicon'] = this.gicon;
        if (this.iconName)
            iconProps['icon-name'] = this.iconName;

        this._icon = new St.Icon({
            ...iconProps,
        });
        this._iconButton = new St.Button({
            child: this._icon,
            style_class: 'icon-button flat',
            can_focus: true,
            x_expand: false,
            y_expand: true,
        });
        this._iconButton.connect('clicked',
            () => this.emit('icon-clicked'));
        // Show as regular icon when non-interactive
        this._iconButton.connect('notify::reactive',
            () => this._iconButton.remove_style_pseudo_class('insensitive'));
        box.add_child(this._iconButton);

        this.bind_property('icon-reactive',
            this._iconButton, 'reactive',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('icon-reactive',
            this._iconButton, 'can-focus',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('icon-label',
            this._iconButton, 'accessible-name',
            GObject.BindingFlags.SYNC_CREATE);

        // bindings are in the "wrong" direction, so we
        // pick up StIcon's linking of the two properties
        this._icon.bind_property('icon-name',
            this, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);
        this._icon.bind_property('gicon',
            this, 'gicon',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);

        this.slider = new Slider(0);

        // for focus indication
        const sliderBin = new St.Bin({
            style_class: 'slider-bin',
            child: this.slider,
            reactive: true,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(sliderBin);

        this.slider.connectObject(
            'key-focus-in', () => sliderBin.add_style_pseudo_class('focus'),
            'key-focus-out', () => sliderBin.remove_style_pseudo_class('focus'),
            this);

        this._menuButton = new St.Button({
            child: new St.Icon({icon_name: 'go-next-symbolic'}),
            style_class: 'icon-button flat',
            can_focus: true,
            x_expand: false,
            y_expand: true,
        });
        box.add_child(this._menuButton);

        this.bind_property('menu-button-accessible-name',
            this._menuButton, 'accessible-name',
            GObject.BindingFlags.SYNC_CREATE);
        this.bind_property('menu-enabled',
            this._menuButton, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this._menuButton.connect('clicked', () => this.menu.toggle());
        this.slider.connect('popup-menu', () => {
            if (this.menuEnabled)
                this.menu.open();
        });
    }
});

class QuickToggleMenu extends PopupMenu.PopupMenuBase {
    constructor(sourceActor) {
        super(sourceActor, 'quick-toggle-menu');

        const constraints = new Clutter.BindConstraint({
            coordinate: Clutter.BindCoordinate.Y,
            source: sourceActor,
        });
        sourceActor.bind_property('height',
            constraints, 'offset',
            GObject.BindingFlags.DEFAULT);

        this.actor = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            style_class: 'quick-toggle-menu-container',
            reactive: true,
            x_expand: true,
            y_expand: false,
            height: 0,
            constraints,
        });
        this.actor._delegate = this;
        this.actor.add_child(this.box);
        this.actor.set_keynav_flags(St.KeynavFlags.WRAP_VERTICALLY);

        global.focus_manager.add_group(this.actor);

        const headerLayout = new Clutter.GridLayout();
        this._header = new St.Widget({
            style_class: 'header',
            layout_manager: headerLayout,
            visible: false,
        });
        headerLayout.hookup_style(this._header);
        this.box.add_child(this._header);

        this._headerIcon = new St.Icon({
            style_class: 'icon',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._headerTitle = new St.Label({
            style_class: 'title',
            y_align: Clutter.ActorAlign.CENTER,
            y_expand: true,
        });
        this._headerSubtitle = new St.Label({
            style_class: 'subtitle',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._headerSpacer = new Clutter.Actor({x_expand: true});

        const side = this.actor.text_direction === Clutter.TextDirection.RTL
            ? Clutter.GridPosition.LEFT
            : Clutter.GridPosition.RIGHT;

        headerLayout.attach(this._headerIcon, 0, 0, 1, 2);
        headerLayout.attach_next_to(this._headerTitle,
            this._headerIcon, side, 1, 1);
        headerLayout.attach_next_to(this._headerSpacer,
            this._headerTitle, side, 1, 1);
        headerLayout.attach_next_to(this._headerSubtitle,
            this._headerTitle, Clutter.GridPosition.BOTTOM, 1, 1);

        sourceActor.connect('notify::checked',
            () => this._syncChecked());
        this._syncChecked();
    }

    setHeader(icon, title, subtitle = '') {
        if (icon instanceof Gio.Icon)
            this._headerIcon.gicon = icon;
        else
            this._headerIcon.icon_name = icon;

        this._headerTitle.text = title;
        this._headerSubtitle.set({
            text: subtitle,
            visible: !!subtitle,
        });

        this._headerSet = true;
        this._syncHeader();
    }

    get hosted() {
        return this._hosted ?? false;
    }

    set hosted(hosted) {
        this._hosted = hosted;
        this._syncHeader();
    }

    _syncHeader() {
        this._header.visible = !!this._headerSet && !this.hosted;
    }

    addHeaderSuffix(actor) {
        const {layoutManager: headerLayout} = this._header;
        const side = this.actor.text_direction === Clutter.TextDirection.RTL
            ? Clutter.GridPosition.LEFT
            : Clutter.GridPosition.RIGHT;
        this._header.remove_child(this._headerSpacer);
        headerLayout.attach_next_to(actor, this._headerTitle, side, 1, 1);
        headerLayout.attach_next_to(this._headerSpacer, actor, side, 1, 1);
    }

    /**
     * @param {object} params
     * @param {bool} [params.animate=true] whether to animate the transition
     * @param {Clutter.Event} [params.triggerEvent] the keyboard/mouse event that triggered opening this
     *
     * @returns {bool} whether the open state changed
     */
    open(params = {}) {
        if (!super.open(params))
            return false;

        if (this.hosted)
            return true;

        const previousHeight = this.actor.height;
        this.actor.height = -1;
        const [targetHeight] = this.actor.get_preferred_height(-1);
        this.actor.height = previousHeight;
        const distance = Math.abs(targetHeight - previousHeight);

        const {animate = true} = params;
        const duration = animate
            ? POPUP_ANIMATION_TIME / 2
            : 0;

        this.box.opacity = 0;
        this.actor.ease({
            duration: duration * (distance / targetHeight),
            height: targetHeight,
            onComplete: () => {
                this.box.ease({
                    duration,
                    opacity: 255,
                });
                this.actor.height = -1;
            },
        });
        return true;
    }

    /**
     * @param {object} params
     * @param {bool} [params.animate=true] whether to animate the transition
     *
     * @returns {bool} whether the open state changed
     */
    close(params = {}) {
        if (!super.close(params))
            return false;

        if (this.hosted)
            return true;

        const {animate = true} = params;
        const {opacity} = this.box;
        const duration = animate
            ? POPUP_ANIMATION_TIME / 2
            : 0;

        this.box.ease({
            duration: duration * (opacity / 255),
            opacity: 0,
            onComplete: () => {
                this.actor.ease({
                    duration,
                    height: 0,
                    onComplete: () => {
                        this.actor.hide();
                        this.emit('menu-closed');
                    },
                });
            },
        });

        return true;
    }

    _syncChecked() {
        if (this.sourceActor.checked)
            this._headerIcon.add_style_class_name('active');
        else
            this._headerIcon.remove_style_class_name('active');
    }

    // expected on toplevel menus
    _setOpenedSubMenu(submenu) {
        this._openedSubMenu?.close(true);
        this._openedSubMenu = submenu;
    }
}

export const SystemIndicator = GObject.registerClass(
class SystemIndicator extends St.BoxLayout {
    _init() {
        super._init({
            style_class: 'panel-status-indicators-box',
            reactive: true,
            visible: false,
        });

        this.quickSettingsItems = [];
    }

    _syncIndicatorsVisible() {
        this.visible = this.get_children().some(a => a.visible);
    }

    _addIndicator() {
        const icon = new St.Icon({style_class: 'system-status-icon'});
        this.add_child(icon);
        icon.connect('notify::visible', () => this._syncIndicatorsVisible());
        this._syncIndicatorsVisible();
        return icon;
    }
});
