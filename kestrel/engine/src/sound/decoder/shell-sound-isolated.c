/* -*- mode: C; c-file-style: "gnu"; indent-tabs-mode: nil; -*- */
#include "config.h"

#include <errno.h>
#include <fcntl.h>
#include <gio/gunixinputstream.h>
#include <glib/gstdio.h>
#include <sys/stat.h>
#include <unistd.h>

#include "../../shell-development-private.h"
#include "../shell-sound-private.h"

#define DECODER "kestrel-sound-decoder"
#define REGISTRY "registry." KESTREL_HOST_CPU ".bin"
#define SANDBOXED_DECODER "/decoder"
#define SANDBOXED_REGISTRY "/registry"
#define DEADLINE (5 * G_TIME_SPAN_SECOND)
#define FRAME_SIZE (SHELL_SOUND_CHANNELS * sizeof (gint16))
#define CUT_FADE_FRAMES (SHELL_SOUND_RATE / 20)

typedef struct
{
  char *name;
  GFile *file;
  int fd;
  gboolean cut_longer;
} Request;

static void
request_free (Request *request)
{
  g_free (request->name);
  g_clear_object (&request->file);
  g_clear_fd (&request->fd, NULL);
  g_free (request);
}

static gboolean
open_file (Request  *request,
           GError  **error)
{
  g_autofree char *path = g_file_get_path (request->file);
  struct stat info;

  request->fd = open (path, O_RDONLY | O_NONBLOCK | O_CLOEXEC);
  if (request->fd >= 0 && fstat (request->fd, &info) == 0 && S_ISREG (info.st_mode))
    return TRUE;

  g_set_error (error, G_IO_ERROR, G_IO_ERROR_NOT_REGULAR_FILE, "%s isn't a file that can be read", request->name);
  return FALSE;
}

static GSubprocess *
spawn_decoder (Request  *request,
               GError  **error)
{
  const char *build = shell_development_path ("KESTREL_BUILDDIR");
  g_autofree char *decoder = build
    ? g_build_filename (build, "sound", "decoder", DECODER, NULL)
    : g_build_filename (KESTREL_LIBEXECDIR, DECODER, NULL);
  g_autofree char *registry = g_build_filename (g_get_user_cache_dir (), "gstreamer-1.0", REGISTRY, NULL);
  g_autoptr (GStrvBuilder) argv = g_strv_builder_new ();
  g_auto (GStrv) arguments = NULL;
  g_autoptr (GSubprocessLauncher) launcher =
    g_subprocess_launcher_new (G_SUBPROCESS_FLAGS_STDOUT_PIPE | G_SUBPROCESS_FLAGS_STDERR_SILENCE);

  g_strv_builder_add_many (argv, "bwrap", "--unshare-all", "--die-with-parent", "--new-session", "--clearenv",
                           "--ro-bind", "/usr", "/usr", "--symlink", "usr/lib", "/lib", "--symlink", "usr/lib64", "/lib64",
                           "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp",
                           "--ro-bind", decoder, SANDBOXED_DECODER,
                           "--setenv", "GST_REGISTRY_UPDATE", "no", "--setenv", "GST_REGISTRY_FORK", "no", NULL);
  if (g_file_test (registry, G_FILE_TEST_IS_REGULAR))
    g_strv_builder_add_many (argv, "--ro-bind", registry, SANDBOXED_REGISTRY,
                             "--setenv", "GST_REGISTRY", SANDBOXED_REGISTRY, NULL);
  g_strv_builder_add_many (argv, "--", SANDBOXED_DECODER, NULL);
  arguments = g_strv_builder_end (argv);

  g_subprocess_launcher_take_stdin_fd (launcher, g_steal_fd (&request->fd));
  return g_subprocess_launcher_spawnv (launcher, (const char * const *) arguments, error);
}

static void
cut_to (GByteArray *samples,
        gsize       frames)
{
  gint16 *end;

  g_byte_array_set_size (samples, frames * FRAME_SIZE);
  end = (gint16 *) (samples->data + (frames - CUT_FADE_FRAMES) * FRAME_SIZE);
  for (gsize frame = 0; frame < CUT_FADE_FRAMES; frame++)
    for (guint channel = 0; channel < SHELL_SOUND_CHANNELS; channel++)
      end[frame * SHELL_SOUND_CHANNELS + channel] =
        end[frame * SHELL_SOUND_CHANNELS + channel] * (gint64) (CUT_FADE_FRAMES - frame) / CUT_FADE_FRAMES;
}

static gboolean
wait_for_samples (int            fd,
                  gint64         deadline,
                  GCancellable  *cancellable,
                  GError       **error)
{
  GPollFD fds[2] = { { .fd = fd, .events = G_IO_IN } };
  guint n_fds = g_cancellable_make_pollfd (cancellable, &fds[1]) ? 2 : 1;
  gint64 left = deadline - g_get_monotonic_time ();
  int ready = left > 0 ? g_poll (fds, n_fds, (left + 999) / 1000) : 0;

  if (n_fds == 2)
    g_cancellable_release_fd (cancellable);
  if (g_cancellable_set_error_if_cancelled (cancellable, error))
    return FALSE;
  if (ready > 0 || (ready < 0 && errno == EINTR))
    return TRUE;

  g_set_error_literal (error, G_IO_ERROR, G_IO_ERROR_TIMED_OUT, "Decoding took too long");
  return FALSE;
}

static GBytes *
read_samples (Request       *request,
              GSubprocess   *decoder,
              GCancellable  *cancellable,
              GError       **error)
{
  int fd = g_unix_input_stream_get_fd (G_UNIX_INPUT_STREAM (g_subprocess_get_stdout_pipe (decoder)));
  gint64 deadline = g_get_monotonic_time () + DEADLINE;
  g_autoptr (GByteArray) samples = g_byte_array_new ();
  guint8 buffer[64 * 1024];
  ssize_t length;

  while (TRUE)
    {
      if (!wait_for_samples (fd, deadline, cancellable, error))
        return NULL;

      length = read (fd, buffer, sizeof (buffer));
      if (length < 0 && (errno == EINTR || errno == EAGAIN))
        continue;
      if (length <= 0)
        break;

      g_byte_array_append (samples, buffer, length);
      if (samples->len / FRAME_SIZE <= SHELL_SOUND_LONGEST_CUSTOM_FRAMES)
        continue;

      if (!request->cut_longer)
        {
          g_set_error (error, G_IO_ERROR, G_IO_ERROR_MESSAGE_TOO_LARGE, "%s is too long", request->name);
          return NULL;
        }

      cut_to (samples, SHELL_SOUND_LONGEST_CUSTOM_FRAMES);
      return g_byte_array_free_to_bytes (g_steal_pointer (&samples));
    }

  if (samples->len < FRAME_SIZE)
    {
      g_set_error (error, G_IO_ERROR, G_IO_ERROR_INVALID_DATA, "Can't decode %s", request->name);
      return NULL;
    }

  g_byte_array_set_size (samples, samples->len - samples->len % FRAME_SIZE);
  return g_byte_array_free_to_bytes (g_steal_pointer (&samples));
}

static void
decode_in_thread (GTask        *task,
                  gpointer      source_object,
                  gpointer      task_data,
                  GCancellable *cancellable)
{
  Request *request = task_data;
  g_autoptr (GSubprocess) decoder = NULL;
  g_autoptr (GBytes) samples = NULL;
  g_autofree char *path = NULL;
  GError *error = NULL;

  if ((!request->file || open_file (request, &error)) &&
      (decoder = spawn_decoder (request, &error)))
    {
      samples = read_samples (request, decoder, cancellable, &error);
      g_subprocess_force_exit (decoder);
    }

  if (!samples)
    {
      g_task_return_error (task, error);
      return;
    }

  path = request->file ? g_file_get_path (request->file) : NULL;
  g_task_return_pointer (task, _shell_sound_clip_new (request->name, path, samples),
                         (GDestroyNotify) _shell_sound_clip_unref);
}

static void
run (Request             *request,
     GCancellable        *cancellable,
     GAsyncReadyCallback  callback,
     gpointer             user_data)
{
  g_autoptr (GTask) task = g_task_new (NULL, cancellable, callback, user_data);

  g_task_set_task_data (task, request, (GDestroyNotify) request_free);
  g_task_run_in_thread (task, decode_in_thread);
}

void
_shell_sound_decode_isolated (const char          *name,
                              GFile               *file,
                              gboolean             cut_longer,
                              GCancellable        *cancellable,
                              GAsyncReadyCallback  callback,
                              gpointer             user_data)
{
  Request *request = g_new0 (Request, 1);

  request->name = g_strdup (name);
  request->file = g_object_ref (file);
  request->fd = -1;
  request->cut_longer = cut_longer;
  run (request, cancellable, callback, user_data);
}

void
_shell_sound_decode_isolated_fd (const char          *name,
                                 int                  fd,
                                 GCancellable        *cancellable,
                                 GAsyncReadyCallback  callback,
                                 gpointer             user_data)
{
  Request *request = g_new0 (Request, 1);

  request->name = g_strdup (name);
  request->fd = fd;
  request->cut_longer = TRUE;
  run (request, cancellable, callback, user_data);
}
