import Shell from 'gi://Shell';
import St from 'gi://St';

const EDGE_HIGHLIGHT = 0.14;
const BRIGHT_DIM = 0.55;

export function blurSurface(actor, corners = 20) {
    const theme = St.ThemeContext.get_for_stage(global.stage);
    const effect = new Shell.BlurEffect({
        mode: Shell.BlurMode.BACKGROUND,
        radius: 30 * theme.scale_factor,
        brightness: 1,
    });
    effect.set_property('corner-radius', corners);
    effect.set_property('edge-highlight', EDGE_HIGHLIGHT);
    effect.set_property('bright-dim', BRIGHT_DIM);
    actor.add_effect_with_name('backdrop', effect);
    const changed = theme.connect('notify::scale-factor', () => {
        effect.radius = 30 * theme.scale_factor;
    });
    actor.connect('destroy', () => theme.disconnect(changed));
}

export function styleSurface(actor, corners = 20) {
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
    visit(root, true);
    return () => visit(root, false);
}
