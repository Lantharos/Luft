/**
 * ShellDesktopFilterEffect:
 *
 * Runs a [class@Clutter.ViewFilter] over what one actor draws, in the
 * coordinates of the display it's on, so that several actors filtered this
 * way read as one picture while anything between them stays untouched.
 *
 * Each display keeps the actor's picture and the filter's result in textures
 * of their own, as large as the actor's part of the display. A frame only
 * copies the result to the screen; the actor paints again when it changed and
 * the filter runs again when the actor or the filter did.
 */

#include "config.h"

#include <math.h>
#include <meta/meta-stage.h>

#include "shell-desktop-filter-effect.h"
#include "shell-desktop-filter-picture.h"
#include "shell-global.h"

struct _ShellDesktopFilterEffect
{
  ClutterEffect parent_instance;

  GHashTable *pictures;
  MetaStage *stage;
  MetaStageRedrawClipFilter *clip_filter;
  float reach;
  gboolean captured;
  gboolean fills_view;
};

G_DEFINE_FINAL_TYPE (ShellDesktopFilterEffect, shell_desktop_filter_effect, CLUTTER_TYPE_EFFECT)

static ClutterActor *
filtered_actor (ShellDesktopFilterEffect *self)
{
  return clutter_actor_meta_get_actor (CLUTTER_ACTOR_META (self));
}

static MtkRectangle
around_box (const ClutterActorBox *box,
            int                    margin_x,
            int                    margin_y)
{
  int x = floorf (box->x1) - margin_x;
  int y = floorf (box->y1) - margin_y;

  return (MtkRectangle) { x, y,
                          ceilf (box->x2) + margin_x - x,
                          ceilf (box->y2) + margin_y - y };
}

/* While the effect paints, the actor's paint volume leaves out what the effect adds. */
static gboolean
pixels_on_view (ShellDesktopFilterEffect *self,
                ClutterStageView         *view,
                MtkRectangle             *pixels)
{
  ClutterActor *actor = filtered_actor (self);
  float scale = clutter_stage_view_get_scale (view);
  MtkRectangle layout, area;
  ClutterActorBox box;

  clutter_stage_view_get_layout (view, &layout);
  if (!clutter_actor_get_paint_box (actor, &box))
    area = layout;
  else
    area = around_box (&box, ceilf (layout.width * self->reach), ceilf (layout.height * self->reach));

  if (!mtk_rectangle_intersect (&area, &layout, &area))
    return FALSE;

  pixels->x = floorf ((area.x - layout.x) * scale);
  pixels->y = floorf ((area.y - layout.y) * scale);
  pixels->width = ceilf ((area.x + area.width - layout.x) * scale) - pixels->x;
  pixels->height = ceilf ((area.y + area.height - layout.y) * scale) - pixels->y;
  return TRUE;
}

static void
mark_scenes_stale (ShellDesktopFilterEffect *self)
{
  GHashTableIter iter;
  ShellDesktopFilterPicture *picture;

  g_hash_table_iter_init (&iter, self->pictures);
  while (g_hash_table_iter_next (&iter, NULL, (gpointer *) &picture))
    picture->scene_stale = TRUE;
}

static void
paint_unfiltered (ClutterActor     *actor,
                  ClutterPaintNode *node)
{
  g_autoptr (ClutterPaintNode) actor_node = clutter_actor_node_new (actor, -1);

  clutter_paint_node_add_child (node, actor_node);
}

static void
paint_for_capture (ShellDesktopFilterEffect *self,
                   ClutterPaintNode         *node)
{
  ClutterActor *actor = filtered_actor (self);
  g_autoptr (ClutterPaintNode) transform = shell_desktop_filter_stage_coordinates_node (actor);
  float opacity = clutter_actor_get_paint_opacity (actor) / 255.f;
  GHashTableIter iter;
  ClutterStageView *view;
  ShellDesktopFilterPicture *picture;

  if (!self->captured || !transform)
    {
      paint_unfiltered (actor, node);
      return;
    }

  clutter_paint_node_add_child (node, transform);
  g_hash_table_iter_init (&iter, self->pictures);
  while (g_hash_table_iter_next (&iter, (gpointer *) &view, (gpointer *) &picture))
    {
      if (picture->scene && !picture->result_stale)
        shell_desktop_filter_picture_add (picture, view, opacity, transform);
    }
}

static void
shell_desktop_filter_effect_paint_node (ClutterEffect           *effect,
                                        ClutterPaintNode        *node,
                                        ClutterPaintContext     *paint_context,
                                        ClutterEffectPaintFlags  flags)
{
  ShellDesktopFilterEffect *self = SHELL_DESKTOP_FILTER_EFFECT (effect);
  ClutterActor *actor = filtered_actor (self);
  ClutterStageView *view = clutter_paint_context_get_stage_view (paint_context);
  g_autoptr (ClutterPaintNode) transform = NULL;
  ShellDesktopFilterPicture *picture;
  MtkRectangle pixels;

  if (flags & CLUTTER_EFFECT_PAINT_ACTOR_DIRTY)
    mark_scenes_stale (self);

  if (!view ||
      clutter_paint_context_get_framebuffer (paint_context) != clutter_stage_view_get_framebuffer (view))
    {
      paint_for_capture (self, node);
      return;
    }

  picture = g_hash_table_lookup (self->pictures, view);
  if (!picture || clutter_actor_is_in_clone_paint (actor))
    {
      paint_unfiltered (actor, node);
      return;
    }

  if (!pixels_on_view (self, view, &pixels))
    return;

  if (!picture->scene || !mtk_rectangle_equal (&picture->area, &pixels))
    shell_desktop_filter_picture_place (picture, view, &pixels, self->fills_view);

  if (picture->scene_stale)
    shell_desktop_filter_picture_paint_scene (picture, actor, paint_context);

  if (picture->result_stale)
    shell_desktop_filter_picture_run_filter (picture);

  transform = shell_desktop_filter_stage_coordinates_node (actor);
  if (!transform)
    return;

  clutter_paint_node_add_child (node, transform);
  shell_desktop_filter_picture_add (picture, view, clutter_actor_get_paint_opacity (actor) / 255.f, transform);
}

static gboolean
shell_desktop_filter_effect_modify_paint_volume (ClutterEffect      *effect,
                                                 ClutterPaintVolume *volume)
{
  ShellDesktopFilterEffect *self = SHELL_DESKTOP_FILTER_EFFECT (effect);
  graphene_point3d_t origin;
  float margin_x = 0.f, margin_y = 0.f;
  GList *l;

  if (self->reach == 0.f)
    return TRUE;

  for (l = clutter_actor_peek_stage_views (filtered_actor (self)); l; l = l->next)
    {
      MtkRectangle layout;

      clutter_stage_view_get_layout (l->data, &layout);
      margin_x = MAX (margin_x, ceilf (layout.width * self->reach));
      margin_y = MAX (margin_y, ceilf (layout.height * self->reach));
    }

  clutter_paint_volume_get_origin (volume, &origin);
  origin.x -= margin_x;
  origin.y -= margin_y;
  clutter_paint_volume_set_origin (volume, &origin);
  clutter_paint_volume_set_width (volume, clutter_paint_volume_get_width (volume) + 2 * margin_x);
  clutter_paint_volume_set_height (volume, clutter_paint_volume_get_height (volume) + 2 * margin_y);
  return TRUE;
}

static void
grow_rectangles (MtkRegion          *clip,
                 const MtkRectangle *layout,
                 int                 margin_x,
                 int                 margin_y)
{
  g_autoptr (MtkRegion) grown = mtk_region_create ();
  int i;

  for (i = 0; i < mtk_region_num_rectangles (clip); i++)
    {
      MtkRectangle rect = mtk_region_get_rectangle (clip, i);

      rect.x -= margin_x;
      rect.y -= margin_y;
      rect.width += 2 * margin_x;
      rect.height += 2 * margin_y;
      if (mtk_rectangle_intersect (&rect, layout, &rect))
        mtk_region_union_rectangle (grown, &rect);
    }

  mtk_region_union (clip, grown);
}

static gboolean
grow_redraw_clip (MetaStage        *stage,
                  ClutterStageView *view,
                  MtkRegion        *redraw_clip,
                  gpointer          user_data)
{
  ShellDesktopFilterEffect *self = user_data;
  ClutterActor *actor = filtered_actor (self);
  ShellDesktopFilterPicture *picture = g_hash_table_lookup (self->pictures, view);
  MtkRectangle layout;

  if (self->reach == 0.f || !redraw_clip || !picture || picture->clip_grown ||
      !actor || !clutter_actor_is_mapped (actor) ||
      !(picture->scene_stale || clutter_actor_has_damage (actor)))
    return FALSE;

  clutter_stage_view_get_layout (view, &layout);
  grow_rectangles (redraw_clip, &layout,
                   ceilf (layout.width * self->reach),
                   ceilf (layout.height * self->reach));
  picture->clip_grown = TRUE;
  return TRUE;
}

static void
forget_grown_clip (ShellDesktopFilterEffect *self,
                   ClutterStageView         *view)
{
  ShellDesktopFilterPicture *picture = g_hash_table_lookup (self->pictures, view);

  if (picture)
    picture->clip_grown = FALSE;
}

static void
shell_desktop_filter_effect_constructed (GObject *object)
{
  ShellDesktopFilterEffect *self = SHELL_DESKTOP_FILTER_EFFECT (object);

  G_OBJECT_CLASS (shell_desktop_filter_effect_parent_class)->constructed (object);

  self->stage = META_STAGE (shell_global_get_stage (shell_global_get ()));
  self->clip_filter = meta_stage_add_redraw_clip_filter (self->stage, grow_redraw_clip, self, NULL);
  g_signal_connect_object (self->stage, "before-paint",
                           G_CALLBACK (forget_grown_clip), self, G_CONNECT_SWAPPED);
}

static void
shell_desktop_filter_effect_finalize (GObject *object)
{
  ShellDesktopFilterEffect *self = SHELL_DESKTOP_FILTER_EFFECT (object);

  meta_stage_remove_redraw_clip_filter (self->clip_filter);
  g_hash_table_unref (self->pictures);

  G_OBJECT_CLASS (shell_desktop_filter_effect_parent_class)->finalize (object);
}

static void
shell_desktop_filter_effect_class_init (ShellDesktopFilterEffectClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  ClutterEffectClass *effect_class = CLUTTER_EFFECT_CLASS (klass);

  object_class->constructed = shell_desktop_filter_effect_constructed;
  object_class->finalize = shell_desktop_filter_effect_finalize;

  effect_class->paint_node = shell_desktop_filter_effect_paint_node;
  effect_class->modify_paint_volume = shell_desktop_filter_effect_modify_paint_volume;
}

static void
shell_desktop_filter_effect_init (ShellDesktopFilterEffect *self)
{
  self->pictures = g_hash_table_new_full (NULL, NULL, g_object_unref,
                                          (GDestroyNotify) shell_desktop_filter_picture_free);
}

/**
 * shell_desktop_filter_effect_set_fills_view:
 * @self: a #ShellDesktopFilterEffect
 * @fills_view: whether the actor covers its displays, so what the filter
 *   leaves empty stays black instead of showing what was there before
 */
void
shell_desktop_filter_effect_set_fills_view (ShellDesktopFilterEffect *self,
                                            gboolean                  fills_view)
{
  self->fills_view = fills_view;
}

/**
 * shell_desktop_filter_effect_set_view_filter:
 * @self: a #ShellDesktopFilterEffect
 * @view: a stage view
 * @filter: (nullable): what to run over the actor on @view, or %NULL for nothing
 *
 * Its passes read the scene through `filter_area`, the part of the display the
 * picture covers as x, y, width and height, each a share of the display.
 */
void
shell_desktop_filter_effect_set_view_filter (ShellDesktopFilterEffect *self,
                                             ClutterStageView         *view,
                                             ClutterViewFilter        *filter)
{
  if (!filter)
    {
      g_hash_table_remove (self->pictures, view);
      return;
    }

  g_hash_table_replace (self->pictures, g_object_ref (view), shell_desktop_filter_picture_new (filter));
  clutter_effect_queue_repaint (CLUTTER_EFFECT (self));
}

/**
 * shell_desktop_filter_effect_set_reach:
 * @self: a #ShellDesktopFilterEffect
 * @reach: how far the filter can carry a pixel, as a share of the display
 *
 * Whatever changes under the filter is repainted this far around it.
 */
void
shell_desktop_filter_effect_set_reach (ShellDesktopFilterEffect *self,
                                       float                     reach)
{
  self->reach = reach;
}

/**
 * shell_desktop_filter_effect_set_captured:
 * @self: a #ShellDesktopFilterEffect
 * @captured: whether screenshots and recordings show the filter
 */
void
shell_desktop_filter_effect_set_captured (ShellDesktopFilterEffect *self,
                                          gboolean                  captured)
{
  self->captured = captured;
}

/**
 * shell_desktop_filter_effect_queue_frame:
 * @self: a #ShellDesktopFilterEffect
 * @shown: (nullable): the only part of the stage that shows the actor, if any
 *
 * Runs the filter again without painting the actor, and repaints what shows of
 * its result, after a uniform changed.
 */
void
shell_desktop_filter_effect_queue_frame (ShellDesktopFilterEffect *self,
                                         const MtkRegion          *shown)
{
  ClutterActor *actor = filtered_actor (self);
  gboolean mapped = actor && clutter_actor_is_mapped (actor);
  GHashTableIter iter;
  ClutterStageView *view;
  ShellDesktopFilterPicture *picture;

  g_hash_table_iter_init (&iter, self->pictures);
  while (g_hash_table_iter_next (&iter, (gpointer *) &view, (gpointer *) &picture))
    {
      ClutterActorBox box;
      MtkRectangle rect;
      g_autoptr (MtkRegion) repaint = NULL;

      picture->result_stale = TRUE;
      if (!mapped || !picture->scene)
        continue;

      box = shell_desktop_filter_picture_stage_box (picture, view);
      rect = around_box (&box, 0, 0);
      repaint = mtk_region_create_rectangle (&rect);
      if (shown)
        mtk_region_intersect (repaint, shown);

      if (!mtk_region_is_empty (repaint))
        clutter_stage_view_queue_redraw_region (view, repaint);
    }
}
