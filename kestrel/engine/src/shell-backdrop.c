#include "config.h"

#include <math.h>

#include "shell-backdrop.h"

typedef struct
{
  GHashTable *cache;
  ClutterStageView *view;
  CoglFramebuffer *framebuffer;
  CoglPipeline *pipeline;
  MtkRectangle geometry;
  MtkRegion *valid;
} Backdrop;

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

static void
allocate_backdrop (Backdrop     *backdrop,
                   CoglContext  *cogl,
                   MtkRectangle *geometry)
{
  g_autoptr (CoglTexture) texture = cogl_texture_2d_new_with_size (cogl, geometry->width, geometry->height);
  g_autoptr (CoglOffscreen) offscreen = cogl_offscreen_new_with_texture (texture);
  g_autoptr (GError) error = NULL;

  if (!cogl_framebuffer_allocate (COGL_FRAMEBUFFER (offscreen), &error))
    {
      g_warning ("Could not keep a %dx%d backdrop: %s",
                 geometry->width, geometry->height, error->message);
      return;
    }

  backdrop->framebuffer = COGL_FRAMEBUFFER (g_steal_pointer (&offscreen));
  backdrop->pipeline = cogl_pipeline_new (cogl);
  cogl_pipeline_set_layer_texture (backdrop->pipeline, 0, texture);
  cogl_pipeline_set_layer_filters (backdrop->pipeline, 0,
                                  COGL_PIPELINE_FILTER_LINEAR,
                                  COGL_PIPELINE_FILTER_LINEAR);
  cogl_pipeline_set_layer_wrap_mode (backdrop->pipeline, 0,
                                    COGL_PIPELINE_WRAP_MODE_CLAMP_TO_EDGE);
  cogl_framebuffer_clear4f (backdrop->framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
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

  *changed = !backdrop->framebuffer ||
    !mtk_rectangle_equal (&backdrop->geometry, geometry);
  if (*changed)
    {
      g_clear_pointer (&backdrop->valid, mtk_region_unref);
      backdrop->valid = mtk_region_create ();
    }

  if (backdrop->geometry.width != geometry->width ||
      backdrop->geometry.height != geometry->height)
    {
      g_clear_object (&backdrop->framebuffer);
      g_clear_object (&backdrop->pipeline);
      allocate_backdrop (backdrop, cogl_framebuffer_get_context (source), geometry);
    }
  else if (backdrop->framebuffer &&
           (backdrop->geometry.x != geometry->x ||
            backdrop->geometry.y != geometry->y))
    {
      cogl_framebuffer_clear4f (backdrop->framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
    }

  backdrop->geometry = *geometry;
  return backdrop;
}

CoglPipeline *
shell_backdrop_capture (GHashTable          *cache,
                        ClutterActor        *actor,
                        ClutterPaintContext *context,
                        ClutterActorBox     *actor_box,
                        ClutterActorBox     *area,
                        gboolean            *changed)
{
  ClutterStageView *view = clutter_paint_context_get_stage_view (context);
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (context);
  const MtkRegion *damage = clutter_paint_context_get_redraw_clip (context);
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
      float scale = view ? clutter_stage_view_get_scale (view) : 1.f;
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

  if (damage && view)
    {
      MtkRectangle layout;
      float scale = clutter_stage_view_get_scale (view);
      int i;

      clutter_stage_view_get_layout (view, &layout);
      for (i = 0; i < mtk_region_num_rectangles (damage); i++)
        {
          MtkRectangle rect = mtk_region_get_rectangle (damage, i);
          int right = ceilf ((rect.x + rect.width - layout.x) * scale);
          int bottom = ceilf ((rect.y + rect.height - layout.y) * scale);

          rect.x = floorf ((rect.x - layout.x) * scale);
          rect.y = floorf ((rect.y - layout.y) * scale);
          rect.width = right - rect.x;
          rect.height = bottom - rect.y;
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
