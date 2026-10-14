import Shell from 'gi://Shell';
import St from 'gi://St';

export const PILL = 999;
const THEMED_PROPERTIES = [
    ['-kestrel-glass-highlight', 'edge-highlight'],
    ['-kestrel-glass-dim', 'bright-dim'],
    ['-kestrel-glass-lift', 'dark-lift'],
];

const solidSurfaces = new Set();
let solid = false;

function makeSolid({actor, effect, corners}, enabled) {
    effect.enabled = !enabled;
    for (const name of ['kestrel-solid', `kestrel-solid-${corners}`]) {
        if (enabled)
            actor.add_style_class_name(name);
        else
            actor.remove_style_class_name(name);
    }
}

export function setSolidSurfaces(enabled) {
    if (solid === enabled)
        return;
    solid = enabled;
    for (const surface of solidSurfaces)
        makeSolid(surface, enabled);
}

function followTheme(actor, effect) {
    actor.connect('style-changed', () => {
        const node = actor.get_theme_node();
        for (const [property, name] of THEMED_PROPERTIES) {
            const [found, value] = node.lookup_double(property, true);
            if (found)
                effect.set_property(name, value);
        }
    });
}

export function blurBackdrop(actor, corners) {
    const theme = St.ThemeContext.get_for_stage(global.stage);
    const effect = new Shell.BlurEffect({
        mode: Shell.BlurMode.BACKGROUND,
        radius: 30 * theme.scale_factor,
        brightness: 1,
    });
    effect.set_property('corner-radius', corners);
    followTheme(actor, effect);
    actor.add_effect_with_name('backdrop', effect);
    const changed = theme.connect('notify::scale-factor', () => {
        effect.radius = 30 * theme.scale_factor;
    });
    actor.connect('destroy', () => theme.disconnect(changed));
    return effect;
}

export function blurSurface(actor, corners = 24) {
    const surface = {actor, effect: blurBackdrop(actor, corners), corners};
    solidSurfaces.add(surface);
    if (solid)
        makeSolid(surface, true);
    actor.connect('destroy', () => solidSurfaces.delete(surface));
}

export function styleSurface(actor, corners = 24) {
    actor.add_style_class_name('kestrel-glass');
    actor.add_style_class_name(`kestrel-glass-radius-${corners}`);
    blurSurface(actor, corners);
}

export function freezeSelection(root) {
    const visit = (actor, freeze) => {
        if (actor instanceof St.Widget) {
            if (freeze && ['hover', 'focus', 'active', 'selected', 'checked'].some(state => actor.has_style_pseudo_class(state)))
                actor.add_style_class_name('kestrel-closing-selection');
            else if (!freeze)
                actor.remove_style_class_name('kestrel-closing-selection');
        }
        for (const child of actor.get_children()) visit(child, freeze);
    };
    const visitContents = freeze => root.get_children().forEach(child => visit(child, freeze));
    visitContents(true);
    return () => visitContents(false);
}
