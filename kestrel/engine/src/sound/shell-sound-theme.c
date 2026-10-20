/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include "shell-sound-private.h"

#define FALLBACK_THEME "freedesktop"
#define MAX_DEPTH 8

static const char * const extensions[] = { ".disabled", ".oga", ".ogg", ".wav", NULL };

struct _ShellSoundTheme
{
  GPtrArray *folders;
  GHashTable *seen;
};

static GPtrArray *
data_dirs (void)
{
  GPtrArray *dirs = g_ptr_array_new ();
  const char * const *system = g_get_system_data_dirs ();

  g_ptr_array_add (dirs, (gpointer) g_get_user_data_dir ());
  for (; *system; system++)
    g_ptr_array_add (dirs, (gpointer) *system);

  return dirs;
}

static gboolean
is_stereo (GKeyFile   *index,
           const char *folder)
{
  g_autofree char *profile = g_key_file_get_string (index, folder, "OutputProfile", NULL);

  return !profile || g_str_equal (profile, "stereo");
}

static void
add_theme (ShellSoundTheme *theme,
           const char      *name,
           guint            depth)
{
  g_autoptr (GPtrArray) dirs = NULL;
  g_auto (GStrv) inherits = NULL;

  if (depth > MAX_DEPTH || !g_hash_table_add (theme->seen, g_strdup (name)))
    return;

  dirs = data_dirs ();
  for (guint i = 0; i < dirs->len; i++)
    {
      g_autofree char *root = g_build_filename (dirs->pdata[i], "sounds", name, NULL);
      g_autofree char *path = g_build_filename (root, "index.theme", NULL);
      g_autoptr (GKeyFile) index = g_key_file_new ();
      g_auto (GStrv) folders = NULL;

      if (!g_key_file_load_from_file (index, path, G_KEY_FILE_NONE, NULL))
        continue;

      folders = g_key_file_get_string_list (index, "Sound Theme", "Directories", NULL, NULL);
      for (char **folder = folders; folder && *folder; folder++)
        if (is_stereo (index, *folder))
          g_ptr_array_add (theme->folders, g_build_filename (root, *folder, NULL));

      if (!inherits)
        inherits = g_key_file_get_string_list (index, "Sound Theme", "Inherits", NULL, NULL);
    }

  for (char **parent = inherits; parent && *parent; parent++)
    add_theme (theme, g_strstrip (*parent), depth + 1);
}

ShellSoundTheme *
_shell_sound_theme_new (const char *name)
{
  ShellSoundTheme *theme = g_new0 (ShellSoundTheme, 1);

  theme->folders = g_ptr_array_new_with_free_func (g_free);
  theme->seen = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, NULL);
  add_theme (theme, name, 0);
  add_theme (theme, FALLBACK_THEME, 0);
  g_clear_pointer (&theme->seen, g_hash_table_unref);

  return theme;
}

void
_shell_sound_theme_free (ShellSoundTheme *theme)
{
  g_ptr_array_unref (theme->folders);
  g_free (theme);
}

static GFile *
find (ShellSoundTheme *theme,
      const char      *name,
      gboolean        *disabled)
{
  for (guint i = 0; i < theme->folders->len; i++)
    {
      for (const char * const *extension = extensions; *extension; extension++)
        {
          g_autofree char *file_name = g_strconcat (name, *extension, NULL);
          g_autofree char *path = g_build_filename (theme->folders->pdata[i], file_name, NULL);

          if (!g_file_test (path, G_FILE_TEST_IS_REGULAR))
            continue;

          *disabled = extension == extensions;
          return *disabled ? NULL : g_file_new_for_path (path);
        }
    }

  return NULL;
}

GFile *
_shell_sound_theme_lookup (ShellSoundTheme *theme,
                           const char      *name,
                           gboolean        *disabled)
{
  g_autofree char *candidate = g_strdup (name);

  *disabled = FALSE;
  while (TRUE)
    {
      GFile *file = find (theme, candidate, disabled);
      char *dash;

      if (file || *disabled)
        return file;

      dash = strrchr (candidate, '-');
      if (!dash)
        return NULL;
      *dash = '\0';
    }
}
