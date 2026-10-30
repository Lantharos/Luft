#include <X11/Xatom.h>
#include <X11/Xlib.h>
#include <string.h>

static int hidden(Display *display, Window window, Atom state, Atom hidden_atom)
{
	Atom type;
	int format;
	unsigned long count, after;
	unsigned char *data = NULL;
	int found = 0;
	if (XGetWindowProperty(display, window, state, 0, 64, False, XA_ATOM, &type, &format, &count, &after, &data) == Success && data) {
		for (unsigned long i = 0; i < count; i++)
			found |= ((Atom *) data)[i] == hidden_atom;
		XFree(data);
	}
	return found;
}

int main(void)
{
	Display *display = XOpenDisplay(NULL);
	if (!display)
		return 1;
	Window window = XCreateSimpleWindow(display, DefaultRootWindow(display), 0, 0, 400, 300, 0, 0, 0x00ff00);
	Atom name = XInternAtom(display, "_NET_WM_NAME", False);
	Atom utf8 = XInternAtom(display, "UTF8_STRING", False);
	Atom state = XInternAtom(display, "_NET_WM_STATE", False);
	Atom hidden_atom = XInternAtom(display, "_NET_WM_STATE_HIDDEN", False);
	XSelectInput(display, window, PropertyChangeMask | ExposureMask);
	XMapWindow(display, window);
	for (;;) {
		XEvent event;
		XNextEvent(display, &event);
		if (event.type == PropertyNotify && event.xproperty.atom != state)
			continue;
		int now = hidden(display, window, state, hidden_atom);
		const char *title = now ? "Clears when hidden: hidden" : "Clears when hidden: shown";
		XSetWindowBackground(display, window, now ? 0xff0000 : 0x00ff00);
		XClearWindow(display, window);
		XChangeProperty(display, window, name, utf8, 8, PropModeReplace, (const unsigned char *) title, (int) strlen(title));
		XFlush(display);
	}
}
