import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

const PROMPT_HEIGHT = 550;

function place(child: Clutter.Actor, x: number, y: number, width: number, height: number): void {
  child.allocate(new Clutter.ActorBox({ x1: Math.round(x), y1: Math.round(y), x2: Math.round(x + width), y2: Math.round(y + height) }));
}

export const GreeterLayout = GObject.registerClass(
  class GreeterLayout extends Clutter.LayoutManager {
    vfunc_get_preferred_width(): [number, number] { return [0, 0]; }
    vfunc_get_preferred_height(): [number, number] { return [0, 0]; }

    vfunc_allocate(container: Clutter.Actor, allocation: Clutter.ActorBox): void {
      const [stack, users, controls] = container.get_children();
      const width = allocation.get_width();
      const height = allocation.get_height();

      const [, , stackWidth, stackHeight] = stack.get_preferred_size();
      place(stack, (width - stackWidth) / 2, Math.max(0, Math.min(height / 2 - PROMPT_HEIGHT / 2, height - stackHeight)), stackWidth, stackHeight);

      const [, , usersWidth, usersHeight] = users.get_preferred_size();
      place(users, 0, height - usersHeight, usersWidth, usersHeight);

      const [, , controlsWidth, controlsHeight] = controls.get_preferred_size();
      place(controls, width - controlsWidth, height - controlsHeight, controlsWidth, controlsHeight);
    }
  },
);
