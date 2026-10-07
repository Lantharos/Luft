#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void show(Display *display, Window window, Atom name, Atom utf8, const char *typed, int x, int y)
{
	char title[1024];
	snprintf(title, sizeof title, "Kestrel clicks: %s@%d,%d", typed, x, y);
	XChangeProperty(display, window, name, utf8, 8, PropModeReplace, (unsigned char *) title, (int) strlen(title));
	XFlush(display);
}

int main(int argc, char **argv)
{
	Display *display = XOpenDisplay(NULL);
	if (!display || argc < 3)
		return 1;
	Window window = XCreateSimpleWindow(display, DefaultRootWindow(display), 0, 0, atoi(argv[1]), atoi(argv[2]), 0, 0, 0x3c5a78);
	Atom name = XInternAtom(display, "_NET_WM_NAME", False);
	Atom utf8 = XInternAtom(display, "UTF8_STRING", False);
	XSelectInput(display, window, KeyPressMask | ButtonPressMask);
	XMapWindow(display, window);
	char typed[512] = "";
	int x = -1, y = -1;
	show(display, window, name, utf8, typed, x, y);
	for (;;) {
		XEvent event;
		XNextEvent(display, &event);
		if (event.type == ButtonPress && event.xbutton.button == Button1) {
			x = event.xbutton.x;
			y = event.xbutton.y;
		} else if (event.type == KeyPress) {
			char text[64];
			int length = XLookupString(&event.xkey, text, sizeof text - 1, NULL, NULL);
			if (length <= 0 || strlen(typed) + (size_t) length >= sizeof typed)
				continue;
			text[length] = '\0';
			strcat(typed, text);
		} else {
			continue;
		}
		show(display, window, name, utf8, typed, x, y);
	}
}
