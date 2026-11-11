import Gio from 'gi://Gio';

import {NIGHTLY_RELEASE} from '../../fixtures/setup/installer.js';
import {changes} from '../apps/lib/apps.js';
import {useScheme, type Scheme} from '../apps/lib/palette.js';
import type {Point} from '../lib/input/input.js';
import {require, Setup, type Release} from './lib/driver.js';

const AT = {continue: [711, 547], back: [85, 547]} satisfies Record<string, Point>;
const BODY = {x: 40, y: 40, width: 720, height: 470};
const SAME_TOLERANCE = 8;

const RELEASES = {
  nightly: NIGHTLY_RELEASE,
  nightlyWithStable: {...NIGHTLY_RELEASE, stableReleased: true},
  stable: {version: '1.2', early: true, stableReleased: false},
  finished: {version: '1.2', early: false, stableReleased: false},
} satisfies Record<string, Release>;

const body = (setup: Setup) => setup.app.frame(setup.app.area(BODY));

async function opened(release: Release) {
  const setup = new Setup();
  await setup.useRelease(release);
  await setup.open();
  return setup;
}

const interfaceStyle = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const currentScheme = (): Scheme => interfaceStyle.get_string('color-scheme') === 'prefer-dark' ? 'dark' : 'light';

async function useStyle(setup: Setup, scheme: Scheme) {
  await changes(setup.app, `Install Luft follows the ${scheme} style`, () => useScheme(scheme));
  await setup.app.settle(() => true);
}

async function shoot(setup: Setup, name: string) {
  const first = currentScheme();
  const other = first === 'dark' ? 'light' : 'dark';
  await setup.shot(`${name}-${first}`);
  await useStyle(setup, other);
  await setup.shot(`${name}-${other}`);
  await useStyle(setup, first);
}

async function earlyStep(release: Release, name: string) {
  const setup = await opened(release);
  await setup.click(AT.continue, `continuing from the welcome screen says Luft isn’t finished yet on a ${name} build`);
  const shown = await body(setup);
  await shoot(setup, `early-${name}`);
  return {setup, shown};
}

async function checkNightly() {
  const setup = await opened(RELEASES.nightly);
  const welcome = await body(setup);
  await setup.click(AT.continue, 'continuing from the welcome screen says Luft isn’t finished yet');
  const early = await body(setup);
  await shoot(setup, 'early-nightly');
  await setup.click(AT.back, 'Back on the early note goes back to the welcome screen');
  require((await body(setup)).looksLike(welcome, SAME_TOLERANCE), 'Back on the early note shows the welcome screen as it was');
  await setup.click(AT.continue, 'continuing shows the early note again');
  await setup.click(AT.continue, 'Continue on the early note shows where Luft goes');
  const destination = await body(setup);
  await setup.close();
  return {early, destination};
}

export async function checkEarly() {
  const nightly = await checkNightly();

  const withStable = await earlyStep(RELEASES.nightlyWithStable, 'nightly-with-stable');
  await withStable.setup.close();
  require(!withStable.shown.looksLike(nightly.early, SAME_TOLERANCE),
    'a nightly built once a stable version is out also offers switching to stable');

  const stable = await earlyStep(RELEASES.stable, 'stable');
  await stable.setup.close();
  require(!stable.shown.looksLike(nightly.early, SAME_TOLERANCE), 'a build that isn’t a nightly leaves out the nightly paragraph');

  const finished = await opened(RELEASES.finished);
  await finished.click(AT.continue, 'without the early mark, continuing from the welcome screen moves on');
  const next = await body(finished);
  await shoot(finished, 'early-off');
  await finished.close();
  require(next.looksLike(nightly.destination, SAME_TOLERANCE), 'without the early mark, the welcome screen goes straight to where Luft goes');

  await new Setup().useRelease(RELEASES.nightly);
}
