/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib-object.h>

G_BEGIN_DECLS

#define SHELL_TYPE_MIXER_DEVICE (shell_mixer_device_get_type ())
G_DECLARE_FINAL_TYPE (ShellMixerDevice, shell_mixer_device,
                      SHELL, MIXER_DEVICE, GObject)

const char *shell_mixer_device_get_description (ShellMixerDevice *device);
const char *shell_mixer_device_get_origin      (ShellMixerDevice *device);
const char *shell_mixer_device_get_icon_name   (ShellMixerDevice *device);
gboolean    shell_mixer_device_get_active      (ShellMixerDevice *device);

G_END_DECLS
