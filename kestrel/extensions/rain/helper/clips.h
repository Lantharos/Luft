#pragma once

#include <gio/gio.h>

#define RAIN_RATE 48000
#define RAIN_CHANNELS 2

typedef struct
{
  gint16 *samples;
  gsize frames;
} RainClip;

gboolean rain_clip_load  (const char  *name,
                          RainClip    *clip,
                          GError     **error);
void     rain_clip_clear (RainClip    *clip);
