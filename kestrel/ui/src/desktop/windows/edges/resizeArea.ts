import Clutter from 'gi://Clutter';
import Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';
import St from 'gi://St';

const RESIZE_MARGIN = 8;
const CORNER_REACH = 20;

interface Zone {
  op: Meta.GrabOp;
  cursor: Clutter.CursorType;
}

const ZONES: Record<string, Zone> = {
  n: { op: Meta.GrabOp.RESIZING_N, cursor: Clutter.CursorType.N_RESIZE },
  s: { op: Meta.GrabOp.RESIZING_S, cursor: Clutter.CursorType.S_RESIZE },
  w: { op: Meta.GrabOp.RESIZING_W, cursor: Clutter.CursorType.W_RESIZE },
  e: { op: Meta.GrabOp.RESIZING_E, cursor: Clutter.CursorType.E_RESIZE },
  nw: { op: Meta.GrabOp.RESIZING_NW, cursor: Clutter.CursorType.NW_RESIZE },
  ne: { op: Meta.GrabOp.RESIZING_NE, cursor: Clutter.CursorType.NE_RESIZE },
  sw: { op: Meta.GrabOp.RESIZING_SW, cursor: Clutter.CursorType.SW_RESIZE },
  se: { op: Meta.GrabOp.RESIZING_SE, cursor: Clutter.CursorType.SE_RESIZE },
};

function side(position: number, length: number): '' | 'start' | 'end' {
  if (position < CORNER_REACH) return 'start';
  if (position > length - CORNER_REACH) return 'end';
  return '';
}

export class ResizeArea {
  readonly actor = new St.Widget({ reactive: true, style_class: 'kestrel-resize-edge' });

  constructor(private readonly window: Meta.Window) {
    this.actor.connect('motion-event', (_actor, event: Clutter.Event) => {
      this.actor.set_cursor_type(this.zoneAt(event)?.cursor ?? Clutter.CursorType.DEFAULT);
      return Clutter.EVENT_PROPAGATE;
    });
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => this.resize(event));
  }

  place(x: number, y: number, width: number, height: number): void {
    this.actor.set_position(x - RESIZE_MARGIN, y - RESIZE_MARGIN);
    this.actor.set_size(width + 2 * RESIZE_MARGIN, height + 2 * RESIZE_MARGIN);
  }

  private zoneAt(event: Clutter.Event): Zone | null {
    if (!this.window.allows_resize()) return null;
    const [stageX, stageY] = event.get_coords();
    const [, x, y] = this.actor.transform_stage_point(stageX, stageY);
    const vertical = y < RESIZE_MARGIN ? 'n' : y > this.actor.height - RESIZE_MARGIN ? 's' : '';
    const horizontal = x < RESIZE_MARGIN ? 'w' : x > this.actor.width - RESIZE_MARGIN ? 'e' : '';
    if (!vertical && !horizontal) return null;
    const alongX = vertical ? side(x, this.actor.width) : '';
    const alongY = horizontal ? side(y, this.actor.height) : '';
    const name = (vertical || (alongY === 'start' ? 'n' : alongY === 'end' ? 's' : ''))
      + (horizontal || (alongX === 'start' ? 'w' : alongX === 'end' ? 'e' : ''));
    return ZONES[name] ?? null;
  }

  private resize(event: Clutter.Event): boolean {
    const zone = event.get_button() === Clutter.BUTTON_PRIMARY ? this.zoneAt(event) : null;
    if (!zone) return Clutter.EVENT_PROPAGATE;
    const stage = global.stage;
    const sprite = stage.get_context().get_backend().get_sprite(stage, event);
    const [x, y] = event.get_coords();
    this.window.begin_grab_op(zone.op, sprite, event.get_time(), new Graphene.Point({ x, y }));
    return Clutter.EVENT_STOP;
  }
}
