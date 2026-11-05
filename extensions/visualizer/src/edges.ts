import type { LayerArea, LayerDisplay, Rect } from '@luft/extension-api';

export type Edge = 'bottom' | 'top' | 'left' | 'right';

/** Which edges glow, and how far in they reach as a share of the display's short side. */
export interface Placement {
  edges: readonly Edge[];
  reach: number;
}

const SHARE_ALL_AROUND = 2 / 3;
const LARGEST_SHARE_AROUND = 0.5;
const BARS_ALONG_THE_LONG_SIDE = 36;

const depthOf = ({ edges, reach }: Placement, { width, height }: { width: number; height: number }) =>
  Math.round(Math.min(width, height) * (edges.length > 2 ? Math.min(reach * SHARE_ALL_AROUND, LARGEST_SHARE_AROUND) : reach));

/** A band along each edge. Edges that are off get no band, so they cost nothing. */
export function edgeAreas(placement: Placement, display: LayerArea): Rect[] {
  const { width, height } = display;
  const depth = depthOf(placement, display);
  const band: Record<Edge, Rect> = {
    bottom: { x: 0, y: height - depth, width, height: depth },
    top: { x: 0, y: 0, width, height: depth },
    left: { x: 0, y: 0, width: depth, height },
    right: { x: width - depth, y: 0, width: depth, height },
  };
  return placement.edges.map(edge => band[edge]);
}

/** How far the taskbar reaches in from each edge. */
function taskbarDepths({ taskbarOutlines, width, height }: LayerDisplay): Record<Edge, number> {
  const depths = { bottom: 0, top: 0, left: 0, right: 0 };
  for (const { edge, x, y, width: across, height: down } of taskbarOutlines) {
    const reached = { bottom: height - y, top: y + down, left: x + across, right: width - x }[edge];
    depths[edge] = Math.max(depths[edge], reached);
  }
  return depths;
}

/** The value of `vis_strip` for one band: it stands on the taskbar and ends where the taskbar or the next edge starts. */
export function strip(placement: Placement, edge: Edge, display: LayerDisplay): number[] {
  const { edges } = placement;
  const { width, height } = display;
  const depths = taskbarDepths(display);
  const upright = edge === 'left' || edge === 'right';
  const [start, end]: Edge[] = upright ? ['top', 'bottom'] : ['left', 'right'];
  const length = (upright ? height : width) - depths[start] - depths[end];
  const shared = (side: Edge) => edges.includes(side) || depths[side] > 0 ? 1 : 0;
  const across = { bottom: [0, -1, height - depths.bottom], top: [0, 1, -depths.top], left: [1, 0, -depths.left], right: [-1, 0, width - depths.right] }[edge];
  return [
    across[0], across[1], upright ? 0 : 1, upright ? 1 : 0,
    across[2], -depths[start], length, depthOf(placement, display) - depths[edge],
    shared(start), shared(end), Math.round(BARS_ALONG_THE_LONG_SIDE * length / Math.max(width, height)), 0,
  ];
}
