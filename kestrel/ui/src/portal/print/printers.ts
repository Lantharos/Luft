import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');

const SETTINGS = 'com.lantharos.Settings';
const PRINTING = 'com.lantharos.Settings.Printing';
const PRINTING_PATH = '/com/lantharos/Settings/Printing';
const STOPPED = 5;

export interface Printer {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly paused: boolean;
  readonly accepting: boolean;
  readonly isDefault: boolean;
  readonly media: string[];
  readonly mediaDefault: string;
  readonly sides: string[];
  readonly sidesDefault: string;
  readonly colorModes: string[];
  readonly colorModeDefault: string;
  readonly maxCopies: number;
  readonly pageRanges: boolean;
}

export interface JobOptions {
  readonly copies: number;
  readonly collate: boolean;
  readonly sides: string;
  readonly colorMode: string;
  readonly media: string;
  readonly pageRanges?: [number, number][];
}

interface Reported {
  name: string;
  description: string;
  location: string;
  state: number;
  accepting: boolean;
  default: boolean;
  media: string[];
  'media-default': string;
  sides: string[];
  'sides-default': string;
  'color-modes': string[];
  'color-mode-default': string;
  copies: number;
  'page-ranges': boolean;
}

function printer(reported: Reported): Printer {
  return {
    name: reported.name,
    description: reported.description,
    location: reported.location,
    paused: reported.state === STOPPED,
    accepting: reported.accepting,
    isDefault: reported.default,
    media: reported.media,
    mediaDefault: reported['media-default'],
    sides: reported.sides,
    sidesDefault: reported['sides-default'],
    colorModes: reported['color-modes'],
    colorModeDefault: reported['color-mode-default'],
    maxCopies: reported.copies,
    pageRanges: reported['page-ranges'],
  };
}

export async function listPrinters(): Promise<Printer[]> {
  const reply: GLib.Variant = await Gio.DBus.session.call(SETTINGS, PRINTING_PATH, PRINTING, 'Printers', null,
    new GLib.VariantType('(aa{sv})'), Gio.DBusCallFlags.NONE, -1, null);
  const [printers] = reply.recursiveUnpack() as [Reported[]];
  return printers.map(printer);
}

function jobOptions({ copies, collate, sides, colorMode, media, pageRanges }: JobOptions): Record<string, GLib.Variant> {
  const options: Record<string, GLib.Variant> = {
    copies: new GLib.Variant('i', copies),
    collate: new GLib.Variant('b', collate),
  };
  if (sides) options.sides = new GLib.Variant('s', sides);
  if (colorMode) options['print-color-mode'] = new GLib.Variant('s', colorMode);
  if (media) options.media = new GLib.Variant('s', media);
  if (pageRanges) options['page-ranges'] = new GLib.Variant('a(ii)', pageRanges);
  return options;
}

export async function submit(printerName: string, document: number, title: string, options: JobOptions): Promise<number> {
  const [reply] = await Gio.DBus.session.call_with_unix_fd_list(SETTINGS, PRINTING_PATH, PRINTING, 'Print',
    new GLib.Variant('(shsa{sv})', [printerName, 0, title, jobOptions(options)]), new GLib.VariantType('(u)'),
    Gio.DBusCallFlags.NONE, -1, Gio.UnixFDList.new_from_array([document]), null);
  return (reply.deep_unpack() as [number])[0];
}
