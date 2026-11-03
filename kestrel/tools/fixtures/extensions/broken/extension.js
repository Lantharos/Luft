export default function enable(broken) {
  broken.taskbar.addItem({ icon: 'dialog-error-symbolic', label: 'Broken' });
  throw new Error('The broken extension breaks on purpose');
}
