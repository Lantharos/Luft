/* shell-blur-vesa.h
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <clutter/clutter.h>

#define SHELL_BLUR_VESA_BEZEL_SHARE 0.6
#define SHELL_BLUR_VESA_BEZEL_MIN 10.0
#define SHELL_BLUR_VESA_BEZEL_MAX 18.0
#define SHELL_BLUR_VESA_BEZEL_FIT 0.3
#define SHELL_BLUR_VESA_REACH 1.8
#define SHELL_BLUR_VESA_FRINGING 0.05
#define SHELL_BLUR_VESA_WIDEST_FRINGE 0.8

float shell_blur_vesa_reach (float corner_radius,
                             float width,
                             float height);
void shell_blur_vesa_add_refraction (CoglPipeline *pipeline);
void shell_blur_vesa_add_lighting (CoglPipeline *pipeline);
void shell_blur_vesa_set_uniforms (CoglPipeline *pipeline,
                                   float         scale,
                                   const float  *map,
                                   const float  *extent,
                                   const float  *bounds,
                                   const float  *open,
                                   const float  *room,
                                   ClutterActor *surface,
                                   GPtrArray    *lenses);
