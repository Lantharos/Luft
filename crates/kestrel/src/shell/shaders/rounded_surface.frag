#version 100

//_DEFINES_

#if defined(EXTERNAL)
#extension GL_OES_EGL_image_external : require
#endif

precision highp float;
#if defined(EXTERNAL)
uniform samplerExternalOES tex;
#else
uniform sampler2D tex;
#endif

uniform float alpha;
varying vec2 v_coords;

#if defined(DEBUG_FLAGS)
uniform float tint;
#endif

uniform float output_scale;
uniform vec2 geometry_size;
uniform vec4 corner_radius;
uniform mat3 input_to_geometry;

float rounding_alpha(vec2 coords, vec2 size, vec4 radius) {
    vec2 center;
    float selected_radius;

    if (coords.x < radius.x && coords.y < radius.x) {
        selected_radius = radius.x;
        center = vec2(selected_radius, selected_radius);
    } else if (size.x - radius.y < coords.x && coords.y < radius.y) {
        selected_radius = radius.y;
        center = vec2(size.x - selected_radius, selected_radius);
    } else if (size.x - radius.z < coords.x && size.y - radius.z < coords.y) {
        selected_radius = radius.z;
        center = vec2(size.x - selected_radius, size.y - selected_radius);
    } else if (coords.x < radius.w && size.y - radius.w < coords.y) {
        selected_radius = radius.w;
        center = vec2(selected_radius, size.y - selected_radius);
    } else {
        return 1.0;
    }

    float distance_from_corner = distance(coords, center);
    float edge = clamp((distance_from_corner - selected_radius) * output_scale + 0.5, 0.0, 1.0);
    return 1.0 - edge * edge * (3.0 - 2.0 * edge);
}

void main() {
    vec3 geometry_coords = input_to_geometry * vec3(v_coords, 1.0);
    vec4 color = texture2D(tex, v_coords);
#if defined(NO_ALPHA)
    color = vec4(color.rgb, 1.0);
#endif

    if (geometry_coords.x < 0.0 || 1.0 < geometry_coords.x || geometry_coords.y < 0.0 || 1.0 < geometry_coords.y) {
        color = vec4(0.0);
    } else {
        color *= rounding_alpha(geometry_coords.xy * geometry_size, geometry_size, corner_radius);
    }

    color *= alpha;
#if defined(DEBUG_FLAGS)
    if (tint == 1.0)
        color = vec4(0.0, 0.2, 0.0, 0.2) + color * 0.8;
#endif
    gl_FragColor = color;
}
