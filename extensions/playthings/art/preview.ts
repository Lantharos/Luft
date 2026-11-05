import { puff } from './cloud.js';
import { flame, logs } from './fire.js';
import { lantern } from './lantern.js';
import { mix, Picture, smooth } from './picture.js';
import { glows, stars } from './sky.js';

const FRAMES = 8;
const NIGHT = [0.11, 0.13, 0.22] as const;
const DUSK = [0.2, 0.2, 0.33] as const;

/** A dark rounded tile, so the art shows on light and dark pages alike. */
function tile(): Picture {
  return new Picture(96).paint((x, y) => {
    const corner = Math.hypot(Math.max(0, Math.abs(x) - 0.72), Math.max(0, Math.abs(y) - 0.72)) - 0.26;
    const down = (y + 1) / 2;
    return [mix(NIGHT[0], DUSK[0], down), mix(NIGHT[1], DUSK[1], down), mix(NIGHT[2], DUSK[2], down), 1 - smooth(-0.02, 0.02, corner)];
  });
}

const paper = { dim: [0.86, 0.47, 0.2], shade: [0.42, 0.17, 0.09], lit: [1, 0.66, 0.24], core: [1, 0.95, 0.74] } as const;

function lanternFrames(): Picture[] {
  const [glow] = glows();
  const body = lantern(paper, 0, 0.5);
  return Array.from({ length: FRAMES }, (_, frame) => {
    const swing = Math.sin(frame / FRAMES * Math.PI * 2) * 0.16;
    const [x, y] = [Math.sin(swing) * 1.1, Math.cos(swing) * 1.1 - 1.15];
    const picture = tile();
    picture.paint((px, py) => {
      const t = Math.max(0, Math.min(1, ((px * x + (py + 1.15) * (y + 1.15)) / (x * x + (y + 1.15) ** 2))));
      return [0.82, 0.74, 0.62, 1 - smooth(0.008, 0.03, Math.hypot(px - t * x, py + 1.15 - t * (y + 1.15)))];
    });
    return picture.stamp(glow, x, y + 0.16, 0.95, 0, 0.75).stamp(body, x, y + 0.16, 0.5, -swing);
  });
}

function cloudFrames(): Picture[] {
  const [one, two] = [puff(1), puff(3.7)];
  return Array.from({ length: FRAMES }, (_, frame) => {
    const part = Math.sin(frame / FRAMES * Math.PI * 2) * 0.09;
    return tile().stamp(two, 0.26 + part, -0.05, 0.56).stamp(one, -0.26 - part, -0.1, 0.62);
  });
}

function fireFrames(): Picture[] {
  const wood = logs();
  const [glow] = glows().slice(3);
  return Array.from({ length: FRAMES }, (_, frame) => tile()
    .stamp(glow, 0, 0.35, 0.95, 0, 0.7)
    .stamp(flame(frame % 6, 6, true), 0, -0.06, 0.66, 0.08 * Math.sin(frame))
    .stamp(wood, 0, 0.2, 0.68)
    .stamp(flame((frame + 2) % 6, 2, false), 0.03, 0.03, 0.54, -0.06 * Math.sin(frame)));
}

const CONSTELLATION = [[-0.56, 0.3], [-0.2, -0.1], [0.14, 0.12], [0.5, -0.42], [0.42, 0.44]] as const;

function starFrames(): Picture[] {
  const [glint] = stars();
  return Array.from({ length: FRAMES }, (_, frame) => {
    const picture = tile();
    CONSTELLATION.slice(1).forEach(([x, y], index) => {
      const [fromX, fromY] = CONSTELLATION[index];
      const [dx, dy] = [x - fromX, y - fromY];
      picture.paint((px, py) => {
        const t = Math.max(0, Math.min(1, ((px - fromX) * dx + (py - fromY) * dy) / (dx * dx + dy * dy)));
        return [0.82, 0.88, 1, (1 - smooth(0.006, 0.03, Math.hypot(px - fromX - t * dx, py - fromY - t * dy))) * 0.5];
      });
    });
    CONSTELLATION.forEach(([x, y], index) => picture.stamp(glint, x, y, 0.2 + 0.1 * Math.max(0, Math.sin((frame + index * 2) / FRAMES * Math.PI * 2))));
    return picture;
  });
}

/** What each kind of plaything does, as eight frames in a row, for the Settings page. */
export const previews = (): Picture[] => [...lanternFrames(), ...cloudFrames(), ...fireFrames(), ...starFrames()];
