#pragma once

#include <json-glib/json-glib.h>

JsonObject *protocol_read (void);

void protocol_reply_success (void);

void protocol_reply_error (const char *error_type,
                           const char *description);

void protocol_reply_message (const char *message_type,
                             const char *message);
