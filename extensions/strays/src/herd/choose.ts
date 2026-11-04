import type { Pack } from '../packs/pack.js';
import type { Graph, Move, Route, Spot } from '../world/graph.js';

const STAYING_PUT = 0.8;
const FURTHER_AWAY = 0.6;

/** Where a stray fancies going from where it is: anywhere it can reach, more often where it likes to be and close by. */
export function pickDestination(graph: Graph, from: Spot, pack: Pack): Route | Move {
  const routes = graph.routesFrom(from);
  const clinging = graph.movesFrom(from).filter(move => move.kind === 'cling');
  const weighted: [Route | Move, number][] = [
    ...routes.map((route): [Route, number] => {
      const here = route.moves.length === 0 ? STAYING_PUT : FURTHER_AWAY ** (route.moves.length - 1);
      return [route, pack.likes[route.spot.platform.kind] * here];
    }),
    ...clinging.map((move): [Move, number] => [move, pack.likes.edges]),
  ];
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [choice, weight] of weighted) if ((roll -= weight) <= 0) return choice;
  return routes[0];
}

/** Somewhere to fly to from mid-air, by where it likes to be. */
export function flightFrom(graph: Graph, x: number, pack: Pack): Move {
  const weighted = graph.spots.map((spot): [Spot, number] => [spot, pack.likes[spot.platform.kind]]);
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  const [to] = weighted.find(([, weight]) => (roll -= weight) <= 0) ?? weighted[0];
  return { kind: 'fly', from: to, to, fromX: x, toX: (to.span.left + to.span.right) / 2, side: 0 };
}

/** Windows it could get to in one go, by what's on them. */
export function windowsInReach(graph: Graph, from: Spot): Move[] {
  return graph.movesFrom(from).filter(move => move.kind !== 'cling' && move.kind !== 'drop' && move.to.platform.kind === 'window');
}
