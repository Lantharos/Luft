/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

G_BEGIN_DECLS

#define SHELL_TYPE_SOUND_PLAYER (shell_sound_player_get_type ())
G_DECLARE_FINAL_TYPE (ShellSoundPlayer, shell_sound_player, SHELL, SOUND_PLAYER, GObject)

ShellSoundPlayer *shell_sound_player_get_default      (void);

void              shell_sound_player_prepare          (ShellSoundPlayer *player);
void              shell_sound_player_play             (ShellSoundPlayer *player,
                                                       const char       *name);
void              shell_sound_player_play_file        (ShellSoundPlayer *player,
                                                       GFile            *file);
void              shell_sound_player_play_fd          (ShellSoundPlayer *player,
                                                       int               fd);
guint64           shell_sound_player_get_cached_bytes (ShellSoundPlayer *player);

G_END_DECLS
