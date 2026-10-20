#include "config.h"

#include <math.h>
#include <meta/meta-stage.h>

#include "shell-backdrop-private.h"
#include "shell-global.h"

static GList *spreads;

struct _ShellBackdropSpread
{
  ClutterActorMeta *effect;
  GHashTable *cache;
  ShellBackdropBehind *behind;
  MetaStage *stage;
  MetaStageRedrawClipFilter *filter;
  gulong before_paint_id;
  float reach;
};

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
shows_blur (ShellBackdropSpread *spread,
            ClutterActor        *actor,
            ClutterStageView    *view,
            MtkRectangle        *area)
{
  return spread->reach > 0.f && actor &&
    clutter_actor_meta_get_enabled (spread->effect) &&
    clutter_actor_is_mapped (actor) &&
    clutter_actor_get_paint_opacity (actor) > 0 &&
    blurred_area (actor, view, area);
}

static MtkRegion *
view_region (ClutterStageView *view)
{
  MtkRectangle layout;

  clutter_stage_view_get_layout (view, &layout);
  return mtk_region_create_rectangle (&layout);
}

static MtkRegion *
take_changes (BackdropFrame *frame)
{
  MtkRegion *changes = g_steal_pointer (&frame->changes);

  frame->changes = mtk_region_create ();
  return changes;
}

static void
note_change (BackdropFrame   *frame,
             const MtkRegion *changed)
{
  mtk_region_union (frame->changes, changed);
  frame->changed = TRUE;
}

static gboolean
other_glass_refreshes (ShellBackdropSpread *spread,
                       ClutterStageView    *view,
                       const MtkRegion     *blurred)
{
  GList *l;

  for (l = spreads; l; l = l->next)
    {
      ShellBackdropSpread *other = l->data;
      Backdrop *backdrop = other == spread ? NULL : g_hash_table_lookup (other->cache, view);
      g_autoptr (MtkRegion) overlap = NULL;

      if (!backdrop || !backdrop->frame.changed)
        continue;

      overlap = mtk_region_copy (backdrop->frame.spread);
      mtk_region_intersect (overlap, blurred);
      if (!mtk_region_is_empty (overlap))
        return TRUE;
    }

  return FALSE;
}

static void
look_behind (ShellBackdropSpread *spread,
             Backdrop            *backdrop,
             ClutterActor        *actor,
             MtkRegion           *redraw_clip,
             const MtkRectangle  *area)
{
  BackdropFrame *frame = &backdrop->frame;
  gboolean changed, elsewhere;

  frame->seen = TRUE;
  frame->repainted = redraw_clip ? mtk_region_ref (redraw_clip) : view_region (backdrop->view);
  g_clear_pointer (&frame->looked, mtk_region_unref);
  frame->looked = mtk_region_copy (frame->repainted);
  mtk_region_intersect_rectangle (frame->looked, area);
  changed = shell_backdrop_behind_changed (spread->behind, actor,
                                           frame->repainted, frame->looked,
                                           &elsewhere);
  if (elsewhere)
    shell_backdrop_mark_behind_changed (spread->cache, backdrop);
  changed |= frame->behind_changed ||
    other_glass_refreshes (spread, backdrop->view, frame->looked);
  frame->behind_changed = FALSE;

  if (changed && !mtk_region_is_empty (frame->looked))
    note_change (frame, frame->looked);
}

static void
look_at_growth (ShellBackdropSpread *spread,
                BackdropFrame       *frame,
                const MtkRegion     *redraw_clip,
                const MtkRectangle  *area)
{
  g_autoptr (MtkRegion) grown = mtk_region_copy (redraw_clip);

  mtk_region_intersect_rectangle (grown, area);
  mtk_region_subtract (grown, frame->looked);
  mtk_region_subtract (grown, frame->spread);
  if (mtk_region_is_empty (grown))
    return;

  mtk_region_union (frame->looked, grown);
  note_change (frame, grown);
}

static gboolean
spread_reach (ShellBackdropSpread *spread,
              BackdropFrame       *frame,
              ClutterStageView    *view,
              MtkRegion           *redraw_clip,
              const MtkRectangle  *area)
{
  g_autoptr (MtkRegion) changed = take_changes (frame);
  g_autoptr (MtkRegion) repaint = NULL;
  int reach, i;

  if (!redraw_clip)
    return FALSE;

  mtk_region_union (changed, redraw_clip);
  mtk_region_intersect_rectangle (changed, area);
  mtk_region_subtract (changed, frame->spread);
  if (mtk_region_is_empty (changed))
    return FALSE;

  mtk_region_union (frame->spread, changed);
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
  mtk_region_intersect_rectangle (repaint, area);
  mtk_region_subtract (repaint, redraw_clip);
  if (mtk_region_is_empty (repaint))
    return FALSE;

  mtk_region_union (frame->spread, repaint);
  mtk_region_union (redraw_clip, repaint);
  return TRUE;
}

static gboolean
spread_redraw_clip (MetaStage        *stage,
                    ClutterStageView *view,
                    MtkRegion        *redraw_clip,
                    gpointer          user_data)
{
  ShellBackdropSpread *spread = user_data;
  ClutterActor *actor = clutter_actor_meta_get_actor (spread->effect);
  Backdrop *backdrop = shell_backdrop_for_view (spread->cache, view);
  BackdropFrame *frame = &backdrop->frame;
  MtkRectangle area;

  if (!shows_blur (spread, actor, view, &area))
    {
      shell_backdrop_forget (backdrop);
      return FALSE;
    }

  if (!frame->seen)
    look_behind (spread, backdrop, actor, redraw_clip, &area);
  else if (redraw_clip)
    look_at_growth (spread, frame, redraw_clip, &area);

  if (frame->changed)
    return spread_reach (spread, frame, view, redraw_clip, &area);

  return FALSE;
}

static void
forget_frame (ShellBackdropSpread *spread,
              ClutterStageView    *view)
{
  Backdrop *backdrop = g_hash_table_lookup (spread->cache, view);

  if (!backdrop)
    return;

  backdrop->frame.seen = FALSE;
  backdrop->frame.changed = FALSE;
  g_clear_pointer (&backdrop->frame.repainted, mtk_region_unref);
  g_clear_pointer (&backdrop->frame.looked, mtk_region_unref);
  if (mtk_region_is_empty (backdrop->frame.spread))
    return;

  g_clear_pointer (&backdrop->frame.spread, mtk_region_unref);
  backdrop->frame.spread = mtk_region_create ();
}

ShellBackdropSpread *
shell_backdrop_spread_new (ClutterActorMeta *effect,
                           GHashTable       *cache)
{
  ShellBackdropSpread *spread = g_new0 (ShellBackdropSpread, 1);

  spread->effect = effect;
  spread->cache = cache;
  spread->behind = shell_backdrop_behind_new ();
  spread->stage = META_STAGE (shell_global_get_stage (shell_global_get ()));
  spread->filter = meta_stage_add_redraw_clip_filter (spread->stage,
                                                      spread_redraw_clip,
                                                      spread, NULL);
  spread->before_paint_id = g_signal_connect_swapped (spread->stage, "before-paint",
                                                      G_CALLBACK (forget_frame),
                                                      spread);
  spreads = g_list_prepend (spreads, spread);
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
  spreads = g_list_remove (spreads, spread);
  meta_stage_remove_redraw_clip_filter (spread->filter);
  g_clear_signal_handler (&spread->before_paint_id, spread->stage);
  shell_backdrop_behind_free (spread->behind);
  g_free (spread);
}
