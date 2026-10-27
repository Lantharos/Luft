# Upstream merge request

A draft for [GNOME/libsecret](https://gitlab.gnome.org/GNOME/libsecret), not submitted yet.

## Title

secret-backend: Let SECRET_BACKEND choose the backend in a sandbox

## Description

Inside Flatpak and Snap, libsecret uses the file backend whenever the Secret portal answers, and only reads `SECRET_BACKEND` outside a sandbox. The simple password API (`secret_password_store()`, `secret_password_lookup()`) goes through that backend, but the `SecretService` API (`secret_service_search()` and friends) always talks to the Secret Service. An app that can reach the Secret Service, through `--talk-name=org.freedesktop.secrets`, ends up with two places that don't see each other.

Chromium and Electron hit exactly this: they look up their encryption key with `secret_service_search_sync()` and save a new one with `secret_password_store_sync()` when none is found. The key lands in the file, the next start doesn't find it in the Secret Service, and a new key is made on every launch, so everything encrypted with the previous one can't be read anymore. That is how VS Code and VSCodium on Flathub lose the secrets their extensions saved.

This change reads `SECRET_BACKEND` first and only falls back to detecting the sandbox when it isn't set. Nothing changes for apps that don't set it. An app, or its Flatpak manifest (`--env=SECRET_BACKEND=service`), can then keep everything in the Secret Service, so both APIs agree.

Related: https://github.com/flathub/com.vscodium.codium/issues/239

## The Flatpak bug

[flathub/com.vscodium.codium#239](https://github.com/flathub/com.vscodium.codium/issues/239): VSCodium on Flathub can't read the secrets it saved through VS Code's SecretStorage API, such as an extension's sign-in token, and logs `Error while decrypting the ciphertext provided to safeStorage.decryptString`. VS Code from Flathub fails the same way. The same happens to other Chromium and Electron apps on Flathub that talk to the Secret Service, on any desktop with a Secret portal backend. Today a manifest can't fix it, since the sandbox check wins over `SECRET_BACKEND`. With this change, adding `--env=SECRET_BACKEND=service` to the manifest is enough.

## Patch

```diff
From: Kristof Imeri <kristof@lanth.me>
Subject: [PATCH] secret-backend: Let SECRET_BACKEND choose the backend in a
 sandbox

Inside Flatpak and Snap, the file backend was picked whenever the Secret
portal answered, and SECRET_BACKEND was only read outside a sandbox. An
app that can reach the Secret Service had no way to keep its secrets
there, while SecretService API calls still go to the Secret Service, so
items stored with secret_password_store() weren't found by
secret_service_search().

Read SECRET_BACKEND first, and only fall back to detecting the sandbox
when it isn't set.
---
 libsecret/secret-backend.c | 17 +++++++----------
 1 file changed, 7 insertions(+), 10 deletions(-)

diff --git a/libsecret/secret-backend.c b/libsecret/secret-backend.c
index 75c42da..bccef65 100644
--- a/libsecret/secret-backend.c
+++ b/libsecret/secret-backend.c
@@ -152,19 +152,16 @@ backend_get_impl_type (void)
 	g_type_ensure (secret_file_backend_get_type ());
 #endif
 
+	envvar = g_getenv ("SECRET_BACKEND");
+	if (envvar != NULL && *envvar != '\0')
+		extension_name = envvar;
 #ifdef WITH_CRYPTO
-	if ((g_file_test ("/.flatpak-info", G_FILE_TEST_EXISTS) || g_getenv ("SNAP_NAME") != NULL) &&
-	    _secret_file_backend_check_portal_version ())
+	else if ((g_file_test ("/.flatpak-info", G_FILE_TEST_EXISTS) || g_getenv ("SNAP_NAME") != NULL) &&
+	         _secret_file_backend_check_portal_version ())
 		extension_name = "file";
-	else
 #endif
-	{
-		envvar = g_getenv ("SECRET_BACKEND");
-		if (envvar == NULL || *envvar == '\0')
-			extension_name = "service";
-		else
-			extension_name = envvar;
-	}
+	else
+		extension_name = "service";
 
 	ep = g_io_extension_point_lookup (SECRET_BACKEND_EXTENSION_POINT_NAME);
 	e = g_io_extension_point_get_extension_by_name (ep, extension_name);
```
