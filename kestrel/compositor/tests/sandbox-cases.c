/* SPDX-License-Identifier: GPL-2.0-or-later */
#include <fcntl.h>
#include <glib.h>
#include <glib/gstdio.h>
#include <unistd.h>

#include "core/meta-process-identity.h"

static void
write_file (const char *path,
            const char *contents)
{
  g_autoptr (GError) error = NULL;

  if (!g_file_set_contents (path, contents, -1, &error))
    g_error ("%s", error->message);
}

static char *
make_process (GKeyFile   *cases,
              const char *name)
{
  g_autoptr (GError) error = NULL;
  g_autofree char *folder = g_dir_make_tmp ("sandbox-case-XXXXXX", &error);
  g_autofree char *root = NULL;
  g_autofree char *info = NULL;
  g_autofree char *contents = NULL;
  g_autofree char *mounts = NULL;

  if (!folder)
    g_error ("%s", error->message);

  root = g_build_filename (folder, "root", NULL);
  info = g_build_filename (root, ".flatpak-info", NULL);
  if (g_key_file_get_boolean (cases, name, "hidden", NULL))
    write_file (root, "");
  else
    g_mkdir (root, 0700);

  if (g_key_file_get_boolean (cases, name, "info-link", NULL))
    symlink ("/proc/self/root/.flatpak-info", info);
  else if ((contents = g_key_file_get_string (cases, name, "info", NULL)))
    write_file (info, contents);

  if ((mounts = g_key_file_get_string (cases, name, "mountinfo", NULL)))
    {
      g_autofree char *path = g_build_filename (folder, "mountinfo", NULL);

      write_file (path, mounts);
    }

  return g_steal_pointer (&folder);
}

static void
remove_process (const char *folder)
{
  g_autofree char *root = g_build_filename (folder, "root", NULL);
  g_autofree char *info = g_build_filename (root, ".flatpak-info", NULL);
  g_autofree char *mounts = g_build_filename (folder, "mountinfo", NULL);

  g_unlink (info);
  g_unlink (mounts);
  if (g_rmdir (root) != 0)
    g_unlink (root);
  g_rmdir (folder);
}

static char *
judge (const char *folder)
{
  int process_fd = open (folder, O_PATH | O_DIRECTORY | O_CLOEXEC);
  g_autofree char *app_id = NULL;
  gboolean identified = meta_process_identify_at (process_fd, &app_id);

  close (process_fd);
  if (!identified)
    return g_strdup ("unknown");
  if (!app_id)
    return g_strdup ("you");

  return g_strdup_printf ("app %s", app_id);
}

static char *
expected (GKeyFile   *cases,
          const char *name)
{
  g_autofree char *expect = g_key_file_get_string (cases, name, "expect", NULL);
  g_autofree char *app_id = NULL;

  if (g_strcmp0 (expect, "app") != 0)
    return g_steal_pointer (&expect);

  app_id = g_key_file_get_string (cases, name, "app", NULL);
  return g_strdup_printf ("app %s", app_id);
}

int
main (int    argc,
      char **argv)
{
  g_autoptr (GKeyFile) cases = g_key_file_new ();
  g_autoptr (GError) error = NULL;
  g_auto (GStrv) names = NULL;
  int wrong = 0;
  char **name;

  if (argc != 2)
    g_error ("Usage: %s CASES", argv[0]);
  if (!g_key_file_load_from_file (cases, argv[1], G_KEY_FILE_NONE, &error))
    g_error ("%s", error->message);

  names = g_key_file_get_groups (cases, NULL);
  for (name = names; *name; name++)
    {
      g_autofree char *folder = make_process (cases, *name);
      g_autofree char *judged = judge (folder);
      g_autofree char *expect = expected (cases, *name);

      remove_process (folder);
      if (g_strcmp0 (judged, expect) != 0)
        {
          g_printerr ("%s: %s, expected %s\n", *name, judged, expect);
          wrong++;
        }
    }

  g_print ("%u of %u cases judged as listed\n", g_strv_length (names) - wrong, g_strv_length (names));
  return wrong ? 1 : 0;
}
