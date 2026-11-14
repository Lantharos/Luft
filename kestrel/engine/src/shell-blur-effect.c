/* shell-blur-effect.c
 *
 * Copyright 2019 Georges Basile Stavracas Neto <georges.stavracas@gmail.com>
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

#include <meta/compositor.h>
#include <meta/display.h>
#include <mtk/mtk.h>

#include "shell-blur-effect.h"
#include "shell-backdrop.h"
#include "shell-blur-outline.h"
#include "shell-global.h"

#include "shell-enum-types.h"
#include "st.h"

/**
 * ShellBlurEffect:
 *
 * Blur effect for actors
 *
 * #ShellBlurEffect is a blur implementation based on Clutter. It also has
 * an optional brightness property.
 *
 * # Modes
 *
 * #ShellBlurEffect can work in @SHELL_BLUR_MODE_BACKGROUND and @SHELL_BLUR_MODE_ACTOR
 * modes. The actor mode blurs the actor itself, and all of its children. The
 * background mode blurs the pixels beneath the actor, but not the actor itself.
 *
 * In @SHELL_BLUR_MODE_BACKGROUND, the @SHELL_BLUR_STYLE_LUCA style blurs what
 * is beneath the actor again whenever it changes, and keeps the result while it
 * doesn't. @SHELL_BLUR_STYLE_WALLPAPER shows the compositor's blurred wallpaper
 * instead, and @SHELL_BLUR_STYLE_MARIS its wide one under the glass surface
 * colour, see meta_compositor_add_frosted_wallpaper().
 */

static const gchar *position_glsl_declarations =
"uniform vec4 surface_map;                                                 \n"
"varying vec2 surface_position;                                            \n";

static const gchar *position_glsl =
"  surface_position = surface_map.xy + cogl_tex_coord0_in.xy * surface_map.zw; \n";

static const gchar *brightness_glsl_declarations =
"varying vec2 surface_position;                                            \n"
"uniform float brightness;                                                 \n"
"uniform vec2 surface_size;                                                \n"
"uniform float corner_radius;                                              \n"
"uniform float bright_dim;                                                 \n"
"uniform float dark_lift;                                                  \n"
"uniform float saturation;                                                 \n"
"uniform vec4 surface_tint;                                                \n"
"uniform float grain;                                                      \n"
"uniform float pixel_scale;                                                \n";

static const gchar *brightness_glsl =
"  cogl_color_out.rgb *= brightness;                                       \n"
"  float luma = dot(cogl_color_out.rgb, vec3(0.2126, 0.7152, 0.0722)) /    \n"
"               max(cogl_color_out.a, 0.001);                             \n"
"  cogl_color_out.rgb *= 1.0 - bright_dim * smoothstep(0.3, 0.95, luma);   \n"
"  cogl_color_out.rgb = mix(cogl_color_out.rgb, vec3(cogl_color_out.a),     \n"
"                           dark_lift * (1.0 - smoothstep(0.1, 0.9, luma))); \n"
"  float lifted = dot(cogl_color_out.rgb, vec3(0.2126, 0.7152, 0.0722));    \n"
"  cogl_color_out.rgb = clamp(mix(vec3(lifted), cogl_color_out.rgb,         \n"
"                                 saturation), 0.0, cogl_color_out.a);      \n"
"  cogl_color_out.rgb = mix(cogl_color_out.rgb,                            \n"
"                           surface_tint.rgb * cogl_color_out.a,           \n"
"                           surface_tint.a);                               \n"
"  float noise = texture2D(cogl_sampler1,                                  \n"
"    (mod(floor(surface_position * pixel_scale), 64.0) + 0.5) / 64.0).r;   \n"
"  cogl_color_out.rgb = clamp(cogl_color_out.rgb +                         \n"
"                             (2.0 * noise - 1.0) * grain * cogl_color_out.a,\n"
"                             0.0, cogl_color_out.a);                      \n"
"  vec2 half_size = surface_size * 0.5;                                    \n"
"  float r = min(corner_radius, min(half_size.x, half_size.y));              \n"
"  vec2 p = abs(surface_position - half_size);                              \n"
"  vec2 q = p - half_size + vec2(r);                                        \n"
"  float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - r;       \n"
"  if (corner_radius > 0.0)                                                \n"
"    cogl_color_out *= 1.0 - smoothstep(-0.5, 0.5, d);                      \n";

#define RESULT_SIZE_STEP 64
#define GRAIN 0.02f

typedef enum
{
  ACTOR_PAINTED = 1 << 0,
  BLUR_APPLIED = 1 << 1,
} CacheFlags;

typedef struct
{
  CoglFramebuffer *framebuffer;
  CoglPipeline *pipeline;
  CoglTexture *texture;
} FramebufferData;

struct _ShellBlurEffect
{
  ClutterEffect parent_instance;

  ClutterActor *actor;

  unsigned int tex_width;
  unsigned int tex_height;
  unsigned int result_width;
  unsigned int result_height;
  ClutterActorBox paint_box;

  /* The cached contents */
  FramebufferData actor_fb;
  CacheFlags cache_flags;

  GHashTable *backdrops;
  CoglPipeline *last_backdrop;
  ShellBackdropSpread *spread;
  FramebufferData brightness_fb;
  GPtrArray *wallpaper_pipelines;
  int brightness_uniform;
  int surface_size_uniform;
  int surface_map_uniform;
  int corner_radius_uniform;
  float corner_radius;
  int bright_dim_uniform;
  float bright_dim;
  int dark_lift_uniform;
  float dark_lift;
  int saturation_uniform;
  float saturation;
  int surface_tint_uniform;
  int grain_uniform;
  int pixel_scale_uniform;

  ShellBlurMode mode;
  ShellBlurStyle style;
  float brightness;
  int radius;
};

G_DEFINE_TYPE (ShellBlurEffect, shell_blur_effect, CLUTTER_TYPE_EFFECT)

enum {
  PROP_0,
  PROP_RADIUS,
  PROP_BRIGHTNESS,
  PROP_CORNER_RADIUS,
  PROP_BRIGHT_DIM,
  PROP_DARK_LIFT,
  PROP_SATURATION,
  PROP_MODE,
  PROP_STYLE,
  N_PROPS
};

static GParamSpec *properties [N_PROPS] = { NULL, };

static CoglContext *
get_cogl_context (void)
{
  ShellGlobal *global = shell_global_get ();
  ClutterStage *stage = shell_global_get_stage (global);
  ClutterContext *clutter_context =
    clutter_actor_get_context (CLUTTER_ACTOR (stage));
  ClutterBackend *backend =
    clutter_context_get_backend (clutter_context);

  return clutter_backend_get_cogl_context (backend);
}

static CoglPipeline*
create_base_pipeline (CoglContext *ctx)
{
  static CoglPipelineKey base_pipeline_key = "shell-blur-effect-base";
  CoglPipeline *base_pipeline =
    cogl_context_get_named_pipeline (ctx, &base_pipeline_key);

  if (G_UNLIKELY (base_pipeline == NULL))
    {
      base_pipeline = cogl_pipeline_new (ctx);
      cogl_pipeline_set_layer_null_texture (base_pipeline, 0);
      cogl_pipeline_set_layer_filters (base_pipeline,
                                       0,
                                       COGL_PIPELINE_FILTER_LINEAR,
                                       COGL_PIPELINE_FILTER_LINEAR);
      cogl_pipeline_set_layer_wrap_mode (base_pipeline,
                                         0,
                                         COGL_PIPELINE_WRAP_MODE_CLAMP_TO_EDGE);
      cogl_context_set_named_pipeline (ctx, &base_pipeline_key, base_pipeline);
    }

  return cogl_pipeline_copy (base_pipeline);
}

static CoglPipeline*
create_brightness_pipeline (CoglContext *ctx)
{
  static CoglPipelineKey brightness_pipeline_key = "shell-blur-effect-brightness";
  CoglPipeline *brightness_pipeline =
    cogl_context_get_named_pipeline (ctx, &brightness_pipeline_key);

  if (G_UNLIKELY (brightness_pipeline == NULL))
    {
      CoglSnippet *snippet;

      brightness_pipeline = create_base_pipeline (ctx);
      cogl_pipeline_set_layer_texture (brightness_pipeline, 1,
                                       clutter_blur_node_get_grain (ctx));
      cogl_pipeline_set_layer_filters (brightness_pipeline, 1,
                                       COGL_PIPELINE_FILTER_NEAREST,
                                       COGL_PIPELINE_FILTER_NEAREST);
      cogl_pipeline_set_layer_combine (brightness_pipeline, 1,
                                       "RGBA = REPLACE(PREVIOUS)", NULL);

      snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_VERTEX,
                                  position_glsl_declarations,
                                  position_glsl);
      cogl_pipeline_add_snippet (brightness_pipeline, snippet);
      g_object_unref (snippet);

      snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_FRAGMENT,
                                  brightness_glsl_declarations,
                                  brightness_glsl);
      cogl_pipeline_add_snippet (brightness_pipeline, snippet);
      g_object_unref (snippet);
      cogl_context_set_named_pipeline (ctx,
                                       &brightness_pipeline_key,
                                       brightness_pipeline);
    }

  return cogl_pipeline_copy (brightness_pipeline);
}

static void
create_pipelines (ShellBlurEffect *self,
                  CoglContext     *ctx)
{
  self->actor_fb.pipeline = create_base_pipeline (ctx);
  self->brightness_fb.pipeline = create_brightness_pipeline (ctx);
  self->brightness_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "brightness");
  self->surface_size_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "surface_size");
  self->surface_map_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "surface_map");
  self->corner_radius_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "corner_radius");
  self->bright_dim_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "bright_dim");
  self->dark_lift_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "dark_lift");
  self->saturation_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "saturation");
  self->surface_tint_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "surface_tint");
  self->grain_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "grain");
  self->pixel_scale_uniform =
    cogl_pipeline_get_uniform_location (self->brightness_fb.pipeline, "pixel_scale");
}

static void
clear_framebuffer_data (FramebufferData *fb_data)
{
  g_clear_object (&fb_data->texture);
  g_clear_object (&fb_data->framebuffer);
}

static void
clear_framebuffers (ShellBlurEffect *self)
{
  clear_framebuffer_data (&self->actor_fb);
  clear_framebuffer_data (&self->brightness_fb);
  self->tex_width = 0;
  self->tex_height = 0;
  self->result_width = 0;
  self->result_height = 0;
  self->cache_flags = 0;
}

static void
clear_graphics (ShellBlurEffect *self)
{
  clear_framebuffers (self);
  g_clear_object (&self->actor_fb.pipeline);
  g_clear_object (&self->brightness_fb.pipeline);
  g_ptr_array_set_size (self->wallpaper_pipelines, 0);
  g_hash_table_remove_all (self->backdrops);
  g_clear_object (&self->last_backdrop);
}

static void
ensure_pipelines (ShellBlurEffect *self)
{
  CoglContext *ctx = get_cogl_context ();

  if (self->actor_fb.pipeline &&
      cogl_pipeline_get_context (self->actor_fb.pipeline) == ctx)
    return;

  clear_graphics (self);
  create_pipelines (self, ctx);
}


static MetaCompositor *
get_compositor (void)
{
  return meta_display_get_compositor (shell_global_get_display (shell_global_get ()));
}

static void
surface_tint (ShellBlurEffect *self,
              float           *tint)
{
  const CoglColor *surface = meta_compositor_get_glass_surface (get_compositor ());
  CoglColor background;

  tint[0] = cogl_color_get_red (surface);
  tint[1] = cogl_color_get_green (surface);
  tint[2] = cogl_color_get_blue (surface);
  tint[3] = 0.f;
  if (self->style != SHELL_BLUR_STYLE_MARIS || !ST_IS_WIDGET (self->actor))
    return;

  st_theme_node_get_background_color (st_widget_get_theme_node (ST_WIDGET (self->actor)),
                                      &background);
  tint[3] = MAX (0.f, 1.f - (1.f - cogl_color_get_alpha (surface)) /
                          (1.f - cogl_color_get_alpha (&background)));
}

static void
update_brightness (ShellBlurEffect *self,
                   CoglPipeline    *pipeline,
                   const float     *map,
                   uint8_t          paint_opacity)
{
  CoglColor color;
  float size[2];
  float tint[4];

  clutter_actor_get_size (self->actor, &size[0], &size[1]);
  cogl_pipeline_set_uniform_float (pipeline, self->surface_size_uniform, 2, 1, size);
  cogl_pipeline_set_uniform_float (pipeline, self->surface_map_uniform, 4, 1, map);
  cogl_pipeline_set_uniform_1f (pipeline, self->corner_radius_uniform, self->corner_radius);
  cogl_pipeline_set_uniform_1f (pipeline, self->bright_dim_uniform, self->bright_dim);
  cogl_pipeline_set_uniform_1f (pipeline, self->dark_lift_uniform, self->dark_lift);
  cogl_pipeline_set_uniform_1f (pipeline, self->saturation_uniform, self->saturation);
  cogl_pipeline_set_uniform_1f (pipeline, self->brightness_uniform, self->brightness);
  surface_tint (self, tint);
  cogl_pipeline_set_uniform_float (pipeline, self->surface_tint_uniform, 4, 1, tint);
  cogl_pipeline_set_uniform_1f (pipeline, self->grain_uniform,
                                self->mode == SHELL_BLUR_MODE_BACKGROUND ? GRAIN : 0.f);
  cogl_pipeline_set_uniform_1f (pipeline, self->pixel_scale_uniform,
                                clutter_actor_get_resource_scale (self->actor));

  cogl_color_init_from_4f (&color,
                           paint_opacity / 255.0, paint_opacity / 255.0,
                           paint_opacity / 255.0, paint_opacity / 255.0);
  cogl_pipeline_set_color (pipeline, &color);
}

static void
setup_projection_matrix (CoglFramebuffer *framebuffer,
                         float            width,
                         float            height)
{
  graphene_matrix_t projection;

  graphene_matrix_init_translate (&projection,
                                  &GRAPHENE_POINT3D_INIT (-width / 2.0,
                                                          -height / 2.0,
                                                          0.f));
  graphene_matrix_scale (&projection, 2.0 / width, -2.0 / height, 1.f);

  cogl_framebuffer_set_projection_matrix (framebuffer, &projection);
}

static gboolean
update_fbo (FramebufferData *data,
            unsigned int     width,
            unsigned int     height)
{
  CoglContext *ctx = get_cogl_context ();
  g_autoptr (CoglTexture) texture = cogl_texture_2d_new_with_size (ctx, width, height);
  g_autoptr (CoglOffscreen) offscreen = cogl_offscreen_new_with_texture (texture);
  g_autoptr (GError) error = NULL;

  if (!cogl_framebuffer_allocate (COGL_FRAMEBUFFER (offscreen), &error))
    {
      g_warning ("Could not blur a %ux%u area: %s", width, height, error->message);
      return FALSE;
    }

  data->texture = g_steal_pointer (&texture);
  data->framebuffer = COGL_FRAMEBUFFER (g_steal_pointer (&offscreen));
  cogl_pipeline_set_layer_texture (data->pipeline, 0, data->texture);
  setup_projection_matrix (data->framebuffer, width, height);

  return TRUE;
}

static unsigned int
result_capacity (unsigned int size)
{
  return (size + RESULT_SIZE_STEP - 1) / RESULT_SIZE_STEP * RESULT_SIZE_STEP;
}

static gboolean
result_fits (CoglTexture  *texture,
             unsigned int  width,
             unsigned int  height)
{
  return texture &&
    cogl_texture_get_width (texture) >= width &&
    cogl_texture_get_height (texture) >= height &&
    cogl_texture_get_width (texture) <= result_capacity (width) + RESULT_SIZE_STEP &&
    cogl_texture_get_height (texture) <= result_capacity (height) + RESULT_SIZE_STEP;
}

static void
show_result_area (ShellBlurEffect *self)
{
  graphene_matrix_t matrix;

  graphene_matrix_init_scale (&matrix,
                              (float) self->result_width / cogl_texture_get_width (self->brightness_fb.texture),
                              (float) self->result_height / cogl_texture_get_height (self->brightness_fb.texture),
                              1.f);
  cogl_pipeline_set_layer_matrix (self->brightness_fb.pipeline, 0, &matrix);
}

static float
blur_reach (ShellBlurEffect *self)
{
  return ceilf (1.5f * self->radius);
}

static void
sync_spread (ShellBlurEffect *self)
{
  gboolean spreads = self->actor &&
    self->mode == SHELL_BLUR_MODE_BACKGROUND &&
    self->style == SHELL_BLUR_STYLE_LUCA;

  if (spreads && !self->spread)
    self->spread = shell_backdrop_spread_new (CLUTTER_ACTOR_META (self), self->backdrops);
  else if (!spreads)
    g_clear_pointer (&self->spread, shell_backdrop_spread_free);
}

static void
shell_blur_effect_set_actor (ClutterActorMeta *meta,
                             ClutterActor     *actor)
{
  ShellBlurEffect *self = SHELL_BLUR_EFFECT (meta);
  ClutterActorMetaClass *meta_class;

  meta_class = CLUTTER_ACTOR_META_CLASS (shell_blur_effect_parent_class);
  meta_class->set_actor (meta, actor);

  /* clear out the previous state */
  clear_framebuffers (self);
  g_hash_table_remove_all (self->backdrops);
  g_clear_object (&self->last_backdrop);

  /* we keep a back pointer here, to avoid going through the ActorMeta */
  self->actor = clutter_actor_meta_get_actor (meta);
  sync_spread (self);
}

static float
stage_to_framebuffer (ShellBlurEffect     *self,
                      ClutterPaintContext *paint_context,
                      float               *offset_x,
                      float               *offset_y)
{
  ClutterStageView *stage_view = clutter_paint_context_get_stage_view (paint_context);
  CoglFramebuffer *framebuffer;
  ClutterActor *stage;
  MtkRectangle layout;
  float scale;

  if (stage_view)
    {
      scale = clutter_stage_view_get_scale (stage_view);
      clutter_stage_view_get_layout (stage_view, &layout);
      *offset_x = -layout.x * scale;
      *offset_y = -layout.y * scale;
      return scale;
    }

  framebuffer = clutter_paint_context_get_framebuffer (paint_context);
  stage = clutter_actor_get_stage (self->actor);
  *offset_x = cogl_framebuffer_get_viewport_x (framebuffer);
  *offset_y = cogl_framebuffer_get_viewport_y (framebuffer);
  return cogl_framebuffer_get_viewport_width (framebuffer) / clutter_actor_get_width (stage);
}

static float
update_actor_box (ShellBlurEffect     *self,
                  ClutterPaintContext *paint_context,
                  ClutterActorBox     *source_actor_box)
{
  float scale = 1.0f;
  float offset_x, offset_y;
  float origin_x, origin_y;
  float width, height;

  switch (self->mode)
    {
    case SHELL_BLUR_MODE_ACTOR:
      clutter_actor_get_allocation_box (self->actor, source_actor_box);
      break;

    case SHELL_BLUR_MODE_BACKGROUND:
      scale = stage_to_framebuffer (self, paint_context, &offset_x, &offset_y);
      clutter_actor_get_transformed_position (self->actor, &origin_x, &origin_y);
      clutter_actor_get_transformed_size (self->actor, &width, &height);

      clutter_actor_box_set_origin (source_actor_box,
                                    origin_x * scale + offset_x,
                                    origin_y * scale + offset_y);
      clutter_actor_box_set_size (source_actor_box, width * scale, height * scale);
      break;
    }

  clutter_actor_box_clamp_to_pixel (source_actor_box);
  return scale;
}

static gboolean
fit_to_framebuffer (ClutterPaintContext *paint_context,
                    ClutterActorBox     *area)
{
  CoglFramebuffer *framebuffer = clutter_paint_context_get_framebuffer (paint_context);
  float width = cogl_framebuffer_get_width (framebuffer);
  float height = cogl_framebuffer_get_height (framebuffer);

  if (area->x2 - area->x1 > width)
    {
      area->x1 = MAX (area->x1, 0.f);
      area->x2 = MIN (area->x2, width);
    }
  if (area->y2 - area->y1 > height)
    {
      area->y1 = MAX (area->y1, 0.f);
      area->y2 = MIN (area->y2, height);
    }

  return area->x1 < area->x2 && area->y1 < area->y2 &&
         area->x1 < width && area->x2 > 0.f &&
         area->y1 < height && area->y2 > 0.f;
}

static void
update_paint_box (ShellBlurEffect       *self,
                  const ClutterActorBox *actor_box,
                  const ClutterActorBox *area)
{
  float width, height, scale_x, scale_y;

  clutter_actor_get_size (self->actor, &width, &height);
  scale_x = width / (actor_box->x2 - actor_box->x1);
  scale_y = height / (actor_box->y2 - actor_box->y1);
  self->paint_box = (ClutterActorBox) {
    (area->x1 - actor_box->x1) * scale_x,
    (area->y1 - actor_box->y1) * scale_y,
    (area->x2 - actor_box->x1) * scale_x,
    (area->y2 - actor_box->y1) * scale_y,
  };
}

static void
paint_box_map (ShellBlurEffect *self,
               float           *map)
{
  map[0] = self->paint_box.x1;
  map[1] = self->paint_box.y1;
  map[2] = self->paint_box.x2 - self->paint_box.x1;
  map[3] = self->paint_box.y2 - self->paint_box.y1;
}

static void
add_blurred_pipeline (ShellBlurEffect  *self,
                      ClutterPaintNode *node,
                      uint8_t           paint_opacity)
{
  g_autoptr (ClutterPaintNode) pipeline_node = NULL;
  float map[4];

  paint_box_map (self, map);
  update_brightness (self, self->brightness_fb.pipeline, map, paint_opacity);

  pipeline_node = clutter_pipeline_node_new (self->brightness_fb.pipeline);
  clutter_paint_node_set_static_name (pipeline_node, "ShellBlurEffect (final)");
  clutter_paint_node_add_child (node, pipeline_node);

  clutter_paint_node_add_rectangle (pipeline_node, &self->paint_box);
}

static ClutterPaintNode *
create_blur_nodes (ShellBlurEffect  *self,
                   ClutterPaintNode *node,
                   uint8_t           paint_opacity)
{
  g_autoptr (ClutterPaintNode) brightness_node = NULL;
  g_autoptr (ClutterPaintNode) blur_node = NULL;
  float map[4];

  paint_box_map (self, map);
  update_brightness (self, self->brightness_fb.pipeline, map, paint_opacity);
  brightness_node = clutter_layer_node_new_to_framebuffer (self->brightness_fb.framebuffer,
                                                           self->brightness_fb.pipeline);
  clutter_paint_node_set_static_name (brightness_node, "ShellBlurEffect (brightness)");
  clutter_paint_node_add_child (node, brightness_node);
  clutter_paint_node_add_rectangle (brightness_node, &self->paint_box);

  blur_node = clutter_blur_node_new (self->tex_width, self->tex_height, self->radius);
  clutter_paint_node_set_static_name (blur_node, "ShellBlurEffect (blur)");
  clutter_paint_node_add_child (brightness_node, blur_node);
  clutter_paint_node_add_rectangle (blur_node,
                                    &(ClutterActorBox) {
                                      0.f, 0.f,
                                      self->result_width,
                                      self->result_height,
                                    });

  self->cache_flags |= BLUR_APPLIED;

  return g_steal_pointer (&blur_node);
}

static void
paint_background (ShellBlurEffect     *self,
                  ClutterPaintNode    *node,
                  CoglPipeline        *pipeline)
{
  g_autoptr (ClutterPaintNode) background_node = clutter_pipeline_node_new (pipeline);

  clutter_paint_node_set_static_name (background_node, "ShellBlurEffect (backdrop)");
  clutter_paint_node_add_child (node, background_node);
  clutter_paint_node_add_rectangle (background_node,
                                    &(ClutterActorBox) {
                                      0.f, 0.f,
                                      self->tex_width,
                                      self->tex_height,
                                    });
}

static gboolean
texture_fits (CoglTexture  *texture,
              unsigned int  width,
              unsigned int  height)
{
  return texture &&
    cogl_texture_get_width (texture) == width &&
    cogl_texture_get_height (texture) == height;
}

static gboolean
update_framebuffers (ShellBlurEffect *self,
                     ClutterActorBox *area)
{
  unsigned int result_width, result_height;
  float width, height;

  clutter_actor_box_get_size (area, &width, &height);

  if (width <= 0 || height <= 0)
    return FALSE;

  if (self->tex_width == width && self->tex_height == height)
    return self->brightness_fb.framebuffer != NULL;

  result_width = ((unsigned int) width + 1) / 2;
  result_height = ((unsigned int) height + 1) / 2;
  self->cache_flags = 0;

  if (!result_fits (self->brightness_fb.texture, result_width, result_height))
    {
      clear_framebuffer_data (&self->brightness_fb);
      if (!update_fbo (&self->brightness_fb,
                       result_capacity (result_width), result_capacity (result_height)))
        return FALSE;
    }

  if (self->mode == SHELL_BLUR_MODE_ACTOR &&
      !texture_fits (self->actor_fb.texture, width, height))
    {
      clear_framebuffer_data (&self->actor_fb);
      if (!update_fbo (&self->actor_fb, width, height))
        return FALSE;
    }

  self->tex_width = width;
  self->tex_height = height;
  self->result_width = result_width;
  self->result_height = result_height;
  show_result_area (self);

  return TRUE;
}

static void
add_actor_node (ShellBlurEffect  *self,
                ClutterPaintNode *node,
                int               opacity)
{
  g_autoptr (ClutterPaintNode) actor_node = NULL;

  actor_node = clutter_actor_node_new (self->actor, opacity);
  clutter_paint_node_add_child (node, actor_node);
}

static void
paint_actor_offscreen (ShellBlurEffect         *self,
                       ClutterPaintNode        *node,
                       ClutterEffectPaintFlags  flags)
{
  gboolean actor_dirty;

  actor_dirty = (flags & CLUTTER_EFFECT_PAINT_ACTOR_DIRTY) != 0;

  /* The actor offscreen framebuffer is updated already */
  if (actor_dirty || !(self->cache_flags & ACTOR_PAINTED))
    {
      g_autoptr (ClutterPaintNode) layer_node = NULL;

      layer_node = clutter_layer_node_new_to_framebuffer (self->actor_fb.framebuffer,
                                                          self->actor_fb.pipeline);
      clutter_paint_node_set_static_name (layer_node, "ShellBlurEffect (actor offscreen)");
      clutter_paint_node_add_child (node, layer_node);
      clutter_paint_node_add_rectangle (layer_node,
                                        &(ClutterActorBox) {
                                          0.f, 0.f,
                                          self->tex_width,
                                          self->tex_height,
                                        });

      add_actor_node (self, layer_node, 255);

      self->cache_flags |= ACTOR_PAINTED;
    }
  else
    {
      g_autoptr (ClutterPaintNode) pipeline_node = NULL;

      pipeline_node = clutter_pipeline_node_new (self->actor_fb.pipeline);
      clutter_paint_node_set_static_name (pipeline_node,
                                          "ShellBlurEffect (actor texture)");
      clutter_paint_node_add_child (node, pipeline_node);
      clutter_paint_node_add_rectangle (pipeline_node,
                                        &(ClutterActorBox) {
                                          0.f, 0.f,
                                          self->tex_width,
                                          self->tex_height,
                                        });
    }
}

static gboolean
needs_repaint (ShellBlurEffect         *self,
               ClutterEffectPaintFlags  flags,
               gboolean                 background_changed)
{
  gboolean actor_cached;
  gboolean blur_cached;
  gboolean actor_dirty;

  actor_dirty = (flags & CLUTTER_EFFECT_PAINT_ACTOR_DIRTY) != 0;
  blur_cached = (self->cache_flags & BLUR_APPLIED) != 0;
  actor_cached = (self->cache_flags & ACTOR_PAINTED) != 0;

  switch (self->mode)
    {
    case SHELL_BLUR_MODE_ACTOR:
      return actor_dirty || !blur_cached || !actor_cached;

    case SHELL_BLUR_MODE_BACKGROUND:
      return background_changed || !blur_cached;
    }

  return TRUE;
}

static CoglPipeline *
wallpaper_pipeline (ShellBlurEffect *self,
                    unsigned int     index,
                    CoglTexture     *texture)
{
  CoglPipeline *pipeline;

  while (self->wallpaper_pipelines->len <= index)
    g_ptr_array_add (self->wallpaper_pipelines,
                     create_brightness_pipeline (get_cogl_context ()));

  pipeline = g_ptr_array_index (self->wallpaper_pipelines, index);
  if (cogl_pipeline_get_layer_texture (pipeline, 0) != texture)
    cogl_pipeline_set_layer_texture (pipeline, 0, texture);
  return pipeline;
}

static void
paint_wallpaper (ShellBlurEffect  *self,
                 ClutterPaintNode *node,
                 uint8_t           paint_opacity)
{
  MetaCompositor *compositor = get_compositor ();
  MetaWallpaperFrost frost = self->style == SHELL_BLUR_STYLE_MARIS ?
    META_WALLPAPER_FROST_WIDE : META_WALLPAPER_FROST_BLURRED;
  graphene_rect_t extents;
  float width, height;
  MtkRectangle area;
  CoglTexture *texture;
  unsigned int i;

  clutter_actor_get_transformed_extents (self->actor, &extents);
  clutter_actor_get_size (self->actor, &width, &height);
  if (extents.size.width <= 0.f || extents.size.height <= 0.f)
    return;

  for (i = 0; (texture = meta_compositor_get_frosted_wallpaper (compositor, frost, i, &area)); i++)
    {
      g_autoptr (ClutterPaintNode) wallpaper_node = NULL;
      graphene_rect_t piece = mtk_rectangle_to_graphene_rect (&area);
      float scale_x = width / extents.size.width;
      float scale_y = height / extents.size.height;
      ClutterActorBox box;
      CoglPipeline *pipeline;
      graphene_rect_t shown;
      float coords[4];
      float map[4];

      if (!graphene_rect_intersection (&extents, &piece, &shown))
        continue;

      box = (ClutterActorBox) {
        (shown.origin.x - extents.origin.x) * scale_x,
        (shown.origin.y - extents.origin.y) * scale_y,
        (shown.origin.x + shown.size.width - extents.origin.x) * scale_x,
        (shown.origin.y + shown.size.height - extents.origin.y) * scale_y,
      };
      coords[0] = (shown.origin.x - piece.origin.x) / piece.size.width;
      coords[1] = (shown.origin.y - piece.origin.y) / piece.size.height;
      coords[2] = (shown.origin.x + shown.size.width - piece.origin.x) / piece.size.width;
      coords[3] = (shown.origin.y + shown.size.height - piece.origin.y) / piece.size.height;
      map[2] = (box.x2 - box.x1) / (coords[2] - coords[0]);
      map[3] = (box.y2 - box.y1) / (coords[3] - coords[1]);
      map[0] = box.x1 - coords[0] * map[2];
      map[1] = box.y1 - coords[1] * map[3];

      pipeline = wallpaper_pipeline (self, i, texture);
      update_brightness (self, pipeline, map, paint_opacity);
      wallpaper_node = clutter_pipeline_node_new (pipeline);
      clutter_paint_node_set_static_name (wallpaper_node, "ShellBlurEffect (wallpaper)");
      clutter_paint_node_add_child (node, wallpaper_node);
      clutter_paint_node_add_texture_rectangle (wallpaper_node, &box,
                                                coords[0], coords[1],
                                                coords[2], coords[3]);
    }
}

static gboolean
paint_live (ShellBlurEffect         *self,
            ClutterPaintNode        *node,
            ClutterPaintContext     *paint_context,
            ClutterEffectPaintFlags  flags,
            uint8_t                  paint_opacity)
{
  g_autoptr (ClutterPaintNode) blur_node = NULL;
  CoglPipeline *backdrop = NULL;
  ClutterActorBox actor_box;
  ClutterActorBox area;
  gboolean background_changed = FALSE;
  float scale;

  scale = update_actor_box (self, paint_context, &actor_box);
  area = actor_box;
  if (self->mode == SHELL_BLUR_MODE_BACKGROUND &&
      !fit_to_framebuffer (paint_context, &area))
    return FALSE;

  if (!update_framebuffers (self, &area))
    return FALSE;

  update_paint_box (self, &actor_box, &area);

  if (self->mode == SHELL_BLUR_MODE_BACKGROUND)
    {
      shell_backdrop_spread_set_reach (self->spread, blur_reach (self));
      backdrop = shell_backdrop_capture (self->backdrops, self->actor,
                                         paint_context, &actor_box, &area,
                                         scale, &background_changed);
      if (!backdrop)
        return FALSE;

      background_changed |= backdrop != self->last_backdrop;
      g_set_object (&self->last_backdrop, backdrop);
      if (!clutter_paint_context_get_stage_view (paint_context))
        g_hash_table_remove (self->backdrops, NULL);
    }

  if (!needs_repaint (self, flags, background_changed))
    {
      add_blurred_pipeline (self, node, paint_opacity);
      return TRUE;
    }

  blur_node = create_blur_nodes (self, node, paint_opacity);
  if (self->mode == SHELL_BLUR_MODE_ACTOR)
    paint_actor_offscreen (self, blur_node, flags);
  else
    paint_background (self, blur_node, backdrop);

  return TRUE;
}

static void
shell_blur_effect_paint_node (ClutterEffect           *effect,
                              ClutterPaintNode        *node,
                              ClutterPaintContext     *paint_context,
                              ClutterEffectPaintFlags  flags)
{
  ShellBlurEffect *self = SHELL_BLUR_EFFECT (effect);
  uint8_t paint_opacity;

  g_assert (self->actor != NULL);

  if (self->radius <= 0)
    {
      add_actor_node (self, node, -1);
      return;
    }

  ensure_pipelines (self);
  paint_opacity = clutter_actor_get_paint_opacity (self->actor);

  if (self->mode == SHELL_BLUR_MODE_ACTOR)
    {
      if (!paint_live (self, node, paint_context, flags, paint_opacity))
        add_actor_node (self, node, -1);
      return;
    }

  if (self->style != SHELL_BLUR_STYLE_LUCA)
    paint_wallpaper (self, node, paint_opacity);
  else if (!paint_live (self, node, paint_context, flags, paint_opacity))
    {
      add_actor_node (self, node, -1);
      return;
    }

  add_actor_node (self, node, -1);
  shell_blur_add_outline (self->actor, node, self->corner_radius, paint_opacity);
}

static void
shell_blur_effect_unrealize (ClutterEffect *effect)
{
  clear_graphics (SHELL_BLUR_EFFECT (effect));

  CLUTTER_EFFECT_CLASS (shell_blur_effect_parent_class)->unrealize (effect);
}

static void
shell_blur_effect_finalize (GObject *object)
{
  ShellBlurEffect *self = (ShellBlurEffect *)object;

  clear_graphics (self);
  g_clear_pointer (&self->wallpaper_pipelines, g_ptr_array_unref);
  g_clear_pointer (&self->backdrops, g_hash_table_unref);
  g_clear_pointer (&self->spread, shell_backdrop_spread_free);

  G_OBJECT_CLASS (shell_blur_effect_parent_class)->finalize (object);
}

static void
shell_blur_effect_get_property (GObject    *object,
                                guint       prop_id,
                                GValue     *value,
                                GParamSpec *pspec)
{
  ShellBlurEffect *self = SHELL_BLUR_EFFECT (object);

  switch (prop_id)
    {
    case PROP_RADIUS:
      g_value_set_int (value, self->radius);
      break;

    case PROP_BRIGHTNESS:
      g_value_set_float (value, self->brightness);
      break;

    case PROP_CORNER_RADIUS:
      g_value_set_float (value, self->corner_radius);
      break;

    case PROP_BRIGHT_DIM:
      g_value_set_float (value, self->bright_dim);
      break;

    case PROP_DARK_LIFT:
      g_value_set_float (value, self->dark_lift);
      break;

    case PROP_SATURATION:
      g_value_set_float (value, self->saturation);
      break;

    case PROP_MODE:
      g_value_set_enum (value, self->mode);
      break;

    case PROP_STYLE:
      g_value_set_enum (value, self->style);
      break;

    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_blur_effect_set_property (GObject      *object,
                                guint         prop_id,
                                const GValue *value,
                                GParamSpec   *pspec)
{
  ShellBlurEffect *self = SHELL_BLUR_EFFECT (object);

  switch (prop_id)
    {
    case PROP_RADIUS:
      shell_blur_effect_set_radius (self, g_value_get_int (value));
      break;

    case PROP_BRIGHTNESS:
      shell_blur_effect_set_brightness (self, g_value_get_float (value));
      break;

    case PROP_CORNER_RADIUS:
      if (self->corner_radius != g_value_get_float (value))
        {
          self->corner_radius = g_value_get_float (value);
          if (self->actor)
            clutter_effect_queue_repaint (CLUTTER_EFFECT (self));
          g_object_notify_by_pspec (object, properties[PROP_CORNER_RADIUS]);
        }
      break;

    case PROP_BRIGHT_DIM:
      if (self->bright_dim != g_value_get_float (value))
        {
          self->bright_dim = g_value_get_float (value);
          if (self->actor)
            clutter_effect_queue_repaint (CLUTTER_EFFECT (self));
          g_object_notify_by_pspec (object, properties[PROP_BRIGHT_DIM]);
        }
      break;

    case PROP_DARK_LIFT:
      if (self->dark_lift != g_value_get_float (value))
        {
          self->dark_lift = g_value_get_float (value);
          if (self->actor)
            clutter_effect_queue_repaint (CLUTTER_EFFECT (self));
          g_object_notify_by_pspec (object, properties[PROP_DARK_LIFT]);
        }
      break;

    case PROP_SATURATION:
      if (self->saturation != g_value_get_float (value))
        {
          self->saturation = g_value_get_float (value);
          if (self->actor)
            clutter_effect_queue_repaint (CLUTTER_EFFECT (self));
          g_object_notify_by_pspec (object, properties[PROP_SATURATION]);
        }
      break;

    case PROP_MODE:
      shell_blur_effect_set_mode (self, g_value_get_enum (value));
      break;

    case PROP_STYLE:
      shell_blur_effect_set_style (self, g_value_get_enum (value));
      break;

    default:
      G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    }
}

static void
shell_blur_effect_class_init (ShellBlurEffectClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  ClutterActorMetaClass *meta_class = CLUTTER_ACTOR_META_CLASS (klass);
  ClutterEffectClass *effect_class = CLUTTER_EFFECT_CLASS (klass);

  object_class->finalize = shell_blur_effect_finalize;
  object_class->get_property = shell_blur_effect_get_property;
  object_class->set_property = shell_blur_effect_set_property;

  meta_class->set_actor = shell_blur_effect_set_actor;

  effect_class->paint_node = shell_blur_effect_paint_node;
  effect_class->unrealize = shell_blur_effect_unrealize;

  properties[PROP_RADIUS] =
    g_param_spec_int ("radius", NULL, NULL,
                      0, G_MAXINT, 0,
                      G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_BRIGHTNESS] =
    g_param_spec_float ("brightness", NULL, NULL,
                        0.f, 1.f, 1.f,
                        G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_CORNER_RADIUS] =
    g_param_spec_float ("corner-radius", NULL, NULL,
                        0.f, G_MAXFLOAT, 0.f,
                        G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_BRIGHT_DIM] =
    g_param_spec_float ("bright-dim", NULL, NULL,
                        0.f, 1.f, 0.f,
                        G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_DARK_LIFT] =
    g_param_spec_float ("dark-lift", NULL, NULL,
                        0.f, 1.f, 0.f,
                        G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_SATURATION] =
    g_param_spec_float ("saturation", NULL, NULL,
                        0.f, 2.f, 1.f,
                        G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_MODE] =
    g_param_spec_enum ("mode", NULL, NULL,
                       SHELL_TYPE_BLUR_MODE,
                       SHELL_BLUR_MODE_ACTOR,
                       G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  properties[PROP_STYLE] =
    g_param_spec_enum ("style", NULL, NULL,
                       SHELL_TYPE_BLUR_STYLE,
                       SHELL_BLUR_STYLE_LUCA,
                       G_PARAM_READWRITE | G_PARAM_STATIC_STRINGS | G_PARAM_EXPLICIT_NOTIFY);

  g_object_class_install_properties (object_class, N_PROPS, properties);
}

static void
shell_blur_effect_init (ShellBlurEffect *self)
{
  self->mode = SHELL_BLUR_MODE_ACTOR;
  self->radius = 0;
  self->brightness = 1.f;
  self->saturation = 1.f;

  self->backdrops = shell_backdrop_cache_new ();
  self->wallpaper_pipelines = g_ptr_array_new_with_free_func (g_object_unref);
  create_pipelines (self, get_cogl_context ());
}

ShellBlurEffect *
shell_blur_effect_new (void)
{
  return g_object_new (SHELL_TYPE_BLUR_EFFECT, NULL);
}

int
shell_blur_effect_get_radius (ShellBlurEffect *self)
{
  g_return_val_if_fail (SHELL_IS_BLUR_EFFECT (self), -1);

  return self->radius;
}

void
shell_blur_effect_set_radius (ShellBlurEffect *self,
                              int              radius)
{
  g_return_if_fail (SHELL_IS_BLUR_EFFECT (self));

  if (self->radius == radius)
    return;

  self->radius = radius;
  self->cache_flags &= ~BLUR_APPLIED;

  if (self->actor)
    clutter_effect_queue_repaint (CLUTTER_EFFECT (self));

  g_object_notify_by_pspec (G_OBJECT (self), properties[PROP_RADIUS]);
}

float
shell_blur_effect_get_brightness (ShellBlurEffect *self)
{
  g_return_val_if_fail (SHELL_IS_BLUR_EFFECT (self), -1);

  return self->brightness;
}

void
shell_blur_effect_set_brightness (ShellBlurEffect *self,
                                  float            brightness)
{
  g_return_if_fail (SHELL_IS_BLUR_EFFECT (self));

  if (self->brightness == brightness)
    return;

  self->brightness = brightness;
  self->cache_flags &= ~BLUR_APPLIED;

  if (self->actor)
    clutter_effect_queue_repaint (CLUTTER_EFFECT (self));

  g_object_notify_by_pspec (G_OBJECT (self), properties[PROP_BRIGHTNESS]);
}

ShellBlurMode
shell_blur_effect_get_mode (ShellBlurEffect *self)
{
  g_return_val_if_fail (SHELL_IS_BLUR_EFFECT (self), SHELL_BLUR_MODE_ACTOR);

  return self->mode;
}

void
shell_blur_effect_set_mode (ShellBlurEffect *self,
                            ShellBlurMode    mode)
{
  g_return_if_fail (SHELL_IS_BLUR_EFFECT (self));

  if (self->mode == mode)
    return;

  self->mode = mode;
  clear_framebuffers (self);
  sync_spread (self);
  if (mode == SHELL_BLUR_MODE_ACTOR)
    {
      g_hash_table_remove_all (self->backdrops);
      g_clear_object (&self->last_backdrop);
    }

  if (self->actor)
    clutter_effect_queue_repaint (CLUTTER_EFFECT (self));

  g_object_notify_by_pspec (G_OBJECT (self), properties[PROP_MODE]);
}

ShellBlurStyle
shell_blur_effect_get_style (ShellBlurEffect *self)
{
  g_return_val_if_fail (SHELL_IS_BLUR_EFFECT (self), SHELL_BLUR_STYLE_LUCA);

  return self->style;
}

void
shell_blur_effect_set_style (ShellBlurEffect *self,
                             ShellBlurStyle   style)
{
  g_return_if_fail (SHELL_IS_BLUR_EFFECT (self));

  if (self->style == style)
    return;

  self->style = style;
  clear_framebuffers (self);
  sync_spread (self);
  g_hash_table_remove_all (self->backdrops);
  g_clear_object (&self->last_backdrop);

  if (self->actor)
    clutter_effect_queue_repaint (CLUTTER_EFFECT (self));

  g_object_notify_by_pspec (G_OBJECT (self), properties[PROP_STYLE]);
}
