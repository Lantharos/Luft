/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <clutter/clutter.h>

#define SHELL_TYPE_GLYPH_RENDERER (shell_glyph_renderer_get_type ())
G_DECLARE_FINAL_TYPE (ShellGlyphRenderer, shell_glyph_renderer,
                      SHELL, GLYPH_RENDERER, GObject)

ShellGlyphRenderer *shell_glyph_renderer_new_for_emoji (void);

ShellGlyphRenderer *shell_glyph_renderer_new_for_text (const char      *family,
                                                       const CoglColor *color);

ClutterContent *shell_glyph_renderer_render (ShellGlyphRenderer *renderer,
                                             const char         *text,
                                             int                 size,
                                             float               scale);
