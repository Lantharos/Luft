import type Clutter from 'gi://Clutter';

export function whenMoved(actor: Clutter.Actor, moved: () => void): () => void {
  let watched: [Clutter.Actor, number][] = [];
  const release = () => {
    for (const [ancestor, id] of watched) ancestor.disconnect(id);
    watched = [];
  };
  const watch = () => {
    release();
    if (!actor.mapped) return;
    for (let ancestor = actor.get_parent(); ancestor; ancestor = ancestor.get_parent()) {
      watched.push([ancestor, ancestor.connect('notify::allocation', moved)]);
    }
    moved();
  };
  const mapped = actor.connect('notify::mapped', watch);
  watch();
  return () => {
    release();
    actor.disconnect(mapped);
  };
}
