#pragma once

#include <clutter/clutter.h>

typedef struct _ShellBackdropSpread ShellBackdropSpread;

GHashTable *shell_backdrop_cache_new (void);
CoglPipeline *shell_backdrop_capture (GHashTable          *cache,
                                     ClutterActor        *actor,
                                     ClutterPaintContext *context,
                                     ClutterActorBox     *actor_box,
                                     ClutterActorBox     *area,
                                     float                scale,
                                     gboolean            *changed);

ShellBackdropSpread *shell_backdrop_spread_new (ClutterActorMeta *effect,
                                                GHashTable       *cache);
void shell_backdrop_spread_set_reach (ShellBackdropSpread *spread,
                                      float                reach);
void shell_backdrop_spread_free (ShellBackdropSpread *spread);
