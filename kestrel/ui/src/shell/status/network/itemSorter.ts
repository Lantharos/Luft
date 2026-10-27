import GLib from 'gi://GLib';

import * as Util from '../../runtime/util.js';

export interface SortableItem {
  readonly name: string | null;
  readonly timestamp: number;
}

interface ItemSorterOptions<T> {
  sortFunc?: (one: T, two: T) => number;
  trackMru?: boolean;
}

function sortByName(one: SortableItem, two: SortableItem): number {
  return GLib.utf8_collate(one.name ?? '', two.name ?? '');
}

function sortByMru(one: SortableItem, two: SortableItem): number {
  return two.timestamp - one.timestamp;
}

function remove<T>(array: T[], item: T): void {
  const pos = array.indexOf(item);
  if (pos >= 0) array.splice(pos, 1);
}

function upsertInto<T>(array: T[], item: T, sortFunc: (one: T, two: T) => number): number {
  remove(array, item);
  return Util.insertSorted(array, item, sortFunc);
}

export class ItemSorter<T> {
  private readonly trackMru: boolean;
  private readonly sortFunc: (one: T, two: T) => number;
  private readonly itemsOrder: T[] = [];
  private readonly itemsMruOrder: T[] = [];

  constructor({ sortFunc = sortByName as (one: T, two: T) => number, trackMru = false }: ItemSorterOptions<T> = {}) {
    this.trackMru = trackMru;
    this.sortFunc = sortFunc;
  }

  *[Symbol.iterator](): Generator<T> {
    yield* this.itemsOrder;
  }

  *itemsByMru(): Generator<T> {
    yield* this.itemsMruOrder;
  }

  upsert(item: T): number {
    if (this.trackMru) upsertInto(this.itemsMruOrder, item, sortByMru as (one: T, two: T) => number);
    return upsertInto(this.itemsOrder, item, this.sortFunc);
  }

  delete(item: T): void {
    if (this.trackMru) remove(this.itemsMruOrder, item);
    remove(this.itemsOrder, item);
  }
}
