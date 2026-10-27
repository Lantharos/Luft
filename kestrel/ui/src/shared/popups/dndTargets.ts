import type Clutter from 'gi://Clutter';

export const DragMotionResult = {
  NO_DROP: 0,
  COPY_DROP: 1,
  MOVE_DROP: 2,
  CONTINUE: 3,
} as const;
export type DragMotionResult = typeof DragMotionResult[keyof typeof DragMotionResult];

export const DragDropResult = {
  FAILURE: 0,
  SUCCESS: 1,
  CONTINUE: 2,
} as const;
export type DragDropResult = typeof DragDropResult[keyof typeof DragDropResult];

export interface DragEvent {
  x: number;
  y: number;
  dragActor: Clutter.Actor;
  source: unknown;
  targetActor: Clutter.Actor;
}

export interface DropEvent {
  dropActor: Clutter.Actor;
  targetActor: Clutter.Actor;
  clutterEvent: Clutter.Event;
}

export interface DragMonitor {
  dragMotion?(event: DragEvent): DragMotionResult;
  dragDrop?(event: DropEvent): DragDropResult;
}

export interface DragDelegate {
  getDragActor?(): Clutter.Actor;
  getDragActorSource?(): Clutter.Actor;
  handleDragOver?(source: unknown, dragActor: Clutter.Actor, x: number, y: number, time: number): DragMotionResult;
  acceptDrop?(source: unknown, dragActor: Clutter.Actor, x: number, y: number, time: number): boolean;
}

export const dragMonitors: DragMonitor[] = [];

export function addDragMonitor(monitor: DragMonitor): void {
  dragMonitors.push(monitor);
}

export function removeDragMonitor(monitor: DragMonitor): void {
  const index = dragMonitors.indexOf(monitor);
  if (index >= 0) dragMonitors.splice(index, 1);
}
