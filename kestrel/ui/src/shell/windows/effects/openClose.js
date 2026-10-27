import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {Curve, Duration, Spring, holdMotion, reducedMotion} from '../../../kestrelUi.js';

const OPEN = {scale: 0.94, rise: 8};
const DIALOG_OPEN = {scale: 0.96, rise: 0};
const CLOSE_SCALE = 0.95;
const CONTENT_TIMEOUT = 1000;
const PAINT_TIMEOUT = 100;
const ANIMATED = ['scale-x', 'scale-y', 'translation-y', 'opacity'];

const hasContent = texture => texture.get_preferred_size()[1] > 0;

/**
 * @param {GObject.Object} object
 * @param {string} signal
 * @param {(...args) => boolean} test
 * @param {number} timeout ms after which `then` runs anyway
 * @param {() => void} then
 * @returns {() => void} cancels the wait
 */
function waitFor(object, signal, test, timeout, then) {
    const cancel = () => {
        object.disconnect(id);
        GLib.source_remove(timer);
    };
    const id = object.connect(signal, (...args) => {
        if (!test(...args))
            return;
        cancel();
        then();
    });
    const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
        object.disconnect(id);
        then();
        return GLib.SOURCE_REMOVE;
    });
    return cancel;
}

/**
 * Calls `shown` once the window has content and the frame that first
 * carries it has been drawn, so the animation starts after that costly
 * frame instead of losing its beginning to it.
 *
 * @param {Meta.WindowActor} actor
 * @param {() => void} shown
 * @returns {() => void} cancels the wait
 */
function afterFirstFrame(actor, shown) {
    const texture = actor.get_texture();
    let cancel;
    const afterPaint = () => {
        cancel = waitFor(global.stage, 'after-paint', (_stage, view) => actor.peek_stage_views().includes(view),
            PAINT_TIMEOUT, shown);
        actor.queue_redraw();
    };
    if (hasContent(texture))
        afterPaint();
    else
        cancel = waitFor(texture, 'size-changed', () => hasContent(texture), CONTENT_TIMEOUT, afterPaint);
    return () => cancel();
}

export class OpenCloseEffects {
    constructor() {
        this._effects = new Map();
    }

    /**
     * @param {Meta.WindowActor} actor
     * @param {boolean} dialog
     * @param {() => void} completed
     */
    open(actor, dialog, completed) {
        const {scale, rise} = dialog ? DIALOG_OPEN : OPEN;
        const motion = !reducedMotion();
        actor.set_pivot_point(0.5, 0.5);
        actor.opacity = 0;
        if (motion) {
            actor.set_scale(scale, scale);
            actor.translation_y = rise;
        }
        actor.show();

        const effect = this._start(actor, completed);
        effect.cancel = afterFirstFrame(actor, () => {
            effect.cancel = null;
            effect.release = holdMotion();
            actor.ease({opacity: 255, duration: Duration.quick, curve: Curve.decelerate,
                onStopped: motion ? null : () => this.finish(actor)});
            if (motion) {
                actor.ease({scale_x: 1, scale_y: 1, translation_y: 0, spring: Spring.snappy,
                    onStopped: () => this.finish(actor)});
            }
        });
    }

    /**
     * @param {Meta.WindowActor} actor
     * @param {() => void} completed
     */
    close(actor, completed) {
        this._start(actor, completed).release = holdMotion();
        actor.set_pivot_point(0.5, 0.5);
        if (!reducedMotion())
            actor.ease({scale_x: CLOSE_SCALE, scale_y: CLOSE_SCALE, spring: Spring.snappy});
        actor.ease({opacity: 0, duration: Duration.quick, mode: Clutter.AnimationMode.LINEAR,
            onStopped: () => this.finish(actor)});
    }

    _start(actor, completed) {
        const effect = {completed, release: null, cancel: null};
        this._effects.set(actor, effect);
        return effect;
    }

    /** @param {Meta.WindowActor} actor */
    finish(actor) {
        const effect = this._effects.get(actor);
        if (!effect)
            return;
        this._effects.delete(actor);
        effect.cancel?.();
        for (const property of ANIMATED)
            actor.remove_transition(property);
        actor.set({opacity: 255, scale_x: 1, scale_y: 1, translation_y: 0});
        actor.set_pivot_point(0, 0);
        effect.release?.();
        effect.completed();
    }
}
