/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib-object.h>

G_BEGIN_DECLS

#define SHELL_TYPE_AUDIO_MONITOR (shell_audio_monitor_get_type ())
G_DECLARE_FINAL_TYPE (ShellAudioMonitor, shell_audio_monitor, SHELL, AUDIO_MONITOR, GObject)

ShellAudioMonitor *shell_audio_monitor_get_default   (void);

void               shell_audio_monitor_set_listening (ShellAudioMonitor *monitor,
                                                      gboolean           listening);
gboolean           shell_audio_monitor_get_listening (ShellAudioMonitor *monitor);
float             *shell_audio_monitor_read          (ShellAudioMonitor *monitor,
                                                      guint              n_bands,
                                                      float             *level,
                                                      guint             *n_values);

G_END_DECLS
