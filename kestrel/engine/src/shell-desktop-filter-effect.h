#pragma once

#include <clutter/clutter.h>

G_BEGIN_DECLS

#define SHELL_TYPE_DESKTOP_FILTER_EFFECT (shell_desktop_filter_effect_get_type ())
G_DECLARE_FINAL_TYPE (ShellDesktopFilterEffect, shell_desktop_filter_effect,
                      SHELL, DESKTOP_FILTER_EFFECT, ClutterEffect)

void shell_desktop_filter_effect_set_fills_view (ShellDesktopFilterEffect *self,
                                                 gboolean                  fills_view);

void shell_desktop_filter_effect_set_view_filter (ShellDesktopFilterEffect *self,
                                                  ClutterStageView         *view,
                                                  ClutterViewFilter        *filter);

void shell_desktop_filter_effect_set_reach (ShellDesktopFilterEffect *self,
                                            float                     reach);

void shell_desktop_filter_effect_set_captured (ShellDesktopFilterEffect *self,
                                               gboolean                  captured);

void shell_desktop_filter_effect_queue_frame (ShellDesktopFilterEffect *self,
                                              const MtkRegion          *shown);

G_END_DECLS
