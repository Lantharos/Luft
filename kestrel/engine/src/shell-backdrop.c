#include "config.h"

#include <math.h>
#include <meta/meta-stage.h>

#include "shell-backdrop.h"
#include "shell-global.h"

typedef struct
{
  GHashTable *cache;
  ClutterStageView *view;
  CoglFramebuffer *framebuffer;
  CoglPipeline *pipeline;
  int capacity_width;
  int capacity_height;
  MtkRectangle geometry;
  MtkRectangle shown;
  int shown_uniform;
  MtkRegion *valid;
} Backdrop;

struct _ShellBackdropSpread
{
  ClutterActorMeta *effect;
  MetaStage *stage;
  MetaStageRedrawClipFilter *filter;
  gulong before_paint_id;
  float reach;
  MtkRegion *handled;
  ClutterStageView *damaged_view;
  MtkRegion *damage;
};

#define CAPACITY_STEP 64

static const char *shown_area_declarations =
  "uniform vec4 backdrop_shown_area;\n";

static const char *shown_area_lookup =
  "  cogl_tex_coord.st = clamp (cogl_tex_coord.st,\n"
  "                             backdrop_shown_area.xy,\n"
  "                             backdrop_shown_area.zw);\n";

static CoglSnippet *
shown_area_snippet (void)
{
  static CoglSnippet *snippet;

  if (!snippet)
    {
      snippet = cogl_snippet_new (COGL_SNIPPET_HOOK_TEXTURE_LOOKUP,
                                  shown_area_declarations, NULL);
      cogl_snippet_set_pre (snippet, shown_area_lookup);
    }

  return snippet;
}

static void
view_destroyed (gpointer data,
                GObject *view)
{
  Backdrop *backdrop = data;

  backdrop->view = NULL;
  g_hash_table_remove (backdrop->cache, view);
}

static void
backdrop_free (gpointer data)
{
  Backdrop *backdrop = data;

  if (backdrop->view)
    g_object_weak_unref (G_OBJECT (backdrop->view), view_destroyed, backdrop);
  g_clear_object (&backdrop->framebuffer);
  g_clear_object (&backdrop->pipeline);
  g_clear_pointer (&backdrop->valid, mtk_region_unref);
  g_free (backdrop);
}

GHashTable *
shell_backdrop_cache_new (void)
{
  return g_hash_table_new_full (g_direct_hash, g_direct_equal, NULL, backdrop_free);
}

static int
capacity_for (int size,
              int limit)
{
  int rounded = (size + CAPACITY_STEP - 1) / CAPACITY_STEP * CAPACITY_STEP;

  return MAX (size, MIN (rounded, limit));
}

static gboolean
capacity_fits (int capacity,
               int size,
               int limit)
{
  return capacity >= size && capacity <= capacity_for (size, limit) + CAPACITY_STEP;
}

static void
allocate_backdrop (Backdrop        *backdrop,
                   CoglFramebuffer *source,
                   MtkRectangle    *geometry)
{
  int width = capacity_for (geometry->width, cogl_framebuffer_get_width (source));
  int height = capacity_for (geometry->height, cogl_framebuffer_get_height (source));
  CoglContext *cogl = cogl_framebuffer_get_context (source);
  g_autoptr (CoglTexture) texture = cogl_texture_2d_new_with_size (cogl, width, height);
  g_autoptr (CoglOffscreen) offscreen = cogl_offscreen_new_with_texture (texture);
  g_autoptr (GError) error = NULL;

  if (!cogl_framebuffer_allocate (COGL_FRAMEBUFFER (offscreen), &error))
    {
      g_warning ("Could not keep a %dx%d backdrop: %s",
                 width, height, error->message);
      return;
    }

  backdrop->framebuffer = COGL_FRAMEBUFFER (g_steal_pointer (&offscreen));
  backdrop->capacity_width = width;
  backdrop->capacity_height = height;
  backdrop->pipeline = cogl_pipeline_new (cogl);
  cogl_pipeline_set_layer_texture (backdrop->pipeline, 0, texture);
  cogl_pipeline_set_layer_filters (backdrop->pipeline, 0,
                                  COGL_PIPELINE_FILTER_LINEAR,
                                  COGL_PIPELINE_FILTER_LINEAR);
  cogl_pipeline_set_layer_wrap_mode (backdrop->pipeline, 0,
                                    COGL_PIPELINE_WRAP_MODE_CLAMP_TO_EDGE);
  cogl_pipeline_add_layer_snippet (backdrop->pipeline, 0, shown_area_snippet ());
  backdrop->shown_uniform =
    cogl_pipeline_get_uniform_location (backdrop->pipeline, "backdrop_shown_area");
  cogl_framebuffer_clear4f (backdrop->framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
}

static gboolean
holds (Backdrop        *backdrop,
       CoglFramebuffer *source,
       MtkRectangle    *geometry)
{
  return backdrop->framebuffer &&
    capacity_fits (backdrop->capacity_width, geometry->width,
                   cogl_framebuffer_get_width (source)) &&
    capacity_fits (backdrop->capacity_height, geometry->height,
                   cogl_framebuffer_get_height (source));
}

static void
map_texture_to_geometry (Backdrop *backdrop)
{
  graphene_matrix_t matrix;

  graphene_matrix_init_scale (&matrix,
                              (float) backdrop->geometry.width / backdrop->capacity_width,
                              (float) backdrop->geometry.height / backdrop->capacity_height,
                              1.f);
  cogl_pipeline_set_layer_matrix (backdrop->pipeline, 0, &matrix);
}

static Backdrop *
ensure_backdrop (GHashTable          *cache,
                 ClutterPaintContext *context,
                 MtkRectangle        *geometry,
                 gboolean            *changed)
{
  ClutterStageView *view = clutter_paint_context_get_stage_view (context);
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (context);
  Backdrop *backdrop = g_hash_table_lookup (cache, view);

  if (!backdrop)
    {
      backdrop = g_new0 (Backdrop, 1);
      backdrop->valid = mtk_region_create ();
      backdrop->cache = cache;
      backdrop->view = view;
      if (view)
        g_object_weak_ref (G_OBJECT (view), view_destroyed, backdrop);
      g_hash_table_insert (cache, view, backdrop);
    }

  *changed = !mtk_rectangle_equal (&backdrop->geometry, geometry) ||
    !holds (backdrop, source, geometry);
  if (!*changed)
    return backdrop;

  g_clear_pointer (&backdrop->valid, mtk_region_unref);
  backdrop->valid = mtk_region_create ();
  backdrop->geometry = *geometry;
  backdrop->shown = (MtkRectangle) { 0 };

  if (holds (backdrop, source, geometry))
    {
      cogl_framebuffer_clear4f (backdrop->framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
    }
  else
    {
      g_clear_object (&backdrop->framebuffer);
      g_clear_object (&backdrop->pipeline);
      allocate_backdrop (backdrop, source, geometry);
    }

  if (backdrop->framebuffer)
    map_texture_to_geometry (backdrop);

  return backdrop;
}

static gboolean
clamp_to_shown_area (Backdrop        *backdrop,
                     const MtkRegion *visible)
{
  MtkRectangle shown = mtk_region_get_extents (visible);
  float texel_x = 0.5f / backdrop->capacity_width;
  float texel_y = 0.5f / backdrop->capacity_height;
  float area[4];

  if (mtk_rectangle_equal (&backdrop->shown, &shown))
    return FALSE;

  backdrop->shown = shown;
  area[0] = (float) (shown.x - backdrop->geometry.x) / backdrop->capacity_width + texel_x;
  area[1] = (float) (shown.y - backdrop->geometry.y) / backdrop->capacity_height + texel_y;
  area[2] = (float) (shown.x + shown.width - backdrop->geometry.x) / backdrop->capacity_width - texel_x;
  area[3] = (float) (shown.y + shown.height - backdrop->geometry.y) / backdrop->capacity_height - texel_y;
  cogl_pipeline_set_uniform_float (backdrop->pipeline, backdrop->shown_uniform, 4, 1, area);
  return TRUE;
}

static const MtkRegion *
repainted_damage (ShellBackdropSpread *spread,
                  ClutterStageView    *view)
{
  if (!view || spread->damaged_view != view)
    return NULL;

  return spread->damage;
}

CoglPipeline *
shell_backdrop_capture (GHashTable          *cache,
                        ShellBackdropSpread *spread,
                        ClutterActor        *actor,
                        ClutterPaintContext *context,
                        ClutterActorBox     *actor_box,
                        ClutterActorBox     *area,
                        float                scale,
                        gboolean            *changed)
{
  ClutterStageView *view = clutter_paint_context_get_stage_view (context);
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (context);
  const MtkRegion *damage = repainted_damage (spread, view);
  MtkRectangle geometry = { area->x1, area->y1, area->x2 - area->x1, area->y2 - area->y1 };
  MtkRectangle framebuffer_bounds = { 0, 0,
    cogl_framebuffer_get_width (source), cogl_framebuffer_get_height (source) };
  Backdrop *backdrop = ensure_backdrop (cache, context, &geometry, changed);
  g_autoptr (MtkRegion) visible = NULL;
  g_autoptr (MtkRegion) captured = NULL;

  if (!backdrop->framebuffer)
    return NULL;

  visible = mtk_region_create_rectangle (&geometry);
  captured = mtk_region_create ();
  mtk_region_intersect_rectangle (visible, &framebuffer_bounds);
  if (clutter_actor_has_clip (actor))
    {
      float x, y, width, height;
      int x1, y1, x2, y2;
      MtkRectangle clip;

      clutter_actor_get_clip (actor, &x, &y, &width, &height);
      x1 = CLAMP (floorf (actor_box->x1 + x * scale), 0, framebuffer_bounds.width);
      y1 = CLAMP (floorf (actor_box->y1 + y * scale), 0, framebuffer_bounds.height);
      x2 = CLAMP (ceilf (actor_box->x1 + (x + width) * scale), x1, framebuffer_bounds.width);
      y2 = CLAMP (ceilf (actor_box->y1 + (y + height) * scale), y1, framebuffer_bounds.height);
      clip = (MtkRectangle) { x1, y1, x2 - x1, y2 - y1 };
      mtk_region_intersect_rectangle (visible, &clip);
    }

  if (!mtk_region_is_empty (visible))
    *changed |= clamp_to_shown_area (backdrop, visible);

  if (damage)
    {
      MtkRectangle layout;
      graphene_rect_t bounds = mtk_rectangle_to_graphene_rect (&framebuffer_bounds);
      int i;

      clutter_stage_view_get_layout (view, &layout);
      for (i = 0; i < mtk_region_num_rectangles (damage); i++)
        {
          MtkRectangle rect = mtk_region_get_rectangle (damage, i);
          graphene_rect_t repainted = mtk_rectangle_to_graphene_rect (&rect);

          graphene_rect_offset (&repainted, -layout.x, -layout.y);
          graphene_rect_scale (&repainted, scale, scale, &repainted);
          graphene_rect_intersection (&repainted, &bounds, &repainted);
          mtk_rectangle_from_graphene_rect (&repainted, MTK_ROUNDING_STRATEGY_GROW, &rect);
          mtk_region_union_rectangle (captured, &rect);
        }
      mtk_region_subtract (backdrop->valid, captured);
      mtk_region_intersect (captured, visible);
    }
  else
    mtk_region_union (captured, visible);

  if (!mtk_region_is_empty (captured))
    {
      g_autoptr (GError) error = NULL;

      if (!cogl_framebuffer_blit_region (source, backdrop->framebuffer, captured,
                                        -geometry.x, -geometry.y, &error))
        g_warning ("Backdrop capture failed: %s", error->message);
      else
        mtk_region_union (backdrop->valid, captured);
      *changed = TRUE;
    }

  mtk_region_subtract (visible, backdrop->valid);
  if (!mtk_region_is_empty (visible))
    clutter_actor_queue_redraw (actor);

  return backdrop->pipeline;
}

static gboolean
blurred_area (ClutterActor     *actor,
              ClutterStageView *view,
              MtkRectangle     *area)
{
  graphene_point3d_t corners[4];
  float x1, y1, x2, y2, width, height;
  MtkRectangle layout;
  int i;

  clutter_actor_get_size (actor, &width, &height);
  x1 = 0.f;
  y1 = 0.f;
  x2 = width;
  y2 = height;
  if (clutter_actor_has_clip (actor))
    {
      float clip_x, clip_y, clip_width, clip_height;

      clutter_actor_get_clip (actor, &clip_x, &clip_y, &clip_width, &clip_height);
      x1 = MAX (x1, clip_x);
      y1 = MAX (y1, clip_y);
      x2 = MIN (x2, clip_x + clip_width);
      y2 = MIN (y2, clip_y + clip_height);
    }

  if (x1 >= x2 || y1 >= y2)
    return FALSE;

  corners[0] = GRAPHENE_POINT3D_INIT (x1, y1, 0.f);
  corners[1] = GRAPHENE_POINT3D_INIT (x2, y1, 0.f);
  corners[2] = GRAPHENE_POINT3D_INIT (x1, y2, 0.f);
  corners[3] = GRAPHENE_POINT3D_INIT (x2, y2, 0.f);
  for (i = 0; i < 4; i++)
    clutter_actor_apply_transform_to_point (actor, &corners[i], &corners[i]);

  x1 = MIN (MIN (corners[0].x, corners[1].x), MIN (corners[2].x, corners[3].x));
  y1 = MIN (MIN (corners[0].y, corners[1].y), MIN (corners[2].y, corners[3].y));
  x2 = MAX (MAX (corners[0].x, corners[1].x), MAX (corners[2].x, corners[3].x));
  y2 = MAX (MAX (corners[0].y, corners[1].y), MAX (corners[2].y, corners[3].y));
  *area = (MtkRectangle) { floorf (x1), floorf (y1), 0, 0 };
  area->width = ceilf (x2) - area->x;
  area->height = ceilf (y2) - area->y;

  clutter_stage_view_get_layout (view, &layout);
  return mtk_rectangle_intersect (area, &layout, area);
}

static gboolean
spread_redraw_clip (MetaStage        *stage,
                    ClutterStageView *view,
                    MtkRegion        *redraw_clip,
                    gpointer          user_data)
{
  ShellBackdropSpread *spread = user_data;
  ClutterActor *actor = clutter_actor_meta_get_actor (spread->effect);
  g_autoptr (MtkRegion) changed = NULL;
  g_autoptr (MtkRegion) repaint = NULL;
  MtkRectangle area;
  int reach, i;

  if (spread->damaged_view != view)
    {
      spread->damaged_view = view;
      spread->damage = redraw_clip ? mtk_region_ref (redraw_clip) : NULL;
    }

  if (!redraw_clip || spread->reach <= 0.f || !actor ||
      !clutter_actor_meta_get_enabled (spread->effect) ||
      !clutter_actor_is_mapped (actor) ||
      !blurred_area (actor, view, &area))
    return FALSE;

  changed = mtk_region_copy (redraw_clip);
  mtk_region_intersect_rectangle (changed, &area);
  mtk_region_subtract (changed, spread->handled);
  if (mtk_region_is_empty (changed))
    return FALSE;

  mtk_region_union (spread->handled, changed);
  reach = ceilf (spread->reach / clutter_stage_view_get_scale (view));
  repaint = mtk_region_create ();
  for (i = 0; i < mtk_region_num_rectangles (changed); i++)
    {
      MtkRectangle rect = mtk_region_get_rectangle (changed, i);

      rect.x -= reach;
      rect.y -= reach;
      rect.width += 2 * reach;
      rect.height += 2 * reach;
      mtk_region_union_rectangle (repaint, &rect);
    }
  mtk_region_intersect_rectangle (repaint, &area);
  mtk_region_subtract (repaint, redraw_clip);
  if (mtk_region_is_empty (repaint))
    return FALSE;

  mtk_region_union (spread->handled, repaint);
  mtk_region_union (redraw_clip, repaint);
  return TRUE;
}

static void
forget_frame (ShellBackdropSpread *spread)
{
  spread->damaged_view = NULL;
  g_clear_pointer (&spread->damage, mtk_region_unref);
  if (mtk_region_is_empty (spread->handled))
    return;

  g_clear_pointer (&spread->handled, mtk_region_unref);
  spread->handled = mtk_region_create ();
}

ShellBackdropSpread *
shell_backdrop_spread_new (ClutterActorMeta *effect)
{
  ShellBackdropSpread *spread = g_new0 (ShellBackdropSpread, 1);

  spread->effect = effect;
  spread->stage = META_STAGE (shell_global_get_stage (shell_global_get ()));
  spread->handled = mtk_region_create ();
  spread->filter = meta_stage_add_redraw_clip_filter (spread->stage,
                                                      spread_redraw_clip,
                                                      spread, NULL);
  spread->before_paint_id = g_signal_connect_swapped (spread->stage, "before-paint",
                                                      G_CALLBACK (forget_frame),
                                                      spread);
  return spread;
}

void
shell_backdrop_spread_set_reach (ShellBackdropSpread *spread,
                                 float                reach)
{
  spread->reach = reach;
}

void
shell_backdrop_spread_free (ShellBackdropSpread *spread)
{
  meta_stage_remove_redraw_clip_filter (spread->filter);
  g_clear_signal_handler (&spread->before_paint_id, spread->stage);
  g_clear_pointer (&spread->handled, mtk_region_unref);
  g_clear_pointer (&spread->damage, mtk_region_unref);
  g_free (spread);
}
