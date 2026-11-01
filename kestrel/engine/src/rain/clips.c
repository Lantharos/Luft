#include "clips.h"

#include <gst/gst.h>

#define PIPELINE \
  "filesrc name=source ! decodebin ! audioconvert ! audioresample ! " \
  "audio/x-raw,format=S16LE,layout=interleaved,rate=48000,channels=2 ! " \
  "appsink name=sink sync=false"
#define PULL_TIMEOUT (2 * GST_SECOND)

static gboolean
decode (const char  *path,
        RainClip    *clip,
        GError     **error)
{
  g_autoptr (GstElement) pipeline = gst_parse_launch (PIPELINE, error);
  g_autoptr (GstElement) source = NULL;
  g_autoptr (GstElement) sink = NULL;
  g_autoptr (GByteArray) samples = g_byte_array_new ();
  GstSample *sample;

  if (!pipeline)
    return FALSE;

  source = gst_bin_get_by_name (GST_BIN (pipeline), "source");
  sink = gst_bin_get_by_name (GST_BIN (pipeline), "sink");
  g_object_set (source, "location", path, NULL);
  if (gst_element_set_state (pipeline, GST_STATE_PLAYING) == GST_STATE_CHANGE_FAILURE)
    {
      g_set_error (error, G_IO_ERROR, G_IO_ERROR_FAILED, "Can't decode %s", path);
      return FALSE;
    }

  while (TRUE)
    {
      GstMapInfo map;

      g_signal_emit_by_name (sink, "try-pull-sample", PULL_TIMEOUT, &sample);
      if (!sample)
        break;
      if (gst_buffer_map (gst_sample_get_buffer (sample), &map, GST_MAP_READ))
        {
          g_byte_array_append (samples, map.data, map.size);
          gst_buffer_unmap (gst_sample_get_buffer (sample), &map);
        }
      gst_sample_unref (sample);
    }
  gst_element_set_state (pipeline, GST_STATE_NULL);

  clip->frames = samples->len / (RAIN_CHANNELS * sizeof (gint16));
  if (!clip->frames)
    {
      g_set_error (error, G_IO_ERROR, G_IO_ERROR_FAILED, "%s has no sound", path);
      return FALSE;
    }
  clip->samples = (gint16 *) g_byte_array_free (g_steal_pointer (&samples), FALSE);
  return TRUE;
}

gboolean
rain_clip_load (const char  *name,
                RainClip    *clip,
                GError     **error)
{
  g_autofree char *file = g_strconcat (name, ".oga", NULL);
  const char *datadir = g_getenv ("KESTREL_DATADIR");
  g_autofree char *path = g_build_filename (datadir ? datadir : KESTREL_DATADIR, "rain", file, NULL);

  return decode (path, clip, error);
}

void
rain_clip_clear (RainClip *clip)
{
  g_clear_pointer (&clip->samples, g_free);
  clip->frames = 0;
}
