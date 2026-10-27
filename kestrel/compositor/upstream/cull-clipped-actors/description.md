# cullable: Don't cull with actors that have a clip

Based on main at b48811767.

## Description

When a window actor has a clip, culling still takes its opaque region as covering the area the clip hides. Whatever lies below that area, other windows and the background, isn't painted, and the area shows stale content.

Shells and extensions can clip window actors, for example to keep a window of a scrolling layout on one monitor while it reaches past it. Actors with active effects are already left out of culling for the same reason; this does the same for actors with a clip.
