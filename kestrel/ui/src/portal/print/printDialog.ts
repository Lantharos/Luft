import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { openDialog, type PortalDialog } from '../core/dialog.js';
import { SUCCESS } from '../core/request.js';
import { choose, list, row } from '../core/rows.js';
import {
  COLOR, LONG_EDGE, MONOCHROME, ONE_SIDED, SHORT_EDGE, colorModesOffered, defaultPrinter, forPrinter, ready, sidesOffered,
  type Choices, type Orientation, type PageChoice, type Preferences,
} from './choices.js';
import { field, pick, segments, stepper, type Segment } from './controls.js';
import { papers, sizeLabel } from './paper.js';
import type { Printer } from './printers.js';

export interface PrintDialogSpec {
  readonly title: string;
  readonly acceptLabel: string;
  readonly printers: Printer[];
  readonly preferences: Preferences;
  readonly pageChoices: (printer: Printer) => PageChoice[];
  readonly orientation: boolean;
}

type Adjustable = Pick<Choices, 'copies' | 'pages' | 'ranges' | 'orientation' | 'sides' | 'colorMode'>;

const ICON = 'printer-symbolic';
const PICKER_ROWS_BEFORE_SCROLLING = 5;
const PAGE_LABELS: Record<PageChoice, string> = { all: 'All', current: 'Current', selection: 'Selection', ranges: 'Range' };
const ORIENTATIONS: Segment<Orientation>[] = [{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }];
const SIDES: Segment<string>[] = [{ value: ONE_SIDED, label: 'Off' }, { value: LONG_EDGE, label: 'Long edge' }, { value: SHORT_EDGE, label: 'Short edge' }];
const COLOR_MODES: Segment<string>[] = [{ value: COLOR, label: 'Color' }, { value: MONOCHROME, label: 'Black & white' }];

function status(printer: Printer): string {
  if (!printer.accepting) return 'Not taking documents right now';
  return printer.paused ? 'Paused' : printer.location;
}

function printerRow(printer: Printer, opened: (() => void) | null): St.Button {
  const box = new St.BoxLayout({ style_class: 'kestrel-portal-row-box', x_expand: true });
  box.add_child(new St.Icon({ icon_name: ICON, style_class: 'kestrel-portal-row-icon' }));
  const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-row-text', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  text.add_child(new St.Label({ text: printer.description, style_class: 'kestrel-portal-row-title' }));
  const subtitle = status(printer);
  if (subtitle) text.add_child(new St.Label({ text: subtitle, style_class: 'kestrel-portal-row-subtitle' }));
  box.add_child(text);
  if (opened) box.add_child(new St.Icon({ icon_name: 'pan-end-symbolic', style_class: 'kestrel-print-pick-arrow', y_align: Clutter.ActorAlign.CENTER }));
  const button = new St.Button({ style_class: 'kestrel-portal-row kestrel-print-printer', child: box, x_expand: true, reactive: !!opened, can_focus: !!opened, accessible_name: printer.description });
  if (opened) button.connect('clicked', opened);
  return button;
}

class PrintForm {
  private readonly body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-print-body', x_expand: true });
  private readonly wanted: Preferences;
  private accept: St.Button | null = null;
  choices: Choices;

  constructor(private readonly dialog: PortalDialog, private readonly spec: PrintDialogSpec) {
    const printer = defaultPrinter(spec.printers, spec.preferences.printer);
    this.wanted = { ...spec.preferences };
    this.choices = forPrinter(printer, this.wanted, spec.pageChoices(printer));
    dialog.content.add_child(this.body);
    this.showForm();
  }

  private showForm(): void {
    this.render();
    [, this.accept] = this.dialog.buttons([
      { label: 'Cancel', action: this.dialog.cancel },
      { label: this.spec.acceptLabel, default: true, action: () => { if (ready(this.choices)) this.dialog.finish(SUCCESS); } },
    ]);
    this.validate();
  }

  private showPicker(title: string, rows: St.Button[], selected: (index: number) => void): void {
    this.body.destroy_all_children();
    this.body.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-label' }));
    this.body.add_child(list(rows, rows.length > PICKER_ROWS_BEFORE_SCROLLING));
    choose(rows, index => {
      selected(index);
      this.showForm();
    });
    this.dialog.buttons([{ label: 'Back', action: () => this.showForm() }]);
    (rows.find(candidate => candidate.checked) ?? rows[0]).grab_key_focus();
  }

  private validate(): void {
    if (this.accept) this.accept.reactive = ready(this.choices);
  }

  private update(changes: Partial<Adjustable>): void {
    Object.assign(this.choices, changes);
    Object.assign(this.wanted, changes);
    this.validate();
  }

  private render(): void {
    this.body.destroy_all_children();
    const { choices, spec } = this;
    const { printer } = choices;
    this.body.add_child(printerRow(printer, spec.printers.length > 1 ? () => this.pickPrinter() : null));
    this.body.add_child(field('Copies', stepper(choices.copies, printer.maxCopies, copies => this.update({ copies }))));
    this.renderPages(spec.pageChoices(printer));
    const available = papers(printer.media);
    if (choices.paper && available.length > 1) this.body.add_child(field('Paper', pick(choices.paper.name, () => this.pickPaper())));
    if (spec.orientation)
      this.body.add_child(field('Orientation', segments(ORIENTATIONS, choices.orientation, orientation => this.update({ orientation }))));
    const sides = sidesOffered(printer);
    if (sides.length > 1)
      this.body.add_child(field('Two-sided', segments(SIDES.filter(({ value }) => sides.includes(value)), choices.sides, value => this.update({ sides: value }))));
    if (colorModesOffered(printer).length > 1)
      this.body.add_child(field('Color', segments(COLOR_MODES, choices.colorMode, colorMode => this.update({ colorMode }))));
  }

  private renderPages(pageChoices: PageChoice[]): void {
    if (pageChoices.length < 2) return;
    const ranges = new St.Entry({ style_class: 'kestrel-print-ranges', text: this.choices.ranges, hint_text: 'For example 1-3, 5', can_focus: true, x_expand: true, visible: this.choices.pages === 'ranges' });
    ranges.clutter_text.connect('text-changed', () => this.update({ ranges: ranges.text }));
    const choice = segments(pageChoices.map(value => ({ value, label: PAGE_LABELS[value] })), this.choices.pages, pages => {
      this.update({ pages });
      ranges.visible = pages === 'ranges';
      if (ranges.visible) ranges.grab_key_focus();
    });
    this.body.add_child(field('Pages', choice));
    this.body.add_child(ranges);
  }

  private pickPrinter(): void {
    const { printers, pageChoices } = this.spec;
    this.showPicker('Printer', printers.map(printer => row({ icon: ICON, title: printer.description, subtitle: status(printer), checked: printer === this.choices.printer })),
      index => {
        this.wanted.printer = printers[index].name;
        this.choices = forPrinter(printers[index], this.wanted, pageChoices(printers[index]));
      });
  }

  private pickPaper(): void {
    const available = papers(this.choices.printer.media);
    this.showPicker('Paper', available.map(paper => row({ title: paper.name, subtitle: sizeLabel(paper), checked: paper.keyword === this.choices.paper?.keyword })),
      index => {
        const chosen = available[index];
        this.choices.paper = chosen;
        this.wanted.size = [chosen.width, chosen.height];
      });
  }
}

export async function choosePrint(handle: string, spec: PrintDialogSpec): Promise<[number, Choices | null]> {
  let chosen = (): Choices | null => null;
  const [response] = await openDialog(handle, {
    title: spec.title,
    description: spec.printers.length ? undefined : 'No printers are set up.',
    icon: ICON,
    styleClass: 'kestrel-print-dialog',
  }, dialog => {
    if (!spec.printers.length) {
      dialog.buttons([{ label: 'Cancel', action: dialog.cancel }]);
      return;
    }
    const form = new PrintForm(dialog, spec);
    chosen = () => form.choices;
  });
  return [response, response === SUCCESS ? chosen() : null];
}
