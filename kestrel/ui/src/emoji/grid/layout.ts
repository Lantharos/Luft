import type { Item, Section, Tab } from '../catalog/catalog.js';

export const COLUMNS = 9;
export const CELL_SIZE = 40;
export const HEADER_HEIGHT = 32;
const WIDE_SPAN = 3;

export interface Cell {
  readonly item: Item;
  readonly index: number;
  readonly row: number;
  readonly column: number;
  readonly span: number;
}

interface Row {
  readonly y: number;
  readonly height: number;
  readonly title: string | null;
  readonly tab: Tab | null;
  readonly cells: Cell[];
}

interface Group {
  readonly title: string | null;
  readonly tab: Tab | null;
  readonly items: readonly Item[];
}

export class GridLayout {
  readonly rows: Row[] = [];
  readonly cells: Cell[] = [];
  readonly tabRows = new Map<Tab, number>();
  height = 0;

  constructor(groups: readonly Group[]) {
    for (const group of groups) {
      if (!group.items.length) continue;
      if (group.tab && !this.tabRows.has(group.tab)) this.tabRows.set(group.tab, this.rows.length);
      if (group.title) this.addRow(group.title, group.tab, HEADER_HEIGHT);
      let row = this.addRow(null, group.tab, CELL_SIZE);
      let column = 0;
      for (const item of group.items) {
        const span = item.kind === 'kaomoji' || item.kind === 'space' ? WIDE_SPAN : 1;
        if (column + span > COLUMNS) {
          row = this.addRow(null, group.tab, CELL_SIZE);
          column = 0;
        }
        const cell = { item, index: this.cells.length, row: this.rows.length - 1, column, span };
        row.cells.push(cell);
        this.cells.push(cell);
        column += span;
      }
    }
  }

  static sections(sections: readonly Section[]): Group[] {
    return sections.map(section => ({ title: section.title, tab: section.tab, items: section.items }));
  }

  firstRowAt(y: number): number {
    let low = 0;
    let high = this.rows.length - 1;
    while (low < high) {
      const middle = (low + high + 1) >> 1;
      if (this.rows[middle].y <= y) low = middle;
      else high = middle - 1;
    }
    return low;
  }

  neighbour(cell: Cell, rows: number): Cell | undefined {
    let rowIndex = cell.row;
    const center = cell.column + cell.span / 2;
    for (let step = 0; step < Math.abs(rows);) {
      rowIndex += Math.sign(rows);
      const row = this.rows[rowIndex];
      if (!row) return undefined;
      if (row.cells.length) step++;
    }
    const cells = this.rows[rowIndex].cells;
    return cells.find(candidate => candidate.column + candidate.span > center - 0.5) ?? cells[cells.length - 1];
  }

  private addRow(title: string | null, tab: Tab | null, height: number): Row {
    const row = { y: this.height, height, title, tab, cells: [] };
    this.rows.push(row);
    this.height += height;
    return row;
  }
}
