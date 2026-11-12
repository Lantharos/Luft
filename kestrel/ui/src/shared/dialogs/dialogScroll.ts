import St from 'gi://St';

/** A vertically scrolling area for a dialog, whose scrollbar takes room beside the content only while the content scrolls. */
export function dialogScroll(child: St.BoxLayout, styleClass: string): St.ScrollView {
  return new St.ScrollView({
    child, style_class: `${styleClass} kestrel-app-scroll kestrel-dialog-scroll`,
    hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: false,
  });
}
