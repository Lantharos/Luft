import { tagHighlighter, tags } from '@lezer/highlight';

export const codeHighlighter = tagHighlighter([
	{ tag: tags.comment, class: 'hl-comment' },
	{ tag: [tags.keyword, tags.self], class: 'hl-keyword' },
	{ tag: [tags.string, tags.character, tags.attributeValue], class: 'hl-string' },
	{ tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: 'hl-regexp' },
	{ tag: [tags.number, tags.bool, tags.null, tags.atom, tags.unit, tags.constant(tags.name), tags.standard(tags.name)], class: 'hl-constant' },
	{ tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.macroName], class: 'hl-function' },
	{ tag: [tags.typeName, tags.className, tags.namespace], class: 'hl-type' },
	{ tag: tags.definition(tags.variableName), class: 'hl-definition' },
	{ tag: [tags.propertyName, tags.labelName], class: 'hl-property' },
	{ tag: [tags.tagName, tags.angleBracket], class: 'hl-tag' },
	{ tag: tags.attributeName, class: 'hl-attribute' },
	{ tag: tags.operator, class: 'hl-operator' },
	{ tag: tags.punctuation, class: 'hl-punctuation' },
	{ tag: [tags.meta, tags.annotation, tags.processingInstruction], class: 'hl-meta' },
	{ tag: tags.heading, class: 'hl-heading' },
	{ tag: tags.emphasis, class: 'hl-emphasis' },
	{ tag: tags.strong, class: 'hl-strong' },
	{ tag: tags.strikethrough, class: 'hl-strikethrough' },
	{ tag: [tags.link, tags.url], class: 'hl-link' },
	{ tag: tags.monospace, class: 'hl-monospace' },
	{ tag: tags.quote, class: 'hl-quote' },
	{ tag: tags.inserted, class: 'hl-inserted' },
	{ tag: tags.deleted, class: 'hl-deleted' },
	{ tag: tags.changed, class: 'hl-changed' },
	{ tag: tags.invalid, class: 'hl-invalid' }
]);
