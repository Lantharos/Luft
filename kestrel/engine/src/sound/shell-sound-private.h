/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

#define SHELL_SOUND_RATE 48000
#define SHELL_SOUND_CHANNELS 2

typedef struct
{
  char *name;
  GBytes *samples;
  gsize frames;
} ShellSoundClip;

ShellSoundClip *_shell_sound_clip_new   (const char *name,
                                         GBytes     *samples);
ShellSoundClip *_shell_sound_clip_ref   (ShellSoundClip *clip);
void            _shell_sound_clip_unref (ShellSoundClip *clip);

G_DEFINE_AUTOPTR_CLEANUP_FUNC (ShellSoundClip, _shell_sound_clip_unref)

void            _shell_sound_decode        (const char          *name,
                                            GFile               *file,
                                            GCancellable        *cancellable,
                                            GAsyncReadyCallback  callback,
                                            gpointer             user_data);
void            _shell_sound_decode_fd     (const char          *name,
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
