import { Curve, reducedMotion } from '../../shared/motion/motion.js';

const DIM_DURATION = 1500;
const REDUCED_DIM_DURATION = 400;
const RESTORE_DURATION = 200;
const DIM_CURVE = [0.4, 0, 0.6, 1];
const ENCODING_GAMMA = 2.2;

export interface DimTransition {
  duration: number;
  curve: readonly number[];
}

export function dimTransition(dimming: boolean): DimTransition {
  if (!dimming) return { duration: RESTORE_DURATION, curve: Curve.decelerate };
  return { duration: reducedMotion() ? REDUCED_DIM_DURATION : DIM_DURATION, curve: DIM_CURVE };
}

export const perceived = (luminance: number): number => luminance ** (1 / ENCODING_GAMMA);
export const luminance = (perceived: number): number => perceived ** ENCODING_GAMMA;
