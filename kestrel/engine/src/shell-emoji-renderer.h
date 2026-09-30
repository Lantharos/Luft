/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <clutter/clutter.h>

#define SHELL_TYPE_EMOJI_RENDERER (shell_emoji_renderer_get_type ())
G_DECLARE_FINAL_TYPE (ShellEmojiRenderer, shell_emoji_renderer,
                      SHELL, EMOJI_RENDERER, GObject)

ShellEmojiRenderer *shell_emoji_renderer_new (void);

ClutterContent *shell_emoji_renderer_render (ShellEmojiRenderer *renderer,
                                             const char         *text,
                                             int                 size,
                                             float               scale);
