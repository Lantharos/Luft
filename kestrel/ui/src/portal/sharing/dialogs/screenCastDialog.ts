import { openDialog, type PortalDialog } from '../../core/dialog.js';
import { SUCCESS } from '../../core/request.js';
import { list } from '../../core/rows.js';
import { PERSIST_UNTIL_REVOKED } from '../restore.js';
import type { Selection, Source } from '../sources.js';
import { appNames } from '../../core/apps.js';
import { rememberRow } from './choices.js';
import { sourceList } from './sourceList.js';

interface SourceChoice {
  readonly sources: Source[];
  readonly remember: boolean;
}

export async function chooseSources(handle: string, appId: string, selection: Selection, persistMode: number,
  opened: (dialog: PortalDialog) => void): Promise<[number, SourceChoice | null]> {
  const app = appNames(appId);
  let choice: SourceChoice | null = null;
  const [response] = await openDialog(handle, {
    title: `Share your screen with ${app.object}?`,
    description: `${app.subject} will be able to see what you choose.`,
    icon: 'screen-shared-symbolic',
    styleClass: 'kestrel-portal-sharing',
  }, dialog => {
    opened(dialog);
    const sources = sourceList(selection, count => { share.reactive = count > 0; });
    dialog.content.add_child(sources.actor);
    const remember = persistMode === PERSIST_UNTIL_REVOKED ? rememberRow(app.subject) : null;
    if (remember) dialog.content.add_child(list([remember]));
    const [, share] = dialog.buttons([
      { label: 'Cancel', action: dialog.cancel },
      { label: 'Share', default: true, action: () => {
        choice = { sources: sources.selected(), remember: remember?.checked ?? true };
        dialog.finish(SUCCESS);
      } },
    ]);
    share.reactive = sources.selected().length > 0;
  });
  return [response, choice];
}
