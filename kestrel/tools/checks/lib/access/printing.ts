import Cairo from 'cairo';
import Gio from 'gi://Gio';

import {labelled} from '../actors.js';
import type {Eventually} from '../check.js';
import {click} from '../input/input.js';
import {settled} from '../wait.js';
import {portalDialog} from './portal.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

export const PRINTER = 'Office';
export const JOB_TIMEOUT = 10000;

export function writeDocument(path: string) {
  const surface = new Cairo.PDFSurface(path, 595, 842);
  const context = new Cairo.Context(surface);
  for (const page of [1, 2, 3]) {
    context.moveTo(72, 120);
    context.setFontSize(32);
    context.showText(`Page ${page}`);
    context.showPage();
  }
  context.$dispose();
  surface.finish();
}

export function writePicture(path: string) {
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, 640, 480);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(0.2, 0.45, 0.8);
  context.paint();
  context.setSourceRGB(1, 0.8, 0.2);
  context.arc(320, 240, 120, 0, 2 * Math.PI);
  context.fill();
  context.$dispose();
  surface.writeToPNG(path);
}

export async function completedJobs() {
  const lpstat = Gio.Subprocess.new(['lpstat', '-W', 'completed', '-o', PRINTER], Gio.SubprocessFlags.STDOUT_PIPE);
  const [output] = await lpstat.communicate_utf8_async(null, null);
  return output.split('\n').filter(Boolean).length;
}

export async function printsThroughDialog(eventually: Eventually, label: string, request: () => unknown) {
  const before = await completedJobs();
  await request();
  await eventually(() => portalDialog(), `${label} opens the print dialog`);
  await settled();
  click(labelled('Print', portalDialog()!)!);
  await eventually(async () => await completedJobs() > before, `${label} prints`, JOB_TIMEOUT);
}
