import type { Box } from '../../../shared/layout/placement.js';

const SLIVER = 1;

const intersects = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

function spots(box: Box, home: Box): Box[] {
  const { width, height } = box;
  return [
    { x: home.x, y: home.y - height + SLIVER, width, height },
    { x: home.x, y: home.y + home.height - SLIVER, width, height },
    { x: home.x + home.width - SLIVER, y: home.y, width, height },
    { x: home.x - width + SLIVER, y: home.y, width, height },
  ];
}

export function parkingSpot(box: Box, home: Box, others: readonly Box[]): Box {
  if (intersects(box, home) && !others.some(other => intersects(box, other))) return box;
  return spots(box, home).find(spot => !others.some(other => intersects(spot, other))) ?? box;
}
