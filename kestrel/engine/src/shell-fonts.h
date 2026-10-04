/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <clutter/clutter.h>

void shell_fonts_add_bundled (const char *datadir);

gboolean shell_fonts_refresh (ClutterActor *stage,
                              const char   *datadir);
