import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import {Duration, Spring, holdMotion, reducedMotion} from '../kestrelUi.js';
import {WindowSnapshot} from './snapshot.js';

const CLIENT_DEADLINE = 400;
const GEOMETRY = ['x', 'y', 'width', 'height'];
const LIVE_TRANSFORM = ['scale_x', 'scale_y', 'translation_x', 'translation_y'];

const near = (a, b) => Math.abs(a - b) <= 1;
const sameRect = (a, b) => GEOMETRY.every(side => near(a[side], b[side]));
const laters = () => global.compositor.get_laters();

function velocityOf(actor, property) {
    return actor.get_transition(property)?.get_velocity?.() ?? 0;
}

function geometryVelocity(actor) {
    return Object.fromEntries(GEOMETRY.map(side => [side, velocityOf(actor, side)]));
}

/**
 * @param {Meta.WindowActor} actor
 * @returns {boolean} whether the client has drawn the size it was asked for
 */
function drawnAtTarget(actor) {
    const window = actor.meta_window;
    if (!sameRect(window.get_frame_rect(), window.get_target_frame_rect()))
        return false;
    const [, width, height] = actor.get_texture().get_preferred_size();
    const buffer = window.get_buffer_rect();
    return near(width, buffer.width) && near(height, buffer.height);
}

/**
 * @param {Meta.WindowActor} actor
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @returns {WindowSnapshot}
 */
function snapshotOf(actor, rect) {
    const clip = new Mtk.Rectangle({
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height),
    });
    return new WindowSnapshot(actor.paint_to_content(clip), clip);
}

/**
 * Moves a window from one rectangle to another on a spring that starts at
 * once: a still picture of the window leads until the app has drawn its
 * new size, then the live window takes over in step with it.
 */
class Morph {
    constructor(actor, snapshot, velocity, completed) {
        this.actor = actor;
        this.snapshot = snapshot;
        this._completed = completed;
        this._release = holdMotion();
        this._live = false;
        this._drawing = false;

        const parent = actor.get_parent();
        if (snapshot.actor.get_parent() !== parent) {
            snapshot.actor.get_parent()?.remove_child(snapshot.actor);
            parent.add_child(snapshot.actor);
        }
        this._keepAbove();
        actor.opacity = 0;

        const window = actor.meta_window;
        const check = () => this._check();
        this._signals = [
            [global.display, global.display.connect('restacked', () => this._keepAbove())],
            [actor, actor.connect('destroy', () => this.finish())],
        ];
        this._waiting = [
            [actor.get_texture(), actor.get_texture().connect('size-changed', check)],
            [window, window.connect('size-changed', check)],
            [window, window.connect('position-changed', check)],
        ];
        this._aimLater = laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
            this._aimLater = 0;
            this._aim(velocity);
            return GLib.SOURCE_REMOVE;
        });
        this._deadline = GLib.timeout_add(GLib.PRIORITY_DEFAULT, CLIENT_DEADLINE, () => {
            this._deadline = 0;
            this._reveal();
            return GLib.SOURCE_REMOVE;
        });
    }

    _keepAbove() {
        this.actor.get_parent()?.set_child_above_sibling(this.snapshot.actor, this.actor);
    }

    _aim(velocity) {
        const target = this.actor.meta_window.get_target_frame_rect();
        this.snapshot.actor.ease({
            x: target.x, y: target.y, width: target.width, height: target.height,
            spring: Spring.smooth, velocity,
        });
        this._check();
    }

    _check() {
        if (!this._live && !this._aimLater && !this._drawing && drawnAtTarget(this.actor))
            this._awaitDrawing();
    }

    /**
     * Apps can show their new size before they have finished drawing into
     * it: X11 windows resize before the app draws, and some Wayland apps
     * first commit their old picture at the new size. The live window
     * takes over on the first frame after the app's drawing has gone quiet.
     */
    _awaitDrawing() {
        let drawing = true;
        this._drawing = true;
        this._waiting.push(
            [this.actor, this.actor.connect('damaged', () => (drawing = true))],
            [global.stage, global.stage.connect_after('after-paint', () => {
                if (!drawing)
                    this._reveal();
                drawing = false;
            })]);
    }

    _reveal() {
        if (this._live)
            return;
        this._live = true;
        this._stopWaiting();

        const {actor, snapshot} = this;
        const window = actor.meta_window;
        const frame = window.get_frame_rect();
        const buffer = window.get_buffer_rect();
        const shown = snapshot.rect;
        const speed = geometryVelocity(snapshot.actor);
        const scaleX = shown.width / frame.width;
        const scaleY = shown.height / frame.height;
        const insetX = frame.x - buffer.x;
        const insetY = frame.y - buffer.y;
        const scaleSpeedX = speed.width / frame.width;
        const scaleSpeedY = speed.height / frame.height;

        snapshot.actor.ease({
            x: frame.x, y: frame.y, width: frame.width, height: frame.height,
            spring: Spring.smooth,
        });
        snapshot.actor.ease({
            opacity: 0,
            duration: Duration.quick,
            mode: Clutter.AnimationMode.LINEAR,
        });

        actor.set_pivot_point(0, 0);
        actor.set({
            scale_x: scaleX,
            scale_y: scaleY,
            translation_x: shown.x - buffer.x - insetX * scaleX,
            translation_y: shown.y - buffer.y - insetY * scaleY,
            opacity: 255,
        });
        actor.ease({
            scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0,
            spring: Spring.smooth,
            velocity: {
                scale_x: scaleSpeedX,
                scale_y: scaleSpeedY,
                translation_x: speed.x - insetX * scaleSpeedX,
                translation_y: speed.y - insetY * scaleSpeedY,
            },
            onStopped: () => this.finish(),
        });
    }

    _stopWaiting() {
        for (const [object, id] of this._waiting.splice(0))
            object.disconnect(id);
        if (this._aimLater)
            laters().remove(this._aimLater);
        this._aimLater = 0;
        if (this._deadline)
            GLib.source_remove(this._deadline);
        this._deadline = 0;
    }

    _detach() {
        this._stopWaiting();
        for (const [object, id] of this._signals.splice(0))
            object.disconnect(id);
        const {actor} = this;
        for (const property of LIVE_TRANSFORM)
            actor.remove_transition(property.replaceAll('_', '-'));
        actor.set({scale_x: 1, scale_y: 1, translation_x: 0, translation_y: 0, opacity: 255});
        this._release();
        this._completed();
    }

    /**
     * Ends the morph and hands its picture over to the next one, starting
     * from where this one is on screen.
     *
     * @returns {{snapshot: WindowSnapshot, velocity: object | undefined}}
     */
    handOver() {
        if (!this._live) {
            this._detach();
            return {snapshot: this.snapshot, velocity: undefined};
        }
        const velocity = geometryVelocity(this.snapshot.actor);
        const snapshot = snapshotOf(this.actor, this.snapshot.rect);
        this.snapshot.destroy();
        this._detach();
        return {snapshot, velocity};
    }

    finish() {
        if (!this._signals.length)
            return;
        this._detach();
        this.snapshot.destroy();
    }
}

export class WindowMorphs {
    constructor() {
        this._morphs = new Map();
        this._handedOver = new Map();
        this._dropLater = 0;
    }

    /**
     * Moves a window's picture from `from` to wherever it is going.
     *
     * @param {Meta.WindowActor} actor
     * @param {Mtk.Rectangle} from its frame rectangle before the change
     * @param {() => void} completed called once the morph has ended
     * @returns {boolean} false when the change shouldn't animate
     */
    begin(actor, from, completed) {
        this.interrupt(actor);
        if (reducedMotion() || from.width <= 0 || from.height <= 0)
            return false;

        const {snapshot, velocity} = this._handedOver.get(actor) ?? {snapshot: snapshotOf(actor, from)};
        this._handedOver.delete(actor);
        const morph = new Morph(actor, snapshot, velocity, () => {
            if (this._morphs.get(actor) === morph)
                this._morphs.delete(actor);
            completed();
        });
        this._morphs.set(actor, morph);
        return true;
    }

    /**
     * Ends a window's morph because another effect starts; a morph that
     * starts right after continues from where this one was.
     *
     * @param {Meta.WindowActor} actor
     */
    interrupt(actor) {
        const morph = this._morphs.get(actor);
        if (!morph)
            return;
        this._morphs.delete(actor);
        this._handedOver.set(actor, morph.handOver());
        this._dropLater ||= laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
            this._dropLater = 0;
            for (const {snapshot} of this._handedOver.values())
                snapshot.destroy();
            this._handedOver.clear();
            return GLib.SOURCE_REMOVE;
        });
    }
}
