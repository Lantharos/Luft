/* shell-blur-vesa.c
 *
 * The bend along the edge of Vesa glass started as a GLSL port of liquidass
 * 0.1.1b (Tweak.mm kShaderSrc) from Liquid (Gl)ass by winaviation
 * (https://github.com/winaviation-tweaks/liquid-ass), by way of Blur my
 * Shell's Liquid Glass effect (https://github.com/aunetx/blur-my-shell).
 *
 * The copyright holder explicitly granted, in email and in pull request #987
 * (2026-09-10), that this ported shader file may be re-licensed and
 * redistributed under the GNU GPL v3 for Blur my Shell, with the same rights
 * extending to anyone who reuses it from this repository. The original
 * upstream project remains licensed under CC BY-NC 4.0
 * (https://creativecommons.org/licenses/by-nc/4.0/).
 *
 * The widened bend around rounded corners is Blur my Shell's, not part of
 * the original shader.
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

#include "shell-blur-vesa.h"

#include <string.h>

#include "st.h"

#define LENSES 16

static const char *vesa_declarations =
"uniform float vesa;\n"

"uniform sampler2D vesa_texture;\n"
"uniform vec4 vesa_sample_map;\n"
"uniform vec4 vesa_sample_bounds;\n"
"uniform vec4 vesa_open;\n"
"uniform vec4 vesa_room;\n"
"uniform int vesa_lens_count;\n"
"uniform vec4 vesa_lens_box[" G_STRINGIFY (LENSES) "];\n"
"uniform vec4 vesa_lens_clip[" G_STRINGIFY (LENSES) "];\n"
"uniform vec2 vesa_lens_shape[" G_STRINGIFY (LENSES) "];\n"
"const float VESA_BEZEL_SHARE = " G_STRINGIFY (SHELL_BLUR_VESA_BEZEL_SHARE) ";\n"
"const float VESA_BEZEL_MIN = " G_STRINGIFY (SHELL_BLUR_VESA_BEZEL_MIN) ";\n"
"const float VESA_BEZEL_MAX = " G_STRINGIFY (SHELL_BLUR_VESA_BEZEL_MAX) ";\n"
"const float VESA_BEZEL_FIT = " G_STRINGIFY (SHELL_BLUR_VESA_BEZEL_FIT) ";\n"
"const float VESA_REACH = " G_STRINGIFY (SHELL_BLUR_VESA_REACH) ";\n"
"const float VESA_INNER_BEZEL_MIN = 5.0;\n"
"const float VESA_INNER_BEZEL_MAX = 10.0;\n"
"const float VESA_INNER_REACH = 1.2;\n"
"const float VESA_FRINGING = " G_STRINGIFY (SHELL_BLUR_VESA_FRINGING) ";\n"
"const float VESA_WIDEST_FRINGE = " G_STRINGIFY (SHELL_BLUR_VESA_WIDEST_FRINGE) ";\n"
"const float VESA_STEEPEST = 0.9;\n"
"const float VESA_CLOSED = 10000.0;\n"
"const vec2 VESA_LIGHT = vec2(-0.7071, -0.7071);\n"
"const float VESA_RIM = 1.2;\n"
"const float VESA_FOCUS = 3.0;\n"
"const float VESA_SWEEP = 1.5;\n"
"const float VESA_RETURN = 0.6;\n"
"const float VESA_AMBIENT = 0.14;\n"
"const float VESA_SHINE = 0.7;\n"
"const float VESA_INNER_SHINE = 0.66;\n"
"const float VESA_GLOW = 0.78;\n"
"const float VESA_GLOW_CHROMA = 1.3;\n"
"const float VESA_WHITE = 0.115;\n"
"const float VESA_GROOVE = 0.23;\n"
"vec4 vesa_edge;\n"
"vec3 vesa_lens;\n"
"vec4 vesa_inner;\n"
"float vesa_inner_bezel;\n"
"vec2 vesa_inner_aim;\n"
"vec2 vesa_normal;\n"
"vec2 vesa_point;\n"
"vec2 vesa_half;\n"
"vec4 vesa_sample (vec2 position) {\n"
"  vec2 uv = vesa_sample_map.xy + position * vesa_sample_map.zw;\n"
"  return texture2D(vesa_texture, clamp(uv, vesa_sample_bounds.xy, vesa_sample_bounds.zw));\n"
"}\n"
"float vesa_luma (vec3 color) {\n"
"  return dot(color, vec3(0.2126, 0.7152, 0.0722));\n"
"}\n"
"float vesa_box (vec2 q, float radius) {\n"
"  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\n"
"}\n"
"vec2 vesa_outward (vec2 p, vec2 core, vec2 q) {\n"
"  vec2 delta = p - clamp(p, -core, core);\n"
"  return dot(delta, delta) > 1e-6 ? normalize(delta) :\n"
"    (q.x > q.y ? vec2(sign(p.x), 0.0) : vec2(0.0, sign(p.y)));\n"
"}\n"
"vec3 vesa_band_edge (vec2 p, float radius, float band, float distance, vec2 normal) {\n"
"  vec2 core = max(vesa_half - vec2(band), vec2(0.0));\n"
"  vec2 delta = max(abs(p) - core, vec2(0.0));\n"
"  float reach = length(delta);\n"
"  if (reach < 0.001)\n"
"    return vec3(distance, normal);\n"
"  vec2 ray = delta / reach;\n"
"  vec2 side_hits = (vesa_half - core) / max(ray, vec2(0.0001));\n"
"  float hit = min(side_hits.x, side_hits.y);\n"
"  vec2 arc_center = vesa_half - vec2(radius);\n"
"  vec2 point = core + ray * hit;\n"
"  if (point.x > arc_center.x && point.y > arc_center.y) {\n"
"    vec2 from_arc = core - arc_center;\n"
"    float b = dot(from_arc, ray);\n"
"    hit = -b + sqrt(max(b * b - dot(from_arc, from_arc) + radius * radius, 0.0));\n"
"  }\n"
"  return vec3(max(hit - reach, 0.0), sign(p) * ray);\n"
"}\n"
"vec4 vesa_find_edge () {\n"
"  vec4 grown = (1.0 - vesa_open) * VESA_CLOSED;\n"
"  vesa_half = (surface_size + grown.xy + grown.zw) * 0.5;\n"
"  vesa_point = surface_position + grown.xy - vesa_half;\n"
"  float narrow = min(surface_size.x, surface_size.y);\n"
"  float r = min(corner_radius, narrow * 0.5);\n"
"  vec2 core = max(vesa_half - vec2(r), vec2(0.0));\n"
"  vec2 q = abs(vesa_point) - core;\n"
"  float d = vesa_box(q, r);\n"
"  vesa_normal = vesa_outward(vesa_point, core, q);\n"
"  float band = min(clamp(r * VESA_BEZEL_SHARE, VESA_BEZEL_MIN, VESA_BEZEL_MAX), narrow * VESA_BEZEL_FIT);\n"
"  vesa_lens = vesa_band_edge(vesa_point, r, band, max(-d, 0.0), vesa_normal);\n"
"  return vec4(max(-d, 0.0), band, vesa_normal);\n"
"}\n"
"void vesa_find_inner () {\n"
"  vesa_inner = vec4(1.0, 0.0, 0.0, 0.0);\n"
"  vesa_inner_bezel = 1.0;\n"
"  for (int i = 0; i < " G_STRINGIFY (LENSES) "; i++) {\n"
"    if (i >= vesa_lens_count)\n"
"      break;\n"
"    vec4 box = vesa_lens_box[i];\n"
"    vec4 clip = vesa_lens_clip[i];\n"
"    vec2 p = surface_position - box.xy;\n"
"    vec2 outside = abs(p) - box.zw;\n"
"    if (max(outside.x, outside.y) >= 1.0 ||\n"
"        any(lessThan(surface_position, clip.xy)) || any(greaterThan(surface_position, clip.zw)))\n"
"      continue;\n"
"    float narrow = min(box.z, box.w);\n"
"    float r = min(vesa_lens_shape[i].x, narrow);\n"
"    vec2 core = box.zw - vec2(r);\n"
"    vec2 q = abs(p) - core;\n"
"    float d = vesa_box(q, r);\n"
"    float covered = clamp(0.5 - d * vesa, 0.0, 1.0);\n"
"    if (covered <= 0.0)\n"
"      continue;\n"
"    vesa_inner = vec4(max(-d, 0.0), vesa_outward(p, core, q), vesa_lens_shape[i].y * covered);\n"
"    vesa_inner_aim = p / box.zw;\n"
"    vesa_inner_bezel = min(clamp(r * VESA_BEZEL_SHARE, VESA_INNER_BEZEL_MIN, VESA_INNER_BEZEL_MAX), narrow);\n"
"    break;\n"
"  }\n"
"}\n"
"vec2 vesa_bend (float inside, float bezel, vec2 normal) {\n"
"  float x = VESA_STEEPEST * (1.0 - clamp(inside / bezel, 0.0, 1.0));\n"
"  return normal * (1.0 - sqrt(1.0 - x * x)) / (1.0 - sqrt(1.0 - VESA_STEEPEST * VESA_STEEPEST)) * bezel;\n"
"}\n"
"float vesa_fit (float inside, vec2 normal, float reach) {\n"
"  vec2 uv = vesa_sample_map.xy + surface_position * vesa_sample_map.zw;\n"
"  vec2 stride = normal * vesa_sample_map.zw;\n"
"  vec2 ahead = step(0.0, normal);\n"
"  vec2 sampled = mix(uv - vesa_sample_bounds.xy, vesa_sample_bounds.zw - uv, ahead) /\n"
"    max(abs(stride), vec2(1e-6));\n"
"  vec2 clear = mix(surface_position + vesa_room.xy, surface_size + vesa_room.zw - surface_position, ahead) /\n"
"    max(abs(normal), vec2(1e-6));\n"
"  vec2 room = min(sampled, clear);\n"
"  return clamp((min(room.x, room.y) - inside) / reach, 0.0, 1.0);\n"
"}\n"
"vec4 vesa_refract () {\n"
"  vec2 shift = vesa_bend(vesa_lens.x, vesa_edge.y, vesa_lens.yz) * VESA_REACH *\n"
"    vesa_fit(vesa_lens.x, vesa_lens.yz, vesa_edge.y * VESA_REACH) +\n"
"    vesa_bend(vesa_inner.x, vesa_inner_bezel, vesa_inner.yz) * VESA_INNER_REACH * vesa_inner.w;\n"
"  vec2 fringe = shift * min(VESA_FRINGING, VESA_WIDEST_FRINGE / max(length(shift), 0.001));\n"
"  vec4 green = vesa_sample(surface_position + shift);\n"
"  return vec4(vesa_sample(surface_position + shift + fringe).r, green.g,\n"
"              vesa_sample(surface_position + shift - fringe).b, green.a);\n"
"}\n"
"vec3 vesa_rim (vec3 color, float inside, vec2 normal, vec2 aim, float shine) {\n"
"  float width = max(VESA_RIM, 1.5 / vesa);\n"
"  if (inside > width * 4.0)\n"
"    return color;\n"
"  float facing = dot(normalize(normal + aim * VESA_SWEEP), VESA_LIGHT);\n"
"  float lobe = pow(abs(facing), VESA_FOCUS) * (facing > 0.0 ? 1.0 : VESA_RETURN);\n"
"  float line = clamp(1.0 - inside / width, 0.0, 1.0) +\n"
"    0.21 * clamp(1.0 - inside / (4.0 * width), 0.0, 1.0);\n"
"  float luma = vesa_luma(color);\n"
"  float groove = smoothstep(0.5 * width, 1.5 * width, inside) *\n"
"    (1.0 - smoothstep(1.5 * width, 3.5 * width, inside));\n"
"  float shade = groove * VESA_GROOVE * smoothstep(0.45, 0.85, luma) * (1.0 - lobe) * shine;\n"
"  color = mix(vec3(luma), color, 1.0 + shade) * (1.0 - shade);\n"
"  float peak = max(max(color.r, color.g), color.b);\n"
"  vec3 hue = mix(vec3(1.0), color / max(peak, 0.001), smoothstep(0.0, 0.08, peak));\n"
"  hue = mix(vec3(vesa_luma(hue)), hue, VESA_GLOW_CHROMA);\n"
"  vec3 glare = mix(mix(color, hue, VESA_GLOW), vec3(1.0), VESA_WHITE * lobe * lobe);\n"
"  float lit = line * mix(VESA_AMBIENT, 1.0, lobe) * shine;\n"
"  return clamp(mix(color, glare, min(lit, 1.0)), 0.0, 1.0);\n"
"}\n"
"vec3 vesa_light (vec3 color) {\n"
"  if (vesa_open == vec4(1.0))\n"
"    color = vesa_rim(color, vesa_edge.x, vesa_normal, vesa_point / vesa_half, VESA_SHINE);\n"
"  if (vesa_inner.w > 0.0)\n"
"    color = vesa_rim(color, vesa_inner.x, vesa_inner.yz, vesa_inner_aim, VESA_INNER_SHINE * vesa_inner.w);\n"
"  return color;\n"
"}\n";

static const char *vesa_refraction =
"  if (vesa > 0.0) {\n"
"    vesa_edge = vesa_find_edge();\n"
"    vesa_find_inner();\n"
"    if (vesa_lens.x < vesa_edge.y || vesa_inner.x < vesa_inner_bezel)\n"
"      cogl_color_out = vesa_refract() * cogl_color_in;\n"
"  }\n";

static const char *vesa_lighting =
"  if (vesa > 0.0 && cogl_color_out.a > 0.0)\n"
"    cogl_color_out.rgb = vesa_light(cogl_color_out.rgb / cogl_color_out.a) *\n"
"                         cogl_color_out.a;\n";

float
shell_blur_vesa_reach (float corner_radius,
                       float width,
                       float height)
{
  float narrow = MIN (width, height);
  float radius = MIN (corner_radius, narrow / 2.f);
  float bezel = MIN (CLAMP (radius * SHELL_BLUR_VESA_BEZEL_SHARE,
                            SHELL_BLUR_VESA_BEZEL_MIN, SHELL_BLUR_VESA_BEZEL_MAX),
                     narrow * SHELL_BLUR_VESA_BEZEL_FIT);

  return bezel * SHELL_BLUR_VESA_REACH + SHELL_BLUR_VESA_WIDEST_FRINGE;
}

void
shell_blur_vesa_add_refraction (CoglPipeline *pipeline)
{
  static CoglSnippet *snippet;

  if (!snippet)
    snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT, vesa_declarations, vesa_refraction);

  cogl_pipeline_add_snippet (pipeline, snippet);
}

void
shell_blur_vesa_add_lighting (CoglPipeline *pipeline)
{
  static CoglSnippet *snippet;

  if (!snippet)
    snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT, NULL, vesa_lighting);

  cogl_pipeline_add_snippet (pipeline, snippet);
  cogl_pipeline_set_uniform_1i (pipeline,
                                cogl_pipeline_get_uniform_location (pipeline, "vesa_texture"),
                                0);
}

static void
box_within (ClutterActor          *actor,
            ClutterActor          *surface,
            const ClutterActorBox *box,
            ClutterActorBox       *within)
{
  graphene_point3d_t start = GRAPHENE_POINT3D_INIT (box->x1, box->y1, 0.f);
  graphene_point3d_t end = GRAPHENE_POINT3D_INIT (box->x2, box->y2, 0.f);

  clutter_actor_apply_relative_transform_to_point (actor, surface, &start, &start);
  clutter_actor_apply_relative_transform_to_point (actor, surface, &end, &end);
  *within = (ClutterActorBox) { start.x, start.y, end.x, end.y };
}

static gboolean
view_box (ClutterActor    *actor,
          ClutterActorBox *box)
{
  StAdjustment *horizontal, *vertical;
  ClutterActorBox allocation;
  float x, y;

  if (!ST_IS_VIEWPORT (actor) || !st_viewport_get_clip_to_view (ST_VIEWPORT (actor)))
    return FALSE;

  st_scrollable_get_adjustments (ST_SCROLLABLE (actor), &horizontal, &vertical);
  if (!horizontal && !vertical)
    return FALSE;

  clutter_actor_get_allocation_box (actor, &allocation);
  st_theme_node_get_content_box (st_widget_get_theme_node (ST_WIDGET (actor)), &allocation, box);
  x = (horizontal ? st_adjustment_get_value (horizontal) : 0.f) - allocation.x1;
  y = (vertical ? st_adjustment_get_value (vertical) : 0.f) - allocation.y1;
  box->x1 += x;
  box->x2 += x;
  box->y1 += y;
  box->y2 += y;
  return TRUE;
}

static void
clip_within (ClutterActor    *lens,
             ClutterActor    *surface,
             ClutterActorBox *clip)
{
  ClutterActor *ancestor;

  clutter_actor_get_size (surface, &clip->x2, &clip->y2);
  clip->x1 = 0.f;
  clip->y1 = 0.f;
  for (ancestor = clutter_actor_get_parent (lens); ancestor != surface;
       ancestor = clutter_actor_get_parent (ancestor))
    {
      ClutterActorBox view, shown;

      if (!view_box (ancestor, &view))
        continue;

      box_within (ancestor, surface, &view, &shown);
      clip->x1 = MAX (clip->x1, shown.x1);
      clip->y1 = MAX (clip->y1, shown.y1);
      clip->x2 = MIN (clip->x2, shown.x2);
      clip->y2 = MIN (clip->y2, shown.y2);
    }
}

static unsigned int
place_lenses (ClutterActor *surface,
              GPtrArray    *lenses,
              float        *boxes,
              float        *clips,
              float        *shapes)
{
  unsigned int count = 0;
  unsigned int i;

  for (i = 0; i < lenses->len && count < LENSES; i++)
    {
      ClutterActor *lens = g_ptr_array_index (lenses, i);
      ClutterActorBox own = { 0 }, box, clip;
      StThemeNode *node;

      if (!clutter_actor_is_mapped (lens) || !clutter_actor_contains (surface, lens))
        continue;

      clutter_actor_get_size (lens, &own.x2, &own.y2);
      if (own.x2 <= 0.f || own.y2 <= 0.f)
        continue;

      box_within (lens, surface, &own, &box);
      clip_within (lens, surface, &clip);
      if (MAX (clip.x1, box.x1) >= MIN (clip.x2, box.x2) ||
          MAX (clip.y1, box.y1) >= MIN (clip.y2, box.y2))
        continue;

      node = st_widget_get_theme_node (ST_WIDGET (lens));
      boxes[count * 4] = (box.x1 + box.x2) / 2.f;
      boxes[count * 4 + 1] = (box.y1 + box.y2) / 2.f;
      boxes[count * 4 + 2] = (box.x2 - box.x1) / 2.f;
      boxes[count * 4 + 3] = (box.y2 - box.y1) / 2.f;
      memcpy (&clips[count * 4], &clip, sizeof (ClutterActorBox));
      shapes[count * 2] = st_theme_node_get_border_radius (node, ST_CORNER_TOPLEFT) *
        (box.x2 - box.x1) / own.x2;
      shapes[count * 2 + 1] = clutter_actor_get_paint_opacity (lens) /
        (float) MAX (clutter_actor_get_paint_opacity (surface), 1);
      count++;
    }

  return count;
}

static void
set_lenses (CoglPipeline *pipeline,
            ClutterActor *surface,
            GPtrArray    *lenses)
{
  float boxes[LENSES * 4], clips[LENSES * 4], shapes[LENSES * 2];
  unsigned int count = place_lenses (surface, lenses, boxes, clips, shapes);

  cogl_pipeline_set_uniform_1i (pipeline,
                                cogl_pipeline_get_uniform_location (pipeline, "vesa_lens_count"),
                                count);
  if (count == 0)
    return;

  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_lens_box"),
                                   4, count, boxes);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_lens_clip"),
                                   4, count, clips);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_lens_shape"),
                                   2, count, shapes);
}

void
shell_blur_vesa_set_uniforms (CoglPipeline *pipeline,
                              float         scale,
                              const float  *map,
                              const float  *extent,
                              const float  *bounds,
                              const float  *open,
                              const float  *room,
                              ClutterActor *surface,
                              GPtrArray    *lenses)
{
  float sample_map[4] = {
    -map[0] * extent[0] / map[2],
    -map[1] * extent[1] / map[3],
    extent[0] / map[2],
    extent[1] / map[3],
  };

  cogl_pipeline_set_uniform_1f (pipeline,
                                cogl_pipeline_get_uniform_location (pipeline, "vesa"),
                                scale);
  if (scale <= 0.f)
    return;

  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_sample_map"),
                                   4, 1, sample_map);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_sample_bounds"),
                                   4, 1, bounds);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_open"),
                                   4, 1, open);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "vesa_room"),
                                   4, 1, room);
  set_lenses (pipeline, surface, lenses);
}
