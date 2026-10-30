import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

const pictures = new Map<Meta.WindowActor, Clutter.Actor>();

export function holdPicture(actor: Meta.WindowActor): void {
  if (pictures.has(actor) || actor.meta_window?.get_client_type() !== Meta.WindowClientType.X11) return;
  const content = actor.paint_to_content(null);
  if (!content) return;
  const picture = new Clutter.Actor({ content, width: actor.width, height: actor.height });
  actor.insert_child_above(picture, actor.get_first_child());
  pictures.set(actor, picture);
  picture.connect('destroy', () => pictures.delete(actor));
}

export function releasePicture(actor: Meta.WindowActor): void {
  pictures.get(actor)?.destroy();
}
