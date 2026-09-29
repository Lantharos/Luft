import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

export const HeaderLayout = GObject.registerClass(
class HeaderLayout extends Clutter.BoxLayout {
    _init(params) {
        super._init(params);
        this._overhanging = new WeakSet();
    }

    overhang(actor) {
        this._overhanging.add(actor);
        this.layout_changed();
    }

    vfunc_get_preferred_height(container, _forWidth) {
        let minimum = 0;
        let natural = 0;
        for (const child of container) {
            if (!child.visible || this._overhanging.has(child))
                continue;
            const [childMinimum, childNatural] = child.get_preferred_height(-1);
            minimum = Math.max(minimum, childMinimum);
            natural = Math.max(natural, childNatural);
        }
        return [minimum, natural];
    }

    vfunc_allocate(container, box) {
        let tallest = box.get_height();
        for (const child of container) {
            if (child.visible && this._overhanging.has(child))
                tallest = Math.max(tallest, child.get_preferred_height(-1)[1]);
        }
        const overhang = (tallest - box.get_height()) / 2;
        super.vfunc_allocate(container, new Clutter.ActorBox({
            x1: box.x1, y1: box.y1 - overhang, x2: box.x2, y2: box.y2 + overhang,
        }));
    }
});
