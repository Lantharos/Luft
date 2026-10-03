/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-mixer-private.h"

struct _ShellMixerDevice
{
  GObject parent;

  char *description;
  char *origin;
  char *icon_name;
  gboolean active;
  guint32 card;
  char *port;
  char *stream;
};

G_DEFINE_TYPE (ShellMixerDevice, shell_mixer_device, G_TYPE_OBJECT)

static void
shell_mixer_device_finalize (GObject *object)
{
  ShellMixerDevice *device = SHELL_MIXER_DEVICE (object);

  g_free (device->description);
  g_free (device->origin);
  g_free (device->icon_name);
  g_free (device->port);
  g_free (device->stream);

  G_OBJECT_CLASS (shell_mixer_device_parent_class)->finalize (object);
}

static void
shell_mixer_device_class_init (ShellMixerDeviceClass *klass)
{
  G_OBJECT_CLASS (klass)->finalize = shell_mixer_device_finalize;
}

static void
shell_mixer_device_init (ShellMixerDevice *device)
{
}

ShellMixerDevice *
_shell_mixer_device_new (const char *description,
                         const char *origin,
                         const char *icon_name,
                         gboolean    active,
                         guint32     card,
                         const char *port,
                         const char *stream)
{
  ShellMixerDevice *device = g_object_new (SHELL_TYPE_MIXER_DEVICE, NULL);

  device->description = g_strdup (description);
  device->origin = g_strdup (origin);
  device->icon_name = g_strdup (icon_name);
  device->active = active;
  device->card = card;
  device->port = g_strdup (port);
  device->stream = g_strdup (stream);
  return device;
}

guint32
_shell_mixer_device_get_card (ShellMixerDevice *device)
{
  return device->card;
}

const char *
_shell_mixer_device_get_port (ShellMixerDevice *device)
{
  return device->port;
}

const char *
_shell_mixer_device_get_stream (ShellMixerDevice *device)
{
  return device->stream;
}

gboolean
_shell_mixer_device_equal (ShellMixerDevice *device,
                           ShellMixerDevice *other)
{
  return device->active == other->active &&
         device->card == other->card &&
         g_strcmp0 (device->description, other->description) == 0 &&
         g_strcmp0 (device->origin, other->origin) == 0 &&
         g_strcmp0 (device->icon_name, other->icon_name) == 0 &&
         g_strcmp0 (device->port, other->port) == 0 &&
         g_strcmp0 (device->stream, other->stream) == 0;
}

const char *
shell_mixer_device_get_description (ShellMixerDevice *device)
{
  g_return_val_if_fail (SHELL_IS_MIXER_DEVICE (device), NULL);

  return device->description;
}

/**
 * shell_mixer_device_get_origin:
 * @device: a #ShellMixerDevice
 *
 * Returns: (nullable): the sound card the device belongs to
 */
const char *
shell_mixer_device_get_origin (ShellMixerDevice *device)
{
  g_return_val_if_fail (SHELL_IS_MIXER_DEVICE (device), NULL);

  return device->origin;
}

const char *
shell_mixer_device_get_icon_name (ShellMixerDevice *device)
{
  g_return_val_if_fail (SHELL_IS_MIXER_DEVICE (device), NULL);

  return device->icon_name;
}

gboolean
shell_mixer_device_get_active (ShellMixerDevice *device)
{
  g_return_val_if_fail (SHELL_IS_MIXER_DEVICE (device), FALSE);

  return device->active;
}
