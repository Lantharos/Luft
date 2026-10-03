/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <pulse/pulseaudio.h>

#include "shell-mixer.h"

typedef struct
{
  const char *name;
  const char *description;
  guint32 card;
  const char *form_factor;
  const char *port;
  const char *port_description;
  GStrv ports;
  const pa_cvolume *volume;
  gboolean muted;
  gboolean running;
} ShellMixerStreamInfo;

typedef struct
{
  char *name;
  char *description;
  pa_direction_t direction;
  pa_port_available_t available;
  unsigned int type;
  char *group;
  guint32 priority;
  GStrv profiles;
} ShellMixerPort;

typedef struct
{
  guint32 index;
  char *description;
  char *icon_name;
  GPtrArray *ports;
} ShellMixerCard;

typedef struct
{
  const ShellMixerPort *headphones;
  const ShellMixerPort *headset_mic;
  const ShellMixerPort *headphone_mic;
  const ShellMixerPort *internal_mic;
  const ShellMixerPort *speaker;
} ShellMixerHeadsetPorts;

typedef struct _ShellMixerServer ShellMixerServer;

typedef struct
{
  char *headphones;
  char *headset_mic;
  char *headphone_mic;
  char *internal_mic;
  char *speaker;
} ShellMixerHeadsetNames;

struct _ShellMixer
{
  GObject parent;

  ShellMixerServer *server;

  GHashTable *sinks;
  GHashTable *sources;
  GHashTable *cards;
  GHashTable *recorders;
  char *default_sink;
  char *default_source;
  ShellMixerStream *output;
  ShellMixerStream *input;
  gboolean recording;

  GPtrArray *devices[2];
  guint devices_idle_id;

  guint32 pending_card;
  char *pending_port;
  gboolean pending_output;

  guint32 headset_card;
  gboolean headset_plugged;
  ShellMixerHeadsetNames headset;
};

GHashTable       *_shell_mixer_streams_for      (ShellMixer       *mixer,
                                                 gboolean          output);
ShellMixerStream *_shell_mixer_stream_with_port (GHashTable       *streams,
                                                 guint32           card,
                                                 const char       *port);
void              _shell_mixer_set_default      (ShellMixer       *mixer,
                                                 gboolean          output,
                                                 const char       *name);
void              _shell_mixer_select_port      (ShellMixer       *mixer,
                                                 gboolean          output,
                                                 ShellMixerStream *stream,
                                                 const char       *port);
void              _shell_mixer_queue_devices    (ShellMixer       *mixer);
void              _shell_mixer_track_headset    (ShellMixer       *mixer,
                                                 ShellMixerCard   *card);
void              _shell_mixer_headset_clear    (ShellMixerHeadsetNames *names);

pa_context *_shell_mixer_get_context      (ShellMixer                 *mixer);
void        _shell_mixer_update_stream    (ShellMixer                 *mixer,
                                           gboolean                    output,
                                           guint32                     index,
                                           const ShellMixerStreamInfo *info);
void        _shell_mixer_remove_stream    (ShellMixer                 *mixer,
                                           gboolean                    output,
                                           guint32                     index);
void        _shell_mixer_update_card      (ShellMixer                 *mixer,
                                           const pa_card_info         *info);
void        _shell_mixer_remove_card      (ShellMixer                 *mixer,
                                           guint32                     index);
void        _shell_mixer_update_recorder  (ShellMixer                 *mixer,
                                           guint32                     index,
                                           const char                 *app_id);
void        _shell_mixer_remove_recorder  (ShellMixer                 *mixer,
                                           guint32                     index);
void        _shell_mixer_set_defaults     (ShellMixer                 *mixer,
                                           const char                 *sink,
                                           const char                 *source);
void        _shell_mixer_forget           (ShellMixer                 *mixer);

ShellMixerServer *_shell_mixer_server_new         (ShellMixer       *mixer);
void              _shell_mixer_server_free        (ShellMixerServer *server);
pa_context       *_shell_mixer_server_get_context (ShellMixerServer *server);

ShellMixerStream *_shell_mixer_stream_new        (ShellMixer                 *mixer,
                                                  gboolean                    output,
                                                  guint32                     index);
void              _shell_mixer_stream_update     (ShellMixerStream           *stream,
                                                  const ShellMixerStreamInfo *info);
const char       *_shell_mixer_stream_get_name   (ShellMixerStream           *stream);
guint32           _shell_mixer_stream_get_card   (ShellMixerStream           *stream);
gboolean          _shell_mixer_stream_has_port   (ShellMixerStream           *stream,
                                                  const char                 *port);
void              _shell_mixer_stream_set_port   (ShellMixerStream           *stream,
                                                  const char                 *port);

ShellMixerDevice *_shell_mixer_device_new             (const char       *description,
                                                       const char       *origin,
                                                       const char       *icon_name,
                                                       gboolean          active,
                                                       guint32           card,
                                                       const char       *port,
                                                       const char       *stream);
guint32           _shell_mixer_device_get_card        (ShellMixerDevice *device);
const char       *_shell_mixer_device_get_port        (ShellMixerDevice *device);
const char       *_shell_mixer_device_get_stream      (ShellMixerDevice *device);
gboolean          _shell_mixer_device_equal           (ShellMixerDevice *device,
                                                       ShellMixerDevice *other);

ShellMixerCard *_shell_mixer_card_new           (const pa_card_info     *info);
void            _shell_mixer_card_free          (ShellMixerCard         *card);
gboolean        _shell_mixer_card_has_ports     (ShellMixerCard         *card,
                                                 pa_direction_t          direction);
const char     *_shell_mixer_card_best_profile  (ShellMixerCard         *card,
                                                 const char             *port);
void            _shell_mixer_card_headset_ports (ShellMixerCard         *card,
                                                 ShellMixerHeadsetPorts *ports);
