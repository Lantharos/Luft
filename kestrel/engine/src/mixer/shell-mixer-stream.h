/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib-object.h>

G_BEGIN_DECLS

#define SHELL_TYPE_MIXER_STREAM (shell_mixer_stream_get_type ())
G_DECLARE_FINAL_TYPE (ShellMixerStream, shell_mixer_stream,
                      SHELL, MIXER_STREAM, GObject)

const char *shell_mixer_stream_get_description     (ShellMixerStream *stream);
const char *shell_mixer_stream_get_port            (ShellMixerStream *stream);
const char *shell_mixer_stream_get_port_description (ShellMixerStream *stream);
const char *shell_mixer_stream_get_form_factor     (ShellMixerStream *stream);
double      shell_mixer_stream_get_volume          (ShellMixerStream *stream);
gboolean    shell_mixer_stream_get_muted           (ShellMixerStream *stream);
gboolean    shell_mixer_stream_get_running         (ShellMixerStream *stream);

void shell_mixer_stream_set_volume (ShellMixerStream *stream,
                                    double            volume);
void shell_mixer_stream_set_muted  (ShellMixerStream *stream,
                                    gboolean          muted);

G_END_DECLS
