export interface Size { width: number; height: number; }
export interface Rect extends Size { x: number; y: number; }

const MAXIMUM_SCALE = 0.7;

function rows<T>(items: T[], count: number): T[][] {
  const perRow = Math.ceil(items.length / count);
  return Array.from({ length: count }, (_, index) => items.slice(index * perRow, (index + 1) * perRow)).filter(row => row.length);
}

function layoutScale(sizes: Size[][], area: Size, spacing: number, header: number): number {
  const rowHeights = sizes.map(row => Math.max(...row.map(size => size.height)));
  const vertical = (area.height - (sizes.length - 1) * spacing - sizes.length * header) / rowHeights.reduce((sum, height) => sum + height, 0);
  const horizontal = Math.min(...sizes.map(row =>
    (area.width - (row.length - 1) * spacing) / row.reduce((sum, size) => sum + size.width, 0)));
  return Math.min(vertical, horizontal, MAXIMUM_SCALE);
}

export function windowSlots(sizes: Size[], area: Rect, spacing: number, header: number): Rect[] {
  if (!sizes.length) return [];
  let best = rows(sizes, 1);
  let bestScale = layoutScale(best, area, spacing, header);
  for (let count = 2; count <= sizes.length; count++) {
    const candidate = rows(sizes, count);
    const scale = layoutScale(candidate, area, spacing, header);
    if (scale <= bestScale) break;
    [best, bestScale] = [candidate, scale];
  }
  const rowHeights = best.map(row => Math.max(...row.map(size => size.height)) * bestScale + header);
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0) + (best.length - 1) * spacing;
  let y = area.y + (area.height - totalHeight) / 2;
  const slots: Rect[] = [];
  best.forEach((row, index) => {
    const rowWidth = row.reduce((sum, size) => sum + size.width * bestScale, 0) + (row.length - 1) * spacing;
    let x = area.x + (area.width - rowWidth) / 2;
    for (const size of row) {
      const width = size.width * bestScale;
      const height = size.height * bestScale + header;
      slots.push({ x: Math.round(x), y: Math.round(y + (rowHeights[index] - height) / 2), width: Math.round(width), height: Math.round(height) });
      x += width + spacing;
    }
    y += rowHeights[index] + spacing;
  });
  return slots;
}
