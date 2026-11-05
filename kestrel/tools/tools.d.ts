declare const KESTREL_TOOLS: {
  root: string;
  built: string;
};

declare module 'gi://Adw?version=1' {
  import type Gio from 'gi://Gio';
  import type Gtk from 'gi://Gtk?version=4.0';

  namespace Adw {
    class Application extends Gtk.Application {
      constructor(properties: {application_id: string; flags: Gio.ApplicationFlags});
    }
    class ApplicationWindow extends Gtk.ApplicationWindow {
      constructor(properties: {application: Application; title: string; default_width: number; default_height: number; content: Gtk.Widget});
    }
    class ToolbarView extends Gtk.Widget {
      constructor(properties: {content: Gtk.Widget});
      add_top_bar(bar: Gtk.Widget): void;
    }
    class HeaderBar extends Gtk.Widget {}
  }
  export default Adw;
}
