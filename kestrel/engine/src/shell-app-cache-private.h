/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#pragma once

#include <gio/gio.h>
#include <gio/gdesktopappinfo.h>

#define SHELL_TYPE_APP_CACHE (shell_app_cache_get_type())

G_DECLARE_FINAL_TYPE (ShellAppCache, shell_app_cache, SHELL, APP_CACHE, GObject)

ShellAppCache   *shell_app_cache_get_default      (void);
GList           *shell_app_cache_get_all          (ShellAppCache *cache);
GDesktopAppInfo *shell_app_cache_get_info         (ShellAppCache *cache,
                                                   const char    *id);
GIcon           *shell_app_cache_get_custom_icon  (ShellAppCache *cache,
                                                   const char    *id);
const char      *shell_app_cache_get_custom_name  (ShellAppCache *cache,
                                                   const char    *id);
