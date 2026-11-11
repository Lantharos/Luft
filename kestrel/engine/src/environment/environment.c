/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "environment.h"

#include <stdlib.h>
#include <string.h>

static bool
names (const char *list,
       const char *name,
       size_t      length)
{
  while (*list)
    {
      size_t entry = strcspn (list, " ");
      bool prefix = entry > 0 && list[entry - 1] == '*';
      size_t compared = prefix ? entry - 1 : entry;

      if (prefix ? length >= compared && strncmp (list, name, compared) == 0
                 : length == entry && strncmp (list, name, length) == 0)
        return true;

      list += entry;
      list += strspn (list, " ");
    }

  return false;
}

static size_t
name_length (const char *entry)
{
  const char *equals = strchr (entry, '=');

  return equals ? (size_t) (equals - entry) : strlen (entry);
}

bool
luft_environment_keeps (const char *entry,
                        bool        development)
{
  size_t length = name_length (entry);

  return names (LUFT_ALLOWED_ENVIRONMENT, entry, length) ||
         (development && names (LUFT_DEVELOPMENT_ENVIRONMENT, entry, length));
}

bool
luft_environment_is_unsafe (const char *name)
{
  return names (LUFT_UNSAFE_ENVIRONMENT, name, strlen (name));
}

static bool
is_path (const char *entry)
{
  return strncmp (entry, "PATH=", strlen ("PATH=")) == 0;
}

char **
luft_environment_for_luft (char * const *environment,
                           bool          development)
{
  size_t count = 0, kept = 0;
  bool has_path = false;
  char **luft;

  while (environment[count])
    count++;

  luft = calloc (count + 2, sizeof (char *));
  if (!luft)
    return NULL;

  for (size_t i = 0; i < count; i++)
    {
      if (!luft_environment_keeps (environment[i], development))
        continue;
      has_path |= is_path (environment[i]);
      luft[kept++] = environment[i];
    }

  if (!has_path)
    luft[kept] = (char *) LUFT_ENVIRONMENT_PATH;

  return luft;
}
