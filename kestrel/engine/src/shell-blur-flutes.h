/* shell-blur-flutes.h
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <clutter/clutter.h>

CoglSnippet *shell_blur_fluted_snippet (const char *declarations,
                                        const char *source);

void shell_blur_set_flutes (CoglPipeline    *pipeline,
                            const CoglColor *surface);
