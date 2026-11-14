/* shell-blur-outline.c
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

#include <meta/display.h>
#include <mtk/mtk.h>

#include "shell-blur-outline.h"
#include "shell-global.h"

static CoglContext *
cogl_context_of (ClutterActor *actor)
{
  ClutterBackend *backend = clutter_context_get_backend (clutter_actor_get_context (actor));

  return clutter_backend_get_cogl_context (backend);
}

static CoglPipeline *
create_outline_pipeline (CoglContext *ctx)
{
  static CoglPipelineKey outline_pipeline_key = "shell-blur-effect-outline";
  CoglPipeline *pipeline =
    cogl_context_get_named_pipeline (ctx, &outline_pipeline_key);

  if (G_UNLIKELY (pipeline == NULL))
    {
      CoglSnippet *snippet;

      pipeline = cogl_pipeline_new (ctx);
      cogl_pipeline_set_layer_null_texture (pipeline, 0);
      snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_VERTEX,
        "varying vec2 outline_position;\n",
        "outline_position = cogl_tex_coord0_in.xy;\n");
      cogl_pipeline_add_snippet (pipeline, snippet);
      g_object_unref (snippet);
      snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT,
        "varying vec2 outline_position;\n"
        "uniform vec4 outline_bounds;\n"
        "uniform float outline_radius;\n",
        "vec2 half_size = outline_bounds.zw * 0.5;\n"
        "vec2 q = abs(outline_position - outline_bounds.xy - half_size) - half_size + outline_radius;\n"
        "float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - outline_radius;\n"
        "float aa = max(fwidth(d), 0.001);\n"
        "float outside = smoothstep(-aa * 0.5, aa * 0.5, d);\n"
        "float inside = smoothstep(-aa * 0.5, aa * 0.5, d + 1.0);\n"
        "cogl_color_out *= inside - outside;\n");
      cogl_pipeline_add_snippet (pipeline, snippet);
      g_object_unref (snippet);
      cogl_context_set_named_pipeline (ctx, &outline_pipeline_key, pipeline);
    }

  return cogl_pipeline_copy (pipeline);
}

static void
add_outline_band (ClutterPaintNode *node,
                  float             x1,
                  float             y1,
                  float             x2,
                  float             y2)
{
  clutter_paint_node_add_texture_rectangle (node,
                                            &(ClutterActorBox) { x1, y1, x2, y2 },
                                            x1, y1, x2, y2);
}

typedef enum
{
  SIDE_TOP = 1 << 0,
  SIDE_BOTTOM = 1 << 1,
  SIDE_LEFT = 1 << 2,
  SIDE_RIGHT = 1 << 3,
} Sides;

/* The sides of the surface that don't lie against an edge of its monitor */
static Sides
exposed_sides (ClutterActor *actor)
{
  MetaDisplay *display = shell_global_get_display (shell_global_get ());
  graphene_rect_t extents;
  MtkRectangle rect, monitor;
  Sides sides = 0;
  int index;

  clutter_actor_get_transformed_extents (actor, &extents);
  rect = (MtkRectangle) {
    (int) floorf (extents.origin.x), (int) floorf (extents.origin.y),
    (int) ceilf (extents.size.width), (int) ceilf (extents.size.height),
  };
  index = meta_display_get_monitor_index_for_rect (display, &rect);
  if (index < 0)
    return SIDE_TOP | SIDE_BOTTOM | SIDE_LEFT | SIDE_RIGHT;

  meta_display_get_monitor_geometry (display, index, &monitor);
  if (extents.origin.y > monitor.y + 0.5f)
    sides |= SIDE_TOP;
  if (extents.origin.y + extents.size.height < monitor.y + monitor.height - 0.5f)
    sides |= SIDE_BOTTOM;
  if (extents.origin.x > monitor.x + 0.5f)
    sides |= SIDE_LEFT;
  if (extents.origin.x + extents.size.width < monitor.x + monitor.width - 0.5f)
    sides |= SIDE_RIGHT;
  return sides;
}

/* The neutral line windows get along their edge, on top of the surface,
 * leaving out the sides that lie against the screen's edge */
void
shell_blur_add_outline (ClutterActor     *actor,
                        ClutterPaintNode *node,
                        float             corner_radius,
                        uint8_t           paint_opacity)
{
  g_autoptr (CoglPipeline) pipeline = NULL;
  g_autoptr (ClutterPaintNode) outline_node = NULL;
  float width, height, radius, band, alpha, top, bottom, reach;
  float bounds[4];
  CoglColor color;
  Sides sides;

  clutter_actor_get_size (actor, &width, &height);
  if (width < 2 || height < 2 || paint_opacity == 0)
    return;

  sides = exposed_sides (actor);
  if (sides == 0)
    return;

  radius = MIN (MAX (corner_radius, 0), MIN (width, height) / 2.0f);
  band = MIN (MAX (ceilf (radius) + 1.0f, 2.0f), height / 2.0f);
  alpha = 0.3f * paint_opacity / 255.0f;
  /* Push the shape past the sides that get no line, so its edge never
   * shows there */
  reach = 2.0f * (radius + 2.0f);
  bounds[0] = sides & SIDE_LEFT ? 0 : -reach;
  bounds[1] = sides & SIDE_TOP ? 0 : -reach;
  bounds[2] = width - bounds[0] + (sides & SIDE_RIGHT ? 0 : reach);
  bounds[3] = height - bounds[1] + (sides & SIDE_BOTTOM ? 0 : reach);

  pipeline = create_outline_pipeline (cogl_context_of (actor));
  cogl_color_init_from_4f (&color, 0.5f * alpha, 0.5f * alpha, 0.5f * alpha, alpha);
  cogl_pipeline_set_color (pipeline, &color);
  cogl_pipeline_set_uniform_float (pipeline,
                                   cogl_pipeline_get_uniform_location (pipeline, "outline_bounds"),
                                   4, 1, bounds);
  cogl_pipeline_set_uniform_1f (pipeline,
                                cogl_pipeline_get_uniform_location (pipeline, "outline_radius"),
                                radius);

  outline_node = clutter_pipeline_node_new (pipeline);
  clutter_paint_node_set_static_name (outline_node, "ShellBlurEffect (outline)");
  clutter_paint_node_add_child (node, outline_node);
  top = sides & SIDE_TOP ? band : 0;
  bottom = sides & SIDE_BOTTOM ? height - band : height;
  if (sides & SIDE_TOP)
    add_outline_band (outline_node, 0, 0, width, top);
  if (sides & SIDE_BOTTOM)
    add_outline_band (outline_node, 0, bottom, width, height);
  if (bottom > top)
    {
      if (sides & SIDE_LEFT)
        add_outline_band (outline_node, 0, top, 2, bottom);
      if (sides & SIDE_RIGHT)
        add_outline_band (outline_node, width - 2, top, width, bottom);
    }
}
