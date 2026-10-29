mod attributes;
mod interface;
mod kept;
mod proxy;

use proc_macro::TokenStream;
use quote::ToTokens;
use syn::{Error, Item, parse_macro_input};

/// Keeps `packages/dbus/introspection` in step with a zbus `#[interface]` impl or `#[proxy]`
/// trait. Put it above the zbus attribute; `cargo test` then fails when the kept XML no longer
/// matches the code, and `LUFT_DBUS_UPDATE=1 cargo test` rewrites it.
#[proc_macro_attribute]
pub fn introspect(args: TokenStream, item: TokenStream) -> TokenStream {
    if !args.is_empty() {
        return Error::new(
            proc_macro2::Span::call_site(),
            "introspect takes no arguments",
        )
        .into_compile_error()
        .into();
    }
    let item = parse_macro_input!(item as Item);
    let introspection = match &item {
        Item::Impl(implementation) => interface::introspection(implementation),
        Item::Trait(definition) => proxy::introspection(definition),
        _ => Err(Error::new_spanned(
            &item,
            "introspect goes on a zbus #[interface] impl or #[proxy] trait",
        )),
    };
    let mut output = item.into_token_stream();
    match introspection {
        Ok(introspection) => output.extend(introspection),
        Err(error) => output.extend(error.into_compile_error()),
    }
    output.into()
}
