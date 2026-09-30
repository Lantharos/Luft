/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#pragma once

#if !defined(ST_H_INSIDE) && !defined(ST_COMPILATION)
#error "Only <st/st.h> can be included directly.h"
#endif

#include <clutter/clutter.h>
#include <gio/gio.h>

G_BEGIN_DECLS

#define ST_TYPE_STYLED_ICON (st_styled_icon_get_type ())
G_DECLARE_FINAL_TYPE (StStyledIcon, st_styled_icon, ST, STYLED_ICON, GObject)

G_END_DECLS
