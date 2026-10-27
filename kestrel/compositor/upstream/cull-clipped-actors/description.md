# cullable: Only cull with the part of an actor inside its clip

Based on main at b48811767.

## Description

When a window actor has a clip, it only paints the part inside of it, but culling still takes its whole opaque region as covering what's below. Windows and the background below the part the clip hides aren't painted, and that area shows stale content.

Shells and extensions clip window actors, for example to keep a window of a scrolling layout on one monitor while it reaches past it. To reproduce: in Looking Glass, call `set_clip()` on the actor of a window that covers another window, so that part of it is clipped away. The uncovered part of the window below isn't painted.

Instead of leaving clipped actors out of culling like those with effects, this puts back what an actor culled outside of its clip, so actors below it are still culled within the clip. The second commit adds a test with two stacked opaque windows, which checks that the bottom one is exactly half obscured once the top one is clipped to its left half. It fails without the fix.
