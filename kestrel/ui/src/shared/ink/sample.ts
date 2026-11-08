import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

export interface InkSample {
  x: number;
  y: number;
  pressure: number;
  time: number;
}

const MOUSE_PRESSURE = 0.6;
const PEN_TOOLS = [Clutter.InputDeviceToolType.PEN, Clutter.InputDeviceToolType.PENCIL, Clutter.InputDeviceToolType.BRUSH];

export function isPen(event: Clutter.Event): boolean {
  const tool = event.get_device_tool();
  return !!tool && PEN_TOOLS.includes(tool.get_tool_type());
}

export function isEraserTip(event: Clutter.Event): boolean {
  return event.get_device_tool()?.get_tool_type() === Clutter.InputDeviceToolType.ERASER;
}

function pressureOf(event: Clutter.Event): number {
  const tool = event.get_device_tool();
  if (!tool || !(tool.get_axes() & Clutter.InputAxisFlags.PRESSURE)) return MOUSE_PRESSURE;
  return Shell.util_get_event_axis(event, Clutter.InputAxis.PRESSURE);
}

/** Where the event happened on the actor, how hard a pen pressed, and when. */
export function sampleOf(event: Clutter.Event, actor: Clutter.Actor): InkSample {
  const [stageX, stageY] = event.get_coords();
  const [, x, y] = actor.transform_stage_point(stageX, stageY);
  return { x, y, pressure: pressureOf(event), time: event.get_time() };
}
