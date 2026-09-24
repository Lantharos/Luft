/* SPDX-License-Identifier: GPL-2.0-or-later */
#include "config.h"

#include <math.h>

#include "clutter/clutter-mutter.h"
#include "compositor/meta-window-corners.h"
#include "compositor/meta-shaped-texture-private.h"
#include "meta/meta-window-actor.h"
#include "meta/window.h"

MetaWindowCorners
meta_window_corners_for_actor (ClutterActor *actor)
{
  MetaWindowCorners corners = { 0 };
  ClutterActor *ancestor = clutter_actor_get_parent (actor);
  MetaWindow *window;
  MtkRectangle frame, buffer;
  graphene_matrix_t transform, inverse;
  graphene_rect_t bounds;
  float scale;
  int border;

  while (ancestor && !META_IS_WINDOW_ACTOR (ancestor))
    ancestor = clutter_actor_get_parent (ancestor);
  if (!ancestor)
    return corners;

  window = meta_window_actor_get_meta_window (META_WINDOW_ACTOR (ancestor));
  if (!window || meta_window_is_fullscreen (window))
    return corners;

  switch (meta_window_get_window_type (window))
    {
    case META_WINDOW_DESKTOP:
    case META_WINDOW_DOCK:
    case META_WINDOW_DND:
      return corners;
    default:
      break;
    }

  meta_window_get_frame_rect (window, &frame);
  meta_window_get_buffer_rect (window, &buffer);
  if (frame.width <= 0 || frame.height <= 0 ||
      buffer.width <= 0 || buffer.height <= 0)
    return corners;

  clutter_actor_get_relative_transformation_matrix (actor, ancestor, &transform);
  if (!graphene_matrix_inverse (&transform, &inverse))
    return corners;
  border = MIN (1, MIN (MIN (frame.x - buffer.x, frame.y - buffer.y),
                         MIN (buffer.x + buffer.width - frame.x - frame.width,
                              buffer.y + buffer.height - frame.y - frame.height)));
  border = MAX (border, 0);
  bounds = GRAPHENE_RECT_INIT (frame.x - buffer.x - border,
                               frame.y - buffer.y - border,
                               frame.width + 2 * border, frame.height + 2 * border);
  graphene_matrix_transform_bounds (&inverse, &bounds, &corners.bounds);
  scale = corners.bounds.size.width / bounds.size.width;
  if (meta_window_get_client_type (window) == META_WINDOW_CLIENT_TYPE_X11)
    {
      MetaShapedTexture *texture =
        meta_window_actor_get_texture (META_WINDOW_ACTOR (ancestor));
      float x_scale = (float) meta_shaped_texture_get_width (texture) / buffer.width;
      float y_scale = (float) meta_shaped_texture_get_height (texture) / buffer.height;

      corners.bounds = GRAPHENE_RECT_INIT (bounds.origin.x * x_scale,
                                           bounds.origin.y * y_scale,
                                           bounds.size.width * x_scale,
                                           bounds.size.height * y_scale);
    }
  corners.radius = MIN (12.0f * scale,
                         MIN (corners.bounds.size.width,
                              corners.bounds.size.height) / 2.0f);
  return corners;
}

void
meta_window_corners_apply (const MetaWindowCorners *corners,
                           CoglPipeline            *pipeline,
                           int                      width,
                           int                      height)
{
  static CoglSnippet *vertex_snippet;
  static CoglSnippet *fragment_snippet;
  float bounds[4];
  int location;

  if (corners->radius == 0)
    return;

  if (!vertex_snippet)
    {
      vertex_snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_VERTEX,
        "varying vec2 kestrel_position; uniform vec2 kestrel_size;",
        "kestrel_position = cogl_tex_coord0_in.xy * kestrel_size;");
      fragment_snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT,
        "varying vec2 kestrel_position;\n"
        "uniform vec4 kestrel_bounds;\n"
        "uniform float kestrel_radius;\n",
        "vec2 half_size = kestrel_bounds.zw * 0.5;\n"
        "vec2 p = abs(kestrel_position - kestrel_bounds.xy - half_size);\n"
        "vec2 q = p - half_size + kestrel_radius;\n"
        "if (all(greaterThan(q, vec2(0.0))) && all(lessThan(p, half_size))) {\n"
        "  float distance = length(q) - kestrel_radius;\n"
        "  float aa = max(fwidth(distance), 0.001);\n"
        "  cogl_color_out *= 1.0 - smoothstep(-aa * 0.5, aa * 0.5, distance);\n"
        "}\n");
    }

  cogl_pipeline_add_snippet (pipeline, vertex_snippet);
  cogl_pipeline_add_snippet (pipeline, fragment_snippet);
  bounds[0] = width;
  bounds[1] = height;
  location = cogl_pipeline_get_uniform_location (pipeline, "kestrel_size");
  cogl_pipeline_set_uniform_float (pipeline, location, 2, 1, bounds);
  cogl_pipeline_set_blend (pipeline, "RGBA = ADD (SRC_COLOR, DST_COLOR * (1-SRC_COLOR[A]))", NULL);
  bounds[0] = corners->bounds.origin.x;
  bounds[1] = corners->bounds.origin.y;
  bounds[2] = corners->bounds.size.width;
  bounds[3] = corners->bounds.size.height;
  location = cogl_pipeline_get_uniform_location (pipeline, "kestrel_bounds");
  cogl_pipeline_set_uniform_float (pipeline, location, 4, 1, bounds);
  location = cogl_pipeline_get_uniform_location (pipeline, "kestrel_radius");
  cogl_pipeline_set_uniform_1f (pipeline, location, corners->radius);
}

static void
subtract_corners (const MetaWindowCorners *corners,
                  MtkRegion               *region,
                  float                    top,
                  float                    bottom,
                  float                    width)
{
  float x1 = corners->bounds.origin.x;
  float y1 = corners->bounds.origin.y;
  float x2 = x1 + corners->bounds.size.width;
  float y2 = y1 + corners->bounds.size.height;
  float positions[4][4] = {
    { x1, y1 + top, x1 + width, y1 + bottom },
    { x2 - width, y1 + top, x2, y1 + bottom },
    { x1, y2 - bottom, x1 + width, y2 - top },
    { x2 - width, y2 - bottom, x2, y2 - top },
  };

  for (int i = 0; i < 4; i++)
    {
      MtkRectangle rect = {
        .x = floorf (positions[i][0]),
        .y = floorf (positions[i][1]),
        .width = ceilf (positions[i][2]) - floorf (positions[i][0]),
        .height = ceilf (positions[i][3]) - floorf (positions[i][1]),
      };
      mtk_region_subtract_rectangle (region, &rect);
    }
}

void
meta_window_corners_subtract_opaque (const MetaWindowCorners *corners,
                                     MtkRegion               *region)
{
  if (corners->radius > 0)
    subtract_corners (corners, region, 0, corners->radius, corners->radius);
}

void
meta_window_corners_clip_input (const MetaWindowCorners *corners,
                                MtkRegion               *region)
{
  float radius = corners->radius;

  for (int y = 0; y < floorf (radius); y++)
    {
      float distance = radius - (y + 0.5f);
      float width = floorf (radius - sqrtf (radius * radius - distance * distance));

      if (width > 0)
        subtract_corners (corners, region, y, y + 1, width);
    }
}
