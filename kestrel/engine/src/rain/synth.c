#include "synth.h"

#include <math.h>
#include <string.h>

#define CONTROL_BLOCK 64
#define DROPS 48
#define SWELLS 6
#define FDN 4
#define STORM_FROM 0.75f
#define GAIN 1.12f

/* Mix levels. Small laptop speakers play roughly 200 Hz to 10 kHz, so the bed carries
 * the body, the crackle stays below the fizzy top octave, and the low end starts above
 * the sub-bass that only eats headroom and makes speaker limiters pump. */
#define BED 0.32f
#define CRACKLE 0.8f
#define CRACKLE_TOP 6500.0f
#define DROPS_TOP 7000.0f
#define RUMBLE 0.3f
#define THUNDER_BODY 2.2f
#define THUNDER_ROLL 2.5f

typedef enum
{
  LOWPASS,
  HIGHPASS,
  BANDPASS,
} FilterType;

typedef struct
{
  float b0, b1, b2, a1, a2;
  float z1, z2;
} Biquad;

typedef struct
{
  gboolean active;
  gboolean bubble;
  float amp;
  float envelope;
  float decay;
  float click;
  float click_decay;
  float phase;
  float step;
  float chirp;
  float left;
  float right;
  Biquad body;
} Drop;

typedef struct
{
  float start;
  float attack;
  float decay;
  float gain;
} Swell;

typedef struct
{
  gboolean active;
  gsize position;
  gsize length;
  Swell swells[SWELLS];
  float gain;
  float crack;
  float brown[RAIN_CHANNELS];
  Biquad body[RAIN_CHANNELS];
  Biquad body_high[RAIN_CHANNELS];
  Biquad roll[RAIN_CHANNELS];
  Biquad crack_high[RAIN_CHANNELS];
} Thunder;

struct _RainSynth
{
  guint32 random;
  float intensity;
  float target_intensity;
  float volume;
  float target_volume;
  float fade;
  float gust;
  float gust_target;
  gsize gust_hold;
  gsize control;

  float pink[RAIN_CHANNELS][7];
  Biquad bed_high[RAIN_CHANNELS];
  Biquad bed_low[RAIN_CHANNELS];
  Biquad crackle_high[RAIN_CHANNELS];
  Biquad crackle_low[RAIN_CHANNELS];
  float brown[RAIN_CHANNELS];
  Biquad rumble[RAIN_CHANNELS];
  Biquad rumble_high[RAIN_CHANNELS];
  float bed_gain;
  float dc_in[RAIN_CHANNELS];
  float dc_out[RAIN_CHANNELS];
  Biquad drops_soft[RAIN_CHANNELS];

  Drop drops[DROPS];
  Thunder thunder;
  gsize thunder_wait;

  float *lines[FDN];
  gsize lengths[FDN];
  gsize cursors[FDN];
  float damped[FDN];
};

static const gsize LINE_LENGTHS[FDN] = { 1153, 1471, 1847, 2213 };

static void
biquad_set (Biquad     *filter,
            FilterType  type,
            float       frequency,
            float       q)
{
  float w = 2.0f * G_PI * frequency / RAIN_RATE;
  float alpha = sinf (w) / (2.0f * q);
  float c = cosf (w);
  float a0 = 1.0f + alpha;
  float b0, b1, b2;

  switch (type)
    {
    case LOWPASS:
      b0 = (1.0f - c) / 2.0f;
      b1 = 1.0f - c;
      b2 = b0;
      break;
    case HIGHPASS:
      b0 = (1.0f + c) / 2.0f;
      b1 = -(1.0f + c);
      b2 = b0;
      break;
    case BANDPASS:
    default:
      b0 = alpha;
      b1 = 0.0f;
      b2 = -alpha;
      break;
    }

  filter->b0 = b0 / a0;
  filter->b1 = b1 / a0;
  filter->b2 = b2 / a0;
  filter->a1 = -2.0f * c / a0;
  filter->a2 = (1.0f - alpha) / a0;
}

static inline float
biquad_run (Biquad *filter,
            float   x)
{
  float y = filter->b0 * x + filter->z1;

  filter->z1 = filter->b1 * x - filter->a1 * y + filter->z2;
  filter->z2 = filter->b2 * x - filter->a2 * y;
  return y;
}

static inline float
uniform (RainSynth *synth)
{
  guint32 x = synth->random;

  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  synth->random = x;
  return (x >> 8) * (1.0f / 16777216.0f);
}

static inline float
bipolar (RainSynth *synth)
{
  return 2.0f * uniform (synth) - 1.0f;
}

static inline float
between (RainSynth *synth,
         float      low,
         float      high)
{
  return low + (high - low) * uniform (synth);
}

static inline float
decay_per_sample (float seconds)
{
  return expf (-1.0f / (seconds * RAIN_RATE));
}

static float
pink (float  *state,
      float   white)
{
  float out;

  state[0] = 0.99886f * state[0] + white * 0.0555179f;
  state[1] = 0.99332f * state[1] + white * 0.0750759f;
  state[2] = 0.96900f * state[2] + white * 0.1538520f;
  state[3] = 0.86650f * state[3] + white * 0.3104856f;
  state[4] = 0.55000f * state[4] + white * 0.5329522f;
  state[5] = -0.7616f * state[5] - white * 0.0168980f;
  out = state[0] + state[1] + state[2] + state[3] + state[4] + state[5] + state[6] + white * 0.5362f;
  state[6] = white * 0.115926f;
  return out * 0.11f;
}

static void
spawn_drop (RainSynth *synth,
            gboolean   bubble)
{
  Drop *drop = NULL;
  float pan = uniform (synth);

  for (guint i = 0; i < DROPS; i++)
    {
      if (!synth->drops[i].active)
        {
          drop = &synth->drops[i];
          break;
        }
    }
  if (!drop)
    return;

  *drop = (Drop) {
    .active = TRUE,
    .bubble = bubble,
    .envelope = 1.0f,
    .click = 1.0f,
    .left = sqrtf (1.0f - pan),
    .right = sqrtf (pan),
  };

  if (bubble)
    {
      float seconds = between (synth, 0.004f, 0.014f);
      float rise = between (synth, 1.1f, 1.6f);

      drop->amp = 0.012f * expf (2.2f * uniform (synth));
      drop->decay = decay_per_sample (seconds);
      drop->click_decay = decay_per_sample (0.0004f);
      drop->step = 2.0f * G_PI * between (synth, 1400.0f, 4200.0f) / RAIN_RATE;
      drop->chirp = expf (logf (rise) / (seconds * 3.0f * RAIN_RATE));
      biquad_set (&drop->body, LOWPASS, 5000.0f, 0.7f);
    }
  else
    {
      drop->amp = 0.035f * expf (2.6f * uniform (synth));
      drop->decay = decay_per_sample (between (synth, 0.0008f, 0.0025f));
      biquad_set (&drop->body, BANDPASS, between (synth, 700.0f, 3800.0f), between (synth, 2.5f, 8.0f));
    }
}

static inline void
run_drop (RainSynth *synth,
          Drop      *drop,
          float     *left,
          float     *right)
{
  float sample;

  if (drop->bubble)
    {
      sample = drop->amp * (drop->envelope * sinf (drop->phase) +
                            0.4f * biquad_run (&drop->body, drop->click * bipolar (synth)));
      drop->phase += drop->step;
      drop->step *= drop->chirp;
      drop->click *= drop->click_decay;
    }
  else
    sample = drop->amp * 6.0f * biquad_run (&drop->body, drop->envelope * bipolar (synth));

  drop->envelope *= drop->decay;
  if (drop->envelope < 1e-4f)
    drop->active = FALSE;

  *left += sample * drop->left;
  *right += sample * drop->right;
}

static void
start_thunder (RainSynth *synth)
{
  Thunder *thunder = &synth->thunder;
  float distance = uniform (synth);
  guint swells = 3 + (guint) (uniform (synth) * (SWELLS - 2));
  float end = 0.0f;

  memset (thunder, 0, sizeof (*thunder));
  thunder->active = TRUE;
  thunder->gain = 0.22f * (1.0f - 0.6f * distance);
  thunder->crack = distance < 0.35f ? 0.3f * (1.0f - distance / 0.35f) : 0.0f;

  for (guint i = 0; i < SWELLS; i++)
    {
      Swell *swell = &thunder->swells[i];

      if (i >= swells)
        break;
      swell->start = i == 0 ? 0.0f : between (synth, 0.2f, 4.5f);
      swell->attack = between (synth, 0.15f, 0.9f) * (1.0f + distance);
      swell->decay = between (synth, 0.8f, 2.8f) * (1.0f + distance);
      swell->gain = i == 0 ? 1.0f : between (synth, 0.35f, 0.9f);
      end = MAX (end, swell->start + swell->attack + swell->decay * 5.0f);
    }
  thunder->length = (gsize) (end * RAIN_RATE);

  for (guint c = 0; c < RAIN_CHANNELS; c++)
    {
      biquad_set (&thunder->body[c], LOWPASS, 90.0f + 140.0f * (1.0f - distance), 0.7f);
      biquad_set (&thunder->body_high[c], HIGHPASS, 45.0f, 0.7f);
      biquad_set (&thunder->roll[c], LOWPASS, 300.0f + 300.0f * (1.0f - distance), 0.7f);
      biquad_set (&thunder->crack_high[c], HIGHPASS, 900.0f, 0.7f);
    }
}

static inline float
thunder_envelope (Thunder *thunder)
{
  float t = (float) thunder->position / RAIN_RATE;
  float envelope = 0.0f;

  for (guint i = 0; i < SWELLS; i++)
    {
      Swell *swell = &thunder->swells[i];
      float local = t - swell->start;

      if (swell->gain == 0.0f || local < 0.0f)
        continue;
      if (local < swell->attack)
        envelope += swell->gain * 0.5f * (1.0f - cosf (G_PI * local / swell->attack));
      else
        envelope += swell->gain * expf (-(local - swell->attack) / swell->decay);
    }
  return envelope;
}

static inline void
run_thunder (RainSynth *synth,
             float     *left,
             float     *right)
{
  Thunder *thunder = &synth->thunder;
  float envelope = thunder_envelope (thunder);
  float t = (float) thunder->position / RAIN_RATE;
  float crack = thunder->crack * expf (-t / 0.09f);
  float *out[RAIN_CHANNELS] = { left, right };

  for (guint c = 0; c < RAIN_CHANNELS; c++)
    {
      float white = bipolar (synth);

      thunder->brown[c] = 0.997f * thunder->brown[c] + 0.04f * white;
      *out[c] += thunder->gain * envelope * (THUNDER_BODY * biquad_run (&thunder->body_high[c],
                                                                       biquad_run (&thunder->body[c], thunder->brown[c])) +
                                             THUNDER_ROLL * biquad_run (&thunder->roll[c], white));
      *out[c] += crack * biquad_run (&thunder->crack_high[c], white);
    }

  if (++thunder->position >= thunder->length)
    thunder->active = FALSE;
}

static void
update_controls (RainSynth *synth)
{
  float smooth = 1.0f - expf (-(float) CONTROL_BLOCK / (1.5f * RAIN_RATE));
  float gust_smooth = 1.0f - expf (-(float) CONTROL_BLOCK / (2.5f * RAIN_RATE));
  float storm;
  float cutoff;

  synth->intensity += (synth->target_intensity - synth->intensity) * smooth;

  if (synth->gust_hold <= CONTROL_BLOCK)
    {
      synth->gust_target = between (synth, 0.65f, 1.35f);
      synth->gust_hold = (gsize) (between (synth, 1.5f, 5.0f) * RAIN_RATE);
    }
  else
    synth->gust_hold -= CONTROL_BLOCK;
  synth->gust += (synth->gust_target - synth->gust) * gust_smooth;

  cutoff = (2600.0f + 6000.0f * synth->intensity) * (0.8f + 0.2f * synth->gust);
  for (guint c = 0; c < RAIN_CHANNELS; c++)
    biquad_set (&synth->bed_low[c], LOWPASS, cutoff, 0.6f);
  synth->bed_gain = (0.25f + 0.75f * synth->intensity) * synth->gust;

  storm = CLAMP ((synth->intensity - STORM_FROM) / (1.0f - STORM_FROM), 0.0f, 1.0f);
  if (storm <= 0.0f || synth->thunder.active)
    return;
  if (synth->thunder_wait > CONTROL_BLOCK)
    {
      synth->thunder_wait -= CONTROL_BLOCK;
      return;
    }
  start_thunder (synth);
  synth->thunder_wait = (gsize) (between (synth, 20.0f, 60.0f) / MAX (storm, 0.3f) * RAIN_RATE);
}

void
rain_synth_render (RainSynth *synth,
                   float     *stereo,
                   gsize      frames)
{
  for (gsize frame = 0; frame < frames; frame++)
    {
      float shared = bipolar (synth);
      float dry[RAIN_CHANNELS] = { 0.0f, 0.0f };
      float drops[RAIN_CHANNELS] = { 0.0f, 0.0f };
      float wet[RAIN_CHANNELS] = { 0.0f, 0.0f };
      float intensity, crackle_rate, gain;
      float feedback[FDN];
      float mixed = 0.0f;

      if (synth->control++ % CONTROL_BLOCK == 0)
        update_controls (synth);

      intensity = synth->intensity;
      crackle_rate = (1500.0f + 9000.0f * intensity) * synth->gust / RAIN_RATE;

      for (guint c = 0; c < RAIN_CHANNELS; c++)
        {
          float white = 0.6f * bipolar (synth) + 0.4f * shared;
          float bed = biquad_run (&synth->bed_low[c], biquad_run (&synth->bed_high[c], pink (synth->pink[c], white)));
          float impulse = 0.0f;

          if (uniform (synth) < crackle_rate)
            {
              float strength = uniform (synth);
              impulse = (bipolar (synth) > 0.0f ? 1.0f : -1.0f) * strength * strength * strength;
            }

          synth->brown[c] = 0.998f * synth->brown[c] + 0.02f * white;
          dry[c] += BED * synth->bed_gain * bed;
          dry[c] += CRACKLE * (0.35f + 0.4f * intensity) * synth->gust *
                    biquad_run (&synth->crackle_low[c], biquad_run (&synth->crackle_high[c], impulse));
          dry[c] += RUMBLE * intensity * intensity * synth->gust *
                    biquad_run (&synth->rumble[c], biquad_run (&synth->rumble_high[c], synth->brown[c]));
        }

      if (uniform (synth) < (3.0f + 30.0f * intensity) / RAIN_RATE)
        spawn_drop (synth, TRUE);
      if (uniform (synth) < (2.0f + 26.0f * intensity) / RAIN_RATE)
        spawn_drop (synth, FALSE);
      for (guint i = 0; i < DROPS; i++)
        {
          if (synth->drops[i].active)
            run_drop (synth, &synth->drops[i], &drops[0], &drops[1]);
        }
      for (guint c = 0; c < RAIN_CHANNELS; c++)
        drops[c] = biquad_run (&synth->drops_soft[c], drops[c]);

      for (guint k = 0; k < FDN; k++)
        {
          float out = synth->lines[k][synth->cursors[k]];

          synth->damped[k] += 0.4f * (out - synth->damped[k]);
          mixed += synth->damped[k];
          wet[k % RAIN_CHANNELS] += out;
        }
      for (guint k = 0; k < FDN; k++)
        feedback[k] = synth->damped[k] - 0.5f * mixed;
      for (guint k = 0; k < FDN; k++)
        {
          synth->lines[k][synth->cursors[k]] = drops[k < 2 ? 0 : 1] + 0.62f * feedback[k];
          synth->cursors[k] = (synth->cursors[k] + 1) % synth->lengths[k];
        }

      if (synth->thunder.active)
        run_thunder (synth, &dry[0], &dry[1]);

      /* Volume glides every sample, so moving the slider never steps in 64-sample stairs. */
      synth->volume += (synth->target_volume - synth->volume) * synth->fade;
      gain = GAIN * (1.0f - 0.45f * intensity) * synth->volume;
      for (guint c = 0; c < RAIN_CHANNELS; c++)
        {
          float sample = dry[c] + drops[c] + 0.3f * wet[c];

          /* A DC blocker keeps the leaky brown noise from parking an offset on the speaker. */
          synth->dc_out[c] = sample - synth->dc_in[c] + 0.9985f * synth->dc_out[c];
          synth->dc_in[c] = sample;
          stereo[frame * RAIN_CHANNELS + c] = tanhf (synth->dc_out[c] * gain);
        }
    }
}

void
rain_synth_set (RainSynth *synth,
                float      intensity,
                float      volume)
{
  synth->target_intensity = CLAMP (intensity, 0.0f, 1.0f);
  synth->target_volume = CLAMP (volume, 0.0f, 1.0f);
}

void
rain_synth_jump (RainSynth *synth)
{
  synth->intensity = synth->target_intensity;
  synth->volume = synth->target_volume;
}

gboolean
rain_synth_silent (RainSynth *synth)
{
  return synth->target_volume == 0.0f && synth->volume < 1e-4f;
}

RainSynth *
rain_synth_new (guint32 seed)
{
  RainSynth *synth = g_new0 (RainSynth, 1);

  synth->random = seed ? seed : 0x9e3779b9;
  synth->gust = 1.0f;
  synth->gust_target = 1.0f;
  synth->fade = 1.0f - expf (-1.0f / (0.25f * RAIN_RATE));
  synth->thunder_wait = (gsize) (between (synth, 6.0f, 15.0f) * RAIN_RATE);

  for (guint c = 0; c < RAIN_CHANNELS; c++)
    {
      biquad_set (&synth->bed_high[c], HIGHPASS, 150.0f, 0.7f);
      biquad_set (&synth->bed_low[c], LOWPASS, 6000.0f, 0.6f);
      biquad_set (&synth->crackle_high[c], HIGHPASS, 1800.0f, 0.7f);
      biquad_set (&synth->crackle_low[c], LOWPASS, CRACKLE_TOP, 0.7f);
      biquad_set (&synth->rumble[c], LOWPASS, 340.0f, 0.7f);
      biquad_set (&synth->rumble_high[c], HIGHPASS, 55.0f, 0.7f);
      biquad_set (&synth->drops_soft[c], LOWPASS, DROPS_TOP, 0.6f);
    }

  for (guint k = 0; k < FDN; k++)
    {
      synth->lengths[k] = LINE_LENGTHS[k];
      synth->lines[k] = g_new0 (float, LINE_LENGTHS[k]);
    }

  return synth;
}

void
rain_synth_free (RainSynth *synth)
{
  for (guint k = 0; k < FDN; k++)
    g_free (synth->lines[k]);
  g_free (synth);
}
