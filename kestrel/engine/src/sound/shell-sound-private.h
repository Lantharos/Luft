/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

#include "shell-sound-mix.h"

#define SHELL_SOUND_RATE 48000
#define SHELL_SOUND_CHANNELS 2
#define SHELL_SOUND_ANY_LENGTH G_MAXSIZE
#define SHELL_SOUND_LONGEST_CUSTOM_FRAMES (10 * SHELL_SOUND_RATE)

typedef struct
{
  char *name;
  char *path;
  GBytes *samples;
  gsize frames;
} ShellSoundClip;

ShellSoundClip *_shell_sound_clip_new   (const char *name,
                                         const char *path,
                                         GBytes     *samples);
ShellSoundClip *_shell_sound_clip_ref   (ShellSoundClip *clip);
void            _shell_sound_clip_unref (ShellSoundClip *clip);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (ShellSoundClip, _shell_sound_clip_unref)

void            _shell_sound_decode        (const char          *name,
                                            GFile               *file,
                                            gsize                max_frames,
                                            GCancellable        *cancellable,
                                            GAsyncReadyCallback  callback,
                                            gpointer             user_data);
void            _shell_sound_decode_start  (const char          *name,
                                            GFile               *file,
                                            GCancellable        *cancellable,
                                            GAsyncReadyCallback  callback,
                                            gpointer             user_data);
void            _shell_sound_decode_start_fd (const char          *name,
                                              int                  fd,
                                              GCancellable        *cancellable,
                                              GAsyncReadyCallback  callback,
                                              gpointer             user_data);
ShellSoundClip *_shell_sound_decode_finish (GAsyncResult        *result,
                                            GError             **error);

typedef struct _ShellSoundTheme ShellSoundTheme;

ShellSoundTheme *_shell_sound_theme_new    (const char      *name);
void             _shell_sound_theme_free   (ShellSoundTheme *theme);
GFile           *_shell_sound_theme_lookup (ShellSoundTheme *theme,
                                            const char      *name,
                                            gboolean        *disabled);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (ShellSoundTheme, _shell_sound_theme_free)

typedef struct _ShellSoundOutput ShellSoundOutput;

typedef void (*ShellSoundStartedFunc) (const char *name,
                                       gint64      latency_us,
                                       gpointer    user_data);

ShellSoundOutput *_shell_sound_output_new     (ShellSoundStartedFunc  started,
                                               gpointer               user_data);
void              _shell_sound_output_free    (ShellSoundOutput      *output);
void              _shell_sound_output_connect (ShellSoundOutput      *output);
void              _shell_sound_output_play    (ShellSoundOutput      *output,
                                               ShellSoundClip        *clip);
void              _shell_sound_output_set_volume (ShellSoundOutput   *output,
                                                  double              volume);

struct pw_thread_loop;
struct pw_context;
struct pw_core;
struct pw_properties;
struct pw_stream;
struct pw_stream_events;
struct spa_hook;

struct pw_properties *_shell_sound_stream_properties (const char *name,
                                                      const char *icon_name,
                                                      const char *quantum);
struct pw_stream     *_shell_sound_stream_connect    (struct pw_core                *core,
                                                      const char                    *name,
                                                      struct pw_properties          *properties,
                                                      gboolean                       realtime,
                                                      struct spa_hook               *listener,
                                                      const struct pw_stream_events *events,
                                                      gpointer                       data);

typedef struct _ShellSoundStrikes ShellSoundStrikes;

ShellSoundStrikes *_shell_sound_strikes_new        (const char            *name,
                                                    const char            *icon_name,
                                                    struct pw_thread_loop *loop,
                                                    struct pw_context     *context);
void               _shell_sound_strikes_free       (ShellSoundStrikes     *strikes);
void               _shell_sound_strikes_connect    (ShellSoundStrikes     *strikes);
void               _shell_sound_strikes_play       (ShellSoundStrikes     *strikes,
                                                    const ShellSoundClip  *clip,
                                                    float                  gain,
                                                    float                  rate,
                                                    gint64                 pressed_us);
void               _shell_sound_strikes_retire     (ShellSoundStrikes     *strikes,
                                                    ShellSoundClip        *clip);
void               _shell_sound_strikes_set_master (ShellSoundStrikes     *strikes,
                                                    double                 volume);
gint64             _shell_sound_strikes_latest_us  (ShellSoundStrikes     *strikes);

ShellSoundStrikes *_shell_sound_mix_strikes        (ShellSoundMix         *mix);
