/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <sys/stat.h>

#include "shell-development-private.h"

static gboolean
same_file (const char *first,
           const char *second)
{
  struct stat a, b;

  return stat (first, &a) == 0 && stat (second, &b) == 0 &&
         a.st_dev == b.st_dev && a.st_ino == b.st_ino;
}

static gboolean
started_from_build (void)
{
  const char *build = g_getenv ("KESTREL_BUILDDIR");
  g_autofree char *built = NULL;

  if (!build || same_file ("/proc/self/exe", KESTREL_BINDIR "/kestrel"))
    return FALSE;

  built = g_build_filename (build, "kestrel", NULL);
  return same_file ("/proc/self/exe", built);
}

gboolean
shell_development_build (void)
{
  static gsize checked = 0;
  static gboolean from_build = FALSE;

  if (g_once_init_enter (&checked))
    {
      from_build = started_from_build ();
      g_once_init_leave (&checked, 1);
    }

  return from_build;
}

const char *
shell_development_path (const char *variable)
{
  return shell_development_build () ? g_getenv (variable) : NULL;
}
