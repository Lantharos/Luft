#include "config.h"

#include <string.h>

#include "shell-backdrop-private.h"

#define PRINT_SEED 0xcbf29ce484222325
#define PRINT_PRIME 0x100000001b3

gboolean clutter_actor_has_damage (ClutterActor *actor);

typedef struct
{
  ClutterActor *actor;
  ClutterActorBox box;
  gboolean bounded;
} Placement;

struct _ShellBackdropBehind
{
  GArray *placements;
  GArray *previous;
  guint64 print;
};

ShellBackdropBehind *
shell_backdrop_behind_new (void)
{
  ShellBackdropBehind *behind = g_new0 (ShellBackdropBehind, 1);

  behind->placements = g_array_new (FALSE, FALSE, sizeof (Placement));
  behind->previous = g_array_new (FALSE, FALSE, sizeof (Placement));
  return behind;
}

void
shell_backdrop_behind_free (ShellBackdropBehind *behind)
{
  g_array_unref (behind->placements);
  g_array_unref (behind->previous);
  g_free (behind);
}

static guint64
mix (guint64 print,
     guint64 value)
{
  return (print ^ value) * PRINT_PRIME;
}

static guint64
mix_float (guint64 print,
           float   value)
{
  guint32 bits;

  memcpy (&bits, &value, sizeof bits);
  return mix (print, bits);
}

static guint64
mix_clip (guint64       print,
          ClutterActor *actor)
{
  float x, y, width, height;

  if (!clutter_actor_has_clip (actor))
    return mix (print, 0);

  clutter_actor_get_clip (actor, &x, &y, &width, &height);
  print = mix_float (print, x);
  print = mix_float (print, y);
  print = mix_float (print, width);
  return mix_float (print, height);
}

static gboolean
paints (ClutterActor *actor)
{
  return clutter_actor_is_mapped (actor) && clutter_actor_get_opacity (actor) > 0;
}

static gboolean
has_damaged_child (ClutterActor *parent)
{
  ClutterActor *child;

  for (child = clutter_actor_get_first_child (parent); child;
       child = clutter_actor_get_next_sibling (child))
    {
      if (paints (child) && clutter_actor_has_damage (child))
        return TRUE;
    }

  return FALSE;
}

static const Placement *
previous_placement (ShellBackdropBehind *behind,
                    ClutterActor        *actor)
{
  guint i;

  for (i = 0; i < behind->previous->len; i++)
    {
      const Placement *placement = &g_array_index (behind->previous, Placement, i);

      if (placement->actor == actor)
        return placement;
    }

  return NULL;
}

static gboolean
box_reaches (const ClutterActorBox *box,
             const MtkRegion       *region)
{
  graphene_rect_t bounds = GRAPHENE_RECT_INIT (box->x1, box->y1,
                                               box->x2 - box->x1,
                                               box->y2 - box->y1);
  MtkRectangle rect;

  mtk_rectangle_from_graphene_rect (&bounds, MTK_ROUNDING_STRATEGY_GROW, &rect);
  return mtk_region_contains_rectangle (region, &rect) != MTK_REGION_OVERLAP_OUT;
}

static gboolean
damage_reaches (const Placement *placement,
                const Placement *before,
                const MtkRegion *region)
{
  if (!placement->bounded || (before && !before->bounded))
    return TRUE;

  return box_reaches (&placement->box, region) ||
    (before && box_reaches (&before->box, region));
}

BehindChange
shell_backdrop_behind_look (ShellBackdropBehind *behind,
                            ClutterActor        *actor,
                            const MtkRegion     *repainted,
                            const MtkRegion     *blurred,
                            BehindChange        *elsewhere)
{
  guint64 print = PRINT_SEED;
  gboolean rearranged = FALSE;
  gboolean repainted_here = FALSE;
  gboolean repainted_elsewhere = FALSE;
  ClutterActor *child, *parent;
  GArray *swap;

  g_array_set_size (behind->placements, 0);
  for (child = actor; (parent = clutter_actor_get_parent (child)); child = parent)
    {
      ClutterActor *sibling;

      rearranged |= clutter_actor_has_damage (parent) && !has_damaged_child (parent);
      print = mix (print, GPOINTER_TO_SIZE (parent));
      print = mix (print, clutter_actor_get_opacity (parent));
      print = mix_clip (print, parent);
      for (sibling = clutter_actor_get_first_child (parent); sibling != child;
           sibling = clutter_actor_get_next_sibling (sibling))
        {
          Placement placement = { .actor = sibling };
          const Placement *before;

          if (!paints (sibling))
            continue;

          print = mix (print, GPOINTER_TO_SIZE (sibling));
          placement.bounded = clutter_actor_get_paint_box (sibling, &placement.box);
          g_array_append_val (behind->placements, placement);
          if (!clutter_actor_has_damage (sibling))
            continue;

          before = previous_placement (behind, sibling);
          repainted_elsewhere |= damage_reaches (&placement, before, repainted);
          repainted_here |= damage_reaches (&placement, before, blurred);
        }
    }

  rearranged |= print != behind->print;
  behind->print = print;
  swap = behind->previous;
  behind->previous = behind->placements;
  behind->placements = swap;

  if (rearranged)
    {
      *elsewhere = BEHIND_REARRANGED;
      return BEHIND_REARRANGED;
    }

  *elsewhere = repainted_elsewhere ? BEHIND_REPAINTED : BEHIND_SAME;
  return repainted_here ? BEHIND_REPAINTED : BEHIND_SAME;
}
