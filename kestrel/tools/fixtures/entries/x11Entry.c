#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <locale.h>
#include <stdio.h>
#include <string.h>

static void show(Display *display, Window window, Atom name, Atom utf8, const char *typed)
{
	char title[1024];
	snprintf(title, sizeof title, "Kestrel entry: %s", typed);
	XChangeProperty(display, window, name, utf8, 8, PropModeReplace, (unsigned char *) title, (int) strlen(title));
	XFlush(display);
}

int main(void)
{
	setlocale(LC_ALL, "");
	XSetLocaleModifiers("");
	Display *display = XOpenDisplay(NULL);
	if (!display)
		return 1;
	Window window = XCreateSimpleWindow(display, DefaultRootWindow(display), 0, 0, 480, 160, 0, 0, 0xffffff);
	Atom name = XInternAtom(display, "_NET_WM_NAME", False);
	Atom utf8 = XInternAtom(display, "UTF8_STRING", False);
	XIM method = XOpenIM(display, NULL, NULL, NULL);
	XIC context = method ? XCreateIC(method, XNInputStyle, XIMPreeditNothing | XIMStatusNothing, XNClientWindow, window, XNFocusWindow, window, NULL) : NULL;
	XSelectInput(display, window, KeyPressMask | KeyReleaseMask | FocusChangeMask);
	XMapWindow(display, window);
	char typed[512] = "";
	show(display, window, name, utf8, "");
	for (;;) {
		XEvent event;
		XNextEvent(display, &event);
		if (XFilterEvent(&event, None))
			continue;
		if (event.type == FocusIn && context)
			XSetICFocus(context);
		if (event.type != KeyPress)
			continue;
		char text[64];
		KeySym keysym;
		Status status;
		int length = context ? Xutf8LookupString(context, &event.xkey, text, sizeof text - 1, &keysym, &status)
		                     : XLookupString(&event.xkey, text, sizeof text - 1, &keysym, NULL);
		if (length <= 0 || strlen(typed) + (size_t) length >= sizeof typed)
			continue;
		text[length] = '\0';
		strcat(typed, text);
		show(display, window, name, utf8, typed);
	}
}
