import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { Spinner } from '../../../../shared/widgets/animation.js';
import type { SpinnerView, StackView, View } from '../types.js';
import {
  buttonControl, type Control, type ControlHost, entryControl, iconControl, imageControl, itemControl, progressControl, sliderControl, switchControl,
  textControl,
} from './controls.js';

const ALIGN: Record<NonNullable<StackView['align']>, Clutter.ActorAlign> = {
  start: Clutter.ActorAlign.START, center: Clutter.ActorAlign.CENTER, end: Clutter.ActorAlign.END, fill: Clutter.ActorAlign.FILL,
};
const DEPTH_LIMIT = 24;

interface Rendered {
  readonly type: View['type'];
  readonly control: Control;
}

function stackControl(node: StackView, host: ControlHost, depth: number): Control<StackView> {
  const box = new St.BoxLayout();
  let children: Rendered[] = [];
  const update = (next: StackView) => {
    const vertical = next.type === 'column';
    box.orientation = vertical ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL;
    box.style = `spacing: ${Math.max(0, Math.round(next.spacing ?? 8))}px;`;
    children = reconcile(box, children, next.children, host, depth + 1);
    const align = ALIGN[next.align ?? (vertical ? 'fill' : 'center')];
    for (const { control } of children) {
      if (vertical) {
        control.actor.x_align = align;
        control.actor.x_expand = align === Clutter.ActorAlign.FILL;
      } else {
        control.actor.y_align = align;
      }
    }
  };
  update(node);
  return { actor: box, update };
}

function spinnerControl(node: SpinnerView): Control<SpinnerView> {
  const spinner = new Spinner(Math.max(8, Math.round(node.size ?? 16)), { animate: true });
  spinner.connect('notify::mapped', () => (spinner.mapped ? spinner.play() : spinner.stop()));
  return { actor: spinner, update: () => {} };
}

function create(node: View, host: ControlHost, depth: number): Control {
  if (depth > DEPTH_LIMIT) throw new Error(`A view can nest ${DEPTH_LIMIT} stacks at most`);
  switch (node.type) {
    case 'column':
    case 'row': return stackControl(node, host, depth) as Control;
    case 'text': return textControl(node) as Control;
    case 'icon': return iconControl(node, host) as Control;
    case 'image': return imageControl(node, host) as Control;
    case 'button': return buttonControl(node, host) as Control;
    case 'switch': return switchControl(node, host) as Control;
    case 'slider': return sliderControl(node, host) as Control;
    case 'entry': return entryControl(node, host) as Control;
    case 'item': return itemControl(node, host) as Control;
    case 'progress': return progressControl(node) as Control;
    case 'spinner': return spinnerControl(node) as Control;
    case 'separator': return { actor: new St.Widget({ style_class: 'kestrel-context-separator' }), update: () => {} };
    case 'spacer': return { actor: new St.Widget({ x_expand: true, y_expand: true }), update: () => {} };
    default: throw new Error(`${(node as { type?: unknown }).type} isn't a kind of view`);
  }
}

/** Brings `box`'s children in line with `nodes`, keeping each control whose place and kind stayed the same. */
function reconcile(box: St.BoxLayout, previous: Rendered[], nodes: readonly View[], host: ControlHost, depth: number): Rendered[] {
  const next = nodes.map((node, index): Rendered => {
    const kept = previous[index];
    if (kept?.type === node.type) {
      kept.control.update(node);
      return kept;
    }
    kept?.control.actor.destroy();
    const control = create(node, host, depth);
    box.insert_child_at_index(control.actor, index);
    return { type: node.type, control };
  });
  for (const stale of previous.slice(nodes.length)) stale.control.actor.destroy();
  return next;
}

/** A view on screen, which later versions of the view update in place. */
export class RenderedView {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private root: Rendered[] = [];

  constructor(private readonly host: ControlHost) {}

  show(view: View): void {
    this.root = reconcile(this.actor, this.root, [view], this.host, 0);
    this.root[0].control.actor.x_expand = true;
  }
}
