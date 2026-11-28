import {checkAppearance} from '../checks/setup/appearance.js';
import {checkEarly} from '../checks/setup/early.js';
import {checkFirstBoot} from '../checks/setup/firstBoot.js';
import {checkForSomeoneElse, checkHandedOver, checkOwner} from '../checks/setup/handover.js';
import {checkLive} from '../checks/setup/live.js';
import {endSession} from './runner.js';

export async function run() {
  try {
    await checkAppearance();
    await checkEarly();
    await checkLive();
    await checkForSomeoneElse();
    await checkHandedOver();
    await checkOwner();
  } catch (error) {
    await endSession();
    throw error;
  }
  await checkFirstBoot(endSession);
}
