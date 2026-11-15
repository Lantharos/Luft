import { EditorState } from '@codemirror/state';
import { t } from '@luft/i18n';

export const phrases = () =>
	EditorState.phrases.of({
		'Fold line': t('draft-editor-fold'),
		'Unfold line': t('draft-editor-unfold'),
		unfold: t('draft-editor-unfold-placeholder'),
		'folded code': t('draft-editor-folded'),
		'Control character': t('draft-editor-control-character')
	});
