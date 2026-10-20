import type { Translate } from '../i18n/translate';

export interface Question {
	question: string;
	answer: string;
}

export const faq = (t: Translate): Question[] => [
	{ question: t('home-question-cost'), answer: t('home-question-cost-answer') },
	{ question: t('home-question-hardware'), answer: t('home-question-hardware-answer') },
	{ question: t('home-question-windows'), answer: t('home-question-windows-answer') },
	{ question: t('home-question-try'), answer: t('home-question-try-answer') },
	{ question: t('home-question-apps'), answer: t('home-question-apps-answer') },
	{ question: t('home-question-updates'), answer: t('home-question-updates-answer') },
	{ question: t('home-question-ready'), answer: t('home-question-ready-answer') }
];
