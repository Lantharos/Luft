#include "protocol.h"

#include <stdint.h>
#include <string.h>
#include <unistd.h>

#define MAXIMUM_MESSAGE_SIZE 65536

static gboolean
read_exactly (void   *buffer,
              size_t  size)
{
  size_t done = 0;

  while (done < size)
    {
      ssize_t count = read (STDIN_FILENO, (char *) buffer + done, size - done);

      if (count <= 0)
        return FALSE;
      done += count;
    }

  return TRUE;
}

static void
write_exactly (const void *buffer,
               size_t      size)
{
  size_t done = 0;

  while (done < size)
    {
      ssize_t count = write (STDOUT_FILENO, (const char *) buffer + done, size - done);

      if (count <= 0)
        _exit (1);
      done += count;
    }
}

JsonObject *
protocol_read (void)
{
  g_autoptr (JsonParser) parser = json_parser_new_immutable ();
  uint32_t size;
  char *payload;
  gboolean parsed;
  JsonNode *root;

  if (!read_exactly (&size, sizeof size) || size == 0 || size > MAXIMUM_MESSAGE_SIZE)
    return NULL;

  payload = g_malloc (size);
  if (!read_exactly (payload, size))
    {
      explicit_bzero (payload, size);
      g_free (payload);
      return NULL;
    }

  parsed = json_parser_load_from_data (parser, payload, size, NULL);
  explicit_bzero (payload, size);
  g_free (payload);

  root = parsed ? json_parser_get_root (parser) : NULL;
  if (!root || !JSON_NODE_HOLDS_OBJECT (root))
    return NULL;

  return json_object_ref (json_node_get_object (root));
}

static void
reply (JsonBuilder *builder)
{
  g_autoptr (JsonNode) root = json_builder_get_root (builder);
  g_autofree char *payload = json_to_string (root, FALSE);
  uint32_t size = strlen (payload);

  write_exactly (&size, sizeof size);
  write_exactly (payload, size);
}

void
protocol_reply_success (void)
{
  g_autoptr (JsonBuilder) builder = json_builder_new ();

  json_builder_begin_object (builder);
  json_builder_set_member_name (builder, "type");
  json_builder_add_string_value (builder, "success");
  json_builder_end_object (builder);
  reply (builder);
}

void
protocol_reply_error (const char *error_type,
                      const char *description)
{
  g_autoptr (JsonBuilder) builder = json_builder_new ();

  json_builder_begin_object (builder);
  json_builder_set_member_name (builder, "type");
  json_builder_add_string_value (builder, "error");
  json_builder_set_member_name (builder, "error_type");
  json_builder_add_string_value (builder, error_type);
  json_builder_set_member_name (builder, "description");
  json_builder_add_string_value (builder, description);
  json_builder_end_object (builder);
  reply (builder);
}

void
protocol_reply_message (const char *message_type,
                        const char *message)
{
  g_autoptr (JsonBuilder) builder = json_builder_new ();

  json_builder_begin_object (builder);
  json_builder_set_member_name (builder, "type");
  json_builder_add_string_value (builder, "auth_message");
  json_builder_set_member_name (builder, "auth_message_type");
  json_builder_add_string_value (builder, message_type);
  json_builder_set_member_name (builder, "auth_message");
  json_builder_add_string_value (builder, message);
  json_builder_end_object (builder);
  reply (builder);
}
