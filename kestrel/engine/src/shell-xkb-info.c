/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <gio/gio.h>
#include <glib/gi18n-lib.h>
#include <xkbcommon/xkbregistry.h>

#include "shell-xkb-info.h"

#define XKB_RULES "evdev"
#define XKB_DOMAIN "xkeyboard-config"

typedef struct _Layout Layout;

struct _Layout
{
  char *name;
  char *description;
  char *brief;
  char **languages;
  const Layout *main;
};

struct _ShellXkbInfo
{
  GObject parent_instance;

  GSettings *settings;
  GHashTable *layouts;
};

G_DEFINE_FINAL_TYPE (ShellXkbInfo, shell_xkb_info, G_TYPE_OBJECT)

static const char * const no_languages[] = { NULL };

static void
layout_free (Layout *layout)
{
  g_free (layout->name);
  g_free (layout->description);
  g_free (layout->brief);
  g_strfreev (layout->languages);
  g_free (layout);
}

static char **
reversed_languages (struct rxkb_layout *layout)
{
  g_autoptr (GPtrArray) languages = g_ptr_array_new ();
  struct rxkb_iso639_code *code;

  for (code = rxkb_layout_get_iso639_first (layout); code; code = rxkb_iso639_code_next (code))
    g_ptr_array_insert (languages, 0, g_strdup (rxkb_iso639_code_get_code (code)));
  g_ptr_array_add (languages, NULL);

  return (char **) g_ptr_array_free (g_steal_pointer (&languages), FALSE);
}

static void
add_layouts (GHashTable          *layouts,
             struct rxkb_context *context,
             gboolean             variants)
{
  struct rxkb_layout *entry;

  for (entry = rxkb_layout_first (context); entry; entry = rxkb_layout_next (entry))
    {
      const char *name = rxkb_layout_get_name (entry);
      const char *variant = rxkb_layout_get_variant (entry);
      const Layout *main = NULL;
      g_autofree char *id = NULL;
      Layout *layout;

      if ((variant != NULL) != variants)
        continue;

      if (variant)
        {
          main = g_hash_table_lookup (layouts, name);
          if (!main)
            continue;
          id = g_strjoin ("+", name, variant, NULL);
        }
      else
        {
          id = g_strdup (name);
        }

      if (g_hash_table_contains (layouts, id))
        continue;

      layout = g_new0 (Layout, 1);
      layout->name = g_strdup (variant ? variant : name);
      layout->description = g_strdup (rxkb_layout_get_description (entry));
      layout->brief = g_strdup (rxkb_layout_get_brief (entry));
      layout->languages = reversed_languages (entry);
      layout->main = main;
      g_hash_table_insert (layouts, g_steal_pointer (&id), layout);
    }
}

static GHashTable *
ensure_layouts (ShellXkbInfo *self)
{
  enum rxkb_context_flags flags = RXKB_CONTEXT_NO_FLAGS;
  struct rxkb_context *context;

  if (self->layouts)
    return self->layouts;

  if (g_settings_get_boolean (self->settings, "show-all-sources"))
    flags |= RXKB_CONTEXT_LOAD_EXOTIC_RULES;

  context = rxkb_context_new (flags);
  if (!rxkb_context_parse (context, XKB_RULES))
    {
      g_warning ("Failed to load '%s' XKB layouts", XKB_RULES);
      rxkb_context_unref (context);
      return NULL;
    }

  self->layouts = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, (GDestroyNotify) layout_free);
  add_layouts (self->layouts, context, FALSE);
  add_layouts (self->layouts, context, TRUE);
  rxkb_context_unref (context);

  return self->layouts;
}

static void
on_show_all_sources_changed (ShellXkbInfo *self)
{
  g_clear_pointer (&self->layouts, g_hash_table_unref);
}

static void
shell_xkb_info_finalize (GObject *object)
{
  ShellXkbInfo *self = SHELL_XKB_INFO (object);

  g_clear_pointer (&self->layouts, g_hash_table_unref);
  g_clear_object (&self->settings);

  G_OBJECT_CLASS (shell_xkb_info_parent_class)->finalize (object);
}

static void
shell_xkb_info_class_init (ShellXkbInfoClass *klass)
{
  G_OBJECT_CLASS (klass)->finalize = shell_xkb_info_finalize;

  bind_textdomain_codeset (XKB_DOMAIN, "UTF-8");
}

static void
shell_xkb_info_init (ShellXkbInfo *self)
{
  self->settings = g_settings_new ("org.gnome.desktop.input-sources");
  g_signal_connect_swapped (self->settings, "changed::show-all-sources",
                            G_CALLBACK (on_show_all_sources_changed), self);
}

/**
 * shell_xkb_info_new:
 *
 * Creates a reader for the keyboard layouts the XKB rules describe,
 * including the ones in the user's own XKB configuration.
 *
 * Returns: (transfer full): a new #ShellXkbInfo
 */
ShellXkbInfo *
shell_xkb_info_new (void)
{
  return g_object_new (SHELL_TYPE_XKB_INFO, NULL);
}

static const char *
translated (const char *text)
{
  return text && *text ? g_dgettext (XKB_DOMAIN, text) : "";
}

/**
 * shell_xkb_info_get_layout_info:
 * @self: a #ShellXkbInfo
 * @id: an input source ID such as `us` or `de+nodeadkeys`
 * @display_name: (out) (optional) (transfer none): the layout's translated name
 * @short_name: (out) (optional) (transfer none): the layout's translated short name
 * @xkb_layout: (out) (optional) (transfer none): the XKB layout
 * @xkb_variant: (out) (optional) (transfer none): the XKB variant, or an empty string
 *
 * Returns: whether the layout exists
 */
gboolean
shell_xkb_info_get_layout_info (ShellXkbInfo  *self,
                                const char    *id,
                                const char   **display_name,
                                const char   **short_name,
                                const char   **xkb_layout,
                                const char   **xkb_variant)
{
  GHashTable *layouts = ensure_layouts (self);
  const Layout *layout = layouts ? g_hash_table_lookup (layouts, id) : NULL;
  const char *brief;

  if (display_name)
    *display_name = NULL;
  if (short_name)
    *short_name = NULL;
  if (xkb_layout)
    *xkb_layout = NULL;
  if (xkb_variant)
    *xkb_variant = NULL;

  if (!layout)
    return FALSE;

  brief = layout->brief ? layout->brief : layout->main ? layout->main->brief : NULL;

  if (display_name)
    *display_name = translated (layout->description);
  if (short_name)
    *short_name = translated (brief);
  if (xkb_layout)
    *xkb_layout = layout->main ? layout->main->name : layout->name;
  if (xkb_variant)
    *xkb_variant = layout->main ? layout->name : "";

  return TRUE;
}

/**
 * shell_xkb_info_get_languages_for_layout:
 * @self: a #ShellXkbInfo
 * @id: an input source ID
 *
 * Returns: (transfer none) (array zero-terminated=1): the ISO 639 codes of the
 *   languages the layout is meant for
 */
const char * const *
shell_xkb_info_get_languages_for_layout (ShellXkbInfo *self,
                                         const char   *id)
{
  GHashTable *layouts = ensure_layouts (self);
  const Layout *layout = layouts ? g_hash_table_lookup (layouts, id) : NULL;

  return layout ? (const char * const *) layout->languages : no_languages;
}
