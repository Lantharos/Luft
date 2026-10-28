import {checkControls} from '../checks/greeter/controls.js';
import {checkFingerprint} from '../checks/greeter/fingerprint.js';
import {checkPeople} from '../checks/greeter/people.js';
import {reportResources} from '../checks/greeter/resources.js';
import {checkSigningIn} from '../checks/greeter/signIn.js';
import {capture} from '../checks/lib/screenshots.js';

export async function run() {
  await reportResources();
  await capture('login-clock');
  await checkPeople();
  await checkFingerprint();
  await checkControls();
  await checkSigningIn();
}
