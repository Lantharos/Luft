# Upstream pull request

A draft for [flatpak/xdg-desktop-portal](https://github.com/flatpak/xdg-desktop-portal), not submitted yet. The patch is against main at 4907561, where the portal moved to `desktop-portal/` and `shared/`, so it differs from `secret-service-apps.patch`, which is against 1.22.1.

## Title

secret: Leave apps that can reach the Secret Service to it

## Description

Inside a Flatpak, libsecret keeps passwords in a file locked with the Secret portal whenever the portal answers, but its `SecretService` API (`secret_service_search()` and friends) always talks to the Secret Service. An app that can reach the Secret Service, through `--talk-name=org.freedesktop.secrets` or `--socket=session-bus`, ends up with two stores that don't see each other.

Chromium and Electron hit exactly this: they look up their encryption key with `secret_service_search_sync()` and save a new one with `secret_password_store_sync()` when none is found. The key lands in the portal's file, the next start doesn't find it in the Secret Service, and a new key is made on every launch, so everything encrypted with the previous one can't be read anymore. That is how VS Code and VSCodium on Flathub lose the secrets their extensions saved ([flathub/com.vscodium.codium#239](https://github.com/flathub/com.vscodium.codium/issues/239)).

This makes reading the Secret portal's `version` property fail for apps whose Flatpak metadata lets them talk to `org.freedesktop.secrets`, or gives them the whole session bus. libsecret then takes the portal as missing and keeps everything in the Secret Service, so both of its APIs agree. Apps without that permission keep using the portal as before.

The caller is looked up synchronously in the property getter, which gets no invocation and so none of the app info that method calls get from the registry. If there's a better hook for this, I'm happy to move it.

## Patch

```diff
From 0000000000000000000000000000000000000000 Mon Sep 17 00:00:00 2001
From: Kristof Imeri <kristof@lanth.me>
Date: Tue, 27 Oct 2026 17:45:49 +0100
Subject: [PATCH] secret: Leave apps that can reach the Secret Service to it

libsecret keeps passwords in a file locked with the Secret portal
whenever the portal answers inside a Flatpak, while its SecretService
API still talks to the Secret Service. An app that can reach the
Secret Service, through --talk-name=org.freedesktop.secrets or the
whole session bus, ends up with two stores that don't see each other.
Chromium and Electron look up their encryption key with
secret_service_search_sync() and save a new one with
secret_password_store_sync() when none is found, so they make a new
key on every start and can't read what they encrypted before.

Don't answer the version property for such apps, so libsecret keeps
everything in the Secret Service. Apps without that permission keep
using the portal.
---
 desktop-portal/secret.c               | 92 +++++++++++++++++++++++++++
 shared/xdp-app-info-flatpak-private.h |  3 +
 shared/xdp-app-info-flatpak.c         | 26 ++++++++
 3 files changed, 121 insertions(+)

diff --git a/desktop-portal/secret.c b/desktop-portal/secret.c
index b299bf0..48af29d 100644
--- a/desktop-portal/secret.c
+++ b/desktop-portal/secret.c
@@ -17,6 +17,7 @@
 #include <gio/gio.h>
 #include <gio/gunixfdlist.h>
 
+#include "xdp-app-info-flatpak-private.h"
 #include "xdp-context.h"
 #include "xdp-dbus.h"
 #include "xdp-impl-dbus.h"
@@ -25,6 +26,8 @@
 #include "xdp-types.h"
 #include "xdp-utils.h"
 
+#define SECRET_SERVICE_BUS_NAME "org.freedesktop.secrets"
+
 typedef struct _Secret Secret;
 typedef struct _SecretClass SecretClass;
 
@@ -184,12 +187,101 @@ secret_init (Secret *secret)
 {
 }
 
+static GDBusInterfaceVTable secret_vtable;
+static GDBusInterfaceGetPropertyFunc skeleton_get_property;
+
+static XdpAppInfo *
+flatpak_app_info_for_sender (GDBusConnection *connection,
+                             const char      *sender)
+{
+  g_autoptr(GVariant) reply = NULL;
+  g_autoptr(GVariant) credentials = NULL;
+  g_autoptr(GUnixFDList) fd_list = NULL;
+  g_autofd int pidfd = -1;
+  uint32_t pid;
+  int32_t fd_index;
+
+  reply = g_dbus_connection_call_with_unix_fd_list_sync (connection,
+                                                         DBUS_DBUS_NAME,
+                                                         DBUS_DBUS_PATH,
+                                                         DBUS_DBUS_IFACE,
+                                                         "GetConnectionCredentials",
+                                                         g_variant_new ("(s)", sender),
+                                                         G_VARIANT_TYPE ("(a{sv})"),
+                                                         G_DBUS_CALL_FLAGS_NONE,
+                                                         -1,
+                                                         NULL,
+                                                         &fd_list,
+                                                         NULL,
+                                                         NULL);
+  if (!reply)
+    return NULL;
+
+  g_variant_get (reply, "(@a{sv})", &credentials);
+
+  if (!g_variant_lookup (credentials, "ProcessID", "u", &pid) ||
+      !g_variant_lookup (credentials, "ProcessFD", "h", &fd_index) ||
+      !fd_list ||
+      !xdp_is_fd_list_index_valid (fd_list, fd_index))
+    return NULL;
+
+  pidfd = g_unix_fd_list_get (fd_list, fd_index, NULL);
+  if (pidfd < 0)
+    return NULL;
+
+  return xdp_app_info_flatpak_new (sender, pid, &pidfd, NULL);
+}
+
+static gboolean
+can_reach_secret_service (GDBusConnection *connection,
+                          const char      *sender)
+{
+  g_autoptr(XdpAppInfo) app_info = flatpak_app_info_for_sender (connection, sender);
+
+  return app_info != NULL &&
+         xdp_app_info_flatpak_can_talk_to (XDP_APP_INFO_FLATPAK (app_info),
+                                           SECRET_SERVICE_BUS_NAME);
+}
+
+static GVariant *
+secret_get_property (GDBusConnection  *connection,
+                     const char       *sender,
+                     const char       *object_path,
+                     const char       *interface_name,
+                     const char       *property_name,
+                     GError          **error,
+                     gpointer          user_data)
+{
+  if (can_reach_secret_service (connection, sender))
+    {
+      g_set_error (error, G_DBUS_ERROR, G_DBUS_ERROR_NOT_SUPPORTED,
+                   "Apps that can reach the Secret Service use it directly");
+      return NULL;
+    }
+
+  return skeleton_get_property (connection, sender, object_path,
+                                interface_name, property_name,
+                                error, user_data);
+}
+
+static GDBusInterfaceVTable *
+secret_get_vtable (GDBusInterfaceSkeleton *skeleton)
+{
+  return &secret_vtable;
+}
+
 static void
 secret_class_init (SecretClass *klass)
 {
   GObjectClass *object_class = G_OBJECT_CLASS (klass);
+  GDBusInterfaceSkeletonClass *skeleton_class = G_DBUS_INTERFACE_SKELETON_CLASS (klass);
 
   object_class->dispose = secret_dispose;
+
+  secret_vtable = *skeleton_class->get_vtable (NULL);
+  skeleton_get_property = secret_vtable.get_property;
+  secret_vtable.get_property = secret_get_property;
+  skeleton_class->get_vtable = secret_get_vtable;
 }
 
 static Secret *
diff --git a/shared/xdp-app-info-flatpak-private.h b/shared/xdp-app-info-flatpak-private.h
index e24af2e..8ce7c7c 100644
--- a/shared/xdp-app-info-flatpak-private.h
+++ b/shared/xdp-app-info-flatpak-private.h
@@ -21,3 +21,6 @@ XdpAppInfo * xdp_app_info_flatpak_new (const char  *sender,
                                        int          pid,
                                        int         *pidfd,
                                        GError     **error);
+
+gboolean xdp_app_info_flatpak_can_talk_to (XdpAppInfoFlatpak *app_info,
+                                           const char        *bus_name);
diff --git a/shared/xdp-app-info-flatpak.c b/shared/xdp-app-info-flatpak.c
index a9b2ec2..a81d2d5 100644
--- a/shared/xdp-app-info-flatpak.c
+++ b/shared/xdp-app-info-flatpak.c
@@ -30,6 +30,9 @@
 #define FLATPAK_METADATA_KEY_SHARED "shared"
 #define FLATPAK_METADATA_CONTEXT_SHARED_NETWORK "network"
 #define FLATPAK_METADATA_GROUP_RUNTIME "Runtime"
+#define FLATPAK_METADATA_KEY_SOCKETS "sockets"
+#define FLATPAK_METADATA_CONTEXT_SOCKET_SESSION_BUS "session-bus"
+#define FLATPAK_METADATA_GROUP_SESSION_BUS_POLICY "Session Bus Policy"
 
 struct _XdpAppInfoFlatpak
 {
@@ -873,3 +876,26 @@ xdp_app_info_flatpak_new (const char  *sender,
 
   return XDP_APP_INFO (g_steal_pointer (&app_info_flatpak));
 }
+
+gboolean
+xdp_app_info_flatpak_can_talk_to (XdpAppInfoFlatpak *app_info,
+                                  const char        *bus_name)
+{
+  g_auto(GStrv) sockets = NULL;
+  g_autofree char *policy = NULL;
+
+  sockets = g_key_file_get_string_list (app_info->flatpak_info,
+                                        FLATPAK_METADATA_GROUP_CONTEXT,
+                                        FLATPAK_METADATA_KEY_SOCKETS,
+                                        NULL, NULL);
+  if (sockets &&
+      g_strv_contains ((const char * const *) sockets,
+                       FLATPAK_METADATA_CONTEXT_SOCKET_SESSION_BUS))
+    return TRUE;
+
+  policy = g_key_file_get_string (app_info->flatpak_info,
+                                  FLATPAK_METADATA_GROUP_SESSION_BUS_POLICY,
+                                  bus_name,
+                                  NULL);
+  return g_strcmp0 (policy, "talk") == 0 || g_strcmp0 (policy, "own") == 0;
+}
```
