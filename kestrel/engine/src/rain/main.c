#include <errno.h>
#include <gio/gio.h>
#include <pipewire/pipewire.h>
#include <spa/param/audio/format-utils.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#include "synth.h"

#define QUANTUM "1024/48000"
#define COMMAND_LIMIT 256
#define CLOSE_DEADLINE_S 3

typedef struct
{
  struct pw_main_loop *loop;
  struct pw_stream *stream;
  struct spa_hook stream_listener;
  RainSynth *synth;
  GString *pending;
  struct spa_source *deadline;
  gboolean closing;
} Rain;

static void
on_process (void *data)
{
  Rain *rain = data;
  struct pw_buffer *buffer = pw_stream_dequeue_buffer (rain->stream);
  struct spa_data *block;
  gsize stride = RAIN_CHANNELS * sizeof (float);
  gsize frames;

  if (!buffer)
    return;

  block = &buffer->buffer->datas[0];
  if (!block->data)
    {
      pw_stream_queue_buffer (rain->stream, buffer);
      return;
    }

  frames = block->maxsize / stride;
  if (buffer->requested)
    frames = MIN (buffer->requested, frames);

  rain_synth_render (rain->synth, block->data, frames);
  block->chunk->offset = 0;
  block->chunk->stride = stride;
  block->chunk->size = frames * stride;
  pw_stream_queue_buffer (rain->stream, buffer);

  if (rain->closing && rain_synth_silent (rain->synth))
    pw_main_loop_quit (rain->loop);
}

static void
on_state_changed (void                 *data,
                  enum pw_stream_state  old,
                  enum pw_stream_state  state,
                  const char           *error)
{
  Rain *rain = data;

  if (state == PW_STREAM_STATE_ERROR || state == PW_STREAM_STATE_UNCONNECTED)
    {
      g_printerr ("kestrel-rain: the sound stream stopped: %s\n", error ? error : "disconnected");
      pw_main_loop_quit (rain->loop);
    }
}

static const struct pw_stream_events stream_events = {
  PW_VERSION_STREAM_EVENTS,
  .state_changed = on_state_changed,
  .process = on_process,
};

static void
apply (Rain       *rain,
       const char *line)
{
  float intensity, volume;

  if (sscanf (line, "%f %f", &intensity, &volume) == 2)
    rain_synth_set (rain->synth, intensity, volume);
}

static void
on_deadline (void     *data,
             uint64_t  expirations)
{
  Rain *rain = data;

  pw_main_loop_quit (rain->loop);
}

static void
close_softly (Rain *rain)
{
  struct timespec timeout = { CLOSE_DEADLINE_S, 0 };

  if (rain->closing)
    return;
  rain->closing = TRUE;
  rain_synth_set (rain->synth, 0.0f, 0.0f);
  pw_loop_update_timer (pw_main_loop_get_loop (rain->loop), rain->deadline, &timeout, NULL, false);
}

static void
on_commands (void     *data,
             int       fd,
             uint32_t  mask)
{
  Rain *rain = data;
  char chunk[COMMAND_LIMIT];
  ssize_t count = read (fd, chunk, sizeof (chunk));
  char *newline;

  if (count < 0 && (errno == EAGAIN || errno == EINTR))
    return;
  if (count <= 0 || (mask & (SPA_IO_HUP | SPA_IO_ERR)))
    {
      close_softly (rain);
      return;
    }

  g_string_append_len (rain->pending, chunk, count);
  while ((newline = strchr (rain->pending->str, '\n')))
    {
      *newline = '\0';
      apply (rain, rain->pending->str);
      g_string_erase (rain->pending, 0, newline - rain->pending->str + 1);
    }
  if (rain->pending->len > COMMAND_LIMIT)
    g_string_truncate (rain->pending, 0);
}

static struct pw_properties *
stream_properties (void)
{
  return pw_properties_new (PW_KEY_MEDIA_TYPE, "Audio",
                            PW_KEY_MEDIA_CATEGORY, "Playback",
                            PW_KEY_MEDIA_ROLE, "Music",
                            PW_KEY_MEDIA_NAME, "Rain",
                            PW_KEY_APP_NAME, "Rain",
                            PW_KEY_APP_ID, "com.lantharos.Kestrel",
                            PW_KEY_APP_ICON_NAME, "weather-showers-symbolic",
                            PW_KEY_NODE_NAME, "kestrel-rain",
                            PW_KEY_NODE_DESCRIPTION, "Rain",
                            PW_KEY_NODE_LATENCY, QUANTUM,
                            NULL);
}

static int
play (void)
{
  uint8_t pod[512];
  struct spa_pod_builder builder = SPA_POD_BUILDER_INIT (pod, sizeof (pod));
  const struct spa_pod *params[1];
  struct spa_audio_info_raw format = {
    .format = SPA_AUDIO_FORMAT_F32,
    .rate = RAIN_RATE,
    .channels = RAIN_CHANNELS,
    .position = { SPA_AUDIO_CHANNEL_FL, SPA_AUDIO_CHANNEL_FR },
  };
  g_autoptr (RainSynth) synth = rain_synth_new (g_random_int ());
  Rain rain = { .synth = synth, .pending = g_string_new (NULL) };
  struct spa_source *commands;

  pw_init (NULL, NULL);
  rain.loop = pw_main_loop_new (NULL);
  rain.stream = pw_stream_new_simple (pw_main_loop_get_loop (rain.loop), "Rain", stream_properties (),
                                      &stream_events, &rain);
  rain.deadline = pw_loop_add_timer (pw_main_loop_get_loop (rain.loop), on_deadline, &rain);
  commands = pw_loop_add_io (pw_main_loop_get_loop (rain.loop), STDIN_FILENO, SPA_IO_IN | SPA_IO_HUP | SPA_IO_ERR,
                             false, on_commands, &rain);

  params[0] = spa_format_audio_raw_build (&builder, SPA_PARAM_EnumFormat, &format);
  if (pw_stream_connect (rain.stream, PW_DIRECTION_OUTPUT, PW_ID_ANY,
                         PW_STREAM_FLAG_AUTOCONNECT | PW_STREAM_FLAG_MAP_BUFFERS,
                         params, 1) < 0)
    {
      g_printerr ("kestrel-rain: can't connect to PipeWire\n");
      return EXIT_FAILURE;
    }

  pw_main_loop_run (rain.loop);

  pw_loop_destroy_source (pw_main_loop_get_loop (rain.loop), commands);
  pw_loop_destroy_source (pw_main_loop_get_loop (rain.loop), rain.deadline);
  pw_stream_destroy (rain.stream);
  pw_main_loop_destroy (rain.loop);
  g_string_free (rain.pending, TRUE);
  pw_deinit ();
  return EXIT_SUCCESS;
}

static gboolean
parse_step (const char *step,
            double     *seconds,
            float      *intensity,
            float      *volume)
{
  return sscanf (step, "%lf:%f:%f", seconds, intensity, volume) == 3 && *seconds > 0;
}

static int
render (const char  *path,
        char       **steps)
{
  g_autoptr (RainSynth) synth = rain_synth_new (1);
  g_autoptr (GArray) samples = g_array_new (FALSE, FALSE, sizeof (float));
  g_autoptr (GByteArray) wav = g_byte_array_new ();
  g_autoptr (GError) error = NULL;
  gboolean first = TRUE;
  guint32 data_size;

  for (; *steps; steps++)
    {
      double seconds;
      float intensity, volume;
      gsize frames, offset = samples->len;

      if (!parse_step (*steps, &seconds, &intensity, &volume))
        {
          g_printerr ("kestrel-rain: steps look like SECONDS:INTENSITY:VOLUME, not %s\n", *steps);
          return EXIT_FAILURE;
        }
      rain_synth_set (synth, intensity, volume);
      if (first)
        rain_synth_jump (synth);
      first = FALSE;
      frames = (gsize) (seconds * RAIN_RATE);
      g_array_set_size (samples, offset + frames * RAIN_CHANNELS);
      rain_synth_render (synth, &g_array_index (samples, float, offset), frames);
    }

  data_size = samples->len * sizeof (gint16);
  {
    struct
    {
      char riff[4];
      guint32 size;
      char wave[4];
      char fmt[4];
      guint32 fmt_size;
      guint16 format, channels;
      guint32 rate, byte_rate;
      guint16 block_align, bits;
      char data[4];
      guint32 data_size;
    } __attribute__ ((packed)) header = {
      { 'R', 'I', 'F', 'F' }, GUINT32_TO_LE (36 + data_size), { 'W', 'A', 'V', 'E' },
      { 'f', 'm', 't', ' ' }, GUINT32_TO_LE (16), GUINT16_TO_LE (1), GUINT16_TO_LE (RAIN_CHANNELS),
      GUINT32_TO_LE (RAIN_RATE), GUINT32_TO_LE (RAIN_RATE * RAIN_CHANNELS * 2),
      GUINT16_TO_LE (RAIN_CHANNELS * 2), GUINT16_TO_LE (16),
      { 'd', 'a', 't', 'a' }, GUINT32_TO_LE (data_size),
    };

    g_byte_array_append (wav, (const guint8 *) &header, sizeof (header));
  }
  for (guint i = 0; i < samples->len; i++)
    {
      gint16 pcm = GINT16_TO_LE ((gint16) CLAMP (g_array_index (samples, float, i) * 32767.0f, -32768.0f, 32767.0f));
      g_byte_array_append (wav, (const guint8 *) &pcm, sizeof (pcm));
    }

  if (!g_file_set_contents (path, (const char *) wav->data, wav->len, &error))
    {
      g_printerr ("kestrel-rain: %s\n", error->message);
      return EXIT_FAILURE;
    }
  return EXIT_SUCCESS;
}

int
main (int    argc,
      char **argv)
{
  if (argc >= 4 && g_str_equal (argv[1], "--render"))
    return render (argv[2], argv + 3);

  if (argc != 1)
    {
      g_printerr ("Usage: kestrel-rain\n"
                  "       kestrel-rain --render PATH SECONDS:INTENSITY:VOLUME...\n"
                  "Plays rain while reading \"INTENSITY VOLUME\" lines from standard input,\n"
                  "and fades out when standard input closes.\n");
      return EXIT_FAILURE;
    }

  return play ();
}
