#pragma once

#include <clutter/clutter.h>

GHashTable *shell_backdrop_cache_new (void);
CoglPipeline *shell_backdrop_capture (GHashTable          *cache,
                                     ClutterActor        *actor,
                                     ClutterPaintContext *context,
                                     ClutterActorBox     *actor_box,
                                     ClutterActorBox     *area,
                                     float                scale,
                                     gboolean            *changed);
