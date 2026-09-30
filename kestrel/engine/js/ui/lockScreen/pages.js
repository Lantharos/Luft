import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from '../main.js';
import * as SwipeTracker from '../swipeTracker.js';

const CROSSFADE_TIME = 300;
const FADE_OUT_TRANSLATION = 200;
const FADE_OUT_SCALE = 0.3;
const MODIFIER_KEYS = [Clutter.KEY_Shift_L, Clutter.KEY_Shift_R, Clutter.KEY_Shift_Lock, Clutter.KEY_Caps_Lock];

export class LockPages {
    constructor({actor, clock, prompt, companions, actionMode, preparePrompt, clockShown, startTyping}) {
        this._clock = clock;
        this._prompt = prompt;
        this._companions = companions;
        this._preparePrompt = preparePrompt;
        this._clockShown = clockShown;
        this._startTyping = startTyping;
        this._activePage = null;

        clock.set_pivot_point(0.5, 0.5);
        prompt.set_pivot_point(0.5, 0.5);
        for (const companion of companions)
            companion.set_pivot_point(0.5, 0.5);

        this._adjustment = new St.Adjustment({actor, lower: 0, upper: 2, page_size: 1, page_increment: 1});
        this._adjustment.connect('notify::value', () => this._setProgress(this._adjustment.value));

        this._swipeTracker = new SwipeTracker.SwipeTracker(actor, Clutter.Orientation.VERTICAL, actionMode,
            {name: 'Lock screen swipe tracker'});
        this._swipeTracker.connect('begin', this._swipeBegin.bind(this));
        this._swipeTracker.connect('update', (_tracker, progress) => (this._adjustment.value = progress));
        this._swipeTracker.connect('end', this._swipeEnd.bind(this));

        const scroll = new Clutter.ScrollController({
            flags: Clutter.ScrollControllerFlags.DISCRETE | Clutter.ScrollControllerFlags.SCROLL_VERTICAL,
        });
        scroll.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
            if (dy < 0)
                this.showClock();
            else if (dy > 0)
                this.showPrompt();
        });
        actor.add_action(scroll);

        this._keyController = new Clutter.KeyController();
        this._keyController.connect('key-press', () => this._onKeyPress());
        actor.add_action(this._keyController);

        const click = new Clutter.ClickGesture();
        click.connect('recognize', () => this.showPrompt());
        actor.add_action(click);

        this._setProgress(0);
        this.showClock();
    }

    get promptShown() {
        return this._activePage === this._prompt;
    }

    showClock() {
        if (this._activePage === this._clock)
            return;
        this._activePage = this._clock;
        this._adjustment.ease(0, {
            duration: CROSSFADE_TIME,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => this._clockShown(),
        });
    }

    showPrompt() {
        this._preparePrompt();
        if (this._activePage === this._prompt)
            return;
        this._activePage = this._prompt;
        this._adjustment.ease(1, {
            duration: CROSSFADE_TIME,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }

    _onKeyPress() {
        if (this._activePage === this._prompt || this._prompt.visible)
            return Clutter.EVENT_PROPAGATE;

        const [, keyval, , unichar] = this._keyController.get_key();
        if (MODIFIER_KEYS.includes(keyval))
            return Clutter.EVENT_PROPAGATE;

        this.showPrompt();
        if (GLib.unichar_isprint(unichar))
            this._startTyping(unichar);
        return Clutter.EVENT_PROPAGATE;
    }

    _swipeBegin(tracker, monitor) {
        if (monitor !== Main.layoutManager.primaryIndex)
            return;
        this._adjustment.remove_transition('value');
        this._preparePrompt();
        const progress = this._adjustment.value;
        tracker.confirmSwipe(this._clock.get_parent().height, [0, 1], progress, Math.round(progress));
    }

    _swipeEnd(_tracker, duration, endProgress) {
        this._activePage = endProgress ? this._prompt : this._clock;
        this._adjustment.ease(endProgress, {
            mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
            duration,
            onComplete: () => {
                if (this._activePage === this._clock)
                    this._clockShown();
            },
        });
    }

    _setProgress(progress) {
        this._prompt.visible = progress > 0;
        this._clock.visible = progress < 1;

        const {scaleFactor} = St.ThemeContext.get_for_stage(global.stage);
        const useMotion = St.Settings.get().reducedMotion !== St.ReducedMotion.REDUCE;
        const scale = value => (useMotion ? {scale_x: value, scale_y: value} : {});
        const shrunk = value => FADE_OUT_SCALE + (1 - FADE_OUT_SCALE) * value;

        this._prompt.set({
            opacity: 255 * progress,
            ...scale(shrunk(progress)),
            ...useMotion ? {translation_y: FADE_OUT_TRANSLATION * (1 - progress) * scaleFactor} : {},
        });
        this._clock.set({
            opacity: 255 * (1 - progress),
            ...scale(shrunk(1 - progress)),
            ...useMotion ? {translation_y: -FADE_OUT_TRANSLATION * progress * scaleFactor} : {},
        });
        for (const companion of this._companions)
            companion.set({opacity: 255 * progress, visible: progress > 0, ...scale(shrunk(progress))});
    }
}
