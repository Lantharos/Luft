/* shell-blur-flutes.c
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#include "shell-blur-flutes.h"

static const float dark_tone[2] = { 0.12f, 0.30f };
static const float light_tone[2] = { 0.72f, 0.22f };

static const char *flutes_glsl_declarations =
  "uniform vec2 flute_tone;\n"
  "float flute_bend (float t)\n"
  "{\n"
  "  return t / sqrt (1.0 - 0.75 * t * t) * 0.5;\n"
  "}\n"
  "vec4 flute_sample (vec2 at)\n"
  "{\n"
  "  return texture2D (cogl_sampler0, clamp (at, vec2 (0.0), result_area_end));\n"
  "}\n";

static const char *flutes_glsl =
  "  const float flute_width = 27.0;\n"
  "  vec2 flute_dx = dFdx (surface_position);\n"
  "  vec2 flute_dy = dFdy (surface_position);\n"
  "  vec2 flute_unit = (flute_dy.y * dFdx (cogl_tex_coord0_in.st) -\n"
  "                     flute_dx.y * dFdy (cogl_tex_coord0_in.st)) /\n"
  "                    (flute_dx.x * flute_dy.y - flute_dx.y * flute_dy.x);\n"
  "  float flute_t = fract (surface_position.x / flute_width) * 2.0 - 1.0;\n"
  "  vec2 flute_rib = flute_width * flute_unit;\n"
  "  vec2 flute_center = cogl_tex_coord0_in.st - flute_t * 0.5 * flute_rib;\n"
  "  vec2 flute_at = cogl_tex_coord0_in.st -\n"
  "    (2.4 * flute_bend (flute_t) + flute_t) * 0.5 * flute_rib;\n"
  "  vec2 flute_spread = 0.06 * flute_t * flute_t * flute_t * flute_rib;\n"
  "  vec4 flute_green = flute_sample (flute_at);\n"
  "  vec4 flute_texel = vec4 (flute_sample (flute_at + flute_spread).r,\n"
  "                           flute_green.g,\n"
  "                           flute_sample (flute_at - flute_spread).b,\n"
  "                           flute_green.a) * cogl_color_in;\n"
  "  vec3 flute_reach = flute_sample (flute_center + 1.7 * flute_rib).rgb -\n"
  "                     flute_sample (flute_center - 1.7 * flute_rib).rgb;\n"
  "  float flute_depth = mix (0.15, 1.0, smoothstep (0.02, 0.2, length (flute_reach)));\n"
  "  vec3 flute_color = flute_texel.rgb / max (flute_texel.a, 0.001);\n"
  "  float flute_l = lum (flute_color);\n"
  "  vec3 flute_out = set_lum (mix (vec3 (flute_l), flute_color, 0.85),\n"
  "                            flute_tone.x + flute_tone.y * flute_l);\n"
  "  float flute_normal = flute_t / sqrt (max (1.0 - 0.9 * flute_t * flute_t, 0.1));\n"
  "  float flute_crest = (flute_t + 0.3) / 0.16;\n"
  "  float flute_glint = mix (0.4, 1.0, flute_depth) * exp (-flute_crest * flute_crest) *\n"
  "                      (0.03 + 0.09 * flute_l);\n"
  "  float flute_edge = flute_t * flute_t;\n"
  "  float flute_seam = flute_edge * flute_edge * flute_edge * flute_edge;\n"
  "  float flute_shade = flute_depth * (0.02 * clamp (flute_normal, -2.0, 2.0) +\n"
  "                                     0.05 * flute_edge * flute_edge) + 0.04 * flute_seam;\n"
  "  flute_out = mix (flute_out, vec3 (1.0), flute_glint) -\n"
  "              flute_shade * max (lum (flute_out), 0.3);\n"
  "  cogl_color_out = vec4 (clamp (flute_out, 0.0, 1.0) * flute_texel.a, flute_texel.a);\n";

CoglSnippet *
shell_blur_fluted_snippet (const char *declarations,
                           const char *source)
{
  g_autofree char *all_declarations = g_strconcat (declarations, flutes_glsl_declarations, NULL);
  g_autofree char *all_source = g_strconcat (flutes_glsl, source, NULL);

  return cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT, all_declarations, all_source);
}

static gboolean
is_light (const CoglColor *surface)
{
  return 0.3f * cogl_color_get_red (surface) +
         0.59f * cogl_color_get_green (surface) +
         0.11f * cogl_color_get_blue (surface) > 0.5f;
}

void
shell_blur_set_flutes (CoglPipeline    *pipeline,
                       const CoglColor *surface)
{
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "flute_tone"),
                                   2, 1, is_light (surface) ? light_tone : dark_tone);
}
