import type Clutter from 'gi://Clutter';

type SpringTransition = Clutter.Transition & { get_velocity?(): number };

export function transitionVelocity(actor: Clutter.Actor, property: string): number {
  return (actor.get_transition(property) as SpringTransition | null)?.get_velocity?.() ?? 0;
}
