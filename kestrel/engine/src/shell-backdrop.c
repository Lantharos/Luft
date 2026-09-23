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
  g_free (backdrop);
}

GHashTable *
shell_backdrop_cache_new (void)
{
  return g_hash_table_new_full (g_direct_hash, g_direct_equal, NULL, backdrop_free);
}

static Backdrop *
ensure_backdrop (GHashTable          *cache,
                 ClutterPaintContext *context,
                 MtkRectangle        *geometry)
{
  ClutterStageView *view = clutter_paint_context_get_stage_view (context);
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (context);
  Backdrop *backdrop = g_hash_table_lookup (cache, view);

  if (!backdrop)
    {
      backdrop = g_new0 (Backdrop, 1);
      backdrop->cache = cache;
      backdrop->view = view;
      if (view)
        g_object_weak_ref (G_OBJECT (view), view_destroyed, backdrop);
      g_hash_table_insert (cache, view, backdrop);
    }

  if (!backdrop->framebuffer ||
      backdrop->geometry.width != geometry->width ||
      backdrop->geometry.height != geometry->height)
    {
      CoglContext *cogl = cogl_framebuffer_get_context (source);
      g_autoptr (CoglTexture) texture = NULL;

      g_clear_object (&backdrop->framebuffer);
      g_clear_object (&backdrop->pipeline);
      texture = cogl_texture_2d_new_with_size (cogl, geometry->width, geometry->height);
      backdrop->framebuffer = COGL_FRAMEBUFFER (cogl_offscreen_new_with_texture (texture));
      backdrop->pipeline = cogl_pipeline_new (cogl);
      cogl_pipeline_set_layer_texture (backdrop->pipeline, 0, texture);
      cogl_pipeline_set_layer_filters (backdrop->pipeline, 0,
                                      COGL_PIPELINE_FILTER_LINEAR,
                                      COGL_PIPELINE_FILTER_LINEAR);
      cogl_pipeline_set_layer_wrap_mode (backdrop->pipeline, 0,
                                        COGL_PIPELINE_WRAP_MODE_CLAMP_TO_EDGE);
      cogl_framebuffer_clear4f (backdrop->framebuffer, COGL_BUFFER_BIT_COLOR, 0, 0, 0, 0);
    }
  else if (backdrop->geometry.x != geometry->x ||
           backdrop->geometry.y != geometry->y)
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
                        ClutterActorBox     *box)
{
  ClutterStageView *view = clutter_paint_context_get_stage_view (context);
  CoglFramebuffer *source = clutter_paint_context_get_framebuffer (context);
  const MtkRegion *damage = clutter_paint_context_get_redraw_clip (context);
  MtkRectangle geometry = { box->x1, box->y1, box->x2 - box->x1, box->y2 - box->y1 };
  MtkRectangle framebuffer_bounds = { 0, 0,
    cogl_framebuffer_get_width (source), cogl_framebuffer_get_height (source) };
  Backdrop *backdrop = ensure_backdrop (cache, context, &geometry);
  g_autoptr (MtkRegion) visible = mtk_region_create_rectangle (&geometry);
  g_autoptr (MtkRegion) captured = mtk_region_create ();

  mtk_region_intersect_rectangle (visible, &framebuffer_bounds);
  if (clutter_actor_has_clip (actor))
    {
      float x, y, width, height;
      float scale = view ? clutter_stage_view_get_scale (view) : 1.f;
      MtkRectangle clip;

      clutter_actor_get_clip (actor, &x, &y, &width, &height);
      clip = (MtkRectangle) { geometry.x + floorf (x * scale),
                              geometry.y + floorf (y * scale),
                              ceilf (width * scale), ceilf (height * scale) };
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
      mtk_region_subtract (visible, captured);
      if (!mtk_region_is_empty (visible))
        clutter_actor_queue_redraw (actor);
    }

  return backdrop->pipeline;
}
