/* shell-blur-effect.h
 *
 * Copyright 2019 Georges Basile Stavracas Neto <georges.stavracas@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <clutter/clutter.h>

G_BEGIN_DECLS

/**
 * ShellBlurMode:
 * @SHELL_BLUR_MODE_ACTOR: blur the actor contents, and its children
 * @SHELL_BLUR_MODE_BACKGROUND: blur what's beneath the actor
 *
 * The mode of blurring of the effect.
 */
typedef enum
{
  SHELL_BLUR_MODE_ACTOR,
  SHELL_BLUR_MODE_BACKGROUND,
} ShellBlurMode;

/**
 * ShellBlurStyle:
 * @SHELL_BLUR_STYLE_LUCA: blur what is beneath the actor as it changes
 * @SHELL_BLUR_STYLE_WALLPAPER: show the compositor's blurred wallpaper beneath it
 * @SHELL_BLUR_STYLE_MARIS: show the glass surface colour over the
 *   compositor's wide blur of the wallpaper
 *
 * How a background blur looks.
 */
typedef enum
{
  SHELL_BLUR_STYLE_LUCA,
  SHELL_BLUR_STYLE_WALLPAPER,
  SHELL_BLUR_STYLE_MARIS,
} ShellBlurStyle;

#define SHELL_TYPE_BLUR_EFFECT (shell_blur_effect_get_type())
G_DECLARE_FINAL_TYPE (ShellBlurEffect, shell_blur_effect, SHELL, BLUR_EFFECT, ClutterEffect)

ShellBlurEffect *shell_blur_effect_new (void);

int shell_blur_effect_get_radius (ShellBlurEffect *self);
void shell_blur_effect_set_radius (ShellBlurEffect *self,
                                   int              radius);

float shell_blur_effect_get_brightness (ShellBlurEffect *self);
void shell_blur_effect_set_brightness (ShellBlurEffect *self,
                                       float            brightness);

ShellBlurMode shell_blur_effect_get_mode (ShellBlurEffect *self);
void shell_blur_effect_set_mode (ShellBlurEffect *self,
                                 ShellBlurMode    mode);

ShellBlurStyle shell_blur_effect_get_style (ShellBlurEffect *self);
void shell_blur_effect_set_style (ShellBlurEffect *self,
                                  ShellBlurStyle   style);

G_END_DECLS
