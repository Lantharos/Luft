#include <stdarg.h>
#include <stdio.h>

void kestrel_openconnect_report(void *session, int level, const char *text);

void kestrel_openconnect_progress(void *session, int level, const char *format, ...)
{
  char text[1024];
  va_list arguments;

  va_start(arguments, format);
  vsnprintf(text, sizeof text, format, arguments);
  va_end(arguments);
  kestrel_openconnect_report(session, level, text);
}
