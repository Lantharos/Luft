import type { Component } from 'svelte';
import { t } from '@luft/i18n';
import Briefcase from '@lucide/svelte/icons/briefcase';
import Clapperboard from '@lucide/svelte/icons/clapperboard';
import Code from '@lucide/svelte/icons/code';
import FlaskConical from '@lucide/svelte/icons/flask-conical';
import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
import Globe from '@lucide/svelte/icons/globe';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import PenTool from '@lucide/svelte/icons/pen-tool';
import Settings2 from '@lucide/svelte/icons/settings-2';
import Wrench from '@lucide/svelte/icons/wrench';

export type CategoryId = 'office' | 'graphics' | 'audiovideo' | 'game' | 'development' | 'education' | 'science' | 'network' | 'utility' | 'system';

export interface Category {
	id: CategoryId;
	icon: Component;
}

export const CATEGORIES: Category[] = [
	{ id: 'office', icon: Briefcase },
	{ id: 'graphics', icon: PenTool },
	{ id: 'audiovideo', icon: Clapperboard },
	{ id: 'game', icon: Gamepad2 },
	{ id: 'development', icon: Code },
	{ id: 'education', icon: GraduationCap },
	{ id: 'science', icon: FlaskConical },
	{ id: 'network', icon: Globe },
	{ id: 'utility', icon: Wrench },
	{ id: 'system', icon: Settings2 }
];

const TITLES: Record<CategoryId, string> = {
	office: 'category-office',
	graphics: 'category-graphics',
	audiovideo: 'category-audiovideo',
	game: 'category-game',
	development: 'category-development',
	education: 'category-education',
	science: 'category-science',
	network: 'category-network',
	utility: 'category-utility',
	system: 'category-system'
};

export const categoryTitle = (id: CategoryId) => t(TITLES[id]);
