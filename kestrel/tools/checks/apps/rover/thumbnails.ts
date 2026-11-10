import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {outcome, repository} from '../../lib/processes.js';
import {exists, read, removeTree, write} from '../lib/files.js';

const {require, eventually} = checks('Luft app');
const THUMBNAILER = repository('target/release', 'luft-thumbnailer');
const ENTRIES = ['luft-videos', 'luft-music'];
const SIZES = ['normal', 'large', 'x-large', 'xx-large'];
const COVER: [number, number, number] = [196, 120, 48];
const GENERATED_TIMEOUT = 20000;
const BRIGHT_ENOUGH = 60;
const CLOSE_ENOUGH = 12;

const path = (...parts: string[]) => GLib.build_filenamev(parts);
const entryPath = (name: string) => path(GLib.get_user_data_dir(), 'thumbnailers', `${name}.thumbnailer`);

export async function withThumbnailers(run: () => Promise<void>) {
  if (!exists(THUMBNAILER)) throw new Error('luft-thumbnailer is not built, run cargo build --release -p luft-thumbnailer');
  for (const name of ENTRIES) {
    const entry = read(repository('services/thumbnailer/data', `${name}.thumbnailer`));
    write(entryPath(name), entry.replaceAll('/usr/libexec/luft-thumbnailer', THUMBNAILER));
  }
  try {
    await run();
  } finally {
    for (const name of ENTRIES) GLib.unlink(entryPath(name));
  }
}

async function make(argv: string) {
  const made = await outcome(['gst-launch-1.0', '-q', ...GLib.shell_parse_argv(argv)[1]!]);
  if (!made.ok) throw new Error(`GStreamer couldn't make a test file: ${made.stderr}`);
}

async function writeSamples(folder: string) {
  const video = path(folder, 'Opening.webm');
  const track = path(folder, 'Album', 'Track.flac');
  GLib.mkdir_with_parents(path(folder, 'Album'), 0o755);
  const size = 'video/x-raw,format=I420,width=640,height=360,framerate=25/1';
  await make(`concat name=joined ! vp8enc deadline=1 keyframe-max-dist=10 ! webmmux ! filesink location="${video}" `
    + `videotestsrc pattern=black num-buffers=50 ! ${size} ! joined. videotestsrc pattern=smpte num-buffers=75 ! ${size} ! joined.`);
  await make(`audiotestsrc num-buffers=100 ! audioconvert ! flacenc ! filesink location="${track}"`);
  const cover = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 400, 400);
  const [red, green, blue] = COVER;
  cover.fill(((red << 24) | (green << 16) | (blue << 8) | 0xff) >>> 0);
  cover.savev(path(folder, 'Album', 'cover.png'), 'png', [], []);
  return {video, track};
}

function cached(file: string): GdkPixbuf.Pixbuf | null {
  const hash = GLib.compute_checksum_for_string(GLib.ChecksumType.MD5, GLib.filename_to_uri(file, null), -1)!;
  const found = SIZES.map(size => path(GLib.get_user_cache_dir(), 'thumbnails', size, `${hash}.png`)).find(exists);
  return found ? GdkPixbuf.Pixbuf.new_from_file(found) : null;
}

function averageColor(picture: GdkPixbuf.Pixbuf): [number, number, number] {
  const pixels = picture.get_pixels();
  const stride = picture.get_rowstride();
  const channels = picture.get_n_channels();
  const sums = [0, 0, 0];
  for (let y = 0; y < picture.get_height(); y++)
    for (let x = 0; x < picture.get_width(); x++)
      for (let channel = 0; channel < 3; channel++) sums[channel] += pixels[y * stride + x * channels + channel];
  const count = picture.get_width() * picture.get_height();
  return sums.map(sum => sum / count) as [number, number, number];
}

export async function checkThumbnails(app: LuftApp, folder: string, open: (app: LuftApp, path: string) => Promise<void>) {
  try {
    const {video, track} = await writeSamples(folder);
    await open(app, folder);
    const frame = await eventually(() => cached(video), 'Rover makes a thumbnail of a video', GENERATED_TIMEOUT);
    const [red, green, blue] = averageColor(frame);
    require(0.299 * red + 0.587 * green + 0.114 * blue > BRIGHT_ENOUGH, "a video's thumbnail shows a frame from past its black opening");
    await open(app, path(folder, 'Album'));
    const cover = await eventually(() => cached(track), 'Rover makes a thumbnail of a music track', GENERATED_TIMEOUT);
    require(averageColor(cover).every((value, channel) => Math.abs(value - COVER[channel]) < CLOSE_ENOUGH),
      "a track without its own artwork shows its folder's cover.png");
    (await app.settle(() => true)).save('rover-music-thumbnails');
  } finally {
    if (exists(folder)) removeTree(folder);
  }
}
