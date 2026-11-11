import type { ScreenShield } from '../../auth/lockScreen/screenShield.js';
import type { SavedWindow } from '../../desktop/windows/recovery/snapshot.js';
import { restartedAfterCrash } from '../../system/status/health/restarted.js';
import { planFor, reopened } from './plan.js';
import { recordedWindows } from './record.js';
import type { SessionRecorder } from './recorder.js';
import { SessionRestore } from './restore.js';

export async function reopenSession(recorder: SessionRecorder, lost: SavedWindow[], shield: ScreenShield): Promise<void> {
  const windows = restartedAfterCrash ? recordedWindows(lost) : reopened(await recorder.previous);
  const plan = planFor(windows, restartedAfterCrash);
  if (plan.windows.length) new SessionRestore(plan, recorder, shield);
  else recorder.release();
}
