#![allow(clippy::all, non_upper_case_globals, non_camel_case_types)]

pub mod window {
    use wayland_client;
    use wayland_protocols::xdg::shell::client::*;

    pub mod __interfaces {
        use wayland_protocols::xdg::shell::client::__interfaces::*;
        wayland_scanner::generate_interfaces!("protocols/kestrel-window-v1.xml");
    }
    use self::__interfaces::*;

    wayland_scanner::generate_client_code!("protocols/kestrel-window-v1.xml");
}

pub mod glass {
    use wayland_client;
    use wayland_client::protocol::*;

    pub mod __interfaces {
        use wayland_client::protocol::__interfaces::*;
        wayland_scanner::generate_interfaces!("protocols/kestrel-glass-v1.xml");
    }
    use self::__interfaces::*;

    wayland_scanner::generate_client_code!("protocols/kestrel-glass-v1.xml");
}
