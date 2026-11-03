#pragma once

#include <gio/gio.h>

typedef struct _RainMix RainMix;

RainMix  *rain_mix_new    (guint32    seed,
                           GError   **error);
void      rain_mix_free   (RainMix   *mix);
void      rain_mix_set    (RainMix   *mix,
                           float      intensity,
                           float      volume);
void      rain_mix_jump   (RainMix   *mix);
void      rain_mix_render (RainMix   *mix,
                           float     *stereo,
                           gsize      frames);
gboolean  rain_mix_silent (RainMix   *mix);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (RainMix, rain_mix_free)
