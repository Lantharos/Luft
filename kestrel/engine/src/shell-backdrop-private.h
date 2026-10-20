#pragma once

#include "shell-backdrop.h"

typedef struct
{
  MtkRegion *repainted;
  MtkRegion *looked;
  MtkRegion *spread;
  MtkRegion *changes;
  gboolean seen;
  gboolean changed;
  gboolean behind_changed;
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
void shell_backdrop_mark_behind_changed (GHashTable *cache,
                                         Backdrop   *except);

ShellBackdropBehind *shell_backdrop_behind_new (void);
void shell_backdrop_behind_free (ShellBackdropBehind *behind);
gboolean shell_backdrop_behind_changed (ShellBackdropBehind *behind,
                                        ClutterActor        *actor,
                                        const MtkRegion     *repainted,
                                        const MtkRegion     *blurred,
                                        gboolean            *elsewhere);
