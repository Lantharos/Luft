use std::collections::BTreeMap;

use proc_macro2::TokenStream;
use quote::quote;
use syn::visit_mut::VisitMut;
use syn::{
    Error, FnArg, GenericArgument, ItemTrait, Lifetime, LitStr, PathArguments, Result, ReturnType,
    Token, TraitItem, TraitItemFn, Type, parse_quote,
};
use zbus_utils::case;

use crate::attributes;
use crate::kept::{self, Side};

#[derive(Default)]
struct Member {
    name: Option<String>,
    property: bool,
    signal: bool,
    object: bool,
    objects: bool,
}

#[derive(Default)]
struct Property {
    ty: Option<Type>,
    read: bool,
    write: bool,
}

pub fn introspection(definition: &ItemTrait) -> Result<TokenStream> {
    let attribute = attributes::find(&definition.attrs, "proxy", "trait")?;
    let name = attributes::interface_name(attribute)?;

    let mut write = quote! {
        writeln!(xml, "  <interface name=\"{}\">", #name).unwrap();
    };
    let mut properties = BTreeMap::<String, Property>::new();
    for item in &definition.items {
        let TraitItem::Fn(function) = item else {
            continue;
        };
        if !function.sig.generics.params.is_empty() {
            return Err(Error::new_spanned(
                &function.sig.generics,
                "introspect can't describe a generic call",
            ));
        }
        let member = member(function)?;
        let inputs = inputs(function);
        if member.property {
            let setter = !inputs.is_empty();
            let rust = unraw(function);
            let rust = if setter {
                rust.strip_prefix("set_").unwrap_or(&rust).to_owned()
            } else {
                rust
            };
            let property = properties
                .entry(
                    member
                        .name
                        .unwrap_or_else(|| case::pascal_or_camel_case(&rust, true)),
                )
                .or_default();
            if setter {
                property.write = true;
                property.ty.get_or_insert_with(|| inputs[0].clone());
            } else {
                property.read = true;
                property.ty = returned(function).map(owned);
            }
            continue;
        }
        let dbus = member
            .name
            .clone()
            .unwrap_or_else(|| case::pascal_or_camel_case(&unraw(function), true));
        let arguments = inputs.iter().map(|ty| {
            if member.signal {
                quote!(writeln!(xml, "      <arg type=\"{}\"/>", <#ty as ::zbus::zvariant::Type>::SIGNATURE).unwrap();)
            } else {
                quote!(writeln!(xml, "      <arg type=\"{}\" direction=\"in\"/>", <#ty as ::zbus::zvariant::Type>::SIGNATURE).unwrap();)
            }
        });
        let results: Vec<TokenStream> = if member.signal {
            Vec::new()
        } else if member.object || member.objects {
            let signature = if member.objects { "ao" } else { "o" };
            vec![
                quote!(writeln!(xml, "      <arg type=\"{}\" direction=\"out\"/>", #signature).unwrap();),
            ]
        } else {
            output(function)
                .iter()
                .map(|ty| quote!(writeln!(xml, "      <arg type=\"{}\" direction=\"out\"/>", <#ty as ::zbus::zvariant::Type>::SIGNATURE).unwrap();))
                .collect()
        };
        let element = if member.signal { "signal" } else { "method" };
        write.extend(quote! {
            writeln!(xml, "    <{} name=\"{}\">", #element, #dbus).unwrap();
            #(#arguments)*
            #(#results)*
            writeln!(xml, "    </{}>", #element).unwrap();
        });
    }
    for (dbus, property) in properties {
        let ty = property
            .ty
            .ok_or_else(|| Error::new_spanned(definition, format!("{dbus} has no type")))?;
        let access = match (property.read, property.write) {
            (true, true) => "readwrite",
            (true, false) => "read",
            _ => "write",
        };
        write.extend(quote! {
            writeln!(xml, "    <property name=\"{}\" type=\"{}\" access=\"{}\"/>", #dbus, <#ty as ::zbus::zvariant::Type>::SIGNATURE, #access).unwrap();
        });
    }
    write.extend(quote!(xml.push_str("  </interface>\n");));

    Ok(kept::test(Side::Proxy, &name, TokenStream::new(), write))
}

fn member(function: &TraitItemFn) -> Result<Member> {
    let mut member = Member::default();
    for attribute in function
        .attrs
        .iter()
        .filter(|attribute| attribute.path().is_ident("zbus"))
    {
        attribute.parse_nested_meta(|meta| {
            let key = meta
                .path
                .get_ident()
                .map(ToString::to_string)
                .unwrap_or_default();
            match key.as_str() {
                "name" => member.name = Some(meta.value()?.parse::<LitStr>()?.value()),
                "property" => member.property = true,
                "signal" => member.signal = true,
                "object" | "async_object" | "proxy_type_name" => member.object = true,
                "object_vec" => member.objects = true,
                _ => {}
            }
            if meta.input.peek(Token![=]) {
                meta.value()?.parse::<syn::Expr>()?;
            } else if meta.input.peek(syn::token::Paren) {
                meta.parse_nested_meta(|nested| {
                    if nested.input.peek(Token![=]) {
                        nested.value()?.parse::<syn::Expr>()?;
                    }
                    Ok(())
                })?;
            }
            Ok(())
        })?;
    }
    Ok(member)
}

fn unraw(function: &TraitItemFn) -> String {
    let name = function.sig.ident.to_string();
    name.strip_prefix("r#")
        .map_or(name.clone(), ToOwned::to_owned)
}

fn inputs(function: &TraitItemFn) -> Vec<Type> {
    function
        .sig
        .inputs
        .iter()
        .filter_map(|argument| match argument {
            FnArg::Typed(typed) => Some(owned(&typed.ty)),
            FnArg::Receiver(_) => None,
        })
        .collect()
}

fn returned(function: &TraitItemFn) -> Option<&Type> {
    let ReturnType::Type(_, ty) = &function.sig.output else {
        return None;
    };
    Some(result_value(ty).unwrap_or(ty))
}

fn output(function: &TraitItemFn) -> Vec<Type> {
    match returned(function) {
        None => Vec::new(),
        Some(Type::Tuple(tuple)) => tuple.elems.iter().map(owned).collect(),
        Some(ty) => vec![owned(ty)],
    }
}

fn result_value(ty: &Type) -> Option<&Type> {
    let Type::Path(path) = ty else { return None };
    let last = path.path.segments.last()?;
    if last.ident != "Result" {
        return None;
    }
    let PathArguments::AngleBracketed(arguments) = &last.arguments else {
        return None;
    };
    arguments.args.iter().find_map(|argument| match argument {
        GenericArgument::Type(ty) => Some(ty),
        _ => None,
    })
}

fn owned(ty: &Type) -> Type {
    struct Static;
    impl VisitMut for Static {
        fn visit_lifetime_mut(&mut self, lifetime: &mut Lifetime) {
            *lifetime = parse_quote!('static);
        }
    }
    let mut ty = ty.clone();
    Static.visit_type_mut(&mut ty);
    ty
}
