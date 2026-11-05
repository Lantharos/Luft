/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

#include "shell-sound-mix.h"

G_BEGIN_DECLS

/**
 * ShellKeySound:
 * @SHELL_KEY_SOUND_KEY: a letter or any other key
 * @SHELL_KEY_SOUND_SPACE: the space bar
 * @SHELL_KEY_SOUND_ENTER: Enter
 * @SHELL_KEY_SOUND_BACKSPACE: Backspace
 * @SHELL_KEY_SOUND_CLICK: a mouse button
 *
 * The only things #ShellKeySounds tells presses apart by.
 */
typedef enum
{
  SHELL_KEY_SOUND_KEY,
  SHELL_KEY_SOUND_SPACE,
  SHELL_KEY_SOUND_ENTER,
  SHELL_KEY_SOUND_BACKSPACE,
  SHELL_KEY_SOUND_CLICK,
} ShellKeySound;

#define SHELL_TYPE_KEY_SOUNDS (shell_key_sounds_get_type ())
G_DECLARE_FINAL_TYPE (ShellKeySounds, shell_key_sounds, SHELL, KEY_SOUNDS, GObject)

ShellKeySounds *shell_key_sounds_new        (ShellSoundMix  *mix);
void            shell_key_sounds_load       (ShellKeySounds *sounds,
                                             const int      *kinds,
                                             GFile         **files,
                                             guint           n_files);
void            shell_key_sounds_set_levels (ShellKeySounds *sounds,
                                             double          keys,
                                             double          clicks);
void            shell_key_sounds_set_quiet  (ShellKeySounds *sounds,
                                             gboolean        quiet);
void            shell_key_sounds_preview    (ShellKeySounds *sounds,
                                             ShellKeySound   kind,
                                             double          level);
gint64          shell_key_sounds_get_latest_latency (ShellKeySounds *sounds);
void            shell_key_sounds_close      (ShellKeySounds *sounds);

G_END_DECLS
