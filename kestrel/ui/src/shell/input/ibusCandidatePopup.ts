import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import IBus from 'gi://IBus';
import type Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import { BoxPointer, PopupAnimation } from '../popups/boxpointer.js';
import * as Main from '../main.js';

const MAX_CANDIDATES_PER_PAGE = 16;

const DEFAULT_INDEX_LABELS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'a', 'b', 'c', 'd', 'e', 'f',
];

interface CandidateBox {
  box: St.BoxLayout;
  index: St.Label;
  candidate: St.Label;
}

namespace CandidateArea {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'candidate-clicked': (index: number, button: number, state: Clutter.ModifierType) => void;
    'cursor-down': () => void;
    'cursor-up': () => void;
    'next-page': () => void;
    'previous-page': () => void;
  }
}

class CandidateArea extends St.BoxLayout {
  static [GObject.signals] = {
    'candidate-clicked': { param_types: [GObject.TYPE_UINT, GObject.TYPE_UINT, Clutter.ModifierType.$gtype] },
    'cursor-down': {},
    'cursor-up': {},
    'next-page': {},
    'previous-page': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, CandidateArea.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, CandidateArea.Signals>['emit'];

  private readonly candidateBoxes: CandidateBox[] = [];
  private readonly buttonBox = new St.BoxLayout({ style_class: 'candidate-page-button-box' });
  private readonly previousButton = new St.Button({
    style_class: 'candidate-page-button candidate-page-button-previous button',
    x_expand: true,
  });

  private readonly nextButton = new St.Button({
    style_class: 'candidate-page-button candidate-page-button-next button',
    x_expand: true,
  });

  private ibusOrientation = -1;
  private cursorPosition = 0;

  constructor() {
    super({
      orientation: Clutter.Orientation.VERTICAL,
      reactive: true,
      visible: false,
    });

    for (let i = 0; i < MAX_CANDIDATES_PER_PAGE; ++i) this.addCandidateBox(i);

    this.buttonBox.add_child(this.previousButton);
    this.buttonBox.add_child(this.nextButton);
    this.add_child(this.buttonBox);

    this.previousButton.connect('clicked', () => this.emit('previous-page'));
    this.nextButton.connect('clicked', () => this.emit('next-page'));

    const scrollController = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.DISCRETE | Clutter.ScrollControllerFlags.SCROLL_VERTICAL,
    });
    scrollController.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
      if (dy < 0) this.emit('cursor-up');
      else if (dy > 0) this.emit('cursor-down');
    });
    this.add_action(scrollController);
  }

  private addCandidateBox(position: number): void {
    const box = new St.BoxLayout({
      style_class: 'candidate-box',
      reactive: true,
      track_hover: true,
    });
    const index = new St.Label({ style_class: 'candidate-index' });
    const candidate = new St.Label({ style_class: 'candidate-label' });
    box.add_child(index);
    box.add_child(candidate);
    this.candidateBoxes.push({ box, index, candidate });
    this.add_child(box);

    const clickGesture = new Clutter.ClickGesture();
    clickGesture.connect('recognize', gesture => this.emit('candidate-clicked', position, gesture.get_button(), gesture.get_state()));
    box.add_action(clickGesture);
  }

  setOrientation(orientation: number): void {
    if (this.ibusOrientation === orientation) return;

    this.ibusOrientation = orientation;

    if (orientation === IBus.Orientation.HORIZONTAL) {
      this.orientation = Clutter.Orientation.HORIZONTAL;
      this.remove_style_class_name('vertical');
      this.add_style_class_name('horizontal');
      this.previousButton.icon_name = 'go-previous-symbolic';
      this.nextButton.icon_name = 'go-next-symbolic';
    } else {
      this.orientation = Clutter.Orientation.VERTICAL;
      this.add_style_class_name('vertical');
      this.remove_style_class_name('horizontal');
      this.previousButton.icon_name = 'go-up-symbolic';
      this.nextButton.icon_name = 'go-down-symbolic';
    }
  }

  setCandidates(indexes: string[], candidates: string[], cursorPosition: number, cursorVisible: boolean): void {
    for (let i = 0; i < MAX_CANDIDATES_PER_PAGE; ++i) {
      const visible = i < candidates.length;
      const { box, index, candidate } = this.candidateBoxes[i];
      box.visible = visible;

      if (!visible) continue;

      index.text = indexes[i] || DEFAULT_INDEX_LABELS[i];
      candidate.text = candidates[i];
    }

    this.candidateBoxes[this.cursorPosition].box.remove_style_pseudo_class('selected');
    this.cursorPosition = cursorPosition;
    if (cursorVisible) this.candidateBoxes[cursorPosition].box.add_style_pseudo_class('selected');
  }

  updateButtons(wrapsAround: boolean, page: number, nPages: number): void {
    if (nPages < 2) {
      this.buttonBox.hide();
      return;
    }
    this.buttonBox.show();
    this.previousButton.reactive = wrapsAround || page > 0;
    this.nextButton.reactive = wrapsAround || page < nPages - 1;
  }
}

function lookupLabels(lookupTable: IBus.LookupTable): string[] {
  const labels: string[] = [];
  for (let i = 0; ; ++i) {
    const label = lookupTable.get_label(i) as IBus.Text | null;
    if (!label) return labels;
    labels.push(label.get_text());
  }
}

function setTextAttributes(clutterText: Clutter.Text, attrs: IBus.AttrList): void {
  for (let i = 0; ; ++i) {
    const attr = attrs.get(i) as IBus.Attribute | null;
    if (!attr) return;
    if (attr.get_attr_type() === IBus.AttrType.BACKGROUND) clutterText.set_selection(attr.get_start_index(), attr.get_end_index());
  }
}

export class CandidatePopup extends BoxPointer {
  static {
    GObject.registerClass(this);
  }

  private readonly dummyCursor = new Clutter.Actor({ opacity: 0 });
  private readonly preeditText = new St.Label({ style_class: 'candidate-popup-text', visible: false });
  private readonly auxText = new St.Label({ style_class: 'candidate-popup-text', visible: false });
  private readonly candidateArea = new CandidateArea();
  private panelService: IBus.PanelService | null = null;

  constructor() {
    super(St.Side.TOP);
    this.visible = false;
    this.style_class = 'candidate-popup-boxpointer';

    const inputPanelGroup = global.compositor.get_input_panel_group();
    inputPanelGroup.add_child(this.dummyCursor);
    inputPanelGroup.add_child(this);

    const box = new St.BoxLayout({
      style_class: 'candidate-popup-content',
      orientation: Clutter.Orientation.VERTICAL,
    });
    this.bin.set_child(box);
    box.add_child(this.preeditText);
    box.add_child(this.auxText);
    box.add_child(this.candidateArea);

    this.candidateArea.connect('previous-page', () => this.panelService?.page_up());
    this.candidateArea.connect('next-page', () => this.panelService?.page_down());
    this.candidateArea.connect('cursor-up', () => this.panelService?.cursor_up());
    this.candidateArea.connect('cursor-down', () => this.panelService?.cursor_down());
    this.candidateArea.connect('candidate-clicked', (_area, index, button, state) => this.panelService?.candidate_clicked(index, button, state));
  }

  setPanelService(panelService: IBus.PanelService | null): void {
    this.panelService = panelService;
    if (!panelService) return;

    panelService.connect('set-cursor-location', (_ps, x, y, w, h) => {
      const focusWindow = global.display.focus_window;
      let rect = new Mtk.Rectangle({ x, y, width: w, height: h });
      if (!global.stage.key_focus && focusWindow) rect = focusWindow.protocol_to_stage_rect(rect);
      this.setDummyCursorGeometry(rect.x, rect.y, rect.width, rect.height);
    });
    panelService.connect('set-cursor-location-relative', (_ps, x, y, w, h) => {
      const focusWindow = global.display.focus_window;
      if (!focusWindow) return;
      const rect = focusWindow.protocol_to_stage_rect(new Mtk.Rectangle({ x, y, width: w, height: h }));
      const windowActor = focusWindow.get_compositor_private() as Meta.WindowActor;
      const scale = windowActor.get_resource_scale();
      this.setDummyCursorGeometry(
        windowActor.x + rect.x / scale,
        windowActor.y + rect.y / scale,
        rect.width / scale,
        rect.height / scale);
    });
    panelService.connect('update-preedit-text', (_ps, text, _cursorPosition, visible) => {
      this.preeditText.visible = visible;
      this.updateVisibility();

      this.preeditText.text = text.get_text();

      const attrs = text.get_attributes() as IBus.AttrList | null;
      if (attrs) setTextAttributes(this.preeditText.clutter_text, attrs);
    });
    panelService.connect('show-preedit-text', () => {
      this.preeditText.show();
      this.updateVisibility();
    });
    panelService.connect('hide-preedit-text', () => {
      this.preeditText.hide();
      this.updateVisibility();
    });
    panelService.connect('update-auxiliary-text', (_ps, text, visible) => {
      this.auxText.visible = visible;
      this.updateVisibility();

      this.auxText.text = text.get_text();
    });
    panelService.connect('show-auxiliary-text', () => {
      this.auxText.show();
      this.updateVisibility();
    });
    panelService.connect('hide-auxiliary-text', () => {
      this.auxText.hide();
      this.updateVisibility();
    });
    panelService.connect('update-lookup-table', (_ps, lookupTable, visible) => this.updateLookupTable(lookupTable, visible));
    panelService.connect('show-lookup-table', () => {
      Main.keyboard.setSuggestionsVisible(true);
      this.candidateArea.show();
      this.updateVisibility();
    });
    panelService.connect('hide-lookup-table', () => {
      Main.keyboard.setSuggestionsVisible(false);
      this.candidateArea.hide();
      this.updateVisibility();
    });
    panelService.connect('focus-out', () => {
      this.close(PopupAnimation.NONE);
      Main.keyboard.resetSuggestions();
    });
  }

  private updateLookupTable(lookupTable: IBus.LookupTable, visible: boolean): void {
    this.candidateArea.visible = visible;
    this.updateVisibility();

    const nCandidates = lookupTable.get_number_of_candidates();
    const cursorPos = lookupTable.get_cursor_pos();
    const pageSize = lookupTable.get_page_size();
    const nPages = Math.ceil(nCandidates / pageSize);
    const page = cursorPos === 0 ? 0 : Math.floor(cursorPos / pageSize);
    const startIndex = page * pageSize;
    const endIndex = Math.min((page + 1) * pageSize, nCandidates);

    const indexes = lookupLabels(lookupTable);

    Main.keyboard.resetSuggestions();
    Main.keyboard.setSuggestionsVisible(visible);

    const candidates: string[] = [];
    for (let i = startIndex; i < endIndex; ++i) {
      const text = lookupTable.get_candidate(i).get_text();
      candidates.push(text);
      Main.keyboard.addSuggestion(text, () => this.panelService?.candidate_clicked(i, 1, 0));
    }

    this.candidateArea.setCandidates(indexes, candidates, cursorPos % pageSize, lookupTable.is_cursor_visible());
    this.candidateArea.setOrientation(lookupTable.get_orientation());
    this.candidateArea.updateButtons(lookupTable.is_round(), page, nPages);
  }

  private setDummyCursorGeometry(x: number, y: number, w: number, h: number): void {
    this.dummyCursor.set_position(Math.round(x), Math.round(y));
    this.dummyCursor.set_size(Math.round(w), Math.round(h));

    if (this.visible) this.setPosition(this.dummyCursor, 0);
  }

  private updateVisibility(): void {
    const isVisible = !Main.keyboard.visible &&
      (this.preeditText.visible || this.auxText.visible || this.candidateArea.visible);

    if (isVisible) {
      this.setPosition(this.dummyCursor, 0);
      this.open(PopupAnimation.NONE);
    } else {
      this.close(PopupAnimation.NONE);
    }
  }
}
