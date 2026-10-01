import type { Component } from 'svelte';
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
	title: string;
	icon: Component;
	desktop: string[];
}

export const CATEGORIES: Category[] = [
	{ id: 'office', title: 'Productivity', icon: Briefcase, desktop: ['Office'] },
	{ id: 'graphics', title: 'Graphics & Photos', icon: PenTool, desktop: ['Graphics'] },
	{ id: 'audiovideo', title: 'Audio & Video', icon: Clapperboard, desktop: ['AudioVideo', 'Audio', 'Video'] },
	{ id: 'game', title: 'Games', icon: Gamepad2, desktop: ['Game'] },
	{ id: 'development', title: 'Developer Tools', icon: Code, desktop: ['Development'] },
	{ id: 'education', title: 'Education', icon: GraduationCap, desktop: ['Education'] },
	{ id: 'science', title: 'Science', icon: FlaskConical, desktop: ['Science'] },
	{ id: 'network', title: 'Internet', icon: Globe, desktop: ['Network'] },
	{ id: 'utility', title: 'Utilities', icon: Wrench, desktop: ['Utility'] },
	{ id: 'system', title: 'System', icon: Settings2, desktop: ['System', 'Settings'] }
];

export const category = (id: CategoryId) => CATEGORIES.find((entry) => entry.id === id)!;
