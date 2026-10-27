# clutter/texture-content: Skip textures of a defunct context

A follow-up for GNOME/mutter!5247, based on its branch at 4ffeb2fd2. It could go in as an extra commit there, so this is written as a review comment rather than a merge request of its own.

## Comment

One more place can paint a texture from the context that was replaced: `ClutterTextureContent` keeps its texture until its owner sets a new one, and painting it in between uses a GL name that in the new context can belong to an unrelated texture.

Skipping the paint while the texture's context is defunct fixes it:

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

The full commit is in the patch next to this file.
