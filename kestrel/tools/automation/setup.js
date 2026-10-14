import {checkAppearance} from '../checks/setup/appearance.js';
import {checkFirstBoot} from '../checks/setup/firstBoot.js';
import {checkLive} from '../checks/setup/live.js';
import {endSession} from './runner.js';

export async function run() {
  try {
    await checkAppearance();
    await checkLive();
  } catch (error) {
    await endSession();
    throw error;
  }
  await checkFirstBoot(endSession);
}
