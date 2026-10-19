/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <stdlib.h>

#include "shell-app-memory-private.h"

static const char * const web_types[] = {
  "x-scheme-handler/http",
  "x-scheme-handler/https",
  "text/html",
  NULL,
};

static gboolean
browses_the_web (GDesktopAppInfo *info)
{
  const char *categories = g_desktop_app_info_get_categories (info);
  const char * const *types = g_app_info_get_supported_types (G_APP_INFO (info));
  g_auto (GStrv) category_list = NULL;

  if (categories)
    {
      category_list = g_strsplit (categories, ";", -1);
      if (g_strv_contains ((const char * const *) category_list, "WebBrowser"))
        return TRUE;
    }

  for (const char * const *type = web_types; types && *type; type++)
    if (g_strv_contains (types, *type))
      return TRUE;

  return FALSE;
}

static gboolean
is_sabine_app (GDesktopAppInfo *info)
{
  const char *executable = g_app_info_get_executable (G_APP_INFO (info));
  g_autofree char *unquoted = executable ? g_shell_unquote (executable, NULL) : NULL;
  g_autofree char *program = unquoted ? g_find_program_in_path (unquoted) : NULL;
  g_autofree char *resolved = program ? realpath (program, NULL) : NULL;
  g_autofree char *directory = NULL;
  g_autofree char *manifest = NULL;

  if (!resolved)
    return FALSE;

  directory = g_path_get_dirname (resolved);
  manifest = g_build_filename (directory, "resources", "Sabine.toml", NULL);
  return g_file_test (manifest, G_FILE_TEST_IS_REGULAR);
}

gboolean
shell_app_memory_can_merge (GDesktopAppInfo *info)
{
  return is_sabine_app (info) && !browses_the_web (info);
}
