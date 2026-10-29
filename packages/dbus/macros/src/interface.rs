use proc_macro2::TokenStream;
use quote::quote;
use syn::{Attribute, Error, ImplItem, ItemImpl, Meta, Result, parse_quote};

use crate::attributes::{self, Arguments};
use crate::kept::{self, Side};

pub fn introspection(implementation: &ItemImpl) -> Result<TokenStream> {
    if !implementation.generics.params.is_empty() {
        return Err(Error::new_spanned(
            &implementation.generics,
            "introspect can't stub a generic interface",
        ));
    }
    let attribute = attributes::find(&implementation.attrs, "interface", "impl")?;
    let name = attributes::interface_name(attribute)?;

    let mut stub = implementation.clone();
    stub.self_ty = parse_quote!(Introspected);
    stub.attrs = vec![without_docs(attribute)?];
    for item in &mut stub.items {
        if let ImplItem::Fn(function) = item {
            function
                .attrs
                .retain(|attribute| !attributes::is_doc(attribute));
            function.block = parse_quote!({ unimplemented!() });
        }
    }

    Ok(kept::test(
        Side::Exported,
        &name,
        quote! {
            struct Introspected;

            #stub
        },
        quote! {
            <Introspected as ::zbus::object_server::Interface>::introspect_to_writer(&Introspected, &mut xml, 2);
        },
    ))
}

fn without_docs(attribute: &Attribute) -> Result<Attribute> {
    let mut arguments: Arguments = attributes::arguments(attribute)?
        .into_iter()
        .filter(|meta| {
            !meta.path().is_ident("introspection_docs") && !meta.path().is_ident("proxy")
        })
        .collect();
    arguments.push(parse_quote!(introspection_docs = false));
    let path = attribute.path();
    let meta: Meta = parse_quote!(#path(#arguments));
    Ok(parse_quote!(#[#meta]))
}
