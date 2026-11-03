/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <gio/gio.h>

G_BEGIN_DECLS

#define SHELL_TYPE_SOUND_MIX (shell_sound_mix_get_type ())
G_DECLARE_FINAL_TYPE (ShellSoundMix, shell_sound_mix, SHELL, SOUND_MIX, GObject)

ShellSoundMix *shell_sound_mix_new        (const char    *name,
                                           const char    *icon_name);
guint          shell_sound_mix_play       (ShellSoundMix *mix,
                                           GFile         *file,
                                           gboolean       loop,
                                           double         volume,
                                           guint          fade_ms);
void           shell_sound_mix_set_volume (ShellSoundMix *mix,
                                           guint          sound,
                                           double         volume,
                                           guint          fade_ms);
void           shell_sound_mix_stop       (ShellSoundMix *mix,
                                           guint          sound,
                                           guint          fade_ms);
void           shell_sound_mix_set_master (ShellSoundMix *mix,
                                           double         volume,
                                           guint          fade_ms);
void           shell_sound_mix_close      (ShellSoundMix *mix);

G_END_DECLS
