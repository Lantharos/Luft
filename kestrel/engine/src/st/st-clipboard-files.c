/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */

/*
 * Files on the clipboard: their URIs, and for apps in a sandbox a key of
 * the document portal's file transfer, which their toolkits trade for the
 * files. A key is registered only when an app asks for one, on a thread of
 * its own, and works once.
 */

#define _GNU_SOURCE

#include "config.h"

#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <gio/gunixfdlist.h>

#include "st-clipboard-files.h"

#define URI_LIST "text/uri-list"
#define DOCUMENTS "org.freedesktop.portal.Documents"
#define DOCUMENTS_PATH "/org/freedesktop/portal/documents"
#define FILE_TRANSFER "org.freedesktop.portal.FileTransfer"

static const char *transfer_types[] = {
  "application/vnd.portal.filetransfer",
  "application/vnd.portal.files",
  NULL,
};

struct _StClipboardFiles
{
  MetaSelectionSource parent;

  GStrv paths;
  GBytes *uri_list;
};

G_DEFINE_FINAL_TYPE (StClipboardFiles, st_clipboard_files,
                     META_TYPE_SELECTION_SOURCE)

static gboolean
is_transfer (const char *mimetype)
{
  return g_strv_contains (transfer_types, mimetype);
}

static gboolean
all_writable (GStrv paths)
{
  for (int i = 0; paths[i]; i++)
    {
      if (access (paths[i], W_OK) != 0)
        return FALSE;
    }

  return TRUE;
}

static void
stop_transfer (GDBusConnection *bus,
               const char      *key)
{
  g_autoptr (GVariant) reply = NULL;

  reply = g_dbus_connection_call_sync (bus, DOCUMENTS, DOCUMENTS_PATH,
                                       FILE_TRANSFER, "StopTransfer",
                                       g_variant_new ("(s)", key), NULL,
                                       G_DBUS_CALL_FLAGS_NONE, -1, NULL, NULL);
}

static gboolean
add_files (GDBusConnection  *bus,
           const char       *key,
           GStrv             paths,
           GError          **error)
{
  g_autoptr (GUnixFDList) fds = g_unix_fd_list_new ();
  g_autoptr (GVariant) reply = NULL;
  GVariantBuilder handles;

  g_variant_builder_init (&handles, G_VARIANT_TYPE ("ah"));
  for (int i = 0; paths[i]; i++)
    {
      int fd = open (paths[i], O_PATH | O_CLOEXEC);
      int index;

      if (fd < 0)
        {
          g_variant_builder_clear (&handles);
          g_set_error (error, G_IO_ERROR, g_io_error_from_errno (errno),
                       "%s can't be opened", paths[i]);
          return FALSE;
        }

      index = g_unix_fd_list_append (fds, fd, error);
      close (fd);
      if (index < 0)
        {
          g_variant_builder_clear (&handles);
          return FALSE;
        }

      g_variant_builder_add (&handles, "h", index);
    }

  reply = g_dbus_connection_call_with_unix_fd_list_sync (bus, DOCUMENTS, DOCUMENTS_PATH,
                                                         FILE_TRANSFER, "AddFiles",
                                                         g_variant_new ("(sah@a{sv})", key, &handles,
                                                                        g_variant_new_array (G_VARIANT_TYPE ("{sv}"), NULL, 0)),
                                                         NULL, G_DBUS_CALL_FLAGS_NONE, -1,
                                                         fds, NULL, NULL, error);
  return reply != NULL;
}

static char *
start_transfer (GStrv          paths,
                GCancellable  *cancellable,
                GError       **error)
{
  g_autoptr (GDBusConnection) bus = NULL;
  g_autoptr (GVariant) reply = NULL;
  GVariantBuilder options;
  char *key;

  bus = g_bus_get_sync (G_BUS_TYPE_SESSION, cancellable, error);
  if (!bus)
    return NULL;

  g_variant_builder_init (&options, G_VARIANT_TYPE_VARDICT);
  g_variant_builder_add (&options, "{sv}", "writable",
                         g_variant_new_boolean (all_writable (paths)));
  g_variant_builder_add (&options, "{sv}", "autostop",
                         g_variant_new_boolean (TRUE));
  reply = g_dbus_connection_call_sync (bus, DOCUMENTS, DOCUMENTS_PATH,
                                       FILE_TRANSFER, "StartTransfer",
                                       g_variant_new ("(a{sv})", &options),
                                       G_VARIANT_TYPE ("(s)"),
                                       G_DBUS_CALL_FLAGS_NONE, -1,
                                       cancellable, error);
  if (!reply)
    return NULL;

  g_variant_get (reply, "(s)", &key);
  if (!add_files (bus, key, paths, error))
    {
      stop_transfer (bus, key);
      g_free (key);
      return NULL;
    }

  return key;
}

static void
register_files (GTask        *task,
                gpointer      source_object,
                gpointer      task_data,
                GCancellable *cancellable)
{
  StClipboardFiles *files = ST_CLIPBOARD_FILES (source_object);
  GError *error = NULL;
  char *key;

  key = start_transfer (files->paths, cancellable, &error);
  if (!key)
    {
      g_task_return_error (task, error);
      return;
    }

  g_task_return_pointer (task,
                         g_memory_input_stream_new_from_data (key, strlen (key), g_free),
                         g_object_unref);
}

static void
st_clipboard_files_read_async (MetaSelectionSource *source,
                               const char          *mimetype,
                               GCancellable        *cancellable,
                               GAsyncReadyCallback  callback,
                               gpointer             user_data)
{
  StClipboardFiles *files = ST_CLIPBOARD_FILES (source);
  g_autoptr (GTask) task = NULL;

  task = g_task_new (source, cancellable, callback, user_data);
  g_task_set_source_tag (task, st_clipboard_files_read_async);

  if (is_transfer (mimetype))
    g_task_run_in_thread (task, register_files);
  else if (g_strcmp0 (mimetype, URI_LIST) == 0)
    g_task_return_pointer (task,
                           g_memory_input_stream_new_from_bytes (files->uri_list),
                           g_object_unref);
  else
    g_task_return_new_error (task, G_IO_ERROR, G_IO_ERROR_NOT_SUPPORTED,
                             "Files can't be read as %s", mimetype);
}

static GInputStream *
st_clipboard_files_read_finish (MetaSelectionSource  *source,
                                GAsyncResult         *result,
                                GError              **error)
{
  return g_task_propagate_pointer (G_TASK (result), error);
}

static GList *
st_clipboard_files_get_mimetypes (MetaSelectionSource *source)
{
  GList *mimetypes = g_list_append (NULL, g_strdup (URI_LIST));

  for (int i = 0; transfer_types[i]; i++)
    mimetypes = g_list_append (mimetypes, g_strdup (transfer_types[i]));

  return mimetypes;
}

static void
st_clipboard_files_finalize (GObject *object)
{
  StClipboardFiles *files = ST_CLIPBOARD_FILES (object);

  g_strfreev (files->paths);
  g_bytes_unref (files->uri_list);

  G_OBJECT_CLASS (st_clipboard_files_parent_class)->finalize (object);
}

static void
st_clipboard_files_class_init (StClipboardFilesClass *klass)
{
  GObjectClass *object_class = G_OBJECT_CLASS (klass);
  MetaSelectionSourceClass *source_class = META_SELECTION_SOURCE_CLASS (klass);

  object_class->finalize = st_clipboard_files_finalize;

  source_class->read_async = st_clipboard_files_read_async;
  source_class->read_finish = st_clipboard_files_read_finish;
  source_class->get_mimetypes = st_clipboard_files_get_mimetypes;
}

static void
st_clipboard_files_init (StClipboardFiles *files)
{
}

MetaSelectionSource *
st_clipboard_files_new (const char * const *paths)
{
  StClipboardFiles *files = g_object_new (ST_TYPE_CLIPBOARD_FILES, NULL);
  GString *uri_list = g_string_new (NULL);

  files->paths = g_strdupv ((GStrv) paths);
  for (int i = 0; paths[i]; i++)
    {
      g_autofree char *uri = g_filename_to_uri (paths[i], NULL, NULL);

      if (uri)
        g_string_append_printf (uri_list, "%s\r\n", uri);
    }
  files->uri_list = g_string_free_to_bytes (uri_list);

  return META_SELECTION_SOURCE (files);
}
