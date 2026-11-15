/* shell-blur-outline.h
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <clutter/clutter.h>

#define SHELL_BLUR_OUTLINE_SPANS 4

typedef struct
{
  gboolean shaded;
  float lift;
  float dim;
  float spans[SHELL_BLUR_OUTLINE_SPANS * 2];
  int n_spans;
} ShellBlurOutline;

void shell_blur_add_outline (ClutterActor           *actor,
                             ClutterPaintNode       *node,
                             const ShellBlurOutline *outline,
                             float                   corner_radius,
                             uint8_t                 paint_opacity);
