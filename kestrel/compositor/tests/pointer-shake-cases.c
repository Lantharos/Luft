/* SPDX-License-Identifier: GPL-2.0-or-later */
#include <glib.h>
#include <math.h>

#include "backends/meta-pointer-shake.h"

typedef struct _Point
{
  double x;
  double y;
} Point;

typedef Point (* Path) (double seconds);

typedef struct _Trace
{
  const char *name;
  Path path;
  double seconds;
  double rate;
  gboolean shakes;
} Trace;

static Point
along (const Point *corners,
       int          n_corners,
       double       speed,
       double       seconds)
{
  double travelled = speed * seconds;
  int i;

  for (i = 1; i < n_corners; i++)
    {
      Point from = corners[i - 1];
      Point to = corners[i];
      double length = hypot (to.x - from.x, to.y - from.y);

      if (travelled <= length)
        return (Point) {
          from.x + (to.x - from.x) * travelled / length,
          from.y + (to.y - from.y) * travelled / length,
        };
      travelled -= length;
    }

  return corners[n_corners - 1];
}

static Point
mouse_shake (double t)
{
  return (Point) { 110 * sin (2 * G_PI * 2.5 * t), 12 * sin (2 * G_PI * 5 * t) };
}

static Point
slow_mouse_shake (double t)
{
  return (Point) { 140 * sin (2 * G_PI * 1.8 * t), 0 };
}

static Point
touchpad_shake (double t)
{
  double swing = 50 * sin (2 * G_PI * 3.5 * t);

  return (Point) { swing, 0.4 * swing };
}

static Point
elliptic_shake (double t)
{
  return (Point) { 120 * cos (2 * G_PI * 2.5 * t), 35 * sin (2 * G_PI * 2.5 * t) };
}

static Point
straight_swipe (double t)
{
  return (Point) { 1600 * sin (G_PI / 2 * MIN (t / 0.3, 1.0)), 200 * MIN (t / 0.3, 1.0) };
}

static Point
fast_circles (double t)
{
  return (Point) { 120 * cos (2 * G_PI * 2.5 * t), 120 * sin (2 * G_PI * 2.5 * t) };
}

static Point
drawing_zigzag (double t)
{
  static const Point corners[] = {
    { 0, 0 }, { 120, 40 }, { 0, 80 }, { 120, 120 }, { 0, 160 },
    { 120, 200 }, { 0, 240 }, { 120, 280 }, { 0, 320 },
  };

  return along (corners, G_N_ELEMENTS (corners), 300, t);
}

static Point
overshoot (double t)
{
  static const Point corners[] = { { 0, 0 }, { 700, 60 }, { 610, 52 }, { 640, 55 } };

  return along (corners, G_N_ELEMENTS (corners), 2400, t);
}

static Point
tremor (double t)
{
  return (Point) { 300 * t + 5 * sin (2 * G_PI * 8 * t), 4 * sin (2 * G_PI * 9 * t) };
}

static Point
scanning_back_and_forth (double t)
{
  static const Point corners[] = { { 0, 0 }, { 900, 0 }, { 0, 30 }, { 900, 60 } };

  return along (corners, G_N_ELEMENTS (corners), 1500, t);
}

static const Trace traces[] = {
  { "mouse shake", mouse_shake, 1.2, 125, TRUE },
  { "slow wide mouse shake", slow_mouse_shake, 1.5, 1000, TRUE },
  { "touchpad shake", touchpad_shake, 1.2, 70, TRUE },
  { "elliptic shake", elliptic_shake, 1.2, 125, TRUE },
  { "fast straight swipe", straight_swipe, 0.5, 1000, FALSE },
  { "fast circles", fast_circles, 1.6, 125, FALSE },
  { "slow drawing zigzag", drawing_zigzag, 4.0, 125, FALSE },
  { "overshoot and correct", overshoot, 0.5, 1000, FALSE },
  { "tremor while moving", tremor, 2.0, 125, FALSE },
  { "scanning across the screen", scanning_back_and_forth, 2.0, 125, FALSE },
};

static int
count_shakes (const Trace *trace)
{
  MetaPointerShake shake;
  int64_t start_us = 10 * G_USEC_PER_SEC;
  int samples = (int) (trace->seconds * trace->rate);
  Point last = trace->path (0);
  int shakes = 0;
  int i;

  meta_pointer_shake_reset (&shake);
  for (i = 1; i <= samples; i++)
    {
      double t = i / trace->rate;
      Point point = trace->path (t);

      if (meta_pointer_shake_feed (&shake, start_us + (int64_t) (t * G_USEC_PER_SEC),
                                   point.x - last.x, point.y - last.y))
        shakes++;
      last = point;
    }

  return shakes;
}

int
main (void)
{
  size_t wrong = 0;
  size_t i;

  for (i = 0; i < G_N_ELEMENTS (traces); i++)
    {
      int shakes = count_shakes (&traces[i]);

      if ((shakes > 0) != traces[i].shakes)
        {
          g_printerr ("%s: shaken %d times, expected %s\n", traces[i].name, shakes,
                      traces[i].shakes ? "a shake" : "none");
          wrong++;
        }
    }

  g_print ("%zu of %zu traces judged as listed\n", G_N_ELEMENTS (traces) - wrong, G_N_ELEMENTS (traces));
  return wrong ? 1 : 0;
}
