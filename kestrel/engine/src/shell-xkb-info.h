/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib-object.h>

#define SHELL_TYPE_XKB_INFO (shell_xkb_info_get_type ())
G_DECLARE_FINAL_TYPE (ShellXkbInfo, shell_xkb_info, SHELL, XKB_INFO, GObject)

ShellXkbInfo *shell_xkb_info_new (void);

gboolean shell_xkb_info_get_layout_info (ShellXkbInfo  *self,
                                         const char    *id,
                                         const char   **display_name,
                                         const char   **short_name,
                                         const char   **xkb_layout,
                                         const char   **xkb_variant);

const char * const *shell_xkb_info_get_languages_for_layout (ShellXkbInfo *self,
                                                             const char   *id);
