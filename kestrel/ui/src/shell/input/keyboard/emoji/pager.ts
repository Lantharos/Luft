import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../../../kestrelUi.js';
import { SwipeTracker } from '../../swipeTracker.js';
import { Key } from '../key.js';

const PAGE_SEPARATION = 32;

export interface EmojiKey {
  label: string;
  variants: string[];
}

export interface EmojiSection {
  group: string;
  label: string;
  keys: EmojiKey[];
}

interface EmojiPage {
  pageKeys: EmojiKey[];
  nPages: number;
  page: number;
  section: EmojiSection;
}

export namespace EmojiPager {
  export interface Signals extends St.Widget.SignalSignatures {
    'emoji': (emoji: string) => void;
    'page-changed': (page: number, nPages: number) => void;
  }
}

export const EmojiPager = GObject.registerClass({
  Properties: {
    'delta': GObject.ParamSpec.int('delta', null, null, GObject.ParamFlags.READWRITE, GLib.MININT32, GLib.MAXINT32, 0),
  },
  Signals: {
    'emoji': { param_types: [GObject.TYPE_STRING] },
    'page-changed': { param_types: [GObject.TYPE_INT, GObject.TYPE_INT] },
  },
}, class EmojiPager extends St.Widget {
  declare connect: GObject.SignalMethods<this, EmojiPager.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, EmojiPager.Signals>['emit'];

  private pages: EmojiPage[] = [];
  private panel: St.Widget | null = null;
  private curPage: number | null = null;
  private followingPage: number | null = null;
  private followingPanel: St.Widget | null = null;
  private deltaValue = 0;
  private pageWidth = 0;
  private nCols = 0;
  private nRows = 0;
  private readonly swipeTracker: SwipeTracker;

  constructor(private readonly sections: EmojiSection[]) {
    super({
      layout_manager: new Clutter.BinLayout(),
      reactive: true,
      clip_to_allocation: true,
      y_expand: true,
    });

    this.swipeTracker = new SwipeTracker(this,
      Clutter.Orientation.HORIZONTAL,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      { allowDrag: true, allowScroll: true, name: 'EmojiPager swipe tracker' });
    this.swipeTracker.connect('begin', tracker => this.onSwipeBegin(tracker));
    this.swipeTracker.connect('update', (_tracker, progress) => this.onSwipeUpdate(progress));
    this.swipeTracker.connect('end', (_tracker, velocity, endProgress) => this.onSwipeEnd(velocity, endProgress));

    this.connect('destroy', () => this.swipeTracker.destroy());

    this.bind_property('visible', this.swipeTracker, 'enabled', GObject.BindingFlags.DEFAULT);
  }

  get delta(): number {
    return this.deltaValue;
  }

  set delta(value: number) {
    if (this.deltaValue === value) return;

    this.deltaValue = value;
    this.notify('delta');

    const followingPage = this.getFollowingPage();

    if (this.followingPage !== followingPage) {
      this.followingPanel?.destroy();
      this.followingPanel = null;

      if (followingPage !== null) {
        this.followingPanel = this.generatePanel(followingPage);
        this.add_child(this.followingPanel);
      }

      this.followingPage = followingPage;
    }

    const multiplier = this.text_direction === Clutter.TextDirection.RTL ? -1 : 1;

    this.panel!.translation_x = value * multiplier;
    if (this.followingPanel) {
      const translation = value < 0
        ? this.pageWidth + PAGE_SEPARATION
        : -this.pageWidth - PAGE_SEPARATION;

      this.followingPanel.translation_x = (value * multiplier) + (translation * multiplier);
    }
  }

  getFollowingPage(): number | null {
    if (this.delta === 0) return null;
    return this.delta < 0 ? this.nextPage(this.curPage!) : this.prevPage(this.curPage!);
  }

  setCurrentPage(nPage: number): void {
    if (this.curPage === nPage) return;

    this.curPage = nPage;

    this.panel?.destroy();
    this.panel = null;

    if (nPage === this.followingPage) {
      this.panel = this.followingPanel;
      this.followingPanel = null;
    }

    this.followingPanel?.destroy();
    this.followingPanel = null;
    this.followingPage = null;
    this.deltaValue = 0;

    if (!this.panel) {
      this.panel = this.generatePanel(nPage);
      this.add_child(this.panel);
    }

    const page = this.pages[nPage];
    this.emit('page-changed', page.page, page.nPages);
  }

  setCurrentSection(section: EmojiSection, nPage: number): void {
    const index = this.pages.findIndex(page => page.section === section && page.page === nPage);
    if (index !== -1) this.setCurrentPage(index);
  }

  setRatio(nCols: number, nRows: number): void {
    this.nCols = nCols;
    this.nRows = nRows;
    this.initPagingInfo();
  }

  private prevPage(nPage: number): number {
    return (nPage + this.pages.length - 1) % this.pages.length;
  }

  private nextPage(nPage: number): number {
    return (nPage + 1) % this.pages.length;
  }

  private onSwipeUpdate(progress: number): void {
    this.delta = -progress * this.pageWidth;
  }

  private onSwipeBegin(tracker: SwipeTracker): void {
    this.pageWidth = this.width;
    tracker.confirmSwipe(this.pageWidth, [-1, 0, 1], 0, 0);
  }

  private onSwipeEnd(velocity: number, endProgress: number): void {
    this.remove_all_transitions();
    if (endProgress === 0) {
      this.ease_property('delta', 0, { duration: velocity });
      return;
    }

    const value = endProgress < 0
      ? this.pageWidth + PAGE_SEPARATION
      : -this.pageWidth - PAGE_SEPARATION;
    this.ease_property('delta', value, {
      duration: velocity,
      onComplete: () => this.setCurrentPage(this.getFollowingPage()!),
    });
  }

  private initPagingInfo(): void {
    this.pages = [];

    const itemsPerPage = this.nCols * this.nRows;
    for (const section of this.sections) {
      const nPages = Math.ceil(section.keys.length / itemsPerPage);
      section.keys.forEach((key, i) => {
        if (i % itemsPerPage === 0) this.pages.push({ pageKeys: [], nPages, page: i / itemsPerPage, section });
        this.pages.at(-1)!.pageKeys.push(key);
      });
    }
  }

  private generatePanel(nPage: number): St.Widget {
    const gridLayout = new Clutter.GridLayout({
      orientation: Clutter.Orientation.HORIZONTAL,
      column_homogeneous: true,
      row_homogeneous: true,
    });
    const panel = new St.Widget({
      layout_manager: gridLayout,
      style_class: 'emoji-page',
      x_expand: true,
      y_expand: true,
    });

    gridLayout.attach(new Clutter.Actor(), 0, 0, this.nCols, this.nRows);

    this.pages[nPage].pageKeys.forEach((modelKey, i) => {
      const key = new Key({ commitString: modelKey.label }, modelKey.variants);
      key.connect('commit', (_key, text) => {
        KestrelUi.playSound('keyboard-tap');
        this.emit('emoji', text);
      });
      gridLayout.attach(key, i % this.nCols, Math.floor(i / this.nCols), 1, 1);
    });

    return panel;
  }
});

export type EmojiPager = InstanceType<typeof EmojiPager>;
