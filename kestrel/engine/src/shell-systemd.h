/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#include <glib.h>

void shell_systemd_start_app_scope (const char *name,
                                    gint32      pid);

char *shell_systemd_get_oui_vendor (const char *address);
