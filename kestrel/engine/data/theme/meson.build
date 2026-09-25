theme_sources = files([
  'gnome-shell-high-contrast.scss',
  'gnome-shell-dark.scss',
  'gnome-shell-sass/_colors.scss',
  'gnome-shell-sass/_common.scss',
  'gnome-shell-sass/_drawing.scss',
  'gnome-shell-sass/_high-contrast-colors.scss',
  'gnome-shell-sass/_widgets.scss',
  'gnome-shell-sass/widgets/_a11y.scss',
  'gnome-shell-sass/widgets/_base.scss',
  'gnome-shell-sass/widgets/_buttons.scss',
  'gnome-shell-sass/widgets/_check-box.scss',
  'gnome-shell-sass/widgets/_dialogs.scss',
  'gnome-shell-sass/widgets/_entries.scss',
  'gnome-shell-sass/widgets/_ibus-popup.scss',
  'gnome-shell-sass/widgets/_keyboard.scss',
  'gnome-shell-sass/widgets/_login-lock.scss',
  'gnome-shell-sass/widgets/_looking-glass.scss',
  'gnome-shell-sass/widgets/_message-list.scss',
  'gnome-shell-sass/widgets/_misc.scss',
  'gnome-shell-sass/widgets/_notifications.scss',
  'gnome-shell-sass/widgets/_osd.scss',
  'gnome-shell-sass/widgets/_panel.scss',
  'gnome-shell-sass/widgets/_popovers.scss',
  'gnome-shell-sass/widgets/_qr-code.scss',
  'gnome-shell-sass/widgets/_quick-settings.scss',
  'gnome-shell-sass/widgets/_screenshot.scss',
  'gnome-shell-sass/widgets/_scrollbars.scss',
  'gnome-shell-sass/widgets/_slider.scss',
  'gnome-shell-sass/widgets/_switcher-popup.scss',
  'gnome-shell-sass/widgets/_switches.scss',
  'gnome-shell-sass/widgets/_workspace-switcher.scss',
])

stylesheets = [
  'gnome-shell-high-contrast.css',
  'gnome-shell-dark.css',
]

sassc = find_program('sassc')
foreach stylesheet: stylesheets
  theme_deps += custom_target(stylesheet,
                              input: fs.replace_suffix(stylesheet, '.scss'),
                              output: stylesheet,
                              command: [
                                sassc, '-a', '@INPUT@', '@OUTPUT@'
                              ],
                              depend_files: theme_sources)
endforeach

