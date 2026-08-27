use smithay::{
    backend::renderer::{
        Color32F, ImportAll, ImportMem, Renderer,
        damage::{Error as OutputDamageTrackerError, OutputDamageTracker, RenderOutputResult},
        element::{
            AsRenderElements, Element, Id, RenderElement, Wrap,
            memory::MemoryRenderBufferRenderElement,
            surface::WaylandSurfaceRenderElement,
            utils::{
                ConstrainAlign, ConstrainScaleBehavior, CropRenderElement, RelocateRenderElement,
                RescaleRenderElement,
            },
        },
    },
    desktop::{
        layer_map_for_output,
        space::{
            ConstrainBehavior, ConstrainReference, Space, SpaceRenderElements, SurfaceTree,
            constrain_space_element,
        },
    },
    output::Output,
    reexports::wayland_server::protocol::wl_surface::WlSurface,
    utils::{Point, Rectangle, Scale, Size},
};

#[cfg(feature = "debug")]
use crate::drawing::FpsElement;
use crate::{
    blur::BlurRenderer,
    drawing::{CLEAR_COLOR, CLEAR_COLOR_FULLSCREEN, PointerRenderElement},
    shell::{FullscreenSurface, WindowElement, WindowRenderElement},
};

smithay::backend::renderer::element::render_elements! {
    pub CustomRenderElements<R> where
        R: ImportAll + ImportMem + BlurRenderer;
    Pointer=PointerRenderElement<R>,
    Surface=WaylandSurfaceRenderElement<R>,
    Blur=crate::blur::BlurRenderElement<R>,
    Wallpaper=MemoryRenderBufferRenderElement<R>,
    #[cfg(feature = "debug")]
    // Note: We would like to borrow this element instead, but that would introduce
    // a feature-dependent lifetime, which introduces a lot more feature bounds
    // as the whole type changes and we can't have an unused lifetime (for when "debug" is disabled)
    // in the declaration.
    Fps=FpsElement<R::TextureId>,
}

impl<R: Renderer> std::fmt::Debug for CustomRenderElements<R> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pointer(arg0) => f.debug_tuple("Pointer").field(arg0).finish(),
            Self::Surface(arg0) => f.debug_tuple("Surface").field(arg0).finish(),
            Self::Blur(arg0) => f.debug_tuple("Blur").field(arg0).finish(),
            Self::Wallpaper(arg0) => f.debug_tuple("Wallpaper").field(arg0).finish(),
            #[cfg(feature = "debug")]
            Self::Fps(arg0) => f.debug_tuple("Fps").field(arg0).finish(),
            Self::_GenericCatcher(arg0) => f.debug_tuple("_GenericCatcher").field(arg0).finish(),
        }
    }
}

smithay::backend::renderer::element::render_elements! {
    pub OutputRenderElements<R, E> where R: ImportAll + ImportMem + BlurRenderer;
    Space=SpaceRenderElements<R, E>,
    Window=Wrap<E>,
    Custom=CustomRenderElements<R>,
    Preview=CropRenderElement<RelocateRenderElement<RescaleRenderElement<WindowRenderElement<R>>>>,
}

impl<R: Renderer + ImportAll + ImportMem + BlurRenderer, E: RenderElement<R> + std::fmt::Debug>
    std::fmt::Debug for OutputRenderElements<R, E>
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Space(arg0) => f.debug_tuple("Space").field(arg0).finish(),
            Self::Window(arg0) => f.debug_tuple("Window").field(arg0).finish(),
            Self::Custom(arg0) => f.debug_tuple("Custom").field(arg0).finish(),
            Self::Preview(arg0) => f.debug_tuple("Preview").field(arg0).finish(),
            Self::_GenericCatcher(arg0) => f.debug_tuple("_GenericCatcher").field(arg0).finish(),
        }
    }
}

pub fn space_preview_elements<'a, R, C>(
    renderer: &'a mut R,
    space: &'a Space<WindowElement>,
    output: &'a Output,
) -> impl Iterator<Item = C> + 'a
where
    R: Renderer + ImportAll + ImportMem,
    R: crate::blur::BlurRenderer,
    R::TextureId: Send + Clone + 'static,
    C: From<CropRenderElement<RelocateRenderElement<RescaleRenderElement<WindowRenderElement<R>>>>>
        + 'a,
{
    let constrain_behavior = ConstrainBehavior {
        reference: ConstrainReference::BoundingBox,
        behavior: ConstrainScaleBehavior::Fit,
        align: ConstrainAlign::CENTER,
    };

    let preview_padding = 10;

    let elements_on_space = space.elements_for_output(output).count();
    let output_scale = output.current_scale().fractional_scale();
    let output_transform = output.current_transform();
    let output_size = output
        .current_mode()
        .map(|mode| {
            output_transform
                .transform_size(mode.size)
                .to_f64()
                .to_logical(output_scale)
        })
        .unwrap_or_default();

    let max_elements_per_row = 4;
    let elements_per_row = usize::min(elements_on_space, max_elements_per_row);
    let rows = f64::ceil(elements_on_space as f64 / elements_per_row as f64);

    let preview_size = Size::from((
        f64::round(output_size.w / elements_per_row as f64) as i32 - preview_padding * 2,
        f64::round(output_size.h / rows) as i32 - preview_padding * 2,
    ));

    space
        .elements_for_output(output)
        .enumerate()
        .flat_map(move |(element_index, window)| {
            let column = element_index % elements_per_row;
            let row = element_index / elements_per_row;
            let preview_location = Point::from((
                preview_padding + (preview_padding + preview_size.w) * column as i32,
                preview_padding + (preview_padding + preview_size.h) * row as i32,
            ));
            let constrain = Rectangle::new(preview_location, preview_size);
            constrain_space_element(
                renderer,
                window,
                preview_location,
                1.0,
                output_scale,
                constrain,
                constrain_behavior,
            )
        })
}

#[profiling::function]
pub fn output_elements<R>(
    output: &Output,
    space: &Space<WindowElement>,
    custom_elements: impl IntoIterator<Item = CustomRenderElements<R>>,
    renderer: &mut R,
    show_window_preview: bool,
    lock_surface: Option<&WlSurface>,
    wallpaper: &crate::wallpaper::Wallpaper,
) -> (
    Vec<OutputRenderElements<R, WindowRenderElement<R>>>,
    Color32F,
)
where
    R: Renderer + ImportAll + ImportMem + crate::blur::BlurRenderer,
    R::TextureId: Send + Clone + 'static,
{
    if let Some(surface) = lock_surface {
        let scale = output.current_scale().fractional_scale().into();
        let elements = SurfaceTree::from_surface(surface)
            .render_elements::<CustomRenderElements<R>>(renderer, (0, 0).into(), scale, 1.0)
            .into_iter()
            .map(OutputRenderElements::Custom)
            .collect();
        return (elements, Color32F::BLACK);
    }

    if let Some(window) = output
        .user_data()
        .get::<FullscreenSurface>()
        .and_then(|f| f.get())
    {
        let scale = output.current_scale().fractional_scale().into();
        let window_render_elements: Vec<WindowRenderElement<R>> =
            AsRenderElements::<R>::render_elements(&window, renderer, (0, 0).into(), scale, 1.0);
        let blur = window.wl_surface().and_then(|surface| {
            crate::blur::BlurElement::from_surface(
                &surface,
                (0, 0).into(),
                Scale::from(output.current_scale().fractional_scale()),
            )
            .map(|blur| (crate::blur::BlurElement::surface_id(&surface), blur))
        });

        let mut elements = custom_elements
            .into_iter()
            .map(OutputRenderElements::from)
            .collect::<Vec<_>>();
        for element in window_render_elements {
            let id = element.id().clone();
            elements.push(OutputRenderElements::Window(Wrap::from(element)));
            if let Some((surface_id, blur)) = &blur
                && surface_id == &id
            {
                elements.push(OutputRenderElements::Custom(CustomRenderElements::Blur(
                    blur.clone().into(),
                )));
            }
        }
        (elements, CLEAR_COLOR_FULLSCREEN)
    } else {
        let output_scale = output.current_scale().fractional_scale();
        let mut output_render_elements = custom_elements
            .into_iter()
            .map(OutputRenderElements::from)
            .collect::<Vec<_>>();

        if show_window_preview && space.elements_for_output(output).count() > 0 {
            output_render_elements.extend(space_preview_elements(renderer, space, output));
        }

        let space_elements = smithay::desktop::space::space_render_elements::<_, WindowElement, _>(
            renderer,
            [space],
            output,
            1.0,
        )
        .expect("output without mode?");
        let blur_elements = blur_elements(space, output, output_scale);
        for element in space_elements {
            let element_id = element.id().clone();
            output_render_elements.push(OutputRenderElements::Space(element));
            output_render_elements.extend(
                blur_elements
                    .iter()
                    .filter(|(surface_id, _)| surface_id == &element_id)
                    .map(|(_, blur)| {
                        OutputRenderElements::Custom(CustomRenderElements::Blur(
                            blur.clone().into(),
                        ))
                    }),
            );
        }

        if let Ok(element) = wallpaper.render_element(renderer, output) {
            output_render_elements.push(OutputRenderElements::Custom(
                CustomRenderElements::Wallpaper(element),
            ));
        }

        (output_render_elements, CLEAR_COLOR)
    }
}

#[allow(clippy::too_many_arguments)]
pub fn render_output<'a, 'd, R>(
    output: &'a Output,
    space: &'a Space<WindowElement>,
    custom_elements: impl IntoIterator<Item = CustomRenderElements<R>>,
    renderer: &'a mut R,
    framebuffer: &'a mut R::Framebuffer<'_>,
    damage_tracker: &'d mut OutputDamageTracker,
    age: usize,
    show_window_preview: bool,
    lock_surface: Option<&WlSurface>,
    wallpaper: &crate::wallpaper::Wallpaper,
) -> Result<RenderOutputResult<'d>, OutputDamageTrackerError<R::Error>>
where
    R: Renderer + ImportAll + ImportMem,
    R: crate::blur::BlurRenderer,
    R::TextureId: Send + Clone + 'static,
{
    let (elements, clear_color) = output_elements(
        output,
        space,
        custom_elements,
        renderer,
        show_window_preview,
        lock_surface,
        wallpaper,
    );
    damage_tracker.render_output(renderer, framebuffer, age, &elements, clear_color)
}

fn blur_elements(
    space: &Space<WindowElement>,
    output: &Output,
    output_scale: f64,
) -> Vec<(Id, crate::blur::BlurElement)> {
    let scale = Scale::from(output_scale);
    let mut elements = Vec::new();
    let layers = layer_map_for_output(output);
    for layer in layers.layers() {
        let Some(geometry) = layers.layer_geometry(layer) else {
            continue;
        };
        let surface = layer.wl_surface();
        let location = geometry.loc.to_physical_precise_round(output_scale);
        if let Some(blur) = crate::blur::BlurElement::from_surface(surface, location, scale) {
            elements.push((crate::blur::BlurElement::surface_id(surface), blur));
        }
    }
    drop(layers);

    let Some(output_geometry) = space.output_geometry(output) else {
        return elements;
    };
    for window in space.elements_for_output(output) {
        let Some(surface) = window.wl_surface() else {
            continue;
        };
        let Some(mut location) = space.element_location(window) else {
            continue;
        };
        location -= output_geometry.loc;
        if window.decoration_state().is_ssd {
            location.y += crate::shell::ssd::HEADER_BAR_HEIGHT;
        }
        let location = location.to_physical_precise_round(output_scale);
        if let Some(blur) = crate::blur::BlurElement::from_surface(&surface, location, scale) {
            elements.push((crate::blur::BlurElement::surface_id(&surface), blur));
        }
    }
    elements
}
