#include "still.h"

#include <gst/gst.h>

#define STILL_ENCODER "videoconvert ! jpegenc quality=95 snapshot=true ! filesink name=file"

gboolean
wallpaper_extract_still (const char *uri,
                         const char *path)
{
  g_autoptr (GstElement) pipeline = gst_element_factory_make ("playbin3", NULL);
  g_autoptr (GstElement) file = NULL;
  g_autoptr (GstBus) bus = NULL;
  g_autoptr (GstMessage) message = NULL;
  g_autoptr (GError) error = NULL;
  GstElement *encoder = gst_parse_bin_from_description (STILL_ENCODER, TRUE, &error);

  file = gst_bin_get_by_name (GST_BIN (encoder), "file");
  g_object_set (file, "location", path, NULL);
  g_object_set (pipeline, "uri", uri, "video-sink", encoder, NULL);
  gst_util_set_object_arg (G_OBJECT (pipeline), "flags", "video");

  bus = gst_element_get_bus (pipeline);
  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  message = gst_bus_timed_pop_filtered (bus, GST_CLOCK_TIME_NONE,
                                        GST_MESSAGE_EOS | GST_MESSAGE_ERROR);
  gst_element_set_state (pipeline, GST_STATE_NULL);

  if (GST_MESSAGE_TYPE (message) == GST_MESSAGE_ERROR)
    {
      gst_message_parse_error (message, &error, NULL);
      g_printerr ("Could not extract a still: %s\n", error->message);
      return FALSE;
    }
  return TRUE;
}
