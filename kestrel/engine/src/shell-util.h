/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#pragma once

#include <gio/gio.h>
#include <clutter/clutter.h>
#include <gdk-pixbuf/gdk-pixbuf.h>
#include <meta/meta-cursor-tracker.h>
#include <meta/meta-window-actor.h>

G_BEGIN_DECLS

void     shell_util_set_hidden_from_pick       (ClutterActor     *actor,
                                                gboolean          hidden);

int      shell_util_get_week_start             (void);

const char *shell_util_translate_time_string   (const char *str);

GdkPixbuf *shell_util_create_pixbuf_from_data (const guchar      *data,
                                               gsize              len,
                                               GdkColorspace      colorspace,
                                               gboolean           has_alpha,
                                               int                bits_per_sample,
                                               int                width,
                                               int                height,
                                               int                rowstride);

void shell_util_systemd_unit_exists (const gchar         *unit,
                                     GCancellable        *cancellable,
                                     GAsyncReadyCallback  callback,
                                     gpointer             user_data);
gboolean shell_util_systemd_unit_exists_finish (GAsyncResult  *res,
                                                GError       **error);

void shell_util_sd_notify (void);

gboolean shell_util_has_x11_display_extension (MetaDisplay *display,
                                               const char  *extension);

gint shell_util_get_uid (void);

GPid shell_util_spawn_async (const char          *working_directory,
                             const char * const  *argv,
                             const char * const  *envp,
                             GSpawnFlags          flags,
                             GError             **error);

G_END_DECLS
