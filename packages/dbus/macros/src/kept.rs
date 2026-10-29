use proc_macro2::{Span, TokenStream};
use quote::quote;
use syn::Ident;

pub enum Side {
    Exported,
    Proxy,
}

pub fn test(side: Side, interface: &str, stub: TokenStream, write: TokenStream) -> TokenStream {
    let (folder, prefix) = match side {
        Side::Exported => ("", "exported"),
        Side::Proxy => ("proxies/", "proxy"),
    };
    let module = Ident::new(
        &format!(
            "introspected_{prefix}_{}",
            interface.replace('.', "_").to_lowercase()
        ),
        Span::call_site(),
    );
    let file = format!("{folder}{interface}.xml");
    quote! {
        #[cfg(test)]
        #[allow(warnings, clippy::all, clippy::pedantic)]
        mod #module {
            use super::*;

            #stub

            #[test]
            fn introspection() {
                use ::std::fmt::Write as _;

                let mut xml = ::std::string::String::from("<node>\n");
                #write
                xml.push_str("</node>\n");

                let kept = ::std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                    .ancestors()
                    .find(|folder| folder.join("Cargo.lock").is_file())
                    .expect("the workspace folder")
                    .join(concat!("packages/dbus/introspection/", env!("CARGO_PKG_NAME"), "/", #file));
                if ::std::env::var_os("LUFT_DBUS_UPDATE").is_some() {
                    ::std::fs::create_dir_all(kept.parent().unwrap()).unwrap();
                    ::std::fs::write(&kept, &xml).unwrap();
                } else {
                    assert!(
                        ::std::fs::read_to_string(&kept).is_ok_and(|current| current == xml),
                        "{} is out of date; run `LUFT_DBUS_UPDATE=1 cargo test -p {} introspection` and commit it",
                        kept.display(),
                        env!("CARGO_PKG_NAME"),
                    );
                }
            }
        }
    }
}
