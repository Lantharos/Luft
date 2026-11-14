/* shell-blur-outline.h
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <clutter/clutter.h>

void shell_blur_add_outline (ClutterActor     *actor,
                             ClutterPaintNode *node,
                             float             corner_radius,
                             uint8_t           paint_opacity);
