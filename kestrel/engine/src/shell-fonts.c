/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <fontconfig/fontconfig.h>
#include <clutter/clutter-pango.h>
#include <pango/pangofc-fontmap.h>

#include "shell-fonts.h"

void
shell_fonts_add_bundled (const char *datadir)
{
  g_autofree char *fontdir = g_build_filename (datadir, "fonts", NULL);

  if (!FcConfigAppFontAddDir (NULL, (const FcChar8 *) fontdir))
    g_warning ("Failed to load the shell fonts from %s", fontdir);
}

/**
 * shell_fonts_refresh:
 * @stage: the stage whose text to lay out again
 * @datadir: the folder holding the shell's own fonts
 *
 * Picks up fonts that were installed or removed since fontconfig last
 * looked, so text never refers to a font file that is gone.
 *
 * Returns: whether anything changed
 */
gboolean
shell_fonts_refresh (ClutterActor *stage,
                     const char   *datadir)
{
  PangoFontMap *font_map;

  if (FcConfigUptoDate (NULL))
    return FALSE;

  FcInitReinitialize ();
  shell_fonts_add_bundled (datadir);

  font_map = pango_context_get_font_map (clutter_actor_get_pango_context (stage));
  pango_fc_font_map_config_changed (PANGO_FC_FONT_MAP (font_map));
  g_signal_emit_by_name (clutter_context_get_backend (clutter_actor_get_context (stage)),
                         "font-changed");
  return TRUE;
}
