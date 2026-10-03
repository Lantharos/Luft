/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib-object.h>

#include "shell-mixer-device.h"
#include "shell-mixer-stream.h"

G_BEGIN_DECLS

typedef enum /*< flags >*/
{
  SHELL_MIXER_HEADSET_HEADPHONES = 1 << 0,
  SHELL_MIXER_HEADSET_HEADSET = 1 << 1,
  SHELL_MIXER_HEADSET_MICROPHONE = 1 << 2,
} ShellMixerHeadset;

#define SHELL_TYPE_MIXER (shell_mixer_get_type ())
G_DECLARE_FINAL_TYPE (ShellMixer, shell_mixer, SHELL, MIXER, GObject)

ShellMixer       *shell_mixer_get_default       (void);
double            shell_mixer_get_max_amplified (void);

ShellMixerStream *shell_mixer_get_output        (ShellMixer *mixer);
ShellMixerStream *shell_mixer_get_input         (ShellMixer *mixer);
gboolean          shell_mixer_get_recording     (ShellMixer *mixer);

GPtrArray *shell_mixer_get_devices     (ShellMixer       *mixer,
                                        gboolean          output);
void       shell_mixer_activate_device (ShellMixer       *mixer,
                                        ShellMixerDevice *device);
void       shell_mixer_choose_headset  (ShellMixer        *mixer,
                                        ShellMixerHeadset  choice);

G_END_DECLS
