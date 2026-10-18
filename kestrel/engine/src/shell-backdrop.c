#include "config.h"

#include <math.h>

#include "shell-backdrop.h"

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

CoglPipeline *
shell_backdrop_capture (GHashTable          *cache,
                        ClutterActor        *actor,
                        ClutterPaintContext *context,
                        ClutterActorBox     *actor_box,
                        ClutterActorBox     *area,
                        float                scale,
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

  if (damage && view)
    {
      MtkRectangle layout;
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
