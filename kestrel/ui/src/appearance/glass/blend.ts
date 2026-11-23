export type Channels = [number, number, number];

const BLEND_LUMA: Channels = [0.3, 0.59, 0.11];

export const blendLuma = (color: Channels) => color.reduce((sum, channel, index) => sum + channel * BLEND_LUMA[index], 0);

export function setLuminosity(color: Channels, target: number): Channels {
  const shifted = color.map(channel => channel + target - blendLuma(color)) as Channels;
  const low = Math.min(...shifted);
  const high = Math.max(...shifted);
  const floored = low < 0 ? shifted.map(channel => target + (channel - target) * target / (target - low)) as Channels : shifted;
  return high > 1 ? floored.map(channel => target + (channel - target) * (1 - target) / (high - target)) as Channels : floored;
}
