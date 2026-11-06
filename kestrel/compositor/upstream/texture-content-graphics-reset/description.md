# clutter/texture-content: Skip textures of a defunct context

A follow-up for GNOME/mutter!5247, written against its branch at 143ba8ec6. It fits as an extra commit there, so this is a review comment rather than a merge request of its own. The full commit is in the patch next to this file, and `reproduce.diff` is the test change behind the results below. It fakes the reset status in Cogl, so it isn't meant to be merged.

## Comment

One more place can still paint a texture from the context that was replaced: ClutterTextureContent keeps its texture until its owner sets a new one, and nothing replaces it on reset. clutter_stage_paint_to_content() and meta_window_actor_paint_to_content() hand these out. The default plugin keeps one on the clone in its size change effect, and GNOME Shell keeps them in the screenshot UI.

I tried this on top of 143ba8ec6 on llvmpipe, by making cogl_driver_get_graphics_reset_status() report one guilty reset, so the rest of the recovery ran as usual. Painting a red ClutterTextureContent right after recovery gives GL error 1282 from cogl-pipeline-gl.c. Once the new context has created enough textures for the old GL name to be reused, the actor shows one of those instead, in my case a green texture that had nothing to do with it.

Skipping the paint while the texture's context is defunct fixes both. The actor paints nothing until its owner provides a new texture, and clutter/conform and stage-views still pass:

```diff
--- a/clutter/clutter/clutter-texture-content.c
+++ b/clutter/clutter/clutter-texture-content.c
@@ -76,6 +76,9 @@ clutter_texture_content_paint_content (ClutterContent      *content,
   ClutterTextureContent *texture_content = CLUTTER_TEXTURE_CONTENT (content);
   ClutterPaintNode *node;
 
+  if (cogl_context_is_defunct (cogl_texture_get_context (texture_content->texture)))
+    return;
+
   node = clutter_actor_create_texture_paint_node (actor,
                                                   texture_content->texture);
   clutter_paint_node_set_static_name (node, "Texture Content");
```
