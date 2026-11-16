struct Globals {
    size: vec2<f32>,
    padding: vec2<f32>,
}

@group(0) @binding(0) var<uniform> globals: Globals;
@group(0) @binding(1) var atlas: texture_2d<f32>;
@group(0) @binding(2) var atlas_sampler: sampler;

struct Instance {
    @location(0) rect: vec4<f32>,
    @location(1) uv: vec4<f32>,
    @location(2) color: vec4<f32>,
    @location(3) shape: vec4<f32>,
}

struct Fragment {
    @builtin(position) position: vec4<f32>,
    @location(0) local: vec2<f32>,
    @location(1) half: vec2<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) color: vec4<f32>,
    @location(4) shape: vec4<f32>,
}

@vertex
fn vertex(@builtin(vertex_index) index: u32, instance: Instance) -> Fragment {
    let corner = vec2<f32>(f32(index & 1u), f32(index >> 1u));
    let point = instance.rect.xy + corner * instance.rect.zw;
    var out: Fragment;
    out.position = vec4<f32>(point.x / globals.size.x * 2.0 - 1.0, 1.0 - point.y / globals.size.y * 2.0, 0.0, 1.0);
    out.local = (corner - 0.5) * instance.rect.zw;
    out.half = instance.rect.zw * 0.5;
    out.uv = mix(instance.uv.xy, instance.uv.zw, corner);
    out.color = instance.color;
    out.shape = instance.shape;
    return out;
}

@fragment
fn fragment(in: Fragment) -> @location(0) vec4<f32> {
    let mask = textureSample(atlas, atlas_sampler, in.uv).r;
    let radius = min(in.shape.x, min(in.half.x, in.half.y));
    let corner = abs(in.local) - in.half + radius;
    let distance = length(max(corner, vec2<f32>(0.0))) + min(max(corner.x, corner.y), 0.0) - radius;
    let rounded = clamp(0.5 - distance, 0.0, 1.0);
    let alpha = in.color.a * mix(rounded, mask, in.shape.y);
    return vec4<f32>(in.color.rgb * alpha, alpha);
}
