/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include <string.h>

#include "shell-app-cache-private.h"

#include "shell-global-private.h"
#include "st.h"

/**
 * ShellAppCache:
 *
 * Application information cache
 *
 * The #ShellAppCache is responsible for caching information about #GAppInfo
 * to ensure that the compositor thread never needs to perform disk reads to
 * access them. All of the work is done off-thread. When the new data has
 * been loaded, a #ShellAppCache::changed signal is emitted.
 */

#define QUIET_MS 250
#define LONGEST_WAIT_US (2 * G_USEC_PER_SEC)
#define CUSTOM_ICON_SEPARATOR '~'

struct _ShellAppCache
{
  GObject          parent_instance;

  GAppInfoMonitor *monitor;
  GFileMonitor    *custom_icons_monitor;
  GFileMonitor    *custom_glyphs_monitor;
  GFileMonitor    *custom_names_monitor;
  GCancellable    *cancellable;
  GList           *app_infos;
  GHashTable      *custom_icons;
  GHashTable      *custom_names;

  gboolean         glyphs_changed;
  guint            queued_update;
  gint64           first_queued;
};

G_DEFINE_TYPE (ShellAppCache, shell_app_cache, G_TYPE_OBJECT)

enum {
  CHANGED,
  N_SIGNALS
};

static guint signals [N_SIGNALS];

typedef struct
{
  GList      *app_infos;
  GHashTable *custom_icons;
  GHashTable *custom_names;
} Snapshot;

static void
free_app_infos (gpointer app_infos)
{
  g_list_free_full (app_infos, g_object_unref);
}

static void
snapshot_free (gpointer data)
{
  Snapshot *snapshot = data;

  free_app_infos (snapshot->app_infos);
  g_hash_table_unref (snapshot->custom_icons);
  g_hash_table_unref (snapshot->custom_names);
  g_free (snapshot);
}

static GFile *
custom_icons_folder (void)
{
  return g_file_new_build_filename (g_get_user_data_dir (), "luft", "app-icons", NULL);
}

/* Custom symbolic icons go into the user's icon theme as APP_ID-symbolic.svg,
 * the glyph the tinted styles look up, so a replaced one keeps its name */
static GFile *
custom_glyphs_folder (void)
{
  return g_file_new_build_filename (g_get_user_data_dir (), "icons", "hicolor", "symbolic", "apps", NULL);
}

/* Custom icons are named APP_ID~VERSION.png or .svg, so a replaced icon gets
 * a new path and nothing keeps showing the old one from a cache */
static GHashTable *
load_custom_icons (void)
{
  g_autoptr (GFile) folder = custom_icons_folder ();
  g_autoptr (GFileEnumerator) children = NULL;
  GHashTable *icons = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, g_object_unref);
  GFileInfo *info;

  children = g_file_enumerate_children (folder, G_FILE_ATTRIBUTE_STANDARD_NAME,
                                        G_FILE_QUERY_INFO_NONE, NULL, NULL);
  if (!children)
    return icons;

  while ((info = g_file_enumerator_next_file (children, NULL, NULL)))
    {
      const char *name = g_file_info_get_name (info);
      const char *separator = strrchr (name, CUSTOM_ICON_SEPARATOR);

      if (separator && (g_str_has_suffix (name, ".png") || g_str_has_suffix (name, ".svg")))
        {
          g_autoptr (GFile) file = g_file_get_child (folder, name);
          g_autofree char *app_id = g_strndup (name, separator - name);

          g_hash_table_replace (icons,
                                g_strconcat (app_id, ".desktop", NULL),
                                g_file_icon_new (file));
        }
      g_object_unref (info);
    }

  return icons;
}

static GFile *
custom_names_file (void)
{
  return g_file_new_build_filename (g_get_user_data_dir (), "luft", "app-names", NULL);
}

static GHashTable *
load_custom_names (void)
{
  g_autoptr (GFile) file = custom_names_file ();
  g_autoptr (GKeyFile) key_file = g_key_file_new ();
  g_auto (GStrv) ids = NULL;
  GHashTable *names = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, g_free);

  if (!g_key_file_load_from_file (key_file, g_file_peek_path (file), G_KEY_FILE_NONE, NULL))
    return names;

  ids = g_key_file_get_keys (key_file, "Names", NULL, NULL);
  for (char **id = ids; id && *id; id++)
    {
      char *name = g_key_file_get_string (key_file, "Names", *id, NULL);

      if (name)
        g_hash_table_replace (names, g_strdup (*id), name);
    }

  return names;
}

static Snapshot *
take_snapshot (void)
{
  Snapshot *snapshot = g_new0 (Snapshot, 1);

  snapshot->app_infos = g_app_info_get_all ();
  snapshot->custom_icons = load_custom_icons ();
  snapshot->custom_names = load_custom_names ();
  return snapshot;
}

/**
 * shell_app_cache_get_default:
 *
 * Gets the default #ShellAppCache.
 *
 * Returns: (transfer none): a #ShellAppCache
 */
ShellAppCache *
shell_app_cache_get_default (void)
{
  return shell_global_get_app_cache (shell_global_get ());
}

static void
shell_app_cache_worker (GTask        *task,
                        gpointer      source_object,
                        gpointer      task_data,
                        GCancellable *cancellable)
{
  g_assert (G_IS_TASK (task));
  g_assert (SHELL_IS_APP_CACHE (source_object));

  g_task_return_pointer (task, take_snapshot (), snapshot_free);
}

static void
apply_update_cb (GObject      *object,
                 GAsyncResult *result,
                 gpointer      user_data)
{
  ShellAppCache *cache = (ShellAppCache *)object;
  g_autoptr(GError) error = NULL;
  Snapshot *snapshot;

  g_assert (SHELL_IS_APP_CACHE (cache));
  g_assert (G_IS_TASK (result));
  g_assert (user_data == NULL);

  snapshot = g_task_propagate_pointer (G_TASK (result), &error);

  if (g_error_matches (error, G_IO_ERROR, G_IO_ERROR_CANCELLED))
    return;

  free_app_infos (cache->app_infos);
  g_hash_table_unref (cache->custom_icons);
  cache->app_infos = snapshot->app_infos;
  cache->custom_icons = snapshot->custom_icons;
  g_hash_table_unref (cache->custom_names);
  cache->custom_names = snapshot->custom_names;
  g_free (snapshot);

  if (cache->glyphs_changed)
    {
      cache->glyphs_changed = FALSE;
      st_texture_cache_reload_icon_theme (st_texture_cache_get_default ());
    }

  g_signal_emit (cache, signals[CHANGED], 0);
}

static void
shell_app_cache_do_update (gpointer user_data)
{
  ShellAppCache *cache = user_data;
  g_autoptr(GTask) task = NULL;

  cache->queued_update = 0;
  cache->first_queued = 0;

  /* Reset the cancellable state so we don't race with
   * two updates coming back overlapped and applying the
   * information in the wrong order.
   */
  g_cancellable_cancel (cache->cancellable);
  g_clear_object (&cache->cancellable);
  cache->cancellable = g_cancellable_new ();

  task = g_task_new (cache, cache->cancellable, apply_update_cb, NULL);
  g_task_set_source_tag (task, shell_app_cache_do_update);
  g_task_run_in_thread (task, shell_app_cache_worker);
}

static void
shell_app_cache_queue_update (ShellAppCache *self)
{
  g_assert (SHELL_IS_APP_CACHE (self));

  gint64 now = g_get_monotonic_time ();

  if (self->queued_update == 0)
    self->first_queued = now;
  else if (now - self->first_queued >= LONGEST_WAIT_US)
    return;
  else
    g_source_remove (self->queued_update);

  self->queued_update = g_timeout_add_once (QUIET_MS,
                                            shell_app_cache_do_update,
                                            self);
}

static void
shell_app_cache_finalize (GObject *object)
{
  ShellAppCache *self = (ShellAppCache *)object;

  g_clear_object (&self->monitor);
  g_clear_object (&self->custom_icons_monitor);
  g_clear_object (&self->custom_glyphs_monitor);
  g_clear_object (&self->custom_names_monitor);
  g_clear_pointer (&self->custom_icons, g_hash_table_unref);
  g_clear_pointer (&self->custom_names, g_hash_table_unref);

  g_clear_handle_id (&self->queued_update, g_source_remove);

  free_app_infos (self->app_infos);

  G_OBJECT_CLASS (shell_app_cache_parent_class)->finalize (object);
}

static void
shell_app_cache_class_init (ShellAppCacheClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);

  object_class->finalize = shell_app_cache_finalize;

  /**
   * ShellAppCache::changed:
   *
   * The "changed" signal is emitted when the cache has updated
   * information about installed applications.
   */
  signals [CHANGED] =
    g_signal_new ("changed",
                  G_TYPE_FROM_CLASS (klass),
                  G_SIGNAL_RUN_LAST,
                  0, NULL, NULL, NULL,
                  G_TYPE_NONE, 0);
}

static void
on_custom_glyphs_changed (ShellAppCache *self)
{
  self->glyphs_changed = TRUE;
  shell_app_cache_queue_update (self);
}

static void
shell_app_cache_init (ShellAppCache *self)
{
  g_autoptr (GFile) folder = custom_icons_folder ();
  g_autoptr (GFile) glyphs = custom_glyphs_folder ();
  g_autoptr (GFile) names = custom_names_file ();

  self->monitor = g_app_info_monitor_get ();
  g_signal_connect_object (self->monitor,
                           "changed",
                           G_CALLBACK (shell_app_cache_queue_update),
                           self,
                           G_CONNECT_SWAPPED);
  self->app_infos = g_app_info_get_all ();
  self->custom_icons = load_custom_icons ();
  self->custom_names = load_custom_names ();
  self->custom_icons_monitor = g_file_monitor_directory (folder, G_FILE_MONITOR_WATCH_MOVES, NULL, NULL);
  if (self->custom_icons_monitor)
    g_signal_connect_object (self->custom_icons_monitor,
                             "changed",
                             G_CALLBACK (shell_app_cache_queue_update),
                             self,
                             G_CONNECT_SWAPPED);
  self->custom_glyphs_monitor = g_file_monitor_directory (glyphs, G_FILE_MONITOR_WATCH_MOVES, NULL, NULL);
  if (self->custom_glyphs_monitor)
    g_signal_connect_object (self->custom_glyphs_monitor,
                             "changed",
                             G_CALLBACK (on_custom_glyphs_changed),
                             self,
                             G_CONNECT_SWAPPED);
  self->custom_names_monitor = g_file_monitor_file (names, G_FILE_MONITOR_WATCH_MOVES, NULL, NULL);
  if (self->custom_names_monitor)
    g_signal_connect_object (self->custom_names_monitor,
                             "changed",
                             G_CALLBACK (shell_app_cache_queue_update),
                             self,
                             G_CONNECT_SWAPPED);
}

/**
 * shell_app_cache_get_all:
 * @cache: (nullable): a #ShellAppCache or %NULL
 *
 * Like g_app_info_get_all() but always returns a
 * cached set of application info so the caller can be
 * sure that I/O will not happen on the current thread.
 *
 * Returns: (transfer none) (element-type GAppInfo):
 *   a #GList of references to #GAppInfo.
 */
GList *
shell_app_cache_get_all (ShellAppCache *cache)
{
  g_return_val_if_fail (SHELL_IS_APP_CACHE (cache), NULL);

  return cache->app_infos;
}

/**
 * shell_app_cache_get_info:
 * @cache: (nullable): a #ShellAppCache or %NULL
 * @id: the application id
 *
 * A replacement for g_desktop_app_info_new() that will lookup the
 * information from the cache instead of (re)loading from disk.
 *
 * Returns: (nullable) (transfer none): a #GDesktopAppInfo or %NULL
 */
GDesktopAppInfo *
shell_app_cache_get_info (ShellAppCache *cache,
                          const char    *id)
{
  const GList *iter;

  g_return_val_if_fail (SHELL_IS_APP_CACHE (cache), NULL);

  for (iter = cache->app_infos; iter != NULL; iter = iter->next)
    {
      GAppInfo *info = iter->data;

      if (g_strcmp0 (id, g_app_info_get_id (info)) == 0)
        return G_DESKTOP_APP_INFO (info);
    }

  return NULL;
}

/**
 * shell_app_cache_get_custom_icon:
 * @cache: a #ShellAppCache
 * @id: the application id
 *
 * Returns: (transfer none) (nullable): the icon the person chose for the
 *   application in place of its own, if any
 */
GIcon *
shell_app_cache_get_custom_icon (ShellAppCache *cache,
                                 const char    *id)
{
  return g_hash_table_lookup (cache->custom_icons, id);
}

/**
 * shell_app_cache_get_custom_name:
 * @cache: a #ShellAppCache
 * @id: the application id
 *
 * Returns: (transfer none) (nullable): the name the person gave the
 *   application in place of its own, if any
 */
const char *
shell_app_cache_get_custom_name (ShellAppCache *cache,
                                 const char    *id)
{
  return g_hash_table_lookup (cache->custom_names, id);
}
