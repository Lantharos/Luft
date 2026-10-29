use syn::punctuated::Punctuated;
use syn::{Attribute, Error, Expr, ExprLit, Lit, Meta, Result, Token};

pub type Arguments = Punctuated<Meta, Token![,]>;

pub fn find<'a>(attributes: &'a [Attribute], name: &str, item: &str) -> Result<&'a Attribute> {
    attributes
        .iter()
        .find(|attribute| {
            attribute
                .path()
                .segments
                .last()
                .is_some_and(|segment| segment.ident == name)
        })
        .ok_or_else(|| {
            Error::new(
                proc_macro2::Span::call_site(),
                format!("introspect goes above the zbus #[{name}] attribute of this {item}"),
            )
        })
}

pub fn arguments(attribute: &Attribute) -> Result<Arguments> {
    match &attribute.meta {
        Meta::Path(_) => Ok(Arguments::new()),
        _ => attribute.parse_args_with(Arguments::parse_terminated),
    }
}

pub fn string(meta: &Meta) -> Option<String> {
    let Meta::NameValue(pair) = meta else {
        return None;
    };
    let Expr::Lit(ExprLit {
        lit: Lit::Str(value),
        ..
    }) = &pair.value
    else {
        return None;
    };
    Some(value.value())
}

pub fn interface_name(attribute: &Attribute) -> Result<String> {
    arguments(attribute)?
        .iter()
        .filter(|meta| meta.path().is_ident("name") || meta.path().is_ident("interface"))
        .find_map(string)
        .ok_or_else(|| Error::new_spanned(attribute, "introspect needs the interface's name"))
}

pub fn is_doc(attribute: &Attribute) -> bool {
    attribute.path().is_ident("doc")
}
