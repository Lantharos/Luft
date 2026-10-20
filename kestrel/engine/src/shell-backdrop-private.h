#pragma once

#include "shell-backdrop.h"

typedef enum
{
  BEHIND_SAME,
  BEHIND_REPAINTED,
  BEHIND_REARRANGED,
} BehindChange;

typedef struct
{
  MtkRegion *repainted;
  MtkRegion *looked;
  MtkRegion *spread;
  MtkRegion *deferred;
  gboolean seen;
  gboolean refresh;
  gboolean changed;
  BehindChange behind;
  int64_t changing_since;
  int64_t last_change;
  int64_t last_refresh;
} BackdropFrame;

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
  BackdropFrame frame;
} Backdrop;

typedef struct _ShellBackdropBehind ShellBackdropBehind;

Backdrop *shell_backdrop_for_view (GHashTable       *cache,
                                   ClutterStageView *view);
void shell_backdrop_forget (Backdrop *backdrop);
void shell_backdrop_mark_behind (GHashTable   *cache,
                                 Backdrop     *except,
                                 BehindChange  change);

ShellBackdropBehind *shell_backdrop_behind_new (void);
void shell_backdrop_behind_free (ShellBackdropBehind *behind);
BehindChange shell_backdrop_behind_look (ShellBackdropBehind *behind,
                                         ClutterActor        *actor,
                                         const MtkRegion     *repainted,
                                         const MtkRegion     *blurred,
                                         BehindChange        *elsewhere);
