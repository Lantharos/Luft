import Cairo from 'cairo';
import GLib from 'gi://GLib';

import {fixture} from '../../lib/processes.js';
import {read, write} from '../lib/files.js';
import {A4, typeset, type Box} from '../lib/paper.js';
import {CHAPTER, HIGHLIGHTED} from './textbook.js';

const DOCUMENTS = GLib.build_filenamev([GLib.get_home_dir(), 'Documents']);
export const LIBRARY = GLib.build_filenamev([DOCUMENTS, 'Heft']);
export const USER_FOLDERS = GLib.build_filenamev([GLib.get_user_config_dir(), 'user-dirs.dirs']);
export const STATE = GLib.build_filenamev([GLib.get_user_config_dir(), 'com.lantharos.heft', 'state.json']);

const UNITS = 96 / 72;
const CREATED = Date.UTC(2026, 10, 9, 8, 15);
const PAPER = {template: 'lined', size: 'a4', landscape: false, color: 'white', spacing: 8};
const SUBJECT = 'hst2k9q4m1x';
const NOTES = 'nts7v3c8p2a';
const BOOK = 'bk5r1w6z0d3';
const SOURCE = 'src4h8j2n6b-historia-10.pdf';
const NOTES_PAGE = 'pg1a2b3c4d5';
const BOOK_PAGES = ['pg6e7f8g9h0', 'pg1j2k3l4m5'];
const STROKE_MAGIC = 0x54464548;
const HEADER = 40;
const POINT = 14;
const PEN = {width: 1.9, pressure: 0.62};
const HIGHLIGHTER = {color: 0xffd84d, pressure: 1};
const POINT_MS = 8;

interface Ink {
  tool: 0 | 1;
  color: number;
  width: number;
  pressure: number;
  points: number[];
}

function encodePage(strokes: Ink[]): Uint8Array {
  const objects = new TextEncoder().encode('[]');
  const size = 16 + strokes.reduce((total, {points}) => total + HEADER + (points.length / 2) * POINT, 0) + objects.length;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, STROKE_MAGIC, true);
  view.setUint16(4, 1, true);
  view.setUint32(8, strokes.length, true);
  let at = 12;
  strokes.forEach(({tool, color, width, pressure, points}, order) => {
    view.setFloat64(at, 1e12 + order, true);
    view.setFloat64(at + 8, order, true);
    view.setUint8(at + 16, tool);
    view.setUint8(at + 17, 1);
    view.setUint32(at + 20, color, true);
    view.setFloat32(at + 24, width, true);
    view.setUint32(at + 28, points.length / 2, true);
    view.setFloat64(at + 32, CREATED + order * 1500, true);
    at += HEADER;
    for (let index = 0; index < points.length; index += 2) {
      view.setFloat32(at, points[index], true);
      view.setFloat32(at + 4, points[index + 1], true);
      view.setUint16(at + 8, Math.round(width * 100), true);
      view.setUint16(at + 10, Math.round(pressure * 65535), true);
      view.setUint16(at + 12, index ? POINT_MS : 0, true);
      at += POINT;
    }
  });
  view.setUint32(at, objects.length, true);
  bytes.set(objects, at + 4);
  return bytes;
}

function handwriting(): Ink[] {
  const {strokes} = JSON.parse(read(fixture('pen', 'heft-notes.json'))) as {strokes: {color: number; points: number[]}[]};
  return strokes.map(({color, points}) => ({tool: 0, color, ...PEN, points}));
}

const highlight = (lines: Box[]): Ink[] => lines.map(({x, y, width, height}) => ({
  tool: 1, color: HIGHLIGHTER.color, pressure: HIGHLIGHTER.pressure, width: height * UNITS * 0.9,
  points: [x * UNITS, (y + height / 2) * UNITS, (x + width) * UNITS, (y + height / 2) * UNITS],
}));

function printBook(path: string): Box[][][] {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  const surface = new Cairo.PDFSurface(path, A4.width, A4.height);
  const context = new Cairo.Context(surface);
  const pages = CHAPTER.map((blocks, index) => {
    context.setSourceRGB(0.1, 0.1, 0.12);
    const lines = typeset(context, blocks, 'Noto Serif', 72);
    context.moveTo(A4.width / 2 - 6, A4.height - 40);
    context.selectFontFace('Noto Serif', Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL);
    context.setFontSize(9);
    context.showText(String(42 + index));
    context.showPage();
    return lines;
  });
  surface.finish();
  return pages;
}

const json = (value: unknown) => JSON.stringify(value, null, 2);

export function placeLibrary() {
  write(USER_FOLDERS, 'XDG_DOCUMENTS_DIR="$HOME/Documents"\n');
  const subject = GLib.build_filenamev([LIBRARY, 'Historia']);
  const notes = GLib.build_filenamev([subject, 'Shënime.heft']);
  const book = GLib.build_filenamev([subject, 'Historia 10.heft']);
  const notebook = (id: string, name: string, kind: string, pages: unknown[]) =>
    ({format: 1, id, name, kind, subject: SUBJECT, paper: PAPER, pages, sections: [], created: CREATED, modified: CREATED});
  const bookSize = {width: A4.width * UNITS, height: A4.height * UNITS};

  write(GLib.build_filenamev([subject, 'subject.json']), json({format: 1, id: SUBJECT, name: 'Historia', color: '#3d6fb6', icon: 'book', order: 0}));
  write(GLib.build_filenamev([notes, 'notebook.json']), json(notebook(NOTES, 'Shënime', 'notes', [{id: NOTES_PAGE, created: CREATED}])));
  write(GLib.build_filenamev([notes, 'pages', `${NOTES_PAGE}.page`]), encodePage(handwriting()));
  const printed = printBook(GLib.build_filenamev([book, 'sources', SOURCE]));
  write(GLib.build_filenamev([book, 'notebook.json']), json(notebook(BOOK, 'Historia 10', 'book',
    BOOK_PAGES.map((id, index) => ({id, created: CREATED, pdf: {source: SOURCE, index, ...bookSize}})))));
  write(GLib.build_filenamev([book, 'pages', `${BOOK_PAGES[0]}.page`]), encodePage(highlight(printed[0][HIGHLIGHTED])));
  write(STATE, json({tabs: {tabs: [NOTES, BOOK], current: BOOK}, splits: {[SUBJECT]: [BOOK, NOTES]}}));
}
