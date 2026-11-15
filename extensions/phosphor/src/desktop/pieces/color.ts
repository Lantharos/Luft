export interface Grade {
  tint: number[];
  saturation: number;
  contrast: number;
  shadows: number[];
  lights: number[];
}

const NONE = [0, 0, 0];

export const GRADES: Record<string, Grade> = {
  warm: { tint: [1.08, 1.0, 0.86], saturation: 1.05, contrast: 1.02, shadows: NONE, lights: NONE },
  cold: { tint: [0.88, 0.98, 1.12], saturation: 0.95, contrast: 1.03, shadows: NONE, lights: NONE },
  'teal-orange': { tint: [1, 1, 1], saturation: 1.1, contrast: 1.08, shadows: [-0.05, 0.03, 0.08], lights: [0.08, 0.02, -0.07] },
  noir: { tint: [1, 1, 1], saturation: 0, contrast: 1.25, shadows: NONE, lights: NONE },
  sepia: { tint: [1.12, 0.98, 0.74], saturation: 0.15, contrast: 1.04, shadows: NONE, lights: NONE },
  vivid: { tint: [1, 1, 1], saturation: 1.45, contrast: 1.1, shadows: NONE, lights: NONE },
};

/** A grade from people's own temperature, green to magenta tint, saturation, contrast and brightness. */
export function ownGrade(temperature: number, tint: number, saturation: number, contrast: number, brightness: number): Grade {
  const lift = Array(3).fill(brightness * 0.6);
  return {
    tint: [1 + temperature * 0.12 + tint * 0.05, 1 - tint * 0.1, 1 - temperature * 0.12 + tint * 0.05],
    saturation,
    contrast,
    shadows: lift,
    lights: lift,
  };
}

export const SHADOWS = `
float dark = 1.0 - clamp(dot(filter_color.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
filter_color.rgb += filter_color.rgb * dark * dark * shadow_boost * 1.6 + vec3(0.03) * dark * dark * dark * shadow_boost;`;

export const GRADE = `
vec3 graded = filter_color.rgb * grade_tint;
float light = dot(graded, vec3(0.2126, 0.7152, 0.0722));
graded = mix(vec3(light), graded, grade_saturation);
graded += mix(grade_shadows, grade_lights, smoothstep(0.1, 0.8, light));
graded = (graded - 0.5) * grade_contrast + 0.5;
filter_color.rgb = mix(filter_color.rgb, clamp(graded, 0.0, 1.0), grade_amount);`;

export const DUOTONE = `
float tone = smoothstep(0.0, 1.0, dot(clamp(filter_color.rgb, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722)));
filter_color.rgb = mix(filter_color.rgb, mix(duotone_dark, duotone_light, tone), grade_amount);`;

export const INVERT: Record<string, string> = {
  colors: 'filter_color.rgb = 1.0 - clamp(filter_color.rgb, 0.0, 1.0);',
  lightness: `
vec3 kept = clamp(filter_color.rgb, 0.0, 1.0);
filter_color.rgb = kept + 1.0 - max(kept.r, max(kept.g, kept.b)) - min(kept.r, min(kept.g, kept.b));`,
};
