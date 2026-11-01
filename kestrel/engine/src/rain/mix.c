#include "mix.h"

#include <math.h>

#include "clips.h"

#define CONTROL_BLOCK 64
#define LAYERS 3
#define THUNDERS 5
#define STORM_FROM 0.75f
#define BUILD_UP_S 1.4f
#define WIND_DOWN_S 1.0f
#define SCALE (1.0f / 32768.0f)

static const char *const LAYER_NAMES[LAYERS] = { "drizzle", "rain", "downpour" };
static const float LAYER_INTENSITY[LAYERS] = { 0.25f, 0.6f, 1.0f };

typedef struct
{
  const RainClip *clip;
  gsize cursor;
  float gain;
  float left;
  float right;
} Thunder;

struct _RainMix
{
  guint32 random;
  RainClip layers[LAYERS];
  gsize cursors[LAYERS];
  float gains[LAYERS];
  RainClip thunders[THUNDERS];
  Thunder thunder;
  guint last_thunder;
  gsize thunder_wait;
  gsize control;

  float intensity;
  float target_intensity;
  float volume;
  float target_volume;
  float presence;
  float target_presence;
  float glide;
  float fade;
  float build_up;
  float wind_down;
};

static inline float
uniform (RainMix *mix)
{
  guint32 x = mix->random;

  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  mix->random = x;
  return (x >> 8) * (1.0f / 16777216.0f);
}

static inline float
between (RainMix *mix,
         float    low,
         float    high)
{
  return low + (high - low) * uniform (mix);
}

static inline float
glide_per_sample (float seconds)
{
  return 1.0f - expf (-1.0f / (seconds * RAIN_RATE));
}

static void
update_gains (RainMix *mix)
{
  float intensity = mix->intensity;

  for (guint i = 0; i < LAYERS; i++)
    mix->gains[i] = 0.0f;

  if (intensity <= LAYER_INTENSITY[0])
    {
      mix->gains[0] = intensity / LAYER_INTENSITY[0];
      return;
    }
  for (guint i = 0; i + 1 < LAYERS; i++)
    {
      if (intensity <= LAYER_INTENSITY[i + 1])
        {
          float t = (intensity - LAYER_INTENSITY[i]) / (LAYER_INTENSITY[i + 1] - LAYER_INTENSITY[i]);

          mix->gains[i] = cosf (t * G_PI_2);
          mix->gains[i + 1] = sinf (t * G_PI_2);
          return;
        }
    }
  mix->gains[LAYERS - 1] = 1.0f;
}

static void
start_thunder (RainMix *mix,
               float    storm)
{
  guint pick = (mix->last_thunder + 1 + (guint) (uniform (mix) * (THUNDERS - 1))) % THUNDERS;
  float angle = (0.5f + between (mix, -0.3f, 0.3f)) * G_PI_2;

  mix->last_thunder = pick;
  mix->thunder = (Thunder) {
    .clip = &mix->thunders[pick],
    .gain = between (mix, 0.55f, 1.0f) * (0.4f + 0.6f * storm),
    .left = cosf (angle) * G_SQRT2,
    .right = sinf (angle) * G_SQRT2,
  };
}

static void
update_controls (RainMix *mix)
{
  float smooth = 1.0f - expf (-(float) CONTROL_BLOCK / (1.5f * RAIN_RATE));
  float storm;

  mix->intensity += (mix->target_intensity - mix->intensity) * smooth;
  update_gains (mix);

  storm = CLAMP ((mix->intensity - STORM_FROM) / (1.0f - STORM_FROM), 0.0f, 1.0f);
  if (storm <= 0.0f || mix->thunder.clip)
    return;
  if (mix->thunder_wait > CONTROL_BLOCK)
    {
      mix->thunder_wait -= CONTROL_BLOCK;
      return;
    }
  start_thunder (mix, storm);
  mix->thunder_wait = (gsize) (between (mix, 20.0f, 60.0f) / MAX (storm, 0.3f) * RAIN_RATE);
}

static inline void
add_thunder (Thunder *thunder,
             float   *left,
             float   *right)
{
  const gint16 *frame = thunder->clip->samples + thunder->cursor * RAIN_CHANNELS;

  *left += frame[0] * SCALE * thunder->gain * thunder->left;
  *right += frame[1] * SCALE * thunder->gain * thunder->right;
  if (++thunder->cursor >= thunder->clip->frames)
    thunder->clip = NULL;
}

void
rain_mix_render (RainMix *mix,
                 float   *stereo,
                 gsize    frames)
{
  for (gsize frame = 0; frame < frames; frame++)
    {
      float left = 0.0f;
      float right = 0.0f;
      float gain;

      if (mix->control++ % CONTROL_BLOCK == 0)
        update_controls (mix);

      for (guint i = 0; i < LAYERS; i++)
        {
          const RainClip *layer = &mix->layers[i];

          if (mix->gains[i] > 0.0f)
            {
              const gint16 *sample = layer->samples + mix->cursors[i] * RAIN_CHANNELS;

              left += sample[0] * SCALE * mix->gains[i];
              right += sample[1] * SCALE * mix->gains[i];
            }
          if (++mix->cursors[i] >= layer->frames)
            mix->cursors[i] = 0;
        }
      if (mix->thunder.clip)
        add_thunder (&mix->thunder, &left, &right);

      /* Volume glides every sample, so moving the slider never steps in 64-sample stairs. */
      mix->volume += (mix->target_volume - mix->volume) * mix->fade;
      mix->presence += (mix->target_presence - mix->presence) *
                       (mix->target_presence > mix->presence ? mix->build_up : mix->wind_down);
      gain = mix->volume * mix->presence;
      stereo[frame * RAIN_CHANNELS] = tanhf (left * gain);
      stereo[frame * RAIN_CHANNELS + 1] = tanhf (right * gain);
    }
}

void
rain_mix_set (RainMix *mix,
              float    intensity,
              float    volume)
{
  mix->target_intensity = CLAMP (intensity, 0.0f, 1.0f);
  mix->target_presence = volume > 0.0f ? 1.0f : 0.0f;
  if (volume > 0.0f)
    mix->target_volume = CLAMP (volume, 0.0f, 1.0f);
}

void
rain_mix_jump (RainMix *mix)
{
  mix->intensity = mix->target_intensity;
  mix->volume = mix->target_volume;
  mix->presence = mix->target_presence;
}

gboolean
rain_mix_silent (RainMix *mix)
{
  return mix->target_presence == 0.0f && mix->presence < 1e-4f;
}

RainMix *
rain_mix_new (guint32   seed,
              GError  **error)
{
  g_autoptr (RainMix) mix = g_new0 (RainMix, 1);

  mix->random = seed ? seed : 0x9e3779b9;
  mix->fade = glide_per_sample (0.25f);
  mix->build_up = glide_per_sample (BUILD_UP_S);
  mix->wind_down = glide_per_sample (WIND_DOWN_S);
  mix->last_thunder = (guint) (uniform (mix) * THUNDERS);
  mix->thunder_wait = (gsize) (between (mix, 6.0f, 15.0f) * RAIN_RATE);

  for (guint i = 0; i < LAYERS; i++)
    {
      if (!rain_clip_load (LAYER_NAMES[i], &mix->layers[i], error))
        return NULL;
      mix->cursors[i] = (gsize) (uniform (mix) * mix->layers[i].frames);
    }
  for (guint i = 0; i < THUNDERS; i++)
    {
      g_autofree char *name = g_strdup_printf ("thunder-%u", i + 1);

      if (!rain_clip_load (name, &mix->thunders[i], error))
        return NULL;
    }

  return g_steal_pointer (&mix);
}

void
rain_mix_free (RainMix *mix)
{
  for (guint i = 0; i < LAYERS; i++)
    rain_clip_clear (&mix->layers[i]);
  for (guint i = 0; i < THUNDERS; i++)
    rain_clip_clear (&mix->thunders[i]);
  g_free (mix);
}
