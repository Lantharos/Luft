theme_sources = files([
  'base-high-contrast.scss',
  'base-dark.scss',
  'sass/_colors.scss',
  'sass/_common.scss',
  'sass/_drawing.scss',
  'sass/_high-contrast-colors.scss',
  'sass/_widgets.scss',
  'sass/widgets/_a11y.scss',
  'sass/widgets/_buttons.scss',
  'sass/widgets/_check-box.scss',
  'sass/widgets/_dialogs.scss',
  'sass/widgets/_entries.scss',
  'sass/widgets/_ibus-popup.scss',
  'sass/widgets/_keyboard.scss',
  'sass/widgets/_login-lock.scss',
  'sass/widgets/_message-list.scss',
  'sass/widgets/_misc.scss',
  'sass/widgets/_notifications.scss',
  'sass/widgets/_osd.scss',
  'sass/widgets/_popovers.scss',
  'sass/widgets/_quick-settings.scss',
  'sass/widgets/_screenshot.scss',
  'sass/widgets/_scrollbars.scss',
  'sass/widgets/_slider.scss',
  'sass/widgets/_switcher-popup.scss',
  'sass/widgets/_switches.scss',
  'sass/widgets/_workspace-switcher.scss',
])

stylesheets = [
  'base-high-contrast.css',
  'base-dark.css',
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

