/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include <gst/gst.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <unistd.h>

#include "confine.h"
#include "pipeline.h"

#define SINK "fdsink fd=1 sync=false"
#define FROM_FILE SHELL_SOUND_DECODE_PIPELINE ("filesrc location=/proc/self/fd/0", SINK)
#define FROM_STREAM SHELL_SOUND_DECODE_PIPELINE ("fdsrc fd=0", SINK)

int
main (void)
{
  g_autoptr (GstElement) pipeline = NULL;
  g_autoptr (GstBus) bus = NULL;
  g_autoptr (GstMessage) message = NULL;
  struct stat input;

  gst_init (NULL, NULL);
  pipeline = gst_parse_launch (fstat (STDIN_FILENO, &input) == 0 && S_ISREG (input.st_mode) ? FROM_FILE : FROM_STREAM,
                               NULL);
  if (!pipeline || !confine_to_decoding ())
    return EXIT_FAILURE;

  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  bus = gst_element_get_bus (pipeline);
  message = gst_bus_timed_pop_filtered (bus, GST_CLOCK_TIME_NONE, GST_MESSAGE_EOS | GST_MESSAGE_ERROR);
  gst_element_set_state (pipeline, GST_STATE_NULL);
  return GST_MESSAGE_TYPE (message) == GST_MESSAGE_EOS ? EXIT_SUCCESS : EXIT_FAILURE;
}
