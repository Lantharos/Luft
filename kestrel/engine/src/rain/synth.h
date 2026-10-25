#pragma once

#include <glib.h>

#define RAIN_RATE 48000
#define RAIN_CHANNELS 2

typedef struct _RainSynth RainSynth;

RainSynth *rain_synth_new    (guint32    seed);
void       rain_synth_free   (RainSynth *synth);
void       rain_synth_set    (RainSynth *synth,
                              float      intensity,
                              float      volume);
void       rain_synth_jump   (RainSynth *synth);
void       rain_synth_render (RainSynth *synth,
                              float     *stereo,
                              gsize      frames);
gboolean   rain_synth_silent (RainSynth *synth);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (RainSynth, rain_synth_free)
