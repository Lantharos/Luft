/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

#include "config.h"

#include "shell-app-cache-private.h"

#include "shell-global-private.h"

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

#define DEFAULT_TIMEOUT_SECONDS 5

struct _ShellAppCache
{
  GObject          parent_instance;

  GAppInfoMonitor *monitor;
  GCancellable    *cancellable;
  GList           *app_infos;

  guint            queued_update;
};

G_DEFINE_TYPE (ShellAppCache, shell_app_cache, G_TYPE_OBJECT)

enum {
  CHANGED,
  N_SIGNALS
};

static guint signals [N_SIGNALS];

static void
free_app_infos (gpointer app_infos)
{
  g_list_free_full (app_infos, g_object_unref);
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

  g_task_return_pointer (task, g_app_info_get_all (), free_app_infos);
}

static void
apply_update_cb (GObject      *object,
                 GAsyncResult *result,
                 gpointer      user_data)
{
  ShellAppCache *cache = (ShellAppCache *)object;
  g_autoptr(GError) error = NULL;
  GList *app_infos;

  g_assert (SHELL_IS_APP_CACHE (cache));
  g_assert (G_IS_TASK (result));
  g_assert (user_data == NULL);

  app_infos = g_task_propagate_pointer (G_TASK (result), &error);

  if (g_error_matches (error, G_IO_ERROR, G_IO_ERROR_CANCELLED))
    return;

  free_app_infos (cache->app_infos);
  cache->app_infos = app_infos;

  g_signal_emit (cache, signals[CHANGED], 0);
}

static void
shell_app_cache_do_update (gpointer user_data)
{
  ShellAppCache *cache = user_data;
  g_autoptr(GTask) task = NULL;

  cache->queued_update = 0;

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

  if (self->queued_update != 0)
    g_source_remove (self->queued_update);

  self->queued_update = g_timeout_add_seconds_once (DEFAULT_TIMEOUT_SECONDS,
                                                    shell_app_cache_do_update,
                                                    self);
}

static void
shell_app_cache_finalize (GObject *object)
{
  ShellAppCache *self = (ShellAppCache *)object;

  g_clear_object (&self->monitor);

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
shell_app_cache_init (ShellAppCache *self)
{
  self->monitor = g_app_info_monitor_get ();
  g_signal_connect_object (self->monitor,
                           "changed",
                           G_CALLBACK (shell_app_cache_queue_update),
                           self,
                           G_CONNECT_SWAPPED);
  self->app_infos = g_app_info_get_all ();
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
