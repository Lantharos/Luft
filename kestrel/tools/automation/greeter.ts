import {checkControls} from '../checks/greeter/controls.js';
import {checkFingerprint} from '../checks/greeter/fingerprint.js';
import {checkPeople} from '../checks/greeter/people.js';
import {reportResources} from '../checks/greeter/resources.js';
import {checkScheduledStyle, checkStyleChange} from '../checks/greeter/schedule.js';
import {checkSigningIn} from '../checks/greeter/signIn.js';
import {capture} from '../checks/lib/screenshots.js';

export async function run() {
  await reportResources();
  checkScheduledStyle();
  await capture('login-clock');
  await checkPeople();
  await checkFingerprint();
  await checkStyleChange();
  await checkControls();
  await checkSigningIn();
}
